import { isGitHubConfigured, getGitHubConfig } from "./config";
import { fetchGitHubGraphQL } from "./graphql";
import { fetchGitHubPublicEvents } from "./rest";
import type { GitHubRestEvent } from "./types";
import type {
  NormalizedActivityEvent,
  ProviderSnapshotResult,
  TechProvider,
  GitHubRepoSummary,
} from "@/types/techPerformance";

function computeStreaks(days: Array<{ date: string; count: number }>): {
  current: number;
  longest: number;
} {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));

  let longest = 0;
  let running = 0;
  for (const day of sorted) {
    if (day.count > 0) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  // Current streak: walk backwards from the most recent day. A gap on
  // "today" alone shouldn't zero the streak (the day isn't over yet), so
  // skip a single trailing zero-count day before counting backwards.
  let current = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].count > 0) {
      current += 1;
    } else if (i === sorted.length - 1) {
      continue;
    } else {
      break;
    }
  }

  return { current, longest };
}

function normalizeRepos(
  nodes: Array<{
    name: string;
    nameWithOwner: string;
    description: string | null;
    url: string;
    homepageUrl: string | null;
    stargazerCount: number;
    forkCount: number;
    isPrivate: boolean;
    isFork: boolean;
    pushedAt: string;
    primaryLanguage: { name: string } | null;
    openIssues: { totalCount: number };
  }>
): GitHubRepoSummary[] {
  return nodes.map((repo) => ({
    name: repo.name,
    fullName: repo.nameWithOwner,
    description: repo.description,
    htmlUrl: repo.url,
    homepageUrl: repo.homepageUrl,
    primaryLanguage: repo.primaryLanguage?.name ?? null,
    stars: repo.stargazerCount,
    forks: repo.forkCount,
    openIssues: repo.openIssues.totalCount,
    pushedAt: repo.pushedAt,
    isFork: repo.isFork,
    isPrivate: repo.isPrivate,
  }));
}

function aggregateLanguages(
  nodes: Array<{ languages: { edges: Array<{ size: number; node: { name: string } }> } }>
): Array<{ name: string; bytes: number; pct: number }> {
  const totals = new Map<string, number>();
  for (const repo of nodes) {
    for (const edge of repo.languages.edges) {
      totals.set(edge.node.name, (totals.get(edge.node.name) ?? 0) + edge.size);
    }
  }

  const grandTotal = [...totals.values()].reduce((sum, v) => sum + v, 0) || 1;

  return [...totals.entries()]
    .map(([name, bytes]) => ({ name, bytes, pct: (bytes / grandTotal) * 100 }))
    .sort((a, b) => b.bytes - a.bytes);
}

function normalizeEvents(
  events: GitHubRestEvent[]
): NormalizedActivityEvent[] {
  const normalized: NormalizedActivityEvent[] = [];

  for (const event of events) {
    const repo = event.repo.name;

    switch (event.type) {
      case "PushEvent": {
        const commits = (event.payload.commits ?? []) as Array<{
          sha: string;
          message: string;
        }>;
        if (commits.length > 0) {
          for (const commit of commits.slice(0, 5)) {
            normalized.push({
              provider: "github",
              type: "commit",
              timestamp: event.created_at,
              title: commit.message.split("\n")[0].slice(0, 200),
              url: `https://github.com/${repo}/commit/${commit.sha}`,
              externalId: commit.sha,
              metadata: { repo },
              visibility: "public",
            });
          }
        } else if (event.payload.head) {
          // GitHub's public events feed frequently omits the `commits`
          // array (payload size trimming) and only gives the resulting
          // HEAD sha — still worth one timeline entry per push rather than
          // silently dropping it.
          const head = event.payload.head as string;
          normalized.push({
            provider: "github",
            type: "commit",
            timestamp: event.created_at,
            title: `Pushed to ${repo}`,
            url: `https://github.com/${repo}/commit/${head}`,
            externalId: head,
            metadata: { repo },
            visibility: "public",
          });
        }
        break;
      }
      case "PullRequestEvent": {
        const pr = event.payload.pull_request;
        const action = event.payload.action;
        if (!pr) break;
        if (action === "opened") {
          normalized.push({
            provider: "github",
            type: "pull_request",
            timestamp: event.created_at,
            title: `Opened #${pr.number} ${pr.title}`,
            url: pr.html_url,
            externalId: `pr-opened-${pr.id}`,
            metadata: { repo, action: "opened" },
            visibility: "public",
          });
        } else if (action === "closed" && pr.merged) {
          normalized.push({
            provider: "github",
            type: "pull_request",
            timestamp: pr.merged_at ?? event.created_at,
            title: `Merged #${pr.number} ${pr.title}`,
            url: pr.html_url,
            externalId: `pr-merged-${pr.id}`,
            metadata: { repo, action: "merged" },
            visibility: "public",
          });
        }
        break;
      }
      case "IssuesEvent": {
        const issue = event.payload.issue;
        const action = event.payload.action;
        if (!issue || !["opened", "closed"].includes(action)) break;
        normalized.push({
          provider: "github",
          type: "issue",
          timestamp: event.created_at,
          title: `${action === "opened" ? "Opened" : "Closed"} issue #${issue.number} ${issue.title}`,
          url: issue.html_url,
          externalId: `issue-${action}-${issue.id}`,
          metadata: { repo, action },
          visibility: "public",
        });
        break;
      }
      case "ReleaseEvent": {
        const release = event.payload.release;
        if (!release || event.payload.action !== "published") break;
        normalized.push({
          provider: "github",
          type: "release",
          timestamp: event.created_at,
          title: `Released ${release.tag_name}${repo ? ` (${repo})` : ""}`,
          url: release.html_url,
          externalId: `release-${release.id}`,
          metadata: { repo },
          visibility: "public",
        });
        break;
      }
      default:
        break;
    }
  }

  return normalized;
}

async function fetchSnapshot(): Promise<ProviderSnapshotResult> {
  try {
    const { token, username } = getGitHubConfig();

    const [graphqlResult, events] = await Promise.all([
      fetchGitHubGraphQL(token, username),
      fetchGitHubPublicEvents(token, username).catch(() => [] as GitHubRestEvent[]),
    ]);

    const user = graphqlResult.data?.user;
    if (!user) {
      return {
        success: false,
        snapshots: [],
        error: `GitHub user '${username}' not found or token lacks access`,
      };
    }

    const calendar = user.contributionsCollection.contributionCalendar.weeks.flatMap(
      (week) =>
        week.contributionDays.map((day) => ({
          date: day.date,
          count: day.contributionCount,
        }))
    );
    const { current, longest } = computeStreaks(calendar);

    const ossByRepo = new Map<string, { url: string; count: number }>();
    for (const node of graphqlResult.data!.ossContribRepos.nodes) {
      const repo = node.repository;
      if (!repo) continue;
      const existing = ossByRepo.get(repo.nameWithOwner);
      if (existing) {
        existing.count += 1;
      } else {
        ossByRepo.set(repo.nameWithOwner, { url: repo.url, count: 1 });
      }
    }

    return {
      success: true,
      snapshots: [
        {
          type: "github:profile",
          data: {
            login: user.login,
            name: user.name,
            avatarUrl: user.avatarUrl,
            bio: user.bio,
            company: user.company,
            location: user.location,
            followers: user.followers.totalCount,
            following: user.following.totalCount,
            publicRepos: user.repositories.totalCount,
            createdAt: user.createdAt,
            htmlUrl: user.url,
          },
        },
        {
          type: "github:contributions",
          data: {
            totalContributions:
              user.contributionsCollection.contributionCalendar.totalContributions,
            currentStreak: current,
            longestStreak: longest,
            calendar,
            totalPRs: graphqlResult.data!.prsOpened.issueCount,
            totalPRsMerged: graphqlResult.data!.prsMerged.issueCount,
            totalIssues: graphqlResult.data!.issuesOpened.issueCount,
            totalReviews:
              user.contributionsCollection.totalPullRequestReviewContributions,
            totalCommitContributions:
              user.contributionsCollection.totalCommitContributions,
          },
        },
        {
          type: "github:repos",
          data: { repos: normalizeRepos(user.repos.nodes) },
        },
        {
          type: "github:languages",
          data: { languages: aggregateLanguages(user.repos.nodes) },
        },
        {
          type: "github:oss-contributions",
          data: {
            repos: [...ossByRepo.entries()].map(([nameWithOwner, v]) => ({
              nameWithOwner,
              url: v.url,
              prCount: v.count,
            })),
          },
        },
      ],
      events: normalizeEvents(events),
    };
  } catch (error) {
    return {
      success: false,
      snapshots: [],
      error: error instanceof Error ? error.message : "Failed to fetch GitHub data",
    };
  }
}

export const githubProvider: TechProvider = {
  id: "github",
  isConfigured: isGitHubConfigured,
  fetchSnapshot,
};

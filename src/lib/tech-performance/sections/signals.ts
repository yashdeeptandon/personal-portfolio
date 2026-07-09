import dbConnect from "@/lib/db/connection";
import TechSnapshot from "@/models/TechSnapshot";
import ActivityEvent from "@/models/ActivityEvent";
import { generateNarrative } from "../narrative";
import type {
  GitHubReposData,
  GitHubContributionsData,
  WakaTimeSummaryData,
} from "@/types/techPerformance";

type CommitCategory = "feat" | "fix" | "docs" | "chore" | "other";

/**
 * Prefix-based, not content-analyzing — deliberately honest about what it
 * can classify. Many GitHub public-events PushEvents arrive without a real
 * commit message (see the provider's synthetic "Pushed to X" fallback for
 * when the API omits `payload.commits`), so those correctly fall into
 * "other" rather than being guessed at.
 */
function classifyCommit(title: string): CommitCategory {
  const t = title.toLowerCase().trim();
  if (/^(fix|bugfix|hotfix)[:( ]/.test(t)) return "fix";
  if (/^(feat|feature)[:( ]/.test(t)) return "feat";
  if (/^docs?[:( ]/.test(t)) return "docs";
  if (/^chore[:( ]/.test(t)) return "chore";
  return "other";
}

export async function getSignalsSection() {
  await dbConnect();

  const since30 = new Date();
  since30.setDate(since30.getDate() - 30);
  const since90 = new Date();
  since90.setDate(since90.getDate() - 90);

  const [
    commits30,
    prsMerged30,
    prsOpened30,
    issuesClosed30,
    releases30,
    recentCommitTitles,
    manualHighlights,
    reposSnapshot,
    contributionsSnapshot,
    wakatimeSnapshot,
  ] = await Promise.all([
    ActivityEvent.countDocuments({ provider: "github", type: "commit", timestamp: { $gte: since30 } }),
    ActivityEvent.countDocuments({
      provider: "github",
      type: "pull_request",
      "metadata.action": "merged",
      timestamp: { $gte: since30 },
    }),
    ActivityEvent.countDocuments({
      provider: "github",
      type: "pull_request",
      "metadata.action": "opened",
      timestamp: { $gte: since30 },
    }),
    ActivityEvent.countDocuments({
      provider: "github",
      type: "issue",
      "metadata.action": "closed",
      timestamp: { $gte: since30 },
    }),
    ActivityEvent.countDocuments({ provider: "github", type: "release", timestamp: { $gte: since30 } }),
    ActivityEvent.find({ provider: "github", type: "commit", timestamp: { $gte: since90 } })
      .select("title")
      .limit(300)
      .lean(),
    ActivityEvent.find({ provider: "manual", timestamp: { $gte: since90 } })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean(),
    TechSnapshot.findOne({ type: "github:repos" }).lean(),
    TechSnapshot.findOne({ type: "github:contributions" }).lean(),
    TechSnapshot.findOne({ type: "wakatime:summary" }).lean(),
  ]);

  const repos = (reposSnapshot?.data as GitHubReposData | undefined)?.repos ?? [];
  const activeRepos = repos.filter((r) => {
    const daysSincePush = (Date.now() - new Date(r.pushedAt).getTime()) / 86_400_000;
    return !r.isFork && daysSincePush <= 90;
  }).length;

  const commitBreakdown: Record<CommitCategory, number> = {
    feat: 0,
    fix: 0,
    docs: 0,
    chore: 0,
    other: 0,
  };
  for (const c of recentCommitTitles) {
    commitBreakdown[classifyCommit(c.title)] += 1;
  }

  const wakatimeData = wakatimeSnapshot?.data as WakaTimeSummaryData | undefined;
  const contributionsData = contributionsSnapshot?.data as
    | GitHubContributionsData
    | undefined;

  const metrics = {
    commitsLast30d: commits30,
    prsMergedLast30d: prsMerged30,
    prsOpenedLast30d: prsOpened30,
    issuesClosedLast30d: issuesClosed30,
    releasesLast30d: releases30,
    activeRepos,
    codingHoursLast30d: wakatimeData ? Math.round(wakatimeData.monthSeconds / 3600) : null,
    contributionsLastYear: contributionsData?.totalContributions ?? null,
  };

  return {
    metrics,
    commitBreakdown,
    highlights: manualHighlights.map((h) => ({
      title: h.title,
      description: h.description ?? null,
      url: h.url ?? null,
      timestamp: new Date(h.timestamp).toISOString(),
      category: (h.metadata as { category?: string } | undefined)?.category ?? null,
    })),
    narrative: generateNarrative(metrics),
  };
}

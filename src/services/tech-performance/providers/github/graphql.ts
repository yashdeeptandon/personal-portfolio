import { GITHUB_CONFIG } from "./config";
import { TechProviderError } from "../../types";
import { fetchWithTimeout } from "@/lib/tech-performance/fetchWithTimeout";
import type { GitHubGraphQLResponse } from "./types";

/**
 * REST doesn't expose the contribution calendar — GraphQL's
 * `contributionsCollection` is the only way to get it, so this single query
 * also pulls profile, repo list + per-repo languages, and PR/issue counts
 * via the Search API, to keep this at one upstream call per sync instead of
 * five.
 */
const QUERY = /* GraphQL */ `
  query (
    $login: String!
    $maxRepos: Int!
    $prsMergedQuery: String!
    $prsOpenedQuery: String!
    $issuesOpenedQuery: String!
    $ossQuery: String!
    $maxOss: Int!
  ) {
    user(login: $login) {
      login
      name
      avatarUrl
      bio
      company
      location
      createdAt
      url
      followers {
        totalCount
      }
      following {
        totalCount
      }
      repositories(ownerAffiliations: OWNER, isFork: false) {
        totalCount
      }
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
        totalCommitContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
      }
      repos: repositories(
        first: $maxRepos
        ownerAffiliations: OWNER
        isFork: false
        privacy: PUBLIC
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        nodes {
          name
          nameWithOwner
          description
          url
          homepageUrl
          stargazerCount
          forkCount
          isPrivate
          isFork
          pushedAt
          primaryLanguage {
            name
          }
          openIssues: issues(states: OPEN) {
            totalCount
          }
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            edges {
              size
              node {
                name
              }
            }
          }
        }
      }
    }
    prsMerged: search(query: $prsMergedQuery, type: ISSUE) {
      issueCount
    }
    prsOpened: search(query: $prsOpenedQuery, type: ISSUE) {
      issueCount
    }
    issuesOpened: search(query: $issuesOpenedQuery, type: ISSUE) {
      issueCount
    }
    ossContribRepos: search(query: $ossQuery, type: ISSUE, first: $maxOss) {
      nodes {
        ... on PullRequest {
          repository {
            nameWithOwner
            url
            isFork
          }
        }
      }
    }
  }
`;

export async function fetchGitHubGraphQL(
  token: string,
  username: string
): Promise<GitHubGraphQLResponse> {
  const variables = {
    login: username,
    maxRepos: GITHUB_CONFIG.MAX_REPOS,
    prsMergedQuery: `author:${username} is:pr is:merged`,
    prsOpenedQuery: `author:${username} is:pr`,
    issuesOpenedQuery: `author:${username} is:issue`,
    ossQuery: `author:${username} is:pr -user:${username}`,
    maxOss: GITHUB_CONFIG.MAX_OSS_SEARCH_RESULTS,
  };

  const response = await fetchWithTimeout(
    GITHUB_CONFIG.GRAPHQL_API_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: QUERY, variables }),
    },
    30_000
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new TechProviderError(
      `GitHub GraphQL error: ${response.status} ${text}`.slice(0, 500),
      response.status
    );
  }

  const json = (await response.json()) as GitHubGraphQLResponse;

  if (json.errors?.length) {
    throw new TechProviderError(
      `GitHub GraphQL error: ${json.errors.map((e) => e.message).join("; ")}`
    );
  }

  return json;
}

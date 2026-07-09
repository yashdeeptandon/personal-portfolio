// Minimal raw-response shapes — only the fields this provider actually reads.

export interface GitHubRestEvent {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: Record<string, any>;
}

export interface GitHubGraphQLRepoNode {
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
  languages: {
    edges: Array<{ size: number; node: { name: string } }>;
  };
}

export interface GitHubGraphQLResponse {
  data?: {
    user: {
      login: string;
      name: string | null;
      avatarUrl: string;
      bio: string | null;
      company: string | null;
      location: string | null;
      createdAt: string;
      url: string;
      followers: { totalCount: number };
      following: { totalCount: number };
      repositories: { totalCount: number };
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: Array<{
            contributionDays: Array<{ date: string; contributionCount: number }>;
          }>;
        };
        totalCommitContributions: number;
        totalIssueContributions: number;
        totalPullRequestContributions: number;
        totalPullRequestReviewContributions: number;
      };
      repos: { nodes: GitHubGraphQLRepoNode[] };
    } | null;
    prsMerged: { issueCount: number };
    prsOpened: { issueCount: number };
    issuesOpened: { issueCount: number };
    ossContribRepos: {
      nodes: Array<{
        repository: { nameWithOwner: string; url: string; isFork: boolean };
      }>;
    };
  };
  errors?: Array<{ message: string }>;
}

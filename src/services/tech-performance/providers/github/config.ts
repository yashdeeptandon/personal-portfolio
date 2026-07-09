export interface GitHubConfig {
  token: string;
  username: string;
}

export function isGitHubConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_USERNAME);
}

export function getGitHubConfig(): GitHubConfig {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME;

  if (!token || !username) {
    throw new Error(
      "GitHub is not configured — set GITHUB_TOKEN and GITHUB_USERNAME"
    );
  }

  return { token, username };
}

export const GITHUB_CONFIG = {
  REST_API_URL: "https://api.github.com",
  GRAPHQL_API_URL: "https://api.github.com/graphql",
  MAX_REPOS: 100,
  MAX_OSS_SEARCH_RESULTS: 50,
  RECENT_ACTIVITY_LIMIT: 100,
} as const;

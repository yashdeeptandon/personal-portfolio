import { GITHUB_CONFIG } from "./config";
import { TechProviderError } from "../../types";
import { fetchWithTimeout } from "@/lib/tech-performance/fetchWithTimeout";
import type { GitHubRestEvent } from "./types";

/**
 * GitHub's public events feed only retains roughly the last 90 days /
 * ~300 events, regardless of pagination — it's a "recent activity" source,
 * not a full history. The contribution calendar (GraphQL) is the source of
 * truth for longer-range consistency; this is only used for the Activity
 * Timeline's individual commit/PR/issue/release entries.
 */
export async function fetchGitHubPublicEvents(
  token: string,
  username: string
): Promise<GitHubRestEvent[]> {
  const url = `${GITHUB_CONFIG.REST_API_URL}/users/${encodeURIComponent(
    username
  )}/events/public?per_page=${GITHUB_CONFIG.RECENT_ACTIVITY_LIMIT}`;

  const response = await fetchWithTimeout(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new TechProviderError(
      `GitHub REST error: ${response.status} ${text}`.slice(0, 500),
      response.status
    );
  }

  return (await response.json()) as GitHubRestEvent[];
}

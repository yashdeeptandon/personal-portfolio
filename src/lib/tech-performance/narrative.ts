export interface NarrativeMetrics {
  codingHoursLast30d: number | null;
  activeRepos: number;
  prsMergedLast30d: number;
  commitsLast30d: number;
  releasesLast30d: number;
}

/**
 * Pure deterministic template over already-computed numbers — no LLM call,
 * no "% AI-assisted" style vanity stat. Converts raw metrics into a
 * readable sentence per the spec's "Engineering Impact narrative"
 * requirement, focused on outcomes (hours coded, PRs merged, repos kept
 * active) rather than presenting AI usage itself as a metric.
 */
export function generateNarrative(metrics: NarrativeMetrics): string {
  const parts: string[] = [];

  if (metrics.codingHoursLast30d) {
    parts.push(`coded for ${metrics.codingHoursLast30d} hours`);
  }
  if (metrics.activeRepos > 0) {
    parts.push(
      `stayed active across ${metrics.activeRepos} repositor${metrics.activeRepos === 1 ? "y" : "ies"}`
    );
  }
  if (metrics.prsMergedLast30d > 0) {
    parts.push(
      `merged ${metrics.prsMergedLast30d} pull request${metrics.prsMergedLast30d === 1 ? "" : "s"}`
    );
  }
  if (metrics.commitsLast30d > 0) {
    parts.push(`shipped ${metrics.commitsLast30d} commit${metrics.commitsLast30d === 1 ? "" : "s"}`);
  }
  if (metrics.releasesLast30d > 0) {
    parts.push(`published ${metrics.releasesLast30d} release${metrics.releasesLast30d === 1 ? "" : "s"}`);
  }

  if (parts.length === 0) {
    return "No engineering activity recorded in the last 30 days.";
  }

  const joined =
    parts.length === 1
      ? parts[0]
      : `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;

  return `Over the last 30 days, ${joined}.`;
}

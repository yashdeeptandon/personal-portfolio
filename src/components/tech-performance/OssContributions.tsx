"use client";

import ChartCard from "@/components/ui/ChartCard";
import type { GitHubOssContributionsData } from "@/types/techPerformance";

export default function OssContributions({
  data,
}: {
  data: GitHubOssContributionsData | null;
}) {
  const repos = data?.repos ?? [];

  return (
    <ChartCard
      title="Open-source contributions"
      subtitle="Pull requests to repositories outside my own"
    >
      {repos.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No external pull requests found yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {repos
            .sort((a, b) => b.prCount - a.prCount)
            .slice(0, 8)
            .map((repo) => (
              <li
                key={repo.nameWithOwner}
                className="flex items-center justify-between text-sm border-b border-foreground/5 pb-2 last:border-0 last:pb-0"
              >
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/80 hover:text-foreground transition-colors"
                >
                  {repo.nameWithOwner}
                </a>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {repo.prCount} PR{repo.prCount !== 1 ? "s" : ""}
                </span>
              </li>
            ))}
        </ul>
      )}
    </ChartCard>
  );
}

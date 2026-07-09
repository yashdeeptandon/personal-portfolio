"use client";

import ChartCard from "@/components/ui/ChartCard";
import StatCard from "@/components/ui/StatCard";
import { CHART } from "@/lib/chartTheme";
import { timeAgo } from "@/lib/tech-performance/timeAgo";
import type { SignalsSectionData } from "@/types/techPerformance";

const CATEGORY_COLOR: Record<string, string> = {
  feat: CHART.ACCENT_GREEN,
  fix: CHART.ACCENT_RED,
  docs: CHART.ACCENT_CYAN,
  chore: CHART.ACCENT_AMBER,
  other: "#4b5563",
};

export default function EngineeringSignals({ data }: { data: SignalsSectionData }) {
  const { metrics, commitBreakdown, highlights } = data;
  const totalCommitsClassified = Object.values(commitBreakdown).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Commits" value={metrics.commitsLast30d} sub="last 30 days" accent={CHART.ACCENT_INDIGO} />
        <StatCard label="PRs merged" value={metrics.prsMergedLast30d} sub="last 30 days" accent={CHART.ACCENT_GREEN} />
        <StatCard label="PRs opened" value={metrics.prsOpenedLast30d} sub="last 30 days" accent={CHART.ACCENT_CYAN} />
        <StatCard label="Issues closed" value={metrics.issuesClosedLast30d} sub="last 30 days" accent={CHART.ACCENT_AMBER} />
        <StatCard label="Releases" value={metrics.releasesLast30d} sub="last 30 days" accent={CHART.ACCENT_RED} />
        <StatCard label="Active repos" value={metrics.activeRepos} sub="pushed in 90d" accent={CHART.ACCENT_INDIGO} />
      </div>

      <ChartCard
        title="Commit composition"
        subtitle={
          totalCommitsClassified > 0
            ? `${totalCommitsClassified} commits, last 90 days — classified by message prefix`
            : "No classifiable commits in the last 90 days"
        }
      >
        {totalCommitsClassified === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Nothing to show yet.</p>
        ) : (
          <div className="space-y-2">
            <div className="flex h-2 rounded-full overflow-hidden">
              {(Object.keys(commitBreakdown) as Array<keyof typeof commitBreakdown>).map((key) => {
                const count = commitBreakdown[key];
                if (count === 0) return null;
                return (
                  <div
                    key={key}
                    style={{ width: `${(count / totalCommitsClassified) * 100}%`, background: CATEGORY_COLOR[key] }}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {(Object.keys(commitBreakdown) as Array<keyof typeof commitBreakdown>).map((key) => (
                <div key={key} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLOR[key] }} />
                  {key} · {commitBreakdown[key]}
                </div>
              ))}
            </div>
          </div>
        )}
      </ChartCard>

      <ChartCard title="Highlights" subtitle="Manually curated engineering milestones">
        {highlights.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No highlights added yet.</p>
        ) : (
          <div className="space-y-2">
            {highlights.map((h) => (
              <div
                key={`${h.title}-${h.timestamp}`}
                className="flex gap-3 items-start rounded-lg border-l-2 border-indigo-500/60 bg-white/[0.03] px-3 py-2.5"
              >
                <div className="mt-1.5 w-2 h-2 rounded-full shrink-0 bg-indigo-400" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-200">
                    {h.url ? (
                      <a href={h.url} target="_blank" rel="noopener noreferrer" className="hover:text-white underline decoration-white/20">
                        {h.title}
                      </a>
                    ) : (
                      h.title
                    )}
                  </p>
                  {h.description && <p className="text-xs text-gray-500 mt-0.5">{h.description}</p>}
                  <p className="text-xs text-gray-600 mt-0.5">{timeAgo(h.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ChartCard>
    </div>
  );
}

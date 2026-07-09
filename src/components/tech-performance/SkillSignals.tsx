"use client";

import ChartCard from "@/components/ui/ChartCard";
import Sparkline from "@/components/ui/Sparkline";
import DataSourceBadge from "./DataSourceBadge";
import { CHART } from "@/lib/chartTheme";
import type { SkillsSectionData } from "@/types/techPerformance";

function formatHours(seconds: number): string {
  const hours = seconds / 3600;
  if (hours < 1) return `${Math.round(seconds / 60)}m`;
  return `${hours.toFixed(1)}h`;
}

export default function SkillSignals({ data }: { data: SkillsSectionData }) {
  const topByTime = data.byCodingTime.slice(0, 8);
  const topByRepos = data.byRepos.slice(0, 8);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <ChartCard
        title="Languages by coding time"
        subtitle="Last 30 days, from WakaTime"
        action={<DataSourceBadge info={data.dataSources.wakatime} />}
      >
        {topByTime.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No WakaTime data yet.</p>
        ) : (
          <ul className="space-y-3">
            {topByTime.map((lang) => (
              <li key={lang.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-200">{lang.name}</span>
                  <span className="text-gray-500 text-xs tabular-nums">
                    {formatHours(lang.totalSeconds)} · {lang.pct.toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(lang.pct, 100)}%`, background: CHART.ACCENT_INDIGO }}
                    />
                  </div>
                  {lang.trend && lang.trend.some((v) => v > 0) && (
                    <div className="w-16 shrink-0">
                      <Sparkline data={lang.trend} color={CHART.ACCENT_INDIGO} />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </ChartCard>

      <ChartCard
        title="Languages across repos"
        subtitle="By source bytes, all public repos"
        action={<DataSourceBadge info={data.dataSources.github} />}
      >
        {topByRepos.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">No GitHub data yet.</p>
        ) : (
          <ul className="space-y-3">
            {topByRepos.map((lang) => (
              <li key={lang.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-200">{lang.name}</span>
                  <span className="text-gray-500 text-xs tabular-nums">{lang.pct.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.min(lang.pct, 100)}%`, background: CHART.ACCENT_GREEN }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </ChartCard>
    </div>
  );
}

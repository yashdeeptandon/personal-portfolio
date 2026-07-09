"use client";

import ChartCard from "@/components/ui/ChartCard";
import TechKPIRow from "./TechKPIRow";
import PeriodSelector from "./PeriodSelector";
import DataSourceBadge from "./DataSourceBadge";
import type { OverviewSectionData } from "@/types/techPerformance";
import type { TechPeriod } from "@/lib/tech-performance/period";

export default function OverviewSection({
  overview,
  period,
  onPeriodChange,
}: {
  overview: OverviewSectionData;
  period: TechPeriod;
  onPeriodChange: (period: TechPeriod) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <PeriodSelector value={period} onChange={onPeriodChange} />
        <div className="flex items-center gap-2">
          <DataSourceBadge info={overview.dataSources.github} />
          <DataSourceBadge info={overview.dataSources.wakatime} />
        </div>
      </div>

      <TechKPIRow overview={overview} />

      {overview.githubProfile && (
        <ChartCard title="GitHub profile" subtitle="Public account summary">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Login</p>
              <p className="text-foreground font-medium">{overview.githubProfile.login}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Followers</p>
              <p className="text-foreground font-medium tabular-nums">
                {overview.githubProfile.followers}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide">Public repos</p>
              <p className="text-foreground font-medium tabular-nums">
                {overview.githubProfile.publicRepos}
              </p>
            </div>
          </div>
        </ChartCard>
      )}
    </div>
  );
}

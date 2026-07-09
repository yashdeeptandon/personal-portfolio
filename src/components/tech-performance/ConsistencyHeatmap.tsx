"use client";

import { useMemo, useState } from "react";
import Heatmap from "@/components/ui/Heatmap";
import SourceToggle from "./SourceToggle";
import DataSourceBadge from "./DataSourceBadge";
import type { ConsistencySectionData } from "@/types/techPerformance";

type Source = "combined" | "github" | "wakatime";

function githubColor(count: number): string {
  if (count <= 0) return "#1f2937";
  if (count <= 2) return "#3730a3";
  if (count <= 5) return "#4338ca";
  if (count <= 9) return "#4f46e5";
  return "#6366f1";
}

function wakatimeColor(minutes: number): string {
  if (minutes <= 0) return "#1f2937";
  if (minutes < 60) return "#155e75";
  if (minutes < 120) return "#0e7490";
  if (minutes < 240) return "#0891b2";
  return "#22d3ee";
}

function combinedColor(score: number): string {
  if (score <= 0) return "#1f2937";
  if (score <= 25) return "#166534";
  if (score <= 50) return "#15803d";
  if (score <= 75) return "#16a34a";
  return "#22c55e";
}

const SOURCE_CONFIG: Record<
  Source,
  { label: string; colorScale: (v: number) => string; legendSteps: number[]; unit: (v: number) => string }
> = {
  combined: { label: "Combined", colorScale: combinedColor, legendSteps: [0, 20, 40, 70, 90], unit: (v) => `score ${v}` },
  github: { label: "GitHub", colorScale: githubColor, legendSteps: [0, 1, 3, 6, 10], unit: (v) => `${v} contribution${v !== 1 ? "s" : ""}` },
  wakatime: { label: "WakaTime", colorScale: wakatimeColor, legendSteps: [0, 30, 90, 180, 300], unit: (v) => `${Math.round(v / 60)}h ${v % 60}m` },
};

export default function ConsistencyHeatmap({ data }: { data: ConsistencySectionData }) {
  const [activeSource, setActiveSource] = useState<Source>("combined");

  const series = data[activeSource];
  const years = useMemo(
    () => [...new Set(series.map((d) => Number(d.date.slice(0, 4))))].sort((a, b) => b - a),
    [series]
  );
  const [year, setYear] = useState(() => years[0] ?? new Date().getFullYear());

  const config = SOURCE_CONFIG[activeSource];
  const activeDays = series.filter((d) => d.value > 0).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <SourceToggle
          value={activeSource}
          onChange={setActiveSource}
          options={[
            { label: "Combined", value: "combined" },
            { label: "GitHub", value: "github" },
            { label: "WakaTime", value: "wakatime" },
          ]}
        />
        <div className="flex items-center gap-2">
          {years.length > 1 && (
            <SourceToggle
              value={year}
              onChange={setYear}
              options={years.map((y) => ({ label: String(y), value: y }))}
            />
          )}
          <DataSourceBadge info={data.dataSources[activeSource === "combined" ? "github" : activeSource]} />
        </div>
      </div>

      <Heatmap
        title="Coding Consistency"
        subtitle={`${config.label} · ${year} · ${activeDays} active days`}
        data={series}
        year={year}
        colorScale={config.colorScale}
        legend={{ steps: config.legendSteps }}
      />
    </div>
  );
}

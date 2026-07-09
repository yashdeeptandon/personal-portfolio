"use client";

import { useMemo, useState } from "react";
import Heatmap from "@/components/ui/Heatmap";
import SourceToggle from "./SourceToggle";
import DataSourceBadge from "./DataSourceBadge";
import { useTheme } from "@/components/ThemeProvider";
import type { ConsistencySectionData } from "@/types/techPerformance";

type Source = "combined" | "github" | "wakatime";

// Each ramp is [empty, low, mid, high, max]. Dark values are the original
// (and only) colors this heatmap shipped with; light values are new,
// desaturated-but-legible equivalents on a white/near-white background —
// same hue family per source, just re-tuned for the opposite background.
const RAMPS = {
  github: {
    dark: ["#1f2937", "#3730a3", "#4338ca", "#4f46e5", "#6366f1"],
    light: ["#e2e8f0", "#c7d2fe", "#a5b4fc", "#818cf8", "#6366f1"],
  },
  wakatime: {
    dark: ["#1f2937", "#155e75", "#0e7490", "#0891b2", "#22d3ee"],
    light: ["#e2e8f0", "#a5f3fc", "#67e8f9", "#22d3ee", "#0891b2"],
  },
  combined: {
    dark: ["#1f2937", "#166534", "#15803d", "#16a34a", "#22c55e"],
    light: ["#e2e8f0", "#bbf7d0", "#86efac", "#4ade80", "#16a34a"],
  },
} as const;

function makeColorScale(ramp: readonly string[], thresholds: readonly number[]) {
  return (value: number): string => {
    if (value <= 0) return ramp[0];
    for (let i = 0; i < thresholds.length; i++) {
      if (value <= thresholds[i]) return ramp[i + 1];
    }
    return ramp[ramp.length - 1];
  };
}

const SOURCE_META: Record<
  Source,
  { label: string; thresholds: number[]; legendSteps: number[] }
> = {
  combined: { label: "Combined", thresholds: [25, 50, 75], legendSteps: [0, 20, 40, 70, 90] },
  github: { label: "GitHub", thresholds: [2, 5, 9], legendSteps: [0, 1, 3, 6, 10] },
  wakatime: { label: "WakaTime", thresholds: [59, 119, 239], legendSteps: [0, 30, 90, 180, 300] },
};

export default function ConsistencyHeatmap({ data }: { data: ConsistencySectionData }) {
  const { theme } = useTheme();
  const [activeSource, setActiveSource] = useState<Source>("combined");

  const series = data[activeSource];
  const years = useMemo(
    () => [...new Set(series.map((d) => Number(d.date.slice(0, 4))))].sort((a, b) => b - a),
    [series]
  );
  const [year, setYear] = useState(() => years[0] ?? new Date().getFullYear());

  const meta = SOURCE_META[activeSource];
  const colorScale = useMemo(
    () => makeColorScale(RAMPS[activeSource][theme], meta.thresholds),
    [activeSource, theme, meta.thresholds]
  );
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
        subtitle={`${meta.label} · ${year} · ${activeDays} active days`}
        data={series}
        year={year}
        colorScale={colorScale}
        legend={{ steps: meta.legendSteps }}
      />
    </div>
  );
}

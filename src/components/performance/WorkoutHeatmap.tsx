"use client";

import { useMemo } from "react";
import Heatmap from "@/components/ui/Heatmap";
import { useTheme } from "@/components/ThemeProvider";
import type { WorkoutCalendarDay } from "@/types/health";

interface Props {
  data: WorkoutCalendarDay[];
  year: number;
}

const RAMPS = {
  dark: ["#1f2937", "#166534", "#16a34a", "#22c55e"],
  light: ["#e2e8f0", "#bbf7d0", "#86efac", "#16a34a"],
} as const;

function makeColorScale(ramp: readonly string[]) {
  return (count: number): string => {
    if (count === 0) return ramp[0];
    if (count === 1) return ramp[1];
    if (count === 2) return ramp[2];
    return ramp[3];
  };
}

export default function WorkoutHeatmap({ data, year }: Props) {
  const { theme } = useTheme();
  const colorScale = useMemo(() => makeColorScale(RAMPS[theme]), [theme]);

  const { totalWorkouts, activeDays } = useMemo(() => {
    const yearData = data.filter((d) => d.year === year);
    return {
      totalWorkouts: yearData.reduce((s, d) => s + d.count, 0),
      activeDays: yearData.filter((d) => d.count > 0).length,
    };
  }, [data, year]);

  return (
    <Heatmap
      title="Workout Calendar"
      subtitle={`${year} · ${totalWorkouts} workouts · ${activeDays} active days`}
      data={data.map((d) => ({ date: d.date, value: d.count }))}
      year={year}
      colorScale={colorScale}
      legend={{
        steps: [0, 1, 2, 3],
        hint: 'Use "Heatmap year" filter above to switch year',
      }}
    />
  );
}

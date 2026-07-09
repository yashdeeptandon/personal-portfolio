"use client";

import { useMemo } from "react";
import Heatmap from "@/components/ui/Heatmap";
import type { WorkoutCalendarDay } from "@/types/health";

interface Props {
  data: WorkoutCalendarDay[];
  year: number;
}

function getColor(count: number) {
  if (count === 0) return "#1f2937";
  if (count === 1) return "#166534";
  if (count === 2) return "#16a34a";
  return "#22c55e";
}

export default function WorkoutHeatmap({ data, year }: Props) {
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
      colorScale={getColor}
      legend={{
        steps: [0, 1, 2, 3],
        hint: 'Use "Heatmap year" filter above to switch year',
      }}
    />
  );
}

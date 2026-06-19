"use client";

import { Bar, CartesianGrid, BarChart, ReferenceLine, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import ChartCard from "@/components/ui/ChartCard";
import { CHART } from "@/lib/chartTheme";
import type { MonthlyPoint } from "@/types/health";

const config: ChartConfig = {
  workout_days: { label: "Workout Days", color: CHART.ACCENT_INDIGO },
};

interface Props {
  data: MonthlyPoint[];
}

export default function WorkoutConsistencyChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    label: d.month.slice(0, 7),
  }));

  return (
    <ChartCard
      title="Monthly Workout Days"
      subtitle="Days trained per month — last 24 months"
    >
      <ChartContainer config={config} className="h-[240px] w-full">
        <BarChart data={formatted} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid
            vertical={false}
            stroke={CHART.GRID_STROKE}
            strokeOpacity={CHART.GRID_OPACITY}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: CHART.TICK_FILL }}
            tickLine={false}
            axisLine={false}
            interval={3}
          />
          <YAxis
            tick={{ fontSize: 11, fill: CHART.TICK_FILL }}
            tickLine={false}
            axisLine={false}
            domain={[0, 31]}
          />
          <ReferenceLine
            y={20}
            stroke={CHART.ACCENT_AMBER}
            strokeDasharray="4 3"
            strokeOpacity={0.7}
            label={{ value: "Goal: 20d", fill: CHART.ACCENT_AMBER, fontSize: 10 }}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar
            dataKey="workout_days"
            fill={CHART.ACCENT_INDIGO}
            opacity={0.8}
            radius={[3, 3, 0, 0]}
            maxBarSize={20}
          />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}

"use client";

import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import ChartCard from "@/components/ui/ChartCard";
import { CHART } from "@/lib/chartTheme";
import type { WorkoutType } from "@/types/health";

const COLORS = [
  CHART.ACCENT_INDIGO,
  CHART.ACCENT_CYAN,
  CHART.ACCENT_AMBER,
  CHART.ACCENT_GREEN,
  CHART.ACCENT_RED,
];

interface Props {
  data: WorkoutType[];
}

function buildConfig(types: WorkoutType[]): ChartConfig {
  return Object.fromEntries(
    types.map((t, i) => [
      t.type,
      { label: t.type, color: COLORS[i % COLORS.length] },
    ])
  );
}

export default function WorkoutTypesChart({ data }: Props) {
  const top8 = data.slice(0, 8);
  const config = buildConfig(top8);

  return (
    <ChartCard
      title="Workout Types"
      subtitle="Sessions by activity type — all time"
    >
      <ChartContainer config={config} className="h-[240px] w-full">
        <BarChart
          layout="vertical"
          data={top8}
          margin={{ top: 4, right: 40, bottom: 0, left: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: CHART.TICK_FILL }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="type"
            tick={{ fontSize: 10, fill: CHART.TICK_FILL }}
            tickLine={false}
            axisLine={false}
            width={90}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            formatter={(v, name) => [v, name === "count" ? "Sessions" : name]}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {top8.map((entry, i) => (
              <Cell key={entry.type} fill={COLORS[i % COLORS.length]} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}

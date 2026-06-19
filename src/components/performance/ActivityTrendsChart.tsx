"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import ChartCard from "@/components/ui/ChartCard";
import { CHART } from "@/lib/chartTheme";
import type { WeeklyTrend } from "@/types/health";

const config: ChartConfig = {
  steps_avg: { label: "Avg Steps", color: CHART.ACCENT_INDIGO },
  active_calories_avg: { label: "Active Cal", color: CHART.ACCENT_AMBER },
};

interface Props {
  data: WeeklyTrend[];
}

function fmt(d: string) {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ActivityTrendsChart({ data }: Props) {
  const last26 = data.slice(-26);

  return (
    <ChartCard
      title="Activity Trends"
      subtitle="Weekly average steps (bars) + active calories (line) — last 26 weeks"
      fullWidth
    >
      <ChartContainer config={config} className="h-[280px] w-full">
        <ComposedChart data={last26} margin={{ top: 4, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid
            vertical={false}
            stroke={CHART.GRID_STROKE}
            strokeOpacity={CHART.GRID_OPACITY}
          />
          <XAxis
            dataKey="week_start"
            tickFormatter={fmt}
            tick={{ fontSize: 11, fill: CHART.TICK_FILL }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="steps"
            orientation="left"
            tick={{ fontSize: 11, fill: CHART.TICK_FILL }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <YAxis
            yAxisId="cal"
            orientation="right"
            tick={{ fontSize: 11, fill: CHART.TICK_FILL }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}`}
          />
          <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
          <Bar
            yAxisId="steps"
            dataKey="steps_avg"
            fill={CHART.ACCENT_INDIGO}
            opacity={0.65}
            radius={[3, 3, 0, 0]}
            maxBarSize={16}
          />
          <Line
            yAxisId="cal"
            type="monotone"
            dataKey="active_calories_avg"
            stroke={CHART.ACCENT_AMBER}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: CHART.ACCENT_AMBER }}
          />
        </ComposedChart>
      </ChartContainer>
    </ChartCard>
  );
}

"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
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
  recovery_avg: { label: "Recovery Score", color: CHART.ACCENT_INDIGO },
};

interface Props {
  data: WeeklyTrend[];
}

function fmt(d: string) {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function RecoveryScoreChart({ data }: Props) {
  const last26 = data.filter((d) => d.recovery_avg !== null).slice(-26);

  if (!last26.length) {
    return (
      <ChartCard title="Recovery Score" subtitle="Insufficient HRV + RHR data">
        <p className="text-sm text-gray-500 text-center py-8">No recovery data available</p>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Recovery Score"
      subtitle="Weekly composite (HRV + resting HR) — last 26 weeks"
    >
      <ChartContainer config={config} className="h-[240px] w-full">
        <AreaChart data={last26} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="recoveryGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART.ACCENT_INDIGO} stopOpacity={0.35} />
              <stop offset="95%" stopColor={CHART.ACCENT_INDIGO} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke={CHART.GRID_STROKE}
            strokeOpacity={CHART.GRID_OPACITY}
          />
          <XAxis
            dataKey="week_start"
            tickFormatter={fmt}
            tick={{ fontSize: 10, fill: CHART.TICK_FILL }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: CHART.TICK_FILL }}
            tickLine={false}
            axisLine={false}
          />
          <ReferenceLine
            y={70}
            stroke={CHART.ACCENT_GREEN}
            strokeDasharray="4 3"
            strokeOpacity={0.6}
            label={{ value: "Good", fill: CHART.ACCENT_GREEN, fontSize: 10, position: "right" }}
          />
          <ReferenceLine
            y={40}
            stroke={CHART.ACCENT_AMBER}
            strokeDasharray="4 3"
            strokeOpacity={0.5}
            label={{ value: "Low", fill: CHART.ACCENT_AMBER, fontSize: 10, position: "right" }}
          />
          <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
          <Area
            type="monotone"
            dataKey="recovery_avg"
            stroke={CHART.ACCENT_INDIGO}
            strokeWidth={2}
            fill="url(#recoveryGrad)"
            dot={false}
            activeDot={{ r: 4, fill: CHART.ACCENT_INDIGO }}
            connectNulls
          />
        </AreaChart>
      </ChartContainer>
    </ChartCard>
  );
}

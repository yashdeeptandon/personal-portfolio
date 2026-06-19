"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import ChartCard from "@/components/ui/ChartCard";
import type { AggregatedActivity } from "@/lib/filterUtils";
import { CHART } from "@/lib/chartTheme";

interface Props {
  data: AggregatedActivity[];
  granularity: "daily" | "weekly" | "monthly";
}

function fmtDate(date: string, gran: "daily" | "weekly" | "monthly") {
  const d = new Date(date + "T00:00:00Z");
  if (gran === "monthly")
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export default function StackedCaloriesChart({ data, granularity }: Props) {
  const xInterval = Math.max(0, Math.floor(data.length / 7) - 1);
  const title =
    granularity === "daily"
      ? "Daily Calories"
      : granularity === "weekly"
      ? "Weekly Calories"
      : "Monthly Calories";

  return (
    <ChartCard title={title} subtitle="Active + basal energy burned">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART.GRID_STROKE} strokeOpacity={CHART.GRID_OPACITY} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => fmtDate(d, granularity)}
            tick={{ fill: CHART.TICK_FILL, fontSize: 11 }}
            axisLine={{ stroke: CHART.AXIS_STROKE }}
            tickLine={false}
            interval={xInterval}
          />
          <YAxis
            tick={{ fill: CHART.TICK_FILL, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            width={36}
          />
          <Tooltip
            contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
            labelStyle={{ color: "#e5e7eb", fontSize: 12 }}
            itemStyle={{ color: "#d1d5db", fontSize: 12 }}
            labelFormatter={(l: unknown) => fmtDate(l as string, granularity)}
            formatter={(v: unknown) => [Number(v).toLocaleString() + " kcal"]}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: CHART.TICK_FILL }} />
          <Bar dataKey="active_calories" name="Active Cal" stackId="a" fill={CHART.ACCENT_AMBER} radius={[0, 0, 0, 0]} maxBarSize={granularity === "daily" ? 6 : 20} />
          <Bar dataKey="basal_calories" name="Basal Cal" stackId="a" fill={CHART.ACCENT_INDIGO} opacity={0.7} radius={[2, 2, 0, 0]} maxBarSize={granularity === "daily" ? 6 : 20} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

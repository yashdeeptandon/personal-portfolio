"use client";

import {
  ComposedChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine,
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

export default function ExerciseTimeChart({ data, granularity }: Props) {
  const xInterval = Math.max(0, Math.floor(data.length / 7) - 1);
  const subtitle =
    granularity === "daily"
      ? "Daily exercise minutes — WHO 30 min/day"
      : granularity === "weekly"
      ? "Weekly avg per day — WHO 30 min/day guideline"
      : "Monthly avg per day — WHO 30 min/day guideline";

  return (
    <ChartCard title="Exercise Time" subtitle={subtitle}>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
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
            tickFormatter={(v) => `${v}m`}
            width={36}
          />
          <Tooltip
            contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
            labelStyle={{ color: "#e5e7eb", fontSize: 12 }}
            itemStyle={{ color: "#d1d5db", fontSize: 12 }}
            labelFormatter={(l: unknown) => fmtDate(l as string, granularity)}
            formatter={(v: unknown) => [`${Number(v)} min`, granularity === "daily" ? "Exercise min" : "Daily avg"]}
          />
          <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "WHO 30m", position: "right", fill: "#22c55e", fontSize: 10 }} />
          <Bar
            dataKey="exercise_min"
            name="exercise_min"
            fill={CHART.ACCENT_CYAN}
            opacity={0.75}
            radius={[2, 2, 0, 0]}
            maxBarSize={granularity === "daily" ? 6 : 16}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

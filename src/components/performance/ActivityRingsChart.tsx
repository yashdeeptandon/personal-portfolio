"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine, Legend,
} from "recharts";
import ChartCard from "@/components/ui/ChartCard";
import type { AggregatedRings } from "@/lib/filterUtils";
import { CHART } from "@/lib/chartTheme";

interface Props {
  data: AggregatedRings[];
  granularity: "daily" | "weekly" | "monthly";
}

function fmtDate(date: string, gran: "daily" | "weekly" | "monthly") {
  const d = new Date(date + "T00:00:00Z");
  if (gran === "monthly")
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export default function ActivityRingsChart({ data, granularity }: Props) {
  const xInterval = Math.max(0, Math.floor(data.length / 7) - 1);
  const label = granularity === "monthly" ? "Monthly" : "Weekly";

  return (
    <ChartCard
      title="Activity Ring Completion"
      subtitle={`${label} avg % — Move / Exercise / Stand (capped at 150%)`}
    >
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
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
            tickFormatter={(v) => `${v}%`}
            domain={[0, 150]}
            width={40}
          />
          <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="4 3" strokeWidth={1} />
          <Tooltip
            contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
            labelStyle={{ color: "#e5e7eb", fontSize: 12 }}
            itemStyle={{ color: "#d1d5db", fontSize: 12 }}
            labelFormatter={(l: unknown) => fmtDate(l as string, granularity)}
            formatter={(v: unknown) => [`${Number(v)}%`]}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: CHART.TICK_FILL }} />
          <Line dataKey="move" name="Move" stroke="#ef4444" strokeWidth={2} dot={false} connectNulls />
          <Line dataKey="exercise" name="Exercise" stroke="#22c55e" strokeWidth={2} dot={false} connectNulls />
          <Line dataKey="stand" name="Stand" stroke={CHART.ACCENT_CYAN} strokeWidth={2} dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

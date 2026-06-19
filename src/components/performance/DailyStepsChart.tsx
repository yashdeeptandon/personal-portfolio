"use client";

import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, CartesianGrid,
} from "recharts";
import ChartCard from "@/components/ui/ChartCard";
import type { AggregatedActivity } from "@/lib/filterUtils";
import { CHART } from "@/lib/chartTheme";

interface Props {
  data: AggregatedActivity[];
  granularity: "daily" | "weekly" | "monthly";
  stepThreshold: number;
}

function fmtDate(date: string, granularity: "daily" | "weekly" | "monthly") {
  const d = new Date(date + "T00:00:00Z");
  if (granularity === "monthly")
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
  if (granularity === "weekly")
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function subtitleFor(gran: "daily" | "weekly" | "monthly", n: number) {
  const label = gran === "daily" ? "days" : gran === "weekly" ? "weeks" : "months";
  return `${n} ${label} · ${gran} granularity · rolling 7-day avg`;
}

export default function DailyStepsChart({ data, granularity, stepThreshold }: Props) {
  const xInterval = Math.max(0, Math.floor(data.length / 8) - 1);

  return (
    <ChartCard
      title="Steps"
      subtitle={subtitleFor(granularity, data.length)}
    >
      <ResponsiveContainer width="100%" height={280}>
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
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            width={36}
          />
          <Tooltip
            contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
            labelStyle={{ color: "#e5e7eb", fontSize: 12 }}
            itemStyle={{ color: "#d1d5db", fontSize: 12 }}
            labelFormatter={(l: unknown) => fmtDate(l as string, granularity)}
            formatter={(v: unknown, name: unknown) => {
              const n = Number(v);
              const label = granularity === "daily" ? "Steps" : `Avg steps/day`;
              return [n?.toLocaleString(), name === "steps" ? label : "7d avg"];
            }}
          />
          <ReferenceLine
            y={stepThreshold}
            stroke="#22c55e"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={{ value: stepThreshold.toLocaleString(), position: "right", fill: "#22c55e", fontSize: 10 }}
          />
          <Bar dataKey="steps" fill={CHART.ACCENT_INDIGO} opacity={0.7} radius={[2, 2, 0, 0]} maxBarSize={granularity === "daily" ? 6 : 16} />
          {granularity !== "monthly" && (
            <Line dataKey="steps_rolling7" stroke={CHART.ACCENT_CYAN} strokeWidth={2} dot={false} name="7d avg" connectNulls />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

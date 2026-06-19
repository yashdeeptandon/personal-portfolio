"use client";

import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, CartesianGrid,
} from "recharts";
import ChartCard from "@/components/ui/ChartCard";
import type { DailyActivity } from "@/types/health";
import { CHART } from "@/lib/chartTheme";

interface Props {
  data: DailyActivity[];
}

function fmt(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Thin to ~90 points for legibility
function thin(data: DailyActivity[], n = 90) {
  if (data.length <= n) return data;
  const step = Math.ceil(data.length / n);
  return data.filter((_, i) => i % step === 0);
}

export default function DailyStepsChart({ data }: Props) {
  const last90 = data.slice(-90);
  const display = thin(last90, 90);

  return (
    <ChartCard title="Daily Steps" subtitle="Last 90 days — rolling 7-day avg + 7,500 active threshold">
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={display} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART.GRID_STROKE} strokeOpacity={CHART.GRID_OPACITY} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={fmt}
            tick={{ fill: CHART.TICK_FILL, fontSize: 11 }}
            axisLine={{ stroke: CHART.AXIS_STROKE }}
            tickLine={false}
            interval={Math.floor(display.length / 6)}
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
            labelFormatter={(l: unknown) => fmt(l as string)}
            formatter={(v: unknown, name: unknown) => {
              const n = Number(v);
              return [
                name === "steps" ? n?.toLocaleString() : Math.round(n).toLocaleString(),
                name === "steps" ? "Steps" : "7d avg",
              ];
            }}
          />
          <ReferenceLine y={7500} stroke="#22c55e" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "7,500", position: "right", fill: "#22c55e", fontSize: 10 }} />
          <Bar dataKey="steps" fill={CHART.ACCENT_INDIGO} opacity={0.7} radius={[2, 2, 0, 0]} maxBarSize={10} />
          <Line dataKey="steps_rolling7" stroke={CHART.ACCENT_CYAN} strokeWidth={2} dot={false} name="7d avg" />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

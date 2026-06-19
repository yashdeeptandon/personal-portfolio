"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine, Legend,
} from "recharts";
import ChartCard from "@/components/ui/ChartCard";
import type { ActivityRingDay } from "@/types/health";
import { CHART } from "@/lib/chartTheme";

interface Props {
  data: ActivityRingDay[];
}

function fmtDate(s: string) {
  const d = new Date(s + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

// Weekly avg to smooth the chart
function toWeekly(data: ActivityRingDay[]) {
  const map = new Map<string, { move: number[]; exercise: number[]; stand: number[]; date: string }>();
  data.forEach((d) => {
    const dt = new Date(d.date + "T00:00:00Z");
    const dayOfWeek = dt.getUTCDay();
    const daysToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(dt);
    monday.setUTCDate(dt.getUTCDate() - daysToMon);
    const key = monday.toISOString().slice(0, 10);
    const prev = map.get(key) ?? { move: [], exercise: [], stand: [], date: key };
    if (d.move_pct !== null) prev.move.push(d.move_pct);
    if (d.exercise_pct !== null) prev.exercise.push(d.exercise_pct);
    if (d.stand_pct !== null) prev.stand.push(d.stand_pct);
    map.set(key, prev);
  });
  const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
  return Array.from(map.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-26)
    .map((w) => ({
      date: w.date,
      move: avg(w.move) !== null ? Math.min(Math.round(avg(w.move)!), 150) : null,
      exercise: avg(w.exercise) !== null ? Math.min(Math.round(avg(w.exercise)!), 150) : null,
      stand: avg(w.stand) !== null ? Math.min(Math.round(avg(w.stand)!), 150) : null,
    }));
}

export default function ActivityRingsChart({ data }: Props) {
  const weekly = toWeekly(data);

  return (
    <ChartCard title="Activity Ring Completion" subtitle="Weekly avg % — Move / Exercise / Stand (capped at 150%)">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={weekly} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART.GRID_STROKE} strokeOpacity={CHART.GRID_OPACITY} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            tick={{ fill: CHART.TICK_FILL, fontSize: 11 }}
            axisLine={{ stroke: CHART.AXIS_STROKE }}
            tickLine={false}
            interval={4}
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
            labelFormatter={(l: unknown) => fmtDate(l as string)}
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

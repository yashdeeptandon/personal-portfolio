"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine, Line, ComposedChart,
} from "recharts";
import ChartCard from "@/components/ui/ChartCard";
import type { DailyActivity } from "@/types/health";
import { CHART } from "@/lib/chartTheme";

interface Props {
  data: DailyActivity[];
}

// Aggregate to weekly
function toWeekly(data: DailyActivity[]) {
  const map = new Map<string, { total: number; days: number; date: string }>();
  data.forEach((d) => {
    const dt = new Date(d.date + "T00:00:00Z");
    const dayOfWeek = dt.getUTCDay();
    const daysToMon = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    const monday = new Date(dt);
    monday.setUTCDate(dt.getUTCDate() - daysToMon);
    const key = monday.toISOString().slice(0, 10);
    const prev = map.get(key) ?? { total: 0, days: 0, date: key };
    prev.total += d.exercise_min ?? 0;
    prev.days += 1;
    map.set(key, prev);
  });
  return Array.from(map.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-26)
    .map((w) => ({ ...w, avg_per_day: Math.round(w.total / w.days) }));
}

function fmtDate(s: string) {
  const d = new Date(s + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export default function ExerciseTimeChart({ data }: Props) {
  const weekly = toWeekly(data);

  return (
    <ChartCard title="Exercise Time" subtitle="Daily avg per week — WHO 30 min/day guideline">
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={weekly} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
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
            tickFormatter={(v) => `${v}m`}
            width={36}
          />
          <Tooltip
            contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
            labelStyle={{ color: "#e5e7eb", fontSize: 12 }}
            itemStyle={{ color: "#d1d5db", fontSize: 12 }}
            labelFormatter={(l: unknown) => fmtDate(l as string)}
            formatter={(v: unknown, name: unknown) => [`${Number(v)} min`, name === "total" ? "Weekly total" : "Daily avg"]}
          />
          <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "WHO 30m", position: "right", fill: "#22c55e", fontSize: 10 }} />
          <Bar dataKey="avg_per_day" name="avg_per_day" fill={CHART.ACCENT_CYAN} opacity={0.75} radius={[2, 2, 0, 0]} maxBarSize={14} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import ChartCard from "@/components/ui/ChartCard";
import type { DailyActivity } from "@/types/health";
import { CHART } from "@/lib/chartTheme";

interface Props {
  data: DailyActivity[];
}

function fmtMonth(date: string) {
  const d = new Date(date + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
}

// Aggregate to weekly for readability
function toWeekly(data: DailyActivity[]) {
  const map = new Map<string, { active: number; basal: number; date: string }>();
  data.forEach((d) => {
    const dt = new Date(d.date + "T00:00:00Z");
    const dayOfWeek = dt.getUTCDay();
    const daysToMon = (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    const monday = new Date(dt);
    monday.setUTCDate(dt.getUTCDate() - daysToMon);
    const key = monday.toISOString().slice(0, 10);
    const prev = map.get(key) ?? { active: 0, basal: 0, date: key };
    prev.active += d.active_calories ?? 0;
    prev.basal += d.basal_calories ?? 0;
    map.set(key, prev);
  });
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date)).slice(-26);
}

export default function StackedCaloriesChart({ data }: Props) {
  const weekly = toWeekly(data);

  return (
    <ChartCard title="Weekly Calories" subtitle="Active + basal energy burned">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={weekly} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART.GRID_STROKE} strokeOpacity={CHART.GRID_OPACITY} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={fmtMonth}
            tick={{ fill: CHART.TICK_FILL, fontSize: 11 }}
            axisLine={{ stroke: CHART.AXIS_STROKE }}
            tickLine={false}
            interval={3}
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
            formatter={(v: unknown) => [Number(v).toLocaleString() + " kcal"]}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: CHART.TICK_FILL }} />
          <Bar dataKey="active" name="Active Cal" stackId="a" fill={CHART.ACCENT_AMBER} radius={[0, 0, 0, 0]} />
          <Bar dataKey="basal" name="Basal Cal" stackId="a" fill={CHART.ACCENT_INDIGO} opacity={0.7} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

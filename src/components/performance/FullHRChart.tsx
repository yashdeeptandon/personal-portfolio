"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import ChartCard from "@/components/ui/ChartCard";
import type { DailyHeart } from "@/types/health";
import { CHART } from "@/lib/chartTheme";

interface Props {
  data: DailyHeart[];
}

function fmtDate(s: string) {
  const d = new Date(s + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

// Weekly sample to keep chart readable
function thin(data: DailyHeart[], step = 3) {
  return data.filter((_, i) => i % step === 0).slice(-90);
}

export default function FullHRChart({ data }: Props) {
  const display = thin(data);

  return (
    <ChartCard title="Heart Rate Trends" subtitle="Daily avg / max / resting HR (3-week window)">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={display} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART.GRID_STROKE} strokeOpacity={CHART.GRID_OPACITY} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            tick={{ fill: CHART.TICK_FILL, fontSize: 11 }}
            axisLine={{ stroke: CHART.AXIS_STROKE }}
            tickLine={false}
            interval={Math.floor(display.length / 6)}
          />
          <YAxis
            tick={{ fill: CHART.TICK_FILL, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}`}
            domain={["auto", "auto"]}
            width={36}
          />
          <Tooltip
            contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
            labelStyle={{ color: "#e5e7eb", fontSize: 12 }}
            itemStyle={{ color: "#d1d5db", fontSize: 12 }}
            labelFormatter={(l: unknown) => fmtDate(l as string)}
            formatter={(v: unknown) => [`${Number(v)} bpm`]}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: CHART.TICK_FILL }} />
          <Line dataKey="hr_max" name="HR Max" stroke="#ef4444" strokeWidth={1.5} dot={false} connectNulls strokeDasharray="4 2" />
          <Line dataKey="hr_avg" name="HR Avg" stroke={CHART.ACCENT_AMBER} strokeWidth={2} dot={false} connectNulls />
          <Line dataKey="resting_hr" name="Resting HR" stroke={CHART.ACCENT_CYAN} strokeWidth={2} dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

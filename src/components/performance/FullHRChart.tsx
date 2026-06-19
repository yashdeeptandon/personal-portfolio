"use client";

import { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import ChartCard from "@/components/ui/ChartCard";
import type { DailyHeart } from "@/types/health";
import { toWeeklyHeart, toMonthlyHeart } from "@/lib/filterUtils";
import { CHART } from "@/lib/chartTheme";

interface Props {
  data: DailyHeart[];
  granularity: "daily" | "weekly" | "monthly";
  metrics: { avg: boolean; max: boolean; resting: boolean; hrv: boolean; spo2: boolean };
}

function fmtDate(date: string, gran: "daily" | "weekly" | "monthly") {
  const d = new Date(date + "T00:00:00Z");
  if (gran === "monthly")
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export default function FullHRChart({ data, granularity, metrics }: Props) {
  const display = useMemo(() => {
    if (granularity === "weekly") return toWeeklyHeart(data);
    if (granularity === "monthly") return toMonthlyHeart(data);
    // daily — thin to max 180 points for legibility
    if (data.length <= 180) return data.map((d) => ({
      date: d.date,
      hr_avg: d.hr_avg,
      hr_max: d.hr_max,
      resting_hr: d.resting_hr,
      hrv_avg: d.hrv_avg,
      recovery_score: d.recovery_score,
      spo2: d.spo2,
    }));
    const step = Math.ceil(data.length / 180);
    return data.filter((_, i) => i % step === 0).map((d) => ({
      date: d.date,
      hr_avg: d.hr_avg,
      hr_max: d.hr_max,
      resting_hr: d.resting_hr,
      hrv_avg: d.hrv_avg,
      recovery_score: d.recovery_score,
      spo2: d.spo2,
    }));
  }, [data, granularity]);

  const xInterval = Math.max(0, Math.floor(display.length / 7) - 1);
  const activeCount = [metrics.avg, metrics.max, metrics.resting].filter(Boolean).length;
  if (activeCount === 0) {
    return (
      <ChartCard title="Heart Rate Trends" subtitle="No metrics selected — use filters above">
        <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
          Enable at least one HR metric in the filter bar
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard
      title="Heart Rate Trends"
      subtitle={`${display.length} ${granularity === "daily" ? "days" : granularity === "weekly" ? "weeks" : "months"} · avg / max / resting bpm`}
    >
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={display} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
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
            tickFormatter={(v) => `${v}`}
            domain={["auto", "auto"]}
            width={36}
          />
          <Tooltip
            contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
            labelStyle={{ color: "#e5e7eb", fontSize: 12 }}
            itemStyle={{ color: "#d1d5db", fontSize: 12 }}
            labelFormatter={(l: unknown) => fmtDate(l as string, granularity)}
            formatter={(v: unknown) => [`${Number(v)} bpm`]}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: CHART.TICK_FILL }} />
          {metrics.max && (
            <Line dataKey="hr_max" name="HR Max" stroke="#ef4444" strokeWidth={1.5} dot={false} connectNulls strokeDasharray="4 2" />
          )}
          {metrics.avg && (
            <Line dataKey="hr_avg" name="HR Avg" stroke={CHART.ACCENT_AMBER} strokeWidth={2} dot={false} connectNulls />
          )}
          {metrics.resting && (
            <Line dataKey="resting_hr" name="Resting HR" stroke={CHART.ACCENT_CYAN} strokeWidth={2} dot={false} connectNulls />
          )}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

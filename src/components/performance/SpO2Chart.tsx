"use client";

import { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from "recharts";
import ChartCard from "@/components/ui/ChartCard";
import type { DailyHeart } from "@/types/health";
import { toWeeklyHeart, toMonthlyHeart } from "@/lib/filterUtils";
import { CHART } from "@/lib/chartTheme";

interface Props {
  data: DailyHeart[];
  granularity: "daily" | "weekly" | "monthly";
}

function fmtDate(date: string, gran: "daily" | "weekly" | "monthly") {
  const d = new Date(date + "T00:00:00Z");
  if (gran === "monthly")
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export default function SpO2Chart({ data, granularity }: Props) {
  const display = useMemo(() => {
    if (granularity === "weekly") {
      return toWeeklyHeart(data).filter((d) => d.spo2 !== null);
    }
    if (granularity === "monthly") {
      return toMonthlyHeart(data).filter((d) => d.spo2 !== null);
    }
    // daily — thin to max 180 points
    const filtered = data.filter((d) => d.spo2 !== null);
    if (filtered.length <= 180) return filtered;
    const step = Math.ceil(filtered.length / 180);
    return filtered.filter((_, i) => i % step === 0);
  }, [data, granularity]);

  if (!display.length) {
    return (
      <ChartCard title="Blood Oxygen (SpO₂)" subtitle="No SpO₂ data available">
        <div className="h-48 flex items-center justify-center text-gray-500 text-sm">No SpO₂ readings in selected range</div>
      </ChartCard>
    );
  }

  const vals = display.map((d) => d.spo2!).filter((v) => v !== null && v !== undefined);
  const minVal = Math.floor(Math.min(...vals) - 1);
  const xInterval = Math.max(0, Math.floor(display.length / 6) - 1);

  return (
    <ChartCard
      title="Blood Oxygen (SpO₂)"
      subtitle={`${display.length} ${granularity === "monthly" ? "months" : granularity === "weekly" ? "weeks" : "days"} · 95% threshold`}
    >
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={display} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spo2Grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART.ACCENT_CYAN} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CHART.ACCENT_CYAN} stopOpacity={0.02} />
            </linearGradient>
          </defs>
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
            domain={[minVal, 101]}
            tickFormatter={(v) => `${v}%`}
            width={40}
          />
          <ReferenceLine y={95} stroke={CHART.ACCENT_AMBER} strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "95%", position: "right", fill: CHART.ACCENT_AMBER, fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
            labelStyle={{ color: "#e5e7eb", fontSize: 12 }}
            itemStyle={{ color: "#d1d5db", fontSize: 12 }}
            labelFormatter={(l: unknown) => fmtDate(l as string, granularity)}
            formatter={(v: unknown) => [`${Number(v)}%`, "SpO₂"]}
          />
          <Area
            dataKey="spo2"
            stroke={CHART.ACCENT_CYAN}
            strokeWidth={2}
            fill="url(#spo2Grad)"
            dot={false}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

"use client";

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
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

export default function SpO2Chart({ data }: Props) {
  const spo2Data = data.filter((d) => d.spo2 !== null).slice(-180);

  if (!spo2Data.length) {
    return (
      <ChartCard title="Blood Oxygen (SpO₂)" subtitle="No SpO₂ data available">
        <div className="h-48 flex items-center justify-center text-gray-500 text-sm">No SpO₂ readings recorded</div>
      </ChartCard>
    );
  }

  const minVal = Math.floor(Math.min(...spo2Data.map((d) => d.spo2!)) - 1);
  const maxVal = 101;

  return (
    <ChartCard title="Blood Oxygen (SpO₂)" subtitle="Daily avg — 95% threshold">
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={spo2Data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spo2Grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART.ACCENT_CYAN} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CHART.ACCENT_CYAN} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART.GRID_STROKE} strokeOpacity={CHART.GRID_OPACITY} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            tick={{ fill: CHART.TICK_FILL, fontSize: 11 }}
            axisLine={{ stroke: CHART.AXIS_STROKE }}
            tickLine={false}
            interval={Math.floor(spo2Data.length / 5)}
          />
          <YAxis
            tick={{ fill: CHART.TICK_FILL, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[minVal, maxVal]}
            tickFormatter={(v) => `${v}%`}
            width={40}
          />
          <ReferenceLine y={95} stroke={CHART.ACCENT_AMBER} strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "95%", position: "right", fill: CHART.ACCENT_AMBER, fontSize: 10 }} />
          <Tooltip
            contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
            labelStyle={{ color: "#e5e7eb", fontSize: 12 }}
            itemStyle={{ color: "#d1d5db", fontSize: 12 }}
            labelFormatter={(l: unknown) => fmtDate(l as string)}
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

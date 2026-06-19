"use client";

import {
  ComposedChart, Bar, Line, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine,
} from "recharts";
import ChartCard from "@/components/ui/ChartCard";
import type { TrainingLoadWeek } from "@/types/health";
import { CHART } from "@/lib/chartTheme";

interface Props {
  data: TrainingLoadWeek[];
}

function fmtDate(s: string) {
  const d = new Date(s + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export default function TrainingLoadChart({ data }: Props) {
  const recent = data.slice(-52);
  const spikeCount = recent.filter((w) => w.spike).length;

  return (
    <ChartCard
      title="Weekly Training Load"
      subtitle={`4-week rolling avg · ${spikeCount} spike week${spikeCount !== 1 ? "s" : ""} detected (>20% jump)`}
    >
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={recent} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART.GRID_STROKE} strokeOpacity={CHART.GRID_OPACITY} vertical={false} />
          <XAxis
            dataKey="week"
            tickFormatter={fmtDate}
            tick={{ fill: CHART.TICK_FILL, fontSize: 11 }}
            axisLine={{ stroke: CHART.AXIS_STROKE }}
            tickLine={false}
            interval={Math.floor(recent.length / 7)}
          />
          <YAxis
            tick={{ fill: CHART.TICK_FILL, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            width={40}
          />
          <Tooltip
            contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
            labelStyle={{ color: "#e5e7eb", fontSize: 12 }}
            itemStyle={{ color: "#d1d5db", fontSize: 12 }}
            labelFormatter={(l: unknown) => fmtDate(l as string)}
            formatter={(v: unknown, name: unknown) => {
              const n = Number(v);
              return [
                name === "load" ? n.toLocaleString() : Math.round(n).toLocaleString(),
                name === "load" ? "Weekly load" : "4-wk avg",
              ];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: CHART.TICK_FILL }} />
          <Bar dataKey="load" name="load" radius={[2, 2, 0, 0]} maxBarSize={12}>
            {recent.map((entry, i) => (
              <Cell key={i} fill={entry.spike ? CHART.ACCENT_RED : CHART.ACCENT_INDIGO} opacity={entry.spike ? 1 : 0.75} />
            ))}
          </Bar>
          <Line dataKey="rolling4" name="4-wk avg" stroke={CHART.ACCENT_CYAN} strokeWidth={2} dot={false} connectNulls />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Spike legend */}
      <div className="flex items-center gap-3 mt-1 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CHART.ACCENT_RED }} />
          <span className="text-xs text-gray-400">Spike week (&gt;20% jump)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: CHART.ACCENT_INDIGO, opacity: 0.75 }} />
          <span className="text-xs text-gray-400">Normal week</span>
        </div>
      </div>
    </ChartCard>
  );
}

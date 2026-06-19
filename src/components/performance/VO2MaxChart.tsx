"use client";

import {
  ComposedChart, Scatter, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, ReferenceLine,
} from "recharts";
import ChartCard from "@/components/ui/ChartCard";
import type { VO2MaxData } from "@/types/health";
import { CHART } from "@/lib/chartTheme";

interface Props {
  data: VO2MaxData | null;
}

function fmtDate(s: string) {
  const d = new Date(s + "T00:00:00Z");
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
}

export default function VO2MaxChart({ data }: Props) {
  if (!data || !data.readings.length) {
    return (
      <ChartCard title="VO₂ Max" subtitle="No VO₂ Max readings available">
        <div className="h-64 flex items-center justify-center text-gray-500 text-sm">No VO₂ Max data recorded</div>
      </ChartCard>
    );
  }

  // Combine scatter + monthly avg into one dataset keyed by date
  const monthlyMap = new Map(data.monthly.map((m) => [m.month, m.avg]));

  // For scatter: individual readings
  const scatterData = data.readings.map((r) => ({
    date: r.date,
    value: r.value,
    xIndex: data.readings.indexOf(r),
  }));

  // For regression line: two-point dataset
  const reg = data.regression;
  const regLine = reg
    ? [
        { date: reg.date_start, regY: reg.y_start },
        { date: reg.date_end, regY: reg.y_end },
      ]
    : [];

  // Merge scatter + monthly avg for display
  const merged = data.readings.map((r, i) => ({
    date: r.date,
    reading: r.value,
    monthKey: r.date.slice(0, 7),
  }));

  // Monthly avg overlaid
  const monthlyLine = data.monthly.map((m) => ({
    date: m.month + "-01",
    monthly_avg: m.avg,
  }));

  const allDates = [...merged.map((m) => m.date), ...monthlyLine.map((m) => m.date)].sort();
  const minVal = Math.floor(Math.min(...data.readings.map((r) => r.value ?? 40)) - 2);
  const maxVal = Math.ceil(Math.max(...data.readings.map((r) => r.value ?? 60)) + 2);

  // Build unified chart data
  const chartData = allDates.filter((v, i, a) => a.indexOf(v) === i).map((date) => {
    const reading = merged.find((m) => m.date === date)?.reading ?? null;
    const monthly_avg = monthlyLine.find((m) => m.date === date)?.monthly_avg ?? null;
    return { date, reading, monthly_avg };
  });

  return (
    <ChartCard
      title="VO₂ Max"
      subtitle={
        reg
          ? `Trend: ${reg.trend} · R²=${reg.r_squared}`
          : "VO₂ Max over time"
      }
    >
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART.GRID_STROKE} strokeOpacity={CHART.GRID_OPACITY} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={fmtDate}
            tick={{ fill: CHART.TICK_FILL, fontSize: 11 }}
            axisLine={{ stroke: CHART.AXIS_STROKE }}
            tickLine={false}
            interval={Math.floor(chartData.length / 5)}
          />
          <YAxis
            tick={{ fill: CHART.TICK_FILL, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[minVal, maxVal]}
            width={40}
          />
          <Tooltip
            contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
            labelStyle={{ color: "#e5e7eb", fontSize: 12 }}
            itemStyle={{ color: "#d1d5db", fontSize: 12 }}
            labelFormatter={(l: unknown) => fmtDate(l as string)}
            formatter={(v: unknown, name: unknown) => [
              `${Number(v).toFixed(1)} mL/kg/min`,
              name === "reading" ? "Reading" : "Monthly avg",
            ]}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: CHART.TICK_FILL }} />
          <Scatter dataKey="reading" name="Reading" fill={CHART.ACCENT_INDIGO} opacity={0.8} />
          <Line dataKey="monthly_avg" name="Monthly avg" stroke={CHART.ACCENT_CYAN} strokeWidth={2.5} dot={false} connectNulls />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

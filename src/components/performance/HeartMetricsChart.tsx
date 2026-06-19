"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import ChartCard from "@/components/ui/ChartCard";
import { CHART } from "@/lib/chartTheme";
import type { WeeklyTrend } from "@/types/health";

const config: ChartConfig = {
  resting_hr_avg: { label: "Resting HR (bpm)", color: CHART.ACCENT_RED },
  hrv_avg: { label: "HRV (ms)", color: CHART.ACCENT_CYAN },
};

interface Props {
  data: WeeklyTrend[];
}

function fmt(d: string) {
  const dt = new Date(d);
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function HeartMetricsChart({ data }: Props) {
  const last26 = data.slice(-26);
  const hasHRV = last26.some((d) => d.hrv_avg !== null);

  return (
    <ChartCard
      title="Heart Rate & HRV"
      subtitle="Weekly average resting HR + HRV — last 26 weeks"
      fullWidth
    >
      <ChartContainer config={config} className="h-[260px] w-full">
        <LineChart data={last26} margin={{ top: 4, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid
            vertical={false}
            stroke={CHART.GRID_STROKE}
            strokeOpacity={CHART.GRID_OPACITY}
          />
          <XAxis
            dataKey="week_start"
            tickFormatter={fmt}
            tick={{ fontSize: 11, fill: CHART.TICK_FILL }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="hr"
            orientation="left"
            tick={{ fontSize: 11, fill: CHART.TICK_FILL }}
            tickLine={false}
            axisLine={false}
            domain={["auto", "auto"]}
            label={{ value: "bpm", angle: -90, position: "insideLeft", fill: CHART.TICK_FILL, fontSize: 10, dx: -4 }}
          />
          {hasHRV && (
            <YAxis
              yAxisId="hrv"
              orientation="right"
              tick={{ fontSize: 11, fill: CHART.TICK_FILL }}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              label={{ value: "ms", angle: 90, position: "insideRight", fill: CHART.TICK_FILL, fontSize: 10, dx: 4 }}
            />
          )}
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            yAxisId="hr"
            type="monotone"
            dataKey="resting_hr_avg"
            stroke={CHART.ACCENT_RED}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            connectNulls
          />
          {hasHRV && (
            <Line
              yAxisId="hrv"
              type="monotone"
              dataKey="hrv_avg"
              stroke={CHART.ACCENT_CYAN}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              connectNulls
            />
          )}
        </LineChart>
      </ChartContainer>
    </ChartCard>
  );
}

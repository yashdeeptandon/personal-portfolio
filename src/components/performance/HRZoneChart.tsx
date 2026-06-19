"use client";

import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import ChartCard from "@/components/ui/ChartCard";
import { CHART } from "@/lib/chartTheme";
import type { HRZone } from "@/types/health";

interface Props {
  data: HRZone[];
}

function buildConfig(zones: HRZone[]): ChartConfig {
  return Object.fromEntries(
    zones.map((z) => [z.zone, { label: z.zone, color: z.color }])
  );
}

export default function HRZoneChart({ data }: Props) {
  const config = buildConfig(data);

  return (
    <ChartCard
      title="Heart Rate Zones"
      subtitle="All-time % of readings in each zone"
    >
      <ChartContainer config={config} className="h-[240px] w-full">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 32, bottom: 0, left: 0 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: CHART.TICK_FILL }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="zone"
            tick={{ fontSize: 10, fill: CHART.TICK_FILL }}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            formatter={(v) => [`${v}%`, "% of readings"]}
          />
          <Bar dataKey="pct" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((entry) => (
              <Cell key={entry.zone} fill={entry.color} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}

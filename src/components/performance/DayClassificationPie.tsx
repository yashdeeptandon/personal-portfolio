"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import ChartCard from "@/components/ui/ChartCard";
import type { DailyActivity } from "@/types/health";
import { CHART } from "@/lib/chartTheme";

interface Props {
  data: DailyActivity[];
  stepThreshold?: number;
}

export default function DayClassificationPie({ data, stepThreshold = 7500 }: Props) {
  const active = data.filter((d) => (d.steps ?? 0) >= stepThreshold).length;
  const sedentary = data.filter((d) => (d.steps ?? 0) < 5000).length;
  const moderate = data.length - active - sedentary;

  const slices = [
    { name: `Active (≥${stepThreshold.toLocaleString()})`, value: active, color: CHART.ACCENT_GREEN },
    { name: "Moderate (5k–goal)", value: moderate, color: CHART.ACCENT_AMBER },
    { name: "Sedentary (<5,000)", value: sedentary, color: "#6b7280" },
  ].filter((s) => s.value > 0);

  return (
    <ChartCard title="Day Classification" subtitle={`${data.length} days · step goal ${stepThreshold.toLocaleString()}`}>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={slices}
            cx="50%"
            cy="45%"
            outerRadius={80}
            innerRadius={45}
            dataKey="value"
            paddingAngle={2}
          >
            {slices.map((s, i) => (
              <Cell key={i} fill={s.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
            itemStyle={{ color: "#d1d5db", fontSize: 12 }}
            formatter={(v: unknown) => { const n = Number(v); return [`${n} days (${Math.round(n / data.length * 100)}%)`]; }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: CHART.TICK_FILL }}
            formatter={(value) => <span style={{ color: CHART.TICK_FILL }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

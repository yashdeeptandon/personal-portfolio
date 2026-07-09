"use client";

import { ResponsiveContainer, LineChart, Line } from "recharts";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

/**
 * Minimal trend line — no axes, grid, or tooltip. For a per-row/per-card
 * "shape of the trend" signal, not a chart meant to be read precisely.
 */
export default function Sparkline({ data, color = "#6366f1", height = 28 }: SparklineProps) {
  const points = data.map((value, i) => ({ i, value }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={points} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

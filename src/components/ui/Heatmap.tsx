"use client";

import { useMemo } from "react";
import ChartCard from "./ChartCard";

export interface HeatmapDay {
  date: string;
  value: number;
}

interface HeatmapProps {
  title: string;
  subtitle?: string;
  data: HeatmapDay[];
  year: number;
  colorScale: (value: number) => string;
  legend?: { steps: number[]; less?: string; more?: string; hint?: string };
  action?: React.ReactNode;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const CELL = 12;
const GAP = 2;

/**
 * Generic GitHub-style contribution grid — generalized from
 * `src/components/performance/WorkoutHeatmap.tsx`'s grid-building math
 * (which was already source-agnostic, just hardcoded to a 4-step green
 * scale). Any {date, value}[] series works; callers own the color mapping.
 */
export default function Heatmap({
  title,
  subtitle,
  data,
  year,
  colorScale,
  legend,
  action,
}: HeatmapProps) {
  const { grid, monthLabels } = useMemo(() => {
    if (!data.length) return { grid: [], monthLabels: [] };

    const yearData = data.filter((d) => d.date.startsWith(String(year)));
    const byDate = new Map(yearData.map((d) => [d.date, d.value]));

    const now = new Date();
    const isCurrentYear = year === now.getUTCFullYear();
    const endDate = isCurrentYear ? now : new Date(`${year}-12-31T00:00:00Z`);

    const jan1 = new Date(`${year}-01-01T00:00:00Z`);
    const jan1Day = jan1.getUTCDay();
    const offsetToMon = jan1Day === 0 ? 6 : jan1Day - 1;
    const startDate = new Date(jan1);
    startDate.setUTCDate(jan1.getUTCDate() - offsetToMon);

    const weeks: { date: string; value: number }[][] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const week: { date: string; value: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const iso = current.toISOString().slice(0, 10);
        week.push({ date: iso, value: byDate.get(iso) ?? 0 });
        current.setUTCDate(current.getUTCDate() + 1);
        if (current > endDate && d < 6) {
          for (let p = d + 1; p < 7; p++) {
            week.push({ date: "", value: -1 });
          }
          break;
        }
      }
      if (week.length === 7) weeks.push(week);
      if (current > endDate) break;
    }

    const labels: { label: string; col: number }[] = [];
    weeks.forEach((week, col) => {
      const firstValid = week.find((c) => c.date && c.value >= 0);
      if (!firstValid) return;
      const monthDay = new Date(firstValid.date + "T00:00:00Z");
      if (monthDay.getUTCDate() <= 7) {
        labels.push({ label: MONTHS[monthDay.getUTCMonth()], col });
      }
    });

    return { grid: weeks, monthLabels: labels };
  }, [data, year]);

  return (
    <ChartCard title={title} subtitle={subtitle} action={action}>
      <div className="overflow-x-auto">
        <div className="flex ml-8" style={{ gap: GAP }}>
          {monthLabels.map((m, i) => {
            const prevCol = i > 0 ? monthLabels[i - 1].col : 0;
            const gap = i === 0 ? m.col : m.col - prevCol;
            return (
              <div
                key={`${m.label}-${m.col}`}
                style={{ marginLeft: i === 0 ? m.col * (CELL + GAP) : (gap - 1) * (CELL + GAP) }}
                className="text-[10px] text-gray-500 shrink-0"
              >
                {m.label}
              </div>
            );
          })}
        </div>

        <div className="flex mt-0.5" style={{ gap: GAP }}>
          <div className="flex flex-col shrink-0 mr-1" style={{ gap: GAP }}>
            {DAY_LABELS.map((d, i) => (
              <div key={d} style={{ height: CELL }} className="text-[10px] text-gray-600 leading-none flex items-center">
                {i % 2 === 0 ? d : ""}
              </div>
            ))}
          </div>

          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col shrink-0" style={{ gap: GAP }}>
              {week.map((cell, di) => (
                <div
                  key={`${cell.date}-${di}`}
                  style={{
                    width: CELL,
                    height: CELL,
                    backgroundColor: cell.value < 0 ? "transparent" : colorScale(cell.value),
                    borderRadius: 2,
                    opacity: cell.value < 0 ? 0 : 1,
                  }}
                  title={cell.date && cell.value >= 0 ? `${cell.date}: ${cell.value}` : undefined}
                />
              ))}
            </div>
          ))}
        </div>

        {legend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[10px] text-gray-500">{legend.less ?? "Less"}</span>
            {legend.steps.map((v) => (
              <div key={v} style={{ width: 10, height: 10, backgroundColor: colorScale(v), borderRadius: 2 }} />
            ))}
            <span className="text-[10px] text-gray-500">{legend.more ?? "More"}</span>
            {legend.hint && (
              <span className="text-[10px] text-gray-500 ml-3">{legend.hint}</span>
            )}
          </div>
        )}
      </div>
    </ChartCard>
  );
}

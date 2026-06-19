"use client";

import { useMemo } from "react";
import ChartCard from "@/components/ui/ChartCard";
import type { WorkoutCalendarDay } from "@/types/health";

interface Props {
  data: WorkoutCalendarDay[];
  year: number;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getColor(count: number) {
  if (count === 0) return "#1f2937";
  if (count === 1) return "#166534";
  if (count === 2) return "#16a34a";
  return "#22c55e";
}

export default function WorkoutHeatmap({ data, year }: Props) {
  const { grid, monthLabels, totalWorkouts, activeDays } = useMemo(() => {
    if (!data.length) return { grid: [], monthLabels: [], totalWorkouts: 0, activeDays: 0 };

    // Filter to selected year
    const yearData = data.filter((d) => d.year === year);
    const byDate = new Map(yearData.map((d) => [d.date, d.count]));

    // Build grid from Jan 1 to Dec 31 of the year (or today for current year)
    const now = new Date();
    const isCurrentYear = year === now.getUTCFullYear();
    const endDate = isCurrentYear ? now : new Date(`${year}-12-31T00:00:00Z`);

    // Find Monday of the week containing Jan 1
    const jan1 = new Date(`${year}-01-01T00:00:00Z`);
    const jan1Day = jan1.getUTCDay();
    const offsetToMon = jan1Day === 0 ? 6 : jan1Day - 1;
    const startDate = new Date(jan1);
    startDate.setUTCDate(jan1.getUTCDate() - offsetToMon);

    const weeks: { date: string; count: number }[][] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const week: { date: string; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const iso = current.toISOString().slice(0, 10);
        week.push({ date: iso, count: byDate.get(iso) ?? 0 });
        current.setUTCDate(current.getUTCDate() + 1);
        if (current > endDate && d < 6) {
          // Pad remaining days
          for (let p = d + 1; p < 7; p++) {
            week.push({ date: "", count: -1 }); // -1 = outside range
          }
          break;
        }
      }
      if (week.length === 7) weeks.push(week);
      if (current > endDate) break;
    }

    // Month labels
    const labels: { label: string; col: number }[] = [];
    weeks.forEach((week, col) => {
      const firstValid = week.find((c) => c.date && c.count >= 0);
      if (!firstValid) return;
      const monthDay = new Date(firstValid.date + "T00:00:00Z");
      if (monthDay.getUTCDate() <= 7) {
        labels.push({ label: MONTHS[monthDay.getUTCMonth()], col });
      }
    });

    const totalWorkouts = yearData.reduce((s, d) => s + d.count, 0);
    const activeDays = yearData.filter((d) => d.count > 0).length;

    return { grid: weeks, monthLabels: labels, totalWorkouts, activeDays };
  }, [data, year]);

  const CELL = 12;
  const GAP = 2;

  return (
    <ChartCard
      title="Workout Calendar"
      subtitle={`${year} · ${totalWorkouts} workouts · ${activeDays} active days`}
    >
      <div className="overflow-x-auto">
        {/* Month labels */}
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
          {/* Day labels */}
          <div className="flex flex-col shrink-0 mr-1" style={{ gap: GAP }}>
            {DAY_LABELS.map((d, i) => (
              <div key={d} style={{ height: CELL }} className="text-[10px] text-gray-600 leading-none flex items-center">
                {i % 2 === 0 ? d : ""}
              </div>
            ))}
          </div>

          {/* Grid */}
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col shrink-0" style={{ gap: GAP }}>
              {week.map((cell, di) => (
                <div
                  key={`${cell.date}-${di}`}
                  style={{
                    width: CELL,
                    height: CELL,
                    backgroundColor: cell.count < 0 ? "transparent" : getColor(cell.count),
                    borderRadius: 2,
                    opacity: cell.count < 0 ? 0 : 1,
                  }}
                  title={cell.date && cell.count >= 0 ? `${cell.date}: ${cell.count} workout${cell.count !== 1 ? "s" : ""}` : undefined}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-[10px] text-gray-500">Less</span>
          {[0, 1, 2, 3].map((v) => (
            <div key={v} style={{ width: 10, height: 10, backgroundColor: getColor(v), borderRadius: 2 }} />
          ))}
          <span className="text-[10px] text-gray-500">More</span>
          <span className="text-[10px] text-gray-500 ml-3">
            Use "Heatmap year" filter above to switch year
          </span>
        </div>
      </div>
    </ChartCard>
  );
}

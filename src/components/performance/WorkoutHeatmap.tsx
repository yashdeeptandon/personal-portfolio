"use client";

import { useMemo } from "react";
import ChartCard from "@/components/ui/ChartCard";
import type { WorkoutCalendarDay } from "@/types/health";

interface Props {
  data: WorkoutCalendarDay[];
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getColor(count: number) {
  if (count === 0) return "#1f2937";
  if (count === 1) return "#166534";
  if (count === 2) return "#16a34a";
  return "#22c55e";
}

export default function WorkoutHeatmap({ data }: Props) {
  const { grid, monthLabels } = useMemo(() => {
    if (!data.length) return { grid: [], monthLabels: [] };

    // Last 52 weeks
    const last = new Date(data[data.length - 1].date + "T00:00:00Z");
    const cutoff = new Date(last);
    cutoff.setUTCDate(cutoff.getUTCDate() - 52 * 7);

    const recent = data.filter((d) => new Date(d.date + "T00:00:00Z") >= cutoff);
    const byDate = new Map(recent.map((d) => [d.date, d.count]));

    // Build 7×52 grid (row = day of week Mon-Sun, col = week)
    const startDate = new Date(cutoff);
    // Align to Monday
    const startDay = startDate.getUTCDay();
    const offsetToMon = startDay === 0 ? 6 : startDay - 1;
    startDate.setUTCDate(startDate.getUTCDate() - offsetToMon);

    const weeks: { date: string; count: number }[][] = [];
    let current = new Date(startDate);

    for (let w = 0; w < 53; w++) {
      const week: { date: string; count: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const iso = current.toISOString().slice(0, 10);
        week.push({ date: iso, count: byDate.get(iso) ?? 0 });
        current.setUTCDate(current.getUTCDate() + 1);
      }
      weeks.push(week);
    }

    // Month label positions
    const labels: { label: string; col: number }[] = [];
    weeks.forEach((week, col) => {
      const monthDay = new Date(week[0].date + "T00:00:00Z");
      if (monthDay.getUTCDate() <= 7) {
        labels.push({ label: MONTHS[monthDay.getUTCMonth()], col });
      }
    });

    return { grid: weeks, monthLabels: labels };
  }, [data]);

  const CELL = 12;
  const GAP = 2;

  return (
    <ChartCard title="Workout Calendar" subtitle="GitHub-style heatmap — each cell = one day">
      <div className="overflow-x-auto">
        <div className="flex gap-1 items-end mb-1">
          {monthLabels.map((m) => (
            <div
              key={`${m.label}-${m.col}`}
              style={{ marginLeft: m.col === 0 ? 0 : (m.col - (monthLabels.find((x) => x.label === m.label)?.col ?? 0)) * (CELL + GAP) }}
              className="text-[10px] text-gray-500 shrink-0"
            >
              {m.label}
            </div>
          ))}
        </div>

        <div className="flex gap-0.5">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1">
            {DAY_LABELS.map((d, i) => (
              <div key={d} style={{ height: CELL }} className="text-[10px] text-gray-600 leading-none flex items-center">
                {i % 2 === 0 ? d : ""}
              </div>
            ))}
          </div>

          {/* Grid */}
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((cell) => (
                <div
                  key={cell.date}
                  style={{ width: CELL, height: CELL, backgroundColor: getColor(cell.count), borderRadius: 2 }}
                  title={`${cell.date}: ${cell.count} workout${cell.count !== 1 ? "s" : ""}`}
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
        </div>
      </div>
    </ChartCard>
  );
}

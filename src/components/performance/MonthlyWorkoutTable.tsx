"use client";

import { useState } from "react";
import ChartCard from "@/components/ui/ChartCard";
import type { WorkoutsDetail } from "@/types/health";

interface Props {
  data: WorkoutsDetail | null;
}

export default function MonthlyWorkoutTable({ data }: Props) {
  const [showAll, setShowAll] = useState(false);
  if (!data) return null;

  const rows = [...data.monthly_summary].reverse();
  const display = showAll ? rows : rows.slice(0, 12);

  return (
    <ChartCard title="Monthly Workout Summary" subtitle="All workout activity grouped by month">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-white/10">
              <th className="pb-2 text-left font-medium">Month</th>
              <th className="pb-2 text-right font-medium">Days</th>
              <th className="pb-2 text-right font-medium">Sessions</th>
              <th className="pb-2 text-right font-medium">Total Min</th>
              <th className="pb-2 text-right font-medium">Calories</th>
              <th className="pb-2 text-right font-medium">Avg HR</th>
            </tr>
          </thead>
          <tbody>
            {display.map((row) => (
              <tr key={row.month} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-1.5 text-gray-300 font-medium">{row.month}</td>
                <td className="py-1.5 text-right text-gray-400">{row.workout_days}</td>
                <td className="py-1.5 text-right text-gray-400">{row.total_workouts}</td>
                <td className="py-1.5 text-right text-gray-400">{row.total_min?.toLocaleString() ?? "—"}</td>
                <td className="py-1.5 text-right text-gray-400">{row.total_cal?.toLocaleString() ?? "—"}</td>
                <td className="py-1.5 text-right text-gray-400">{row.avg_hr ? `${row.avg_hr} bpm` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length > 12 && (
          <button
            onClick={() => setShowAll((s) => !s)}
            className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {showAll ? "Show less" : `Show all ${rows.length} months`}
          </button>
        )}
      </div>
    </ChartCard>
  );
}

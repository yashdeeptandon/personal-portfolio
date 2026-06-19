"use client";

import ChartCard from "@/components/ui/ChartCard";
import type { WorkoutsDetail } from "@/types/health";

interface Props {
  data: WorkoutsDetail | null;
}

const ICONS: Record<string, string> = {
  longest_workout: "⏱",
  most_calories: "🔥",
  longest_distance: "📏",
  peak_heart_rate_workout: "❤️",
};

const LABELS: Record<string, string> = {
  longest_workout: "Longest Workout",
  most_calories: "Most Calories",
  longest_distance: "Longest Distance",
  peak_heart_rate_workout: "Peak Heart Rate",
};

const FORMATS: Record<string, (v: number, unit: string) => string> = {
  longest_workout: (v) => `${Math.round(v)} min`,
  most_calories: (v) => `${Math.round(v).toLocaleString()} kcal`,
  longest_distance: (v, unit) => `${v.toFixed(2)} ${unit}`,
  peak_heart_rate_workout: (v) => `${Math.round(v)} bpm`,
};

export default function PersonalBestsTable({ data }: Props) {
  if (!data) return null;
  const bests = data.personal_bests;
  const keys = Object.keys(LABELS).filter((k) => bests[k as keyof typeof bests]);

  return (
    <ChartCard title="Personal Bests" subtitle="All-time records from Apple Watch workouts">
      <div className="space-y-3 py-2">
        {keys.map((key) => {
          const pb = bests[key as keyof typeof bests]!;
          const fmt = FORMATS[key] ?? ((v: number, u: string) => `${v} ${u}`);
          return (
            <div key={key} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <span className="text-2xl shrink-0">{ICONS[key]}</span>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-gray-400">{LABELS[key]}</div>
                <div className="text-white font-semibold text-sm mt-0.5">
                  {fmt(pb.value, pb.unit)}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {pb.type} · {new Date(pb.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}

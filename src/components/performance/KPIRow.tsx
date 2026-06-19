"use client";

import StatCard from "@/components/ui/StatCard";
import type { HealthKPIs } from "@/types/health";
import { CHART } from "@/lib/chartTheme";

interface KPIRowProps {
  kpis: HealthKPIs;
}

const FootprintIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
  </svg>
);

const FlameIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const RunIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
  </svg>
);

const VO2Icon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M17.5 12c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zm0 5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM20 3h-1V1h-2v2H7V1H5v2H4C2.9 3 2 3.9 2 5v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/>
  </svg>
);

const StreakIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
  </svg>
);

const kpis = (data: HealthKPIs) => [
  {
    label: "Avg Steps/Day",
    value: data.avg_steps_per_day,
    suffix: "",
    decimals: 0,
    icon: <FootprintIcon />,
    accent: CHART.ACCENT_INDIGO,
    sub: "All-time daily average",
  },
  {
    label: "Active Cal/Day",
    value: data.avg_active_calories_per_day,
    suffix: " kcal",
    decimals: 0,
    icon: <FlameIcon />,
    accent: CHART.ACCENT_AMBER,
    sub: "All-time daily average",
  },
  {
    label: "Total Workouts",
    value: data.total_workouts,
    suffix: "",
    decimals: 0,
    icon: <RunIcon />,
    accent: CHART.ACCENT_GREEN,
    sub: `${data.workout_days_this_month} this month`,
  },
  {
    label: "Current Streak",
    value: data.current_streak_days,
    suffix: " days",
    decimals: 0,
    icon: <StreakIcon />,
    accent: CHART.ACCENT_AMBER,
    sub: `Longest: ${data.longest_streak_days} days`,
  },
  {
    label: "VO₂ Max",
    value: data.latest_vo2max,
    suffix: "",
    decimals: 1,
    icon: <VO2Icon />,
    accent: CHART.ACCENT_CYAN,
    sub: "ml/kg/min — latest reading",
  },
  {
    label: "Consistency",
    value: data.consistency_score,
    suffix: "/100",
    decimals: 0,
    icon: <HeartIcon />,
    accent: CHART.ACCENT_INDIGO,
    sub: "30-day composite score",
  },
];

export default function KPIRow({ kpis: data }: KPIRowProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {kpis(data).map((k) => (
        <StatCard key={k.label} {...k} />
      ))}
    </div>
  );
}

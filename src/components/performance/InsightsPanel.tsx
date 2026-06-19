"use client";

import type { HealthKPIs } from "@/types/health";

interface Insight {
  text: string;
  color: "green" | "amber" | "red" | "indigo";
}

function buildInsights(kpis: HealthKPIs): Insight[] {
  const insights: Insight[] = [];

  // Steps
  if (kpis.avg_steps_per_day !== null) {
    const steps = kpis.avg_steps_per_day;
    if (steps >= 10000) {
      insights.push({ text: `Averaging ${steps.toLocaleString()} steps/day — exceeding the 10,000 step benchmark.`, color: "green" });
    } else if (steps >= 7500) {
      insights.push({ text: `Averaging ${steps.toLocaleString()} steps/day — solid active baseline.`, color: "indigo" });
    } else {
      insights.push({ text: `Averaging ${steps.toLocaleString()} steps/day — room to increase daily movement.`, color: "amber" });
    }
  }

  // Streak
  if (kpis.current_streak_days > 0) {
    const msg =
      kpis.current_streak_days >= 14
        ? `On a ${kpis.current_streak_days}-day training streak — elite consistency.`
        : `${kpis.current_streak_days}-day active streak. Longest ever: ${kpis.longest_streak_days} days.`;
    insights.push({ text: msg, color: kpis.current_streak_days >= 14 ? "green" : "indigo" });
  }

  // VO2 Max
  if (kpis.latest_vo2max !== null) {
    const vo2 = kpis.latest_vo2max;
    const level =
      vo2 >= 55 ? "Superior" : vo2 >= 48 ? "Excellent" : vo2 >= 42 ? "Good" : "Average";
    const col = vo2 >= 55 ? "green" : vo2 >= 48 ? "green" : vo2 >= 42 ? "indigo" : "amber";
    insights.push({
      text: `VO₂ Max: ${vo2.toFixed(1)} ml/kg/min — ${level} aerobic capacity for your age group.`,
      color: col as Insight["color"],
    });
  }

  // Recovery
  if (kpis.recovery_score_avg_30d !== null) {
    const rec = kpis.recovery_score_avg_30d;
    if (rec >= 70) {
      insights.push({ text: `30-day recovery score: ${rec.toFixed(0)}/100 — body is adapting well to training load.`, color: "green" });
    } else if (rec >= 40) {
      insights.push({ text: `30-day recovery score: ${rec.toFixed(0)}/100 — moderate. Consider adding a rest day.`, color: "amber" });
    } else {
      insights.push({ text: `30-day recovery score: ${rec.toFixed(0)}/100 — signs of accumulated fatigue. Prioritise recovery.`, color: "red" });
    }
  }

  // Resting HR trend
  if (kpis.resting_hr_avg_30d !== null) {
    const rhr = kpis.resting_hr_avg_30d;
    const level = rhr <= 55 ? "athlete-range" : rhr <= 65 ? "healthy" : "elevated";
    insights.push({
      text: `30-day resting HR: ${rhr.toFixed(0)} bpm — ${level}.`,
      color: rhr <= 55 ? "green" : rhr <= 65 ? "indigo" : "amber",
    });
  }

  // Consistency score
  if (kpis.consistency_score !== null) {
    const cs = kpis.consistency_score;
    if (cs >= 70) {
      insights.push({ text: `Consistency score: ${cs.toFixed(0)}/100 — top-tier adherence over the past 30 days.`, color: "green" });
    } else if (cs >= 40) {
      insights.push({ text: `Consistency score: ${cs.toFixed(0)}/100 — building discipline. Keep the momentum.`, color: "indigo" });
    } else {
      insights.push({ text: `Consistency score: ${cs.toFixed(0)}/100 — focus on weekly habit stacking.`, color: "amber" });
    }
  }

  return insights;
}

const borderColor: Record<Insight["color"], string> = {
  green: "border-green-500",
  amber: "border-amber-400",
  red: "border-red-500",
  indigo: "border-indigo-500",
};

const dotColor: Record<Insight["color"], string> = {
  green: "bg-green-500",
  amber: "bg-amber-400",
  red: "bg-red-500",
  indigo: "bg-indigo-500",
};

interface Props {
  kpis: HealthKPIs;
}

export default function InsightsPanel({ kpis }: Props) {
  const insights = buildInsights(kpis);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
      <h3 className="text-sm font-semibold text-white tracking-wide mb-4">
        Automated Insights
      </h3>
      <div className="grid sm:grid-cols-2 gap-3">
        {insights.map((ins, i) => (
          <div
            key={i}
            className={`flex gap-3 items-start rounded-lg border-l-2 ${borderColor[ins.color]} bg-white/3 px-3 py-2.5`}
          >
            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dotColor[ins.color]}`} />
            <p className="text-sm text-gray-300 leading-snug">{ins.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

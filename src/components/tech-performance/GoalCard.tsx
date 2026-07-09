"use client";

import ProgressBar from "@/components/ui/ProgressBar";
import { CHART } from "@/lib/chartTheme";
import type { GoalWithProgress } from "@/types/techPerformance";

const PERIOD_LABEL: Record<string, string> = {
  daily: "today",
  weekly: "this week",
  monthly: "this month",
  yearly: "this year",
  once: "overall",
};

export default function GoalCard({
  goal,
  isAdmin,
  onDelete,
}: {
  goal: GoalWithProgress;
  isAdmin: boolean;
  onDelete?: () => void;
}) {
  const complete = goal.pct >= 100;

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-gray-200">{goal.label}</p>
          <p className="text-xs text-gray-500">{PERIOD_LABEL[goal.period] ?? goal.period}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs tabular-nums text-gray-400">
            {goal.current}/{goal.target} {goal.unit}
          </span>
          {isAdmin && onDelete && (
            <button
              onClick={onDelete}
              aria-label={`Delete goal ${goal.label}`}
              className="text-gray-600 hover:text-red-400 transition-colors text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <ProgressBar
        value={goal.pct}
        height={6}
        trackClassName="bg-white/5"
        fillColor={complete ? CHART.ACCENT_GREEN : CHART.ACCENT_INDIGO}
      />
      {goal.description && (
        <p className="text-xs text-gray-500">{goal.description}</p>
      )}
    </div>
  );
}

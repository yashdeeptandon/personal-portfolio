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
    <div className="rounded-lg border border-foreground/10 bg-foreground/[0.03] p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">{goal.label}</p>
          <p className="text-xs text-muted-foreground">{PERIOD_LABEL[goal.period] ?? goal.period}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs tabular-nums text-muted-foreground">
            {goal.current}/{goal.target} {goal.unit}
          </span>
          {isAdmin && onDelete && (
            <button
              onClick={onDelete}
              aria-label={`Delete goal ${goal.label}`}
              className="text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <ProgressBar
        value={goal.pct}
        height={6}
        trackClassName="bg-foreground/5"
        fillColor={complete ? CHART.ACCENT_GREEN : CHART.ACCENT_INDIGO}
      />
      {goal.description && (
        <p className="text-xs text-muted-foreground">{goal.description}</p>
      )}
    </div>
  );
}

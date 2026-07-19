"use client";

import { useCallback, useEffect, useState } from "react";
import ChartCard from "@/components/ui/ChartCard";
import GoalCard from "./GoalCard";
import type { GoalWithProgress } from "@/types/techPerformance";

const METRIC_OPTIONS = [
  { value: "coding_hours", label: "Coding hours", unit: "h" },
  { value: "github_contributions", label: "GitHub contributions", unit: "contributions" },
  { value: "prs_merged", label: "PRs merged", unit: "PRs" },
  { value: "oss_contributions", label: "OSS repos contributed to", unit: "repos" },
  { value: "blog_posts", label: "Blog posts published", unit: "posts" },
  { value: "projects_shipped", label: "Projects shipped", unit: "projects" },
  { value: "custom", label: "Custom (manually tracked)", unit: "" },
] as const;

const PERIOD_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "once", label: "One-time" },
] as const;

function slugify(label: string): string {
  return label.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function AddGoalForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [metric, setMetric] = useState<(typeof METRIC_OPTIONS)[number]["value"]>("coding_hours");
  const [period, setPeriod] = useState<(typeof PERIOD_OPTIONS)[number]["value"]>("weekly");
  const [target, setTarget] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const unit = METRIC_OPTIONS.find((m) => m.value === metric)?.unit ?? "";
      const res = await fetch("/api/admin/tech-performance/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: `${slugify(label)}-${Date.now().toString(36)}`,
          label,
          metric,
          period,
          target,
          unit,
          startDate: new Date().toISOString(),
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.message || "Failed to create goal");

      setOpen(false);
      setLabel("");
      setTarget(10);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create goal");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
      >
        + Add goal
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-foreground/10 bg-foreground/3 p-3 space-y-2">
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Goal label, e.g. Weekly coding hours"
        className="w-full bg-foreground/5 border border-foreground/10 rounded-md px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-indigo-500"
      />
      <div className="flex flex-wrap gap-2">
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value as typeof metric)}
          className="bg-foreground/5 border border-foreground/10 rounded-md px-2 py-1.5 text-xs text-foreground/80"
        >
          {METRIC_OPTIONS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as typeof period)}
          className="bg-foreground/5 border border-foreground/10 rounded-md px-2 py-1.5 text-xs text-foreground/80"
        >
          {PERIOD_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          className="w-20 bg-foreground/5 border border-foreground/10 rounded-md px-2 py-1.5 text-xs text-foreground/80"
        />
      </div>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          onClick={submit}
          disabled={submitting || !label.trim()}
          className="text-xs bg-indigo-500 text-white px-3 py-1.5 rounded-md disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create"}
        </button>
        <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function GoalsSection({ isAdmin }: { isAdmin: boolean }) {
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tech-performance/goals");
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.message || "Failed to load goals");
      setGoals((body.data.goals as GoalWithProgress[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load goals");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const deleteGoal = async (id: string) => {
    await fetch(`/api/admin/tech-performance/goals/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <ChartCard
      title="Goals & Progress"
      subtitle="Configurable targets tracked from real activity"
      action={isAdmin ? <AddGoalForm onCreated={load} /> : undefined}
      fullWidth
    >
      {isLoading && (
        <div className="grid sm:grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-foreground/5 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && error && <p className="text-sm text-red-600 dark:text-red-400 text-center py-6">{error}</p>}

      {!isLoading && !error && goals.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">
          {isAdmin ? "No goals configured yet — add one above." : "No goals configured yet."}
        </p>
      )}

      {!isLoading && !error && goals.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isAdmin={isAdmin}
              onDelete={() => deleteGoal(goal.id)}
            />
          ))}
        </div>
      )}
    </ChartCard>
  );
}

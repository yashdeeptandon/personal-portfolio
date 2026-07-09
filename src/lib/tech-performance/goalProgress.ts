import dbConnect from "@/lib/db/connection";
import ActivityEvent from "@/models/ActivityEvent";
import TechSnapshot from "@/models/TechSnapshot";
import type { ITechGoal } from "@/models/TechGoal";
import type {
  GitHubContributionsData,
  GitHubOssContributionsData,
  WakaTimeActivityData,
} from "@/types/techPerformance";

function windowStartFor(goal: Pick<ITechGoal, "period">, now: Date): Date | null {
  const start = new Date(now);
  switch (goal.period) {
    case "daily":
      start.setHours(0, 0, 0, 0);
      return start;
    case "weekly":
      start.setDate(start.getDate() - 6);
      return start;
    case "monthly":
      start.setDate(start.getDate() - 29);
      return start;
    case "yearly":
      start.setDate(start.getDate() - 364);
      return start;
    case "once":
      return null; // counts since the goal's own startDate, handled by caller
  }
}

export interface GoalProgress {
  current: number;
  pct: number;
}

export type GoalProgressInput = Pick<
  ITechGoal,
  "metric" | "period" | "target" | "startDate"
>;

/**
 * Computed at request time from already-cached TechSnapshot/ActivityEvent
 * data (local Mongo reads, not upstream calls) — a stored `currentValue`
 * would just be a second staleness clock to keep in sync with the first,
 * for no benefit.
 */
export async function computeGoalProgress(
  goal: GoalProgressInput
): Promise<GoalProgress> {
  await dbConnect();

  const now = new Date();
  const windowStart = goal.period === "once" ? goal.startDate : windowStartFor(goal, now);

  let current = 0;

  switch (goal.metric) {
    case "coding_hours": {
      const doc = await TechSnapshot.findOne({ type: "wakatime:activity" }).lean();
      const days = (doc?.data as WakaTimeActivityData | undefined)?.days ?? [];
      const seconds = days
        .filter((d) => !windowStart || d.date >= windowStart.toISOString().slice(0, 10))
        .reduce((sum, d) => sum + d.totalSeconds, 0);
      current = Math.round((seconds / 3600) * 10) / 10;
      break;
    }
    case "github_contributions": {
      const doc = await TechSnapshot.findOne({ type: "github:contributions" }).lean();
      const calendar = (doc?.data as GitHubContributionsData | undefined)?.calendar ?? [];
      current = calendar
        .filter((d) => !windowStart || d.date >= windowStart.toISOString().slice(0, 10))
        .reduce((sum, d) => sum + d.count, 0);
      break;
    }
    case "prs_merged": {
      current = await ActivityEvent.countDocuments({
        provider: "github",
        type: "pull_request",
        "metadata.action": "merged",
        ...(windowStart ? { timestamp: { $gte: windowStart } } : {}),
      });
      break;
    }
    case "oss_contributions": {
      const doc = await TechSnapshot.findOne({ type: "github:oss-contributions" }).lean();
      current = (doc?.data as GitHubOssContributionsData | undefined)?.repos?.length ?? 0;
      break;
    }
    case "blog_posts": {
      current = await ActivityEvent.countDocuments({
        provider: "blog",
        type: "post_published",
        ...(windowStart ? { timestamp: { $gte: windowStart } } : {}),
      });
      break;
    }
    case "projects_shipped": {
      current = await ActivityEvent.countDocuments({
        provider: "projects",
        type: "milestone",
        title: { $regex: "^Shipped " },
        ...(windowStart ? { timestamp: { $gte: windowStart } } : {}),
      });
      break;
    }
    case "leetcode_solved": {
      current = 0; // LeetCode integration not shipped yet (deferred follow-up)
      break;
    }
    case "custom": {
      current = 0; // no auto-computable source — admin-tracked via target/description only
      break;
    }
  }

  const pct = goal.target > 0 ? Math.min(100, Math.round((current / goal.target) * 100)) : 0;
  return { current, pct };
}

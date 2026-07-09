import dbConnect from "@/lib/db/connection";
import TechGoal from "@/models/TechGoal";
import { computeGoalProgress } from "../goalProgress";

export async function getGoalsSection() {
  await dbConnect();

  const goals = await TechGoal.find({ active: true }).sort({ order: 1 }).lean();

  const withProgress = await Promise.all(
    goals.map(async (goal) => {
      const { current, pct } = await computeGoalProgress(goal);
      return {
        id: String(goal._id),
        key: goal.key,
        label: goal.label,
        metric: goal.metric,
        period: goal.period,
        target: goal.target,
        unit: goal.unit,
        description: goal.description ?? null,
        current,
        pct,
      };
    })
  );

  return { goals: withProgress };
}

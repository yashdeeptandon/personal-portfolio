import mongoose, { Schema, Document, Model } from "mongoose";

export type TechGoalMetric =
  | "coding_hours"
  | "github_contributions"
  | "prs_merged"
  | "leetcode_solved"
  | "oss_contributions"
  | "blog_posts"
  | "projects_shipped"
  | "custom";

export type TechGoalPeriod = "daily" | "weekly" | "monthly" | "yearly" | "once";

export interface ITechGoal extends Document {
  key: string;
  label: string;
  metric: TechGoalMetric;
  period: TechGoalPeriod;
  target: number;
  unit: string;
  startDate: Date;
  active: boolean;
  order: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TechGoalSchema = new Schema<ITechGoal>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    label: {
      type: String,
      required: true,
    },
    metric: {
      type: String,
      enum: [
        "coding_hours",
        "github_contributions",
        "prs_merged",
        "leetcode_solved",
        "oss_contributions",
        "blog_posts",
        "projects_shipped",
        "custom",
      ],
      required: true,
    },
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly", "once"],
      required: true,
    },
    target: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

TechGoalSchema.index({ active: 1, order: 1 });

const TechGoal: Model<ITechGoal> =
  mongoose.models.TechGoal ||
  mongoose.model<ITechGoal>("TechGoal", TechGoalSchema);

export default TechGoal;

import mongoose, { Schema, Document, Model } from "mongoose";

export type ActivityProvider =
  | "github"
  | "wakatime"
  | "leetcode"
  | "blog"
  | "projects"
  | "manual";

export type ActivityVisibility = "public" | "private";

export interface IActivityEvent extends Document {
  provider: ActivityProvider;
  type: string;
  timestamp: Date;
  title: string;
  description?: string;
  url?: string;
  externalId: string;
  metadata?: Record<string, unknown>;
  visibility: ActivityVisibility;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityEventSchema = new Schema<IActivityEvent>(
  {
    provider: {
      type: String,
      enum: ["github", "wakatime", "leetcode", "blog", "projects", "manual"],
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    url: {
      type: String,
    },
    externalId: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
  },
  { timestamps: true }
);

ActivityEventSchema.index(
  { provider: 1, type: 1, externalId: 1 },
  { unique: true }
);
ActivityEventSchema.index({ timestamp: -1 });
ActivityEventSchema.index({ provider: 1, timestamp: -1 });

const ActivityEvent: Model<IActivityEvent> =
  mongoose.models.ActivityEvent ||
  mongoose.model<IActivityEvent>("ActivityEvent", ActivityEventSchema);

export default ActivityEvent;

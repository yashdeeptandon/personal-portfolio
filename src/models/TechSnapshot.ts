import mongoose, { Schema, Document, Model } from "mongoose";

export type TechSnapshotSource = "live" | "manual";
export type TechSnapshotStatus = "ok" | "stale" | "error" | "unconfigured";

export interface ITechSnapshot extends Document {
  type: string;
  provider: string;
  data: Record<string, unknown>;
  source: TechSnapshotSource;
  status: TechSnapshotStatus;
  fetchedAt: Date | null;
  staleAt: Date | null;
  lastAttemptAt: Date | null;
  lastError?: string;
  lastErrorAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TechSnapshotSchema = new Schema<ITechSnapshot>(
  {
    type: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    source: {
      type: String,
      enum: ["live", "manual"],
      default: "live",
    },
    status: {
      type: String,
      enum: ["ok", "stale", "error", "unconfigured"],
      default: "unconfigured",
      index: true,
    },
    fetchedAt: {
      type: Date,
      default: null,
    },
    staleAt: {
      type: Date,
      default: null,
    },
    lastAttemptAt: {
      type: Date,
      default: null,
    },
    lastError: {
      type: String,
    },
    lastErrorAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const TechSnapshot: Model<ITechSnapshot> =
  mongoose.models.TechSnapshot ||
  mongoose.model<ITechSnapshot>("TechSnapshot", TechSnapshotSchema);

export default TechSnapshot;

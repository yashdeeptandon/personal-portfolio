import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHealthData extends Document {
  type: string;
  data: Record<string, unknown>;
  dataTo: Date | null;
  updatedAt: Date;
}

const HealthDataSchema = new Schema<IHealthData>(
  {
    type: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    dataTo: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const HealthData: Model<IHealthData> =
  mongoose.models.HealthData ||
  mongoose.model<IHealthData>("HealthData", HealthDataSchema);

export default HealthData;

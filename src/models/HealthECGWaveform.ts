import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHealthECGWaveform extends Document {
  recordingId: string;
  sampleRateHz: number;
  voltageUv: number[];
  updatedAt: Date;
}

const HealthECGWaveformSchema = new Schema<IHealthECGWaveform>(
  {
    recordingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sampleRateHz: {
      type: Number,
      required: true,
      default: 512,
    },
    voltageUv: {
      type: [Number],
      required: true,
    },
  },
  { timestamps: true }
);

const HealthECGWaveform: Model<IHealthECGWaveform> =
  mongoose.models.HealthECGWaveform ||
  mongoose.model<IHealthECGWaveform>(
    "HealthECGWaveform",
    HealthECGWaveformSchema
  );

export default HealthECGWaveform;

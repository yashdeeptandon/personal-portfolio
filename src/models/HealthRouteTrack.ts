import mongoose, { Schema, Document, Model } from "mongoose";

export interface RouteTrackPoint {
  lat: number;
  lon: number;
  ele: number | null;
  speed_kmh: number | null;
}

export interface IHealthRouteTrack extends Document {
  routeId: string;
  points: RouteTrackPoint[];
  updatedAt: Date;
}

const HealthRouteTrackSchema = new Schema<IHealthRouteTrack>(
  {
    routeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    points: [
      {
        lat: Number,
        lon: Number,
        ele: { type: Number, default: null },
        speed_kmh: { type: Number, default: null },
      },
    ],
  },
  { timestamps: true }
);

const HealthRouteTrack: Model<IHealthRouteTrack> =
  mongoose.models.HealthRouteTrack ||
  mongoose.model<IHealthRouteTrack>("HealthRouteTrack", HealthRouteTrackSchema);

export default HealthRouteTrack;

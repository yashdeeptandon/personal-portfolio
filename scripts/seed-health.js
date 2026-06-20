/**
 * Seed MongoDB health data from existing /public/health-data/ JSON files.
 * Run: node scripts/seed-health.js
 * (requires MONGODB_URI in .env.local or environment)
 */

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { config } = require("dotenv");

config({ path: path.join(__dirname, "../.env.local") });

const DATASETS = {
  meta: "meta.json",
  kpis: "kpis.json",
  weekly_trends: "weekly_trends.json",
  monthly_summary: "monthly_summary.json",
  hr_zones: "hr_zones.json",
  workout_types: "workout_types.json",
  daily_activity: "daily_activity.json",
  daily_heart: "daily_heart.json",
  vo2max: "vo2max.json",
  training_load_detail: "training_load_detail.json",
  workouts_detail: "workouts_detail.json",
  workout_calendar: "workout_calendar.json",
  activity_rings_detail: "activity_rings_detail.json",
  routes_summary: "routes_summary.json",
  ecg_summary: "ecg_summary.json",
};

const HealthDataSchema = new mongoose.Schema(
  { type: { type: String, unique: true }, data: mongoose.Mixed, dataTo: Date },
  { timestamps: true }
);
const HealthRouteTrackSchema = new mongoose.Schema(
  { routeId: { type: String, unique: true }, points: [{ lat: Number, lon: Number, ele: Number, speed_kmh: Number }] },
  { timestamps: true }
);
const HealthECGWaveformSchema = new mongoose.Schema(
  { recordingId: { type: String, unique: true }, sampleRateHz: Number, voltageUv: [Number] },
  { timestamps: true }
);

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const HealthData = mongoose.models.HealthData || mongoose.model("HealthData", HealthDataSchema);
  const HealthRouteTrack = mongoose.models.HealthRouteTrack || mongoose.model("HealthRouteTrack", HealthRouteTrackSchema);
  const HealthECGWaveform = mongoose.models.HealthECGWaveform || mongoose.model("HealthECGWaveform", HealthECGWaveformSchema);

  const base = path.join(__dirname, "../public/health-data");

  // Seed core datasets
  for (const [type, file] of Object.entries(DATASETS)) {
    const filePath = path.join(base, file);
    if (!fs.existsSync(filePath)) { console.warn(`SKIP ${file} (not found)`); continue; }
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const dataTo = type === "meta" && data.data_to ? new Date(data.data_to) : null;
    await HealthData.findOneAndUpdate({ type }, { type, data, dataTo }, { upsert: true });
    console.log(`✓ ${type}`);
  }

  // Seed route tracks
  const rtDir = path.join(base, "route_tracks");
  if (fs.existsSync(rtDir)) {
    const files = fs.readdirSync(rtDir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const routeId = file.replace(".json", "");
      const data = JSON.parse(fs.readFileSync(path.join(rtDir, file), "utf8"));
      await HealthRouteTrack.findOneAndUpdate(
        { routeId },
        { routeId, points: data.points || [] },
        { upsert: true }
      );
    }
    console.log(`✓ route_tracks (${files.length} routes)`);
  }

  // Seed ECG waveforms
  const ecgDir = path.join(base, "ecg_waveforms");
  if (fs.existsSync(ecgDir)) {
    const files = fs.readdirSync(ecgDir).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const recordingId = file.replace(".json", "");
      const data = JSON.parse(fs.readFileSync(path.join(ecgDir, file), "utf8"));
      await HealthECGWaveform.findOneAndUpdate(
        { recordingId },
        { recordingId, sampleRateHz: data.sample_rate_hz || 512, voltageUv: data.voltage_uv || [] },
        { upsert: true }
      );
    }
    console.log(`✓ ecg_waveforms (${files.length} recordings)`);
  }

  console.log("\nDone. Run: npm run dev → http://localhost:3000/performance");
  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });

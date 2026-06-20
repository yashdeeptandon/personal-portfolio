/**
 * Clear all health data from MongoDB so the next ZIP upload is not delta-skipped.
 * Run: node scripts/clear-health.js
 */

const mongoose = require("mongoose");
const path = require("path");
const { config } = require("dotenv");

config({ path: path.join(__dirname, "../.env.local") });

async function clear() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const [hd, rt, ecg] = await Promise.all([
    db.collection("healthdatas").deleteMany({}),
    db.collection("healthroutetracks").deleteMany({}),
    db.collection("healthecgwaveforms").deleteMany({}),
  ]);

  console.log(`Cleared: ${hd.deletedCount} health datasets, ${rt.deletedCount} route tracks, ${ecg.deletedCount} ECG waveforms`);
  await mongoose.disconnect();
}

clear().catch((err) => { console.error(err); process.exit(1); });

import { spawn } from "child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join, resolve } from "path";
import dbConnect from "@/lib/db/connection";
import HealthData from "@/models/HealthData";
import HealthRouteTrack from "@/models/HealthRouteTrack";
import HealthECGWaveform from "@/models/HealthECGWaveform";
import { updateJob, cleanupJob } from "./jobStore";

const PYTHON_SCRIPT = resolve(
  process.cwd(),
  "apple-health-data-analysis-master/src/run_pipeline.py"
);

const DATASET_TYPES = [
  "meta",
  "kpis",
  "weekly_trends",
  "monthly_summary",
  "hr_zones",
  "workout_types",
  "daily_activity",
  "daily_heart",
  "vo2max",
  "training_load_detail",
  "workouts_detail",
  "workout_calendar",
  "activity_rings_detail",
  "routes_summary",
  "ecg_summary",
  "running_analytics",
] as const;

const FILE_TO_TYPE: Record<string, string> = {
  "meta.json": "meta",
  "kpis.json": "kpis",
  "weekly_trends.json": "weekly_trends",
  "monthly_summary.json": "monthly_summary",
  "hr_zones.json": "hr_zones",
  "workout_types.json": "workout_types",
  "daily_activity.json": "daily_activity",
  "daily_heart.json": "daily_heart",
  "vo2max.json": "vo2max",
  "training_load_detail.json": "training_load_detail",
  "workouts_detail.json": "workouts_detail",
  "workout_calendar.json": "workout_calendar",
  "activity_rings_detail.json": "activity_rings_detail",
  "routes_summary.json": "routes_summary",
  "ecg_summary.json": "ecg_summary",
  "running_analytics.json": "running_analytics",
};

export async function runHealthPipeline(
  jobId: string,
  zipBuffer: Buffer
): Promise<void> {
  const tmpBase = join(tmpdir(), `health_${jobId}`);
  const zipPath = join(tmpBase, "upload.zip");
  const extractDir = join(tmpBase, "extracted");
  const dataDir = join(tmpBase, "parquet_data");
  const outputDir = join(tmpBase, "json_output");

  try {
    // Step 1: Save & extract ZIP
    updateJob(jobId, { status: "processing", progress: 2, step: "Saving uploaded file..." });
    mkdirSync(tmpBase, { recursive: true });
    mkdirSync(extractDir, { recursive: true });
    mkdirSync(dataDir, { recursive: true });
    mkdirSync(outputDir, { recursive: true });

    writeFileSync(zipPath, zipBuffer);

    updateJob(jobId, { progress: 5, step: "Extracting ZIP..." });
    await extractZip(zipPath, extractDir);

    // Find the Apple Health export root (may be nested inside a folder)
    const inputDir = findExportRoot(extractDir);
    updateJob(jobId, { progress: 10, step: "Located Apple Health export. Checking for new data..." });

    // Delta check: compare data_to dates
    await dbConnect();
    const storedMeta = await HealthData.findOne({ type: "meta" });
    const newMetaPath = join(outputDir, "meta.json");

    // We need to run the pipeline first to get new meta, but we can check
    // a quick pre-check by reading the XML header if needed.
    // For now, run pipeline and check after.

    // Step 2: Run Python pipeline
    updateJob(jobId, { progress: 12, step: "Starting Apple Health data pipeline..." });
    await runPython(jobId, inputDir, dataDir, outputDir);

    // Delta check after pipeline
    if (existsSync(newMetaPath)) {
      const newMeta = JSON.parse(readFileSync(newMetaPath, "utf8"));
      if (storedMeta && storedMeta.dataTo) {
        const newDataTo = newMeta.data_to ? new Date(newMeta.data_to) : null;
        if (newDataTo && newDataTo <= storedMeta.dataTo) {
          updateJob(jobId, {
            status: "skipped",
            progress: 100,
            step: "No new data — already up to date.",
            completedAt: new Date(),
          });
          cleanup(tmpBase);
          return;
        }
      }
    }

    // Step 3: Upsert core datasets to MongoDB
    updateJob(jobId, { progress: 82, step: "Saving datasets to database..." });
    await upsertDatasets(outputDir);

    // Step 4: Upsert route tracks
    updateJob(jobId, { progress: 88, step: "Saving route tracks to database..." });
    await upsertRouteTracks(join(outputDir, "route_tracks"));

    // Step 5: Upsert ECG waveforms
    updateJob(jobId, { progress: 93, step: "Saving ECG waveforms to database..." });
    await upsertECGWaveforms(join(outputDir, "ecg_waveforms"));

    // Done
    cleanup(tmpBase);
    updateJob(jobId, {
      status: "complete",
      progress: 100,
      step: "Done! Health data updated.",
      completedAt: new Date(),
    });

    // Keep job state for 10 minutes then cleanup
    setTimeout(() => cleanupJob(jobId), 10 * 60 * 1000);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    updateJob(jobId, {
      status: "error",
      step: "Pipeline failed.",
      error: message,
      completedAt: new Date(),
    });
    cleanup(tmpBase);
    setTimeout(() => cleanupJob(jobId), 10 * 60 * 1000);
  }
}

async function extractZip(zipPath: string, destDir: string): Promise<void> {
  // Use unzip system command (available on Linux/macOS servers)
  return new Promise((resolve, reject) => {
    const proc = spawn("unzip", ["-o", "-q", zipPath, "-d", destDir]);
    proc.on("close", (code) => {
      if (code === 0 || code === 1) {
        resolve(); // code 1 = warnings (ok)
      } else {
        reject(new Error(`unzip exited with code ${code}`));
      }
    });
    proc.on("error", reject);
  });
}

function findExportRoot(extractDir: string): string {
  // Apple Health exports as: apple_health_export/export.xml
  // or directly: export.xml
  const direct = join(extractDir, "export.xml");
  if (existsSync(direct)) return extractDir;

  // Look one level deep
  const entries = readdirSync(extractDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const nested = join(extractDir, entry.name, "export.xml");
      if (existsSync(nested)) {
        return join(extractDir, entry.name);
      }
    }
  }

  return extractDir; // best guess
}

async function runPython(
  jobId: string,
  inputDir: string,
  dataDir: string,
  outputDir: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const python = process.env.PYTHON_CMD || "python3";
    const proc = spawn(python, [
      PYTHON_SCRIPT,
      "--input-dir", inputDir,
      "--data-dir", dataDir,
      "--output-dir", outputDir,
    ]);

    proc.stdout.on("data", (chunk: Buffer) => {
      const lines = chunk.toString().split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("PROGRESS:")) {
          const parts = trimmed.split(":");
          const pct = parseInt(parts[1], 10);
          const msg = parts.slice(2).join(":");
          if (!isNaN(pct)) {
            // Map Python 0-100 progress to Node 12-80 range
            const mapped = Math.round(12 + (pct / 100) * 68);
            updateJob(jobId, { progress: Math.min(mapped, 80), step: msg });
          }
        }
      }
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      // Log but don't fail on warnings
      const msg = chunk.toString().trim();
      if (msg) console.error(`[processor] Python stderr: ${msg}`);
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Python pipeline exited with code ${code}`));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Failed to spawn Python: ${err.message}. Set PYTHON_CMD env var if needed.`));
    });
  });
}

async function upsertDatasets(outputDir: string): Promise<void> {
  for (const [filename, type] of Object.entries(FILE_TO_TYPE)) {
    const filePath = join(outputDir, filename);
    if (!existsSync(filePath)) continue;
    try {
      const data = JSON.parse(readFileSync(filePath, "utf8"));
      const dataTo = type === "meta" && data.data_to ? new Date(data.data_to) : null;
      await HealthData.findOneAndUpdate(
        { type },
        { type, data, dataTo },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.error(`[processor] Failed to upsert ${type}:`, e);
    }
  }
}

async function upsertRouteTracks(routeTracksDir: string): Promise<void> {
  if (!existsSync(routeTracksDir)) return;
  const files = readdirSync(routeTracksDir).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    const routeId = file.replace(".json", "");
    try {
      const data = JSON.parse(readFileSync(join(routeTracksDir, file), "utf8"));
      await HealthRouteTrack.findOneAndUpdate(
        { routeId },
        { routeId, points: data.points || [] },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.error(`[processor] Failed to upsert route track ${routeId}:`, e);
    }
  }
}

async function upsertECGWaveforms(ecgWaveformsDir: string): Promise<void> {
  if (!existsSync(ecgWaveformsDir)) return;
  const files = readdirSync(ecgWaveformsDir).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    const recordingId = file.replace(".json", "");
    try {
      const data = JSON.parse(readFileSync(join(ecgWaveformsDir, file), "utf8"));
      await HealthECGWaveform.findOneAndUpdate(
        { recordingId },
        {
          recordingId,
          sampleRateHz: data.sample_rate_hz || 512,
          voltageUv: data.voltage_uv || [],
        },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.error(`[processor] Failed to upsert ECG waveform ${recordingId}:`, e);
    }
  }
}

function cleanup(dir: string): void {
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {
    // best effort
  }
}

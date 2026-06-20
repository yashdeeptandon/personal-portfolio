import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import HealthData from "@/models/HealthData";

const VALID_DATASETS = new Set([
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
]);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ dataset: string }> }
) {
  const { dataset } = await params;

  if (!VALID_DATASETS.has(dataset)) {
    return NextResponse.json({ error: "Unknown dataset" }, { status: 404 });
  }

  await dbConnect();
  const doc = await HealthData.findOne({ type: dataset }).lean();

  if (!doc) {
    return NextResponse.json({ error: "No data found" }, { status: 404 });
  }

  return NextResponse.json(doc.data, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}

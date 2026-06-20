import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import HealthECGWaveform from "@/models/HealthECGWaveform";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ recordingId: string }> }
) {
  const { recordingId } = await params;

  await dbConnect();
  const doc = await HealthECGWaveform.findOne({ recordingId }).lean();

  if (!doc) {
    return NextResponse.json({ error: "ECG waveform not found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      id: doc.recordingId,
      sample_rate_hz: doc.sampleRateHz,
      voltage_uv: doc.voltageUv,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300",
      },
    }
  );
}

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import HealthRouteTrack from "@/models/HealthRouteTrack";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ routeId: string }> }
) {
  const { routeId } = await params;

  await dbConnect();
  const doc = await HealthRouteTrack.findOne({ routeId }).lean();

  if (!doc) {
    return NextResponse.json({ error: "Route not found" }, { status: 404 });
  }

  return NextResponse.json(
    { id: doc.routeId, points: doc.points },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=300",
      },
    }
  );
}

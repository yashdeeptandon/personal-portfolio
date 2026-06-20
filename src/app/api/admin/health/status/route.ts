import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/middleware/adminAuth";
import dbConnect from "@/lib/db/connection";
import HealthData from "@/models/HealthData";

export const GET = withAdminAuth(async (_request: NextRequest) => {
  await dbConnect();

  const meta = await HealthData.findOne({ type: "meta" }).lean();

  if (!meta) {
    return NextResponse.json({
      success: true,
      data: { hasData: false },
    });
  }

  const metaData = meta.data as Record<string, unknown>;

  return NextResponse.json({
    success: true,
    data: {
      hasData: true,
      generatedAt: metaData.generated_at,
      dataFrom: metaData.data_from,
      dataTo: metaData.data_to,
      schemaVersion: metaData.schema_version,
      dbUpdatedAt: meta.updatedAt,
    },
  });
});

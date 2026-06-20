import { NextRequest, NextResponse } from "next/server";
import { withAdminAuth } from "@/middleware/adminAuth";
import { createJob } from "@/lib/health/jobStore";
import { runHealthPipeline } from "@/lib/health/processor";
import { randomUUID } from "crypto";

export const POST = withAdminAuth(async (request: NextRequest) => {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
  }

  if (!file.name.endsWith(".zip")) {
    return NextResponse.json(
      { success: false, message: "File must be a .zip archive" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const jobId = randomUUID();

  createJob(jobId);

  // Fire and forget — processor updates job state in background
  runHealthPipeline(jobId, buffer).catch((err) => {
    console.error("[health-upload] Unhandled pipeline error:", err);
  });

  return NextResponse.json({ success: true, jobId }, { status: 202 });
});

import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connection";
import ActivityEvent from "@/models/ActivityEvent";
import { withAdminAuth } from "@/middleware/adminAuth";
import {
  successResponse,
  createdResponse,
  validationErrorResponse,
  withErrorHandling,
} from "@/lib/utils/response";
import { techAchievementCreateSchema } from "@/lib/validation/schemas";

// GET /api/admin/tech-performance/achievements — list manual entries
export const GET = withAdminAuth(async () => {
  await dbConnect();
  const achievements = await ActivityEvent.find({ provider: "manual" })
    .sort({ timestamp: -1 })
    .lean();
  return successResponse("Achievements retrieved", { achievements });
});

// POST /api/admin/tech-performance/achievements — create a manual timeline entry
export const POST = withAdminAuth(
  withErrorHandling(async (request: NextRequest | Request) => {
    await dbConnect();

    const body = await request.json();
    const { error, value } = techAchievementCreateSchema.validate(body);
    if (error) {
      return validationErrorResponse(error.message);
    }

    const achievement = await ActivityEvent.create({
      provider: "manual",
      type: value.type,
      timestamp: value.timestamp,
      title: value.title,
      description: value.description || undefined,
      url: value.url || undefined,
      externalId: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      metadata: value.metadata ?? {},
      visibility: "public",
    });

    return createdResponse("Achievement created", { achievement });
  })
);

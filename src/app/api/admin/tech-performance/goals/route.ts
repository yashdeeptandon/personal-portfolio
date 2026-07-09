import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connection";
import TechGoal from "@/models/TechGoal";
import { withAdminAuth } from "@/middleware/adminAuth";
import {
  successResponse,
  createdResponse,
  validationErrorResponse,
  conflictResponse,
  withErrorHandling,
} from "@/lib/utils/response";
import { techGoalCreateSchema } from "@/lib/validation/schemas";

// GET /api/admin/tech-performance/goals — full list, including inactive
export const GET = withAdminAuth(async () => {
  await dbConnect();
  const goals = await TechGoal.find({}).sort({ order: 1 }).lean();
  return successResponse("Goals retrieved", { goals });
});

// POST /api/admin/tech-performance/goals — create
export const POST = withAdminAuth(
  withErrorHandling(async (request: NextRequest | Request) => {
    await dbConnect();

    const body = await request.json();
    const { error, value } = techGoalCreateSchema.validate(body);
    if (error) {
      return validationErrorResponse(error.message);
    }

    const existing = await TechGoal.findOne({ key: value.key });
    if (existing) {
      return conflictResponse(`A goal with key "${value.key}" already exists`);
    }

    const goal = await TechGoal.create(value);
    return createdResponse("Goal created", { goal });
  })
);

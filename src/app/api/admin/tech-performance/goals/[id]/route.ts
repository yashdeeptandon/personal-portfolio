import { NextRequest } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connection";
import TechGoal from "@/models/TechGoal";
import { withAdminAuth } from "@/middleware/adminAuth";
import {
  successResponse,
  badRequestResponse,
  notFoundResponse,
  validationErrorResponse,
  withErrorHandling,
} from "@/lib/utils/response";
import { techGoalUpdateSchema } from "@/lib/validation/schemas";

type Params = { params: Promise<{ id: string }> };

export const PATCH = withAdminAuth(
  withErrorHandling(async (request: NextRequest | Request, context?: Params) => {
    const { id } = (await context?.params) ?? { id: "" };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequestResponse("Invalid goal ID");
    }

    await dbConnect();
    const body = await request.json();
    const { error, value } = techGoalUpdateSchema.validate(body);
    if (error) {
      return validationErrorResponse(error.message);
    }

    const goal = await TechGoal.findByIdAndUpdate(id, value, {
      new: true,
      runValidators: true,
    });
    if (!goal) {
      return notFoundResponse("Goal not found");
    }

    return successResponse("Goal updated", { goal });
  })
);

export const DELETE = withAdminAuth(
  withErrorHandling(async (_request: NextRequest | Request, context?: Params) => {
    const { id } = (await context?.params) ?? { id: "" };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequestResponse("Invalid goal ID");
    }

    await dbConnect();
    const goal = await TechGoal.findByIdAndDelete(id);
    if (!goal) {
      return notFoundResponse("Goal not found");
    }

    return successResponse("Goal deleted", null);
  })
);

import { NextRequest } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connection";
import ActivityEvent from "@/models/ActivityEvent";
import { withAdminAuth } from "@/middleware/adminAuth";
import {
  successResponse,
  badRequestResponse,
  notFoundResponse,
  validationErrorResponse,
  withErrorHandling,
} from "@/lib/utils/response";
import { techAchievementUpdateSchema } from "@/lib/validation/schemas";

type Params = { params: Promise<{ id: string }> };

export const PATCH = withAdminAuth(
  withErrorHandling(async (request: NextRequest | Request, context?: Params) => {
    const { id } = (await context?.params) ?? { id: "" };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequestResponse("Invalid achievement ID");
    }

    await dbConnect();
    const body = await request.json();
    const { error, value } = techAchievementUpdateSchema.validate(body);
    if (error) {
      return validationErrorResponse(error.message);
    }

    const achievement = await ActivityEvent.findOneAndUpdate(
      { _id: id, provider: "manual" },
      value,
      { new: true, runValidators: true }
    );
    if (!achievement) {
      return notFoundResponse("Achievement not found");
    }

    return successResponse("Achievement updated", { achievement });
  })
);

export const DELETE = withAdminAuth(
  withErrorHandling(async (_request: NextRequest | Request, context?: Params) => {
    const { id } = (await context?.params) ?? { id: "" };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequestResponse("Invalid achievement ID");
    }

    await dbConnect();
    const achievement = await ActivityEvent.findOneAndDelete({
      _id: id,
      provider: "manual",
    });
    if (!achievement) {
      return notFoundResponse("Achievement not found");
    }

    return successResponse("Achievement deleted", null);
  })
);

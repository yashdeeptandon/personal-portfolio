import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db/connection";
import Newsletter from "@/models/Newsletter";
import { authOptions } from "@/lib/auth/config";
import { newsletterUpdateSchema } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
  validationErrorResponse,
  withErrorHandling,
} from "@/lib/utils/response";
import { withAdminAuth } from "@/middleware/adminAuth";
import { API_MESSAGES } from "@/lib/utils/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/newsletter/[id] - Get single newsletter subscriber (admin only)
export const GET = withAdminAuth(
  withErrorHandling(
    async (request: NextRequest | Request, { params }: RouteParams) => {
      await dbConnect();

      const { id } = await params;

      try {
        const subscriber = await Newsletter.findById(id);

        if (!subscriber) {
          return notFoundResponse("Newsletter subscriber not found");
        }

        return successResponse(
          "Newsletter subscriber retrieved successfully",
          subscriber
        );
      } catch (error) {
        console.error("Error fetching newsletter subscriber:", error);
        return errorResponse(API_MESSAGES.INTERNAL_ERROR);
      }
    }
  )
);

// PUT /api/newsletter/[id] - Update newsletter subscriber (admin only)
export const PUT = withAdminAuth(
  withErrorHandling(
    async (request: NextRequest | Request, { params }: RouteParams) => {
      await dbConnect();

      const { id } = await params;

      try {
        const body = await (request as NextRequest).json();

        // Validate request body
        const { error, value } = newsletterUpdateSchema.validate(body);
        if (error) {
          return validationErrorResponse(
            API_MESSAGES.VALIDATION_ERROR,
            error.details[0].message
          );
        }

        const subscriber = await Newsletter.findById(id);

        if (!subscriber) {
          return notFoundResponse("Newsletter subscriber not found");
        }

        // Update subscriber
        Object.assign(subscriber, value);

        // If status is being changed to unsubscribed, set unsubscribedAt
        if (
          value.status === "unsubscribed" &&
          subscriber.status !== "unsubscribed"
        ) {
          subscriber.unsubscribedAt = new Date();
        } else if (
          value.status === "active" &&
          subscriber.status === "unsubscribed"
        ) {
          subscriber.unsubscribedAt = null;
        }

        await subscriber.save();

        return successResponse(
          "Newsletter subscriber updated successfully",
          subscriber
        );
      } catch (error) {
        console.error("Error updating newsletter subscriber:", error);
        return errorResponse(API_MESSAGES.INTERNAL_ERROR);
      }
    }
  )
);

// DELETE /api/newsletter/[id] - Delete newsletter subscriber (admin only)
export const DELETE = withAdminAuth(
  withErrorHandling(
    async (request: NextRequest | Request, { params }: RouteParams) => {
      await dbConnect();

      const { id } = await params;

      try {
        const subscriber = await Newsletter.findById(id);

        if (!subscriber) {
          return notFoundResponse("Newsletter subscriber not found");
        }

        await Newsletter.findByIdAndDelete(id);

        return successResponse("Newsletter subscriber deleted successfully");
      } catch (error) {
        console.error("Error deleting newsletter subscriber:", error);
        return errorResponse(API_MESSAGES.INTERNAL_ERROR);
      }
    }
  )
);

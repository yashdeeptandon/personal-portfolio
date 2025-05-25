import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connection";
import Testimonial from "@/models/Testimonial";
import { withAdminAuth } from "@/middleware/adminAuth";
import {
  successResponse,
  withErrorHandling,
  notFoundResponse,
  badRequestResponse,
  validationErrorResponse,
} from "@/lib/utils/response";
import { API_MESSAGES } from "@/lib/utils/constants";
import { logDatabaseOperation, logAuthEvent } from "@/lib/utils/logger";
import { testimonialValidation } from "../../../../lib/validation/testimonial";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import mongoose from "mongoose";

// GET /api/testimonials/[id] - Get specific testimonial
export const GET = withErrorHandling(
  async (
    request: NextRequest | Request,
    { params }: { params: { id: string } }
  ) => {
    const startTime = Date.now();
    await dbConnect();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequestResponse("Invalid testimonial ID");
    }

    try {
      const testimonial = await Testimonial.findById(id).lean();

      if (!testimonial) {
        return notFoundResponse(API_MESSAGES.TESTIMONIAL_NOT_FOUND);
      }

      logDatabaseOperation(
        "fetch_testimonial",
        "testimonials",
        Date.now() - startTime,
        { testimonialId: id }
      );

      return successResponse("Testimonial retrieved successfully", {
        testimonial,
      });
    } catch (error) {
      throw error;
    }
  }
);

// PUT /api/testimonials/[id] - Update specific testimonial
export const PUT = withAdminAuth(
  withErrorHandling(
    async (
      request: NextRequest | Request,
      { params }: { params: { id: string } }
    ) => {
      const startTime = Date.now();
      await dbConnect();

      const session = await getServerSession(authOptions);
      const { id } = params;
      const body = await request.json();

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequestResponse("Invalid testimonial ID");
      }

      // Validate input
      const { error, value } = testimonialValidation.update.validate(body);
      if (error) {
        return validationErrorResponse(error.details[0].message);
      }

      try {
        const testimonial = await Testimonial.findByIdAndUpdate(
          id,
          { ...value, updatedAt: new Date() },
          { new: true, runValidators: true }
        );

        if (!testimonial) {
          return notFoundResponse(API_MESSAGES.TESTIMONIAL_NOT_FOUND);
        }

        logDatabaseOperation(
          "update_testimonial",
          "testimonials",
          Date.now() - startTime,
          { testimonialId: id }
        );

        logAuthEvent(
          "admin_access",
          session?.user?.id || "unknown",
          session?.user?.email,
          {
            action: "update_testimonial",
            resource: "testimonials",
            resourceId: id,
            title: testimonial.name,
            changes: Object.keys(value),
          }
        );

        return successResponse(API_MESSAGES.TESTIMONIAL_UPDATED, {
          testimonial,
        });
      } catch (error) {
        throw error;
      }
    }
  )
);

// DELETE /api/testimonials/[id] - Delete specific testimonial
export const DELETE = withAdminAuth(
  withErrorHandling(
    async (
      request: NextRequest | Request,
      { params }: { params: { id: string } }
    ) => {
      const startTime = Date.now();
      await dbConnect();

      const session = await getServerSession(authOptions);
      const { id } = params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return badRequestResponse("Invalid testimonial ID");
      }

      try {
        const testimonial = await Testimonial.findByIdAndDelete(id);

        if (!testimonial) {
          return notFoundResponse(API_MESSAGES.TESTIMONIAL_NOT_FOUND);
        }

        logDatabaseOperation(
          "delete_testimonial",
          "testimonials",
          Date.now() - startTime,
          { testimonialId: id }
        );

        logAuthEvent(
          "admin_access",
          session?.user?.id || "unknown",
          session?.user?.email,
          {
            action: "delete_testimonial",
            resource: "testimonials",
            resourceId: id,
            title: testimonial.name,
          }
        );

        return successResponse(API_MESSAGES.TESTIMONIAL_DELETED, null);
      } catch (error) {
        throw error;
      }
    }
  )
);

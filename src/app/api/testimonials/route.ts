import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connection";
import Testimonial from "@/models/Testimonial";
import { withAdminAuth } from "@/middleware/adminAuth";
import {
  successResponse,
  withErrorHandling,
  createPaginationMeta,
  createdResponse,
  validationErrorResponse,
} from "@/lib/utils/response";
import { API_MESSAGES } from "@/lib/utils/constants";
import { logDatabaseOperation, logAuthEvent } from "@/lib/utils/logger";
import { testimonialValidation } from "../../../lib/validation/testimonial";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

// GET /api/testimonials - Get all testimonials with pagination and filtering
export const GET = withErrorHandling(async (request: NextRequest | Request) => {
  const startTime = Date.now();
  await dbConnect();

  const nextRequest = request as NextRequest;
  const { searchParams } = new URL(nextRequest.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  // Build filter object
  const filter: any = {};
  if (status && ["pending", "approved", "rejected"].includes(status)) {
    filter.status = status;
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  try {
    const skip = (page - 1) * limit;

    const [testimonials, total] = await Promise.all([
      Testimonial.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Testimonial.countDocuments(filter),
    ]);

    logDatabaseOperation(
      "fetch_testimonials",
      "testimonials",
      Date.now() - startTime,
      { page, limit, total, filter }
    );

    const pagination = createPaginationMeta(page, limit, total);

    return successResponse(
      "Testimonials retrieved successfully",
      testimonials,
      200,
      pagination
    );
  } catch (error) {
    throw error;
  }
});

// POST /api/testimonials - Create new testimonial
export const POST = withAdminAuth(
  withErrorHandling(async (request: NextRequest | Request) => {
    const startTime = Date.now();
    await dbConnect();

    const session = await getServerSession(authOptions);
    const body = await request.json();

    // Validate input
    const { error, value } = testimonialValidation.create.validate(body);
    if (error) {
      return validationErrorResponse(error.details[0].message);
    }

    try {
      const testimonial = new Testimonial(value);
      await testimonial.save();

      logDatabaseOperation(
        "create_testimonial",
        "testimonials",
        Date.now() - startTime,
        { testimonialId: testimonial._id }
      );

      logAuthEvent(
        "admin_access",
        session?.user?.id || "unknown",
        session?.user?.email,
        {
          action: "create_testimonial",
          resource: "testimonials",
          resourceId: testimonial._id.toString(),
          title: testimonial.name,
        }
      );

      return createdResponse(API_MESSAGES.TESTIMONIAL_CREATED, testimonial);
    } catch (error) {
      throw error;
    }
  })
);

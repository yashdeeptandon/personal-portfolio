import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db/connection";
import Project from "@/models/Project";
import { authOptions } from "@/lib/auth/config";
import { projectCreateSchema } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  createdResponse,
  unauthorizedResponse,
  validationErrorResponse,
  withErrorHandling,
  parsePaginationParams,
  createPaginationMeta,
} from "@/lib/utils/response";
import { API_MESSAGES } from "@/lib/utils/constants";

// GET /api/projects - Get all projects (public)
export const GET = withErrorHandling(async (request: NextRequest | Request) => {
  const nextRequest = request as NextRequest;
  await dbConnect();

  const { searchParams } = new URL(nextRequest.url);
  const { page, limit, sort, order, search, skip } =
    parsePaginationParams(searchParams);

  // Build query
  let query: any = {};

  // Add search functionality
  if (search) {
    query.$text = { $search: search };
  }

  // Filter by category
  const category = searchParams.get("category");
  if (category) {
    query.category = category.toLowerCase();
  }

  // Filter by technology
  const technology = searchParams.get("technology");
  if (technology) {
    query.technologies = { $in: [technology] };
  }

  // Filter by status
  const status = searchParams.get("status");
  if (status) {
    query.status = status;
  }

  // Filter by featured
  const featured = searchParams.get("featured");
  if (featured === "true") {
    query.featured = true;
  }

  // Build sort object
  const sortObj: any = {};
  if (search) {
    sortObj.score = { $meta: "textScore" };
  }

  // Default sort by order and creation date for better UX
  if (sort === "createdAt") {
    sortObj.order = 1;
    sortObj[sort] = order;
  } else {
    sortObj[sort] = order;
  }

  try {
    // Get total count for pagination
    const total = await Project.countDocuments(query);

    // Get projects with pagination
    const projects = await Project.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    const pagination = createPaginationMeta(page, limit, total);

    return successResponse(
      "Projects retrieved successfully",
      projects,
      200,
      pagination
    );
  } catch (error) {
    console.error("Error fetching projects:", error);
    return errorResponse(API_MESSAGES.INTERNAL_ERROR);
  }
});

// POST /api/projects - Create new project (admin only)
export const POST = withErrorHandling(
  async (request: NextRequest | Request) => {
    const nextRequest = request as NextRequest;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return unauthorizedResponse(API_MESSAGES.UNAUTHORIZED);
    }

    await dbConnect();

    try {
      const body = await nextRequest.json();

      // Validate request body
      const { error, value } = projectCreateSchema.validate(body);
      if (error) {
        return validationErrorResponse(
          API_MESSAGES.VALIDATION_ERROR,
          error.details[0].message
        );
      }

      // Create new project
      const project = new Project(value);
      await project.save();

      return createdResponse(API_MESSAGES.PROJECT_CREATED, project);
    } catch (error) {
      console.error("Error creating project:", error);

      // Handle duplicate slug error
      if (error instanceof Error && error.message.includes("duplicate key")) {
        return errorResponse("A project with this title already exists", 409);
      }

      return errorResponse(API_MESSAGES.INTERNAL_ERROR);
    }
  }
);

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db/connection";
import Project from "@/models/Project";
import Analytics from "@/models/Analytics";
import { authOptions } from "@/lib/auth/config";
import { projectUpdateSchema } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
  validationErrorResponse,
  withErrorHandling,
  getClientIP,
  getUserAgent,
} from "@/lib/utils/response";
import { API_MESSAGES, ANALYTICS_EVENTS } from "@/lib/utils/constants";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/projects/[id] - Get single project
export const GET = withErrorHandling(
  async (request: NextRequest | Request, { params }: RouteParams) => {
    const nextRequest = request as NextRequest;
    await dbConnect();

    const { id } = await params;
    const session = await getServerSession(authOptions);

    try {
      // Find project by ID or slug
      let query: any = {};

      // Check if id is a valid ObjectId or treat as slug
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        query._id = id;
      } else {
        query.slug = id;
      }

      const project = await Project.findOne(query);

      if (!project) {
        return notFoundResponse(API_MESSAGES.PROJECT_NOT_FOUND);
      }

      // Track analytics for public views
      if (!session || session.user.role !== "admin") {
        try {
          // Track analytics
          const analytics = new Analytics({
            type: ANALYTICS_EVENTS.PROJECT_VIEW,
            path: `/projects/${project.slug}`,
            referrer: nextRequest.headers.get("referer"),
            userAgent: getUserAgent(nextRequest),
            ipAddress: getClientIP(nextRequest),
            metadata: {
              projectId: project._id,
              projectTitle: project.title,
              projectCategory: project.category,
              projectTechnologies: project.technologies,
            },
          });

          await analytics.save();
        } catch (analyticsError) {
          // Don't fail the request if analytics fails
          console.error("Analytics error:", analyticsError);
        }
      }

      return successResponse("Project retrieved successfully", project);
    } catch (error) {
      console.error("Error fetching project:", error);
      return errorResponse(API_MESSAGES.INTERNAL_ERROR);
    }
  }
);

// PUT /api/projects/[id] - Update project (admin only)
export const PUT = withErrorHandling(
  async (request: NextRequest | Request, { params }: RouteParams) => {
    const nextRequest = request as NextRequest;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return unauthorizedResponse(API_MESSAGES.UNAUTHORIZED);
    }

    await dbConnect();

    const { id } = await params;

    try {
      const body = await nextRequest.json();

      // Validate request body
      const { error, value } = projectUpdateSchema.validate(body);
      if (error) {
        return validationErrorResponse(
          API_MESSAGES.VALIDATION_ERROR,
          error.details[0].message
        );
      }

      // Find and update project
      const project = await Project.findByIdAndUpdate(
        id,
        { ...value, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!project) {
        return notFoundResponse(API_MESSAGES.PROJECT_NOT_FOUND);
      }

      return successResponse(API_MESSAGES.PROJECT_UPDATED, project);
    } catch (error) {
      console.error("Error updating project:", error);

      // Handle duplicate slug error
      if (error instanceof Error && error.message.includes("duplicate key")) {
        return errorResponse("A project with this title already exists", 409);
      }

      return errorResponse(API_MESSAGES.INTERNAL_ERROR);
    }
  }
);

// DELETE /api/projects/[id] - Delete project (admin only)
export const DELETE = withErrorHandling(
  async (request: NextRequest | Request, { params }: RouteParams) => {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return unauthorizedResponse(API_MESSAGES.UNAUTHORIZED);
    }

    await dbConnect();

    const { id } = await params;

    try {
      const project = await Project.findByIdAndDelete(id);

      if (!project) {
        return notFoundResponse(API_MESSAGES.PROJECT_NOT_FOUND);
      }

      return successResponse(API_MESSAGES.PROJECT_DELETED);
    } catch (error) {
      console.error("Error deleting project:", error);
      return errorResponse(API_MESSAGES.INTERNAL_ERROR);
    }
  }
);

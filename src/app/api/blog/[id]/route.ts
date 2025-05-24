import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db/connection";
import Blog from "@/models/Blog";
import Analytics from "@/models/Analytics";
import { authOptions } from "@/lib/auth/config";
import { blogUpdateSchema } from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  unauthorizedResponse,
  validationErrorResponse,
  noContentResponse,
  withErrorHandling,
  getClientIP,
  getUserAgent,
} from "@/lib/utils/response";
import { API_MESSAGES, ANALYTICS_EVENTS } from "@/lib/utils/constants";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/blog/[id] - Get single blog post
export const GET = withErrorHandling(
  async (request: NextRequest | Request, { params }: RouteParams) => {
    const nextRequest = request as NextRequest;
    await dbConnect();

    const { id } = params;
    const session = await getServerSession(authOptions);

    try {
      // Find blog by ID or slug
      let query: any = {};

      // Check if id is a valid ObjectId or treat as slug
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        query._id = id;
      } else {
        query.slug = id;
      }

      // For non-admin users, only show published posts
      if (!session || session.user.role !== "admin") {
        query.status = "published";
        query.publishedAt = { $lte: new Date() };
      }

      const blog = await Blog.findOne(query);

      if (!blog) {
        return notFoundResponse(API_MESSAGES.BLOG_NOT_FOUND);
      }

      // Track analytics for public views
      if (!session || session.user.role !== "admin") {
        try {
          // Increment view count
          await blog.incrementViews();

          // Track analytics
          const analytics = new Analytics({
            type: ANALYTICS_EVENTS.BLOG_VIEW,
            path: `/blog/${blog.slug}`,
            referrer: nextRequest.headers.get("referer"),
            userAgent: getUserAgent(nextRequest),
            ipAddress: getClientIP(nextRequest),
            metadata: {
              blogId: blog._id,
              blogTitle: blog.title,
              blogCategory: blog.category,
            },
          });

          await analytics.save();
        } catch (analyticsError) {
          // Don't fail the request if analytics fails
          console.error("Analytics error:", analyticsError);
        }
      }

      return successResponse("Blog post retrieved successfully", blog);
    } catch (error) {
      console.error("Error fetching blog:", error);
      return errorResponse(API_MESSAGES.INTERNAL_ERROR);
    }
  }
);

// PUT /api/blog/[id] - Update blog post (admin only)
export const PUT = withErrorHandling(
  async (request: NextRequest | Request, { params }: RouteParams) => {
    const nextRequest = request as NextRequest;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return unauthorizedResponse(API_MESSAGES.UNAUTHORIZED);
    }

    await dbConnect();

    const { id } = params;

    try {
      const body = await nextRequest.json();

      // Validate request body
      const { error, value } = blogUpdateSchema.validate(body);
      if (error) {
        return validationErrorResponse(
          API_MESSAGES.VALIDATION_ERROR,
          error.details[0].message
        );
      }

      // Find and update blog
      const blog = await Blog.findByIdAndUpdate(
        id,
        { ...value, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!blog) {
        return notFoundResponse(API_MESSAGES.BLOG_NOT_FOUND);
      }

      return successResponse(API_MESSAGES.BLOG_UPDATED, blog);
    } catch (error) {
      console.error("Error updating blog:", error);

      // Handle duplicate slug error
      if (error instanceof Error && error.message.includes("duplicate key")) {
        return errorResponse("A blog post with this title already exists", 409);
      }

      return errorResponse(API_MESSAGES.INTERNAL_ERROR);
    }
  }
);

// DELETE /api/blog/[id] - Delete blog post (admin only)
export const DELETE = withErrorHandling(
  async (request: NextRequest | Request, { params }: RouteParams) => {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return unauthorizedResponse(API_MESSAGES.UNAUTHORIZED);
    }

    await dbConnect();

    const { id } = params;

    try {
      const blog = await Blog.findByIdAndDelete(id);

      if (!blog) {
        return notFoundResponse(API_MESSAGES.BLOG_NOT_FOUND);
      }

      return successResponse(API_MESSAGES.BLOG_DELETED);
    } catch (error) {
      console.error("Error deleting blog:", error);
      return errorResponse(API_MESSAGES.INTERNAL_ERROR);
    }
  }
);

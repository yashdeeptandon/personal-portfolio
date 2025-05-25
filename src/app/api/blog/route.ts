import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db/connection";
import Blog from "@/models/Blog";
import { authOptions } from "@/lib/auth/config";
import { blogCreateSchema } from "@/lib/validation/schemas";
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
import { withRequestLogging } from "@/middleware/requestLogger";
import {
  logDatabaseOperation,
  logAuthEvent,
  logPerformance,
} from "@/lib/utils/logger";

// GET /api/blog - Get all blog posts (public)
export const GET = withRequestLogging(
  withErrorHandling(async (request: NextRequest | Request) => {
    const nextRequest = request as NextRequest;
    const startTime = Date.now();
    await dbConnect();

    const { searchParams } = new URL(nextRequest.url);
    const { page, limit, sort, order, search, skip } =
      parsePaginationParams(searchParams);

    // Build query
    let query: any = {};

    // For public access, only show published posts
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      query.status = "published";
      query.publishedAt = { $lte: new Date() };
    }

    // Add search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by category
    const category = searchParams.get("category");
    if (category) {
      query.category = category.toLowerCase();
    }

    // Filter by tag
    const tag = searchParams.get("tag");
    if (tag) {
      query.tags = tag.toLowerCase();
    }

    // Build sort object
    const sortObj: any = {};
    if (search) {
      sortObj.score = { $meta: "textScore" };
    }
    sortObj[sort] = order;

    try {
      // Get total count for pagination
      const countStart = Date.now();
      const total = await Blog.countDocuments(query);
      logDatabaseOperation("count", "blogs", Date.now() - countStart, {
        query,
      });

      // Get blogs with pagination
      const findStart = Date.now();
      const blogs = await Blog.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .select("-content") // Exclude full content for list view
        .lean();
      logDatabaseOperation("find", "blogs", Date.now() - findStart, {
        count: blogs.length,
        page,
        limit,
        search: search || "none",
      });

      const pagination = createPaginationMeta(page, limit, total);

      logPerformance("blog_list_retrieval", Date.now() - startTime, 500, {
        totalBlogs: total,
        returnedBlogs: blogs.length,
        page,
        hasSearch: !!search,
      });

      return successResponse(
        "Blogs retrieved successfully",
        blogs,
        200,
        pagination
      );
    } catch (error) {
      logDatabaseOperation("error", "blogs", Date.now() - startTime, {
        error: String(error),
      });
      return errorResponse(API_MESSAGES.INTERNAL_ERROR);
    }
  })
);

// POST /api/blog - Create new blog post (admin only)
export const POST = withRequestLogging(
  withErrorHandling(async (request: NextRequest | Request) => {
    const nextRequest = request as NextRequest;
    const startTime = Date.now();
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      logAuthEvent(
        "unauthorized_access",
        session?.user?.id,
        session?.user?.email,
        {
          endpoint: "/api/blog",
          method: "POST",
          role: session?.user?.role || "none",
        }
      );
      return unauthorizedResponse(API_MESSAGES.UNAUTHORIZED);
    }

    await dbConnect();

    try {
      const body = await nextRequest.json();

      // Validate request body
      const { error, value } = blogCreateSchema.validate(body);
      if (error) {
        return validationErrorResponse(
          API_MESSAGES.VALIDATION_ERROR,
          error.details[0].message
        );
      }

      // Create new blog post
      const blog = new Blog({
        ...value,
        author: session.user.name || "Admin",
      });

      const saveStart = Date.now();
      await blog.save();
      logDatabaseOperation("create", "blogs", Date.now() - saveStart, {
        blogId: blog._id,
        title: blog.title,
        author: blog.author,
        status: blog.status,
      });

      logPerformance("blog_creation", Date.now() - startTime, 1000, {
        blogId: blog._id,
        title: blog.title,
        userId: session.user.id,
      });

      return createdResponse(API_MESSAGES.BLOG_CREATED, blog);
    } catch (error) {
      logDatabaseOperation("error", "blogs", Date.now() - startTime, {
        error: String(error),
        operation: "create",
      });

      // Handle duplicate slug error
      if (error instanceof Error && error.message.includes("duplicate key")) {
        return errorResponse("A blog post with this title already exists", 409);
      }

      return errorResponse(API_MESSAGES.INTERNAL_ERROR);
    }
  })
);

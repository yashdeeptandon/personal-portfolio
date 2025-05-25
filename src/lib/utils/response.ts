import { NextResponse, NextRequest } from "next/server";
import { ApiResponse } from "@/types";
import { HTTP_STATUS } from "./constants";
import { logError, logWarning } from "./logger";

/**
 * Create a standardized API response
 */
export function createApiResponse<T = any>(
  success: boolean,
  message: string,
  data?: T,
  status: number = HTTP_STATUS.OK,
  pagination?: ApiResponse<T>["pagination"]
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success,
    message,
    ...(data !== undefined && { data }),
    ...(pagination && { pagination }),
  };

  return NextResponse.json(response, { status });
}

/**
 * Create a success response
 */
export function successResponse<T = any>(
  message: string,
  data?: T,
  status: number = HTTP_STATUS.OK,
  pagination?: ApiResponse<T>["pagination"]
): NextResponse<ApiResponse<T>> {
  return createApiResponse(true, message, data, status, pagination);
}

/**
 * Create an error response
 */
export function errorResponse(
  message: string,
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  error?: string
): NextResponse<ApiResponse> {
  const response: ApiResponse = {
    success: false,
    message,
    ...(error && { error }),
  };

  return NextResponse.json(response, { status });
}

/**
 * Create a validation error response
 */
export function validationErrorResponse(
  message: string = "Validation failed",
  errors?: any
): NextResponse<ApiResponse> {
  return errorResponse(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, errors);
}

/**
 * Create a not found response
 */
export function notFoundResponse(
  message: string = "Resource not found"
): NextResponse<ApiResponse> {
  return errorResponse(message, HTTP_STATUS.NOT_FOUND);
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(
  message: string = "Unauthorized access"
): NextResponse<ApiResponse> {
  return errorResponse(message, HTTP_STATUS.UNAUTHORIZED);
}

/**
 * Create a forbidden response
 */
export function forbiddenResponse(
  message: string = "Access forbidden"
): NextResponse<ApiResponse> {
  return errorResponse(message, HTTP_STATUS.FORBIDDEN);
}

/**
 * Create a conflict response
 */
export function conflictResponse(
  message: string = "Resource already exists"
): NextResponse<ApiResponse> {
  return errorResponse(message, HTTP_STATUS.CONFLICT);
}

/**
 * Create a rate limit exceeded response
 */
export function rateLimitResponse(
  message: string = "Too many requests. Please try again later."
): NextResponse<ApiResponse> {
  return errorResponse(message, HTTP_STATUS.TOO_MANY_REQUESTS);
}

/**
 * Create a bad request response
 */
export function badRequestResponse(
  message: string = "Bad request"
): NextResponse<ApiResponse> {
  return errorResponse(message, HTTP_STATUS.BAD_REQUEST);
}

/**
 * Create a created response
 */
export function createdResponse<T = any>(
  message: string,
  data?: T
): NextResponse<ApiResponse<T>> {
  return successResponse(message, data, HTTP_STATUS.CREATED);
}

/**
 * Create a no content response
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT });
}

/**
 * Handle async API route with error catching
 */
export function withErrorHandling(
  handler: (
    request: Request | NextRequest,
    context?: any
  ) => Promise<NextResponse>
) {
  return async (
    request: Request | NextRequest,
    context?: any
  ): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      // Log the error with context
      const url = request.url;
      const method = request.method;
      const requestId = request.headers.get("x-request-id") || "unknown";

      logError(error, {
        url,
        method,
        requestId,
        userAgent: request.headers.get("user-agent"),
        origin: request.headers.get("origin"),
      });

      // Handle specific error types
      if (error instanceof Error) {
        // Validation errors
        if (error.name === "ValidationError") {
          logWarning("Validation error occurred", {
            error: error.message,
            url,
            method,
            requestId,
          });
          return validationErrorResponse(error.message);
        }

        // MongoDB duplicate key error
        if (error.message.includes("duplicate key")) {
          logWarning("Duplicate key error", {
            error: error.message,
            url,
            method,
            requestId,
          });
          return conflictResponse("Resource already exists");
        }

        // MongoDB cast error
        if (error.message.includes("Cast to ObjectId failed")) {
          logWarning("Invalid ObjectId format", {
            error: error.message,
            url,
            method,
            requestId,
          });
          return badRequestResponse("Invalid ID format");
        }
      }

      return errorResponse("Internal server error");
    }
  };
}

/**
 * Parse pagination parameters from URL search params
 */
export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "10", 10))
  );
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") === "asc" ? 1 : -1;
  const search = searchParams.get("search") || "";

  return {
    page,
    limit,
    sort,
    order,
    search,
    skip: (page - 1) * limit,
  };
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
}

/**
 * Extract client IP address from request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const clientIP = request.headers.get("x-client-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return realIP || clientIP || "unknown";
}

/**
 * Extract user agent from request
 */
export function getUserAgent(request: Request): string {
  return request.headers.get("user-agent") || "unknown";
}

/**
 * Parse device info from user agent
 */
export function parseUserAgent(userAgent: string) {
  const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
  const isTablet = /iPad|Tablet/.test(userAgent);
  const isDesktop = !isMobile && !isTablet;

  let browser = "Unknown";
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";

  let os = "Unknown";
  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iOS")) os = "iOS";

  return {
    device: isMobile ? "Mobile" : isTablet ? "Tablet" : "Desktop",
    browser,
    os,
    isMobile,
    isTablet,
    isDesktop,
  };
}

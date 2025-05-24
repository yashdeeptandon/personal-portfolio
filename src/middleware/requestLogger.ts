import { NextRequest, NextResponse } from "next/server";
import {
  generateRequestId,
  logApiRequest,
  logSecurityEvent,
} from "@/lib/utils/logger";
import {
  getClientIP,
  getUserAgent,
  parseUserAgent,
} from "@/lib/utils/response";

// Request logging middleware
export function withRequestLogging<T extends any[]>(
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const method = request.method;
    const url = request.url;
    const pathname = new URL(url).pathname;

    // Add request ID to headers for tracing
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-request-id", requestId);

    // Get client information
    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);
    const deviceInfo = parseUserAgent(userAgent);

    // Create enhanced request object
    const enhancedRequest = new NextRequest(request, {
      headers: requestHeaders,
    });

    // Log incoming request
    const requestContext = {
      requestId,
      ipAddress,
      userAgent: deviceInfo.browser,
      device: deviceInfo.device,
      os: deviceInfo.os,
      pathname,
    };

    try {
      // Execute the handler
      const response = await handler(enhancedRequest, ...args);

      const duration = Date.now() - startTime;
      const statusCode = response.status;

      // Add request ID to response headers
      response.headers.set("x-request-id", requestId);

      // Log the completed request
      logApiRequest(method, pathname, statusCode, duration, requestId, {
        ...requestContext,
        responseSize: response.headers.get("content-length") || "unknown",
      });

      // Log security events for suspicious activity
      if (statusCode === 401) {
        logSecurityEvent("unauthorized_access", "medium", {
          ...requestContext,
          endpoint: pathname,
        });
      } else if (statusCode === 403) {
        logSecurityEvent("forbidden_access", "medium", {
          ...requestContext,
          endpoint: pathname,
        });
      } else if (statusCode >= 500) {
        logSecurityEvent("server_error", "high", {
          ...requestContext,
          endpoint: pathname,
          statusCode,
        });
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log the error
      logApiRequest(method, pathname, 500, duration, requestId, {
        ...requestContext,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Log security event for server errors
      logSecurityEvent("server_error", "critical", {
        ...requestContext,
        endpoint: pathname,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      throw error;
    }
  };
}

// Rate limiting logger
export function logRateLimitEvent(
  ipAddress: string,
  endpoint: string,
  limit: number,
  windowMs: number,
  context?: Record<string, any>
) {
  logSecurityEvent("rate_limit_exceeded", "medium", {
    ipAddress,
    endpoint,
    limit,
    windowMs,
    ...context,
  });
}

// CORS logger
export function logCorsEvent(
  origin: string,
  allowed: boolean,
  context?: Record<string, any>
) {
  logSecurityEvent("cors_request", allowed ? "low" : "medium", {
    origin,
    allowed,
    ...context,
  });
}

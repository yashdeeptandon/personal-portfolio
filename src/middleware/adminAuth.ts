import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import {
  unauthorizedResponse,
  forbiddenResponse,
  withErrorHandling,
} from "@/lib/utils/response";
import { logAuthEvent, logSecurityEvent } from "@/lib/utils/logger";
import { API_MESSAGES } from "@/lib/utils/constants";

/**
 * Admin authentication middleware
 * Ensures user is authenticated and has admin role
 */
export function withAdminAuth(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withErrorHandling(
    async (
      request: NextRequest | Request,
      context?: any
    ): Promise<NextResponse> => {
      const nextRequest = request as NextRequest;
      const session = await getServerSession(authOptions);
      const pathname = new URL(nextRequest.url).pathname;
      const method = nextRequest.method;

      // Check if user is authenticated
      if (!session || !session.user) {
        logAuthEvent("unauthorized_access", undefined, undefined, {
          endpoint: pathname,
          method,
          reason: "No session",
        });

        logSecurityEvent("unauthorized_admin_access", "medium", {
          endpoint: pathname,
          method,
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        });

        return unauthorizedResponse(API_MESSAGES.UNAUTHORIZED);
      }

      // Check if user has admin role
      if (session.user.role !== "admin") {
        logAuthEvent("forbidden_access", session.user.id, session.user.email, {
          endpoint: pathname,
          method,
          role: session.user.role,
          reason: "Insufficient privileges",
        });

        logSecurityEvent("forbidden_admin_access", "high", {
          endpoint: pathname,
          method,
          userId: session.user.id,
          userEmail: session.user.email,
          userRole: session.user.role,
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        });

        return forbiddenResponse(API_MESSAGES.FORBIDDEN);
      }

      // Check if user account is active
      if (!session.user.isActive) {
        logAuthEvent(
          "inactive_account_access",
          session.user.id,
          session.user.email,
          {
            endpoint: pathname,
            method,
            reason: "Account inactive",
          }
        );

        return forbiddenResponse("Account is inactive");
      }

      // Log successful admin access
      logAuthEvent("admin_access", session.user.id, session.user.email, {
        endpoint: pathname,
        method,
        role: session.user.role,
      });
      // Add user info to request headers for downstream handlers
      const requestHeaders = new Headers(nextRequest.headers);
      requestHeaders.set("x-admin-user-id", session.user.id);
      requestHeaders.set("x-admin-user-email", session.user.email || "");
      requestHeaders.set("x-admin-user-name", session.user.name || "");

      const enhancedRequest = new NextRequest(nextRequest, {
        headers: requestHeaders,
      });

      return handler(enhancedRequest, context);
    }
  );
}

/**
 * Check if current session has admin privileges
 * Used in React components and pages
 */
export async function checkAdminAuth(request?: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return { isAdmin: false, user: null, error: "Not authenticated" };
    }

    if (session.user.role !== "admin") {
      return {
        isAdmin: false,
        user: session.user,
        error: "Insufficient privileges",
      };
    }

    if (!session.user.isActive) {
      return { isAdmin: false, user: session.user, error: "Account inactive" };
    }

    return { isAdmin: true, user: session.user, error: null };
  } catch (error) {
    return { isAdmin: false, user: null, error: "Authentication check failed" };
  }
}

/**
 * Admin role validation for client-side components
 */
export function validateAdminRole(user: any): boolean {
  return user && user.role === "admin" && user.isActive;
}

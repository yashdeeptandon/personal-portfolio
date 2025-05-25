import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db/connection";
import Newsletter from "@/models/Newsletter";
import Analytics from "@/models/Analytics";
import { authOptions } from "@/lib/auth/config";
import {
  newsletterCreateSchema,
  paginationSchema,
} from "@/lib/validation/schemas";
import {
  successResponse,
  errorResponse,
  createdResponse,
  unauthorizedResponse,
  validationErrorResponse,
  withErrorHandling,
  parsePaginationParams,
  createPaginationMeta,
  getClientIP,
  getUserAgent,
  parseUserAgent,
} from "@/lib/utils/response";
import { API_MESSAGES, ANALYTICS_EVENTS } from "@/lib/utils/constants";
import { emailService } from "@/services/email";

// GET /api/newsletter - Get all newsletter subscribers (admin only)
export const GET = withErrorHandling(async (request: NextRequest | Request) => {
  const nextRequest = request as NextRequest;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return unauthorizedResponse(API_MESSAGES.UNAUTHORIZED);
  }

  await dbConnect();

  const { searchParams } = new URL(nextRequest.url);
  const { page, limit, sort, order, search, skip } =
    parsePaginationParams(searchParams);

  // Build query
  let query: any = {};

  // Add search functionality
  if (search) {
    query.$or = [
      { email: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by status
  const status = searchParams.get("status");
  if (status) {
    query.status = status;
  }

  // Filter by source
  const source = searchParams.get("source");
  if (source) {
    query.source = source;
  }

  // Build sort object
  let sortObj: any = {};
  sortObj[sort] = order;

  try {
    // Get total count for pagination
    const total = await Newsletter.countDocuments(query);

    // Get subscribers with pagination
    const subscribers = await Newsletter.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    const pagination = createPaginationMeta(page, limit, total);

    return successResponse(
      "Newsletter subscribers retrieved successfully",
      subscribers,
      200,
      pagination
    );
  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error);
    return errorResponse(API_MESSAGES.INTERNAL_ERROR);
  }
});

// POST /api/newsletter - Subscribe to newsletter (public)
export const POST = withErrorHandling(
  async (request: NextRequest | Request) => {
    const nextRequest = request as NextRequest;
    await dbConnect();

    try {
      const body = await nextRequest.json();

      // Validate request body
      const { error, value } = newsletterCreateSchema.validate(body);
      if (error) {
        return validationErrorResponse(
          API_MESSAGES.VALIDATION_ERROR,
          error.details[0].message
        );
      }

      // Check if email already exists
      const existingSubscriber = await Newsletter.findOne({
        email: value.email,
      });

      if (existingSubscriber) {
        if (existingSubscriber.status === "active") {
          return errorResponse(
            "Email is already subscribed to the newsletter",
            409
          );
        } else {
          // Reactivate subscription
          existingSubscriber.status = "active";
          existingSubscriber.subscribedAt = new Date();
          existingSubscriber.preferences = {
            ...existingSubscriber.preferences,
            ...value.preferences,
          };
          await existingSubscriber.save();

          // Send welcome email for reactivated subscription
          try {
            await emailService.sendNewsletterWelcome({
              to: existingSubscriber.email,
              name: existingSubscriber.name,
              subscriberId: existingSubscriber._id.toString(),
              preferences: existingSubscriber.preferences,
            });
          } catch (emailError) {
            console.error("Failed to send welcome email:", emailError);
          }

          return successResponse(
            "Newsletter subscription reactivated successfully",
            {
              id: existingSubscriber._id,
              message:
                "Welcome back! You've been resubscribed to our newsletter.",
            }
          );
        }
      }

      // Get client information
      const ipAddress = getClientIP(nextRequest);
      const userAgent = getUserAgent(nextRequest);
      const deviceInfo = parseUserAgent(userAgent);

      // Create new newsletter subscription
      const subscriber = new Newsletter({
        ...value,
        ipAddress,
        userAgent,
      });

      await subscriber.save();

      // Track analytics
      try {
        const analytics = new Analytics({
          type: ANALYTICS_EVENTS.NEWSLETTER_SUBSCRIPTION,
          path: "/newsletter",
          referrer: nextRequest.headers.get("referer"),
          userAgent,
          ipAddress,
          device: deviceInfo.device,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          metadata: {
            subscriberId: subscriber._id,
            email: subscriber.email,
            source: subscriber.source,
            preferences: subscriber.preferences,
          },
        });

        await analytics.save();
      } catch (analyticsError) {
        // Don't fail the request if analytics fails
        console.error("Analytics error:", analyticsError);
      }

      // Send welcome email
      try {
        const welcomeEmailResult = await emailService.sendNewsletterWelcome({
          to: subscriber.email,
          name: subscriber.name,
          subscriberId: subscriber._id.toString(),
          preferences: subscriber.preferences,
        });

        if (!welcomeEmailResult.success) {
          console.error(
            "Failed to send welcome email:",
            welcomeEmailResult.error
          );
        }
      } catch (emailError) {
        // Don't fail the request if email fails
        console.error("Welcome email error:", emailError);
      }

      return createdResponse("Newsletter subscription created successfully", {
        id: subscriber._id,
        message:
          "Thank you for subscribing! Check your email for a welcome message.",
      });
    } catch (error) {
      console.error("Error creating newsletter subscription:", error);
      return errorResponse(API_MESSAGES.INTERNAL_ERROR);
    }
  }
);

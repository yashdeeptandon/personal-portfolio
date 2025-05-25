import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/db/connection";
import Contact from "@/models/Contact";
import Analytics from "@/models/Analytics";
import { authOptions } from "@/lib/auth/config";
import {
  contactCreateSchema,
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

// GET /api/contact - Get all contact messages (admin only)
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
    query.$text = { $search: search };
  }

  // Filter by status
  const status = searchParams.get("status");
  if (status) {
    query.status = status;
  }

  // Filter by priority
  const priority = searchParams.get("priority");
  if (priority) {
    query.priority = priority;
  }

  // Filter by source
  const source = searchParams.get("source");
  if (source) {
    query.source = source;
  }

  // Build sort object
  const sortObj: any = {};
  if (search) {
    sortObj.score = { $meta: "textScore" };
  }
  sortObj[sort] = order;

  try {
    // Get total count for pagination
    const total = await Contact.countDocuments(query);

    // Get contacts with pagination
    const contacts = await Contact.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    const pagination = createPaginationMeta(page, limit, total);

    return successResponse(
      "Contact messages retrieved successfully",
      contacts,
      200,
      pagination
    );
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return errorResponse(API_MESSAGES.INTERNAL_ERROR);
  }
});

// POST /api/contact - Create new contact message (public)
export const POST = withErrorHandling(
  async (request: NextRequest | Request) => {
    const nextRequest = request as NextRequest;
    await dbConnect();

    try {
      const body = await nextRequest.json();

      // Validate request body
      const { error, value } = contactCreateSchema.validate(body);
      if (error) {
        return validationErrorResponse(
          API_MESSAGES.VALIDATION_ERROR,
          error.details[0].message
        );
      }

      // Get client information
      const ipAddress = getClientIP(nextRequest);
      const userAgent = getUserAgent(nextRequest);
      const deviceInfo = parseUserAgent(userAgent);

      // Create new contact message
      const contact = new Contact({
        ...value,
        ipAddress,
        userAgent,
        source: "website", // Default source for API submissions
      });

      await contact.save();

      // Track analytics
      try {
        const analytics = new Analytics({
          type: ANALYTICS_EVENTS.CONTACT_FORM,
          path: "/contact",
          referrer: nextRequest.headers.get("referer"),
          userAgent,
          ipAddress,
          device: deviceInfo.device,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          metadata: {
            contactId: contact._id,
            subject: contact.subject,
            priority: contact.priority,
          },
        });

        await analytics.save();
      } catch (analyticsError) {
        // Don't fail the request if analytics fails
        console.error("Analytics error:", analyticsError);
      }

      // Send email notifications
      try {
        // Get admin email from environment or use default
        const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL;

        if (adminEmail) {
          // Send notification to admin
          const adminNotificationResult =
            await emailService.sendContactNotification({
              to: adminEmail,
              contactData: {
                name: contact.name,
                email: contact.email,
                subject: contact.subject,
                message: contact.message,
                phone: contact.phone,
                company: contact.company,
              },
              submissionId: contact._id.toString(),
              submissionDate: contact.createdAt,
              ipAddress,
              userAgent,
            });

          if (!adminNotificationResult.success) {
            console.error(
              "Failed to send admin notification:",
              adminNotificationResult.error
            );
          }

          // Send confirmation to user
          const userConfirmationResult =
            await emailService.sendContactConfirmation({
              to: contact.email,
              contactData: {
                name: contact.name,
                email: contact.email,
                subject: contact.subject,
                message: contact.message,
                phone: contact.phone,
                company: contact.company,
              },
              submissionId: contact._id.toString(),
              expectedResponseTime: "24-48 hours",
            });

          if (!userConfirmationResult.success) {
            console.error(
              "Failed to send user confirmation:",
              userConfirmationResult.error
            );
          }
        } else {
          console.warn("No admin email configured for contact notifications");
        }
      } catch (emailError) {
        // Don't fail the request if email fails
        console.error("Email notification error:", emailError);
      }

      return createdResponse(API_MESSAGES.CONTACT_CREATED, {
        id: contact._id,
        message:
          "Your message has been sent successfully. We will get back to you soon!",
      });
    } catch (error) {
      console.error("Error creating contact:", error);
      return errorResponse(API_MESSAGES.INTERNAL_ERROR);
    }
  }
);

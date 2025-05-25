import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connection";
import Newsletter from "@/models/Newsletter";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
  withErrorHandling,
} from "@/lib/utils/response";
import { API_MESSAGES } from "@/lib/utils/constants";

// GET /api/newsletter/unsubscribe - Unsubscribe from newsletter (public)
export const GET = withErrorHandling(async (request: NextRequest | Request) => {
  const nextRequest = request as NextRequest;
  await dbConnect();

  const { searchParams } = new URL(nextRequest.url);
  const subscriberId = searchParams.get("id");
  const email = searchParams.get("email");

  if (!subscriberId && !email) {
    return validationErrorResponse(
      "Missing required parameter",
      "Either subscriber ID or email is required"
    );
  }

  try {
    let subscriber;

    if (subscriberId) {
      subscriber = await Newsletter.findById(subscriberId);
    } else if (email) {
      subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    }

    if (!subscriber) {
      return notFoundResponse("Subscriber not found");
    }

    if (subscriber.status === "unsubscribed") {
      return successResponse("Already unsubscribed", {
        message: "You are already unsubscribed from our newsletter.",
        status: "unsubscribed"
      });
    }

    // Unsubscribe the user
    subscriber.status = "unsubscribed";
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    return successResponse("Successfully unsubscribed", {
      message: "You have been successfully unsubscribed from our newsletter.",
      status: "unsubscribed"
    });

  } catch (error) {
    console.error("Error unsubscribing from newsletter:", error);
    return errorResponse(API_MESSAGES.INTERNAL_ERROR);
  }
});

// POST /api/newsletter/unsubscribe - Unsubscribe from newsletter (public)
export const POST = withErrorHandling(async (request: NextRequest | Request) => {
  const nextRequest = request as NextRequest;
  await dbConnect();

  try {
    const body = await nextRequest.json();
    const { subscriberId, email } = body;

    if (!subscriberId && !email) {
      return validationErrorResponse(
        "Missing required parameter",
        "Either subscriber ID or email is required"
      );
    }

    let subscriber;

    if (subscriberId) {
      subscriber = await Newsletter.findById(subscriberId);
    } else if (email) {
      subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    }

    if (!subscriber) {
      return notFoundResponse("Subscriber not found");
    }

    if (subscriber.status === "unsubscribed") {
      return successResponse("Already unsubscribed", {
        message: "You are already unsubscribed from our newsletter.",
        status: "unsubscribed"
      });
    }

    // Unsubscribe the user
    subscriber.status = "unsubscribed";
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    return successResponse("Successfully unsubscribed", {
      message: "You have been successfully unsubscribed from our newsletter.",
      status: "unsubscribed"
    });

  } catch (error) {
    console.error("Error unsubscribing from newsletter:", error);
    return errorResponse(API_MESSAGES.INTERNAL_ERROR);
  }
});

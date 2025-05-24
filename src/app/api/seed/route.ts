import { NextRequest } from "next/server";
import { seedDatabase } from "@/lib/db/seed";
import {
  successResponse,
  errorResponse,
  withErrorHandling,
} from "@/lib/utils/response";

// POST /api/seed - Seed the database with initial data
export const POST = withErrorHandling(
  async (request: NextRequest | Request) => {
    // Only allow seeding in development environment
    if (process.env.NODE_ENV === "production") {
      return errorResponse("Seeding is not allowed in production", 403);
    }

    try {
      const result = await seedDatabase();
      return successResponse("Database seeded successfully", result);
    } catch (error) {
      console.error("Seeding error:", error);
      return errorResponse("Failed to seed database", 500);
    }
  }
);

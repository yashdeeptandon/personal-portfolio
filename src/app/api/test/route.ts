import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connection";
import {
  successResponse,
  errorResponse,
  withErrorHandling,
} from "@/lib/utils/response";
import { withRequestLogging } from "@/middleware/requestLogger";
import { withDatabaseValidation } from "@/middleware/envValidation";
import {
  logStartup,
  logDatabaseOperation,
  logPerformance,
  logApplicationInfo,
} from "@/lib/utils/logger";
import { initializeApplication } from "@/lib/utils/startup";

// GET /api/test - Test database connection and API setup
export const GET = withRequestLogging(
  withDatabaseValidation(
    withErrorHandling(async (request: NextRequest | Request) => {
      const startTime = Date.now();

      try {
        logStartup("Running API health check...");

        // Log application info
        logApplicationInfo();

        // Test database connection
        const dbStart = Date.now();
        await dbConnect();
        logDatabaseOperation("health_check", "mongodb", Date.now() - dbStart);

        // Run initialization check
        const initResult = await initializeApplication();

        const totalTime = Date.now() - startTime;
        logPerformance("api_health_check", totalTime, 1000);

        return successResponse("API is working! All systems operational.", {
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
          database: "Connected",
          healthCheck: "Passed",
          responseTime: `${totalTime}ms`,
          initialization: initResult,
          features: {
            logging: "Enabled",
            authentication: "Configured",
            database: "Connected",
            validation: "Active",
          },
        });
      } catch (error) {
        logDatabaseOperation("error", "health_check", Date.now() - startTime, {
          error: String(error),
        });
        return errorResponse("Health check failed", 500);
      }
    })
  )
);

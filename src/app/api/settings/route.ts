import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connection";
import Settings from "@/models/Settings";
import { withAdminAuth } from "@/middleware/adminAuth";
import {
  successResponse,
  validationErrorResponse,
  withErrorHandling,
} from "@/lib/utils/response";
import { logDatabaseOperation, logAuthEvent } from "@/lib/utils/logger";
import { settingsValidation } from "../../../lib/validation/settings";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

// GET /api/settings - Get site settings
export const GET = withErrorHandling(
  async (_request: NextRequest | Request) => {
    const startTime = Date.now();
    await dbConnect();

    try {
      let settings = await Settings.findOne().lean();

      // If no settings exist, create default settings
      if (!settings) {
        const defaultSettings = new Settings({
          siteName: "Portfolio Website",
          siteDescription:
            "Professional portfolio showcasing skills and projects",
          siteUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
          contactEmail: process.env.ADMIN_EMAIL || "admin@example.com",
          socialMedia: {},
          seo: {
            keywords: ["portfolio", "developer", "web development"],
          },
          analytics: {
            googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || "",
          },
          email: {
            fromName: process.env.FROM_NAME || "Portfolio",
            fromEmail:
              process.env.FROM_EMAIL ||
              process.env.ADMIN_EMAIL ||
              "admin@example.com",
          },
          features: {
            blogEnabled: true,
            projectsEnabled: true,
            testimonialsEnabled: true,
            contactFormEnabled: true,
            newsletterEnabled: true,
            commentsEnabled: false,
          },
          maintenance: {
            enabled: false,
            message: "Site is under maintenance. Please check back later.",
            allowedIPs: [],
          },
          theme: {
            primaryColor: "#3b82f6",
            secondaryColor: "#64748b",
            darkMode: false,
          },
        });

        settings = await defaultSettings.save();
      }

      logDatabaseOperation(
        "fetch_settings",
        "settings",
        Date.now() - startTime
      );

      return successResponse("Settings retrieved successfully", { settings });
    } catch (error) {
      throw error;
    }
  }
);

// PUT /api/settings - Update site settings
export const PUT = withAdminAuth(
  withErrorHandling(async (request: NextRequest | Request) => {
    const startTime = Date.now();
    await dbConnect();

    const session = await getServerSession(authOptions);
    const body = await request.json();

    // Validate input
    const { error, value } = settingsValidation.update.validate(body);
    if (error) {
      return validationErrorResponse(error.details[0].message);
    }

    try {
      let settings = await Settings.findOne();

      if (!settings) {
        // Create new settings if none exist
        settings = new Settings(value);
      } else {
        // Update existing settings
        Object.assign(settings, value);
        settings.updatedAt = new Date();
      }

      await settings.save();

      logDatabaseOperation(
        "update_settings",
        "settings",
        Date.now() - startTime
      );

      logAuthEvent(
        "admin_access",
        session?.user?.id || "unknown",
        session?.user?.email,
        {
          action: "update_settings",
          resource: "settings",
          resourceId: settings._id.toString(),
          changes: Object.keys(value),
        }
      );

      return successResponse("Settings updated successfully", { settings });
    } catch (error) {
      throw error;
    }
  })
);

// POST /api/settings/reset - Reset settings to default
export const POST = withAdminAuth(
  withErrorHandling(async (_request: NextRequest | Request) => {
    const startTime = Date.now();
    await dbConnect();

    const session = await getServerSession(authOptions);

    try {
      // Delete existing settings
      await Settings.deleteMany({});

      // Create default settings
      const defaultSettings = new Settings({
        siteName: "Portfolio Website",
        siteDescription:
          "Professional portfolio showcasing skills and projects",
        siteUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
        contactEmail: process.env.ADMIN_EMAIL || "admin@example.com",
        socialMedia: {},
        seo: {
          keywords: ["portfolio", "developer", "web development"],
        },
        analytics: {
          googleAnalyticsId: process.env.GOOGLE_ANALYTICS_ID || "",
        },
        email: {
          fromName: process.env.FROM_NAME || "Portfolio",
          fromEmail:
            process.env.FROM_EMAIL ||
            process.env.ADMIN_EMAIL ||
            "admin@example.com",
        },
        features: {
          blogEnabled: true,
          projectsEnabled: true,
          testimonialsEnabled: true,
          contactFormEnabled: true,
          newsletterEnabled: true,
          commentsEnabled: false,
        },
        maintenance: {
          enabled: false,
          message: "Site is under maintenance. Please check back later.",
          allowedIPs: [],
        },
        theme: {
          primaryColor: "#3b82f6",
          secondaryColor: "#64748b",
          darkMode: false,
        },
      });

      const settings = await defaultSettings.save();

      logDatabaseOperation(
        "reset_settings",
        "settings",
        Date.now() - startTime
      );

      logAuthEvent(
        "admin_access",
        session?.user?.id || "unknown",
        session?.user?.email,
        {
          action: "reset_settings",
          resource: "settings",
          resourceId: settings._id.toString(),
          resetAction: "reset_to_default",
        }
      );

      return successResponse("Settings reset to default successfully", {
        settings,
      });
    } catch (error) {
      throw error;
    }
  })
);

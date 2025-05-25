import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connection";
import Analytics from "@/models/Analytics";
import { withAdminAuth } from "@/middleware/adminAuth";
import { successResponse, withErrorHandling } from "@/lib/utils/response";
import { API_MESSAGES } from "@/lib/utils/constants";
import { logDatabaseOperation } from "@/lib/utils/logger";

// GET /api/analytics - Get analytics data with filtering and aggregation
export const GET = withAdminAuth(
  withErrorHandling(async (request: NextRequest | Request) => {
    const startTime = Date.now();
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d"; // 7d, 30d, 90d, 1y
    const type = searchParams.get("type"); // page_view, blog_view, project_view, etc.
    const page = searchParams.get("page");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    try {
      // Calculate date range based on period
      const now = new Date();
      let dateFilter: any = {};

      if (startDate && endDate) {
        dateFilter = {
          timestamp: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        };
      } else {
        let daysBack = 30;
        switch (period) {
          case "7d":
            daysBack = 7;
            break;
          case "30d":
            daysBack = 30;
            break;
          case "90d":
            daysBack = 90;
            break;
          case "1y":
            daysBack = 365;
            break;
        }

        const startPeriod = new Date(now);
        startPeriod.setDate(startPeriod.getDate() - daysBack);

        dateFilter = {
          timestamp: {
            $gte: startPeriod,
            $lte: now,
          },
        };
      }

      // Build filter
      const filter: any = { ...dateFilter };
      if (type) filter.eventType = type;
      if (page) filter.page = page;

      // Get overview statistics
      const [
        totalEvents,
        uniqueVisitors,
        pageViews,
        topPages,
        topReferrers,
        deviceStats,
        browserStats,
        countryStats,
        dailyStats,
      ] = await Promise.all([
        // Total events
        Analytics.countDocuments(filter),

        // Unique visitors
        Analytics.distinct("sessionId", filter),

        // Page views
        Analytics.countDocuments({
          ...filter,
          eventType: "page_view",
        }),

        // Top pages
        Analytics.aggregate([
          { $match: { ...filter, eventType: "page_view" } },
          { $group: { _id: "$page", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          { $project: { page: "$_id", views: "$count", _id: 0 } },
        ]),

        // Top referrers
        Analytics.aggregate([
          { $match: { ...filter, referrer: { $nin: [null, ""] } } },
          { $group: { _id: "$referrer", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          { $project: { referrer: "$_id", visits: "$count", _id: 0 } },
        ]),

        // Device statistics
        Analytics.aggregate([
          { $match: filter },
          { $group: { _id: "$userAgent.device", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $project: { device: "$_id", count: "$count", _id: 0 } },
        ]),

        // Browser statistics
        Analytics.aggregate([
          { $match: filter },
          { $group: { _id: "$userAgent.browser", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $project: { browser: "$_id", count: "$count", _id: 0 } },
        ]),

        // Country statistics
        Analytics.aggregate([
          { $match: filter },
          { $group: { _id: "$location.country", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          { $project: { country: "$_id", count: "$count", _id: 0 } },
        ]),

        // Daily statistics for the period
        Analytics.aggregate([
          { $match: filter },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$timestamp",
                },
              },
              pageViews: {
                $sum: {
                  $cond: [{ $eq: ["$eventType", "page_view"] }, 1, 0],
                },
              },
              uniqueVisitors: { $addToSet: "$sessionId" },
              totalEvents: { $sum: 1 },
            },
          },
          {
            $project: {
              date: "$_id",
              pageViews: 1,
              uniqueVisitors: { $size: "$uniqueVisitors" },
              totalEvents: 1,
              _id: 0,
            },
          },
          { $sort: { date: 1 } },
        ]),
      ]);

      // Calculate bounce rate (simplified - sessions with only one page view)
      const singlePageSessions = await Analytics.aggregate([
        { $match: { ...filter, eventType: "page_view" } },
        { $group: { _id: "$sessionId", pageViews: { $sum: 1 } } },
        { $match: { pageViews: 1 } },
        { $count: "bounced" },
      ]);

      const bounceRate =
        uniqueVisitors.length > 0
          ? ((singlePageSessions[0]?.bounced || 0) / uniqueVisitors.length) *
            100
          : 0;

      logDatabaseOperation(
        "fetch_analytics",
        "analytics",
        Date.now() - startTime,
        { period, type, totalEvents }
      );

      return successResponse("Analytics data retrieved successfully", {
        overview: {
          totalEvents,
          uniqueVisitors: uniqueVisitors.length,
          pageViews,
          bounceRate: Math.round(bounceRate * 100) / 100,
        },
        topPages,
        topReferrers,
        deviceStats,
        browserStats,
        countryStats,
        dailyStats,
        period,
        dateRange: {
          start: dateFilter.timestamp.$gte,
          end: dateFilter.timestamp.$lte,
        },
      });
    } catch (error) {
      throw error;
    }
  })
);

// POST /api/analytics - Track analytics event
export const POST = withErrorHandling(
  async (request: NextRequest | Request) => {
    const startTime = Date.now();
    await dbConnect();

    try {
      const body = await request.json();
      const { eventType, page, referrer, sessionId, userId, metadata } = body;

      // Get user agent and IP information
      const userAgent = request.headers.get("user-agent") || "";
      const ip =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown";

      // Create analytics record
      const analyticsData = new Analytics({
        eventType,
        page,
        referrer,
        sessionId,
        userId,
        metadata,
        userAgent: {
          raw: userAgent,
          // You can add user agent parsing here if needed
        },
        ipAddress: ip,
        timestamp: new Date(),
      });

      await analyticsData.save();

      logDatabaseOperation(
        "create_analytics",
        "analytics",
        Date.now() - startTime,
        { eventType, page }
      );

      return successResponse(
        "Event tracked successfully",
        { tracked: true },
        201
      );
    } catch (error) {
      throw error;
    }
  }
);

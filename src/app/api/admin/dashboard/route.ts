import { NextRequest } from "next/server";
import dbConnect from "@/lib/db/connection";
import Blog from "@/models/Blog";
import Project from "@/models/Project";
import Contact from "@/models/Contact";
import Testimonial from "@/models/Testimonial";
import Analytics from "@/models/Analytics";
import { withAdminAuth } from "@/middleware/adminAuth";
import { successResponse, withErrorHandling } from "@/lib/utils/response";
import { API_MESSAGES } from "@/lib/utils/constants";
import { logDatabaseOperation, logPerformance } from "@/lib/utils/logger";

// GET /api/admin/dashboard - Get dashboard statistics and recent activity
export const GET = withAdminAuth(
  withErrorHandling(async (request: Request | NextRequest) => {
    const nextRequest = request as NextRequest;
    const startTime = Date.now();
    await dbConnect();

    try {
      // Fetch blog statistics
      const blogStatsStart = Date.now();
      const [
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        blogViewsResult,
        blogLikesResult,
      ] = await Promise.all([
        Blog.countDocuments(),
        Blog.countDocuments({ status: "published" }),
        Blog.countDocuments({ status: "draft" }),
        Blog.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]),
        Blog.aggregate([{ $group: { _id: null, total: { $sum: "$likes" } } }]),
      ]);

      logDatabaseOperation(
        "aggregate_blog_stats",
        "blogs",
        Date.now() - blogStatsStart
      );

      // Fetch project statistics
      const projectStatsStart = Date.now();
      const [totalProjects, completedProjects, inProgressProjects] =
        await Promise.all([
          Project.countDocuments(),
          Project.countDocuments({ status: "completed" }),
          Project.countDocuments({ status: "in-progress" }),
        ]);

      logDatabaseOperation(
        "aggregate_project_stats",
        "projects",
        Date.now() - projectStatsStart
      );

      // Fetch contact statistics
      const contactStatsStart = Date.now();
      const [totalContacts, unreadContacts, repliedContacts] =
        await Promise.all([
          Contact.countDocuments(),
          Contact.countDocuments({ status: "new" }),
          Contact.countDocuments({ status: "replied" }),
        ]);

      logDatabaseOperation(
        "aggregate_contact_stats",
        "contacts",
        Date.now() - contactStatsStart
      );

      // Fetch testimonial statistics
      const testimonialStatsStart = Date.now();
      const [totalTestimonials, pendingTestimonials, approvedTestimonials] =
        await Promise.all([
          Testimonial.countDocuments(),
          Testimonial.countDocuments({ status: "pending" }),
          Testimonial.countDocuments({ status: "approved" }),
        ]);

      logDatabaseOperation(
        "aggregate_testimonial_stats",
        "testimonials",
        Date.now() - testimonialStatsStart
      );

      // Fetch analytics statistics
      const analyticsStatsStart = Date.now();
      const [pageViewsResult, uniqueVisitorsResult] = await Promise.all([
        Analytics.countDocuments({ type: "page_view" }),
        Analytics.distinct("ipAddress", { type: "page_view" }),
      ]);

      logDatabaseOperation(
        "aggregate_analytics_stats",
        "analytics",
        Date.now() - analyticsStatsStart
      );

      // Fetch recent activity
      const recentActivityStart = Date.now();
      const [recentBlogs, recentProjects, recentContacts, recentTestimonials] =
        await Promise.all([
          Blog.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .select("title status createdAt"),
          Project.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .select("title status createdAt"),
          Contact.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .select("name subject status createdAt"),
          Testimonial.find()
            .sort({ createdAt: -1 })
            .limit(3)
            .select("name content status createdAt"),
        ]);

      logDatabaseOperation(
        "fetch_recent_activity",
        "multiple",
        Date.now() - recentActivityStart
      );

      // Compile statistics
      const stats = {
        blogs: {
          total: totalBlogs,
          published: publishedBlogs,
          drafts: draftBlogs,
          totalViews: blogViewsResult[0]?.total || 0,
          totalLikes: blogLikesResult[0]?.total || 0,
        },
        projects: {
          total: totalProjects,
          completed: completedProjects,
          inProgress: inProgressProjects,
        },
        contacts: {
          total: totalContacts,
          unread: unreadContacts,
          replied: repliedContacts,
        },
        testimonials: {
          total: totalTestimonials,
          pending: pendingTestimonials,
          approved: approvedTestimonials,
        },
        analytics: {
          totalPageViews: pageViewsResult,
          uniqueVisitors: uniqueVisitorsResult.length,
          bounceRate: 0, // Calculate this based on your analytics logic
        },
      };

      // Compile recent activity
      const recentActivity = [
        ...recentBlogs.map((blog) => ({
          id: blog._id.toString(),
          type: "blog" as const,
          title: `Blog: ${blog.title}`,
          description: `Status: ${blog.status}`,
          timestamp: blog.createdAt.toISOString(),
          status: blog.status,
        })),
        ...recentProjects.map((project) => ({
          id: project._id.toString(),
          type: "project" as const,
          title: `Project: ${project.title}`,
          description: `Status: ${project.status}`,
          timestamp: project.createdAt.toISOString(),
          status: project.status,
        })),
        ...recentContacts.map((contact) => ({
          id: contact._id.toString(),
          type: "contact" as const,
          title: `Message from ${contact.name}`,
          description: contact.subject,
          timestamp: contact.createdAt.toISOString(),
          status: contact.status,
        })),
        ...recentTestimonials.map((testimonial) => ({
          id: testimonial._id.toString(),
          type: "testimonial" as const,
          title: `Testimonial from ${testimonial.name}`,
          description: testimonial.content.substring(0, 100) + "...",
          timestamp: testimonial.createdAt.toISOString(),
          status: testimonial.status,
        })),
      ]
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 10);

      const totalDuration = Date.now() - startTime;
      logPerformance("admin_dashboard_load", totalDuration, 2000, {
        statsCount: Object.keys(stats).length,
        activityCount: recentActivity.length,
      });

      return successResponse(API_MESSAGES.SUCCESS, {
        stats,
        recentActivity,
      });
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
      throw error;
    }
  })
);

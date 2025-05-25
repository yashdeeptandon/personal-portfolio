import mongoose, { Schema } from "mongoose";
import { IAnalytics } from "@/types";

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    type: {
      type: String,
      required: [true, "Analytics type is required"],
      enum: [
        "page_view",
        "blog_view",
        "project_view",
        "contact_form",
        "newsletter_subscription",
        "download",
        "click",
      ],
    },
    path: {
      type: String,
      required: [true, "Path is required"],
      trim: true,
    },
    referrer: {
      type: String,
      trim: true,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    country: {
      type: String,
      trim: true,
      default: null,
    },
    city: {
      type: String,
      trim: true,
      default: null,
    },
    device: {
      type: String,
      trim: true,
      default: null,
    },
    browser: {
      type: String,
      trim: true,
      default: null,
    },
    os: {
      type: String,
      trim: true,
      default: null,
    },
    sessionId: {
      type: String,
      default: null,
    },
    userId: {
      type: String,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
AnalyticsSchema.index({ type: 1 });
AnalyticsSchema.index({ path: 1 });
AnalyticsSchema.index({ timestamp: -1 });
AnalyticsSchema.index({ sessionId: 1 });
AnalyticsSchema.index({ userId: 1 });
AnalyticsSchema.index({ country: 1 });
AnalyticsSchema.index({ device: 1 });
AnalyticsSchema.index({ browser: 1 });
AnalyticsSchema.index({ os: 1 });

// Compound indexes for common queries
AnalyticsSchema.index({ type: 1, timestamp: -1 });
AnalyticsSchema.index({ path: 1, timestamp: -1 });
AnalyticsSchema.index({ type: 1, path: 1, timestamp: -1 });

// Static method to find by type
AnalyticsSchema.statics.findByType = function (
  type: string,
  options: any = {}
) {
  return this.find({ type }, null, options).sort({ timestamp: -1 });
};

// Static method to find by path
AnalyticsSchema.statics.findByPath = function (
  path: string,
  options: any = {}
) {
  return this.find({ path }, null, options).sort({ timestamp: -1 });
};

// Static method to find by date range
AnalyticsSchema.statics.findByDateRange = function (
  startDate: Date,
  endDate: Date,
  options: any = {}
) {
  return this.find(
    {
      timestamp: {
        $gte: startDate,
        $lte: endDate,
      },
    },
    null,
    options
  ).sort({ timestamp: -1 });
};

// Static method to get page views
AnalyticsSchema.statics.getPageViews = function (
  path?: string,
  startDate?: Date,
  endDate?: Date
) {
  const match: any = { type: "page_view" };

  if (path) match.path = path;
  if (startDate && endDate) {
    match.timestamp = { $gte: startDate, $lte: endDate };
  }

  return this.countDocuments(match);
};

// Static method to get popular pages
AnalyticsSchema.statics.getPopularPages = function (
  limit: number = 10,
  startDate?: Date,
  endDate?: Date
) {
  const match: any = { type: "page_view" };

  if (startDate && endDate) {
    match.timestamp = { $gte: startDate, $lte: endDate };
  }

  return this.aggregate([
    { $match: match },
    { $group: { _id: "$path", views: { $sum: 1 } } },
    { $sort: { views: -1 } },
    { $limit: limit },
  ]);
};

// Static method to get traffic by country
AnalyticsSchema.statics.getTrafficByCountry = function (
  limit: number = 10,
  startDate?: Date,
  endDate?: Date
) {
  const match: any = { type: "page_view", country: { $ne: null } };

  if (startDate && endDate) {
    match.timestamp = { $gte: startDate, $lte: endDate };
  }

  return this.aggregate([
    { $match: match },
    { $group: { _id: "$country", views: { $sum: 1 } } },
    { $sort: { views: -1 } },
    { $limit: limit },
  ]);
};

// Static method to get traffic by device
AnalyticsSchema.statics.getTrafficByDevice = function (
  startDate?: Date,
  endDate?: Date
) {
  const match: any = { type: "page_view", device: { $ne: null } };

  if (startDate && endDate) {
    match.timestamp = { $gte: startDate, $lte: endDate };
  }

  return this.aggregate([
    { $match: match },
    { $group: { _id: "$device", views: { $sum: 1 } } },
    { $sort: { views: -1 } },
  ]);
};

// Static method to get traffic by browser
AnalyticsSchema.statics.getTrafficByBrowser = function (
  startDate?: Date,
  endDate?: Date
) {
  const match: any = { type: "page_view", browser: { $ne: null } };

  if (startDate && endDate) {
    match.timestamp = { $gte: startDate, $lte: endDate };
  }

  return this.aggregate([
    { $match: match },
    { $group: { _id: "$browser", views: { $sum: 1 } } },
    { $sort: { views: -1 } },
  ]);
};

// Static method to get daily views
AnalyticsSchema.statics.getDailyViews = function (days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        type: "page_view",
        timestamp: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$timestamp" },
          month: { $month: "$timestamp" },
          day: { $dayOfMonth: "$timestamp" },
        },
        views: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
  ]);
};

// Static method to get referrer stats
AnalyticsSchema.statics.getReferrerStats = function (
  limit: number = 10,
  startDate?: Date,
  endDate?: Date
) {
  const match: any = {
    type: "page_view",
    referrer: { $ne: null, $nin: ["", null] },
  };

  if (startDate && endDate) {
    match.timestamp = { $gte: startDate, $lte: endDate };
  }

  return this.aggregate([
    { $match: match },
    { $group: { _id: "$referrer", views: { $sum: 1 } } },
    { $sort: { views: -1 } },
    { $limit: limit },
  ]);
};

const Analytics =
  mongoose.models.Analytics ||
  mongoose.model<IAnalytics>("Analytics", AnalyticsSchema);

export default Analytics;

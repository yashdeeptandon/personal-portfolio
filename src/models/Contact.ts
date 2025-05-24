import mongoose, { Schema } from "mongoose";
import { IContact } from "@/types";

const ContactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          return (
            !v || /^[\+]?[1-9][\d]{0,15}$/.test(v.replace(/[\s\-\(\)]/g, ""))
          );
        },
        message: "Please enter a valid phone number",
      },
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    source: {
      type: String,
      enum: ["website", "linkedin", "email", "referral", "other"],
      default: "website",
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
ContactSchema.index({ email: 1 });
ContactSchema.index({ status: 1 });
ContactSchema.index({ priority: 1 });
ContactSchema.index({ source: 1 });
ContactSchema.index({ createdAt: -1 });

// Text index for search functionality
ContactSchema.index({
  name: "text",
  email: "text",
  subject: "text",
  message: "text",
  company: "text",
});

// Virtual for priority color
ContactSchema.virtual("priorityColor").get(function () {
  const colors = {
    low: "green",
    medium: "yellow",
    high: "red",
  };
  return colors[this.priority] || "gray";
});

// Virtual for status color
ContactSchema.virtual("statusColor").get(function () {
  const colors = {
    new: "blue",
    read: "yellow",
    replied: "green",
    archived: "gray",
  };
  return colors[this.status] || "gray";
});

// Virtual for formatted date
ContactSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Static method to find by status
ContactSchema.statics.findByStatus = function (
  status: string,
  options: any = {}
) {
  return this.find({ status }, null, options).sort({ createdAt: -1 });
};

// Static method to find by priority
ContactSchema.statics.findByPriority = function (
  priority: string,
  options: any = {}
) {
  return this.find({ priority }, null, options).sort({ createdAt: -1 });
};

// Static method to find unread messages
ContactSchema.statics.findUnread = function (options: any = {}) {
  return this.find({ status: "new" }, null, options).sort({ createdAt: -1 });
};

// Static method to find high priority messages
ContactSchema.statics.findHighPriority = function (options: any = {}) {
  return this.find({ priority: "high" }, null, options).sort({ createdAt: -1 });
};

// Static method for search
ContactSchema.statics.search = function (query: string, options: any = {}) {
  return this.find(
    {
      $text: { $search: query },
    },
    null,
    options
  )
    .select({ score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" }, createdAt: -1 });
};

// Instance method to mark as read
ContactSchema.methods.markAsRead = function () {
  this.status = "read";
  return this.save();
};

// Instance method to mark as replied
ContactSchema.methods.markAsReplied = function () {
  this.status = "replied";
  return this.save();
};

// Instance method to archive
ContactSchema.methods.archive = function () {
  this.status = "archived";
  return this.save();
};

// Instance method to set priority
ContactSchema.methods.setPriority = function (
  priority: "low" | "medium" | "high"
) {
  this.priority = priority;
  return this.save();
};

const Contact =
  mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);

export default Contact;

import Joi from "joi";

// Settings Validation Schema
export const settingsUpdateSchema = Joi.object({
  // Site Information
  siteName: Joi.string().min(2).max(100).optional().messages({
    "string.min": "Site name must be at least 2 characters long",
    "string.max": "Site name cannot exceed 100 characters",
  }),
  siteDescription: Joi.string().min(10).max(500).optional().messages({
    "string.min": "Site description must be at least 10 characters long",
    "string.max": "Site description cannot exceed 500 characters",
  }),
  siteUrl: Joi.string().uri().optional().messages({
    "string.uri": "Site URL must be a valid URL",
  }),
  siteLogo: Joi.string().uri().allow(null, "").optional(),
  favicon: Joi.string().uri().allow(null, "").optional(),

  // Contact Information
  contactEmail: Joi.string().email().optional().messages({
    "string.email": "Please provide a valid contact email address",
  }),
  contactPhone: Joi.string().allow("").optional(),
  contactAddress: Joi.string().allow("").optional(),

  // Social Media Links
  socialMedia: Joi.object({
    github: Joi.string()
      .uri()
      .pattern(/^https:\/\/github\.com\//)
      .allow(null, "")
      .optional()
      .messages({
        "string.pattern.base": "GitHub URL must be a valid GitHub profile URL",
      }),
    linkedin: Joi.string()
      .uri()
      .pattern(/^https:\/\/www\.linkedin\.com\//)
      .allow(null, "")
      .optional()
      .messages({
        "string.pattern.base": "LinkedIn URL must be a valid LinkedIn profile URL",
      }),
    twitter: Joi.string()
      .uri()
      .pattern(/^https:\/\/(twitter\.com|x\.com)\//)
      .allow(null, "")
      .optional()
      .messages({
        "string.pattern.base": "Twitter URL must be a valid Twitter profile URL",
      }),
    instagram: Joi.string()
      .uri()
      .pattern(/^https:\/\/www\.instagram\.com\//)
      .allow(null, "")
      .optional()
      .messages({
        "string.pattern.base": "Instagram URL must be a valid Instagram profile URL",
      }),
    youtube: Joi.string()
      .uri()
      .pattern(/^https:\/\/www\.youtube\.com\//)
      .allow(null, "")
      .optional()
      .messages({
        "string.pattern.base": "YouTube URL must be a valid YouTube channel URL",
      }),
    website: Joi.string().uri().allow(null, "").optional(),
  }).optional(),

  // SEO Settings
  seo: Joi.object({
    metaTitle: Joi.string().max(60).allow("").optional().messages({
      "string.max": "Meta title cannot exceed 60 characters",
    }),
    metaDescription: Joi.string().max(160).allow("").optional().messages({
      "string.max": "Meta description cannot exceed 160 characters",
    }),
    keywords: Joi.array()
      .items(Joi.string().min(2).max(30))
      .max(20)
      .optional()
      .messages({
        "array.max": "Cannot exceed 20 keywords",
      }),
    ogImage: Joi.string().uri().allow(null, "").optional(),
  }).optional(),

  // Analytics
  analytics: Joi.object({
    googleAnalyticsId: Joi.string().allow("").optional(),
    googleTagManagerId: Joi.string().allow("").optional(),
    facebookPixelId: Joi.string().allow("").optional(),
  }).optional(),

  // Email Settings
  email: Joi.object({
    fromName: Joi.string().max(100).allow("").optional().messages({
      "string.max": "From name cannot exceed 100 characters",
    }),
    fromEmail: Joi.string().email().allow("").optional().messages({
      "string.email": "Please provide a valid from email address",
    }),
    replyToEmail: Joi.string().email().allow("").optional().messages({
      "string.email": "Please provide a valid reply-to email address",
    }),
  }).optional(),

  // Feature Flags
  features: Joi.object({
    blogEnabled: Joi.boolean().optional(),
    projectsEnabled: Joi.boolean().optional(),
    testimonialsEnabled: Joi.boolean().optional(),
    contactFormEnabled: Joi.boolean().optional(),
    newsletterEnabled: Joi.boolean().optional(),
    commentsEnabled: Joi.boolean().optional(),
  }).optional(),

  // Maintenance Mode
  maintenance: Joi.object({
    enabled: Joi.boolean().optional(),
    message: Joi.string().max(500).optional().messages({
      "string.max": "Maintenance message cannot exceed 500 characters",
    }),
    allowedIPs: Joi.array().items(Joi.string().ip()).optional().messages({
      "string.ip": "Please provide valid IP addresses",
    }),
  }).optional(),

  // Theme Settings
  theme: Joi.object({
    primaryColor: Joi.string()
      .pattern(/^#[0-9A-Fa-f]{6}$/)
      .optional()
      .messages({
        "string.pattern.base": "Primary color must be a valid hex color code",
      }),
    secondaryColor: Joi.string()
      .pattern(/^#[0-9A-Fa-f]{6}$/)
      .optional()
      .messages({
        "string.pattern.base": "Secondary color must be a valid hex color code",
      }),
    darkMode: Joi.boolean().optional(),
  }).optional(),
});

export const settingsValidation = {
  update: settingsUpdateSchema,
};

import Joi from "joi";

// User Validation Schemas
export const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).max(128).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "string.max": "Password cannot exceed 128 characters",
    "any.required": "Password is required",
  }),
  name: Joi.string().min(2).max(50).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 50 characters",
    "any.required": "Name is required",
  }),
  role: Joi.string().valid("admin", "user").default("user"),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required",
  }),
});

// Blog Validation Schemas
export const blogCreateSchema = Joi.object({
  title: Joi.string().min(5).max(200).required().messages({
    "string.min": "Title must be at least 5 characters long",
    "string.max": "Title cannot exceed 200 characters",
    "any.required": "Title is required",
  }),
  content: Joi.string().min(100).required().messages({
    "string.min": "Content must be at least 100 characters long",
    "any.required": "Content is required",
  }),
  excerpt: Joi.string().min(50).max(500).required().messages({
    "string.min": "Excerpt must be at least 50 characters long",
    "string.max": "Excerpt cannot exceed 500 characters",
    "any.required": "Excerpt is required",
  }),
  featuredImage: Joi.string().uri().allow(null, ""),
  tags: Joi.array().items(Joi.string().min(2).max(30)).max(10).default([]),
  category: Joi.string().min(2).max(50).required().messages({
    "string.min": "Category must be at least 2 characters long",
    "string.max": "Category cannot exceed 50 characters",
    "any.required": "Category is required",
  }),
  status: Joi.string().valid("draft", "published", "archived").default("draft"),
  author: Joi.string().min(2).max(100).default("Admin"),
  seo: Joi.object({
    metaTitle: Joi.string().max(60).allow(""),
    metaDescription: Joi.string().max(160).allow(""),
    keywords: Joi.array()
      .items(Joi.string().min(2).max(30))
      .max(10)
      .default([]),
  }).default({}),
});

export const blogUpdateSchema = blogCreateSchema.fork(
  ["title", "content", "excerpt", "category"],
  (schema) => schema.optional()
);

// Project Validation Schemas
export const projectCreateSchema = Joi.object({
  title: Joi.string().min(5).max(200).required().messages({
    "string.min": "Title must be at least 5 characters long",
    "string.max": "Title cannot exceed 200 characters",
    "any.required": "Title is required",
  }),
  description: Joi.string().min(100).required().messages({
    "string.min": "Description must be at least 100 characters long",
    "any.required": "Description is required",
  }),
  shortDescription: Joi.string().min(50).max(300).required().messages({
    "string.min": "Short description must be at least 50 characters long",
    "string.max": "Short description cannot exceed 300 characters",
    "any.required": "Short description is required",
  }),
  featuredImage: Joi.string().uri().allow(null, ""),
  images: Joi.array().items(Joi.string().uri()).max(10).default([]),
  technologies: Joi.array()
    .items(Joi.string().min(2).max(30))
    .min(1)
    .max(20)
    .required()
    .messages({
      "array.min": "At least one technology is required",
      "array.max": "Cannot exceed 20 technologies",
      "any.required": "Technologies are required",
    }),
  category: Joi.string().min(2).max(50).required().messages({
    "string.min": "Category must be at least 2 characters long",
    "string.max": "Category cannot exceed 50 characters",
    "any.required": "Category is required",
  }),
  status: Joi.string()
    .valid("planning", "in-progress", "completed", "archived")
    .default("planning"),
  githubUrl: Joi.string()
    .uri()
    .pattern(/^https:\/\/github\.com\//)
    .allow(null, "")
    .messages({
      "string.pattern.base": "GitHub URL must be a valid GitHub repository URL",
    }),
  liveUrl: Joi.string().uri().allow(null, ""),
  demoUrl: Joi.string().uri().allow(null, ""),
  startDate: Joi.date().required().messages({
    "any.required": "Start date is required",
  }),
  endDate: Joi.date().greater(Joi.ref("startDate")).allow(null).messages({
    "date.greater": "End date must be after start date",
  }),
  featured: Joi.boolean().default(false),
  order: Joi.number().integer().min(0).default(0),
  seo: Joi.object({
    metaTitle: Joi.string().max(60).allow(""),
    metaDescription: Joi.string().max(160).allow(""),
    keywords: Joi.array()
      .items(Joi.string().min(2).max(30))
      .max(10)
      .default([]),
  }).default({}),
});

export const projectUpdateSchema = projectCreateSchema.fork(
  [
    "title",
    "description",
    "shortDescription",
    "technologies",
    "category",
    "startDate",
  ],
  (schema) => schema.optional()
);

// Testimonial Validation Schemas
export const testimonialCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 100 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  company: Joi.string().min(2).max(100).allow(""),
  position: Joi.string().min(2).max(100).allow(""),
  avatar: Joi.string().uri().allow(null, ""),
  content: Joi.string().min(20).max(1000).required().messages({
    "string.min": "Testimonial content must be at least 20 characters long",
    "string.max": "Testimonial content cannot exceed 1000 characters",
    "any.required": "Testimonial content is required",
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    "number.min": "Rating must be at least 1",
    "number.max": "Rating cannot exceed 5",
    "any.required": "Rating is required",
  }),
  projectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .allow(null, "")
    .messages({
      "string.pattern.base": "Project ID must be a valid MongoDB ObjectId",
    }),
  linkedinUrl: Joi.string()
    .uri()
    .pattern(/^https:\/\/www\.linkedin\.com\//)
    .allow(null, "")
    .messages({
      "string.pattern.base":
        "LinkedIn URL must be a valid LinkedIn profile URL",
    }),
});

export const testimonialUpdateSchema = testimonialCreateSchema.fork(
  ["name", "email", "content", "rating"],
  (schema) => schema.optional()
);

// Contact Validation Schemas
export const contactCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.min": "Name must be at least 2 characters long",
    "string.max": "Name cannot exceed 100 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  subject: Joi.string().min(5).max(200).required().messages({
    "string.min": "Subject must be at least 5 characters long",
    "string.max": "Subject cannot exceed 200 characters",
    "any.required": "Subject is required",
  }),
  message: Joi.string().min(20).max(2000).required().messages({
    "string.min": "Message must be at least 20 characters long",
    "string.max": "Message cannot exceed 2000 characters",
    "any.required": "Message is required",
  }),
  phone: Joi.string()
    .pattern(/^[\+]?[1-9][\d\s\-\(\)]{0,15}$/)
    .allow("")
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
    }),
  company: Joi.string().min(2).max(100).allow(""),
});

// Newsletter Validation Schemas
export const newsletterSubscribeSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  name: Joi.string().min(2).max(100).allow(""),
  source: Joi.string()
    .valid("website", "blog", "social", "referral")
    .default("website"),
  preferences: Joi.object({
    blogUpdates: Joi.boolean().default(true),
    projectUpdates: Joi.boolean().default(true),
    newsletter: Joi.boolean().default(true),
  }).default({}),
});

// Query Validation Schemas
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().default("createdAt"),
  order: Joi.string().valid("asc", "desc").default("desc"),
  search: Joi.string().min(2).max(100).allow(""),
});

// Contact Update Validation (Admin only)
export const contactUpdateSchema = Joi.object({
  status: Joi.string().valid("new", "read", "replied", "archived").optional(),
  priority: Joi.string().valid("low", "medium", "high").optional(),
  name: Joi.string().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  subject: Joi.string().min(5).max(200).optional(),
  message: Joi.string().min(20).max(2000).optional(),
  phone: Joi.string()
    .pattern(/^[\+]?[1-9][\d\s\-\(\)]{0,15}$/)
    .allow("", null)
    .optional(),
  company: Joi.string().min(2).max(100).allow("").optional(),
  source: Joi.string()
    .valid("website", "linkedin", "email", "referral", "other")
    .optional(),
});

// File Upload Validation
export const fileUploadSchema = Joi.object({
  fieldname: Joi.string().required(),
  originalname: Joi.string().required(),
  encoding: Joi.string().required(),
  mimetype: Joi.string()
    .valid(
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    .required()
    .messages({
      "any.only":
        "File type not supported. Please upload images (JPEG, PNG, WebP, GIF) or documents (PDF, DOC, DOCX)",
    }),
  size: Joi.number()
    .max(10 * 1024 * 1024) // 10MB
    .required()
    .messages({
      "number.max": "File size cannot exceed 10MB",
    }),
});

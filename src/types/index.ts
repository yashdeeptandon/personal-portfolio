import { Document } from 'mongoose';

// User Types
export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Blog Types
export interface IBlog extends Document {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  tags: string[];
  category: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: Date;
  author: string;
  readTime: number;
  views: number;
  likes: number;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Project Types
export interface IProject extends Document {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  featuredImage?: string;
  images: string[];
  technologies: string[];
  category: string;
  status: 'planning' | 'in-progress' | 'completed' | 'archived';
  githubUrl?: string;
  liveUrl?: string;
  demoUrl?: string;
  startDate: Date;
  endDate?: Date;
  featured: boolean;
  order: number;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Testimonial Types
export interface ITestimonial extends Document {
  _id: string;
  name: string;
  email: string;
  company?: string;
  position?: string;
  avatar?: string;
  content: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  featured: boolean;
  order: number;
  projectId?: string;
  linkedinUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Contact Types
export interface IContact extends Document {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  company?: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  priority: 'low' | 'medium' | 'high';
  source: 'website' | 'linkedin' | 'email' | 'referral' | 'other';
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Newsletter Types
export interface INewsletter extends Document {
  _id: string;
  email: string;
  name?: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  source: 'website' | 'blog' | 'social' | 'referral';
  preferences: {
    blogUpdates: boolean;
    projectUpdates: boolean;
    newsletter: boolean;
  };
  subscribedAt: Date;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface IAnalytics extends Document {
  _id: string;
  type: 'page_view' | 'blog_view' | 'project_view' | 'contact_form' | 'download' | 'click';
  path: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  os?: string;
  sessionId?: string;
  userId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Pagination Types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, any>;
}

// File Upload Types
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

// Email Types
export interface EmailTemplate {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

// SEO Types
export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

// Cache Types
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  key: string;
  tags?: string[];
}

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}

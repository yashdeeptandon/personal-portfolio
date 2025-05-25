/**
 * Email Service Types
 * 
 * Type definitions for the email service architecture.
 * These types ensure type safety across all email operations.
 */

// Base email configuration
export interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

// Generic email data structure
export interface EmailData {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

// Email service response
export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  statusCode?: number;
}

// Contact form data structure
export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
  phone?: string;
  company?: string;
}

// Contact notification parameters
export interface ContactNotificationParams {
  to: string;
  contactData: ContactFormData;
  submissionId: string;
  submissionDate?: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Contact confirmation parameters
export interface ContactConfirmationParams {
  to: string;
  contactData: ContactFormData;
  submissionId: string;
  expectedResponseTime?: string;
}

// Newsletter welcome parameters
export interface NewsletterWelcomeParams {
  to: string;
  name?: string;
  subscriberId: string;
  preferences?: {
    blogUpdates?: boolean;
    projectUpdates?: boolean;
    newsletter?: boolean;
  };
  unsubscribeUrl?: string;
}

// Blog notification parameters
export interface BlogNotificationParams {
  to: string | string[];
  blogPost: {
    title: string;
    excerpt: string;
    slug: string;
    author: string;
    publishedAt: Date;
    readTime?: number;
    tags?: string[];
  };
  subscriber?: {
    name?: string;
    subscriberId: string;
  };
  unsubscribeUrl?: string;
}

// Generic email parameters
export interface GenericEmailParams {
  to: string | string[];
  subject: string;
  templateData: Record<string, any>;
  templateType?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

// Email template types
export type EmailTemplateType = 
  | 'contact-notification'
  | 'contact-confirmation'
  | 'newsletter-welcome'
  | 'newsletter-unsubscribe'
  | 'blog-notification'
  | 'testimonial-confirmation'
  | 'generic';

// Email template data
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Email template generator function type
export type EmailTemplateGenerator<T = Record<string, any>> = (data: T) => EmailTemplate;

// Email service error types
export class EmailServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'EmailServiceError';
  }
}

// Email validation result
export interface EmailValidationResult {
  isValid: boolean;
  errors: string[];
}

// Email queue item (for future implementation)
export interface EmailQueueItem {
  id: string;
  type: EmailTemplateType;
  params: any;
  attempts: number;
  maxAttempts: number;
  scheduledAt: Date;
  createdAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

// Email analytics data (for future implementation)
export interface EmailAnalytics {
  emailId: string;
  type: EmailTemplateType;
  recipient: string;
  sentAt: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
}

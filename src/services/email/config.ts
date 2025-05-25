/**
 * Email Service Configuration
 * 
 * Configuration constants and utilities for the email service.
 * This file contains all email-related constants and configuration helpers.
 */

import { EmailConfig, EmailValidationResult } from './types';

// Email template constants (matching existing EMAIL_TEMPLATES in constants.ts)
export const EMAIL_TEMPLATES = {
  CONTACT_CONFIRMATION: 'contact-confirmation',
  CONTACT_NOTIFICATION: 'contact-notification',
  NEWSLETTER_WELCOME: 'newsletter-welcome',
  NEWSLETTER_UNSUBSCRIBE: 'newsletter-unsubscribe',
  TESTIMONIAL_CONFIRMATION: 'testimonial-confirmation',
  BLOG_NOTIFICATION: 'blog-notification',
  GENERIC: 'generic'
} as const;

// SendGrid API configuration
export const SENDGRID_CONFIG = {
  API_URL: 'https://api.sendgrid.com/v3/mail/send',
  MAX_RECIPIENTS: 1000,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Email validation patterns
export const EMAIL_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME: /^[a-zA-Z\s\-'\.]{1,100}$/,
  SUBJECT: /^.{1,200}$/,
} as const;

// Default email settings
export const DEFAULT_EMAIL_SETTINGS = {
  EXPECTED_RESPONSE_TIME: '24-48 hours',
  MAX_MESSAGE_LENGTH: 5000,
  MAX_SUBJECT_LENGTH: 200,
  MAX_NAME_LENGTH: 100,
} as const;

// Brand colors for email templates
export const BRAND_COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#1E40AF',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  TEXT_PRIMARY: '#1F2937',
  TEXT_SECONDARY: '#6B7280',
  BACKGROUND: '#F9FAFB',
  WHITE: '#FFFFFF',
} as const;

/**
 * Get email configuration from environment variables
 */
export function getEmailConfig(): EmailConfig {
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;
  const fromName = process.env.FROM_NAME;

  if (!apiKey) {
    throw new Error('SENDGRID_API_KEY environment variable is required');
  }

  if (!fromEmail) {
    throw new Error('FROM_EMAIL environment variable is required');
  }

  if (!fromName) {
    throw new Error('FROM_NAME environment variable is required');
  }

  return {
    apiKey,
    fromEmail,
    fromName,
  };
}

/**
 * Validate email configuration
 */
export function validateEmailConfig(): EmailValidationResult {
  const errors: string[] = [];

  try {
    getEmailConfig();
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Invalid email configuration');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email address
 */
export function validateEmailAddress(email: string): boolean {
  return EMAIL_PATTERNS.EMAIL.test(email);
}

/**
 * Validate multiple email addresses
 */
export function validateEmailAddresses(emails: string | string[]): EmailValidationResult {
  const emailArray = Array.isArray(emails) ? emails : [emails];
  const errors: string[] = [];

  for (const email of emailArray) {
    if (!validateEmailAddress(email)) {
      errors.push(`Invalid email address: ${email}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize email content
 */
export function sanitizeEmailContent(content: string): string {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Format email address with name
 */
export function formatEmailAddress(email: string, name?: string): string {
  if (!name) {
    return email;
  }
  return `"${name}" <${email}>`;
}

/**
 * Generate unsubscribe URL
 */
export function generateUnsubscribeUrl(subscriberId: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${base}/unsubscribe?id=${subscriberId}`;
}

/**
 * Generate email tracking pixel URL (for future analytics)
 */
export function generateTrackingPixelUrl(emailId: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${base}/api/email/track/open?id=${emailId}`;
}

/**
 * Get email template path
 */
export function getTemplatePath(templateType: string): string {
  return `/templates/email/${templateType}`;
}

/**
 * Format date for email display
 */
export function formatEmailDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Truncate text for email preview
 */
export function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
}

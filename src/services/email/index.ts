/**
 * Email Service Index
 * 
 * Main entry point for the email service.
 * Provides a clean, unified interface for all email functionality.
 */

// Export the main service functions
export {
  sendContactNotification,
  sendContactConfirmation,
  sendNewsletterWelcome,
  sendBlogNotification,
  sendGenericEmail,
  sendEmail,
  emailService
} from './service';

// Export types for external use
export type {
  EmailData,
  EmailResponse,
  EmailServiceError,
  ContactFormData,
  ContactNotificationParams,
  ContactConfirmationParams,
  NewsletterWelcomeParams,
  BlogNotificationParams,
  GenericEmailParams,
  EmailTemplateType,
  EmailTemplate,
  EmailConfig,
  EmailValidationResult
} from './types';

// Export configuration utilities
export {
  EMAIL_TEMPLATES,
  SENDGRID_CONFIG,
  BRAND_COLORS,
  getEmailConfig,
  validateEmailConfig,
  validateEmailAddress,
  validateEmailAddresses,
  sanitizeEmailContent,
  formatEmailAddress,
  generateUnsubscribeUrl,
  formatEmailDate,
  truncateText
} from './config';

// Export template functions
export {
  generateContactNotificationTemplate,
  generateContactConfirmationTemplate,
  generateNewsletterWelcomeTemplate,
  generateBlogNotificationTemplate,
  generateEmailTemplate,
  getTemplateGenerator,
  TEMPLATE_REGISTRY
} from './templates';

// Default export for convenience
export { emailService as default } from './service';

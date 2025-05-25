/**
 * Services Index
 *
 * Central export point for all application services.
 * This file provides a unified interface for accessing all services.
 */

// Email Service
export { emailService as default } from "./email";
export * from "./email";

// Newsletter Service (part of email service but exposed separately for convenience)
export {
  sendNewsletterWelcome,
  sendBlogNotification,
  generateNewsletterWelcomeTemplate,
  generateBlogNotificationTemplate,
} from "./email";

// Future services will be exported here following the same pattern:
// export * from './notifications';
// export * from './analytics';
// export * from './storage';
// export * from './cache';

/**
 * Service Registry
 *
 * This object provides a centralized way to access all services.
 * Useful for dependency injection or service discovery patterns.
 */
import { emailService } from "./email";

export const services = {
  email: emailService,
  newsletter: {
    sendWelcome: emailService.sendNewsletterWelcome,
    sendBlogNotification: emailService.sendBlogNotification,
  },
  // Future services:
  // notifications: notificationService,
  // analytics: analyticsService,
  // storage: storageService,
  // cache: cacheService,
} as const;

/**
 * Service Types
 *
 * Export all service-related types for external use.
 */
export type {
  // Email service types
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
  EmailValidationResult,
} from "./email";

/**
 * Service Configuration
 *
 * Export configuration utilities for all services.
 */
export {
  // Email service config
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
  truncateText,
} from "./email";

/**
 * Service Health Check
 *
 * Function to check the health of all services.
 * Useful for monitoring and debugging.
 */
export async function checkServiceHealth(): Promise<{
  email: { status: "healthy" | "unhealthy"; error?: string };
  // Future services will be added here
}> {
  const health = {
    email: {
      status: "healthy" as "healthy" | "unhealthy",
      error: undefined as string | undefined,
    },
  };

  // Check email service health
  try {
    const { validateEmailConfig } = await import("./email");
    const emailValidation = validateEmailConfig();

    if (!emailValidation.isValid) {
      health.email.status = "unhealthy";
      health.email.error = emailValidation.errors.join(", ");
    }
  } catch (error) {
    health.email.status = "unhealthy";
    health.email.error =
      error instanceof Error ? error.message : "Unknown error";
  }

  return health;
}

/**
 * Service Initialization
 *
 * Function to initialize all services.
 * Call this during application startup.
 */
export async function initializeServices(): Promise<void> {
  console.log("🚀 Initializing services...");

  // Check service health
  const health = await checkServiceHealth();

  // Log service status
  Object.entries(health).forEach(([serviceName, serviceHealth]) => {
    if (serviceHealth.status === "healthy") {
      console.log(`✅ ${serviceName} service: healthy`);
    } else {
      console.error(
        `❌ ${serviceName} service: unhealthy - ${serviceHealth.error}`
      );
    }
  });

  console.log("✨ Services initialization complete");
}

/**
 * Example Usage:
 *
 * // Import specific service
 * import { emailService } from '@/services';
 *
 * // Import all services
 * import { services } from '@/services';
 *
 * // Use email service
 * await emailService.sendContactNotification(params);
 *
 * // Or use via services registry
 * await services.email.sendContactNotification(params);
 *
 * // Check service health
 * const health = await checkServiceHealth();
 *
 * // Initialize services (in app startup)
 * await initializeServices();
 */

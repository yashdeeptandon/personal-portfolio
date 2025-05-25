/**
 * Email Templates Index
 *
 * Central export point for all email templates.
 * This file provides a unified interface for accessing all email template generators.
 */

export { generateBaseTemplate, generateBaseTextTemplate } from "./base";
export {
  generateContactNotificationTemplate,
  generateContactConfirmationTemplate,
} from "./contact";
export {
  generateNewsletterWelcomeTemplate,
  generateBlogNotificationTemplate,
} from "./newsletter";

// Re-export types for convenience
export type { BaseTemplateData } from "./base";

export type {
  ContactNotificationParams,
  ContactConfirmationParams,
  NewsletterWelcomeParams,
  BlogNotificationParams,
  EmailTemplate,
  EmailTemplateType,
  EmailTemplateGenerator,
} from "../types";

/**
 * Template registry for dynamic template selection
 */
import {
  generateContactNotificationTemplate,
  generateContactConfirmationTemplate,
} from "./contact";
import {
  generateNewsletterWelcomeTemplate,
  generateBlogNotificationTemplate,
} from "./newsletter";
import {
  EmailTemplateType,
  EmailTemplate,
  EmailTemplateGenerator,
} from "../types";

export const TEMPLATE_REGISTRY: Record<
  EmailTemplateType,
  EmailTemplateGenerator
> = {
  "contact-notification":
    generateContactNotificationTemplate as EmailTemplateGenerator,
  "contact-confirmation":
    generateContactConfirmationTemplate as EmailTemplateGenerator,
  "newsletter-welcome":
    generateNewsletterWelcomeTemplate as EmailTemplateGenerator,
  "blog-notification":
    generateBlogNotificationTemplate as EmailTemplateGenerator,
  "newsletter-unsubscribe": (params: any) => ({
    subject: "You have been unsubscribed",
    html: "<p>You have been successfully unsubscribed from our newsletter.</p>",
    text: "You have been successfully unsubscribed from our newsletter.",
  }),
  "testimonial-confirmation": (params: any) => ({
    subject: "Thank you for your testimonial",
    html: "<p>Thank you for providing your testimonial!</p>",
    text: "Thank you for providing your testimonial!",
  }),
  generic: (params: any) => ({
    subject: params.subject || "Message from Yashdeep Tandon",
    html: params.html || "<p>No content provided</p>",
    text: params.text || "No content provided",
  }),
};

/**
 * Get template generator by type
 */
export function getTemplateGenerator(
  type: EmailTemplateType
): EmailTemplateGenerator {
  const generator = TEMPLATE_REGISTRY[type];
  if (!generator) {
    throw new Error(`Template generator not found for type: ${type}`);
  }
  return generator;
}

/**
 * Generate email template by type
 */
export function generateEmailTemplate(
  type: EmailTemplateType,
  params: any
): EmailTemplate {
  const generator = getTemplateGenerator(type);
  return generator(params);
}

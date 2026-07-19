/**
 * Email Templates Index
 *
 * Central export point for all email templates. Each `generate*Template`
 * function renders the corresponding React Email component to HTML +
 * plain text and returns the same `{ subject, html, text }` shape the
 * rest of the app expects.
 */

import * as React from "react";
import { render } from "@react-email/render";
import { ContactNotificationEmail } from "./ContactNotificationEmail";
import { ContactConfirmationEmail } from "./ContactConfirmationEmail";
import { ContactReplyEmail } from "./ContactReplyEmail";
import { NewsletterWelcomeEmail } from "./NewsletterWelcomeEmail";
import { BlogNotificationEmail } from "./BlogNotificationEmail";
import { truncateText } from "../config";
import {
  ContactNotificationParams,
  ContactConfirmationParams,
  ContactReplyParams,
  NewsletterWelcomeParams,
  BlogNotificationParams,
  EmailTemplate,
  EmailTemplateType,
  EmailTemplateGenerator,
} from "../types";

export { EmailLayout } from "./EmailLayout";
export { ContactNotificationEmail } from "./ContactNotificationEmail";
export { ContactConfirmationEmail } from "./ContactConfirmationEmail";
export { ContactReplyEmail } from "./ContactReplyEmail";
export { NewsletterWelcomeEmail } from "./NewsletterWelcomeEmail";
export { BlogNotificationEmail } from "./BlogNotificationEmail";

async function renderTemplate(
  subject: string,
  element: React.ReactElement
): Promise<EmailTemplate> {
  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ]);
  return { subject, html, text };
}

/**
 * Generate contact notification email for admin
 */
export async function generateContactNotificationTemplate(
  params: ContactNotificationParams
): Promise<EmailTemplate> {
  const subject = `New Contact Form Submission: ${params.contactData.subject || params.contactData.name}`;
  return renderTemplate(subject, React.createElement(ContactNotificationEmail, params));
}

/**
 * Generate contact confirmation email for user
 */
export async function generateContactConfirmationTemplate(
  params: ContactConfirmationParams
): Promise<EmailTemplate> {
  const subject = `Thank you for contacting me, ${params.contactData.name}!`;
  return renderTemplate(subject, React.createElement(ContactConfirmationEmail, params));
}

/**
 * Generate contact reply email (admin replying to a visitor)
 */
export async function generateContactReplyTemplate(
  params: ContactReplyParams
): Promise<EmailTemplate> {
  const subject = `Re: ${params.originalSubject}`;
  return renderTemplate(subject, React.createElement(ContactReplyEmail, params));
}

/**
 * Generate newsletter welcome email
 */
export async function generateNewsletterWelcomeTemplate(
  params: NewsletterWelcomeParams
): Promise<EmailTemplate> {
  const subject = `Welcome to my newsletter, ${params.name || "there"}! 🎉`;
  return renderTemplate(subject, React.createElement(NewsletterWelcomeEmail, params));
}

/**
 * Generate blog notification email
 */
export async function generateBlogNotificationTemplate(
  params: BlogNotificationParams
): Promise<EmailTemplate> {
  const subject = `New Blog Post: ${params.blogPost.title}`;
  return renderTemplate(subject, React.createElement(BlogNotificationEmail, params));
}

// Re-export types for convenience
export type {
  ContactNotificationParams,
  ContactConfirmationParams,
  ContactReplyParams,
  NewsletterWelcomeParams,
  BlogNotificationParams,
  EmailTemplate,
  EmailTemplateType,
  EmailTemplateGenerator,
} from "../types";

/**
 * Template registry for dynamic template selection
 */
export const TEMPLATE_REGISTRY: Record<EmailTemplateType, EmailTemplateGenerator> = {
  "contact-notification": generateContactNotificationTemplate as EmailTemplateGenerator,
  "contact-confirmation": generateContactConfirmationTemplate as EmailTemplateGenerator,
  "newsletter-welcome": generateNewsletterWelcomeTemplate as EmailTemplateGenerator,
  "blog-notification": generateBlogNotificationTemplate as EmailTemplateGenerator,
  "newsletter-unsubscribe": async () => ({
    subject: "You have been unsubscribed",
    html: "<p>You have been successfully unsubscribed from our newsletter.</p>",
    text: "You have been successfully unsubscribed from our newsletter.",
  }),
  "testimonial-confirmation": async () => ({
    subject: "Thank you for your testimonial",
    html: "<p>Thank you for providing your testimonial!</p>",
    text: "Thank you for providing your testimonial!",
  }),
  generic: async (params: any) => ({
    subject: params.subject || "Message from Yashdeep Tandon",
    html: params.html || "<p>No content provided</p>",
    text: params.text || "No content provided",
  }),
};

/**
 * Get template generator by type
 */
export function getTemplateGenerator(type: EmailTemplateType): EmailTemplateGenerator {
  const generator = TEMPLATE_REGISTRY[type];
  if (!generator) {
    throw new Error(`Template generator not found for type: ${type}`);
  }
  return generator;
}

/**
 * Generate email template by type
 */
export async function generateEmailTemplate(
  type: EmailTemplateType,
  params: any
): Promise<EmailTemplate> {
  const generator = getTemplateGenerator(type);
  return generator(params);
}

// truncateText is used by the notification/confirmation templates via ../config; re-export
// here too since some callers previously imported it from templates/index.
export { truncateText };

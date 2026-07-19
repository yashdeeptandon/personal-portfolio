/**
 * Email Service
 *
 * Standalone email service using Resend.
 * This service is completely self-contained and can be called from anywhere in the application.
 */

import { Resend } from "resend";
import {
  EmailData,
  EmailResponse,
  EmailServiceError,
  ContactNotificationParams,
  ContactConfirmationParams,
  ContactReplyParams,
  NewsletterWelcomeParams,
  BlogNotificationParams,
  GenericEmailParams,
} from "./types";
import {
  getEmailConfig,
  validateEmailAddresses,
  sanitizeEmailContent,
  formatEmailAddress,
} from "./config";
import {
  generateContactNotificationTemplate,
  generateContactConfirmationTemplate,
  generateContactReplyTemplate,
  generateNewsletterWelcomeTemplate,
  generateBlogNotificationTemplate,
} from "./templates";
import { logError, logSuccess } from "@/lib/utils/logger";

/**
 * Core email sending function using the Resend API
 */
async function sendEmail(emailData: EmailData): Promise<EmailResponse> {
  try {
    // Get email configuration
    const config = getEmailConfig();

    // Validate email addresses
    const toValidation = validateEmailAddresses(emailData.to);
    if (!toValidation.isValid) {
      throw new EmailServiceError(
        `Invalid recipient email addresses: ${toValidation.errors.join(", ")}`,
        400
      );
    }

    if (emailData.cc) {
      const ccValidation = validateEmailAddresses(emailData.cc);
      if (!ccValidation.isValid) {
        throw new EmailServiceError(
          `Invalid CC email addresses: ${ccValidation.errors.join(", ")}`,
          400
        );
      }
    }

    if (emailData.bcc) {
      const bccValidation = validateEmailAddresses(emailData.bcc);
      if (!bccValidation.isValid) {
        throw new EmailServiceError(
          `Invalid BCC email addresses: ${bccValidation.errors.join(", ")}`,
          400
        );
      }
    }

    // Sanitize content
    const sanitizedHtml = sanitizeEmailContent(emailData.html);
    const sanitizedText = sanitizeEmailContent(emailData.text);

    const resend = new Resend(config.apiKey);

    const { data, error } = await resend.emails.send({
      from: formatEmailAddress(config.fromEmail, config.fromName),
      to: emailData.to,
      subject: emailData.subject,
      html: sanitizedHtml,
      text: sanitizedText,
      ...(emailData.replyTo && { replyTo: emailData.replyTo }),
      ...(emailData.cc && { cc: emailData.cc }),
      ...(emailData.bcc && { bcc: emailData.bcc }),
    });

    if (error) {
      throw new EmailServiceError(
        `Resend API error: ${error.message}`,
        undefined,
        error
      );
    }

    logSuccess("Email sent", {
      messageId: data?.id,
      to: emailData.to,
      subject: emailData.subject,
    });

    return {
      success: true,
      messageId: data?.id,
      statusCode: 200,
    };
  } catch (error) {
    logError(error, { context: "sendEmail", to: emailData.to });

    if (error instanceof EmailServiceError) {
      return {
        success: false,
        error: error.message,
        statusCode: error.statusCode,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown email service error",
      statusCode: 500,
    };
  }
}

/**
 * Send contact notification email to admin
 */
export async function sendContactNotification(
  params: ContactNotificationParams
): Promise<EmailResponse> {
  try {
    const template = await generateContactNotificationTemplate(params);

    const emailData: EmailData = {
      to: params.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo: params.contactData.email,
    };

    return await sendEmail(emailData);
  } catch (error) {
    logError(error, { context: "sendContactNotification" });
    throw new EmailServiceError(
      `Failed to send contact notification: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Send contact confirmation email to user
 */
export async function sendContactConfirmation(
  params: ContactConfirmationParams
): Promise<EmailResponse> {
  try {
    const template = await generateContactConfirmationTemplate(params);

    const emailData: EmailData = {
      to: params.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    return await sendEmail(emailData);
  } catch (error) {
    logError(error, { context: "sendContactConfirmation" });
    throw new EmailServiceError(
      `Failed to send contact confirmation: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Send admin reply to a contact message
 */
export async function sendContactReply(
  params: ContactReplyParams
): Promise<EmailResponse> {
  try {
    const template = await generateContactReplyTemplate(params);

    const emailData: EmailData = {
      to: params.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    return await sendEmail(emailData);
  } catch (error) {
    logError(error, { context: "sendContactReply" });
    throw new EmailServiceError(
      `Failed to send contact reply: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Send newsletter welcome email
 */
export async function sendNewsletterWelcome(
  params: NewsletterWelcomeParams
): Promise<EmailResponse> {
  try {
    const template = await generateNewsletterWelcomeTemplate(params);

    const emailData: EmailData = {
      to: params.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    return await sendEmail(emailData);
  } catch (error) {
    logError(error, { context: "sendNewsletterWelcome" });
    throw new EmailServiceError(
      `Failed to send newsletter welcome: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Send blog notification email
 */
export async function sendBlogNotification(
  params: BlogNotificationParams
): Promise<EmailResponse> {
  try {
    const template = await generateBlogNotificationTemplate(params);

    const emailData: EmailData = {
      to: params.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    return await sendEmail(emailData);
  } catch (error) {
    logError(error, { context: "sendBlogNotification" });
    throw new EmailServiceError(
      `Failed to send blog notification: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Send generic email
 */
export async function sendGenericEmail(
  params: GenericEmailParams
): Promise<EmailResponse> {
  try {
    const emailData: EmailData = {
      to: params.to,
      subject: params.subject,
      html: params.templateData.html || "<p>No content provided</p>",
      text: params.templateData.text || "No content provided",
      replyTo: params.replyTo,
      cc: params.cc,
      bcc: params.bcc,
    };

    return await sendEmail(emailData);
  } catch (error) {
    logError(error, { context: "sendGenericEmail" });
    throw new EmailServiceError(
      `Failed to send generic email: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Export the core sendEmail function for advanced use cases
export { sendEmail };

// Export all email service functions as a single object
export const emailService = {
  sendContactNotification,
  sendContactConfirmation,
  sendContactReply,
  sendNewsletterWelcome,
  sendBlogNotification,
  sendGenericEmail,
  sendEmail,
};

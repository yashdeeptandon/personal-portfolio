/**
 * Email Service
 *
 * Standalone, dependency-free email service using SendGrid.
 * This service is completely self-contained and can be called from anywhere in the application.
 */

import {
  EmailData,
  EmailResponse,
  EmailServiceError,
  ContactNotificationParams,
  ContactConfirmationParams,
  NewsletterWelcomeParams,
  BlogNotificationParams,
  GenericEmailParams,
} from "./types";
import {
  getEmailConfig,
  validateEmailAddresses,
  sanitizeEmailContent,
  formatEmailAddress,
  SENDGRID_CONFIG,
} from "./config";
import {
  generateContactNotificationTemplate,
  generateContactConfirmationTemplate,
  generateNewsletterWelcomeTemplate,
  generateBlogNotificationTemplate,
} from "./templates";

/**
 * Core email sending function using SendGrid API
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

    // Prepare recipients
    const toArray = Array.isArray(emailData.to) ? emailData.to : [emailData.to];
    const personalizations: any[] = toArray.map((email) => ({
      to: [{ email }],
    }));

    // Add CC and BCC if provided
    if (emailData.cc) {
      const ccArray = Array.isArray(emailData.cc)
        ? emailData.cc
        : [emailData.cc];
      personalizations[0].cc = ccArray.map((email) => ({ email }));
    }

    if (emailData.bcc) {
      const bccArray = Array.isArray(emailData.bcc)
        ? emailData.bcc
        : [emailData.bcc];
      personalizations[0].bcc = bccArray.map((email) => ({ email }));
    }

    // Prepare SendGrid payload
    const payload: any = {
      personalizations,
      from: {
        email: config.fromEmail,
        name: config.fromName,
      },
      subject: emailData.subject,
      content: [
        {
          type: "text/plain",
          value: sanitizedText,
        },
        {
          type: "text/html",
          value: sanitizedHtml,
        },
      ],
    };

    // Add reply-to if provided
    if (emailData.replyTo) {
      payload.reply_to = { email: emailData.replyTo };
    }

    // Send email via SendGrid API
    const response = await fetch(SENDGRID_CONFIG.API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Handle response
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to send email";

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.errors?.[0]?.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      throw new EmailServiceError(
        `SendGrid API error: ${errorMessage}`,
        response.status,
        errorText
      );
    }

    // Get message ID from response headers
    const messageId = response.headers.get("x-message-id");

    return {
      success: true,
      messageId: messageId || undefined,
      statusCode: response.status,
    };
  } catch (error) {
    console.error("Email service error:", error);

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
    const template = generateContactNotificationTemplate(params);

    const emailData: EmailData = {
      to: params.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo: params.contactData.email,
    };

    return await sendEmail(emailData);
  } catch (error) {
    console.error("Contact notification error:", error);
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
    const template = generateContactConfirmationTemplate(params);

    const emailData: EmailData = {
      to: params.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    return await sendEmail(emailData);
  } catch (error) {
    console.error("Contact confirmation error:", error);
    throw new EmailServiceError(
      `Failed to send contact confirmation: ${
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
    const template = generateNewsletterWelcomeTemplate(params);

    const emailData: EmailData = {
      to: params.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    return await sendEmail(emailData);
  } catch (error) {
    console.error("Newsletter welcome error:", error);
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
    const template = generateBlogNotificationTemplate(params);

    const emailData: EmailData = {
      to: params.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    return await sendEmail(emailData);
  } catch (error) {
    console.error("Blog notification error:", error);
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
    console.error("Generic email error:", error);
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
  sendNewsletterWelcome,
  sendBlogNotification,
  sendGenericEmail,
  sendEmail,
};

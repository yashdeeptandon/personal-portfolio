/**
 * Contact Email Templates
 * 
 * Templates for contact form related emails:
 * - Admin notification when someone submits the contact form
 * - User confirmation email after form submission
 */

import { generateBaseTemplate, generateBaseTextTemplate } from './base';
import { formatEmailDate, truncateText } from '../config';
import { ContactNotificationParams, ContactConfirmationParams, EmailTemplate } from '../types';

/**
 * Generate contact notification email for admin
 */
export function generateContactNotificationTemplate(params: ContactNotificationParams): EmailTemplate {
  const { contactData, submissionId, submissionDate, ipAddress, userAgent } = params;
  const date = submissionDate || new Date();

  const subject = `New Contact Form Submission: ${contactData.subject || contactData.name}`;

  const content = `
    <h2>New Contact Form Submission</h2>
    
    <div class="card card-highlight">
        <h3 style="margin-top: 0; color: #1F2937;">Contact Details</h3>
        <p><strong>Name:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${contactData.email}" style="color: #3B82F6;">${contactData.email}</a></p>
        ${contactData.phone ? `<p><strong>Phone:</strong> ${contactData.phone}</p>` : ''}
        ${contactData.company ? `<p><strong>Company:</strong> ${contactData.company}</p>` : ''}
        ${contactData.subject ? `<p><strong>Subject:</strong> ${contactData.subject}</p>` : ''}
    </div>

    <div class="card">
        <h3 style="margin-top: 0; color: #1F2937;">Message</h3>
        <p style="white-space: pre-wrap; background-color: #F9FAFB; padding: 16px; border-radius: 8px; border-left: 4px solid #3B82F6;">
            ${contactData.message}
        </p>
    </div>

    <div class="card">
        <h3 style="margin-top: 0; color: #1F2937;">Submission Information</h3>
        <p><strong>Submission ID:</strong> ${submissionId}</p>
        <p><strong>Date & Time:</strong> ${formatEmailDate(date)}</p>
        ${ipAddress ? `<p><strong>IP Address:</strong> ${ipAddress}</p>` : ''}
        ${userAgent ? `<p><strong>User Agent:</strong> <span style="font-size: 12px; color: #6B7280;">${truncateText(userAgent, 100)}</span></p>` : ''}
    </div>

    <div class="text-center" style="margin-top: 30px;">
        <a href="mailto:${contactData.email}?subject=Re: ${encodeURIComponent(contactData.subject || 'Your inquiry')}" 
           class="btn" 
           style="margin-right: 10px;">
            Reply to ${contactData.name}
        </a>
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/contacts" 
           class="btn btn-secondary">
            View in Admin Panel
        </a>
    </div>
  `;

  const html = generateBaseTemplate({
    title: 'New Contact Form Submission',
    preheader: `New message from ${contactData.name} - ${truncateText(contactData.message, 100)}`,
    content,
    footerContent: 'This is an automated notification from your portfolio website.'
  });

  const text = generateBaseTextTemplate({
    title: 'New Contact Form Submission',
    content: `
Contact Details:
- Name: ${contactData.name}
- Email: ${contactData.email}
${contactData.phone ? `- Phone: ${contactData.phone}` : ''}
${contactData.company ? `- Company: ${contactData.company}` : ''}
${contactData.subject ? `- Subject: ${contactData.subject}` : ''}

Message:
${contactData.message}

Submission Information:
- Submission ID: ${submissionId}
- Date & Time: ${formatEmailDate(date)}
${ipAddress ? `- IP Address: ${ipAddress}` : ''}

Reply to this contact: ${contactData.email}
    `.trim(),
    footerContent: 'This is an automated notification from your portfolio website.'
  });

  return { subject, html, text };
}

/**
 * Generate contact confirmation email for user
 */
export function generateContactConfirmationTemplate(params: ContactConfirmationParams): EmailTemplate {
  const { contactData, submissionId, expectedResponseTime } = params;

  const subject = `Thank you for contacting me, ${contactData.name}!`;

  const content = `
    <h2>Thank you for reaching out!</h2>
    
    <p>Hi ${contactData.name},</p>
    
    <p>I've received your message and wanted to confirm that it has been successfully submitted. I appreciate you taking the time to get in touch with me.</p>

    <div class="card card-highlight">
        <h3 style="margin-top: 0; color: #1F2937;">Your Message Summary</h3>
        ${contactData.subject ? `<p><strong>Subject:</strong> ${contactData.subject}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p style="background-color: #F9FAFB; padding: 16px; border-radius: 8px; border-left: 4px solid #3B82F6; white-space: pre-wrap;">
            ${truncateText(contactData.message, 300)}
        </p>
        <p style="font-size: 12px; color: #6B7280; margin-bottom: 0;">
            <strong>Reference ID:</strong> ${submissionId}
        </p>
    </div>

    <div class="card">
        <h3 style="margin-top: 0; color: #1F2937;">What happens next?</h3>
        <p>I typically respond to all inquiries within <strong>${expectedResponseTime || '24-48 hours'}</strong>. I'll get back to you at <strong>${contactData.email}</strong> as soon as possible.</p>
        
        <p>In the meantime, feel free to:</p>
        <ul style="color: #6B7280; padding-left: 20px;">
            <li>Check out my latest projects on my portfolio</li>
            <li>Read my blog for insights and updates</li>
            <li>Connect with me on social media</li>
        </ul>
    </div>

    <div class="text-center" style="margin-top: 30px;">
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" 
           class="btn" 
           style="margin-right: 10px;">
            Visit My Portfolio
        </a>
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/blog" 
           class="btn btn-secondary">
            Read My Blog
        </a>
    </div>

    <p style="margin-top: 30px; font-size: 14px; color: #6B7280;">
        If you have any urgent questions or need to add additional information to your inquiry, 
        please reply to this email with your reference ID: <strong>${submissionId}</strong>
    </p>
  `;

  const html = generateBaseTemplate({
    title: 'Message Received - Thank You!',
    preheader: `Thank you for contacting me, ${contactData.name}! I'll get back to you soon.`,
    content,
    footerContent: `I look forward to connecting with you soon!`
  });

  const text = generateBaseTextTemplate({
    title: 'Message Received - Thank You!',
    content: `
Hi ${contactData.name},

I've received your message and wanted to confirm that it has been successfully submitted. I appreciate you taking the time to get in touch with me.

Your Message Summary:
${contactData.subject ? `Subject: ${contactData.subject}` : ''}
Message: ${truncateText(contactData.message, 200)}
Reference ID: ${submissionId}

What happens next?
I typically respond to all inquiries within ${expectedResponseTime || '24-48 hours'}. I'll get back to you at ${contactData.email} as soon as possible.

In the meantime, feel free to:
- Check out my latest projects on my portfolio
- Read my blog for insights and updates  
- Connect with me on social media

Visit my portfolio: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}

If you have any urgent questions or need to add additional information to your inquiry, please reply to this email with your reference ID: ${submissionId}
    `.trim(),
    footerContent: 'I look forward to connecting with you soon!'
  });

  return { subject, html, text };
}

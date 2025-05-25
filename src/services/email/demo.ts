/**
 * Email Service Demo
 * 
 * This file demonstrates how to use the email service in various scenarios.
 * Copy these examples to implement email functionality in your application.
 */

import { emailService } from './index';

/**
 * Demo: Contact Form Integration
 * 
 * This shows how to integrate the email service with a contact form submission.
 */
export async function demoContactFormIntegration() {
  console.log('📝 Demo: Contact Form Integration');
  
  // Simulate contact form data
  const contactFormData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    subject: 'Project Collaboration Inquiry',
    message: 'Hi Yashdeep, I came across your portfolio and I\'m impressed with your work. I have a project that I think would be a great fit for your skills. Would you be interested in discussing this further?',
    phone: '+1 (555) 123-4567',
    company: 'Tech Innovations Inc.'
  };

  const submissionId = `contact_${Date.now()}`;
  const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL!;

  try {
    // Send notification to admin
    console.log('  📧 Sending admin notification...');
    const adminResult = await emailService.sendContactNotification({
      to: adminEmail,
      contactData: contactFormData,
      submissionId,
      submissionDate: new Date(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    if (adminResult.success) {
      console.log('  ✅ Admin notification sent successfully');
    } else {
      console.log('  ❌ Admin notification failed:', adminResult.error);
    }

    // Send confirmation to user
    console.log('  📧 Sending user confirmation...');
    const userResult = await emailService.sendContactConfirmation({
      to: contactFormData.email,
      contactData: contactFormData,
      submissionId,
      expectedResponseTime: '24-48 hours'
    });

    if (userResult.success) {
      console.log('  ✅ User confirmation sent successfully');
    } else {
      console.log('  ❌ User confirmation failed:', userResult.error);
    }

  } catch (error) {
    console.error('  💥 Contact form integration error:', error);
  }
}

/**
 * Demo: Newsletter Subscription Flow
 * 
 * This shows how to handle newsletter subscriptions with welcome emails.
 */
export async function demoNewsletterSubscription() {
  console.log('📰 Demo: Newsletter Subscription Flow');
  
  // Simulate newsletter subscription
  const subscriberData = {
    email: 'subscriber@example.com',
    name: 'Jane Smith',
    preferences: {
      blogUpdates: true,
      projectUpdates: true,
      newsletter: true
    }
  };

  const subscriberId = `sub_${Date.now()}`;

  try {
    console.log('  📧 Sending welcome email...');
    const result = await emailService.sendNewsletterWelcome({
      to: subscriberData.email,
      name: subscriberData.name,
      subscriberId,
      preferences: subscriberData.preferences
    });

    if (result.success) {
      console.log('  ✅ Welcome email sent successfully');
      console.log('  📬 Subscriber will receive welcome message with preferences');
    } else {
      console.log('  ❌ Welcome email failed:', result.error);
    }

  } catch (error) {
    console.error('  💥 Newsletter subscription error:', error);
  }
}

/**
 * Demo: Blog Post Notification
 * 
 * This shows how to notify subscribers about new blog posts.
 */
export async function demoBlogPostNotification() {
  console.log('📝 Demo: Blog Post Notification');
  
  // Simulate new blog post
  const blogPost = {
    title: 'Building a Scalable Email Service with SendGrid and Next.js',
    excerpt: 'Learn how to create a comprehensive, type-safe email service for your Next.js application using SendGrid. This guide covers everything from basic setup to advanced template management.',
    slug: 'building-scalable-email-service-sendgrid-nextjs',
    author: 'Yashdeep Tandon',
    publishedAt: new Date(),
    readTime: 8,
    tags: ['Next.js', 'SendGrid', 'TypeScript', 'Email', 'Tutorial']
  };

  // Simulate subscriber list
  const subscribers = [
    { email: 'subscriber1@example.com', name: 'Alice Johnson', id: 'sub_001' },
    { email: 'subscriber2@example.com', name: 'Bob Wilson', id: 'sub_002' },
    { email: 'subscriber3@example.com', name: 'Carol Davis', id: 'sub_003' }
  ];

  try {
    console.log(`  📧 Sending blog notifications to ${subscribers.length} subscribers...`);
    
    for (const subscriber of subscribers) {
      const result = await emailService.sendBlogNotification({
        to: subscriber.email,
        blogPost,
        subscriber: {
          name: subscriber.name,
          subscriberId: subscriber.id
        }
      });

      if (result.success) {
        console.log(`  ✅ Notification sent to ${subscriber.email}`);
      } else {
        console.log(`  ❌ Failed to send to ${subscriber.email}:`, result.error);
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

  } catch (error) {
    console.error('  💥 Blog notification error:', error);
  }
}

/**
 * Demo: Custom Email with Generic Function
 * 
 * This shows how to send custom emails using the generic email function.
 */
export async function demoCustomEmail() {
  console.log('✉️ Demo: Custom Email');
  
  try {
    console.log('  📧 Sending custom email...');
    
    const result = await emailService.sendGenericEmail({
      to: 'recipient@example.com',
      subject: 'Custom Portfolio Update',
      templateData: {
        html: `
          <h2>Portfolio Update</h2>
          <p>Hi there!</p>
          <p>I wanted to personally reach out to let you know about some exciting updates to my portfolio:</p>
          <ul>
            <li>🚀 New project showcase featuring React and Node.js</li>
            <li>📝 Fresh blog posts about web development best practices</li>
            <li>🎨 Updated design with improved user experience</li>
          </ul>
          <p>Check out the latest updates at <a href="${process.env.NEXTAUTH_URL}">my portfolio</a>.</p>
          <p>Best regards,<br>Yashdeep Tandon</p>
        `,
        text: `
Portfolio Update

Hi there!

I wanted to personally reach out to let you know about some exciting updates to my portfolio:

- New project showcase featuring React and Node.js
- Fresh blog posts about web development best practices  
- Updated design with improved user experience

Check out the latest updates at ${process.env.NEXTAUTH_URL}.

Best regards,
Yashdeep Tandon
        `.trim()
      },
      replyTo: process.env.FROM_EMAIL
    });

    if (result.success) {
      console.log('  ✅ Custom email sent successfully');
    } else {
      console.log('  ❌ Custom email failed:', result.error);
    }

  } catch (error) {
    console.error('  💥 Custom email error:', error);
  }
}

/**
 * Demo: Bulk Email Sending
 * 
 * This shows how to send emails to multiple recipients efficiently.
 */
export async function demoBulkEmailSending() {
  console.log('📮 Demo: Bulk Email Sending');
  
  const recipients = [
    'user1@example.com',
    'user2@example.com', 
    'user3@example.com'
  ];

  try {
    console.log(`  📧 Sending bulk email to ${recipients.length} recipients...`);
    
    const result = await emailService.sendGenericEmail({
      to: recipients,
      subject: 'Important Portfolio Announcement',
      templateData: {
        html: `
          <h2>Important Announcement</h2>
          <p>Thank you for your continued interest in my work!</p>
          <p>I'm excited to announce that I'm now available for new projects and collaborations.</p>
          <p>If you have any opportunities or would like to discuss potential work, please don't hesitate to reach out.</p>
        `,
        text: `
Important Announcement

Thank you for your continued interest in my work!

I'm excited to announce that I'm now available for new projects and collaborations.

If you have any opportunities or would like to discuss potential work, please don't hesitate to reach out.
        `.trim()
      }
    });

    if (result.success) {
      console.log('  ✅ Bulk email sent successfully to all recipients');
    } else {
      console.log('  ❌ Bulk email failed:', result.error);
    }

  } catch (error) {
    console.error('  💥 Bulk email error:', error);
  }
}

/**
 * Run all demos
 */
export async function runAllDemos() {
  console.log('🎬 Starting Email Service Demos\n');
  
  await demoContactFormIntegration();
  console.log('');
  
  await demoNewsletterSubscription();
  console.log('');
  
  await demoBlogPostNotification();
  console.log('');
  
  await demoCustomEmail();
  console.log('');
  
  await demoBulkEmailSending();
  console.log('');
  
  console.log('🎉 All demos completed!');
}

/**
 * Usage:
 * 
 * import { runAllDemos, demoContactFormIntegration } from '@/services/email/demo';
 * 
 * // Run all demos
 * await runAllDemos();
 * 
 * // Run specific demo
 * await demoContactFormIntegration();
 */

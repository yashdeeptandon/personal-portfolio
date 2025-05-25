/**
 * Email Service Test File
 * 
 * This file contains test functions to verify the email service functionality.
 * Run these tests to ensure your email configuration is working correctly.
 * 
 * Usage:
 * 1. Ensure your environment variables are set
 * 2. Import and run the test functions
 * 3. Check your email inbox for test messages
 */

import { emailService } from './service';
import { validateEmailConfig } from './config';

/**
 * Test email configuration
 */
export async function testEmailConfig(): Promise<void> {
  console.log('🔧 Testing email configuration...');
  
  const validation = validateEmailConfig();
  
  if (validation.isValid) {
    console.log('✅ Email configuration is valid');
  } else {
    console.error('❌ Email configuration errors:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Invalid email configuration');
  }
}

/**
 * Test contact notification email
 */
export async function testContactNotification(adminEmail: string): Promise<void> {
  console.log('📧 Testing contact notification email...');
  
  try {
    const result = await emailService.sendContactNotification({
      to: adminEmail,
      contactData: {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Contact Form Submission',
        message: 'This is a test message from the email service test suite. If you receive this, the contact notification system is working correctly!',
        phone: '+1 (555) 123-4567',
        company: 'Test Company Inc.'
      },
      submissionId: `test_${Date.now()}`,
      submissionDate: new Date(),
      ipAddress: '127.0.0.1',
      userAgent: 'Email Service Test Suite'
    });

    if (result.success) {
      console.log('✅ Contact notification sent successfully');
      console.log(`   Message ID: ${result.messageId}`);
    } else {
      console.error('❌ Contact notification failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Contact notification error:', error);
    throw error;
  }
}

/**
 * Test contact confirmation email
 */
export async function testContactConfirmation(userEmail: string): Promise<void> {
  console.log('📧 Testing contact confirmation email...');
  
  try {
    const result = await emailService.sendContactConfirmation({
      to: userEmail,
      contactData: {
        name: 'Test User',
        email: userEmail,
        subject: 'Test Contact Form Submission',
        message: 'This is a test message from the email service test suite.'
      },
      submissionId: `test_${Date.now()}`,
      expectedResponseTime: '24-48 hours'
    });

    if (result.success) {
      console.log('✅ Contact confirmation sent successfully');
      console.log(`   Message ID: ${result.messageId}`);
    } else {
      console.error('❌ Contact confirmation failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Contact confirmation error:', error);
    throw error;
  }
}

/**
 * Test newsletter welcome email
 */
export async function testNewsletterWelcome(userEmail: string): Promise<void> {
  console.log('📧 Testing newsletter welcome email...');
  
  try {
    const result = await emailService.sendNewsletterWelcome({
      to: userEmail,
      name: 'Test User',
      subscriberId: `test_sub_${Date.now()}`,
      preferences: {
        blogUpdates: true,
        projectUpdates: true,
        newsletter: true
      }
    });

    if (result.success) {
      console.log('✅ Newsletter welcome sent successfully');
      console.log(`   Message ID: ${result.messageId}`);
    } else {
      console.error('❌ Newsletter welcome failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Newsletter welcome error:', error);
    throw error;
  }
}

/**
 * Test blog notification email
 */
export async function testBlogNotification(userEmail: string): Promise<void> {
  console.log('📧 Testing blog notification email...');
  
  try {
    const result = await emailService.sendBlogNotification({
      to: userEmail,
      blogPost: {
        title: 'Test Blog Post: Email Service Implementation',
        excerpt: 'This is a test blog post to verify that the blog notification email system is working correctly. The email service has been successfully implemented with comprehensive templates and error handling.',
        slug: 'test-blog-post-email-service',
        author: 'Yashdeep Tandon',
        publishedAt: new Date(),
        readTime: 5,
        tags: ['Email', 'SendGrid', 'Next.js', 'TypeScript']
      },
      subscriber: {
        name: 'Test User',
        subscriberId: `test_sub_${Date.now()}`
      }
    });

    if (result.success) {
      console.log('✅ Blog notification sent successfully');
      console.log(`   Message ID: ${result.messageId}`);
    } else {
      console.error('❌ Blog notification failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Blog notification error:', error);
    throw error;
  }
}

/**
 * Test generic email
 */
export async function testGenericEmail(userEmail: string): Promise<void> {
  console.log('📧 Testing generic email...');
  
  try {
    const result = await emailService.sendGenericEmail({
      to: userEmail,
      subject: 'Test Generic Email from Email Service',
      templateData: {
        html: `
          <h2>Generic Email Test</h2>
          <p>This is a test of the generic email functionality.</p>
          <p>If you receive this email, the generic email system is working correctly!</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Timestamp: ${new Date().toISOString()}</li>
            <li>Service: Email Service Test Suite</li>
            <li>Type: Generic Email</li>
          </ul>
        `,
        text: `
Generic Email Test

This is a test of the generic email functionality.
If you receive this email, the generic email system is working correctly!

Test Details:
- Timestamp: ${new Date().toISOString()}
- Service: Email Service Test Suite
- Type: Generic Email
        `.trim()
      }
    });

    if (result.success) {
      console.log('✅ Generic email sent successfully');
      console.log(`   Message ID: ${result.messageId}`);
    } else {
      console.error('❌ Generic email failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Generic email error:', error);
    throw error;
  }
}

/**
 * Run all email tests
 */
export async function runAllEmailTests(
  adminEmail: string, 
  userEmail: string
): Promise<void> {
  console.log('🚀 Starting email service test suite...\n');
  
  try {
    await testEmailConfig();
    console.log('');
    
    await testContactNotification(adminEmail);
    console.log('');
    
    await testContactConfirmation(userEmail);
    console.log('');
    
    await testNewsletterWelcome(userEmail);
    console.log('');
    
    await testBlogNotification(userEmail);
    console.log('');
    
    await testGenericEmail(userEmail);
    console.log('');
    
    console.log('🎉 All email tests completed successfully!');
    console.log('📬 Check your email inboxes for the test messages.');
    
  } catch (error) {
    console.error('💥 Email test suite failed:', error);
    throw error;
  }
}

/**
 * Example usage:
 * 
 * import { runAllEmailTests } from '@/services/email/test';
 * 
 * // Run all tests
 * await runAllEmailTests('admin@yourdomain.com', 'test@yourdomain.com');
 * 
 * // Or run individual tests
 * await testContactNotification('admin@yourdomain.com');
 */

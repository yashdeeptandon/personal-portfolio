/**
 * Newsletter Email Templates
 * 
 * Templates for newsletter related emails:
 * - Welcome email for new subscribers
 * - Blog notification emails
 * - Unsubscribe confirmation
 */

import { generateBaseTemplate, generateBaseTextTemplate } from './base';
import { formatEmailDate, truncateText, generateUnsubscribeUrl } from '../config';
import { NewsletterWelcomeParams, BlogNotificationParams, EmailTemplate } from '../types';

/**
 * Generate newsletter welcome email
 */
export function generateNewsletterWelcomeTemplate(params: NewsletterWelcomeParams): EmailTemplate {
  const { name, subscriberId, preferences, unsubscribeUrl } = params;
  const displayName = name || 'there';
  const finalUnsubscribeUrl = unsubscribeUrl || generateUnsubscribeUrl(subscriberId);

  const subject = `Welcome to my newsletter, ${displayName}! 🎉`;

  const content = `
    <h2>Welcome to my newsletter! 🎉</h2>
    
    <p>Hi ${displayName},</p>
    
    <p>Thank you for subscribing to my newsletter! I'm excited to have you as part of my community and look forward to sharing my journey, insights, and latest work with you.</p>

    <div class="card card-highlight">
        <h3 style="margin-top: 0; color: #1F2937;">What you can expect</h3>
        <ul style="color: #6B7280; padding-left: 20px; margin-bottom: 0;">
            ${preferences?.blogUpdates !== false ? '<li><strong>Blog Updates:</strong> New articles, tutorials, and insights</li>' : ''}
            ${preferences?.projectUpdates !== false ? '<li><strong>Project Updates:</strong> Latest work and case studies</li>' : ''}
            ${preferences?.newsletter !== false ? '<li><strong>Newsletter:</strong> Monthly roundups and exclusive content</li>' : ''}
            <li><strong>Behind the scenes:</strong> Development process and lessons learned</li>
            <li><strong>Industry insights:</strong> Trends and best practices in web development</li>
        </ul>
    </div>

    <div class="card">
        <h3 style="margin-top: 0; color: #1F2937;">Get started</h3>
        <p>While you're here, why not explore some of my recent work?</p>
        
        <div class="text-center" style="margin-top: 20px;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/projects" 
               class="btn" 
               style="margin-right: 10px;">
                View My Projects
            </a>
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/blog" 
               class="btn btn-secondary">
                Read Latest Posts
            </a>
        </div>
    </div>

    <div class="card">
        <h3 style="margin-top: 0; color: #1F2937;">Stay connected</h3>
        <p>You can also follow me on social media for more frequent updates and behind-the-scenes content:</p>
        
        <div class="text-center" style="margin-top: 20px;">
            <a href="https://github.com/yashdeeptandon" 
               style="color: #3B82F6; text-decoration: none; margin: 0 10px;">
                GitHub
            </a>
            <a href="https://linkedin.com/in/yashdeeptandon" 
               style="color: #3B82F6; text-decoration: none; margin: 0 10px;">
                LinkedIn
            </a>
            <a href="https://twitter.com/yashdeeptandon" 
               style="color: #3B82F6; text-decoration: none; margin: 0 10px;">
                Twitter
            </a>
        </div>
    </div>

    <p style="margin-top: 30px; font-size: 14px; color: #6B7280;">
        You can update your email preferences or unsubscribe at any time using the link in the footer of this email.
    </p>
  `;

  const html = generateBaseTemplate({
    title: 'Welcome to My Newsletter!',
    preheader: `Welcome ${displayName}! Thanks for subscribing to my newsletter.`,
    content,
    footerContent: 'Thanks for joining my community!',
    unsubscribeUrl: finalUnsubscribeUrl
  });

  const text = generateBaseTextTemplate({
    title: 'Welcome to My Newsletter!',
    content: `
Hi ${displayName},

Thank you for subscribing to my newsletter! I'm excited to have you as part of my community and look forward to sharing my journey, insights, and latest work with you.

What you can expect:
${preferences?.blogUpdates !== false ? '- Blog Updates: New articles, tutorials, and insights' : ''}
${preferences?.projectUpdates !== false ? '- Project Updates: Latest work and case studies' : ''}
${preferences?.newsletter !== false ? '- Newsletter: Monthly roundups and exclusive content' : ''}
- Behind the scenes: Development process and lessons learned
- Industry insights: Trends and best practices in web development

Get started:
While you're here, why not explore some of my recent work?

View My Projects: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/projects
Read Latest Posts: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/blog

Stay connected:
- GitHub: https://github.com/yashdeeptandon
- LinkedIn: https://linkedin.com/in/yashdeeptandon
- Twitter: https://twitter.com/yashdeeptandon

You can update your email preferences or unsubscribe at any time.
    `.trim(),
    footerContent: 'Thanks for joining my community!',
    unsubscribeUrl: finalUnsubscribeUrl
  });

  return { subject, html, text };
}

/**
 * Generate blog notification email
 */
export function generateBlogNotificationTemplate(params: BlogNotificationParams): EmailTemplate {
  const { blogPost, subscriber, unsubscribeUrl } = params;
  const displayName = subscriber?.name || 'there';
  const finalUnsubscribeUrl = unsubscribeUrl || (subscriber?.subscriberId ? generateUnsubscribeUrl(subscriber.subscriberId) : undefined);
  const blogUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/blog/${blogPost.slug}`;

  const subject = `New Blog Post: ${blogPost.title}`;

  const content = `
    <h2>New Blog Post Published! 📝</h2>
    
    <p>Hi ${displayName},</p>
    
    <p>I just published a new blog post that I think you'll find interesting. Here's what it's about:</p>

    <div class="card card-highlight">
        <h3 style="margin-top: 0; color: #1F2937;">
            <a href="${blogUrl}" style="color: #1F2937; text-decoration: none;">
                ${blogPost.title}
            </a>
        </h3>
        
        <p style="color: #6B7280; margin-bottom: 16px;">
            ${blogPost.excerpt}
        </p>
        
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
            ${blogPost.tags ? blogPost.tags.map(tag => 
              `<span style="background-color: #EBF4FF; color: #3B82F6; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">${tag}</span>`
            ).join('') : ''}
        </div>
        
        <div style="font-size: 14px; color: #6B7280; margin-bottom: 20px;">
            <span>By ${blogPost.author}</span>
            <span style="margin: 0 8px;">•</span>
            <span>${formatEmailDate(blogPost.publishedAt)}</span>
            ${blogPost.readTime ? `<span style="margin: 0 8px;">•</span><span>${blogPost.readTime} min read</span>` : ''}
        </div>
        
        <div class="text-center">
            <a href="${blogUrl}" 
               class="btn">
                Read Full Article
            </a>
        </div>
    </div>

    <div class="card">
        <h3 style="margin-top: 0; color: #1F2937;">More from the blog</h3>
        <p>If you enjoyed this post, you might also like to explore my other recent articles and tutorials.</p>
        
        <div class="text-center" style="margin-top: 20px;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/blog" 
               class="btn btn-secondary">
                Browse All Posts
            </a>
        </div>
    </div>

    <p style="margin-top: 30px; font-size: 14px; color: #6B7280;">
        I hope you find this content valuable! Feel free to reply to this email if you have any questions or feedback.
    </p>
  `;

  const html = generateBaseTemplate({
    title: 'New Blog Post Published',
    preheader: `${blogPost.title} - ${truncateText(blogPost.excerpt, 100)}`,
    content,
    footerContent: 'Happy reading!',
    unsubscribeUrl: finalUnsubscribeUrl
  });

  const text = generateBaseTextTemplate({
    title: 'New Blog Post Published',
    content: `
Hi ${displayName},

I just published a new blog post that I think you'll find interesting:

${blogPost.title}
${blogPost.excerpt}

By ${blogPost.author} • ${formatEmailDate(blogPost.publishedAt)}${blogPost.readTime ? ` • ${blogPost.readTime} min read` : ''}

${blogPost.tags ? `Tags: ${blogPost.tags.join(', ')}` : ''}

Read the full article: ${blogUrl}

Browse all posts: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/blog

I hope you find this content valuable! Feel free to reply to this email if you have any questions or feedback.
    `.trim(),
    footerContent: 'Happy reading!',
    unsubscribeUrl: finalUnsubscribeUrl
  });

  return { subject, html, text };
}

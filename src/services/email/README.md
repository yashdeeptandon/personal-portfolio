# Email Service

A comprehensive, standalone email service for the portfolio project using [Resend](https://resend.com) and [React Email](https://react.email). This service is type-safe and easily callable from anywhere in the application. See `RESEND_SETUP.md` at the repo root for the full account/domain/DNS setup guide.

## 🏗️ Architecture

```
src/services/email/
├── index.ts              # Main entry point
├── service.ts            # Core email service implementation (Resend transport)
├── types.ts              # TypeScript type definitions
├── config.ts             # Configuration and utilities
├── templates/             # React Email templates
│   ├── index.ts           # Renders components -> {subject, html, text}, registry
│   ├── EmailLayout.tsx     # Shared header/footer wrapper used by every template
│   ├── styles.ts           # Shared inline-style tokens (brand colors, cards, buttons)
│   ├── ContactNotificationEmail.tsx
│   ├── ContactConfirmationEmail.tsx
│   ├── NewsletterWelcomeEmail.tsx
│   └── BlogNotificationEmail.tsx
└── README.md              # This file
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { emailService } from '@/services/email';

// Send contact notification
await emailService.sendContactNotification({
  to: 'admin@example.com',
  contactData: {
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello, I would like to discuss a project.'
  },
  submissionId: 'contact_123'
});

// Send newsletter welcome
await emailService.sendNewsletterWelcome({
  to: 'user@example.com',
  name: 'John Doe',
  subscriberId: 'sub_456'
});
```

### Environment Variables

Ensure these environment variables are set:

```env
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=your_email@domain.com
FROM_NAME="Your Name"
ADMIN_EMAIL=admin@domain.com  # Optional, defaults to FROM_EMAIL
```

## 📧 Available Functions

### Core Functions

#### `sendContactNotification(params)`
Sends an email notification to admin when someone submits the contact form.

```typescript
await emailService.sendContactNotification({
  to: 'admin@example.com',
  contactData: {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Project Inquiry',
    message: 'I would like to discuss a project.',
    phone: '+1234567890',      // Optional
    company: 'Acme Corp'       // Optional
  },
  submissionId: 'contact_123',
  submissionDate: new Date(),  // Optional
  ipAddress: '192.168.1.1',   // Optional
  userAgent: 'Mozilla/5.0...' // Optional
});
```

#### `sendContactConfirmation(params)`
Sends a confirmation email to users after they submit the contact form.

```typescript
await emailService.sendContactConfirmation({
  to: 'user@example.com',
  contactData: {
    name: 'John Doe',
    email: 'user@example.com',
    subject: 'Project Inquiry',
    message: 'I would like to discuss a project.'
  },
  submissionId: 'contact_123',
  expectedResponseTime: '24-48 hours' // Optional
});
```

#### `sendNewsletterWelcome(params)`
Sends a welcome email to new newsletter subscribers.

```typescript
await emailService.sendNewsletterWelcome({
  to: 'user@example.com',
  name: 'John Doe',           // Optional
  subscriberId: 'sub_456',
  preferences: {              // Optional
    blogUpdates: true,
    projectUpdates: true,
    newsletter: true
  },
  unsubscribeUrl: 'https://...' // Optional, auto-generated if not provided
});
```

#### `sendBlogNotification(params)`
Sends blog update notifications to subscribers.

```typescript
await emailService.sendBlogNotification({
  to: ['user1@example.com', 'user2@example.com'],
  blogPost: {
    title: 'My Latest Blog Post',
    excerpt: 'This is a summary of the blog post...',
    slug: 'my-latest-blog-post',
    author: 'Yashdeep Tandon',
    publishedAt: new Date(),
    readTime: 5,              // Optional
    tags: ['React', 'Next.js'] // Optional
  },
  subscriber: {               // Optional
    name: 'John Doe',
    subscriberId: 'sub_456'
  },
  unsubscribeUrl: 'https://...' // Optional
});
```

#### `sendGenericEmail(params)`
Sends custom emails with your own content.

```typescript
await emailService.sendGenericEmail({
  to: 'user@example.com',
  subject: 'Custom Email Subject',
  templateData: {
    html: '<h1>Custom HTML content</h1>',
    text: 'Custom text content'
  },
  replyTo: 'hello@example.com', // Optional — avoid "noreply", replies should reach someone
  cc: ['cc@example.com'],         // Optional
  bcc: ['bcc@example.com']        // Optional
});
```

## 🎨 Email Templates

All emails use a consistent base template with:
- Responsive design
- Brand colors and styling
- Dark mode support
- Professional layout
- Unsubscribe links (where applicable)

### Template Features

- **HTML & Text versions**: Every email includes both HTML and plain text versions
- **Responsive design**: Optimized for desktop and mobile devices
- **Brand consistency**: Uses your portfolio's color scheme and styling
- **Accessibility**: Proper semantic HTML and alt text
- **Email client compatibility**: Tested across major email clients

## 🔧 Configuration

### Brand Colors

The service uses predefined brand colors that match your portfolio:

```typescript
export const BRAND_COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#1E40AF',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  // ... more colors
};
```

### Email Validation

The service includes comprehensive email validation:

```typescript
import { validateEmailAddress, validateEmailAddresses } from '@/services/email';

// Validate single email
const isValid = validateEmailAddress('user@example.com');

// Validate multiple emails
const validation = validateEmailAddresses(['user1@example.com', 'user2@example.com']);
if (!validation.isValid) {
  console.log('Errors:', validation.errors);
}
```

## 🛡️ Error Handling

The service includes comprehensive error handling:

```typescript
try {
  const result = await emailService.sendContactNotification(params);
  
  if (result.success) {
    console.log('Email sent successfully:', result.messageId);
  } else {
    console.error('Email failed:', result.error);
  }
} catch (error) {
  console.error('Service error:', error);
}
```

## 🔍 Response Format

All email functions return a consistent response format:

```typescript
interface EmailResponse {
  success: boolean;
  messageId?: string;    // Resend message ID
  error?: string;        // Error message if failed
  statusCode?: number;   // HTTP status code
}
```

## 🚦 Integration Examples

### API Route Integration

```typescript
// In your API route
import { emailService } from '@/services/email';

export async function POST(request: Request) {
  // ... handle request
  
  try {
    await emailService.sendContactNotification({
      to: process.env.ADMIN_EMAIL!,
      contactData: formData,
      submissionId: contact._id.toString()
    });
  } catch (error) {
    // Handle email error (don't fail the request)
    console.error('Email error:', error);
  }
  
  // ... return response
}
```

### Background Job Integration

```typescript
// In a background job or cron task
import { emailService } from '@/services/email';

async function sendBlogNotifications(blogPost, subscribers) {
  for (const subscriber of subscribers) {
    try {
      await emailService.sendBlogNotification({
        to: subscriber.email,
        blogPost,
        subscriber: {
          name: subscriber.name,
          subscriberId: subscriber._id.toString()
        }
      });
    } catch (error) {
      console.error(`Failed to send to ${subscriber.email}:`, error);
    }
  }
}
```

## 🔮 Future Enhancements

The service is designed to be extensible. Planned features include:

- Email queue system for bulk sending
- Email analytics and tracking
- Template management interface
- A/B testing capabilities
- Email scheduling
- Webhook handling for delivery status

## 🐛 Troubleshooting

### Common Issues

1. **Environment variables not set**: Ensure all required environment variables are configured
2. **Invalid email addresses**: Check email validation before sending
3. **Resend API errors**: Verify API key, account status, and that the sending domain is verified (run `node scripts/check-resend-domain.mjs`)
4. **Template rendering errors**: Check template data structure

### Debug Mode

Enable detailed logging by setting the log level in your environment:

```env
LOG_LEVEL=debug
```

## 📝 License

This email service is part of the portfolio project and follows the same license terms.

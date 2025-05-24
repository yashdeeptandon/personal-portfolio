import { logStartup, logError, logWarning } from './logger';
import dbConnect from '@/lib/db/connection';

export async function initializeApplication() {
  const startTime = Date.now();
  
  try {
    logStartup('Portfolio application starting up...', {
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      platform: process.platform,
      arch: process.arch
    });

    // Check environment variables
    const requiredEnvVars = [
      'MONGODB_URI',
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      logWarning('Missing required environment variables', {
        missing: missingEnvVars,
        total: requiredEnvVars.length
      });
    } else {
      logStartup('All required environment variables are configured');
    }

    // Optional environment variables check
    const optionalEnvVars = [
      'SENDGRID_API_KEY',
      'BLOB_READ_WRITE_TOKEN',
      'GITHUB_TOKEN',
      'GOOGLE_ANALYTICS_ID'
    ];

    const missingOptionalVars = optionalEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingOptionalVars.length > 0) {
      logWarning('Some optional features may not work due to missing environment variables', {
        missing: missingOptionalVars,
        impact: 'Email, file upload, GitHub integration, or analytics features may be disabled'
      });
    }

    // Test database connection
    try {
      await dbConnect();
      logStartup('Database connection established successfully');
    } catch (error) {
      logError(error, { 
        operation: 'database_connection_test',
        critical: true 
      });
      throw error;
    }

    const initTime = Date.now() - startTime;
    logStartup('Application initialization completed', {
      initializationTime: `${initTime}ms`,
      status: 'ready'
    });

    return {
      success: true,
      initTime,
      missingEnvVars,
      missingOptionalVars
    };

  } catch (error) {
    const initTime = Date.now() - startTime;
    logError(error, {
      operation: 'application_initialization',
      initializationTime: `${initTime}ms`,
      critical: true
    });
    
    throw error;
  }
}

export function logApplicationInfo() {
  logStartup('Portfolio Backend API', {
    version: '1.0.0',
    description: 'Personal Portfolio Backend with CMS, Analytics, and Authentication',
    features: [
      'Blog Management',
      'Project Showcase',
      'Contact Forms',
      'Testimonials',
      'Newsletter',
      'Analytics Tracking',
      'Admin Authentication',
      'File Upload',
      'Email Notifications'
    ],
    endpoints: {
      blog: '/api/blog',
      projects: '/api/projects',
      contact: '/api/contact',
      testimonials: '/api/testimonials',
      auth: '/api/auth',
      analytics: '/api/analytics'
    }
  });
}

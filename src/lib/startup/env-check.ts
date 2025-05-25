/**
 * Startup Environment Validation
 * Validates critical environment variables when the application starts
 */

import { checkEnvironment } from '@/lib/utils/env-validation';

let hasValidated = false;

/**
 * Validates environment variables on application startup
 * This should be called early in the application lifecycle
 */
export function validateStartupEnvironment(): void {
  // Only validate once per application lifecycle
  if (hasValidated) {
    return;
  }

  console.log('🔍 Validating environment configuration...');
  
  const validation = checkEnvironment();
  
  if (!validation.isValid) {
    console.error('\n❌ Critical environment validation failed!');
    console.error('The application cannot start without proper configuration.\n');
    
    // In development, provide helpful guidance
    if (process.env.NODE_ENV === 'development') {
      console.error('📝 Development Setup Guide:');
      console.error('1. Copy .env.example to .env.local');
      console.error('2. Update .env.local with your actual values');
      console.error('3. Restart the development server\n');
    }
    
    // In production, exit gracefully
    if (process.env.NODE_ENV === 'production') {
      console.error('🚨 Production environment is misconfigured!');
      process.exit(1);
    }
  } else {
    console.log('✅ Environment validation completed successfully');
  }
  
  hasValidated = true;
}

/**
 * Validates environment for API routes
 * Use this in API routes that require specific environment variables
 */
export function validateApiEnvironment(requiredVars: string[]): { isValid: boolean; missing: string[] } {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  return {
    isValid: missing.length === 0,
    missing
  };
}

/**
 * Validates database environment specifically
 * Use this before database operations
 */
export function validateDatabaseEnvironment(): { isValid: boolean; error?: string } {
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.DATABASE_NAME;
  
  if (!mongoUri) {
    return { isValid: false, error: 'MONGODB_URI is required for database operations' };
  }
  
  if (!dbName) {
    return { isValid: false, error: 'DATABASE_NAME is required for database operations' };
  }
  
  // Validate MongoDB URI format
  if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    return { isValid: false, error: 'MONGODB_URI must be a valid MongoDB connection string' };
  }
  
  return { isValid: true };
}

/**
 * Validates email environment for SendGrid
 */
export function validateEmailEnvironment(): { isValid: boolean; missing: string[] } {
  const required = ['SENDGRID_API_KEY', 'FROM_EMAIL', 'FROM_NAME'];
  const missing = required.filter(varName => !process.env[varName]);
  
  return {
    isValid: missing.length === 0,
    missing
  };
}

/**
 * Validates authentication environment
 */
export function validateAuthEnvironment(): { isValid: boolean; missing: string[] } {
  const required = ['NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
  const missing = required.filter(varName => !process.env[varName]);
  
  return {
    isValid: missing.length === 0,
    missing
  };
}

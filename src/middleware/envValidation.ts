/**
 * Environment Validation Middleware
 * Validates required environment variables for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateApiEnvironment, validateDatabaseEnvironment, validateEmailEnvironment, validateAuthEnvironment } from '@/lib/startup/env-check';
import { logError, logWarning } from '@/lib/utils/logger';

export interface EnvValidationOptions {
  database?: boolean;
  email?: boolean;
  auth?: boolean;
  custom?: string[];
}

/**
 * Middleware to validate environment variables for API routes
 */
export function withEnvValidation(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  options: EnvValidationOptions = {}
) {
  return async (req: NextRequest, context?: any): Promise<NextResponse> => {
    const validationErrors: string[] = [];
    
    try {
      // Validate database environment if required
      if (options.database) {
        const dbValidation = validateDatabaseEnvironment();
        if (!dbValidation.isValid) {
          validationErrors.push(`Database: ${dbValidation.error}`);
        }
      }
      
      // Validate email environment if required
      if (options.email) {
        const emailValidation = validateEmailEnvironment();
        if (!emailValidation.isValid) {
          validationErrors.push(`Email: Missing ${emailValidation.missing.join(', ')}`);
        }
      }
      
      // Validate auth environment if required
      if (options.auth) {
        const authValidation = validateAuthEnvironment();
        if (!authValidation.isValid) {
          validationErrors.push(`Auth: Missing ${authValidation.missing.join(', ')}`);
        }
      }
      
      // Validate custom environment variables if specified
      if (options.custom && options.custom.length > 0) {
        const customValidation = validateApiEnvironment(options.custom);
        if (!customValidation.isValid) {
          validationErrors.push(`Custom: Missing ${customValidation.missing.join(', ')}`);
        }
      }
      
      // If there are validation errors, return error response
      if (validationErrors.length > 0) {
        const errorMessage = 'Environment configuration error';
        const errorDetails = validationErrors.join('; ');
        
        logError(new Error(errorMessage), {
          operation: 'env_validation',
          path: req.nextUrl.pathname,
          method: req.method,
          errors: validationErrors,
        });
        
        return NextResponse.json(
          {
            success: false,
            error: errorMessage,
            message: 'Server configuration error. Please contact administrator.',
            ...(process.env.NODE_ENV === 'development' && { details: errorDetails })
          },
          { status: 500 }
        );
      }
      
      // Environment validation passed, proceed with the handler
      return await handler(req, context);
      
    } catch (error) {
      logError(error, {
        operation: 'env_validation_middleware',
        path: req.nextUrl.pathname,
        method: req.method,
      });
      
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          message: 'An unexpected error occurred during environment validation'
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Specific middleware for database-dependent routes
 */
export function withDatabaseValidation(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withEnvValidation(handler, { database: true });
}

/**
 * Specific middleware for email-dependent routes
 */
export function withEmailValidation(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withEnvValidation(handler, { email: true });
}

/**
 * Specific middleware for auth-dependent routes
 */
export function withAuthValidation(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withEnvValidation(handler, { auth: true });
}

/**
 * Comprehensive middleware for routes that need database and auth
 */
export function withFullValidation(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withEnvValidation(handler, { database: true, auth: true });
}

/**
 * Validation for admin routes that need everything
 */
export function withAdminValidation(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>
) {
  return withEnvValidation(handler, { 
    database: true, 
    auth: true,
    custom: ['ADMIN_EMAIL', 'ADMIN_PASSWORD'] 
  });
}

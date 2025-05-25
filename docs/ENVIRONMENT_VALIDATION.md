# Environment Variable Validation

This document describes the comprehensive environment variable validation system implemented in the portfolio application to prevent runtime errors and ensure proper configuration.

## Overview

The application now includes multiple layers of environment validation:

1. **Startup Validation** - Validates critical variables when the application starts
2. **Database Connection Validation** - Validates database configuration before connection attempts
3. **API Route Validation** - Validates required variables for specific API endpoints
4. **Script Validation** - Validates environment for admin scripts

## Validation Components

### 1. Core Validation Utility (`src/lib/utils/env-validation.ts`)

Provides comprehensive environment variable validation with detailed error reporting.

**Key Functions:**
- `validateEnvironmentVariables()` - Validates all environment variables
- `requireValidEnvironment()` - Throws error if validation fails
- `checkEnvironment()` - Logs validation results without throwing
- `validateDatabaseConfig()` - Database-specific validation
- `getEnvVar()` - Safe environment variable retrieval

### 2. Database Connection Validation (`src/lib/db/connection.ts`)

Enhanced database connection with pre-connection validation:

```typescript
// Validates MONGODB_URI and DATABASE_NAME before connection
const dbValidation = validateDatabaseConfig();
if (!dbValidation.isValid) {
  throw new Error(`Database configuration error: ${dbValidation.error}`);
}
```

### 3. API Route Middleware (`src/middleware/envValidation.ts`)

Middleware for validating environment variables in API routes:

```typescript
// Database validation middleware
export const GET = withDatabaseValidation(async (req) => {
  // Handler code - database config is guaranteed to be valid
});

// Email validation middleware
export const POST = withEmailValidation(async (req) => {
  // Handler code - email config is guaranteed to be valid
});

// Full validation (database + auth)
export const PUT = withFullValidation(async (req) => {
  // Handler code - all critical config is valid
});
```

### 4. Script Validation

Admin scripts now validate environment before execution:

```javascript
// Validates MONGODB_URI, DATABASE_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
validateEnvironment();
```

## Required Environment Variables

### Critical (Application won't start without these)
- `MONGODB_URI` - MongoDB connection string
- `DATABASE_NAME` - Database name
- `NEXTAUTH_SECRET` - NextAuth.js secret key
- `NEXTAUTH_URL` - Application URL

### Optional (Features disabled if missing)
- `SENDGRID_API_KEY` - Email functionality
- `FROM_EMAIL` - Email sender address
- `FROM_NAME` - Email sender name
- `BLOB_READ_WRITE_TOKEN` - File upload functionality
- `GITHUB_TOKEN` - GitHub integration
- `GITHUB_USERNAME` - GitHub profile data
- `GOOGLE_ANALYTICS_ID` - Analytics tracking
- `ADMIN_EMAIL` - Admin user scripts
- `ADMIN_PASSWORD` - Admin user scripts
- `ADMIN_NAME` - Admin user display name

## Validation Features

### 1. Format Validation
- **MongoDB URI**: Validates `mongodb://` or `mongodb+srv://` format
- **URLs**: Validates proper URL format for `NEXTAUTH_URL`
- **Email**: Basic email format validation

### 2. Dependency Validation
- Warns if `SENDGRID_API_KEY` is set but `FROM_EMAIL` is missing
- Warns if `GITHUB_TOKEN` is set but `GITHUB_USERNAME` is missing

### 3. Environment-Specific Behavior
- **Development**: Shows detailed error messages and setup guidance
- **Production**: Exits gracefully with minimal error exposure

## Usage Examples

### 1. API Route with Database Validation

```typescript
import { withDatabaseValidation } from '@/middleware/envValidation';

export const GET = withDatabaseValidation(async (req) => {
  // Database environment is guaranteed to be valid
  await dbConnect(); // Will not fail due to missing env vars
  // ... rest of handler
});
```

### 2. API Route with Multiple Validations

```typescript
import { withEnvValidation } from '@/middleware/envValidation';

export const POST = withEnvValidation(async (req) => {
  // All specified environment variables are guaranteed to be valid
  // ... handler code
}, {
  database: true,
  email: true,
  custom: ['CUSTOM_API_KEY']
});
```

### 3. Manual Validation in Components

```typescript
import { getEnvVar, validateDatabaseConfig } from '@/lib/utils/env-validation';

// Safe environment variable access
const apiKey = getEnvVar('API_KEY', true); // Throws if missing

// Database validation
const dbValidation = validateDatabaseConfig();
if (!dbValidation.isValid) {
  console.error('Database not configured:', dbValidation.error);
}
```

## Error Handling

### Development Environment
- Detailed error messages with missing variable names
- Setup guidance and troubleshooting tips
- Links to documentation

### Production Environment
- Generic error messages to avoid information disclosure
- Graceful application shutdown for critical errors
- Comprehensive logging for debugging

## Benefits

1. **Prevents Runtime Errors**: Catches configuration issues before they cause crashes
2. **Clear Error Messages**: Provides specific guidance on what's missing
3. **Security**: Validates sensitive configuration without exposing values
4. **Developer Experience**: Clear setup instructions and validation feedback
5. **Production Safety**: Graceful handling of configuration errors
6. **Maintainability**: Centralized validation logic

## Best Practices

1. **Always validate before database operations**
2. **Use middleware for API routes that depend on external services**
3. **Validate early in the application lifecycle**
4. **Provide clear error messages in development**
5. **Log validation results for debugging**
6. **Use type-safe environment variable access**

## Testing Validation

To test the validation system:

1. **Remove a required variable** from `.env.local`
2. **Run the application** - should show clear error message
3. **Run admin scripts** - should validate before execution
4. **Access API routes** - should return proper error responses

## Migration Guide

For existing API routes, add validation middleware:

```typescript
// Before
export const GET = async (req) => { ... };

// After
export const GET = withDatabaseValidation(async (req) => { ... });
```

This ensures all routes have proper environment validation without breaking existing functionality.

/**
 * Environment Variable Validation Utility
 * Validates that all required environment variables are present and properly formatted
 */

interface EnvConfig {
  // Database
  MONGODB_URI: string;
  DATABASE_NAME: string;
  
  // Authentication
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  
  // Email (SendGrid)
  SENDGRID_API_KEY?: string;
  FROM_EMAIL?: string;
  FROM_NAME?: string;
  
  // File Storage (Vercel Blob)
  BLOB_READ_WRITE_TOKEN?: string;
  
  // External APIs (Optional)
  GITHUB_TOKEN?: string;
  GITHUB_USERNAME?: string;
  
  // Analytics (Optional)
  GOOGLE_ANALYTICS_ID?: string;
  
  // Admin Configuration (for scripts)
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_NAME?: string;
  
  // Rate Limiting
  RATE_LIMIT_MAX?: string;
  RATE_LIMIT_WINDOW?: string;
  
  // Environment
  NODE_ENV?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  config: Partial<EnvConfig>;
}

/**
 * Required environment variables that must be present
 */
const REQUIRED_VARS = [
  'MONGODB_URI',
  'DATABASE_NAME',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
] as const;

/**
 * Optional environment variables with their purposes
 */
const OPTIONAL_VARS = {
  SENDGRID_API_KEY: 'Email functionality',
  FROM_EMAIL: 'Email sender address',
  FROM_NAME: 'Email sender name',
  BLOB_READ_WRITE_TOKEN: 'File upload functionality',
  GITHUB_TOKEN: 'GitHub integration',
  GITHUB_USERNAME: 'GitHub profile data',
  GOOGLE_ANALYTICS_ID: 'Analytics tracking',
  ADMIN_EMAIL: 'Admin user scripts',
  ADMIN_PASSWORD: 'Admin user scripts',
  ADMIN_NAME: 'Admin user display name',
  RATE_LIMIT_MAX: 'API rate limiting',
  RATE_LIMIT_WINDOW: 'API rate limiting window',
  NODE_ENV: 'Environment detection'
} as const;

/**
 * Validates environment variables and returns detailed results
 */
export function validateEnvironmentVariables(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const config: Partial<EnvConfig> = {};

  // Check required variables
  for (const varName of REQUIRED_VARS) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${varName}`);
    } else {
      // Additional validation for specific variables
      if (varName === 'MONGODB_URI' && !isValidMongoURI(value)) {
        errors.push(`Invalid MONGODB_URI format: ${varName}`);
      } else if (varName === 'NEXTAUTH_URL' && !isValidURL(value)) {
        errors.push(`Invalid NEXTAUTH_URL format: ${varName}`);
      } else {
        config[varName] = value;
      }
    }
  }

  // Check optional variables and provide warnings for missing ones
  for (const [varName, purpose] of Object.entries(OPTIONAL_VARS)) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      warnings.push(`Optional variable ${varName} not set (used for: ${purpose})`);
    } else {
      config[varName as keyof EnvConfig] = value;
    }
  }

  // Additional validations
  if (config.SENDGRID_API_KEY && !config.FROM_EMAIL) {
    warnings.push('SENDGRID_API_KEY is set but FROM_EMAIL is missing');
  }

  if (config.GITHUB_TOKEN && !config.GITHUB_USERNAME) {
    warnings.push('GITHUB_TOKEN is set but GITHUB_USERNAME is missing');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config
  };
}

/**
 * Validates MongoDB URI format
 */
function isValidMongoURI(uri: string): boolean {
  try {
    // Basic MongoDB URI validation
    return uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');
  } catch {
    return false;
  }
}

/**
 * Validates URL format
 */
function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Throws an error if required environment variables are missing
 * Use this in critical paths where the application cannot continue without proper configuration
 */
export function requireValidEnvironment(): EnvConfig {
  const validation = validateEnvironmentVariables();
  
  if (!validation.isValid) {
    const errorMessage = [
      '❌ Environment validation failed!',
      '',
      'Missing required environment variables:',
      ...validation.errors.map(error => `  • ${error}`),
      '',
      'Please check your .env.local file and ensure all required variables are set.',
      'See .env.example for a template of required variables.'
    ].join('\n');
    
    throw new Error(errorMessage);
  }

  // Log warnings if any
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Environment warnings:');
    validation.warnings.forEach(warning => console.warn(`  • ${warning}`));
  }

  return validation.config as EnvConfig;
}

/**
 * Validates environment and logs results without throwing
 * Use this for non-critical validation or startup checks
 */
export function checkEnvironment(): ValidationResult {
  const validation = validateEnvironmentVariables();
  
  if (validation.isValid) {
    console.log('✅ Environment validation passed');
    if (validation.warnings.length > 0) {
      console.warn('⚠️ Environment warnings:');
      validation.warnings.forEach(warning => console.warn(`  • ${warning}`));
    }
  } else {
    console.error('❌ Environment validation failed:');
    validation.errors.forEach(error => console.error(`  • ${error}`));
    if (validation.warnings.length > 0) {
      console.warn('⚠️ Additional warnings:');
      validation.warnings.forEach(warning => console.warn(`  • ${warning}`));
    }
  }
  
  return validation;
}

/**
 * Get a specific environment variable with validation
 */
export function getEnvVar(name: keyof EnvConfig, required: boolean = false): string | undefined {
  const value = process.env[name];
  
  if (required && (!value || value.trim() === '')) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  
  return value;
}

/**
 * Database-specific validation
 */
export function validateDatabaseConfig(): { isValid: boolean; error?: string } {
  const mongoUri = process.env.MONGODB_URI;
  const dbName = process.env.DATABASE_NAME;
  
  if (!mongoUri) {
    return { isValid: false, error: 'MONGODB_URI is required' };
  }
  
  if (!dbName) {
    return { isValid: false, error: 'DATABASE_NAME is required' };
  }
  
  if (!isValidMongoURI(mongoUri)) {
    return { isValid: false, error: 'MONGODB_URI format is invalid' };
  }
  
  return { isValid: true };
}

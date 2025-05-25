import pino from "pino";
import { v4 as uuidv4 } from "uuid";

// Define log levels with colors for development
const LOG_LEVELS = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
};

// Create logger configuration based on environment
const createLoggerConfig = () => {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Base configuration that works with Turbopack
  const baseConfig = {
    level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  if (isDevelopment) {
    // Development configuration without transports to avoid Turbopack issues
    return {
      ...baseConfig,
      formatters: {
        level: (label: string) => {
          return { level: label.toUpperCase() };
        },
      },
    };
  }

  // Production configuration - structured JSON logs
  return {
    ...baseConfig,
    formatters: {
      level: (label: string) => {
        return { level: label };
      },
    },
    redact: {
      paths: ["password", "token", "authorization", "cookie"],
      censor: "[REDACTED]",
    },
  };
};

// Create the main logger instance
export const logger = pino(createLoggerConfig());

// Request ID generator
export const generateRequestId = (): string => uuidv4();

// Create child logger with request context
export const createRequestLogger = (
  requestId: string,
  method: string,
  url: string
) => {
  return logger.child({
    requestId,
    method,
    url,
    type: "request",
  });
};

// Database logger
export const createDatabaseLogger = () => {
  return logger.child({
    type: "database",
  });
};

// Authentication logger
export const createAuthLogger = () => {
  return logger.child({
    type: "auth",
  });
};

// Performance logger
export const createPerformanceLogger = () => {
  return logger.child({
    type: "performance",
  });
};

// Error logger with enhanced context
export const logError = (
  error: Error | unknown,
  context?: Record<string, any>
) => {
  const errorInfo =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : { error: String(error) };

  logger.error(
    {
      ...errorInfo,
      ...context,
      type: "error",
    },
    "Application Error"
  );
};

// Success operation logger
export const logSuccess = (
  operation: string,
  context?: Record<string, any>
) => {
  logger.info(
    {
      operation,
      ...context,
      type: "success",
    },
    `✅ ${operation} completed successfully`
  );
};

// Warning logger
export const logWarning = (message: string, context?: Record<string, any>) => {
  logger.warn(
    {
      ...context,
      type: "warning",
    },
    `⚠️ ${message}`
  );
};

// Database operation logger
export const logDatabaseOperation = (
  operation: string,
  collection: string,
  duration?: number,
  context?: Record<string, any>
) => {
  const dbLogger = createDatabaseLogger();

  if (duration !== undefined) {
    if (duration > 1000) {
      // Log slow queries (>1s)
      dbLogger.warn(
        {
          operation,
          collection,
          duration,
          ...context,
          slow: true,
        },
        `🐌 Slow database operation: ${operation} on ${collection} (${duration}ms)`
      );
    } else {
      dbLogger.debug(
        {
          operation,
          collection,
          duration,
          ...context,
        },
        `📊 Database operation: ${operation} on ${collection} (${duration}ms)`
      );
    }
  } else {
    dbLogger.info(
      {
        operation,
        collection,
        ...context,
      },
      `📊 Database operation: ${operation} on ${collection}`
    );
  }
};

// Authentication event logger
export const logAuthEvent = (
  event:
    | "login_attempt"
    | "login_success"
    | "login_failure"
    | "logout"
    | "token_refresh"
    | "unauthorized_access"
    | "forbidden_access"
    | "inactive_account_access"
    | "admin_access"
    | "contact_deleted"
    | "contact_updated",
  userId?: string,
  email?: string,
  context?: Record<string, any>
) => {
  const authLogger = createAuthLogger();

  const eventEmojis = {
    login_attempt: "🔐",
    login_success: "✅",
    login_failure: "❌",
    logout: "👋",
    token_refresh: "🔄",
    unauthorized_access: "🚫",
    contact_deleted: "🗑️",
    contact_updated: "✏️",
    forbidden_access: "⛔️",
    inactive_account_access: "👻",
    admin_access: "👑",
  };

  const logLevel =
    event === "login_failure" || event === "unauthorized_access"
      ? "warn"
      : "info";

  authLogger[logLevel](
    {
      event,
      userId,
      email,
      ...context,
    },
    `${eventEmojis[event]} Auth event: ${event}${email ? ` for ${email}` : ""}`
  );
};

// API request logger
export const logApiRequest = (
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  requestId: string,
  context?: Record<string, any>
) => {
  const requestLogger = createRequestLogger(requestId, method, url);

  const statusEmoji =
    statusCode >= 500
      ? "💥"
      : statusCode >= 400
      ? "⚠️"
      : statusCode >= 300
      ? "↩️"
      : "✅";

  const logLevel =
    statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";

  requestLogger[logLevel](
    {
      statusCode,
      duration,
      ...context,
    },
    `${statusEmoji} ${method} ${url} - ${statusCode} (${duration}ms)`
  );
};

// Performance monitoring
export const logPerformance = (
  operation: string,
  duration: number,
  threshold: number = 1000,
  context?: Record<string, any>
) => {
  const perfLogger = createPerformanceLogger();

  if (duration > threshold) {
    perfLogger.warn(
      {
        operation,
        duration,
        threshold,
        ...context,
        slow: true,
      },
      `🐌 Slow operation detected: ${operation} took ${duration}ms (threshold: ${threshold}ms)`
    );
  } else {
    perfLogger.debug(
      {
        operation,
        duration,
        ...context,
      },
      `⚡ Performance: ${operation} completed in ${duration}ms`
    );
  }
};

// Application startup logger
export const logStartup = (message: string, context?: Record<string, any>) => {
  logger.info(
    {
      ...context,
      type: "startup",
    },
    `🚀 ${message}`
  );
};

// Application shutdown logger
export const logShutdown = (message: string, context?: Record<string, any>) => {
  logger.info(
    {
      ...context,
      type: "shutdown",
    },
    `🛑 ${message}`
  );
};

// Security event logger
export const logSecurityEvent = (
  event: string,
  severity: "low" | "medium" | "high" | "critical",
  context?: Record<string, any>
) => {
  const securityLogger = logger.child({ type: "security" });

  const severityEmojis = {
    low: "🔵",
    medium: "🟡",
    high: "🟠",
    critical: "🔴",
  };

  const logLevel =
    severity === "critical" || severity === "high"
      ? "error"
      : severity === "medium"
      ? "warn"
      : "info";

  securityLogger[logLevel](
    {
      event,
      severity,
      ...context,
    },
    `${severityEmojis[severity]} Security event: ${event}`
  );
};

// Export default logger for general use
export default logger;

// Re-export startup functions
export { logApplicationInfo } from "./startup";

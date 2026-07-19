import { RateLimiterMemory } from "rate-limiter-flexible";

/**
 * Guards the public contact form, keyed by client IP.
 * `RATE_LIMIT_WINDOW` is documented/configured in milliseconds (matches
 * the rest of the app's env conventions) and converted to seconds here
 * since rate-limiter-flexible's `duration` is seconds-based.
 */
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW || "60000", 10);
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || "5", 10);

export const contactFormLimiter = new RateLimiterMemory({
  points: maxRequests,
  duration: Math.max(1, Math.round(windowMs / 1000)),
});

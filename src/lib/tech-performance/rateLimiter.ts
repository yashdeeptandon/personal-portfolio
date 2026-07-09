import { RateLimiterMemory } from "rate-limiter-flexible";

/**
 * Guards the admin manual-refresh button, keyed by provider (or "all").
 * This is the one path that deliberately bypasses the staleness/lock check
 * by design — an admin impatiently double-clicking "refresh" is the
 * structurally-spammable case, unlike the passive on-demand path which
 * `refreshLock` already protects.
 *
 * Public GET routes are NOT rate-limited here — they never call upstream
 * providers directly, only read Mongo and optionally trigger an
 * already-lock-protected async refresh.
 */
export const adminRefreshLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
});

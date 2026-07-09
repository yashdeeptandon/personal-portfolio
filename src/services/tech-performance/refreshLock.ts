import { logError } from "@/lib/utils/logger";

/**
 * In-memory per-provider refresh lock.
 *
 * Mirrors the Map-based idiom in `src/lib/health/jobStore.ts`. Safe because
 * this app runs as a single long-running Node process (self-hosted Docker,
 * not serverless) — the Map persists across requests within a process
 * lifetime and is simply empty again after a redeploy.
 *
 * Purpose: if 50 visitors hit a just-went-stale snapshot at once, only the
 * first should trigger an upstream fetch; the other 49 get the cached
 * (stale-but-present) response and trigger nothing.
 */

const inFlight = new Map<string, Promise<void>>();

export function isRefreshing(providerId: string): boolean {
  return inFlight.has(providerId);
}

/**
 * Runs `fn` for `providerId` unless a refresh is already in flight for it.
 * Fire-and-forget: never awaited by the caller. `fn`'s rejection is caught
 * here (not left to the caller) — nothing else in this call chain ever
 * awaits the stored promise, so an uncaught rejection would otherwise
 * surface as an unhandled rejection at the process level.
 */
export function withProviderLock(
  providerId: string,
  fn: () => Promise<void>
): void {
  if (inFlight.has(providerId)) return;

  const promise = fn()
    .catch((error) =>
      logError(error, { context: "tech-performance refresh lock", providerId })
    )
    .finally(() => {
      inFlight.delete(providerId);
    });

  inFlight.set(providerId, promise);
}

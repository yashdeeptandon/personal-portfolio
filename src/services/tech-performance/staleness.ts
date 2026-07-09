import { MIN_REFRESH_INTERVAL_MS } from "@/lib/tech-performance/constants";
import { withProviderLock } from "./refreshLock";
import { syncProvider } from "./sync";
import type { TechProviderId } from "@/types/techPerformance";

export function isStale(
  doc: { staleAt: Date | null } | null | undefined
): boolean {
  if (!doc || !doc.staleAt) return true;
  return new Date(doc.staleAt).getTime() < Date.now();
}

/**
 * Fire-and-forget: if `snapshot` is stale and hasn't been attempted too
 * recently, kicks off a provider refresh without blocking the caller. The
 * public GET routes call this as a side effect of reading cached data, so
 * response latency is fully decoupled from upstream provider health.
 */
export function maybeTriggerRefresh(
  providerId: TechProviderId,
  snapshot: { staleAt: Date | null; lastAttemptAt: Date | null } | null
): void {
  if (!isStale(snapshot)) return;

  if (snapshot?.lastAttemptAt) {
    const sinceLastAttempt = Date.now() - new Date(snapshot.lastAttemptAt).getTime();
    if (sinceLastAttempt < MIN_REFRESH_INTERVAL_MS) return;
  }

  withProviderLock(providerId, () => syncProvider(providerId));
}

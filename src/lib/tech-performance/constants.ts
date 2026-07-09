import { CACHE_TTL } from "@/lib/utils/constants";

// Per-snapshot-type TTL (seconds), keyed by TechSnapshot.type
export const SNAPSHOT_TTL: Record<string, number> = {
  "github:profile": CACHE_TTL.VERY_LONG,
  "github:contributions": CACHE_TTL.MEDIUM,
  "github:activity": CACHE_TTL.SHORT,
  "github:repos": CACHE_TTL.LONG,
  "github:languages": CACHE_TTL.VERY_LONG,
  "github:oss-contributions": CACHE_TTL.VERY_LONG,
  "wakatime:summary": CACHE_TTL.SHORT,
  "wakatime:activity": CACHE_TTL.MEDIUM,
  "wakatime:breakdown": CACHE_TTL.LONG,
  "leetcode:stats": CACHE_TTL.MEDIUM,
  "blog:activity": CACHE_TTL.LONG,
  "projects:activity": CACHE_TTL.LONG,
};

export const DEFAULT_SNAPSHOT_TTL_SECONDS = CACHE_TTL.MEDIUM;

// Floor beneath which a refresh will never be re-triggered, regardless of
// staleness — protects upstream providers from a redeploy-then-traffic-burst.
export const MIN_REFRESH_INTERVAL_MS = 60_000;

// Background ticker cadence (see instrumentation.ts). Bounds worst-case
// staleness even with zero traffic, independent of the on-demand path.
export const SCHEDULED_REFRESH_INTERVAL_MS = 15 * 60_000;

export function ttlForType(type: string): number {
  return SNAPSHOT_TTL[type] ?? DEFAULT_SNAPSHOT_TTL_SECONDS;
}

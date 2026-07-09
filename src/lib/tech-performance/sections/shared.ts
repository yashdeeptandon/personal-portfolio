import dbConnect from "@/lib/db/connection";
import TechSnapshot from "@/models/TechSnapshot";
import { maybeTriggerRefresh } from "@/services/tech-performance/staleness";
import type { TechProviderId, DataSourceInfo } from "@/types/techPerformance";

// Whether each provider is a documented/stable official API vs a
// best-effort community endpoint — surfaced to the UI via DataSourceBadge
// so "clearly label data sources" holds for every section, not just LeetCode.
const OFFICIAL_API_PROVIDERS: Record<TechProviderId, boolean> = {
  github: true,
  wakatime: true,
  leetcode: false,
  blog: true,
  projects: true,
};

/**
 * Reads one TechSnapshot doc and, as a side effect, triggers an async
 * refresh if it's stale. Every section handler goes through this so the
 * stale-while-revalidate behavior is uniform — callers never see the
 * upstream fetch, only ever the cached doc (or null if never synced).
 */
export async function readSnapshot(type: string, providerId: TechProviderId) {
  await dbConnect();
  const doc = await TechSnapshot.findOne({ type }).lean();

  maybeTriggerRefresh(
    providerId,
    doc ? { staleAt: doc.staleAt, lastAttemptAt: doc.lastAttemptAt } : null
  );

  return doc;
}

export function sourceInfo(
  doc: { source?: string; status?: string; fetchedAt?: Date | string | null } | null,
  providerId: TechProviderId
): DataSourceInfo {
  return {
    provider: providerId,
    source: (doc?.source as "live" | "manual") ?? "live",
    status: (doc?.status as DataSourceInfo["status"]) ?? "unconfigured",
    fetchedAt: doc?.fetchedAt ? new Date(doc.fetchedAt).toISOString() : null,
    isOfficialApi: OFFICIAL_API_PROVIDERS[providerId],
  };
}

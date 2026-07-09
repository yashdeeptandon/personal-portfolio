"use client";

import Badge from "@/components/ui/Badge";
import { timeAgo } from "@/lib/tech-performance/timeAgo";
import type { DataSourceInfo } from "@/types/techPerformance";

/**
 * Provenance pill shown next to any provider-sourced number. Keeps
 * "distinguish public vs private-connected-account data" and "document
 * limitations where no stable official API exists" true everywhere data
 * appears, not just in one place — one component, several visual modes.
 */
export default function DataSourceBadge({ info }: { info: DataSourceInfo }) {
  if (info.source === "manual") {
    return <Badge variant="info">Manually entered</Badge>;
  }
  if (!info.isOfficialApi) {
    return <Badge variant="warning">Unofficial source</Badge>;
  }
  if (info.status === "unconfigured") {
    return <Badge variant="neutral">Not connected</Badge>;
  }
  if (info.status === "error") {
    return <Badge variant="warning">Sync error — showing last known data</Badge>;
  }
  return <Badge variant="success">Live · synced {timeAgo(info.fetchedAt)}</Badge>;
}

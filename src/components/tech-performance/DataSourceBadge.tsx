"use client";

import Badge from "@/components/ui/Badge";
import { timeAgo } from "@/lib/tech-performance/timeAgo";
import type { DataSourceInfo, TechProviderId } from "@/types/techPerformance";

/** Small provider mark so a bare status pill can't be confused for another source's. */
function ProviderIcon({ provider }: { provider: TechProviderId | "manual" }) {
  const common = { className: "w-3 h-3 shrink-0", "aria-hidden": true as const };
  switch (provider) {
    case "github":
      return (
        <svg viewBox="0 0 16 16" fill="currentColor" {...common}>
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
      );
    case "wakatime":
      return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" {...common}>
          <circle cx="8" cy="8" r="6.5" />
          <path d="M8 4.5V8l2.5 1.5" />
        </svg>
      );
    case "leetcode":
      return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" {...common}>
          <path d="M6 3L1.5 8 6 13M10 3l4.5 5-4.5 5" />
        </svg>
      );
    case "blog":
      return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" {...common}>
          <rect x="2" y="1.5" width="12" height="13" rx="1.2" />
          <path d="M4.5 5h7M4.5 8h7M4.5 11h4" />
        </svg>
      );
    case "projects":
      return (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round" {...common}>
          <path d="M1.5 3.5A1 1 0 012.5 2.5h3l1.2 1.5H13.5a1 1 0 011 1v7a1 1 0 01-1 1h-11a1 1 0 01-1-1v-8z" />
        </svg>
      );
    default:
      return null;
  }
}

const PROVIDER_LABEL: Record<TechProviderId, string> = {
  github: "GitHub",
  wakatime: "WakaTime",
  leetcode: "LeetCode",
  blog: "Blog",
  projects: "Projects",
};

/**
 * Provenance pill shown next to any provider-sourced number. Keeps
 * "distinguish public vs private-connected-account data" and "document
 * limitations where no stable official API exists" true everywhere data
 * appears, not just in one place — one component, several visual modes.
 * Always leads with the provider mark since these render side-by-side
 * (e.g. GitHub + WakaTime badges together) with nothing else labeling them.
 */
export default function DataSourceBadge({ info }: { info: DataSourceInfo }) {
  const icon = <ProviderIcon provider={info.provider} />;
  const label = PROVIDER_LABEL[info.provider];

  if (info.source === "manual") {
    return <Badge variant="info">{icon}Manually entered</Badge>;
  }
  if (!info.isOfficialApi) {
    return <Badge variant="warning">{icon}{label} · unofficial source</Badge>;
  }
  if (info.status === "unconfigured") {
    return <Badge variant="neutral">{icon}{label} · not connected</Badge>;
  }
  if (info.status === "error") {
    return <Badge variant="warning">{icon}{label} · sync error — showing last known data</Badge>;
  }
  return <Badge variant="success">{icon}{label} · synced {timeAgo(info.fetchedAt)}</Badge>;
}

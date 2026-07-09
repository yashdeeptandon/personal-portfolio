"use client";

import { CHART } from "@/lib/chartTheme";
import { timeAgo } from "@/lib/tech-performance/timeAgo";
import type { TimelineEvent } from "@/types/techPerformance";

const PROVIDER_COLOR: Record<string, string> = {
  github: CHART.ACCENT_GREEN,
  wakatime: CHART.ACCENT_INDIGO,
  blog: CHART.ACCENT_CYAN,
  projects: CHART.ACCENT_AMBER,
  manual: CHART.ACCENT_RED,
};

const PROVIDER_LABEL: Record<string, string> = {
  github: "GitHub",
  wakatime: "WakaTime",
  blog: "Blog",
  projects: "Projects",
  manual: "Milestone",
};

const TYPE_LABEL: Record<string, string> = {
  commit: "Commit",
  pull_request: "Pull request",
  issue: "Issue",
  release: "Release",
  coding_session: "Coding session",
  post_published: "Blog post",
  milestone: "Milestone",
  achievement: "Achievement",
};

export default function TimelineEventRow({ event }: { event: TimelineEvent }) {
  const color = PROVIDER_COLOR[event.provider] ?? CHART.ACCENT_INDIGO;
  const providerLabel = PROVIDER_LABEL[event.provider] ?? event.provider;
  const typeLabel = TYPE_LABEL[event.type] ?? event.type;

  const content = (
    <div className="flex gap-3 py-2.5">
      <div className="flex flex-col items-center pt-1 shrink-0">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <div className="w-px flex-1 bg-foreground/10 mt-1" />
      </div>
      <div className="min-w-0 flex-1 pb-1">
        <p className="text-sm text-foreground truncate">{event.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {providerLabel} · {typeLabel} · {timeAgo(event.timestamp)}
        </p>
      </div>
    </div>
  );

  if (event.url) {
    return (
      <a href={event.url} target="_blank" rel="noopener noreferrer" className="block hover:bg-foreground/[0.03] rounded-md transition-colors -mx-2 px-2">
        {content}
      </a>
    );
  }

  return content;
}

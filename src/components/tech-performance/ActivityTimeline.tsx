"use client";

import { useCallback, useEffect, useState } from "react";
import ChartCard from "@/components/ui/ChartCard";
import TimelineEventRow from "./TimelineEventRow";
import type { TimelineEvent } from "@/types/techPerformance";

const PAGE_SIZE = 20;

// Self-contained fetch, not routed through useTechPerformanceData — same
// "own secondary fetch" precedent as RunningTab/ECGTab on the sibling
// /performance dashboard, since cursor pagination doesn't fit the
// fetch-once-on-mount shape the shared hook uses for every other section.
export default function ActivityTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async (before: string | null, append: boolean) => {
    const url = new URL("/api/tech-performance/timeline", window.location.origin);
    url.searchParams.set("limit", String(PAGE_SIZE));
    if (before) url.searchParams.set("before", before);

    const res = await fetch(url.toString());
    const body = await res.json();
    if (!res.ok || !body.success) throw new Error(body.message || "Failed to load timeline");

    const data = body.data as { events: TimelineEvent[]; nextCursor: string | null };
    setEvents((prev) => (append ? [...prev, ...data.events] : data.events));
    setCursor(data.nextCursor);
    setHasMore(Boolean(data.nextCursor));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    load(null, false)
      .catch((err: Error) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [load]);

  const loadMore = async () => {
    setIsLoadingMore(true);
    try {
      await load(cursor, true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more");
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <ChartCard title="Developer Activity Timeline" subtitle="Commits, PRs, coding sessions, and milestones — most recent first" fullWidth>
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 rounded-md bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <p className="text-sm text-red-400 text-center py-6">{error}</p>
      )}

      {!isLoading && !error && events.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-6">No activity recorded yet.</p>
      )}

      {!isLoading && !error && events.length > 0 && (
        <>
          <div>
            {events.map((event, i) => (
              <TimelineEventRow key={`${event.provider}-${event.type}-${event.timestamp}-${i}`} event={event} />
            ))}
          </div>
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="w-full mt-3 py-2 rounded-md text-xs font-medium text-gray-400 bg-white/5 hover:bg-white/10 hover:text-gray-200 transition-colors disabled:opacity-50"
            >
              {isLoadingMore ? "Loading…" : "Load more"}
            </button>
          )}
        </>
      )}
    </ChartCard>
  );
}

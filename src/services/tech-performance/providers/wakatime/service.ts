import { isWakaTimeConfigured, getWakaTimeConfig, WAKATIME_CONFIG } from "./config";
import {
  fetchWakaTimeSummaries,
  fetchWakaTimeStats,
  fetchWakaTimeAllTime,
} from "./api";
import type { WakaTimeSummaryDay, WakaTimeNamedTotal } from "./types";
import type {
  NormalizedActivityEvent,
  ProviderSnapshotResult,
  TechProvider,
} from "@/types/techPerformance";

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function sumSecondsSince(days: WakaTimeSummaryDay[], since: Date): number {
  const sinceStr = toDateString(since);
  return days
    .filter((d) => d.range.date >= sinceStr)
    .reduce((sum, d) => sum + d.grand_total.total_seconds, 0);
}

function computeStreaks(days: WakaTimeSummaryDay[]): {
  current: number;
  longest: number;
} {
  const sorted = [...days].sort((a, b) => a.range.date.localeCompare(b.range.date));

  let longest = 0;
  let running = 0;
  for (const day of sorted) {
    if (day.grand_total.total_seconds > 0) {
      running += 1;
      longest = Math.max(longest, running);
    } else {
      running = 0;
    }
  }

  let current = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].grand_total.total_seconds > 0) {
      current += 1;
    } else if (i === sorted.length - 1) {
      continue; // today not over yet — a zero-so-far day doesn't break the streak
    } else {
      break;
    }
  }

  return { current, longest };
}

function toBreakdownEntries(totals: WakaTimeNamedTotal[]) {
  return totals.map((t) => ({
    name: t.name,
    totalSeconds: t.total_seconds,
    pct: t.percent,
  }));
}

function toActivityEvents(days: WakaTimeSummaryDay[]): NormalizedActivityEvent[] {
  // No sub-day session data in the summaries endpoint — one synthetic
  // "coding_session" event per active day is what the API can honestly
  // support, not a claim of per-session granularity.
  return days
    .filter((d) => d.grand_total.total_seconds > 0)
    .map((d) => {
      const topLanguage = [...d.languages].sort(
        (a, b) => b.total_seconds - a.total_seconds
      )[0]?.name;
      const minutes = Math.round(d.grand_total.total_seconds / 60);
      return {
        provider: "wakatime",
        type: "coding_session",
        timestamp: new Date(`${d.range.date}T12:00:00Z`).toISOString(),
        title: `Coded ${minutes} min${topLanguage ? ` — mostly ${topLanguage}` : ""}`,
        externalId: `wakatime-day-${d.range.date}`,
        metadata: { durationMinutes: minutes, language: topLanguage },
        visibility: "public",
      };
    });
}

async function fetchSnapshot(): Promise<ProviderSnapshotResult> {
  try {
    const { apiKey } = getWakaTimeConfig();

    const today = new Date();
    const windowStart = new Date(today);
    windowStart.setDate(windowStart.getDate() - WAKATIME_CONFIG.ACTIVITY_WINDOW_DAYS);

    const [summaries, breakdown, allTime] = await Promise.all([
      fetchWakaTimeSummaries(apiKey, toDateString(windowStart), toDateString(today)),
      fetchWakaTimeStats(apiKey, "last_30_days"),
      fetchWakaTimeAllTime(apiKey),
    ]);

    const days = summaries.data;
    const { current, longest } = computeStreaks(days);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);
    const monthStart = new Date(today);
    monthStart.setDate(monthStart.getDate() - 29);
    const yearStart = new Date(today);
    yearStart.setDate(yearStart.getDate() - 364);

    const todaySeconds =
      days.find((d) => d.range.date === toDateString(today))?.grand_total
        .total_seconds ?? 0;
    const weekSeconds = sumSecondsSince(days, weekStart);
    const monthSeconds = sumSecondsSince(days, monthStart);
    const yearSeconds = sumSecondsSince(days, yearStart);

    const activeDays = days.filter((d) => d.grand_total.total_seconds > 0);
    const bestDay = activeDays.reduce<WakaTimeSummaryDay | null>((best, d) => {
      if (!best || d.grand_total.total_seconds > best.grand_total.total_seconds) return d;
      return best;
    }, null);

    return {
      success: true,
      snapshots: [
        {
          type: "wakatime:summary",
          data: {
            todaySeconds,
            weekSeconds,
            monthSeconds,
            yearSeconds,
            allTimeSeconds: allTime.data.total_seconds,
            currentStreak: current,
            longestStreak: longest,
            bestDaySeconds: bestDay?.grand_total.total_seconds ?? 0,
            bestDayDate: bestDay?.range.date ?? null,
            dailyAverageSeconds:
              activeDays.length > 0
                ? Math.round(
                    activeDays.reduce((s, d) => s + d.grand_total.total_seconds, 0) /
                      activeDays.length
                  )
                : 0,
          },
        },
        {
          type: "wakatime:activity",
          data: {
            days: days.map((d) => ({
              date: d.range.date,
              totalSeconds: d.grand_total.total_seconds,
            })),
          },
        },
        {
          type: "wakatime:breakdown",
          data: {
            languages: toBreakdownEntries(breakdown.data.languages),
            editors: toBreakdownEntries(breakdown.data.editors),
            projects: toBreakdownEntries(breakdown.data.projects),
            categories: toBreakdownEntries(breakdown.data.categories),
          },
        },
      ],
      events: toActivityEvents(days),
    };
  } catch (error) {
    return {
      success: false,
      snapshots: [],
      error: error instanceof Error ? error.message : "Failed to fetch WakaTime data",
    };
  }
}

export const wakatimeProvider: TechProvider = {
  id: "wakatime",
  isConfigured: isWakaTimeConfigured,
  fetchSnapshot,
};

import { WAKATIME_CONFIG } from "./config";
import { TechProviderError } from "../../types";
import { fetchWithTimeout } from "@/lib/tech-performance/fetchWithTimeout";
import type {
  WakaTimeSummariesResponse,
  WakaTimeStatsResponse,
  WakaTimeAllTimeResponse,
} from "./types";

function authHeader(apiKey: string): string {
  return `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
}

async function get<T>(apiKey: string, path: string, timeoutMs = 20_000): Promise<T> {
  const response = await fetchWithTimeout(
    `${WAKATIME_CONFIG.API_URL}${path}`,
    { headers: { Authorization: authHeader(apiKey) } },
    timeoutMs
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new TechProviderError(
      `WakaTime error: ${response.status} ${text}`.slice(0, 500),
      response.status
    );
  }

  return (await response.json()) as T;
}

export function fetchWakaTimeSummaries(
  apiKey: string,
  startDate: string,
  endDate: string
): Promise<WakaTimeSummariesResponse> {
  // A full-year range is observed to take 30-45s on WakaTime's side (it
  // aggregates from raw heartbeats) — well above the 20s default.
  return get(
    apiKey,
    `/users/current/summaries?start=${startDate}&end=${endDate}`,
    60_000
  );
}

export function fetchWakaTimeStats(
  apiKey: string,
  range: "last_7_days" | "last_30_days" | "last_6_months" | "last_year" | "all_time"
): Promise<WakaTimeStatsResponse> {
  return get(apiKey, `/users/current/stats/${range}`);
}

export function fetchWakaTimeAllTime(
  apiKey: string
): Promise<WakaTimeAllTimeResponse> {
  return get(apiKey, `/users/current/all_time_since_today`);
}

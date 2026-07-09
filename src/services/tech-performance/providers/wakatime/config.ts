export function isWakaTimeConfigured(): boolean {
  return Boolean(process.env.WAKATIME_API_KEY);
}

export function getWakaTimeConfig(): { apiKey: string } {
  const apiKey = process.env.WAKATIME_API_KEY;
  if (!apiKey) {
    throw new Error("WakaTime is not configured — set WAKATIME_API_KEY");
  }
  return { apiKey };
}

export const WAKATIME_CONFIG = {
  API_URL: "https://wakatime.com/api/v1",
  // How far back the daily-summaries call reaches — bounds both the
  // upstream payload size and the streak/activity-chart window. WakaTime's
  // raw API data retention depends on the account's plan; this is a soft
  // limitation documented in the setup guide, not something this code can
  // fix — a shorter-than-expected history here is expected on free plans.
  ACTIVITY_WINDOW_DAYS: 365,
} as const;

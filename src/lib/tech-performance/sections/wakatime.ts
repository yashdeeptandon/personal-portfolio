import { readSnapshot, sourceInfo } from "./shared";
import type {
  WakaTimeSummaryData,
  WakaTimeActivityData,
  WakaTimeBreakdownData,
} from "@/types/techPerformance";

export async function getWakatimeSection() {
  const [summary, activity, breakdown] = await Promise.all([
    readSnapshot("wakatime:summary", "wakatime"),
    readSnapshot("wakatime:activity", "wakatime"),
    readSnapshot("wakatime:breakdown", "wakatime"),
  ]);

  return {
    summary: (summary?.data as WakaTimeSummaryData | undefined) ?? null,
    activity: (activity?.data as WakaTimeActivityData | undefined) ?? null,
    breakdown: (breakdown?.data as WakaTimeBreakdownData | undefined) ?? null,
    dataSource: sourceInfo(summary, "wakatime"),
  };
}

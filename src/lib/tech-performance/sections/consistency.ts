import { readSnapshot, sourceInfo } from "./shared";
import type {
  GitHubContributionsData,
  WakaTimeActivityData,
} from "@/types/techPerformance";

// Normalization caps for the "combined" score — chosen as generous
// upper bounds (10+ GitHub events/day, 4+ WakaTime hours/day) so a single
// very active day doesn't blow past 1.0 and flatten the rest of the scale.
const GITHUB_DAY_CAP = 10;
const WAKATIME_DAY_CAP_SECONDS = 4 * 3600;

export async function getConsistencySection() {
  const [contributions, activity] = await Promise.all([
    readSnapshot("github:contributions", "github"),
    readSnapshot("wakatime:activity", "wakatime"),
  ]);

  const githubDays =
    (contributions?.data as GitHubContributionsData | undefined)?.calendar ?? [];
  const wakatimeDays =
    (activity?.data as WakaTimeActivityData | undefined)?.days ?? [];

  const github = githubDays.map((d) => ({ date: d.date, value: d.count }));
  const wakatime = wakatimeDays.map((d) => ({
    date: d.date,
    value: Math.round(d.totalSeconds / 60), // minutes — friendlier tooltip than raw seconds
  }));

  const byDate = new Map<string, { github: number; wakatime: number }>();
  for (const d of githubDays) {
    byDate.set(d.date, { github: d.count, wakatime: 0, ...byDate.get(d.date) });
  }
  for (const d of wakatimeDays) {
    const existing = byDate.get(d.date) ?? { github: 0, wakatime: 0 };
    existing.wakatime = d.totalSeconds;
    byDate.set(d.date, existing);
  }

  const combined = [...byDate.entries()].map(([date, v]) => {
    const githubNorm = Math.min(v.github / GITHUB_DAY_CAP, 1);
    const wakatimeNorm = Math.min(v.wakatime / WAKATIME_DAY_CAP_SECONDS, 1);
    return { date, value: Math.round(Math.max(githubNorm, wakatimeNorm) * 100) };
  });

  return {
    github,
    wakatime,
    combined,
    dataSources: {
      github: sourceInfo(contributions, "github"),
      wakatime: sourceInfo(activity, "wakatime"),
    },
  };
}

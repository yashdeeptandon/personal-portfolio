import dbConnect from "@/lib/db/connection";
import ActivityEvent from "@/models/ActivityEvent";
import { getPeriodStart, type TechPeriod } from "../period";
import { sumSince } from "../periodMath";
import { readSnapshot, sourceInfo } from "./shared";
import type {
  GitHubContributionsData,
  WakaTimeSummaryData,
  WakaTimeActivityData,
} from "@/types/techPerformance";

export async function getOverviewSection(period: TechPeriod) {
  const [contributions, profile, wakatimeSummary, wakatimeActivity, ossContrib, projectsActivity] =
    await Promise.all([
      readSnapshot("github:contributions", "github"),
      readSnapshot("github:profile", "github"),
      readSnapshot("wakatime:summary", "wakatime"),
      readSnapshot("wakatime:activity", "wakatime"),
      readSnapshot("github:oss-contributions", "github"),
      readSnapshot("projects:activity", "projects"),
    ]);

  await dbConnect();

  const periodStart = getPeriodStart(period);
  // The GitHub public-events feed (source of ActivityEvent rows) only
  // retains ~90 days. For "year"/"all" windows that's not a reliable count,
  // so those periods fall back to the Search-API-derived all-time total
  // instead of an undercounted event tally — labeled via `prsMergedIsAllTime`
  // so the UI never presents a partial number as if it were period-accurate.
  const useAllTimeFallback = period === "year" || period === "all";

  const eventFilter: Record<string, unknown> = { provider: "github" };
  if (periodStart) eventFilter.timestamp = { $gte: periodStart };

  const [prsMergedRecent, commitsRecent, projectsShipped] = await Promise.all([
    useAllTimeFallback
      ? Promise.resolve(null)
      : ActivityEvent.countDocuments({
          ...eventFilter,
          type: "pull_request",
          "metadata.action": "merged",
        }),
    useAllTimeFallback
      ? Promise.resolve(null)
      : ActivityEvent.countDocuments({ ...eventFilter, type: "commit" }),
    ActivityEvent.countDocuments({
      provider: "projects",
      type: "milestone",
      title: { $regex: "^Shipped " },
      ...(periodStart ? { timestamp: { $gte: periodStart } } : {}),
    }),
  ]);

  const contributionsData = contributions?.data as
    | GitHubContributionsData
    | undefined;
  const wakatimeSummaryData = wakatimeSummary?.data as
    | WakaTimeSummaryData
    | undefined;
  const wakatimeActivityDays =
    (wakatimeActivity?.data as WakaTimeActivityData | undefined)?.days ?? [];
  const profileData = profile?.data as
    | { login: string; followers: number; publicRepos: number }
    | undefined;
  const ossData = ossContrib?.data as { repos: unknown[] } | undefined;
  const projectsData = projectsActivity?.data as
    | { total: number; inProgress: number; completed: number }
    | undefined;

  // "all" exceeds what the 365-day activity snapshot holds — WakaTime's own
  // dedicated all-time counter is the only accurate source for that case.
  // Every other period is summed fresh from the daily series at request
  // time (not read from the pre-aggregated today/week/month/year fields on
  // the summary snapshot, which are only as fresh as the last sync).
  const codingHours = wakatimeSummaryData
    ? period === "all"
      ? Math.round((wakatimeSummaryData.allTimeSeconds / 3600) * 10) / 10
      : Math.round((sumSince(wakatimeActivityDays, periodStart, (d) => d.totalSeconds) / 3600) * 10) / 10
    : null;

  // GitHub's contribution calendar itself only covers ~365 days, so "all"
  // and "year" are the same number here — there's no separate all-time
  // GitHub contributions source the way WakaTime has one.
  const githubContributions = contributionsData
    ? sumSince(contributionsData.calendar, periodStart, (d) => d.count)
    : null;

  return {
    period,
    codingHours,
    codingStreak: wakatimeSummaryData?.currentStreak ?? null,
    githubContributions,
    githubCurrentStreak: contributionsData?.currentStreak ?? null,
    prsMerged: useAllTimeFallback
      ? contributionsData?.totalPRsMerged ?? null
      : prsMergedRecent,
    prsMergedIsAllTime: useAllTimeFallback,
    commitsInPeriod: commitsRecent,
    activeProjects: projectsData?.inProgress ?? null,
    projectsShipped,
    ossReposContributed: ossData?.repos?.length ?? null,
    githubProfile: profileData
      ? {
          login: profileData.login,
          followers: profileData.followers,
          publicRepos: profileData.publicRepos,
        }
      : null,
    dataSources: {
      github: sourceInfo(contributions, "github"),
      wakatime: sourceInfo(wakatimeSummary, "wakatime"),
    },
  };
}

import dbConnect from "@/lib/db/connection";
import ActivityEvent from "@/models/ActivityEvent";
import { getPeriodStart, type TechPeriod } from "../period";
import { readSnapshot, sourceInfo } from "./shared";
import type {
  GitHubContributionsData,
  WakaTimeSummaryData,
} from "@/types/techPerformance";

export async function getOverviewSection(period: TechPeriod) {
  const [contributions, profile, wakatimeSummary, ossContrib, projectsActivity] =
    await Promise.all([
      readSnapshot("github:contributions", "github"),
      readSnapshot("github:profile", "github"),
      readSnapshot("wakatime:summary", "wakatime"),
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

  const [prsMergedRecent, commitsRecent] = useAllTimeFallback
    ? [null, null]
    : await Promise.all([
        ActivityEvent.countDocuments({
          ...eventFilter,
          type: "pull_request",
          "metadata.action": "merged",
        }),
        ActivityEvent.countDocuments({ ...eventFilter, type: "commit" }),
      ]);

  const contributionsData = contributions?.data as
    | GitHubContributionsData
    | undefined;
  const wakatimeData = wakatimeSummary?.data as WakaTimeSummaryData | undefined;
  const profileData = profile?.data as
    | { login: string; followers: number; publicRepos: number }
    | undefined;
  const ossData = ossContrib?.data as { repos: unknown[] } | undefined;
  const projectsData = projectsActivity?.data as
    | { total: number; inProgress: number; completed: number }
    | undefined;

  return {
    period,
    codingHoursThisWeek: wakatimeData
      ? Math.round((wakatimeData.weekSeconds / 3600) * 10) / 10
      : null,
    codingStreak: wakatimeData?.currentStreak ?? null,
    githubContributionsLastYear: contributionsData?.totalContributions ?? null,
    githubCurrentStreak: contributionsData?.currentStreak ?? null,
    prsMerged: useAllTimeFallback
      ? contributionsData?.totalPRsMerged ?? null
      : prsMergedRecent,
    prsMergedIsAllTime: useAllTimeFallback,
    commitsInPeriod: commitsRecent,
    activeProjects: projectsData?.inProgress ?? null,
    projectsShipped: projectsData?.completed ?? null,
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

import dbConnect from "@/lib/db/connection";
import ActivityEvent from "@/models/ActivityEvent";
import { readSnapshot, sourceInfo } from "./shared";
import type {
  GitHubLanguagesData,
  WakaTimeBreakdownData,
} from "@/types/techPerformance";

const TREND_WEEKS = 12;

async function getLanguageTrends(
  languages: string[]
): Promise<Record<string, number[]>> {
  const trends: Record<string, number[]> = {};
  for (const lang of languages) trends[lang] = new Array(TREND_WEEKS).fill(0);
  if (languages.length === 0) return trends;

  await dbConnect();
  const since = new Date();
  since.setDate(since.getDate() - TREND_WEEKS * 7);

  const events = await ActivityEvent.find({
    provider: "wakatime",
    type: "coding_session",
    timestamp: { $gte: since },
    "metadata.language": { $in: languages },
  })
    .select("timestamp metadata")
    .lean();

  const now = Date.now();
  for (const event of events) {
    const lang = (event.metadata as { language?: string } | undefined)?.language;
    if (!lang || !trends[lang]) continue;

    const daysAgo = (now - new Date(event.timestamp).getTime()) / 86_400_000;
    const weekIndex = TREND_WEEKS - 1 - Math.floor(daysAgo / 7);
    if (weekIndex < 0 || weekIndex >= TREND_WEEKS) continue;

    const minutes =
      (event.metadata as { durationMinutes?: number } | undefined)?.durationMinutes ?? 0;
    trends[lang][weekIndex] += minutes;
  }

  return trends;
}

export async function getSkillsSection() {
  const [githubLanguages, wakatimeBreakdown] = await Promise.all([
    readSnapshot("github:languages", "github"),
    readSnapshot("wakatime:breakdown", "wakatime"),
  ]);

  const byRepos =
    (githubLanguages?.data as GitHubLanguagesData | undefined)?.languages ?? [];
  const byCodingTimeRaw =
    (wakatimeBreakdown?.data as WakaTimeBreakdownData | undefined)?.languages ?? [];
  const editors =
    (wakatimeBreakdown?.data as WakaTimeBreakdownData | undefined)?.editors ?? [];

  const topLanguageNames = byCodingTimeRaw.slice(0, 5).map((l) => l.name);
  const trends = await getLanguageTrends(topLanguageNames);

  const byCodingTime = byCodingTimeRaw.map((lang) => ({
    ...lang,
    trend: trends[lang.name] ?? null,
  }));

  return {
    byCodingTime,
    byRepos,
    editors,
    dataSources: {
      github: sourceInfo(githubLanguages, "github"),
      wakatime: sourceInfo(wakatimeBreakdown, "wakatime"),
    },
  };
}

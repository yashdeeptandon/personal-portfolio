import { NextRequest } from "next/server";
import { successResponse, notFoundResponse, withErrorHandling } from "@/lib/utils/response";
import { getStatusSection } from "@/lib/tech-performance/sections/status";
import { getOverviewSection } from "@/lib/tech-performance/sections/overview";
import { getGithubSection } from "@/lib/tech-performance/sections/github";
import { getEngineeringOutputSection } from "@/lib/tech-performance/sections/engineering-output";
import { getConsistencySection } from "@/lib/tech-performance/sections/consistency";
import { getWakatimeSection } from "@/lib/tech-performance/sections/wakatime";
import { getSkillsSection } from "@/lib/tech-performance/sections/skills";
import { getTimelineSection } from "@/lib/tech-performance/sections/timeline";
import { getGoalsSection } from "@/lib/tech-performance/sections/goals";
import { getSignalsSection } from "@/lib/tech-performance/sections/signals";
import { isValidPeriod, type TechPeriod } from "@/lib/tech-performance/period";

interface SectionResult {
  data: unknown;
  cacheSeconds: number;
}

/**
 * One handler per public UI section. Kept thin and dispatch-only — actual
 * aggregation logic lives in `src/lib/tech-performance/sections/*.ts`. New
 * phases add a new entry here rather than a new route file, mirroring how
 * `/api/health/[dataset]` fans a single route out across many datasets.
 */
const sectionHandlers: Record<
  string,
  (searchParams: URLSearchParams) => Promise<SectionResult>
> = {
  status: async () => ({ data: await getStatusSection(), cacheSeconds: 60 }),
  overview: async (searchParams) => {
    const rawPeriod = searchParams.get("period") ?? "30d";
    const period: TechPeriod = isValidPeriod(rawPeriod) ? rawPeriod : "30d";
    return { data: await getOverviewSection(period), cacheSeconds: 300 };
  },
  github: async () => ({ data: await getGithubSection(), cacheSeconds: 300 }),
  wakatime: async () => ({ data: await getWakatimeSection(), cacheSeconds: 300 }),
  "engineering-output": async () => ({
    data: await getEngineeringOutputSection(),
    cacheSeconds: 600,
  }),
  consistency: async () => ({
    data: await getConsistencySection(),
    cacheSeconds: 600,
  }),
  skills: async () => ({ data: await getSkillsSection(), cacheSeconds: 600 }),
  timeline: async (searchParams) => {
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const before = searchParams.get("before");
    return { data: await getTimelineSection(limit, before), cacheSeconds: 120 };
  },
  goals: async () => ({ data: await getGoalsSection(), cacheSeconds: 300 }),
  signals: async () => ({ data: await getSignalsSection(), cacheSeconds: 600 }),
};

export const GET = withErrorHandling(
  async (
    request: NextRequest | Request,
    context?: { params: Promise<{ section: string }> }
  ) => {
    const { section } = (await context?.params) ?? { section: "" };
    const handler = sectionHandlers[section];

    if (!handler) {
      return notFoundResponse(`Unknown Tech Performance section: ${section}`);
    }

    const { searchParams } = new URL(request.url);
    const { data, cacheSeconds } = await handler(searchParams);
    const response = successResponse("OK", data);
    response.headers.set(
      "Cache-Control",
      `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${Math.max(
        30,
        Math.floor(cacheSeconds / 2)
      )}`
    );
    return response;
  }
);

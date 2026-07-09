import type { TechProvider, TechProviderId } from "@/types/techPerformance";
import { blogProvider } from "./local/blog";
import { projectsProvider } from "./local/projects";
import { githubProvider } from "./providers/github";
import { wakatimeProvider } from "./providers/wakatime";

/**
 * Central provider registry. Adding a new provider = a new `providers/<id>/`
 * (or `local/<id>/`) folder implementing `TechProvider`, plus one line here.
 * Partial because not every TechProviderId is registered yet — leetcode is a
 * deferred follow-up.
 */
export const PROVIDERS: Partial<Record<TechProviderId, TechProvider>> = {
  blog: blogProvider,
  projects: projectsProvider,
  github: githubProvider,
  wakatime: wakatimeProvider,
};

export function getProviderIds(): TechProviderId[] {
  return Object.keys(PROVIDERS) as TechProviderId[];
}

export function getProvider(id: TechProviderId): TechProvider | undefined {
  return PROVIDERS[id];
}

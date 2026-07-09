import { readSnapshot, sourceInfo } from "./shared";
import type {
  GitHubProfileData,
  GitHubContributionsData,
  GitHubReposData,
  GitHubLanguagesData,
  GitHubOssContributionsData,
} from "@/types/techPerformance";

export async function getGithubSection() {
  const [profile, contributions, repos, languages, oss] = await Promise.all([
    readSnapshot("github:profile", "github"),
    readSnapshot("github:contributions", "github"),
    readSnapshot("github:repos", "github"),
    readSnapshot("github:languages", "github"),
    readSnapshot("github:oss-contributions", "github"),
  ]);

  return {
    profile: (profile?.data as GitHubProfileData | undefined) ?? null,
    contributions:
      (contributions?.data as GitHubContributionsData | undefined) ?? null,
    repos: (repos?.data as GitHubReposData | undefined) ?? null,
    languages: (languages?.data as GitHubLanguagesData | undefined) ?? null,
    ossContributions:
      (oss?.data as GitHubOssContributionsData | undefined) ?? null,
    dataSource: sourceInfo(contributions, "github"),
  };
}

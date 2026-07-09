import dbConnect from "@/lib/db/connection";
import Project from "@/models/Project";
import { readSnapshot, sourceInfo } from "./shared";
import type { GitHubReposData } from "@/types/techPerformance";

function parseGithubFullName(url: string): string | null {
  const match = url.match(/^https:\/\/github\.com\/([^/]+\/[^/]+?)\/?$/);
  return match ? match[1].replace(/\.git$/, "") : null;
}

export async function getEngineeringOutputSection() {
  await dbConnect();

  const [reposSnapshot, projects] = await Promise.all([
    readSnapshot("github:repos", "github"),
    Project.find({ featured: true, githubUrl: { $exists: true, $ne: null } })
      .select("title shortDescription technologies githubUrl liveUrl status order")
      .sort({ order: 1 })
      .lean(),
  ]);

  const repoData =
    (reposSnapshot?.data as GitHubReposData | undefined)?.repos ?? [];
  const repoByFullName = new Map(
    repoData.map((r) => [r.fullName.toLowerCase(), r])
  );

  const featuredFullNames = new Set<string>();

  const featured = projects.map((project) => {
    const fullName = project.githubUrl
      ? parseGithubFullName(project.githubUrl)
      : null;
    if (fullName) featuredFullNames.add(fullName.toLowerCase());
    const liveStats = fullName
      ? repoByFullName.get(fullName.toLowerCase())
      : undefined;

    return {
      title: project.title,
      impact: project.shortDescription,
      technologies: project.technologies,
      githubUrl: project.githubUrl,
      liveUrl: project.liveUrl,
      status: project.status,
      stats: liveStats
        ? {
            stars: liveStats.stars,
            forks: liveStats.forks,
            openIssues: liveStats.openIssues,
            primaryLanguage: liveStats.primaryLanguage,
            pushedAt: liveStats.pushedAt,
          }
        : null,
    };
  });

  // Fills the section even before any Project has `featured: true` set, and
  // surfaces real activity outside the curated list.
  const mostActive = repoData
    .filter((r) => !featuredFullNames.has(r.fullName.toLowerCase()) && !r.isFork)
    .sort(
      (a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime()
    )
    .slice(0, 6);

  return {
    featured,
    mostActive,
    dataSource: sourceInfo(reposSnapshot, "github"),
  };
}

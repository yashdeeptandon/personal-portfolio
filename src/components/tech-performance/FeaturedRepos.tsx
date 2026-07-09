"use client";

import ChartCard from "@/components/ui/ChartCard";
import RepoCard from "./RepoCard";
import type { EngineeringOutputSectionData } from "@/types/techPerformance";

export default function FeaturedRepos({
  data,
}: {
  data: EngineeringOutputSectionData;
}) {
  const hasFeatured = data.featured.length > 0;
  const repos = hasFeatured ? data.featured : data.mostActive;

  return (
    <ChartCard
      title={hasFeatured ? "Featured projects" : "Most active repositories"}
      subtitle={
        hasFeatured
          ? "Curated projects with live GitHub stats"
          : "No projects marked as featured yet — showing recent GitHub activity instead"
      }
      fullWidth
    >
      {repos.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No repositories to show yet.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {repos.map((repo) => (
            <RepoCard key={"title" in repo ? repo.title : repo.fullName} repo={repo} />
          ))}
        </div>
      )}
    </ChartCard>
  );
}

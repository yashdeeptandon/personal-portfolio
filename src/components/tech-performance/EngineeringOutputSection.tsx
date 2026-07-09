"use client";

import FeaturedRepos from "./FeaturedRepos";
import OssContributions from "./OssContributions";
import DataSourceBadge from "./DataSourceBadge";
import type {
  EngineeringOutputSectionData,
  GitHubOssContributionsData,
} from "@/types/techPerformance";

export default function EngineeringOutputSection({
  engineeringOutput,
  ossContributions,
}: {
  engineeringOutput: EngineeringOutputSectionData;
  ossContributions: GitHubOssContributionsData | null;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <DataSourceBadge info={engineeringOutput.dataSource} />
      </div>
      <FeaturedRepos data={engineeringOutput} />
      <OssContributions data={ossContributions} />
    </div>
  );
}

"use client";

import Badge from "@/components/ui/Badge";
import type { EngineeringOutputRepoCard, GitHubRepoSummary } from "@/types/techPerformance";

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ForkIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M7 3a2 2 0 100 4 2 2 0 000-4zM17 3a2 2 0 100 4 2 2 0 000-4zM12 15a2 2 0 100 4 2 2 0 000-4zM7 7v2a3 3 0 003 3h4a3 3 0 003-3V7M12 12v2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

function timeAgoShort(iso: string): string {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (diffDays < 1) return "today";
  if (diffDays < 30) return `${diffDays}d ago`;
  const months = Math.floor(diffDays / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

// Accepts either a curated "featured" card (with an admin-written impact
// statement + tech stack) or a plain live repo summary — same visual shell.
export default function RepoCard({
  repo,
}: {
  repo: EngineeringOutputRepoCard | GitHubRepoSummary;
}) {
  const isFeatured = "impact" in repo;
  const title = isFeatured ? repo.title : repo.name;
  const description = isFeatured ? repo.impact : repo.description;
  const githubUrl = isFeatured ? repo.githubUrl : repo.htmlUrl;
  const liveUrl = isFeatured ? repo.liveUrl : repo.homepageUrl;
  const stats = isFeatured ? repo.stats : repo;
  const technologies = isFeatured ? repo.technologies : repo.primaryLanguage ? [repo.primaryLanguage] : [];

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-3 hover:bg-white/[0.06] transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        {stats && (
          <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
            <span className="flex items-center gap-1">
              <StarIcon />
              {stats.stars}
            </span>
            <span className="flex items-center gap-1">
              <ForkIcon />
              {stats.forks}
            </span>
          </div>
        )}
      </div>

      {description && (
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{description}</p>
      )}

      {technologies.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {technologies.slice(0, 5).map((tech) => (
            <Badge key={tech} variant="neutral">
              {tech}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-3">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              GitHub
            </a>
          )}
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Live
            </a>
          )}
        </div>
        {stats && "pushedAt" in stats && (
          <span className="text-[10px] text-gray-600">{timeAgoShort(stats.pushedAt)}</span>
        )}
      </div>
    </div>
  );
}

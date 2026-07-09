"use client";

import StatCard from "@/components/ui/StatCard";
import { CHART } from "@/lib/chartTheme";
import type { OverviewSectionData } from "@/types/techPerformance";
import type { TechPeriod } from "@/lib/tech-performance/period";

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 10.41l4.29 4.3-1.42 1.41L11 13V6h2v6.41z" />
  </svg>
);

const StreakIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M7 2v11h3v9l7-12h-4l4-8z" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 .3a12 12 0 00-3.79 23.4c.6.11.82-.26.82-.58l-.01-2.23c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.08 1.83 2.82 1.3 3.5 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22l-.01 3.29c0 .32.22.7.83.58A12 12 0 0012 .3z" />
  </svg>
);

const PRIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M6 3a2 2 0 100 4 2 2 0 000-4zM4 8.05V15a3 3 0 106 0V9.5a4 4 0 004 4v.55a2 2 0 102 0V13.5a6 6 0 01-6-6V8.05a3 3 0 10-6 0zM7 17a1 1 0 110 2 1 1 0 010-2zm11-9a2 2 0 10-2-2 2 2 0 002 2z" />
  </svg>
);

const ProjectIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M3 6a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />
  </svg>
);

const OssIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="2.2" />
    <circle cx="6" cy="18" r="2.2" />
    <circle cx="18" cy="12" r="2.2" />
    <path d="M6 8.2V15.8M8 6.8l8 3.6M8 17.2l8-3.6" />
  </svg>
);

const PERIOD_LABEL: Record<TechPeriod, string> = {
  today: "today",
  "7d": "last 7 days",
  "30d": "last 30 days",
  year: "this year",
  all: "all time",
};

export default function TechKPIRow({
  overview,
}: {
  overview: OverviewSectionData;
}) {
  const cards = [
    {
      label: "Coding hours",
      value: overview.codingHoursThisWeek,
      suffix: "h",
      decimals: 1,
      icon: <ClockIcon />,
      accent: CHART.ACCENT_INDIGO,
      sub: "this week (WakaTime)",
    },
    {
      label: "Coding streak",
      value: overview.codingStreak,
      suffix: " days",
      decimals: 0,
      icon: <StreakIcon />,
      accent: CHART.ACCENT_AMBER,
      sub: "WakaTime",
    },
    {
      label: "GitHub contributions",
      value: overview.githubContributionsLastYear,
      suffix: "",
      decimals: 0,
      icon: <GitHubIcon />,
      accent: CHART.ACCENT_GREEN,
      sub: "last 12 months",
    },
    {
      label: "GitHub streak",
      value: overview.githubCurrentStreak,
      suffix: " days",
      decimals: 0,
      icon: <StreakIcon />,
      accent: CHART.ACCENT_GREEN,
      sub: "current",
    },
    {
      label: "PRs merged",
      value: overview.prsMerged,
      suffix: "",
      decimals: 0,
      icon: <PRIcon />,
      accent: CHART.ACCENT_CYAN,
      sub: overview.prsMergedIsAllTime ? "all-time" : PERIOD_LABEL[overview.period],
    },
    {
      label: "Active projects",
      value: overview.activeProjects,
      suffix: "",
      decimals: 0,
      icon: <ProjectIcon />,
      accent: CHART.ACCENT_INDIGO,
      sub: `${overview.projectsShipped ?? 0} shipped`,
    },
    {
      label: "OSS impact",
      value: overview.ossReposContributed,
      suffix: "",
      decimals: 0,
      icon: <OssIcon />,
      accent: CHART.ACCENT_AMBER,
      sub: "external repos contributed to",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => (
        <StatCard key={c.label} {...c} />
      ))}
    </div>
  );
}

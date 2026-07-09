// Tech Performance — shared types across services, API routes, and UI

import type { TechPeriod } from "@/lib/tech-performance/period";

export type TechProviderId = "github" | "wakatime" | "leetcode" | "blog" | "projects";

export interface NormalizedActivityEvent {
  provider: TechProviderId | "manual";
  type: string;
  timestamp: string; // ISO
  title: string;
  description?: string;
  url?: string;
  externalId: string;
  metadata?: Record<string, unknown>;
  visibility: "public" | "private";
}

export interface ProviderSnapshotResult {
  success: boolean;
  snapshots: Array<{ type: string; data: Record<string, unknown> }>;
  events?: NormalizedActivityEvent[];
  error?: string;
  statusCode?: number;
}

export interface TechProvider {
  readonly id: TechProviderId;
  isConfigured(): boolean;
  fetchSnapshot(): Promise<ProviderSnapshotResult>;
}

// ---- Snapshot payload shapes (the `data` field of a TechSnapshot doc) ----

export interface GitHubProfileData {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  followers: number;
  following: number;
  publicRepos: number;
  createdAt: string;
  htmlUrl: string;
}

export interface ContributionDay {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface GitHubContributionsData {
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  calendar: ContributionDay[];
  totalPRs: number;
  totalPRsMerged: number;
  totalIssues: number;
  totalReviews: number;
  totalCommitContributions: number;
}

export interface GitHubRepoSummary {
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  homepageUrl: string | null;
  primaryLanguage: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  pushedAt: string;
  isFork: boolean;
  isPrivate: boolean;
}

export interface GitHubReposData {
  repos: GitHubRepoSummary[];
}

export interface GitHubLanguagesData {
  languages: Array<{ name: string; bytes: number; pct: number }>;
}

export interface GitHubActivityItem {
  type: string; // "commit" | "pull_request" | "issue" | "release"
  title: string;
  repo: string;
  url: string;
  timestamp: string;
}

export interface GitHubActivityData {
  items: GitHubActivityItem[];
}

export interface GitHubOssContributionsData {
  repos: Array<{
    nameWithOwner: string;
    url: string;
    prCount: number;
  }>;
}

export interface WakaTimeSummaryData {
  todaySeconds: number;
  weekSeconds: number;
  monthSeconds: number;
  yearSeconds: number;
  allTimeSeconds: number;
  currentStreak: number;
  longestStreak: number;
  bestDaySeconds: number;
  bestDayDate: string | null;
  dailyAverageSeconds: number;
}

export interface WakaTimeActivityDay {
  date: string;
  totalSeconds: number;
}

export interface WakaTimeActivityData {
  days: WakaTimeActivityDay[];
}

export interface WakaTimeBreakdownEntry {
  name: string;
  totalSeconds: number;
  pct: number;
}

export interface WakaTimeBreakdownData {
  languages: WakaTimeBreakdownEntry[];
  editors: WakaTimeBreakdownEntry[];
  projects: WakaTimeBreakdownEntry[];
  categories: WakaTimeBreakdownEntry[];
}

export interface DataSourceInfo {
  provider: TechProviderId;
  source: "live" | "manual";
  status: "ok" | "stale" | "error" | "unconfigured";
  fetchedAt: string | null;
  isOfficialApi: boolean;
}

export interface TechPerformanceStatus {
  providers: Array<{
    id: TechProviderId;
    configured: boolean;
    status: "ok" | "stale" | "error" | "unconfigured";
    fetchedAt: string | null;
    lastError?: string;
  }>;
}

// ---- Section API response shapes (the `data` field of each section route) ----

export interface OverviewSectionData {
  period: TechPeriod;
  codingHoursThisWeek: number | null;
  codingStreak: number | null;
  githubContributionsLastYear: number | null;
  githubCurrentStreak: number | null;
  prsMerged: number | null;
  prsMergedIsAllTime: boolean;
  commitsInPeriod: number | null;
  activeProjects: number | null;
  projectsShipped: number | null;
  ossReposContributed: number | null;
  githubProfile: { login: string; followers: number; publicRepos: number } | null;
  dataSources: { github: DataSourceInfo; wakatime: DataSourceInfo };
}

export interface GithubSectionData {
  profile: GitHubProfileData | null;
  contributions: GitHubContributionsData | null;
  repos: GitHubReposData | null;
  languages: GitHubLanguagesData | null;
  ossContributions: GitHubOssContributionsData | null;
  dataSource: DataSourceInfo;
}

export interface EngineeringOutputRepoCard {
  title: string;
  impact: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  status: string;
  stats: {
    stars: number;
    forks: number;
    openIssues: number;
    primaryLanguage: string | null;
    pushedAt: string;
  } | null;
}

export interface EngineeringOutputSectionData {
  featured: EngineeringOutputRepoCard[];
  mostActive: GitHubRepoSummary[];
  dataSource: DataSourceInfo;
}

export interface ConsistencyDay {
  date: string;
  value: number;
}

export interface ConsistencySectionData {
  github: ConsistencyDay[];
  wakatime: ConsistencyDay[];
  combined: ConsistencyDay[];
  dataSources: { github: DataSourceInfo; wakatime: DataSourceInfo };
}

export interface WakatimeSectionData {
  summary: WakaTimeSummaryData | null;
  activity: WakaTimeActivityData | null;
  breakdown: WakaTimeBreakdownData | null;
  dataSource: DataSourceInfo;
}

export interface SkillsSectionData {
  byCodingTime: Array<WakaTimeBreakdownEntry & { trend: number[] | null }>;
  byRepos: GitHubLanguagesData["languages"];
  editors: WakaTimeBreakdownEntry[];
  dataSources: { github: DataSourceInfo; wakatime: DataSourceInfo };
}

export interface TimelineEvent {
  provider: TechProviderId | "manual";
  type: string;
  timestamp: string;
  title: string;
  description: string | null;
  url: string | null;
  metadata: Record<string, unknown>;
}

export interface TimelineSectionData {
  events: TimelineEvent[];
  nextCursor: string | null;
}

export interface GoalWithProgress {
  id: string;
  key: string;
  label: string;
  metric: string;
  period: string;
  target: number;
  unit: string;
  description: string | null;
  current: number;
  pct: number;
}

export interface GoalsSectionData {
  goals: GoalWithProgress[];
}

export interface SignalsMetrics {
  commitsLast30d: number;
  prsMergedLast30d: number;
  prsOpenedLast30d: number;
  issuesClosedLast30d: number;
  releasesLast30d: number;
  activeRepos: number;
  codingHoursLast30d: number | null;
  contributionsLastYear: number | null;
}

export interface SignalsHighlight {
  title: string;
  description: string | null;
  url: string | null;
  timestamp: string;
  category: string | null;
}

export interface SignalsSectionData {
  metrics: SignalsMetrics;
  commitBreakdown: Record<"feat" | "fix" | "docs" | "chore" | "other", number>;
  highlights: SignalsHighlight[];
  narrative: string;
}

"use client";

import { useEffect, useState } from "react";
import type { TechPeriod } from "@/lib/tech-performance/period";
import type {
  OverviewSectionData,
  GithubSectionData,
  EngineeringOutputSectionData,
  ConsistencySectionData,
  SkillsSectionData,
  SignalsSectionData,
  TechPerformanceStatus,
} from "@/types/techPerformance";

const BASE = "/api/tech-performance";

export interface TechPerformanceData {
  overview: OverviewSectionData | null;
  github: GithubSectionData | null;
  engineeringOutput: EngineeringOutputSectionData | null;
  consistency: ConsistencySectionData | null;
  skills: SkillsSectionData | null;
  signals: SignalsSectionData | null;
  status: TechPerformanceStatus | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.message || `Request failed: ${url}`);
  }
  return body.data as T;
}

/**
 * Two effects, not one: `overview` is period-sensitive and refetches on
 * every period change, while the rest are not — bundling everything into a
 * single Promise.all keyed on `period` would refetch endpoints that never
 * changed every time the user flips the period selector.
 */
export function useTechPerformanceData(period: TechPeriod): TechPerformanceData {
  const [overview, setOverview] = useState<OverviewSectionData | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  const [github, setGithub] = useState<GithubSectionData | null>(null);
  const [engineeringOutput, setEngineeringOutput] =
    useState<EngineeringOutputSectionData | null>(null);
  const [consistency, setConsistency] = useState<ConsistencySectionData | null>(null);
  const [skills, setSkills] = useState<SkillsSectionData | null>(null);
  const [signals, setSignals] = useState<SignalsSectionData | null>(null);
  const [status, setStatus] = useState<TechPerformanceStatus | null>(null);
  const [staticLoading, setStaticLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setOverviewLoading(true);

    getJson<OverviewSectionData>(`${BASE}/overview?period=${period}`)
      .then((data) => {
        if (cancelled) return;
        setOverview(data);
        setOverviewLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setOverviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period, refreshTick]);

  useEffect(() => {
    let cancelled = false;
    setStaticLoading(true);

    Promise.all([
      getJson<GithubSectionData>(`${BASE}/github`),
      getJson<EngineeringOutputSectionData>(`${BASE}/engineering-output`),
      getJson<ConsistencySectionData>(`${BASE}/consistency`),
      getJson<SkillsSectionData>(`${BASE}/skills`),
      getJson<SignalsSectionData>(`${BASE}/signals`),
      getJson<TechPerformanceStatus>(`${BASE}/status`),
    ])
      .then(([githubData, engineeringData, consistencyData, skillsData, signalsData, statusData]) => {
        if (cancelled) return;
        setGithub(githubData);
        setEngineeringOutput(engineeringData);
        setConsistency(consistencyData);
        setSkills(skillsData);
        setSignals(signalsData);
        setStatus(statusData);
        setStaticLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setStaticLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  return {
    overview,
    github,
    engineeringOutput,
    consistency,
    skills,
    signals,
    status,
    isLoading: overviewLoading || staticLoading,
    error,
    refresh: () => setRefreshTick((t) => t + 1),
  };
}

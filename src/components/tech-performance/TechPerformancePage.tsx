"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useTechPerformanceData } from "@/hooks/useTechPerformanceData";
import { timeAgo } from "@/lib/tech-performance/timeAgo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import type { TechPeriod } from "@/lib/tech-performance/period";
import OverviewSection from "./OverviewSection";
import EngineeringOutputSection from "./EngineeringOutputSection";
import ConsistencyHeatmap from "./ConsistencyHeatmap";
import SkillSignals from "./SkillSignals";
import ActivityTimeline from "./ActivityTimeline";
import GoalsSection from "./GoalsSection";
import EngineeringSignals from "./EngineeringSignals";
import NarrativeSummary from "./NarrativeSummary";
import DevMetricsLoading from "./DevMetricsLoading";

const TABS = ["Overview", "Activity", "Consistency", "Output", "Skills", "Impact", "Goals"] as const;
export type Tab = (typeof TABS)[number];

const TAB_ICONS: Record<Tab, string> = {
  Overview: "◉",
  Activity: "☰",
  Consistency: "▦",
  Output: "🛠",
  Skills: "◆",
  Impact: "⚡",
  Goals: "🎯",
};

const cubicEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: cubicEase } },
};

const tabContent = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: cubicEase } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

function RefreshButton({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false);

  const trigger = useCallback(async () => {
    setBusy(true);
    try {
      await fetch("/api/admin/tech-performance/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      // Upstream fetches happen async server-side — give them a moment
      // before re-reading, rather than immediately showing stale data again.
      setTimeout(onDone, 2000);
    } finally {
      setBusy(false);
    }
  }, [onDone]);

  return (
    <button
      onClick={trigger}
      disabled={busy}
      className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 flex items-center gap-1"
    >
      <svg viewBox="0 0 24 24" fill="none" className={`w-3.5 h-3.5 ${busy ? "animate-spin" : ""}`} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 11-3-6.7M21 4v5h-5" />
      </svg>
      {busy ? "Refreshing…" : "Refresh now"}
    </button>
  );
}

export default function TechPerformancePage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [period, setPeriod] = useState<TechPeriod>("30d");

  const {
    overview,
    github,
    engineeringOutput,
    consistency,
    skills,
    signals,
    status,
    isLoading,
    error,
    refresh,
  } = useTechPerformanceData(period);

  const mostRecentSync = status?.providers
    .filter((p) => p.status === "ok" && p.fetchedAt)
    .map((p) => p.fetchedAt as string)
    .sort()
    .pop();

  const anyConfigured = status?.providers.some((p) => p.configured);

  return (
    <main className="relative min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back to portfolio
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-indigo-600 dark:text-indigo-400 mb-2">
              Developer Analytics
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
              Dev Metrics
            </h1>
            <p className="mt-2 text-muted-foreground text-sm max-w-xl">
              Real coding activity, sourced live from GitHub and WakaTime — not a static skills list.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {isAdmin && <RefreshButton onDone={refresh} />}
            {mostRecentSync && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
                <span className="text-xs text-muted-foreground">Synced {timeAgo(mostRecentSync)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading && <DevMetricsLoading />}

        {error && !isLoading && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="text-red-600 dark:text-red-400 text-sm">Tech performance data unavailable — {error}</p>
          </div>
        )}

        {!isLoading && !error && anyConfigured === false && (
          <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-12 text-center">
            <p className="text-foreground/80 text-sm">No providers connected yet.</p>
            <p className="text-muted-foreground text-xs mt-1">
              Set GITHUB_TOKEN and GITHUB_USERNAME (and later WAKATIME_API_KEY) to start syncing data.
            </p>
          </div>
        )}

        {!isLoading && !error && overview && engineeringOutput && (
          <>
            <div className="flex gap-1 overflow-x-auto pb-1 mb-4 border-b border-foreground/10">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab
                      ? "text-foreground border-b-2 border-indigo-500 -mb-px bg-indigo-500/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  <span>{TAB_ICONS[tab]}</span>
                  {tab}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab} variants={tabContent} initial="hidden" animate="visible" exit="exit">
                {activeTab === "Overview" && (
                  <motion.div variants={itemVariants} initial="hidden" animate="visible">
                    <OverviewSection overview={overview} period={period} onPeriodChange={setPeriod} />
                  </motion.div>
                )}
                {activeTab === "Activity" && <ActivityTimeline />}
                {activeTab === "Consistency" && consistency && (
                  <ConsistencyHeatmap data={consistency} />
                )}
                {activeTab === "Output" && (
                  <EngineeringOutputSection
                    engineeringOutput={engineeringOutput}
                    ossContributions={github?.ossContributions ?? null}
                  />
                )}
                {activeTab === "Skills" && skills && <SkillSignals data={skills} />}
                {activeTab === "Impact" && signals && (
                  <div className="space-y-4">
                    <NarrativeSummary narrative={signals.narrative} />
                    <EngineeringSignals data={signals} />
                  </div>
                )}
                {activeTab === "Goals" && <GoalsSection isAdmin={isAdmin} />}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </main>
  );
}

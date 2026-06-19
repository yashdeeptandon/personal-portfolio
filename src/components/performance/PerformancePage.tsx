"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHealthData } from "@/hooks/useHealthData";
import {
  DEFAULT_FILTERS,
  computeDateRange,
  computeAutoGranularity,
  applyDateFilter,
  aggregateActivity,
  toWeeklyRings,
  toMonthlyRings,
  type FilterState,
} from "@/lib/filterUtils";
import FilterBar from "./FilterBar";

// Overview tab components
import KPIRow from "./KPIRow";
import ActivityTrendsChart from "./ActivityTrendsChart";
import WorkoutConsistencyChart from "./WorkoutConsistencyChart";
import HRZoneChart from "./HRZoneChart";
import HeartMetricsChart from "./HeartMetricsChart";
import RecoveryScoreChart from "./RecoveryScoreChart";
import InsightsPanel from "./InsightsPanel";

// Activity tab
import DailyStepsChart from "./DailyStepsChart";
import StackedCaloriesChart from "./StackedCaloriesChart";
import ExerciseTimeChart from "./ExerciseTimeChart";
import WorkoutHeatmap from "./WorkoutHeatmap";
import DayClassificationPie from "./DayClassificationPie";
import ActivityRingsChart from "./ActivityRingsChart";

// Heart tab
import FullHRChart from "./FullHRChart";
import SpO2Chart from "./SpO2Chart";

// Performance tab
import VO2MaxChart from "./VO2MaxChart";
import TrainingLoadChart from "./TrainingLoadChart";
import WorkoutTypesChart from "./WorkoutTypesChart";
import PersonalBestsTable from "./PersonalBestsTable";
import MonthlyWorkoutTable from "./MonthlyWorkoutTable";

// Routes + ECG tabs
import RoutesTab from "./RoutesTab";
import ECGTab from "./ECGTab";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const TABS = ["Overview", "Activity", "Heart", "Performance", "Routes", "ECG"] as const;
export type Tab = typeof TABS[number];

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`rounded-xl border border-white/10 bg-white/5 animate-pulse ${className}`} />;
}

function SkeletonLayout() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} className="h-28" />)}
      </div>
      <SkeletonCard className="h-80" />
      <div className="grid md:grid-cols-2 gap-4">
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-64" />
      </div>
      <SkeletonCard className="h-72" />
    </div>
  );
}

const TAB_ICONS: Record<Tab, string> = {
  Overview: "◉",
  Activity: "🏃",
  Heart: "♡",
  Performance: "📈",
  Routes: "🗺",
  ECG: "〰",
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

const tabContent = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

export default function PerformancePage() {
  const {
    kpis, weeklyTrends, monthlySummary, hrZones, workoutTypes,
    dailyActivity, dailyHeart, vo2max, trainingLoad, workoutsDetail,
    workoutCalendar, activityRings, routes, ecgRecordings,
    isLoading, error, meta,
  } = useHealthData();

  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // ── Compute effective date range ─────────────────────────────────────────
  const { from: effectiveFrom, to: effectiveTo } = useMemo(
    () =>
      computeDateRange(
        filters.timeWindow,
        meta?.data_to ?? new Date().toISOString().slice(0, 10),
        filters.customFrom,
        filters.customTo
      ),
    [filters.timeWindow, filters.customFrom, filters.customTo, meta]
  );

  // ── Compute effective granularity ────────────────────────────────────────
  const effectiveGranularity = useMemo<"daily" | "weekly" | "monthly">(() => {
    if (filters.granularity !== "auto") return filters.granularity as "daily" | "weekly" | "monthly";
    return computeAutoGranularity(effectiveFrom, effectiveTo);
  }, [filters.granularity, effectiveFrom, effectiveTo]);

  // ── Date filter helper ───────────────────────────────────────────────────
  const filterDate = useCallback(
    <T extends { date: string }>(arr: T[]) => applyDateFilter(arr, effectiveFrom, effectiveTo),
    [effectiveFrom, effectiveTo]
  );

  // ── Filtered slices ──────────────────────────────────────────────────────
  const filteredDailyActivity = useMemo(
    () => filterDate(dailyActivity),
    [dailyActivity, filterDate]
  );

  const filteredDailyHeart = useMemo(
    () => filterDate(dailyHeart),
    [dailyHeart, filterDate]
  );

  const filteredActivityRings = useMemo(
    () => filterDate(activityRings),
    [activityRings, filterDate]
  );

  const filteredWeeklyTrends = useMemo(
    () =>
      weeklyTrends.filter(
        (w) =>
          (!effectiveFrom || w.week_start >= effectiveFrom) &&
          (!effectiveTo || w.week_start <= effectiveTo)
      ),
    [weeklyTrends, effectiveFrom, effectiveTo]
  );

  const filteredTrainingLoad = useMemo(
    () =>
      trainingLoad.filter(
        (w) =>
          (!effectiveFrom || w.week >= effectiveFrom) &&
          (!effectiveTo || w.week <= effectiveTo)
      ),
    [trainingLoad, effectiveFrom, effectiveTo]
  );

  // ── Aggregated activity data (for step/cal/exercise charts) ─────────────
  const aggregatedActivity = useMemo(
    () => aggregateActivity(filteredDailyActivity, effectiveGranularity),
    [filteredDailyActivity, effectiveGranularity]
  );

  // ── Aggregated rings ─────────────────────────────────────────────────────
  const aggregatedRings = useMemo(() => {
    if (effectiveGranularity === "monthly") return toMonthlyRings(filteredActivityRings);
    return toWeeklyRings(filteredActivityRings);
  }, [filteredActivityRings, effectiveGranularity]);

  // ── Route filters ────────────────────────────────────────────────────────
  const filteredRoutes = useMemo(() => {
    let r = routes;
    if (filters.routeYear !== null)
      r = r.filter((x) => x.date.startsWith(String(filters.routeYear)));
    r = r.filter(
      (x) =>
        (x.distance_km ?? 0) >= filters.routeMinKm &&
        (x.distance_km ?? 0) <= filters.routeMaxKm
    );
    return r;
  }, [routes, filters.routeYear, filters.routeMinKm, filters.routeMaxKm]);

  // ── ECG filter ───────────────────────────────────────────────────────────
  const filteredECG = useMemo(() => {
    if (filters.ecgClassifications.length === 0) return ecgRecordings;
    return ecgRecordings.filter((e) =>
      filters.ecgClassifications.includes(e.classification)
    );
  }, [ecgRecordings, filters.ecgClassifications]);

  // ── Derived metadata for FilterBar ──────────────────────────────────────
  const routeYears = useMemo(
    () =>
      [...new Set(routes.map((r) => Number(r.date.slice(0, 4))))].sort(
        (a, b) => b - a
      ),
    [routes]
  );

  const ecgClasses = useMemo(
    () => [...new Set(ecgRecordings.map((e) => e.classification))].sort(),
    [ecgRecordings]
  );

  const heatmapYears = useMemo(
    () =>
      [...new Set(workoutCalendar.map((d) => d.year))].sort((a, b) => b - a),
    [workoutCalendar]
  );

  const recordCount = useMemo(() => {
    if (activeTab === "Activity" || activeTab === "Overview")
      return filteredDailyActivity.length;
    if (activeTab === "Heart") return filteredDailyHeart.length;
    if (activeTab === "Performance") return filteredTrainingLoad.length;
    if (activeTab === "Routes") return filteredRoutes.length;
    if (activeTab === "ECG") return filteredECG.length;
    return filteredDailyActivity.length;
  }, [activeTab, filteredDailyActivity, filteredDailyHeart, filteredTrainingLoad, filteredRoutes, filteredECG]);

  return (
    <main className="relative min-h-screen pt-24 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-indigo-400 mb-2">
              Personal Analytics
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              Performance Dashboard
            </h1>
            <p className="mt-2 text-gray-400 text-sm max-w-xl">
              Real Apple Health data — steps, heart rate, VO₂ Max, GPS routes, training load,
              and recovery metrics processed through a custom Python pipeline.
            </p>
          </div>
          {meta && (
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-gray-500">
                Updated{" "}
                {new Date(meta.generated_at).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading && <SkeletonLayout />}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
            <p className="text-red-400 text-sm">Health data unavailable — {error}</p>
            <p className="text-gray-500 text-xs mt-1">Run the Python export script to generate JSON data.</p>
          </div>
        )}

        {!isLoading && !error && kpis && (
          <>
            {/* KPI row — always visible */}
            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="mb-6">
              <KPIRow kpis={kpis} />
            </motion.div>

            {/* Tab bar */}
            <div className="flex gap-1 overflow-x-auto pb-1 mb-4 border-b border-white/10">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab
                      ? "text-white border-b-2 border-indigo-500 -mb-px bg-indigo-500/10"
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  }`}
                >
                  <span>{TAB_ICONS[tab]}</span>
                  {tab}
                  {tab === "Routes" && routes.length > 0 && (
                    <span className="ml-1 text-xs bg-indigo-500/20 text-indigo-400 rounded-full px-1.5 py-0.5">{filteredRoutes.length}</span>
                  )}
                  {tab === "ECG" && ecgRecordings.length > 0 && (
                    <span className="ml-1 text-xs bg-red-500/20 text-red-400 rounded-full px-1.5 py-0.5">{filteredECG.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Filter bar */}
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              activeTab={activeTab}
              dataTo={meta?.data_to ?? ""}
              recordCount={recordCount}
              workoutTypes={workoutTypes}
              routeYears={routeYears}
              ecgClasses={ecgClasses}
              heatmapYears={heatmapYears}
            />

            {/* Active filter summary */}
            {(effectiveFrom || effectiveTo) && (
              <p className="text-xs text-indigo-400 mb-3">
                Showing{" "}
                {effectiveFrom && effectiveTo
                  ? `${effectiveFrom} → ${effectiveTo}`
                  : effectiveFrom
                  ? `from ${effectiveFrom}`
                  : `up to ${effectiveTo}`}
                {" "}· {effectiveGranularity} granularity
              </p>
            )}

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabContent}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {activeTab === "Overview" && (
                  <div className="space-y-4">
                    <ActivityTrendsChart data={filteredWeeklyTrends} />
                    <div className="grid md:grid-cols-2 gap-4">
                      <WorkoutConsistencyChart data={monthlySummary} />
                      <HRZoneChart data={hrZones} />
                    </div>
                    <HeartMetricsChart data={filteredWeeklyTrends} />
                    <div className="grid md:grid-cols-2 gap-4">
                      <RecoveryScoreChart data={filteredWeeklyTrends} />
                      <WorkoutTypesChart data={workoutTypes} />
                    </div>
                    <InsightsPanel kpis={kpis} />
                  </div>
                )}

                {activeTab === "Activity" && (
                  <div className="space-y-4">
                    <DailyStepsChart
                      data={aggregatedActivity}
                      granularity={effectiveGranularity}
                      stepThreshold={filters.stepThreshold}
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <StackedCaloriesChart
                        data={aggregatedActivity}
                        granularity={effectiveGranularity}
                      />
                      <ExerciseTimeChart
                        data={aggregatedActivity}
                        granularity={effectiveGranularity}
                      />
                    </div>
                    <WorkoutHeatmap
                      data={workoutCalendar}
                      year={filters.heatmapYear}
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <DayClassificationPie
                        data={filteredDailyActivity}
                        stepThreshold={filters.stepThreshold}
                      />
                      <ActivityRingsChart data={aggregatedRings} granularity={effectiveGranularity} />
                    </div>
                  </div>
                )}

                {activeTab === "Heart" && (
                  <div className="space-y-4">
                    <FullHRChart
                      data={filteredDailyHeart}
                      granularity={effectiveGranularity}
                      metrics={filters.heartMetrics}
                    />
                    {filters.heartMetrics.spo2 && (
                      <SpO2Chart data={filteredDailyHeart} granularity={effectiveGranularity} />
                    )}
                    <HeartMetricsChart data={filteredWeeklyTrends} />
                    <div className="grid md:grid-cols-2 gap-4">
                      <RecoveryScoreChart data={filteredWeeklyTrends} />
                      <HRZoneChart data={hrZones} />
                    </div>
                  </div>
                )}

                {activeTab === "Performance" && (
                  <div className="space-y-4">
                    <VO2MaxChart data={vo2max} />
                    <TrainingLoadChart data={filteredTrainingLoad} />
                    <div className="grid md:grid-cols-2 gap-4">
                      <WorkoutTypesChart data={workoutTypes} />
                      <PersonalBestsTable data={workoutsDetail} />
                    </div>
                    <MonthlyWorkoutTable data={workoutsDetail} />
                  </div>
                )}

                {activeTab === "Routes" && (
                  filteredRoutes.length > 0
                    ? <RoutesTab routes={filteredRoutes} />
                    : (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
                        <p className="text-gray-400 text-sm">No routes match current filters</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {routes.length > 0
                            ? "Adjust distance or year filters above."
                            : "Run parse_routes.py to generate route Parquet files."}
                        </p>
                      </div>
                    )
                )}

                {activeTab === "ECG" && (
                  filteredECG.length > 0
                    ? <ECGTab recordings={filteredECG} />
                    : (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
                        <p className="text-gray-400 text-sm">No ECG recordings match current filters</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {ecgRecordings.length > 0
                            ? "Adjust classification filter above."
                            : "Run parse_ecg.py to generate ECG Parquet files."}
                        </p>
                      </div>
                    )
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </main>
  );
}

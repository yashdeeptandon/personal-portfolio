"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHealthData } from "@/hooks/useHealthData";

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

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

const TABS = ["Overview", "Activity", "Heart", "Performance", "Routes", "ECG"] as const;
type Tab = typeof TABS[number];

const TAB_ICONS: Record<Tab, string> = {
  Overview: "◉",
  Activity: "🏃",
  Heart: "♡",
  Performance: "📈",
  Routes: "🗺",
  ECG: "〰",
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

const tabContent = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export default function PerformancePage() {
  const {
    kpis, weeklyTrends, monthlySummary, hrZones, workoutTypes,
    dailyActivity, dailyHeart, vo2max, trainingLoad, workoutsDetail,
    workoutCalendar, activityRings, routes, ecgRecordings,
    isLoading, error, meta,
  } = useHealthData();

  const [activeTab, setActiveTab] = useState<Tab>("Overview");

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
            <div className="flex gap-1 overflow-x-auto pb-1 mb-6 border-b border-white/10">
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
                    <span className="ml-1 text-xs bg-indigo-500/20 text-indigo-400 rounded-full px-1.5 py-0.5">{routes.length}</span>
                  )}
                  {tab === "ECG" && ecgRecordings.length > 0 && (
                    <span className="ml-1 text-xs bg-red-500/20 text-red-400 rounded-full px-1.5 py-0.5">{ecgRecordings.length}</span>
                  )}
                </button>
              ))}
            </div>

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
                    <ActivityTrendsChart data={weeklyTrends} />
                    <div className="grid md:grid-cols-2 gap-4">
                      <WorkoutConsistencyChart data={monthlySummary} />
                      <HRZoneChart data={hrZones} />
                    </div>
                    <HeartMetricsChart data={weeklyTrends} />
                    <div className="grid md:grid-cols-2 gap-4">
                      <RecoveryScoreChart data={weeklyTrends} />
                      <WorkoutTypesChart data={workoutTypes} />
                    </div>
                    <InsightsPanel kpis={kpis} />
                  </div>
                )}

                {activeTab === "Activity" && (
                  <div className="space-y-4">
                    <DailyStepsChart data={dailyActivity} />
                    <div className="grid md:grid-cols-2 gap-4">
                      <StackedCaloriesChart data={dailyActivity} />
                      <ExerciseTimeChart data={dailyActivity} />
                    </div>
                    <WorkoutHeatmap data={workoutCalendar} />
                    <div className="grid md:grid-cols-2 gap-4">
                      <DayClassificationPie data={dailyActivity} />
                      <ActivityRingsChart data={activityRings} />
                    </div>
                  </div>
                )}

                {activeTab === "Heart" && (
                  <div className="space-y-4">
                    <FullHRChart data={dailyHeart} />
                    <SpO2Chart data={dailyHeart} />
                    <HeartMetricsChart data={weeklyTrends} />
                    <div className="grid md:grid-cols-2 gap-4">
                      <RecoveryScoreChart data={weeklyTrends} />
                      <HRZoneChart data={hrZones} />
                    </div>
                  </div>
                )}

                {activeTab === "Performance" && (
                  <div className="space-y-4">
                    <VO2MaxChart data={vo2max} />
                    <TrainingLoadChart data={trainingLoad} />
                    <div className="grid md:grid-cols-2 gap-4">
                      <WorkoutTypesChart data={workoutTypes} />
                      <PersonalBestsTable data={workoutsDetail} />
                    </div>
                    <MonthlyWorkoutTable data={workoutsDetail} />
                  </div>
                )}

                {activeTab === "Routes" && (
                  routes.length > 0
                    ? <RoutesTab routes={routes} />
                    : (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
                        <p className="text-gray-400 text-sm">No route data available</p>
                        <p className="text-gray-500 text-xs mt-1">Run parse_routes.py to generate route Parquet files.</p>
                      </div>
                    )
                )}

                {activeTab === "ECG" && (
                  ecgRecordings.length > 0
                    ? <ECGTab recordings={ecgRecordings} />
                    : (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
                        <p className="text-gray-400 text-sm">No ECG data available</p>
                        <p className="text-gray-500 text-xs mt-1">Run parse_ecg.py to generate ECG Parquet files.</p>
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

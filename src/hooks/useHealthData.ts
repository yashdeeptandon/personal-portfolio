"use client";

import { useEffect, useState } from "react";
import type {
  HealthData,
  HealthKPIs,
  HealthMeta,
  HRZone,
  MonthlyPoint,
  WeeklyTrend,
  WorkoutType,
  DailyActivity,
  DailyHeart,
  VO2MaxData,
  TrainingLoadWeek,
  WorkoutsDetail,
  WorkoutCalendarDay,
  ActivityRingDay,
  RouteSummary,
  ECGRecording,
  RunningAnalytics,
} from "@/types/health";

const BASE = "/api/health";

const INITIAL: HealthData = {
  meta: null,
  kpis: null,
  weeklyTrends: [],
  monthlySummary: [],
  hrZones: [],
  workoutTypes: [],
  dailyActivity: [],
  dailyHeart: [],
  vo2max: null,
  trainingLoad: [],
  workoutsDetail: null,
  workoutCalendar: [],
  activityRings: [],
  routes: [],
  ecgRecordings: [],
  runningAnalytics: null,
  isLoading: true,
  error: null,
};

export function useHealthData(): HealthData {
  const [state, setState] = useState<HealthData>(INITIAL);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch(`${BASE}/meta`).then<HealthMeta>((r) => r.json()),
      fetch(`${BASE}/kpis`).then<HealthKPIs>((r) => r.json()),
      fetch(`${BASE}/weekly_trends`).then<{ weeks: WeeklyTrend[] }>((r) => r.json()),
      fetch(`${BASE}/monthly_summary`).then<{ months: MonthlyPoint[] }>((r) => r.json()),
      fetch(`${BASE}/hr_zones`).then<{ all_time: HRZone[] }>((r) => r.json()),
      fetch(`${BASE}/workout_types`).then<{ types: WorkoutType[] }>((r) => r.json()),
      fetch(`${BASE}/daily_activity`).then<{ days: DailyActivity[] }>((r) => r.json()),
      fetch(`${BASE}/daily_heart`).then<{ days: DailyHeart[] }>((r) => r.json()),
      fetch(`${BASE}/vo2max`).then<VO2MaxData>((r) => r.json()),
      fetch(`${BASE}/training_load_detail`).then<{ weeks: TrainingLoadWeek[] }>((r) => r.json()),
      fetch(`${BASE}/workouts_detail`).then<WorkoutsDetail>((r) => r.json()),
      fetch(`${BASE}/workout_calendar`).then<{ days: WorkoutCalendarDay[] }>((r) => r.json()),
      fetch(`${BASE}/activity_rings_detail`).then<{ days: ActivityRingDay[] }>((r) => r.json()),
      fetch(`${BASE}/routes_summary`).then<{ routes: RouteSummary[] }>((r) => r.json()),
      fetch(`${BASE}/ecg_summary`).then<{ recordings: ECGRecording[] }>((r) => r.json()),
      fetch(`${BASE}/running_analytics`).then<RunningAnalytics>((r) => r.json()),
    ])
      .then(([meta, kpis, weekly, monthly, zones, types, dailyAct, dailyHrt, vo2, tl, wkDetail, calendar, rings, routesSummary, ecgSummary, runningAnalytics]) => {
        if (cancelled) return;
        setState({
          meta,
          kpis,
          weeklyTrends: weekly.weeks,
          monthlySummary: monthly.months,
          hrZones: zones.all_time,
          workoutTypes: types.types,
          dailyActivity: dailyAct.days,
          dailyHeart: dailyHrt.days,
          vo2max: vo2,
          trainingLoad: tl.weeks,
          workoutsDetail: wkDetail,
          workoutCalendar: calendar.days,
          activityRings: rings.days,
          routes: routesSummary.routes,
          ecgRecordings: ecgSummary.recordings,
          runningAnalytics,
          isLoading: false,
          error: null,
        });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState((s) => ({ ...s, isLoading: false, error: err.message }));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

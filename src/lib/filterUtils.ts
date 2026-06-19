import type { DailyActivity, DailyHeart, ActivityRingDay } from "@/types/health";

export type TimeWindow = "30d" | "90d" | "6m" | "1y" | "2y" | "all" | "custom";
export type Granularity = "auto" | "daily" | "weekly" | "monthly";

export interface FilterState {
  timeWindow: TimeWindow;
  customFrom: string;
  customTo: string;
  granularity: Granularity;
  stepThreshold: number;
  heartMetrics: { avg: boolean; max: boolean; resting: boolean; hrv: boolean; spo2: boolean };
  workoutTypeFilter: string[];
  routeMinKm: number;
  routeMaxKm: number;
  routeYear: number | null;
  ecgClassifications: string[];
  heatmapYear: number;
}

export const DEFAULT_FILTERS: FilterState = {
  timeWindow: "all",
  customFrom: "",
  customTo: "",
  granularity: "auto",
  stepThreshold: 7500,
  heartMetrics: { avg: true, max: true, resting: true, hrv: true, spo2: true },
  workoutTypeFilter: [],
  routeMinKm: 0,
  routeMaxKm: 9999,
  routeYear: null,
  ecgClassifications: [],
  heatmapYear: new Date().getFullYear(),
};

const WINDOW_DAYS: Record<string, number> = {
  "30d": 30, "90d": 90, "6m": 180, "1y": 365, "2y": 730,
};

export function computeDateRange(
  window: TimeWindow,
  dataTo: string,
  customFrom: string,
  customTo: string
): { from: string; to: string } {
  if (window === "custom") return { from: customFrom, to: customTo };
  if (window === "all") return { from: "", to: "" };
  const days = WINDOW_DAYS[window] ?? 0;
  const toDate = dataTo ? new Date(dataTo + "T00:00:00Z") : new Date();
  const fromDate = new Date(toDate);
  fromDate.setUTCDate(fromDate.getUTCDate() - days);
  return {
    from: fromDate.toISOString().slice(0, 10),
    to: toDate.toISOString().slice(0, 10),
  };
}

export function computeAutoGranularity(
  from: string,
  to: string
): "daily" | "weekly" | "monthly" {
  if (!from || !to) return "monthly";
  const days =
    (new Date(to + "T00:00:00Z").getTime() -
      new Date(from + "T00:00:00Z").getTime()) /
    86400000;
  if (days <= 90) return "daily";
  if (days <= 365) return "weekly";
  return "monthly";
}

export function applyDateFilter<T extends { date: string }>(
  data: T[],
  from: string,
  to: string
): T[] {
  if (!from && !to) return data;
  return data.filter(
    (d) => (!from || d.date >= from) && (!to || d.date <= to)
  );
}

function getMondayKey(dateStr: string): string {
  const dt = new Date(dateStr + "T00:00:00Z");
  const day = dt.getUTCDay();
  const offset = day === 0 ? 6 : day - 1;
  dt.setUTCDate(dt.getUTCDate() - offset);
  return dt.toISOString().slice(0, 10);
}

// ── Activity aggregation ────────────────────────────────────────────────────

export type AggregatedActivity = {
  date: string;
  steps: number;
  steps_rolling7: number | null;
  active_calories: number;
  basal_calories: number;
  exercise_min: number;
  distance_km: number;
  active_days?: number;
};

export function toWeeklyActivity(data: DailyActivity[]): AggregatedActivity[] {
  const map = new Map<
    string,
    {
      steps: number; rolling7: number; active_cal: number; basal_cal: number;
      exercise: number; distance: number; days: number; date: string;
    }
  >();
  data.forEach((d) => {
    const key = getMondayKey(d.date);
    const p = map.get(key) ?? {
      steps: 0, rolling7: 0, active_cal: 0, basal_cal: 0,
      exercise: 0, distance: 0, days: 0, date: key,
    };
    p.steps += d.steps ?? 0;
    p.rolling7 += d.steps_rolling7 ?? 0;
    p.active_cal += d.active_calories ?? 0;
    p.basal_cal += d.basal_calories ?? 0;
    p.exercise += d.exercise_min ?? 0;
    p.distance += d.distance_km ?? 0;
    p.days += 1;
    map.set(key, p);
  });
  return Array.from(map.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((w) => ({
      date: w.date,
      steps: Math.round(w.steps / w.days),
      steps_rolling7: Math.round(w.rolling7 / w.days),
      active_calories: Math.round(w.active_cal),
      basal_calories: Math.round(w.basal_cal),
      exercise_min: Math.round(w.exercise / w.days),
      distance_km: Math.round(w.distance * 10) / 10,
      active_days: w.days,
    }));
}

export function toMonthlyActivity(data: DailyActivity[]): AggregatedActivity[] {
  const map = new Map<
    string,
    {
      steps: number; rolling7: number; active_cal: number; basal_cal: number;
      exercise: number; distance: number; days: number; date: string;
    }
  >();
  data.forEach((d) => {
    const key = d.date.slice(0, 7) + "-01";
    const p = map.get(key) ?? {
      steps: 0, rolling7: 0, active_cal: 0, basal_cal: 0,
      exercise: 0, distance: 0, days: 0, date: key,
    };
    p.steps += d.steps ?? 0;
    p.rolling7 += d.steps_rolling7 ?? 0;
    p.active_cal += d.active_calories ?? 0;
    p.basal_cal += d.basal_calories ?? 0;
    p.exercise += d.exercise_min ?? 0;
    p.distance += d.distance_km ?? 0;
    p.days += 1;
    map.set(key, p);
  });
  return Array.from(map.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({
      date: m.date,
      steps: Math.round(m.steps / m.days),
      steps_rolling7: null,
      active_calories: Math.round(m.active_cal),
      basal_calories: Math.round(m.basal_cal),
      exercise_min: Math.round(m.exercise / m.days),
      distance_km: Math.round(m.distance * 10) / 10,
      active_days: m.days,
    }));
}

export function aggregateActivity(
  data: DailyActivity[],
  gran: "daily" | "weekly" | "monthly"
): AggregatedActivity[] {
  if (gran === "weekly") return toWeeklyActivity(data);
  if (gran === "monthly") return toMonthlyActivity(data);
  // daily — convert to same shape
  return data.map((d) => ({
    date: d.date,
    steps: d.steps ?? 0,
    steps_rolling7: d.steps_rolling7,
    active_calories: d.active_calories ?? 0,
    basal_calories: d.basal_calories ?? 0,
    exercise_min: d.exercise_min ?? 0,
    distance_km: d.distance_km ?? 0,
  }));
}

// ── Heart aggregation ────────────────────────────────────────────────────────

export type AggregatedHeart = {
  date: string;
  hr_avg: number | null;
  hr_max: number | null;
  resting_hr: number | null;
  hrv_avg: number | null;
  recovery_score: number | null;
  spo2: number | null;
};

export function toWeeklyHeart(data: DailyHeart[]): AggregatedHeart[] {
  const map = new Map<
    string,
    {
      hr_avg: number[]; hr_max: number[]; resting: number[]; hrv: number[];
      recovery: number[]; spo2: number[]; date: string;
    }
  >();
  data.forEach((d) => {
    const key = getMondayKey(d.date);
    const p = map.get(key) ?? {
      hr_avg: [], hr_max: [], resting: [], hrv: [], recovery: [], spo2: [], date: key,
    };
    if (d.hr_avg !== null) p.hr_avg.push(d.hr_avg);
    if (d.hr_max !== null) p.hr_max.push(d.hr_max);
    if (d.resting_hr !== null) p.resting.push(d.resting_hr);
    if (d.hrv_avg !== null) p.hrv.push(d.hrv_avg);
    if (d.recovery_score !== null) p.recovery.push(d.recovery_score);
    if (d.spo2 !== null) p.spo2.push(d.spo2);
    map.set(key, p);
  });
  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10 : null;
  return Array.from(map.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((w) => ({
      date: w.date,
      hr_avg: avg(w.hr_avg),
      hr_max: avg(w.hr_max),
      resting_hr: avg(w.resting),
      hrv_avg: avg(w.hrv),
      recovery_score: avg(w.recovery),
      spo2: avg(w.spo2),
    }));
}

export function toMonthlyHeart(data: DailyHeart[]): AggregatedHeart[] {
  const map = new Map<
    string,
    {
      hr_avg: number[]; hr_max: number[]; resting: number[]; hrv: number[];
      recovery: number[]; spo2: number[]; date: string;
    }
  >();
  data.forEach((d) => {
    const key = d.date.slice(0, 7) + "-01";
    const p = map.get(key) ?? {
      hr_avg: [], hr_max: [], resting: [], hrv: [], recovery: [], spo2: [], date: key,
    };
    if (d.hr_avg !== null) p.hr_avg.push(d.hr_avg);
    if (d.hr_max !== null) p.hr_max.push(d.hr_max);
    if (d.resting_hr !== null) p.resting.push(d.resting_hr);
    if (d.hrv_avg !== null) p.hrv.push(d.hrv_avg);
    if (d.recovery_score !== null) p.recovery.push(d.recovery_score);
    if (d.spo2 !== null) p.spo2.push(d.spo2);
    map.set(key, p);
  });
  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10 : null;
  return Array.from(map.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({
      date: m.date,
      hr_avg: avg(m.hr_avg),
      hr_max: avg(m.hr_max),
      resting_hr: avg(m.resting),
      hrv_avg: avg(m.hrv),
      recovery_score: avg(m.recovery),
      spo2: avg(m.spo2),
    }));
}

// ── Activity rings aggregation ───────────────────────────────────────────────

export type AggregatedRings = {
  date: string;
  move: number | null;
  exercise: number | null;
  stand: number | null;
};

export function toWeeklyRings(data: ActivityRingDay[]): AggregatedRings[] {
  const map = new Map<string, { move: number[]; exercise: number[]; stand: number[]; date: string }>();
  data.forEach((d) => {
    const key = getMondayKey(d.date);
    const p = map.get(key) ?? { move: [], exercise: [], stand: [], date: key };
    if (d.move_pct !== null) p.move.push(d.move_pct);
    if (d.exercise_pct !== null) p.exercise.push(d.exercise_pct);
    if (d.stand_pct !== null) p.stand.push(d.stand_pct);
    map.set(key, p);
  });
  const avg = (arr: number[]) => arr.length ? Math.min(Math.round(arr.reduce((a, b) => a + b, 0) / arr.length), 150) : null;
  return Array.from(map.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((w) => ({ date: w.date, move: avg(w.move), exercise: avg(w.exercise), stand: avg(w.stand) }));
}

export function toMonthlyRings(data: ActivityRingDay[]): AggregatedRings[] {
  const map = new Map<string, { move: number[]; exercise: number[]; stand: number[]; date: string }>();
  data.forEach((d) => {
    const key = d.date.slice(0, 7) + "-01";
    const p = map.get(key) ?? { move: [], exercise: [], stand: [], date: key };
    if (d.move_pct !== null) p.move.push(d.move_pct);
    if (d.exercise_pct !== null) p.exercise.push(d.exercise_pct);
    if (d.stand_pct !== null) p.stand.push(d.stand_pct);
    map.set(key, p);
  });
  const avg = (arr: number[]) => arr.length ? Math.min(Math.round(arr.reduce((a, b) => a + b, 0) / arr.length), 150) : null;
  return Array.from(map.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({ date: m.date, move: avg(m.move), exercise: avg(m.exercise), stand: avg(m.stand) }));
}

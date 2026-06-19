export interface HealthKPIs {
  avg_steps_per_day: number | null;
  avg_active_calories_per_day: number | null;
  total_workouts: number;
  current_streak_days: number;
  longest_streak_days: number;
  latest_vo2max: number | null;
  consistency_score: number | null;
  resting_hr_avg_30d: number | null;
  hrv_avg_30d: number | null;
  recovery_score_avg_30d: number | null;
  total_distance_km: number | null;
  workout_days_this_month: number;
}

export interface WeeklyTrend {
  week_start: string;
  steps_avg: number | null;
  active_calories_avg: number | null;
  exercise_min_avg: number | null;
  workout_days: number;
  resting_hr_avg: number | null;
  hrv_avg: number | null;
  recovery_avg: number | null;
  training_load: number | null;
  distance_km: number | null;
}

export interface MonthlyPoint {
  month: string;
  steps_avg_per_day: number | null;
  active_calories_avg: number | null;
  workout_days: number;
  workout_count: number;
  avg_resting_hr: number | null;
  avg_hrv: number | null;
  avg_vo2max: number | null;
  distance_km: number | null;
  rings_closed_days: number;
}

export interface HRZone {
  zone: string;
  pct: number;
  color: string;
}

export interface WorkoutType {
  type: string;
  count: number;
  total_duration_min: number | null;
  total_calories: number | null;
  avg_hr: number | null;
  total_distance_km: number | null;
}

export interface HealthMeta {
  generated_at: string;
  data_from: string;
  data_to: string;
  schema_version: number;
}

// New — daily granularity
export interface DailyActivity {
  date: string;
  steps: number | null;
  steps_rolling7: number | null;
  active: boolean;
  sedentary: boolean;
  active_calories: number | null;
  basal_calories: number | null;
  exercise_min: number | null;
  distance_km: number | null;
}

export interface DailyHeart {
  date: string;
  hr_avg: number | null;
  hr_max: number | null;
  hr_min: number | null;
  resting_hr: number | null;
  hrv_avg: number | null;
  recovery_score: number | null;
  spo2: number | null;
}

export interface VO2MaxReading {
  date: string;
  value: number | null;
}

export interface VO2MaxMonthly {
  month: string;
  avg: number | null;
}

export interface VO2MaxRegression {
  date_start: string;
  date_end: string;
  y_start: number;
  y_end: number;
  r_squared: number;
  trend: "improving" | "declining";
}

export interface VO2MaxData {
  readings: VO2MaxReading[];
  monthly: VO2MaxMonthly[];
  regression: VO2MaxRegression | null;
}

export interface TrainingLoadWeek {
  week: string;
  load: number | null;
  rolling4: number | null;
  pct_change: number | null;
  spike: boolean;
}

export interface PersonalBest {
  value: number;
  unit: string;
  date: string;
  type: string;
}

export interface MonthlyWorkoutSummary {
  month: string;
  workout_days: number;
  total_workouts: number;
  total_min: number | null;
  total_cal: number | null;
  avg_hr: number | null;
}

export interface WorkoutsDetail {
  personal_bests: {
    longest_workout?: PersonalBest;
    most_calories?: PersonalBest;
    longest_distance?: PersonalBest;
    peak_heart_rate_workout?: PersonalBest;
  };
  monthly_summary: MonthlyWorkoutSummary[];
}

export interface WorkoutCalendarDay {
  date: string;
  count: number;
  weekday: number;
  week_of_year: number;
  year: number;
}

export interface ActivityRingDay {
  date: string;
  move_pct: number | null;
  exercise_pct: number | null;
  stand_pct: number | null;
  all_closed: boolean;
}

// Routes
export interface RouteSummary {
  id: string;
  date: string;
  distance_km: number | null;
  duration_min: number | null;
  elevation_gain_m: number | null;
  avg_pace_min_per_km: number | null;
  avg_speed_ms: number | null;
  max_speed_ms: number | null;
  n_points: number;
}

export interface RouteTrackPoint {
  lat: number;
  lon: number;
  ele: number | null;
  speed_kmh: number | null;
}

export interface RouteTrackData {
  id: string;
  points: RouteTrackPoint[];
}

// ECG
export interface ECGRecording {
  id: string;
  date: string;
  classification: string;
  device: string;
  duration_sec: number | null;
  symptoms: string | null;
  sample_rate_hz: number;
  n_samples: number;
  has_waveform: boolean;
}

export interface ECGWaveform {
  id: string;
  sample_rate_hz: number;
  voltage_uv: number[];
}

// Main hook return
export interface HealthData {
  meta: HealthMeta | null;
  kpis: HealthKPIs | null;
  weeklyTrends: WeeklyTrend[];
  monthlySummary: MonthlyPoint[];
  hrZones: HRZone[];
  workoutTypes: WorkoutType[];
  dailyActivity: DailyActivity[];
  dailyHeart: DailyHeart[];
  vo2max: VO2MaxData | null;
  trainingLoad: TrainingLoadWeek[];
  workoutsDetail: WorkoutsDetail | null;
  workoutCalendar: WorkoutCalendarDay[];
  activityRings: ActivityRingDay[];
  routes: RouteSummary[];
  ecgRecordings: ECGRecording[];
  isLoading: boolean;
  error: string | null;
}

"""Compute all derived metrics from Parquet data.

All functions accept DataFrames loaded from data/*.parquet and return
clean DataFrames or scalar values ready for the dashboard.
"""

import numpy as np
import pandas as pd
from pathlib import Path
from scipy import stats

DATA_DIR = Path(__file__).parent.parent / "data"

MAX_HR = 195  # 220 - age(25)

HR_ZONES = [
    ("Z1 (50–60%)", 0.50, 0.60),
    ("Z2 (60–70%)", 0.60, 0.70),
    ("Z3 (70–80%)", 0.70, 0.80),
    ("Z4 (80–90%)", 0.80, 0.90),
    ("Z5 (90–100%)", 0.90, 1.00),
]


# ---------------------------------------------------------------------------
# Loaders
# ---------------------------------------------------------------------------

def load_records(data_dir=DATA_DIR) -> pd.DataFrame:
    return pd.read_parquet(data_dir / "records.parquet")


def load_workouts(data_dir=DATA_DIR) -> pd.DataFrame:
    return pd.read_parquet(data_dir / "workouts.parquet")


def load_activity_summaries(data_dir=DATA_DIR) -> pd.DataFrame:
    path = data_dir / "activity_summaries.parquet"
    return pd.read_parquet(path) if path.exists() else pd.DataFrame()


def load_routes(data_dir=DATA_DIR) -> pd.DataFrame:
    path = data_dir / "routes.parquet"
    return pd.read_parquet(path) if path.exists() else pd.DataFrame()


def load_ecg(data_dir=DATA_DIR) -> pd.DataFrame:
    path = data_dir / "ecg.parquet"
    return pd.read_parquet(path) if path.exists() else pd.DataFrame()


def _filter_type(df: pd.DataFrame, metric: str) -> pd.DataFrame:
    return df[df["type"] == metric].copy()


def _daily(df: pd.DataFrame, agg: str = "sum") -> pd.Series:
    grouped = df.groupby("date")["value"]
    return getattr(grouped, agg)()


# ---------------------------------------------------------------------------
# Activity Metrics
# ---------------------------------------------------------------------------

def daily_steps(records: pd.DataFrame) -> pd.DataFrame:
    df = _filter_type(records, "StepCount")
    daily = _daily(df, "sum").rename("steps").reset_index()
    daily["rolling7"] = daily["steps"].rolling(7, min_periods=1).mean()
    daily["active"] = daily["steps"] >= 7500
    daily["sedentary"] = daily["steps"] < 5000
    return daily


def daily_calories(records: pd.DataFrame) -> pd.DataFrame:
    active = _filter_type(records, "ActiveEnergyBurned")
    basal = _filter_type(records, "BasalEnergyBurned")
    daily_active = _daily(active, "sum").rename("active_calories")
    daily_basal = _daily(basal, "sum").rename("basal_calories")
    df = pd.concat([daily_active, daily_basal], axis=1).reset_index()
    df["total_calories"] = df[["active_calories", "basal_calories"]].sum(axis=1, min_count=1)
    df["rolling7_active"] = df["active_calories"].rolling(7, min_periods=1).mean()
    return df


def daily_exercise_time(records: pd.DataFrame) -> pd.DataFrame:
    df = _filter_type(records, "ExerciseTime")
    daily = _daily(df, "sum").rename("exercise_min").reset_index()
    daily["rolling7"] = daily["exercise_min"].rolling(7, min_periods=1).mean()
    return daily


def daily_distance(records: pd.DataFrame) -> pd.DataFrame:
    df = _filter_type(records, "WalkingRunningDistance")
    return _daily(df, "sum").rename("distance_km").reset_index()


def daily_flights(records: pd.DataFrame) -> pd.DataFrame:
    df = _filter_type(records, "FlightsClimbed")
    return _daily(df, "sum").rename("flights").reset_index()


def workout_day_stats(workouts: pd.DataFrame) -> dict:
    if workouts.empty:
        return {"monthly": pd.DataFrame(), "yearly": pd.DataFrame(),
                "current_streak": 0, "longest_streak": 0}

    workout_dates = workouts["date"].dt.date.drop_duplicates().sort_values()
    monthly = workouts.groupby([workouts["date"].dt.to_period("M")])["date"].nunique().rename("workout_days").reset_index()
    monthly["date"] = monthly["date"].dt.to_timestamp()
    yearly = workouts.groupby([workouts["date"].dt.year])["date"].nunique().rename("workout_days").reset_index()
    yearly.rename(columns={"date": "year"}, inplace=True)

    current_streak, longest_streak = _compute_streaks(workout_dates.tolist())

    return {
        "monthly": monthly,
        "yearly": yearly,
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "total_workouts": len(workouts),
    }


def _compute_streaks(dates: list):
    if not dates:
        return 0, 0
    from datetime import date, timedelta
    today = date.today()
    dates_set = set(dates)

    # Current streak (backward from today or yesterday)
    current = 0
    d = today
    while d in dates_set:
        current += 1
        d -= timedelta(days=1)
    if current == 0:
        d = today - timedelta(days=1)
        while d in dates_set:
            current += 1
            d -= timedelta(days=1)

    # Longest streak
    longest = 0
    streak = 1
    sorted_dates = sorted(dates_set)
    for i in range(1, len(sorted_dates)):
        if (sorted_dates[i] - sorted_dates[i - 1]).days == 1:
            streak += 1
            longest = max(longest, streak)
        else:
            streak = 1
    longest = max(longest, streak)

    return current, longest


def consistency_score(workouts: pd.DataFrame, records: pd.DataFrame) -> float:
    from datetime import date, timedelta
    today = pd.Timestamp(date.today(), tz="UTC")
    since = today - pd.Timedelta(days=30)

    wk_30 = workouts[workouts["date"] >= since]
    workout_score = min(wk_30["date"].dt.date.nunique() / 30 * 100, 100)

    steps_df = daily_steps(records)
    steps_df["date"] = pd.to_datetime(steps_df["date"], utc=True)
    steps_30 = steps_df[steps_df["date"] >= since]
    avg_steps = steps_30["steps"].mean() if not steps_30.empty else 0
    steps_score = min(avg_steps / 10000 * 100, 100)

    ex_df = daily_exercise_time(records)
    ex_df["date"] = pd.to_datetime(ex_df["date"], utc=True)
    ex_30 = ex_df[ex_df["date"] >= since]
    avg_ex = ex_30["exercise_min"].mean() if not ex_30.empty else 0
    exercise_score = min(avg_ex / 30 * 100, 100)

    return round(0.4 * workout_score + 0.3 * steps_score + 0.3 * exercise_score, 1)


# ---------------------------------------------------------------------------
# Heart & Performance Metrics
# ---------------------------------------------------------------------------

def daily_heart_rate(records: pd.DataFrame) -> pd.DataFrame:
    df = _filter_type(records, "HeartRate")
    avg = _daily(df, "mean").rename("hr_avg")
    mx = _daily(df, "max").rename("hr_max")
    mn = _daily(df, "min").rename("hr_min")
    result = pd.concat([avg, mx, mn], axis=1).reset_index()
    result["rolling7_avg"] = result["hr_avg"].rolling(7, min_periods=1).mean()
    return result


def daily_resting_hr(records: pd.DataFrame) -> pd.DataFrame:
    df = _filter_type(records, "RestingHeartRate")
    if df.empty:
        hr_df = _filter_type(records, "HeartRate")
        morning = hr_df[hr_df["startDate"].dt.hour.between(4, 8)]
        return _daily(morning, "mean").rename("resting_hr").reset_index()
    return _daily(df, "mean").rename("resting_hr").reset_index()


def daily_hrv(records: pd.DataFrame) -> pd.DataFrame:
    df = _filter_type(records, "HRV")
    if df.empty:
        return pd.DataFrame(columns=["date", "hrv_avg"])
    result = _daily(df, "mean").rename("hrv_avg").reset_index()
    result["rolling7"] = result["hrv_avg"].rolling(7, min_periods=1).mean()
    return result


def hr_zone_distribution(records: pd.DataFrame) -> pd.DataFrame:
    df = _filter_type(records, "HeartRate").dropna(subset=["value"])
    total = len(df)
    if total == 0:
        return pd.DataFrame({"zone": [], "count": [], "pct": []})

    rows = []
    for name, lo, hi in HR_ZONES:
        lo_bpm = MAX_HR * lo
        hi_bpm = MAX_HR * hi
        mask = (df["value"] >= lo_bpm) & (df["value"] < hi_bpm)
        cnt = mask.sum()
        rows.append({"zone": name, "count": int(cnt), "pct": cnt / total * 100})
    return pd.DataFrame(rows)


def vo2max_trend(records: pd.DataFrame) -> pd.DataFrame:
    df = _filter_type(records, "VO2Max").dropna(subset=["value"])
    if df.empty:
        return pd.DataFrame(columns=["date", "vo2max", "monthly_avg"])
    daily = df.groupby("date")["value"].mean().rename("vo2max").reset_index()
    monthly = df.groupby(df["date"].dt.to_period("M"))["value"].mean().rename("monthly_avg")
    monthly.index = monthly.index.to_timestamp()
    monthly = monthly.reset_index().rename(columns={"date": "month"})
    return daily, monthly


def training_load(workouts: pd.DataFrame) -> pd.DataFrame:
    df = workouts.dropna(subset=["heartRateAvg", "duration"]).copy()
    df["duration_hours"] = df["duration"] / 60
    df["daily_load"] = df["heartRateAvg"] * df["duration_hours"] * 60
    weekly = df.groupby(df["date"].dt.to_period("W"))["daily_load"].sum().rename("weekly_load").reset_index()
    weekly["date"] = weekly["date"].dt.to_timestamp()
    weekly["pct_change"] = weekly["weekly_load"].pct_change() * 100
    weekly["spike"] = weekly["pct_change"] > 20
    return weekly


def recovery_score(records: pd.DataFrame) -> pd.DataFrame:
    hrv_df = daily_hrv(records)
    rhr_df = daily_resting_hr(records)
    if hrv_df.empty or rhr_df.empty:
        return pd.DataFrame()

    df = hrv_df.merge(rhr_df, on="date", how="inner")
    hrv_min, hrv_max = df["hrv_avg"].min(), df["hrv_avg"].max()
    rhr_min, rhr_max = df["resting_hr"].min(), df["resting_hr"].max()

    def norm(s, lo, hi):
        if hi == lo:
            return pd.Series(50.0, index=s.index)
        return (s - lo) / (hi - lo) * 100

    df["hrv_score"] = norm(df["hrv_avg"], hrv_min, hrv_max)
    df["rhr_score"] = norm(rhr_max - df["resting_hr"], 0, rhr_max - rhr_min)
    df["recovery_score"] = 0.6 * df["hrv_score"] + 0.4 * df["rhr_score"]
    return df[["date", "hrv_avg", "resting_hr", "hrv_score", "rhr_score", "recovery_score"]]


def vo2max_latest(records: pd.DataFrame):
    df = _filter_type(records, "VO2Max").dropna(subset=["value"])
    if df.empty:
        return None
    return float(df.sort_values("startDate").iloc[-1]["value"])


def activity_ring_completion(activity_summaries: pd.DataFrame) -> pd.DataFrame:
    df = activity_summaries.copy()
    if df.empty:
        return df
    for col, goal in [("activeEnergyBurned", "activeEnergyBurnedGoal"),
                      ("appleExerciseTime", "appleExerciseTimeGoal"),
                      ("appleStandHours", "appleStandHoursGoal")]:
        pct_col = col.replace("apple", "").replace("HKQ", "") + "_pct"
        df[pct_col] = (df[col] / df[goal].replace(0, np.nan) * 100).clip(0, 150)
    df["all_rings_closed"] = (
        (df["activeEnergyBurned"] >= df["activeEnergyBurnedGoal"]) &
        (df["appleExerciseTime"] >= df["appleExerciseTimeGoal"]) &
        (df["appleStandHours"] >= df["appleStandHoursGoal"])
    )
    return df


# ---------------------------------------------------------------------------
# Auto-generated insights
# ---------------------------------------------------------------------------

def generate_insights(records: pd.DataFrame, workouts: pd.DataFrame) -> list:
    from datetime import date, timedelta
    today = pd.Timestamp(date.today(), tz="UTC")
    insights = []

    def week(offset=0):
        start = today - pd.Timedelta(days=today.weekday() + 7 * (1 - offset))
        end = start + pd.Timedelta(days=7)
        return start, end

    # Workout frequency change
    try:
        w0s, w0e = week(0)
        w1s, w1e = week(-1)
        this_wk = workouts[(workouts["date"] >= w0s) & (workouts["date"] < w0e)]["date"].dt.date.nunique()
        last_wk = workouts[(workouts["date"] >= w1s) & (workouts["date"] < w1e)]["date"].dt.date.nunique()
        if last_wk > 0:
            pct = (this_wk - last_wk) / last_wk * 100
            direction = "increased" if pct >= 0 else "decreased"
            color = "green" if pct >= 0 else "orange"
            insights.append({"text": f"Workout frequency {direction} by {abs(pct):.0f}% this week ({this_wk} vs {last_wk} days last week)", "color": color})
    except Exception:
        pass

    # Resting HR trend
    try:
        rhr = daily_resting_hr(records)
        rhr["date"] = pd.to_datetime(rhr["date"], utc=True)
        this_rhr = rhr[rhr["date"] >= today - pd.Timedelta(days=7)]["resting_hr"].mean()
        prev_rhr = rhr[(rhr["date"] >= today - pd.Timedelta(days=14)) & (rhr["date"] < today - pd.Timedelta(days=7))]["resting_hr"].mean()
        if pd.notna(this_rhr) and pd.notna(prev_rhr):
            diff = this_rhr - prev_rhr
            if abs(diff) >= 2:
                color = "orange" if diff > 0 else "green"
                direction = "increased" if diff > 0 else "decreased"
                insights.append({"text": f"Resting HR {direction} by {abs(diff):.1f} bpm this week — {'possible fatigue' if diff > 0 else 'good recovery sign'}", "color": color})
    except Exception:
        pass

    # Training load spike
    try:
        tl = training_load(workouts)
        spikes = tl[tl["spike"]]
        if not spikes.empty:
            last_spike = spikes.iloc[-1]
            insights.append({"text": f"Training load spike detected (+{last_spike['pct_change']:.0f}% week-over-week)", "color": "red"})
    except Exception:
        pass

    # VO2 max trend
    try:
        v = _filter_type(records, "VO2Max").dropna(subset=["value"])
        if len(v) >= 5:
            v = v.sort_values("startDate")
            x = np.arange(len(v))
            slope, *_ = stats.linregress(x, v["value"])
            direction = "upward" if slope > 0 else "downward"
            color = "green" if slope > 0 else "orange"
            insights.append({"text": f"VO2 Max trending {direction} ({slope * 30:+.2f} ml/kg/min per month)", "color": color})
    except Exception:
        pass

    # Consistency score
    try:
        score = consistency_score(workouts, records)
        color = "green" if score >= 70 else ("orange" if score >= 40 else "red")
        insights.append({"text": f"30-day Consistency Score: {score}/100", "color": color})
    except Exception:
        pass

    return insights

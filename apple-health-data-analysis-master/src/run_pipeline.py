"""Full Apple Health pipeline: parse XML/routes/ECG → Parquet → JSON.

Usage:
  python src/run_pipeline.py \\
    --input-dir /tmp/health_upload/apple_health_export \\
    --data-dir  /tmp/health_upload/data \\
    --output-dir /tmp/health_upload/json

Expects input-dir to contain:
  export.xml
  workout-routes/  (GPX files)
  electrocardiograms/  (CSV files)

Outputs JSON files to output-dir (same structure as public/health-data/).
Emits progress lines to stdout: PROGRESS:<n>:<message>
"""

import argparse
import json
import math
import sys
from datetime import datetime, timezone, date, timedelta
from pathlib import Path

import numpy as np
import pandas as pd
from scipy import stats


def log_progress(pct: int, msg: str):
    print(f"PROGRESS:{pct}:{msg}", flush=True)


def safe(val):
    """Convert numpy/pandas NaN/Inf to None for JSON serialization."""
    if val is None:
        return None
    if isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
        return None
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        f = float(val)
        return None if (math.isnan(f) or math.isinf(f)) else f
    if isinstance(val, (np.bool_,)):
        return bool(val)
    if isinstance(val, (pd.Timestamp,)):
        return val.strftime("%Y-%m-%d") if not pd.isnull(val) else None
    return val


def df_to_records(df: pd.DataFrame, date_col="date") -> list:
    rows = []
    for _, row in df.iterrows():
        rec = {}
        for k, v in row.items():
            if k == date_col and hasattr(v, "strftime"):
                rec[k] = v.strftime("%Y-%m-%d") if not pd.isnull(v) else None
            else:
                rec[k] = safe(v)
        rows.append(rec)
    return rows


def run_pipeline(input_dir: Path, data_dir: Path, output_dir: Path):
    sys.path.insert(0, str(Path(__file__).parent))
    from parse_xml import run as parse_xml_run
    from parse_routes import parse_routes
    from parse_ecg import parse_ecg

    data_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(parents=True, exist_ok=True)

    xml_path = input_dir / "export.xml"
    routes_dir = input_dir / "workout-routes"
    ecg_dir = input_dir / "electrocardiograms"

    # Step 1: Parse XML
    log_progress(5, "Parsing Apple Health XML (this may take several minutes)...")
    if xml_path.exists():
        records, workouts, activity = parse_xml_run(
            xml_path=xml_path, data_dir=data_dir, verbose=False
        )
    else:
        print(f"WARNING: export.xml not found at {xml_path}", flush=True)
        records = pd.DataFrame()
        workouts = pd.DataFrame()
        activity = pd.DataFrame()

    log_progress(35, "XML parsed. Processing routes...")

    # Step 2: Parse routes
    if routes_dir.exists():
        parse_routes(routes_dir=routes_dir, data_dir=data_dir, verbose=False)
    else:
        print(f"WARNING: workout-routes not found at {routes_dir}", flush=True)

    log_progress(55, "Routes done. Processing ECG...")

    # Step 3: Parse ECG
    if ecg_dir.exists():
        parse_ecg(ecg_dir=ecg_dir, data_dir=data_dir, verbose=False)
    else:
        print(f"WARNING: electrocardiograms not found at {ecg_dir}", flush=True)

    log_progress(70, "ECG done. Computing metrics and exporting JSON...")

    # Reload Parquet files (parse functions may have returned early)
    def load(name):
        p = data_dir / name
        return pd.read_parquet(p) if p.exists() else pd.DataFrame()

    records = load("records.parquet")
    workouts = load("workouts.parquet")
    activity = load("activity_summaries.parquet")
    routes_df = load("routes.parquet")
    ecg_df = load("ecg.parquet")
    route_tracks_df = load("route_tracks.parquet")

    MAX_HR = 195

    def _filter_type(df, metric):
        return df[df["type"] == metric].copy() if not df.empty and "type" in df.columns else pd.DataFrame()

    def _daily(df, agg="sum"):
        if df.empty or "date" not in df.columns:
            return pd.Series(dtype=float)
        return getattr(df.groupby("date")["value"], agg)()

    # -----------------------------------------------------------------------
    # meta.json
    # -----------------------------------------------------------------------
    data_from = None
    data_to = None
    if not records.empty and "date" in records.columns:
        data_from = str(records["date"].min().date()) if pd.notna(records["date"].min()) else None
        data_to = str(records["date"].max().date()) if pd.notna(records["date"].max()) else None

    meta = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "data_from": data_from,
        "data_to": data_to,
        "schema_version": 3,
    }
    _write_json(output_dir / "meta.json", meta)

    # -----------------------------------------------------------------------
    # kpis.json
    # -----------------------------------------------------------------------
    steps_s = _daily(_filter_type(records, "StepCount"), "sum")
    avg_steps = float(steps_s.mean()) if not steps_s.empty else 0
    active_cal_s = _daily(_filter_type(records, "ActiveEnergyBurned"), "sum")
    avg_cal = float(active_cal_s.mean()) if not active_cal_s.empty else 0

    total_workouts = len(workouts)
    current_streak, longest_streak = 0, 0
    if not workouts.empty and "date" in workouts.columns:
        workout_dates = sorted(workouts["date"].dt.date.drop_duplicates().tolist())
        current_streak, longest_streak = _compute_streaks(workout_dates)

    vo2_latest = None
    vo2_df = _filter_type(records, "VO2Max").dropna(subset=["value"]) if not records.empty else pd.DataFrame()
    if not vo2_df.empty and "startDate" in vo2_df.columns:
        vo2_latest = float(vo2_df.sort_values("startDate").iloc[-1]["value"])

    consistency = _consistency_score(records, workouts)

    rhr_s = _daily(_filter_type(records, "RestingHeartRate"), "mean")
    hrv_s = _daily(_filter_type(records, "HRV"), "mean")
    today = pd.Timestamp(date.today(), tz="UTC")
    since_30 = today - pd.Timedelta(days=30)

    def _last30_mean(series):
        if series.empty:
            return None
        df_ = series.reset_index()
        df_["date"] = pd.to_datetime(df_["date"], utc=True)
        sub = df_[df_["date"] >= since_30]
        v = sub.iloc[:, 1].mean() if not sub.empty else None
        return safe(v)

    recovery_df = _recovery_score_df(records)
    recovery_30 = None
    if not recovery_df.empty and "recovery_score" in recovery_df.columns:
        rec_30 = recovery_df.copy()
        rec_30["date"] = pd.to_datetime(rec_30["date"], utc=True)
        sub = rec_30[rec_30["date"] >= since_30]
        recovery_30 = safe(sub["recovery_score"].mean()) if not sub.empty else None

    dist_km = 0.0
    dist_s = _daily(_filter_type(records, "WalkingRunningDistance"), "sum")
    if not dist_s.empty:
        dist_km = float(dist_s.sum())

    wdays_month = 0
    if not workouts.empty and "date" in workouts.columns:
        first_of_month = pd.Timestamp(date.today().replace(day=1), tz="UTC")
        wdays_month = int(workouts[workouts["date"] >= first_of_month]["date"].dt.date.nunique())

    kpis = {
        "avg_steps_per_day": safe(round(avg_steps)),
        "avg_active_calories_per_day": safe(round(avg_cal)),
        "total_workouts": total_workouts,
        "current_streak_days": current_streak,
        "longest_streak_days": longest_streak,
        "latest_vo2max": safe(round(vo2_latest, 1)) if vo2_latest else None,
        "consistency_score": safe(consistency),
        "resting_hr_avg_30d": _last30_mean(rhr_s),
        "hrv_avg_30d": _last30_mean(hrv_s),
        "recovery_score_avg_30d": recovery_30,
        "total_distance_km": safe(round(dist_km, 1)),
        "workout_days_this_month": wdays_month,
    }
    _write_json(output_dir / "kpis.json", kpis)

    # -----------------------------------------------------------------------
    # weekly_trends.json
    # -----------------------------------------------------------------------
    weeks_data = _build_weekly_trends(records, workouts)
    _write_json(output_dir / "weekly_trends.json", {"weeks": weeks_data})

    # -----------------------------------------------------------------------
    # monthly_summary.json
    # -----------------------------------------------------------------------
    months_data = _build_monthly_summary(records, workouts, activity)
    _write_json(output_dir / "monthly_summary.json", {"months": months_data})

    # -----------------------------------------------------------------------
    # hr_zones.json
    # -----------------------------------------------------------------------
    hr_zones = _build_hr_zones(records, MAX_HR)
    _write_json(output_dir / "hr_zones.json", {"all_time": hr_zones})

    # -----------------------------------------------------------------------
    # workout_types.json
    # -----------------------------------------------------------------------
    wk_types = _build_workout_types(workouts)
    _write_json(output_dir / "workout_types.json", {"types": wk_types})

    # -----------------------------------------------------------------------
    # daily_activity.json
    # -----------------------------------------------------------------------
    daily_act = _build_daily_activity(records)
    _write_json(output_dir / "daily_activity.json", {"days": daily_act})

    # -----------------------------------------------------------------------
    # daily_heart.json
    # -----------------------------------------------------------------------
    daily_heart = _build_daily_heart(records)
    _write_json(output_dir / "daily_heart.json", {"days": daily_heart})

    # -----------------------------------------------------------------------
    # vo2max.json
    # -----------------------------------------------------------------------
    vo2_data = _build_vo2max(records)
    _write_json(output_dir / "vo2max.json", vo2_data)

    # -----------------------------------------------------------------------
    # training_load_detail.json
    # -----------------------------------------------------------------------
    tl_data = _build_training_load(workouts)
    _write_json(output_dir / "training_load_detail.json", {"weeks": tl_data})

    # -----------------------------------------------------------------------
    # workouts_detail.json
    # -----------------------------------------------------------------------
    wk_detail = _build_workouts_detail(workouts)
    _write_json(output_dir / "workouts_detail.json", wk_detail)

    # -----------------------------------------------------------------------
    # workout_calendar.json
    # -----------------------------------------------------------------------
    wk_cal = _build_workout_calendar(workouts)
    _write_json(output_dir / "workout_calendar.json", {"days": wk_cal})

    # -----------------------------------------------------------------------
    # running_analytics.json
    # -----------------------------------------------------------------------
    running_data = _build_running_analytics(workouts, routes_df)
    _write_json(output_dir / "running_analytics.json", running_data)

    # -----------------------------------------------------------------------
    # activity_rings_detail.json
    # -----------------------------------------------------------------------
    rings_detail = _build_activity_rings(activity)
    _write_json(output_dir / "activity_rings_detail.json", {"days": rings_detail})

    # -----------------------------------------------------------------------
    # routes_summary.json + individual route track JSONs
    # -----------------------------------------------------------------------
    routes_summary, route_tracks_by_id = _build_routes(routes_df, route_tracks_df)
    _write_json(output_dir / "routes_summary.json", {"routes": routes_summary})
    rt_dir = output_dir / "route_tracks"
    rt_dir.mkdir(exist_ok=True)
    for route_id, track_data in route_tracks_by_id.items():
        _write_json(rt_dir / f"{route_id}.json", {"id": route_id, "points": track_data})

    # -----------------------------------------------------------------------
    # ecg_summary.json + individual waveform JSONs
    # -----------------------------------------------------------------------
    ecg_waveform_src = data_dir / "ecg_waveforms"
    ecg_summary, ecg_waveforms = _build_ecg(ecg_df, ecg_waveform_src)
    _write_json(output_dir / "ecg_summary.json", {"recordings": ecg_summary})
    ecg_dir_out = output_dir / "ecg_waveforms"
    ecg_dir_out.mkdir(exist_ok=True)
    for rec_id, waveform_data in ecg_waveforms.items():
        _write_json(ecg_dir_out / f"{rec_id}.json", waveform_data)

    log_progress(100, "Pipeline complete.")
    return str(output_dir)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _write_json(path: Path, data):
    with open(path, "w") as f:
        json.dump(data, f, default=str, allow_nan=False)


def _compute_streaks(dates: list):
    if not dates:
        return 0, 0
    today = date.today()
    dates_set = set(dates)
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
    longest = 0
    streak = 1
    sorted_dates = sorted(dates_set)
    for i in range(1, len(sorted_dates)):
        if (sorted_dates[i] - sorted_dates[i - 1]).days == 1:
            streak += 1
            longest = max(longest, streak)
        else:
            streak = 1
    return current, max(longest, streak)


def _consistency_score(records, workouts):
    if records.empty or workouts.empty:
        return 0.0
    try:
        today = pd.Timestamp(date.today(), tz="UTC")
        since = today - pd.Timedelta(days=30)
        wk_30 = workouts[workouts["date"] >= since]
        workout_score = min(wk_30["date"].dt.date.nunique() / 30 * 100, 100)
        steps_s = _filter_steps(records)
        if not steps_s.empty:
            steps_s = steps_s.reset_index()
            steps_s["date"] = pd.to_datetime(steps_s["date"], utc=True)
            steps_30 = steps_s[steps_s["date"] >= since]
            avg_steps = steps_30["steps"].mean() if not steps_30.empty else 0
        else:
            avg_steps = 0
        steps_score = min(avg_steps / 10000 * 100, 100)
        ex_s = _filter_exercise(records)
        if not ex_s.empty:
            ex_s = ex_s.reset_index()
            ex_s["date"] = pd.to_datetime(ex_s["date"], utc=True)
            ex_30 = ex_s[ex_s["date"] >= since]
            avg_ex = ex_30["exercise_min"].mean() if not ex_30.empty else 0
        else:
            avg_ex = 0
        exercise_score = min(avg_ex / 30 * 100, 100)
        return round(0.4 * workout_score + 0.3 * steps_score + 0.3 * exercise_score, 1)
    except Exception:
        return 0.0


def _filter_steps(records):
    df = records[records["type"] == "StepCount"].copy() if not records.empty else pd.DataFrame()
    if df.empty:
        return pd.Series(dtype=float)
    return df.groupby("date")["value"].sum().rename("steps")


def _filter_exercise(records):
    df = records[records["type"] == "ExerciseTime"].copy() if not records.empty else pd.DataFrame()
    if df.empty:
        return pd.Series(dtype=float)
    return df.groupby("date")["value"].sum().rename("exercise_min")


def _recovery_score_df(records):
    try:
        if records.empty:
            return pd.DataFrame()
        hrv_df = records[records["type"] == "HRV"].groupby("date")["value"].mean().rename("hrv_avg").reset_index()
        rhr_df = records[records["type"] == "RestingHeartRate"].groupby("date")["value"].mean().rename("resting_hr").reset_index()
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
        return df[["date", "hrv_avg", "resting_hr", "recovery_score"]]
    except Exception:
        return pd.DataFrame()


def _build_weekly_trends(records, workouts):
    if records.empty:
        return []
    try:
        steps_s = records[records["type"] == "StepCount"].groupby("date")["value"].sum().rename("steps").reset_index()
        cal_s = records[records["type"] == "ActiveEnergyBurned"].groupby("date")["value"].sum().rename("active_calories").reset_index()
        ex_s = records[records["type"] == "ExerciseTime"].groupby("date")["value"].sum().rename("exercise_min").reset_index()
        rhr_s = records[records["type"] == "RestingHeartRate"].groupby("date")["value"].mean().rename("resting_hr").reset_index()
        hrv_s = records[records["type"] == "HRV"].groupby("date")["value"].mean().rename("hrv_avg").reset_index()
        dist_s = records[records["type"] == "WalkingRunningDistance"].groupby("date")["value"].sum().rename("distance_km").reset_index()

        base = steps_s.copy()
        for other in [cal_s, ex_s, rhr_s, hrv_s, dist_s]:
            base = base.merge(other, on="date", how="outer")
        base["date"] = pd.to_datetime(base["date"], utc=True)
        base = base.set_index("date").resample("W-MON", label="left").agg({
            "steps": "mean",
            "active_calories": "mean",
            "exercise_min": "mean",
            "resting_hr": "mean",
            "hrv_avg": "mean",
            "distance_km": "sum",
        }).reset_index()

        if not workouts.empty and "date" in workouts.columns:
            _wk = workouts.copy()
            _wk["date"] = pd.to_datetime(_wk["date"], utc=True)
            _wk["_d"] = _wk["date"]
            wk_days = _wk.set_index("date").resample("W-MON", label="left")["_d"].count().rename("workout_days").reset_index()
            wk_days["date"] = pd.to_datetime(wk_days["date"], utc=True)
            base = base.merge(wk_days, on="date", how="left")
        else:
            base["workout_days"] = 0

        rec_df = _recovery_score_df(records)
        if not rec_df.empty:
            rec_df["date"] = pd.to_datetime(rec_df["date"], utc=True)
            rec_weekly = rec_df.set_index("date").resample("W-MON", label="left")["recovery_score"].mean().rename("recovery_avg").reset_index()
            base = base.merge(rec_weekly, on="date", how="left")
        else:
            base["recovery_avg"] = None

        tl = _training_load_weekly(workouts)
        if not tl.empty:
            tl["date"] = pd.to_datetime(tl["date"], utc=True)
            tl = tl.rename(columns={"weekly_load": "training_load"})
            base = base.merge(tl[["date", "training_load"]], on="date", how="left")
        else:
            base["training_load"] = None

        rows = []
        for _, r in base.iterrows():
            rows.append({
                "week_start": r["date"].strftime("%Y-%m-%d"),
                "steps_avg": safe(r.get("steps")),
                "active_calories_avg": safe(r.get("active_calories")),
                "exercise_min_avg": safe(r.get("exercise_min")),
                "workout_days": safe(r.get("workout_days", 0)),
                "resting_hr_avg": safe(r.get("resting_hr")),
                "hrv_avg": safe(r.get("hrv_avg")),
                "recovery_avg": safe(r.get("recovery_avg")),
                "training_load": safe(r.get("training_load")),
                "distance_km": safe(r.get("distance_km")),
            })
        return rows
    except Exception as e:
        import traceback
        print(f"WARNING: weekly_trends failed: {e}\n{traceback.format_exc()}", file=sys.stderr, flush=True)
        return []


def _training_load_weekly(workouts):
    if workouts.empty or "heartRateAvg" not in workouts.columns:
        return pd.DataFrame()
    try:
        df = workouts.dropna(subset=["heartRateAvg", "duration"]).copy()
        df["duration_hours"] = df["duration"] / 60
        df["daily_load"] = df["heartRateAvg"] * df["duration_hours"] * 60
        df["date"] = pd.to_datetime(df["date"], utc=True)
        weekly = df.set_index("date").resample("W-MON", label="left")["daily_load"].sum().rename("weekly_load").reset_index()
        return weekly
    except Exception:
        return pd.DataFrame()


def _build_monthly_summary(records, workouts, activity):
    if records.empty:
        return []
    try:
        records = records.copy()
        records["date"] = pd.to_datetime(records["date"], utc=True)

        def monthly_mean(metric):
            df = records[records["type"] == metric]
            if df.empty:
                return pd.DataFrame(columns=["month"])
            return df.set_index("date").resample("MS")["value"].mean().reset_index().rename(columns={"date": "month"})

        def monthly_sum(metric):
            df = records[records["type"] == metric]
            if df.empty:
                return pd.DataFrame(columns=["month"])
            return df.set_index("date").resample("MS")["value"].mean().reset_index().rename(columns={"date": "month"})

        steps_m = records[records["type"] == "StepCount"].set_index("date").resample("MS")["value"].mean().reset_index()
        steps_m.columns = ["month", "steps_avg_per_day"]

        cal_m = records[records["type"] == "ActiveEnergyBurned"].set_index("date").resample("MS")["value"].mean().reset_index()
        cal_m.columns = ["month", "active_calories_avg"]

        rhr_m = records[records["type"] == "RestingHeartRate"].set_index("date").resample("MS")["value"].mean().reset_index()
        rhr_m.columns = ["month", "avg_resting_hr"]

        hrv_m = records[records["type"] == "HRV"].set_index("date").resample("MS")["value"].mean().reset_index()
        hrv_m.columns = ["month", "avg_hrv"]

        vo2_m = records[records["type"] == "VO2Max"].set_index("date").resample("MS")["value"].mean().reset_index()
        vo2_m.columns = ["month", "avg_vo2max"]

        dist_m = records[records["type"] == "WalkingRunningDistance"].set_index("date").resample("MS")["value"].sum().reset_index()
        dist_m.columns = ["month", "distance_km"]

        base = steps_m
        for other in [cal_m, rhr_m, hrv_m, vo2_m, dist_m]:
            if not other.empty:
                base = base.merge(other, on="month", how="outer")

        if not workouts.empty and "date" in workouts.columns:
            wk = workouts.copy()
            wk["date"] = pd.to_datetime(wk["date"], utc=True)
            wk["_d"] = wk["date"]
            wk_m = wk.set_index("date").resample("MS").agg(
                workout_days=("_d", lambda x: x.dt.date.nunique()),
                workout_count=("_d", "count"),
            ).reset_index().rename(columns={"date": "month"})
            base = base.merge(wk_m, on="month", how="left")
        else:
            base["workout_days"] = 0
            base["workout_count"] = 0

        if not activity.empty and "date" in activity.columns:
            act = activity.copy()
            act["date"] = pd.to_datetime(act["date"], utc=True)
            act["all_closed"] = (
                (act["activeEnergyBurned"] >= act["activeEnergyBurnedGoal"]) &
                (act["appleExerciseTime"] >= act["appleExerciseTimeGoal"]) &
                (act["appleStandHours"] >= act["appleStandHoursGoal"])
            )
            rings_m = act.set_index("date").resample("MS")["all_closed"].sum().reset_index()
            rings_m.columns = ["month", "rings_closed_days"]
            base = base.merge(rings_m, on="month", how="left")
        else:
            base["rings_closed_days"] = 0

        rows = []
        for _, r in base.iterrows():
            rows.append({
                "month": r["month"].strftime("%Y-%m"),
                "steps_avg_per_day": safe(r.get("steps_avg_per_day")),
                "active_calories_avg": safe(r.get("active_calories_avg")),
                "avg_resting_hr": safe(r.get("avg_resting_hr")),
                "avg_hrv": safe(r.get("avg_hrv")),
                "avg_vo2max": safe(r.get("avg_vo2max")),
                "distance_km": safe(r.get("distance_km")),
                "workout_days": safe(r.get("workout_days", 0)),
                "workout_count": safe(r.get("workout_count", 0)),
                "rings_closed_days": safe(r.get("rings_closed_days", 0)),
            })
        return rows
    except Exception as e:
        import traceback
        print(f"WARNING: monthly_summary failed: {e}\n{traceback.format_exc()}", file=sys.stderr, flush=True)
        return []


def _build_hr_zones(records, MAX_HR):
    HR_ZONES = [
        ("Z1 (50–60%)", 0.50, 0.60, "#6366f1"),
        ("Z2 (60–70%)", 0.60, 0.70, "#3b82f6"),
        ("Z3 (70–80%)", 0.70, 0.80, "#22d3ee"),
        ("Z4 (80–90%)", 0.80, 0.90, "#f59e0b"),
        ("Z5 (90–100%)", 0.90, 1.00, "#ef4444"),
    ]
    if records.empty:
        return []
    df = records[records["type"] == "HeartRate"].dropna(subset=["value"])
    total = len(df)
    if total == 0:
        return []
    rows = []
    for name, lo, hi, color in HR_ZONES:
        lo_bpm, hi_bpm = MAX_HR * lo, MAX_HR * hi
        cnt = ((df["value"] >= lo_bpm) & (df["value"] < hi_bpm)).sum()
        rows.append({"zone": name, "pct": safe(round(cnt / total * 100, 1)), "color": color})
    return rows


def _build_workout_types(workouts):
    if workouts.empty:
        return []
    try:
        grp = workouts.groupby("workoutActivityType").agg(
            count=("duration", "count"),
            total_duration_min=("duration", "sum"),
            total_calories=("activeCalories", "sum"),
            avg_hr=("heartRateAvg", "mean"),
            total_distance_km=("totalDistance", "sum"),
        ).reset_index()
        rows = []
        for _, r in grp.sort_values("count", ascending=False).iterrows():
            rows.append({
                "type": str(r["workoutActivityType"]),
                "count": int(r["count"]),
                "total_duration_min": safe(r["total_duration_min"]),
                "total_calories": safe(r["total_calories"]),
                "avg_hr": safe(round(float(r["avg_hr"]), 1)) if pd.notna(r["avg_hr"]) else None,
                "total_distance_km": safe(round(float(r["total_distance_km"]), 1)) if pd.notna(r["total_distance_km"]) else 0.0,
            })
        return rows
    except Exception as e:
        print(f"WARNING: workout_types failed: {e}", flush=True)
        return []


def _build_daily_activity(records):
    if records.empty:
        return []
    try:
        steps = records[records["type"] == "StepCount"].groupby("date")["value"].sum().rename("steps").reset_index()
        cal = records[records["type"] == "ActiveEnergyBurned"].groupby("date")["value"].sum().rename("active_calories").reset_index()
        basal = records[records["type"] == "BasalEnergyBurned"].groupby("date")["value"].sum().rename("basal_calories").reset_index()
        ex = records[records["type"] == "ExerciseTime"].groupby("date")["value"].sum().rename("exercise_min").reset_index()
        dist = records[records["type"] == "WalkingRunningDistance"].groupby("date")["value"].sum().rename("distance_km").reset_index()

        base = steps.copy()
        for other in [cal, basal, ex, dist]:
            base = base.merge(other, on="date", how="outer")
        base["steps"] = base["steps"].fillna(0)
        base["steps_rolling7"] = base["steps"].rolling(7, min_periods=1).mean()
        base["active"] = base["steps"] >= 7500
        base["sedentary"] = base["steps"] < 5000
        base = base.sort_values("date")

        rows = []
        for _, r in base.iterrows():
            d = r["date"]
            date_str = d.strftime("%Y-%m-%d") if hasattr(d, "strftime") else str(d)[:10]
            rows.append({
                "date": date_str,
                "steps": safe(r.get("steps")),
                "steps_rolling7": safe(r.get("steps_rolling7")),
                "active": bool(r.get("active", False)),
                "sedentary": bool(r.get("sedentary", False)),
                "active_calories": safe(r.get("active_calories")),
                "basal_calories": safe(r.get("basal_calories")),
                "exercise_min": safe(r.get("exercise_min")),
                "distance_km": safe(round(float(r["distance_km"]), 2)) if pd.notna(r.get("distance_km")) else None,
            })
        return rows
    except Exception as e:
        print(f"WARNING: daily_activity failed: {e}", flush=True)
        return []


def _build_daily_heart(records):
    if records.empty:
        return []
    try:
        hr = records[records["type"] == "HeartRate"]
        avg_ = hr.groupby("date")["value"].mean().rename("hr_avg")
        max_ = hr.groupby("date")["value"].max().rename("hr_max")
        min_ = hr.groupby("date")["value"].min().rename("hr_min")
        rhr = records[records["type"] == "RestingHeartRate"].groupby("date")["value"].mean().rename("resting_hr")
        hrv = records[records["type"] == "HRV"].groupby("date")["value"].mean().rename("hrv_avg")
        rec = _recovery_score_df(records)
        spo2 = records[records["type"] == "OxygenSaturation"].groupby("date")["value"].mean().rename("spo2")

        base = pd.concat([avg_, max_, min_, rhr, hrv, spo2], axis=1).reset_index()
        if not rec.empty:
            base = base.merge(rec[["date", "recovery_score"]], on="date", how="left")
        else:
            base["recovery_score"] = None
        base = base.sort_values("date")

        rows = []
        for _, r in base.iterrows():
            d = r["date"]
            date_str = d.strftime("%Y-%m-%d") if hasattr(d, "strftime") else str(d)[:10]
            rows.append({
                "date": date_str,
                "hr_avg": safe(r.get("hr_avg")),
                "hr_max": safe(r.get("hr_max")),
                "hr_min": safe(r.get("hr_min")),
                "resting_hr": safe(r.get("resting_hr")),
                "hrv_avg": safe(r.get("hrv_avg")),
                "recovery_score": safe(r.get("recovery_score")),
                "spo2": safe(r.get("spo2")),
            })
        return rows
    except Exception as e:
        print(f"WARNING: daily_heart failed: {e}", flush=True)
        return []


def _build_vo2max(records):
    if records.empty:
        return {"readings": [], "monthly": [], "regression": None}
    try:
        df = records[records["type"] == "VO2Max"].dropna(subset=["value"]).copy()
        if df.empty:
            return {"readings": [], "monthly": [], "regression": None}
        df = df.sort_values("startDate") if "startDate" in df.columns else df.sort_values("date")
        df = df.dropna(subset=["date"])
        readings = []
        for _, r in df.iterrows():
            d = r["date"]
            if pd.isnull(d):
                continue
            date_str = d.strftime("%Y-%m-%d") if hasattr(d, "strftime") else str(d)[:10]
            readings.append({"date": date_str, "value": safe(round(float(r["value"]), 1))})

        df["date"] = pd.to_datetime(df["date"], utc=True)
        monthly = df.set_index("date").resample("MS")["value"].mean().reset_index()
        monthly["value"] = pd.to_numeric(monthly["value"], errors="coerce")
        monthly_out = []
        for _, r in monthly.iterrows():
            if pd.isnull(r.get("date")):
                continue
            v = r.get("value")
            monthly_out.append({
                "month": r["date"].strftime("%Y-%m"),
                "avg": safe(round(float(v), 1)) if pd.notna(v) else None,
            })

        regression = None
        if len(readings) >= 5:
            x = np.arange(len(readings))
            y = [r["value"] for r in readings]
            slope, intercept, r2, *_ = stats.linregress(x, y)
            regression = {
                "date_start": readings[0]["date"],
                "date_end": readings[-1]["date"],
                "y_start": safe(round(intercept, 2)),
                "y_end": safe(round(intercept + slope * (len(readings) - 1), 2)),
                "r_squared": safe(round(r2, 3)),
                "trend": "improving" if slope > 0 else "declining",
            }

        return {"readings": readings, "monthly": monthly_out, "regression": regression}
    except Exception as e:
        import traceback
        print(f"WARNING: vo2max failed: {e}\n{traceback.format_exc()}", file=sys.stderr, flush=True)
        return {"readings": [], "monthly": [], "regression": None}


def _build_training_load(workouts):
    if workouts.empty:
        return []
    try:
        df = workouts.dropna(subset=["heartRateAvg", "duration"]).copy()
        if df.empty:
            return []
        df["duration_hours"] = df["duration"] / 60
        df["daily_load"] = df["heartRateAvg"] * df["duration_hours"] * 60
        df["date"] = pd.to_datetime(df["date"], utc=True)
        weekly = df.set_index("date").resample("W-MON", label="left")["daily_load"].sum().rename("load").reset_index()
        weekly["rolling4"] = weekly["load"].rolling(4, min_periods=1).mean()
        weekly["pct_change"] = weekly["load"].pct_change() * 100
        weekly["spike"] = weekly["pct_change"] > 20

        rows = []
        for _, r in weekly.iterrows():
            rows.append({
                "week": r["date"].strftime("%Y-%m-%d"),
                "load": safe(round(float(r["load"]), 1)),
                "rolling4": safe(round(float(r["rolling4"]), 1)),
                "pct_change": safe(round(float(r["pct_change"]), 1)) if pd.notna(r["pct_change"]) else None,
                "spike": bool(r["spike"]),
            })
        return rows
    except Exception as e:
        print(f"WARNING: training_load failed: {e}", flush=True)
        return []


def _build_workouts_detail(workouts):
    if workouts.empty:
        return {"personal_bests": {}, "monthly_summary": []}
    try:
        pb = {}
        cols = {
            "longest_workout": ("duration", "max", "min"),
            "most_calories": ("activeCalories", "max", "kcal"),
            "longest_distance": ("totalDistance", "max", "km"),
            "peak_heart_rate_workout": ("heartRateMax", "max", "bpm"),
        }
        for key, (col, agg, unit) in cols.items():
            if col in workouts.columns:
                sub = workouts.dropna(subset=[col])
                if not sub.empty:
                    idx = sub[col].idxmax()
                    row = sub.loc[idx]
                    d = row.get("date")
                    date_str = d.strftime("%Y-%m-%d") if hasattr(d, "strftime") else str(d)[:10]
                    pb[key] = {
                        "value": safe(round(float(row[col]), 1)),
                        "unit": unit,
                        "date": date_str,
                        "type": str(row.get("workoutActivityType", "Unknown")),
                    }

        wk = workouts.copy()
        wk["date"] = pd.to_datetime(wk["date"], utc=True)
        wk["_d"] = wk["date"]
        monthly = wk.set_index("date").resample("MS").agg(
            workout_days=("_d", lambda x: x.dt.date.nunique()),
            total_workouts=("duration", "count"),
            total_min=("duration", "sum"),
            total_cal=("activeCalories", "sum"),
            avg_hr=("heartRateAvg", "mean"),
        ).reset_index()

        monthly_out = []
        for _, r in monthly.iterrows():
            monthly_out.append({
                "month": r["date"].strftime("%Y-%m"),
                "workout_days": int(r["workout_days"]),
                "total_workouts": int(r["total_workouts"]),
                "total_min": safe(round(float(r["total_min"]), 1)) if pd.notna(r["total_min"]) else None,
                "total_cal": safe(round(float(r["total_cal"]), 1)) if pd.notna(r["total_cal"]) else None,
                "avg_hr": safe(round(float(r["avg_hr"]), 1)) if pd.notna(r["avg_hr"]) else None,
            })

        return {"personal_bests": pb, "monthly_summary": monthly_out}
    except Exception as e:
        import traceback
        print(f"WARNING: workouts_detail failed: {e}\n{traceback.format_exc()}", file=sys.stderr, flush=True)
        return {"personal_bests": {}, "monthly_summary": []}


def _build_workout_calendar(workouts):
    if workouts.empty:
        return []
    try:
        wk = workouts.copy()
        wk["date"] = pd.to_datetime(wk["date"], utc=True)
        cal = wk.groupby(wk["date"].dt.date).size().rename("count").reset_index()
        cal.columns = ["date", "count"]

        rows = []
        for _, r in cal.iterrows():
            d = r["date"]
            dt = date(d.year, d.month, d.day) if not isinstance(d, date) else d
            rows.append({
                "date": dt.strftime("%Y-%m-%d"),
                "count": int(r["count"]),
                "weekday": dt.weekday(),
                "week_of_year": dt.isocalendar()[1],
                "year": dt.year,
            })
        return rows
    except Exception as e:
        print(f"WARNING: workout_calendar failed: {e}", flush=True)
        return []


def _build_running_analytics(workouts, routes_df):
    """Build comprehensive running analytics including indoor treadmill runs."""
    if workouts.empty:
        return {"all_runs": [], "totals": {}, "weekly": [], "monthly": [], "by_year": []}
    try:
        wk = workouts.copy()
        running = wk[wk["workoutActivityType"].astype(str).str.contains("Running", case=False, na=False)].copy()
        if running.empty:
            return {"all_runs": [], "totals": {}, "weekly": [], "monthly": [], "by_year": []}

        running["date"] = pd.to_datetime(running["date"], utc=True)

        # Map date → route_id for outdoor detection
        outdoor_date_map = {}
        if not routes_df.empty:
            for _, r in routes_df.iterrows():
                d = r.get("date")
                if d is None or pd.isnull(d):
                    continue
                date_str = d.strftime("%Y-%m-%d") if hasattr(d, "strftime") else str(d)[:10]
                route_file = str(r.get("route_file", ""))
                route_id = route_file.replace(".gpx", "").replace("route_", "")
                if not route_id.startswith("route_"):
                    route_id = "route_" + route_id
                outdoor_date_map[date_str] = route_id

        all_runs = []
        for _, r in running.sort_values("date", ascending=False).iterrows():
            d = r["date"]
            if pd.isnull(d):
                continue
            date_str = d.strftime("%Y-%m-%d")
            dist = r.get("totalDistance")
            dur = r.get("duration")
            pace = (float(dur) / float(dist)) if (pd.notna(dist) and pd.notna(dur) and float(dist) > 0) else None
            speed = (float(dist) / (float(dur) / 60)) if (pd.notna(dist) and pd.notna(dur) and float(dur) > 0) else None
            is_outdoor = date_str in outdoor_date_map
            all_runs.append({
                "date": date_str,
                "distance_km": safe(round(float(dist), 2)) if pd.notna(dist) else None,
                "duration_min": safe(round(float(dur), 1)) if pd.notna(dur) else None,
                "pace_min_per_km": safe(round(pace, 2)) if pace else None,
                "speed_kmh": safe(round(speed, 1)) if speed else None,
                "calories": safe(round(float(r["activeCalories"]))) if pd.notna(r.get("activeCalories")) else None,
                "hr_avg": safe(round(float(r["heartRateAvg"]))) if pd.notna(r.get("heartRateAvg")) else None,
                "hr_max": safe(round(float(r["heartRateMax"]))) if pd.notna(r.get("heartRateMax")) else None,
                "is_outdoor": is_outdoor,
                "route_id": outdoor_date_map.get(date_str),
            })

        valid_dist = running.dropna(subset=["totalDistance"])
        total_km = float(valid_dist["totalDistance"].sum()) if not valid_dist.empty else 0.0
        total_dur_min = float(running["duration"].sum()) if "duration" in running.columns else 0.0
        avg_pace = (total_dur_min / total_km) if total_km > 0 else None
        paces = [r["pace_min_per_km"] for r in all_runs if r["pace_min_per_km"] and r.get("distance_km") and r["distance_km"] >= 1.0]
        best_pace = round(min(paces), 2) if paces else None
        outdoor_count = sum(1 for r in all_runs if r["is_outdoor"])

        totals = {
            "total_runs": len(all_runs),
            "outdoor_runs": outdoor_count,
            "indoor_runs": len(all_runs) - outdoor_count,
            "total_km": safe(round(total_km, 1)),
            "total_duration_h": safe(round(total_dur_min / 60, 1)),
            "avg_pace_min_per_km": safe(round(avg_pace, 2)) if avg_pace else None,
            "best_pace_min_per_km": safe(best_pace),
            "avg_distance_km": safe(round(total_km / len(all_runs), 2)) if all_runs else None,
        }

        running["_d"] = running["date"]
        weekly_r = running.set_index("date").resample("W-MON", label="left").agg(
            runs=("_d", "count"),
            distance_km=("totalDistance", "sum"),
            duration_min=("duration", "sum"),
            avg_hr=("heartRateAvg", "mean"),
        ).reset_index()
        weekly_out = []
        for _, r in weekly_r.iterrows():
            if pd.isnull(r["date"]):
                continue
            dist = r.get("distance_km")
            weekly_out.append({
                "week": r["date"].strftime("%Y-%m-%d"),
                "runs": int(r["runs"]),
                "distance_km": safe(round(float(dist), 1)) if pd.notna(dist) else 0,
                "duration_min": safe(round(float(r.get("duration_min", 0)))) if pd.notna(r.get("duration_min")) else 0,
                "avg_hr": safe(round(float(r["avg_hr"]))) if pd.notna(r.get("avg_hr")) else None,
            })

        monthly_r = running.set_index("date").resample("MS").agg(
            runs=("_d", "count"),
            distance_km=("totalDistance", "sum"),
            duration_min=("duration", "sum"),
            avg_hr=("heartRateAvg", "mean"),
        ).reset_index()
        monthly_out = []
        for _, r in monthly_r.iterrows():
            if pd.isnull(r["date"]):
                continue
            dist = r.get("distance_km")
            dur = r.get("duration_min")
            pace = (float(dur) / float(dist)) if (pd.notna(dist) and pd.notna(dur) and float(dist) > 0) else None
            monthly_out.append({
                "month": r["date"].strftime("%Y-%m"),
                "runs": int(r["runs"]),
                "distance_km": safe(round(float(dist), 1)) if pd.notna(dist) else 0,
                "avg_hr": safe(round(float(r["avg_hr"]))) if pd.notna(r.get("avg_hr")) else None,
                "avg_pace": safe(round(pace, 2)) if pace else None,
            })

        running["year"] = running["date"].dt.year
        by_year_g = running.groupby("year").agg(
            runs=("_d", "count"),
            distance_km=("totalDistance", "sum"),
            duration_min=("duration", "sum"),
        ).reset_index()
        by_year_out = []
        for _, r in by_year_g.iterrows():
            by_year_out.append({
                "year": int(r["year"]),
                "runs": int(r["runs"]),
                "distance_km": safe(round(float(r.get("distance_km", 0)), 1)),
                "duration_h": safe(round(float(r.get("duration_min", 0)) / 60, 1)),
            })

        return {"all_runs": all_runs, "totals": totals, "weekly": weekly_out, "monthly": monthly_out, "by_year": by_year_out}
    except Exception as e:
        import traceback
        print(f"WARNING: running_analytics failed: {e}\n{traceback.format_exc()}", file=sys.stderr, flush=True)
        return {"all_runs": [], "totals": {}, "weekly": [], "monthly": [], "by_year": []}


def _build_activity_rings(activity):
    if activity.empty:
        return []
    try:
        df = activity.copy()
        df["date"] = pd.to_datetime(df["date"], utc=True, errors="coerce")
        df = df.dropna(subset=["date"])
        df["move_pct"] = (df["activeEnergyBurned"] / df["activeEnergyBurnedGoal"].replace(0, np.nan) * 100).clip(0, 150)
        df["exercise_pct"] = (df["appleExerciseTime"] / df["appleExerciseTimeGoal"].replace(0, np.nan) * 100).clip(0, 150)
        df["stand_pct"] = (df["appleStandHours"] / df["appleStandHoursGoal"].replace(0, np.nan) * 100).clip(0, 150)
        df["all_closed"] = (
            (df["activeEnergyBurned"] >= df["activeEnergyBurnedGoal"]) &
            (df["appleExerciseTime"] >= df["appleExerciseTimeGoal"]) &
            (df["appleStandHours"] >= df["appleStandHoursGoal"])
        )

        rows = []
        for _, r in df.sort_values("date").iterrows():
            rows.append({
                "date": r["date"].strftime("%Y-%m-%d"),
                "move_pct": safe(r.get("move_pct")),
                "exercise_pct": safe(r.get("exercise_pct")),
                "stand_pct": safe(r.get("stand_pct")),
                "all_closed": bool(r.get("all_closed", False)),
            })
        return rows
    except Exception as e:
        print(f"WARNING: activity_rings failed: {e}", flush=True)
        return []


def _build_routes(routes_df, route_tracks_df):
    summaries = []
    tracks_by_id = {}

    if routes_df.empty:
        return summaries, tracks_by_id

    try:
        for _, r in routes_df.iterrows():
            start_time = r.get("start_time")
            date_obj = r.get("date")
            date_str = date_obj.strftime("%Y-%m-%d") if hasattr(date_obj, "strftime") and pd.notna(date_obj) else None
            route_file = str(r.get("route_file", ""))

            # Build route_id from filename (strip .gpx)
            route_id = route_file.replace(".gpx", "").replace("route_", "")
            if not route_id.startswith("route_"):
                route_id = "route_" + route_id

            summaries.append({
                "id": route_id,
                "date": date_str,
                "distance_km": safe(round(float(r["distance_km"]), 1)) if pd.notna(r.get("distance_km")) else None,
                "duration_min": safe(round(float(r["duration_min"]), 1)) if pd.notna(r.get("duration_min")) else None,
                "elevation_gain_m": safe(round(float(r["elevation_gain_m"]), 1)) if pd.notna(r.get("elevation_gain_m")) else None,
                "avg_pace_min_per_km": safe(round(float(r["avg_pace_min_per_km"]), 1)) if pd.notna(r.get("avg_pace_min_per_km")) else None,
                "avg_speed_ms": safe(r.get("avg_speed_ms")),
                "max_speed_ms": safe(r.get("max_speed_ms")),
                "n_points": int(r.get("n_points", 0)),
            })

            # Route track points
            if not route_tracks_df.empty and "route_file" in route_tracks_df.columns:
                track = route_tracks_df[route_tracks_df["route_file"] == route_file]
                points = []
                for _, pt in track.iterrows():
                    speed = pt.get("speed")
                    speed_kmh = safe(float(speed) * 3.6) if speed is not None and pd.notna(speed) else None
                    points.append({
                        "lat": safe(pt["lat"]),
                        "lon": safe(pt["lon"]),
                        "ele": safe(pt.get("ele")),
                        "speed_kmh": speed_kmh,
                    })
                tracks_by_id[route_id] = points
    except Exception as e:
        print(f"WARNING: routes failed: {e}", flush=True)

    return summaries, tracks_by_id


def _build_ecg(ecg_df, waveform_src_dir: Path):
    summaries = []
    waveforms = {}

    if ecg_df.empty:
        return summaries, waveforms

    try:
        for _, r in ecg_df.iterrows():
            filename = str(r.get("filename", ""))
            stem = Path(filename).stem
            date_obj = r.get("date")
            date_str = date_obj.strftime("%Y-%m-%d") if hasattr(date_obj, "strftime") and pd.notna(date_obj) else None
            rec_id = stem if stem else (f"ecg_{date_str}" if date_str else f"ecg_{_}")

            sample_rate = int(r.get("sample_rate_hz", 512))
            n_samples = int(r.get("n_samples", 0))

            summaries.append({
                "id": rec_id,
                "date": date_str,
                "classification": str(r.get("classification", "")) if pd.notna(r.get("classification")) else None,
                "device": str(r.get("device", "")) if pd.notna(r.get("device")) else None,
                "duration_sec": safe(r.get("duration_sec")),
                "symptoms": str(r.get("symptoms")) if pd.notna(r.get("symptoms")) else None,
                "sample_rate_hz": sample_rate,
                "n_samples": n_samples,
                "has_waveform": (waveform_src_dir / f"{stem}.npy").exists(),
            })

            npy_path = waveform_src_dir / f"{stem}.npy"
            if npy_path.exists():
                arr = np.load(npy_path)
                voltage = [safe(float(v)) for v in arr.tolist()]
                waveforms[rec_id] = {
                    "id": rec_id,
                    "sample_rate_hz": sample_rate,
                    "voltage_uv": voltage,
                }
    except Exception as e:
        print(f"WARNING: ecg failed: {e}", flush=True)

    return summaries, waveforms


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Apple Health → JSON export pipeline")
    parser.add_argument("--input-dir", required=True, help="Directory with export.xml, workout-routes/, electrocardiograms/")
    parser.add_argument("--data-dir", required=True, help="Temp directory for Parquet files")
    parser.add_argument("--output-dir", required=True, help="Output directory for JSON files")
    args = parser.parse_args()

    run_pipeline(
        input_dir=Path(args.input_dir),
        data_dir=Path(args.data_dir),
        output_dir=Path(args.output_dir),
    )

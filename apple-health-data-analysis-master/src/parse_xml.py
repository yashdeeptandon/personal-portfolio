"""Stream-parse Apple Health export.xml → Parquet files.

Run once: python src/parse_xml.py
Outputs: data/records.parquet, data/workouts.parquet, data/activity_summaries.parquet
"""

import xml.etree.ElementTree as ET
from pathlib import Path
import pandas as pd
import sys
import time

DATA_DIR = Path(__file__).parent.parent / "data"
XML_PATH = Path(__file__).parent.parent / "export.xml"

RECORD_TYPES = {
    "HKQuantityTypeIdentifierStepCount",
    "HKQuantityTypeIdentifierActiveEnergyBurned",
    "HKQuantityTypeIdentifierBasalEnergyBurned",
    "HKQuantityTypeIdentifierHeartRate",
    "HKQuantityTypeIdentifierRestingHeartRate",
    "HKQuantityTypeIdentifierHeartRateVariabilitySDNN",
    "HKQuantityTypeIdentifierVO2Max",
    "HKQuantityTypeIdentifierAppleExerciseTime",
    "HKQuantityTypeIdentifierOxygenSaturation",
    "HKQuantityTypeIdentifierRespiratoryRate",
    "HKQuantityTypeIdentifierBodyMass",
    "HKQuantityTypeIdentifierBodyMassIndex",
    "HKQuantityTypeIdentifierAppleStandTime",
    "HKQuantityTypeIdentifierFlightsClimbed",
    "HKQuantityTypeIdentifierDistanceWalkingRunning",
    "HKCategoryTypeIdentifierSleepAnalysis",
}

SHORT_NAMES = {
    "HKQuantityTypeIdentifierStepCount": "StepCount",
    "HKQuantityTypeIdentifierActiveEnergyBurned": "ActiveEnergyBurned",
    "HKQuantityTypeIdentifierBasalEnergyBurned": "BasalEnergyBurned",
    "HKQuantityTypeIdentifierHeartRate": "HeartRate",
    "HKQuantityTypeIdentifierRestingHeartRate": "RestingHeartRate",
    "HKQuantityTypeIdentifierHeartRateVariabilitySDNN": "HRV",
    "HKQuantityTypeIdentifierVO2Max": "VO2Max",
    "HKQuantityTypeIdentifierAppleExerciseTime": "ExerciseTime",
    "HKQuantityTypeIdentifierOxygenSaturation": "OxygenSaturation",
    "HKQuantityTypeIdentifierRespiratoryRate": "RespiratoryRate",
    "HKQuantityTypeIdentifierBodyMass": "BodyMass",
    "HKQuantityTypeIdentifierBodyMassIndex": "BMI",
    "HKQuantityTypeIdentifierAppleStandTime": "StandTime",
    "HKQuantityTypeIdentifierFlightsClimbed": "FlightsClimbed",
    "HKQuantityTypeIdentifierDistanceWalkingRunning": "WalkingRunningDistance",
    "HKCategoryTypeIdentifierSleepAnalysis": "Sleep",
}


def parse_date(s):
    if s is None:
        return None
    return pd.to_datetime(s, format="%Y-%m-%d %H:%M:%S %z", utc=True)


def run(xml_path=XML_PATH, data_dir=DATA_DIR, verbose=True):
    data_dir.mkdir(exist_ok=True)

    records = []
    workouts = []
    activity_summaries = []

    t0 = time.time()
    count = 0

    def log(msg):
        if verbose:
            print(msg, flush=True)

    log(f"Parsing {xml_path} ...")

    context = ET.iterparse(xml_path, events=("start", "end"))
    current_workout = None

    for event, elem in context:
        if event == "end":
            tag = elem.tag

            if tag == "Record":
                rtype = elem.get("type", "")
                if rtype in RECORD_TYPES:
                    records.append({
                        "type": SHORT_NAMES.get(rtype, rtype),
                        "value": elem.get("value"),
                        "unit": elem.get("unit"),
                        "startDate": elem.get("startDate"),
                        "endDate": elem.get("endDate"),
                        "sourceName": elem.get("sourceName"),
                    })
                elem.clear()

            elif tag == "Workout":
                w = {
                    "workoutActivityType": elem.get("workoutActivityType", "").replace("HKWorkoutActivityType", ""),
                    "duration": elem.get("duration"),
                    "durationUnit": elem.get("durationUnit"),
                    "startDate": elem.get("startDate"),
                    "endDate": elem.get("endDate"),
                    "sourceName": elem.get("sourceName"),
                    "totalDistance": None,
                    "totalDistanceUnit": None,
                    "activeCalories": None,
                    "heartRateAvg": None,
                    "heartRateMax": None,
                    "heartRateMin": None,
                }
                for stat in elem.findall("WorkoutStatistics"):
                    stype = stat.get("type", "")
                    if "ActiveEnergyBurned" in stype:
                        w["activeCalories"] = stat.get("sum")
                    elif "DistanceWalkingRunning" in stype or "DistanceCycling" in stype or "DistanceSwimming" in stype:
                        w["totalDistance"] = stat.get("sum")
                        w["totalDistanceUnit"] = stat.get("unit")
                    elif "HeartRate" in stype:
                        w["heartRateAvg"] = stat.get("average")
                        w["heartRateMax"] = stat.get("maximum")
                        w["heartRateMin"] = stat.get("minimum")
                workouts.append(w)
                elem.clear()

            elif tag == "ActivitySummary":
                activity_summaries.append({
                    "dateComponents": elem.get("dateComponents"),
                    "activeEnergyBurned": elem.get("activeEnergyBurned"),
                    "activeEnergyBurnedGoal": elem.get("activeEnergyBurnedGoal"),
                    "appleExerciseTime": elem.get("appleExerciseTime"),
                    "appleExerciseTimeGoal": elem.get("appleExerciseTimeGoal"),
                    "appleStandHours": elem.get("appleStandHours"),
                    "appleStandHoursGoal": elem.get("appleStandHoursGoal"),
                })
                elem.clear()

            count += 1
            if verbose and count % 500_000 == 0:
                elapsed = time.time() - t0
                log(f"  {count:,} elements processed ({elapsed:.0f}s) | records={len(records):,} workouts={len(workouts):,}")

    log(f"Parsing done in {time.time()-t0:.1f}s")
    log(f"  records={len(records):,}  workouts={len(workouts):,}  activity_summaries={len(activity_summaries):,}")

    # --- Records ---
    log("Building records DataFrame ...")
    df_rec = pd.DataFrame(records)
    df_rec["value"] = pd.to_numeric(df_rec["value"], errors="coerce")
    df_rec["startDate"] = pd.to_datetime(df_rec["startDate"], format="%Y-%m-%d %H:%M:%S %z", utc=True, errors="coerce")
    df_rec["endDate"] = pd.to_datetime(df_rec["endDate"], format="%Y-%m-%d %H:%M:%S %z", utc=True, errors="coerce")
    df_rec["date"] = df_rec["startDate"].dt.normalize()
    df_rec.to_parquet(data_dir / "records.parquet", index=False)
    log(f"  Saved records.parquet ({len(df_rec):,} rows)")

    # --- Workouts ---
    log("Building workouts DataFrame ...")
    df_wk = pd.DataFrame(workouts)
    for col in ["duration", "activeCalories", "totalDistance", "heartRateAvg", "heartRateMax", "heartRateMin"]:
        df_wk[col] = pd.to_numeric(df_wk[col], errors="coerce")
    df_wk["startDate"] = pd.to_datetime(df_wk["startDate"], format="%Y-%m-%d %H:%M:%S %z", utc=True, errors="coerce")
    df_wk["endDate"] = pd.to_datetime(df_wk["endDate"], format="%Y-%m-%d %H:%M:%S %z", utc=True, errors="coerce")
    df_wk["date"] = df_wk["startDate"].dt.normalize()
    df_wk.to_parquet(data_dir / "workouts.parquet", index=False)
    log(f"  Saved workouts.parquet ({len(df_wk):,} rows)")

    # --- Activity Summaries ---
    log("Building activity summaries DataFrame ...")
    df_as = pd.DataFrame(activity_summaries)
    for col in ["activeEnergyBurned", "activeEnergyBurnedGoal", "appleExerciseTime",
                "appleExerciseTimeGoal", "appleStandHours", "appleStandHoursGoal"]:
        df_as[col] = pd.to_numeric(df_as[col], errors="coerce")
    df_as["date"] = pd.to_datetime(df_as["dateComponents"], format="%Y-%m-%d", errors="coerce")
    df_as.to_parquet(data_dir / "activity_summaries.parquet", index=False)
    log(f"  Saved activity_summaries.parquet ({len(df_as):,} rows)")

    log("ETL complete.")
    return df_rec, df_wk, df_as


if __name__ == "__main__":
    run()

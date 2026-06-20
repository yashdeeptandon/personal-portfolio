# Apple Health Data Dashboard Specification

## 1. Overview

This project aims to build a fitness and health analytics dashboard using data exported from Apple Health (via Apple Watch).

The dataset is sourced from the Apple Health export package, primarily using:

- `export.xml` → Core dataset (primary source)
- `workout-routes/` → Optional (GPS data, not required initially)
- `electrocardiograms/` → Optional (advanced ECG analysis, out of scope for now)
- `export_cda.xml` → Ignore (clinical data)

---

## 2. Data Source Details

### Primary File
- `export.xml` (XML format, ~60MB)

### Structure
Each entry is a `<Record>` with attributes:
- `type` → metric type (e.g., StepCount, HeartRate)
- `value` → numeric value
- `startDate` / `endDate`

---

## 3. Key Data Types to Extract

Filter and process only the following:

| Metric | Apple Health Type |
|------|------------------|
| Steps | HKQuantityTypeIdentifierStepCount |
| Active Calories | HKQuantityTypeIdentifierActiveEnergyBurned |
| Heart Rate | HKQuantityTypeIdentifierHeartRate |
| VO2 Max | HKQuantityTypeIdentifierVO2Max |
| Exercise Time | HKQuantityTypeIdentifierAppleExerciseTime |
| Workouts | HKWorkoutTypeIdentifier |

---

## 4. Data Processing Requirements

### 4.1 Preprocessing
- Parse XML → convert to structured table (DataFrame)
- Convert `startDate` → datetime
- Normalize `value` → float
- Filter only required types

### 4.2 Aggregations
- Group by day (`date`)
- Compute daily aggregates:
  - Sum (steps, calories, exercise time)
  - Avg (heart rate)
  - Max/Min where applicable

---

## 5. Dashboard Metrics

## 5.1 Activity Metrics

### 1. Workout Days
- Definition: Number of unique days with at least 1 workout
- Views:
  - Monthly count
  - Yearly count
- Additional:
  - Current streak
  - Longest streak

---

### 2. Average Calories Burned
- Metric:
  - Avg Active Calories per day
- Views:
  - Daily average
  - 7-day moving average
- Optional:
  - Separate Active vs Total calories

---

### 3. Exercise Time
- Metrics:
  - Avg exercise minutes per day
  - Avg exercise minutes per workout day
- Important distinction:
  - Include both metrics

---

### 4. Steps
- Metrics:
  - Avg steps per day
  - Total steps per month
- Additional:
  - Active vs sedentary day classification

---

## 5.2 Heart & Performance Metrics

### 5. Heart Rate

Break into:

- Average Heart Rate
- Resting Heart Rate (if available)
- Max Heart Rate (daily/workout)

---

### 6. Heart Rate Zones

Define zones based on % of max HR:

| Zone | % Range |
|------|--------|
| Zone 1 | 50–60% |
| Zone 2 | 60–70% |
| Zone 3 | 70–80% |
| Zone 4 | 80–90% |
| Zone 5 | 90–100% |

Metrics:
- % time spent in each zone
- Dominant zone per workout

---

### 7. VO2 Max
- Metrics:
  - Latest value
  - Monthly average
  - Trend over time

---

## 5.3 Derived / Advanced Metrics

### 8. Consistency Score
Composite score based on:
- Workout frequency
- Steps consistency
- Exercise minutes

---

### 9. Training Load
Approximation:
training_load = avg_heart_rate * workout_duration


Metrics:
- Weekly training load
- Load spikes detection

---

### 10. Recovery Score (if HRV available)
Inputs:
- HRV
- Resting HR

Logic:
- High HRV + Low RHR → good recovery
- Low HRV + High RHR → fatigue/stress

---

## 6. Dashboard Sections

### Section 1: Overview
- Avg steps/day
- Avg calories/day
- Workout days
- VO2 max

---

### Section 2: Trends
- Steps trend (daily/weekly)
- Calories trend
- Exercise trend

---

### Section 3: Heart Metrics
- Avg HR
- HR zones distribution
- Max HR trends

---

### Section 4: Performance
- VO2 max trend
- Training load

---

### Section 5: Insights (Auto-generated)

Examples:
- "Workout frequency decreased by 20% this week"
- "Resting HR increased → possible fatigue"
- "Higher activity observed on days with >7h sleep"

---

## 7. Visualization Requirements

- Line charts → trends over time
- Bar charts → monthly summaries
- Pie charts → HR zones
- KPI cards → headline metrics

---

## 8. Tech Requirements

### Minimal Setup
- Python (Pandas)
- Streamlit (dashboard)

### Optional Enhancements
- PostgreSQL (storage)
- React (frontend)
- Metabase (BI tool)

---

## 9. Constraints & Notes

- Apple Health data is approximate (not medical-grade)
- Avoid over-reliance on averages
- Prefer trends over raw values
- Ensure separation of:
  - Workout days vs non-workout days

---

## 10. Future Scope

- GPS route visualization (from `workout-routes`)
- ECG analysis (from `electrocardiograms`)
- Sleep correlation
- Predictive insights (fatigue, performance)

---

## 11. Expected Output

- Interactive dashboard
- Daily aggregated dataset
- Clean, structured metrics layer
- Extensible pipeline for new metrics

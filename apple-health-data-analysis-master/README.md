# Apple Health Data Analysis

An interactive Streamlit dashboard for exploring Apple Health exports. The app parses your Apple Health data into Parquet files, then lets you browse activity, heart, performance, route, and ECG metrics from a single interface.

## What It Does

- Parses Apple Health `export.xml` into structured datasets.
- Summarizes workouts, steps, calories, exercise time, VO2 max, heart-rate metrics, routes, and ECG recordings.
- Provides a multipage Streamlit dashboard with overview and detailed metric views.

## Project Structure

- `app.py` - Streamlit entrypoint and landing page.
- `pages/` - Additional dashboard pages.
- `src/` - Data parsing and metric computation code.
- `data/` - Generated Parquet files and derived assets.
- `electrocardiograms/` - Apple ECG CSV exports.
- `workout-routes/` - GPX route files.

## Requirements

- Python 3.10 or newer.
- An Apple Health export with `export.xml` placed in the project root.
- Optional: ECG CSV files in `electrocardiograms/` and GPX route files in `workout-routes/`.

## Setup

1. Create and activate a virtual environment.

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies.

```bash
pip install -r requirements.txt
```

3. Add your Apple Health export.

Place `export.xml` in the repository root:

```text
/Users/yashdeeptandon/Projects/apple-health-data-analysis/export.xml
```

## How To Run

Start the dashboard with Streamlit:

```bash
streamlit run app.py
```

Open the local URL shown in the terminal, usually `http://localhost:8501`.

## First Run Behavior

On the first launch, the app checks for these generated files in `data/`:

- `records.parquet`
- `workouts.parquet`
- `activity_summaries.parquet`

If they are missing, the app will:

1. Parse `export.xml`.
2. Generate the Parquet datasets.
3. Reload the dashboard automatically.

This can take a few minutes for large Apple Health exports.

## Optional Data Parsers

You can regenerate derived datasets manually if needed:

```bash
python src/parse_xml.py
python src/parse_routes.py
python src/parse_ecg.py
```

These scripts populate `data/` with the dashboard-ready files.

## Dashboard Sections

- Overview
- Activity
- Heart Metrics
- Performance
- Routes
- ECG

## Notes

- The app is for personal analytics and is not medical advice.
- Route and ECG features are optional and only work if the corresponding source files are present.
- If you update the raw Apple Health export, rerun the parsers or delete the generated Parquet files so the app rebuilds them on the next launch.

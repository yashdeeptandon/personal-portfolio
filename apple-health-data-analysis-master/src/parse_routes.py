"""Parse all GPX workout route files → routes.parquet (per-route summaries + trackpoints).

Run once: python src/parse_routes.py
Outputs: data/routes.parquet, data/route_tracks.parquet
"""

import math
from pathlib import Path
import pandas as pd
import gpxpy

ROUTES_DIR = Path(__file__).parent.parent / "workout-routes"
DATA_DIR = Path(__file__).parent.parent / "data"


def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def parse_routes(routes_dir=ROUTES_DIR, data_dir=DATA_DIR, verbose=True):
    data_dir.mkdir(exist_ok=True)
    gpx_files = sorted(routes_dir.glob("*.gpx"))

    if verbose:
        print(f"Found {len(gpx_files)} GPX files")

    summaries = []
    all_tracks = []

    for gpx_file in gpx_files:
        try:
            with open(gpx_file) as f:
                gpx = gpxpy.parse(f)
        except Exception as e:
            if verbose:
                print(f"  SKIP {gpx_file.name}: {e}")
            continue

        trackpoints = []
        for track in gpx.tracks:
            for segment in track.segments:
                for pt in segment.points:
                    ext = {}
                    if pt.extensions:
                        for child in pt.extensions:
                            for subchild in child:
                                tag = subchild.tag.split("}")[-1] if "}" in subchild.tag else subchild.tag
                                try:
                                    ext[tag] = float(subchild.text)
                                except (TypeError, ValueError):
                                    ext[tag] = subchild.text
                    trackpoints.append({
                        "lat": pt.latitude,
                        "lon": pt.longitude,
                        "ele": pt.elevation,
                        "time": pt.time,
                        "speed": ext.get("speed"),
                        "course": ext.get("course"),
                        "hAcc": ext.get("hAcc"),
                        "vAcc": ext.get("vAcc"),
                        "route_file": gpx_file.name,
                    })

        if not trackpoints:
            continue

        df_track = pd.DataFrame(trackpoints)
        df_track["time"] = pd.to_datetime(df_track["time"], utc=True, errors="coerce").dt.tz_convert("UTC")
        all_tracks.append(df_track)

        # Per-route summary
        lats = [p["lat"] for p in trackpoints]
        lons = [p["lon"] for p in trackpoints]
        eles = [p["ele"] for p in trackpoints if p["ele"] is not None]
        times = [p["time"] for p in trackpoints if p["time"] is not None]
        speeds = [p["speed"] for p in trackpoints if p.get("speed") is not None]

        distance_km = sum(
            haversine(lats[i], lons[i], lats[i + 1], lons[i + 1])
            for i in range(len(lats) - 1)
        )

        elev_gain = sum(
            max(0, eles[i + 1] - eles[i]) for i in range(len(eles) - 1)
        ) if len(eles) > 1 else None

        duration_min = None
        start_time = None
        if len(times) >= 2:
            start_time = min(times)
            end_time = max(times)
            duration_min = (end_time - start_time).total_seconds() / 60

        avg_pace = float(duration_min / distance_km) if distance_km > 0 and duration_min else None
        avg_speed = float(sum(speeds) / len(speeds)) if speeds else None
        max_speed = float(max(speeds)) if speeds else None

        summaries.append({
            "route_file": gpx_file.name,
            "start_time": start_time,
            "distance_km": distance_km,
            "duration_min": duration_min,
            "elevation_gain_m": elev_gain,
            "avg_pace_min_per_km": avg_pace,
            "avg_speed_ms": avg_speed,
            "max_speed_ms": max_speed,
            "n_points": len(trackpoints),
        })

    df_summaries = pd.DataFrame(summaries)
    if not df_summaries.empty:
        df_summaries["start_time"] = pd.to_datetime(df_summaries["start_time"], utc=True, errors="coerce")
        df_summaries["date"] = df_summaries["start_time"].dt.normalize()
        df_summaries.to_parquet(data_dir / "routes.parquet", index=False)
        if verbose:
            print(f"Saved routes.parquet ({len(df_summaries)} routes)")

    if all_tracks:
        df_all_tracks = pd.concat(all_tracks, ignore_index=True)
        df_all_tracks.to_parquet(data_dir / "route_tracks.parquet", index=False)
        if verbose:
            print(f"Saved route_tracks.parquet ({len(df_all_tracks):,} trackpoints)")

    return df_summaries


if __name__ == "__main__":
    parse_routes()

"""Parse ECG CSV files → ecg.parquet (metadata) + ecg_waveforms/ (numpy arrays).

Run once: python src/parse_ecg.py
Outputs: data/ecg.parquet, data/ecg_waveforms/<filename>.npy
"""

from pathlib import Path
import pandas as pd
import numpy as np

ECG_DIR = Path(__file__).parent.parent / "electrocardiograms"
DATA_DIR = Path(__file__).parent.parent / "data"


def parse_ecg(ecg_dir=ECG_DIR, data_dir=DATA_DIR, verbose=True):
    data_dir.mkdir(exist_ok=True)
    waveform_dir = data_dir / "ecg_waveforms"
    waveform_dir.mkdir(exist_ok=True)

    csv_files = sorted(ecg_dir.glob("*.csv"))
    if verbose:
        print(f"Found {len(csv_files)} ECG CSV files")

    records = []

    for csv_file in csv_files:
        try:
            lines = csv_file.read_text(encoding="utf-8", errors="replace").splitlines()
        except Exception as e:
            if verbose:
                print(f"  SKIP {csv_file.name}: {e}")
            continue

        meta = {}
        voltage_lines = []
        in_data = False

        for line in lines:
            if not line.strip():
                continue
            if line.startswith("Lead,"):
                in_data = False
                continue
            if line.startswith("Unit,"):
                in_data = True
                continue
            if in_data:
                try:
                    voltage_lines.append(float(line.strip()))
                except ValueError:
                    pass
            else:
                parts = line.split(",", 1)
                if len(parts) == 2:
                    key = parts[0].strip()
                    val = parts[1].strip().strip('"')
                    meta[key] = val

        waveform = np.array(voltage_lines, dtype=np.float32)
        np.save(waveform_dir / (csv_file.stem + ".npy"), waveform)

        records.append({
            "filename": csv_file.name,
            "name": meta.get("Name"),
            "date_of_birth": meta.get("Date of Birth"),
            "recorded_date": meta.get("Recorded Date"),
            "classification": meta.get("Classification"),
            "symptoms": meta.get("Symptoms"),
            "software_version": meta.get("Software Version"),
            "device": meta.get("Device"),
            "sample_rate_hz": int(meta.get("Sample Rate", "512").split()[0]) if meta.get("Sample Rate") else 512,
            "n_samples": len(waveform),
            "duration_sec": len(waveform) / (int(meta.get("Sample Rate", "512 hertz").split()[0]) if meta.get("Sample Rate") else 512),
        })

        if verbose:
            print(f"  {csv_file.name}: {meta.get('Classification', '?')} — {len(waveform)} samples")

    df = pd.DataFrame(records)
    if not df.empty:
        df["recorded_date"] = pd.to_datetime(df["recorded_date"], format="%Y-%m-%d %H:%M:%S %z", utc=True, errors="coerce")
        df["date"] = df["recorded_date"].dt.normalize()
        df.to_parquet(data_dir / "ecg.parquet", index=False)
        if verbose:
            print(f"Saved ecg.parquet ({len(df)} recordings)")

    return df


if __name__ == "__main__":
    parse_ecg()

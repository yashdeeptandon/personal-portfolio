"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar, CartesianGrid,
} from "recharts";
import ChartCard from "@/components/ui/ChartCard";
import type { ECGRecording, ECGWaveform } from "@/types/health";
import { CHART } from "@/lib/chartTheme";

interface Props {
  recordings: ECGRecording[];
}

const ECG_COLORS: Record<string, string> = {
  "Sinus Rhythm": "#22c55e",
  "High Heart Rate": "#f59e0b",
  "Low Heart Rate": "#3b82f6",
  "Atrial Fibrillation": "#ef4444",
  "Inconclusive": "#6b7280",
};

function classColor(cls: string) {
  return ECG_COLORS[cls] ?? "#6366f1";
}

export default function ECGTab({ recordings }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(recordings[0]?.id ?? null);
  const [waveform, setWaveform] = useState<ECGWaveform | null>(null);
  const [loadingWave, setLoadingWave] = useState(false);
  const [zoomStart, setZoomStart] = useState(0);
  const [zoomSeconds, setZoomSeconds] = useState(10);

  const selected = recordings.find((r) => r.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId) return;
    const rec = recordings.find((r) => r.id === selectedId);
    if (!rec?.has_waveform) { setWaveform(null); return; }
    setLoadingWave(true);
    setWaveform(null);
    setZoomStart(0);
    fetch(`/api/health/ecg-waveforms/${selectedId}`)
      .then<ECGWaveform>((r) => r.json())
      .then((d) => setWaveform(d))
      .catch(() => setWaveform(null))
      .finally(() => setLoadingWave(false));
  }, [selectedId, recordings]);

  // Classification pie
  const classCounts = recordings.reduce<Record<string, number>>((acc, r) => {
    acc[r.classification] = (acc[r.classification] ?? 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(classCounts).map(([name, value]) => ({ name, value, color: classColor(name) }));

  // Timeline bar — recordings per month
  const monthCounts = recordings.reduce<Record<string, Record<string, number>>>((acc, r) => {
    const month = r.date.slice(0, 7);
    acc[month] = acc[month] ?? {};
    acc[month][r.classification] = (acc[month][r.classification] ?? 0) + 1;
    return acc;
  }, {});
  const timelineData = Object.entries(monthCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, classes]) => ({ month, ...classes }));

  // Waveform windowing
  const sampleRate = waveform?.sample_rate_hz ?? 128;
  const windowSamples = zoomSeconds * sampleRate;
  const startSample = Math.floor(zoomStart * sampleRate);
  const waveSlice = waveform?.voltage_uv.slice(startSample, startSample + windowSamples) ?? [];
  const waveChartData = waveSlice.map((v, i) => ({ t: ((startSample + i) / sampleRate).toFixed(2), v }));
  const maxStart = waveform ? Math.max(0, waveform.voltage_uv.length / sampleRate - zoomSeconds) : 0;

  return (
    <div className="space-y-4">
      {/* Classification charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <ChartCard title="ECG Classifications" subtitle={`${recordings.length} total recordings`}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="48%" outerRadius={80} innerRadius={40} dataKey="value" paddingAngle={2}>
                {pieData.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
                itemStyle={{ color: "#d1d5db", fontSize: 12 }}
                formatter={(v: unknown) => { const n = Number(v); return [`${n} recording${n !== 1 ? "s" : ""}`]; }}
              />
              <Legend
                wrapperStyle={{ fontSize: 11, color: CHART.TICK_FILL }}
                formatter={(value) => <span style={{ color: CHART.TICK_FILL }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Recordings Over Time" subtitle="Monthly ECG recording count">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={timelineData} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={CHART.GRID_STROKE} strokeOpacity={CHART.GRID_OPACITY} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: CHART.TICK_FILL, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: CHART.TICK_FILL, fontSize: 11 }} axisLine={false} tickLine={false} width={24} />
              <Tooltip
                contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
                itemStyle={{ color: "#d1d5db", fontSize: 12 }}
              />
              {Object.keys(ECG_COLORS).filter((cls) => classCounts[cls]).map((cls) => (
                <Bar key={cls} dataKey={cls} stackId="a" fill={classColor(cls)} radius={cls === Object.keys(classCounts).at(-1) ? [2, 2, 0, 0] : undefined} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Waveform viewer */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <label className="text-sm text-gray-400 shrink-0">ECG recording:</label>
          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
            className="flex-1 bg-gray-900 border border-white/20 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {recordings.map((r, i) => (
              <option key={`${r.id}_${i}`} value={r.id}>
                {r.date} — {r.classification}{r.has_waveform ? "" : " (no waveform)"}
              </option>
            ))}
          </select>
        </div>

        {selected && (
          <div className="flex flex-wrap gap-4 mb-4">
            {[
              { label: "Classification", value: selected.classification, color: classColor(selected.classification) },
              { label: "Date", value: new Date(selected.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) },
              { label: "Duration", value: selected.duration_sec ? `${selected.duration_sec.toFixed(0)}s` : "—" },
              { label: "Sample Rate", value: `${selected.sample_rate_hz} Hz` },
              { label: "Symptoms", value: selected.symptoms || "None" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="text-xs text-gray-500">{label}</div>
                <div className="text-sm font-medium mt-0.5" style={{ color: color ?? "#e5e7eb" }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {loadingWave && <div className="h-48 flex items-center justify-center text-gray-500 text-sm">Loading waveform…</div>}

        {!loadingWave && !selected?.has_waveform && (
          <div className="h-48 flex items-center justify-center text-gray-500 text-sm">No waveform data for this recording</div>
        )}

        {!loadingWave && waveform && waveChartData.length > 0 && (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={waveChartData} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="t" tick={{ fill: CHART.TICK_FILL, fontSize: 10 }} tickFormatter={(v) => `${v}s`} axisLine={false} tickLine={false} interval={Math.floor(waveChartData.length / 6)} />
                <YAxis tick={{ fill: CHART.TICK_FILL, fontSize: 10 }} axisLine={false} tickLine={false} width={44} tickFormatter={(v) => `${v.toFixed(0)}μV`} />
                <Tooltip
                  contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
                  itemStyle={{ color: "#d1d5db", fontSize: 11 }}
                  formatter={(v: unknown) => [`${Number(v).toFixed(1)} μV`, "Voltage"]}
                />
                <Line dataKey="v" stroke={classColor(selected?.classification ?? "")} strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>

            {/* Zoom / seek controls */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-20">Position:</span>
                <input
                  type="range"
                  min={0}
                  max={maxStart}
                  step={0.5}
                  value={zoomStart}
                  onChange={(e) => setZoomStart(Number(e.target.value))}
                  className="flex-1 accent-indigo-500"
                />
                <span className="text-xs text-gray-400 w-16 text-right">{zoomStart.toFixed(1)}s</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-20">Window:</span>
                <input
                  type="range"
                  min={2}
                  max={Math.min(30, Math.floor(waveform.voltage_uv.length / sampleRate))}
                  step={1}
                  value={zoomSeconds}
                  onChange={(e) => setZoomSeconds(Number(e.target.value))}
                  className="flex-1 accent-indigo-500"
                />
                <span className="text-xs text-gray-400 w-16 text-right">{zoomSeconds}s</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ECG metadata table */}
      <ChartCard title="ECG Recordings" subtitle="All Apple Watch ECG records">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-white/10">
                <th className="pb-2 text-left font-medium">Date</th>
                <th className="pb-2 text-left font-medium">Classification</th>
                <th className="pb-2 text-right font-medium">Duration</th>
                <th className="pb-2 text-left font-medium">Symptoms</th>
                <th className="pb-2 text-right font-medium">Waveform</th>
              </tr>
            </thead>
            <tbody>
              {recordings.map((r, i) => (
                <tr
                  key={`${r.id}_${i}`}
                  className={`border-b border-white/5 cursor-pointer transition-colors ${r.id === selectedId ? "bg-indigo-500/10" : "hover:bg-white/5"}`}
                  onClick={() => setSelectedId(r.id)}
                >
                  <td className="py-1.5 text-gray-300">{r.date}</td>
                  <td className="py-1.5" style={{ color: classColor(r.classification) }}>{r.classification}</td>
                  <td className="py-1.5 text-right text-gray-400">{r.duration_sec ? `${r.duration_sec.toFixed(0)}s` : "—"}</td>
                  <td className="py-1.5 text-gray-400">{r.symptoms || "—"}</td>
                  <td className="py-1.5 text-right">{r.has_waveform ? "✓" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

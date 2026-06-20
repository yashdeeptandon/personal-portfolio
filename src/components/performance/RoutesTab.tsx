"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import ChartCard from "@/components/ui/ChartCard";
import type { RouteSummary, RouteTrackPoint } from "@/types/health";
import { CHART } from "@/lib/chartTheme";

const RouteMapClient = dynamic(() => import("./RouteMapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm bg-white/5 rounded-xl">
      Loading map…
    </div>
  ),
});

interface Props {
  routes: RouteSummary[];
}

function fmtPace(minPerKm: number | null) {
  if (!minPerKm) return "—";
  const mins = Math.floor(minPerKm);
  const secs = Math.round((minPerKm - mins) * 60);
  return `${mins}:${String(secs).padStart(2, "0")} /km`;
}

export default function RoutesTab({ routes }: Props) {
  const sorted = [...routes].sort((a, b) => b.date.localeCompare(a.date));
  const [selectedId, setSelectedId] = useState<string | null>(sorted[0]?.id ?? null);
  const [trackData, setTrackData] = useState<RouteTrackPoint[] | null>(null);
  const [loadingTrack, setLoadingTrack] = useState(false);

  const selected = routes.find((r) => r.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId) return;
    setLoadingTrack(true);
    setTrackData(null);
    fetch(`/api/health/route-tracks/${selectedId}`)
      .then<{ id: string; points: RouteTrackPoint[] }>((r) => r.json())
      .then((d) => setTrackData(d.points))
      .catch(() => setTrackData([]))
      .finally(() => setLoadingTrack(false));
  }, [selectedId]);

  // Distance over time bar (all routes)
  const distanceByDate = sorted
    .filter((r) => r.distance_km)
    .slice(0, 30)
    .reverse()
    .map((r) => ({
      date: r.date,
      distance: r.distance_km,
    }));

  return (
    <div className="space-y-4">
      {/* Route selector */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <label className="text-sm text-gray-400 shrink-0">Select route:</label>
          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
            className="flex-1 bg-gray-900 border border-white/20 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {sorted.map((r) => (
              <option key={r.id} value={r.id}>
                {r.date} — {r.distance_km?.toFixed(2)} km
                {r.duration_min ? ` · ${Math.round(r.duration_min)} min` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Route KPIs */}
        {selected && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Distance", value: selected.distance_km ? `${selected.distance_km.toFixed(2)} km` : "—" },
              { label: "Duration", value: selected.duration_min ? `${Math.round(selected.duration_min)} min` : "—" },
              { label: "Avg Pace", value: fmtPace(selected.avg_pace_min_per_km) },
              { label: "Elevation Gain", value: selected.elevation_gain_m ? `${Math.round(selected.elevation_gain_m)} m` : "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 rounded-lg p-3">
                <div className="text-xs text-gray-500">{label}</div>
                <div className="text-white font-semibold text-sm mt-0.5">{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden" style={{ height: 380 }}>
        {loadingTrack && (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
            Loading track data…
          </div>
        )}
        {!loadingTrack && trackData !== null && (
          <RouteMapClient points={trackData} />
        )}
      </div>

      {/* Elevation + Speed profiles */}
      {trackData && trackData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <ChartCard title="Elevation Profile" subtitle="Metres above sea level">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trackData} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="eleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a16207" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#a16207" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={CHART.GRID_STROKE} strokeOpacity={CHART.GRID_OPACITY} vertical={false} />
                <XAxis hide />
                <YAxis
                  tick={{ fill: CHART.TICK_FILL, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${Math.round(v)}m`}
                  width={44}
                />
                <Tooltip
                  contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
                  itemStyle={{ color: "#d1d5db", fontSize: 12 }}
                  formatter={(v: unknown) => [`${Number(v).toFixed(1)} m`, "Elevation"]}
                />
                <Area dataKey="ele" stroke="#a16207" fill="url(#eleGrad)" strokeWidth={1.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Speed Profile" subtitle="km/h over the route">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trackData} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={CHART.GRID_STROKE} strokeOpacity={CHART.GRID_OPACITY} vertical={false} />
                <XAxis hide />
                <YAxis
                  tick={{ fill: CHART.TICK_FILL, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}`}
                  width={36}
                />
                <Tooltip
                  contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
                  itemStyle={{ color: "#d1d5db", fontSize: 12 }}
                  formatter={(v: unknown) => [`${Number(v).toFixed(1)} km/h`, "Speed"]}
                />
                <Line dataKey="speed_kmh" stroke="#14b8a6" strokeWidth={1.5} dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* All routes distance bar */}
      <ChartCard title="Route Distances" subtitle="Last 30 routes — km per run">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={distanceByDate} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART.GRID_STROKE} strokeOpacity={CHART.GRID_OPACITY} vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: CHART.TICK_FILL, fontSize: 10 }}
              axisLine={{ stroke: CHART.AXIS_STROKE }}
              tickLine={false}
              interval={4}
              tickFormatter={(s) => s.slice(5)}
            />
            <YAxis
              tick={{ fill: CHART.TICK_FILL, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}km`}
              width={40}
            />
            <Tooltip
              contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
              itemStyle={{ color: "#d1d5db", fontSize: 12 }}
              formatter={(v: unknown) => [`${Number(v).toFixed(2)} km`, "Distance"]}
            />
            <Bar dataKey="distance" fill={CHART.ACCENT_INDIGO} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Routes table */}
      <ChartCard title="All Routes" subtitle={`${routes.length} GPS-tracked activities`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-white/10">
                <th className="pb-2 text-left font-medium">Date</th>
                <th className="pb-2 text-right font-medium">Distance</th>
                <th className="pb-2 text-right font-medium">Duration</th>
                <th className="pb-2 text-right font-medium">Pace</th>
                <th className="pb-2 text-right font-medium">Elev Gain</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr
                  key={r.id}
                  className={`border-b border-white/5 cursor-pointer transition-colors ${r.id === selectedId ? "bg-indigo-500/10" : "hover:bg-white/5"}`}
                  onClick={() => setSelectedId(r.id)}
                >
                  <td className="py-1.5 text-gray-300">{r.date}</td>
                  <td className="py-1.5 text-right text-gray-400">{r.distance_km?.toFixed(2) ?? "—"} km</td>
                  <td className="py-1.5 text-right text-gray-400">{r.duration_min ? `${Math.round(r.duration_min)} min` : "—"}</td>
                  <td className="py-1.5 text-right text-gray-400">{fmtPace(r.avg_pace_min_per_km)}</td>
                  <td className="py-1.5 text-right text-gray-400">{r.elevation_gain_m ? `${Math.round(r.elevation_gain_m)} m` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

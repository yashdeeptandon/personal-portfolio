"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import ChartCard from "@/components/ui/ChartCard";
import type { RunningAnalytics, RouteSummary, RouteTrackPoint } from "@/types/health";
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
  analytics: RunningAnalytics | null;
  routes: RouteSummary[];
}

function fmtPace(minPerKm: number | null): string {
  if (!minPerKm || minPerKm <= 0) return "—";
  const mins = Math.floor(minPerKm);
  const secs = Math.round((minPerKm - mins) * 60);
  return `${mins}:${String(secs).padStart(2, "0")}/km`;
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export default function RunningTab({ analytics, routes }: Props) {
  const [trendView, setTrendView] = useState<"weekly" | "monthly">("monthly");
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [trackData, setTrackData] = useState<RouteTrackPoint[] | null>(null);
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [runsPage, setRunsPage] = useState(0);
  const PAGE_SIZE = 30;

  const totals = analytics?.totals;
  const allRuns = analytics?.all_runs ?? [];
  const weeklyData = analytics?.weekly ?? [];
  const monthlyData = analytics?.monthly ?? [];
  const byYear = analytics?.by_year ?? [];

  // Load GPS track when outdoor run selected
  useEffect(() => {
    if (!selectedRouteId) { setTrackData(null); return; }
    setLoadingTrack(true);
    setTrackData(null);
    fetch(`/api/health/route-tracks/${selectedRouteId}`)
      .then<{ id: string; points: RouteTrackPoint[] }>((r) => r.json())
      .then((d) => setTrackData(d.points))
      .catch(() => setTrackData([]))
      .finally(() => setLoadingTrack(false));
  }, [selectedRouteId]);

  const trendData = useMemo((): Array<{ week?: string; month?: string; distance_km: number; runs: number }> => {
    if (trendView === "weekly") return weeklyData.slice(-52);
    return monthlyData.slice(-24);
  }, [trendView, weeklyData, monthlyData]);

  const pieData = [
    { name: "Outdoor", value: totals?.outdoor_runs ?? 0, color: "#6366f1" },
    { name: "Indoor / Treadmill", value: totals?.indoor_runs ?? 0, color: "#14b8a6" },
  ].filter((d) => d.value > 0);

  // Rolling 40-run pace trend (most recent first → reverse for chart)
  const paceTrend = useMemo(() => {
    return allRuns
      .filter((r) => r.pace_min_per_km && r.distance_km && r.distance_km >= 1)
      .slice(0, 40)
      .reverse()
      .map((r, i) => ({
        i: i + 1,
        pace: r.pace_min_per_km,
        date: r.date,
        dist: r.distance_km,
      }));
  }, [allRuns]);

  const paginatedRuns = useMemo(
    () => allRuns.slice(runsPage * PAGE_SIZE, (runsPage + 1) * PAGE_SIZE),
    [allRuns, runsPage]
  );
  const totalPages = Math.ceil(allRuns.length / PAGE_SIZE);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) ?? null;

  if (!analytics || allRuns.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
        <p className="text-gray-400 text-sm">No running data found</p>
        <p className="text-gray-500 text-xs mt-1">Upload Apple Health export to populate running analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total Runs" value={String(totals?.total_runs ?? 0)} sub={`${totals?.outdoor_runs ?? 0} outdoor · ${totals?.indoor_runs ?? 0} indoor`} />
        <StatCard label="Total Distance" value={`${totals?.total_km?.toLocaleString() ?? "—"} km`} sub={`avg ${totals?.avg_distance_km ?? "—"} km/run`} />
        <StatCard label="Total Time" value={`${totals?.total_duration_h ?? "—"} h`} sub="running time" />
        <StatCard label="Avg Pace" value={fmtPace(totals?.avg_pace_min_per_km ?? null)} sub="min/km overall" />
        <StatCard label="Best Pace" value={fmtPace(totals?.best_pace_min_per_km ?? null)} sub="≥1 km run" />
        <StatCard label="Outdoor GPS" value={`${totals?.outdoor_runs ?? 0}`} sub={`${totals?.indoor_runs ?? 0} treadmill`} />
      </div>

      {/* Distance trend */}
      <ChartCard
        title="Running Distance"
        subtitle={trendView === "weekly" ? "Weekly km — last 52 weeks" : "Monthly km — last 24 months"}
      >
        <div className="flex gap-1 mb-3">
          {(["weekly", "monthly"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setTrendView(v)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${trendView === v ? "bg-indigo-500 text-white" : "text-gray-400 hover:text-gray-200"}`}
            >
              {v === "weekly" ? "Weekly" : "Monthly"}
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={trendData} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="runGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={CHART.GRID_STROKE} strokeOpacity={CHART.GRID_OPACITY} vertical={false} />
            <XAxis
              dataKey={trendView === "weekly" ? "week" : "month"}
              tick={{ fill: CHART.TICK_FILL, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={trendView === "weekly" ? 7 : 2}
              tickFormatter={(s: string) => s.slice(2, 7)}
            />
            <YAxis
              tick={{ fill: CHART.TICK_FILL, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}km`}
              width={44}
            />
            <Tooltip
              contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
              itemStyle={{ color: "#d1d5db", fontSize: 12 }}
              formatter={(v: unknown, name: unknown) => {
                const n = String(name);
                if (n === "distance_km") return [`${Number(v).toFixed(1)} km`, "Distance"] as [string, string];
                if (n === "runs") return [String(v), "Runs"] as [string, string];
                return [String(v), n] as [string, string];
              }}
              labelFormatter={(l: unknown) => String(l ?? "")}
            />
            <Area dataKey="distance_km" stroke="#6366f1" fill="url(#runGrad)" strokeWidth={2} dot={false} name="distance_km" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Pie + Pace trend */}
      <div className="grid md:grid-cols-2 gap-4">
        <ChartCard title="Indoor vs Outdoor" subtitle="Run type breakdown">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="48%" outerRadius={80} innerRadius={44} dataKey="value" paddingAngle={3}>
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
                formatter={(v: unknown, name: unknown) => [`${v} runs`, String(name ?? "")]}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: CHART.TICK_FILL }}
                formatter={(value) => <span style={{ color: CHART.TICK_FILL }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Pace Trend" subtitle="Last 40 runs ≥1 km — min/km">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={paceTrend} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={CHART.GRID_STROKE} strokeOpacity={CHART.GRID_OPACITY} vertical={false} />
              <XAxis dataKey="i" tick={false} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: CHART.TICK_FILL, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                reversed
                tickFormatter={(v) => fmtPace(v)}
                width={56}
              />
              <Tooltip
                contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
                itemStyle={{ color: "#d1d5db", fontSize: 12 }}
                formatter={(v: unknown) => [fmtPace(Number(v)), "Pace"]}
                labelFormatter={(i: unknown) => {
                  const run = paceTrend[Number(i) - 1];
                  return run ? `${run.date} · ${run.dist?.toFixed(2)} km` : "";
                }}
              />
              <Line dataKey="pace" stroke="#14b8a6" strokeWidth={1.5} dot={{ r: 2, fill: "#14b8a6" }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Yearly breakdown */}
      {byYear.length > 1 && (
        <ChartCard title="Distance by Year" subtitle="Total km per calendar year">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byYear} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={CHART.GRID_STROKE} strokeOpacity={CHART.GRID_OPACITY} vertical={false} />
              <XAxis dataKey="year" tick={{ fill: CHART.TICK_FILL, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: CHART.TICK_FILL, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}km`} width={44} />
              <Tooltip
                contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
                formatter={(v: unknown, name: unknown) => {
                  const n = String(name ?? "");
                  if (n === "distance_km") return [`${Number(v).toFixed(0)} km`, "Distance"] as [string, string];
                  if (n === "runs") return [String(v), "Runs"] as [string, string];
                  return [String(v), n] as [string, string];
                }}
              />
              <Bar dataKey="distance_km" fill={CHART.ACCENT_INDIGO} radius={[4, 4, 0, 0]} name="distance_km" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* All runs table */}
      <ChartCard title="All Runs" subtitle={`${allRuns.length} total · click outdoor run to view GPS route`}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 border-b border-white/10">
                <th className="pb-2 text-left font-medium">Date</th>
                <th className="pb-2 text-left font-medium">Type</th>
                <th className="pb-2 text-right font-medium">Distance</th>
                <th className="pb-2 text-right font-medium">Duration</th>
                <th className="pb-2 text-right font-medium">Pace</th>
                <th className="pb-2 text-right font-medium">Speed</th>
                <th className="pb-2 text-right font-medium">HR Avg</th>
                <th className="pb-2 text-right font-medium">Calories</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRuns.map((run) => {
                const isSelected = run.route_id === selectedRouteId;
                return (
                  <tr
                    key={run.date + (run.route_id ?? "")}
                    className={`border-b border-white/5 transition-colors ${run.is_outdoor ? "cursor-pointer" : ""} ${isSelected ? "bg-indigo-500/10" : run.is_outdoor ? "hover:bg-white/5" : ""}`}
                    onClick={() => {
                      if (!run.is_outdoor || !run.route_id) return;
                      setSelectedRouteId(isSelected ? null : run.route_id);
                    }}
                  >
                    <td className="py-1.5 text-gray-300">{run.date}</td>
                    <td className="py-1.5">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${run.is_outdoor ? "bg-indigo-500/15 text-indigo-400" : "bg-teal-500/15 text-teal-400"}`}>
                        {run.is_outdoor ? "🗺 Outdoor" : "🏃 Indoor"}
                      </span>
                    </td>
                    <td className="py-1.5 text-right text-gray-300">{run.distance_km != null ? `${run.distance_km.toFixed(2)} km` : "—"}</td>
                    <td className="py-1.5 text-right text-gray-400">{run.duration_min != null ? `${Math.round(run.duration_min)} min` : "—"}</td>
                    <td className="py-1.5 text-right text-gray-400">{fmtPace(run.pace_min_per_km)}</td>
                    <td className="py-1.5 text-right text-gray-400">{run.speed_kmh != null ? `${run.speed_kmh.toFixed(1)} km/h` : "—"}</td>
                    <td className="py-1.5 text-right text-gray-400">{run.hr_avg != null ? `${run.hr_avg} bpm` : "—"}</td>
                    <td className="py-1.5 text-right text-gray-400">{run.calories != null ? `${Math.round(run.calories)}` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
            <span className="text-xs text-gray-500">{runsPage * PAGE_SIZE + 1}–{Math.min((runsPage + 1) * PAGE_SIZE, allRuns.length)} of {allRuns.length}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setRunsPage((p) => Math.max(0, p - 1))}
                disabled={runsPage === 0}
                className="px-3 py-1 text-xs rounded bg-white/5 text-gray-400 disabled:opacity-30 hover:bg-white/10"
              >
                ← Prev
              </button>
              <button
                onClick={() => setRunsPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={runsPage >= totalPages - 1}
                className="px-3 py-1 text-xs rounded bg-white/5 text-gray-400 disabled:opacity-30 hover:bg-white/10"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </ChartCard>

      {/* GPS Route viewer — shown when outdoor run selected */}
      {selectedRouteId && (
        <div className="rounded-xl border border-indigo-500/30 bg-white/3 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">GPS Route</h3>
              {selectedRoute && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedRoute.date}
                  {selectedRoute.distance_km ? ` · ${selectedRoute.distance_km.toFixed(2)} km` : ""}
                  {selectedRoute.duration_min ? ` · ${Math.round(selectedRoute.duration_min)} min` : ""}
                  {selectedRoute.elevation_gain_m ? ` · +${Math.round(selectedRoute.elevation_gain_m)}m elev` : ""}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedRouteId(null)}
              className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded hover:bg-white/10"
            >
              Close ✕
            </button>
          </div>

          <div className="rounded-xl overflow-hidden border border-white/10" style={{ height: 320 }}>
            {loadingTrack && (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm bg-white/5">
                Loading track data…
              </div>
            )}
            {!loadingTrack && trackData !== null && <RouteMapClient points={trackData} />}
          </div>

          {trackData && trackData.length > 0 && (
            <div className="grid md:grid-cols-2 gap-3">
              <ChartCard title="Elevation" subtitle="Metres above sea level">
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={trackData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="eleGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a16207" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#a16207" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={CHART.GRID_STROKE} strokeOpacity={CHART.GRID_OPACITY} vertical={false} />
                    <XAxis hide />
                    <YAxis tick={{ fill: CHART.TICK_FILL, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v)}m`} width={40} />
                    <Tooltip
                      contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
                      formatter={(v: unknown) => [`${Number(v).toFixed(1)} m`, "Elevation"]}
                    />
                    <Area dataKey="ele" stroke="#a16207" fill="url(#eleGrad2)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartCard>
              <ChartCard title="Speed" subtitle="km/h over route">
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={trackData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke={CHART.GRID_STROKE} strokeOpacity={CHART.GRID_OPACITY} vertical={false} />
                    <XAxis hide />
                    <YAxis tick={{ fill: CHART.TICK_FILL, fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
                    <Tooltip
                      contentStyle={{ background: CHART.TOOLTIP_BG, border: `1px solid ${CHART.TOOLTIP_BORDER}`, borderRadius: 8 }}
                      formatter={(v: unknown) => [`${Number(v).toFixed(1)} km/h`, "Speed"]}
                    />
                    <Line dataKey="speed_kmh" stroke="#14b8a6" strokeWidth={1.5} dot={false} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

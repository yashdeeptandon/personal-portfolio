"use client";

import { type Dispatch, type SetStateAction } from "react";
import type { FilterState, TimeWindow, Granularity } from "@/lib/filterUtils";
import type { WorkoutType } from "@/types/health";

type Tab = "Overview" | "Activity" | "Heart" | "Performance" | "Running" | "ECG";

interface Props {
  filters: FilterState;
  setFilters: Dispatch<SetStateAction<FilterState>>;
  activeTab: Tab;
  dataTo: string;
  recordCount: number;
  workoutTypes: WorkoutType[];
  routeYears: number[];
  ecgClasses: string[];
  heatmapYears: number[];
}

const WINDOWS: { label: string; value: TimeWindow }[] = [
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
  { label: "6m", value: "6m" },
  { label: "1y", value: "1y" },
  { label: "2y", value: "2y" },
  { label: "All time", value: "all" },
  { label: "Custom", value: "custom" },
];

const GRAN_OPTIONS: { label: string; value: Granularity }[] = [
  { label: "Auto", value: "auto" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

function PillBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
        active
          ? "bg-indigo-500 text-white"
          : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export default function FilterBar({
  filters,
  setFilters,
  activeTab,
  dataTo,
  recordCount,
  workoutTypes,
  routeYears,
  ecgClasses,
  heatmapYears,
}: Props) {
  const set = <K extends keyof FilterState>(k: K, v: FilterState[K]) =>
    setFilters((f) => ({ ...f, [k]: v }));

  const toggleArr = <T,>(key: keyof FilterState, val: T) => {
    const current = filters[key] as T[];
    const next = current.includes(val)
      ? current.filter((x) => x !== val)
      : [...current, val];
    set(key, next as FilterState[typeof key]);
  };

  const showGranularity = activeTab === "Activity" || activeTab === "Heart";

  return (
    <div className="mb-4 rounded-xl border border-foreground/10 bg-foreground/5 p-3 space-y-2">
      {/* ── Row 1: Global time range ─────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-muted-foreground shrink-0">Range:</span>
        {WINDOWS.map((w) => (
          <PillBtn
            key={w.value}
            active={filters.timeWindow === w.value}
            onClick={() => set("timeWindow", w.value)}
          >
            {w.label}
          </PillBtn>
        ))}

        {filters.timeWindow === "custom" && (
          <>
            <input
              type="date"
              value={filters.customFrom}
              max={filters.customTo || dataTo}
              onChange={(e) => set("customFrom", e.target.value)}
              className="bg-foreground/10 border border-foreground/20 rounded px-2 py-1 text-xs text-foreground [color-scheme:light] dark:[color-scheme:dark]"
            />
            <span className="text-muted-foreground text-xs">→</span>
            <input
              type="date"
              value={filters.customTo}
              max={dataTo}
              onChange={(e) => set("customTo", e.target.value)}
              className="bg-foreground/10 border border-foreground/20 rounded px-2 py-1 text-xs text-foreground [color-scheme:light] dark:[color-scheme:dark]"
            />
          </>
        )}

        <span className="ml-auto text-xs text-muted-foreground shrink-0">
          {recordCount.toLocaleString()} records
        </span>
        <button
          onClick={() => setFilters((f) => ({
            ...f,
            timeWindow: "all",
            customFrom: "",
            customTo: "",
          }))}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Reset
        </button>
      </div>

      {/* ── Row 2: Granularity (Activity / Heart) ────────────────── */}
      {showGranularity && (
        <div className="flex flex-wrap gap-1.5 items-center border-t border-foreground/5 pt-2">
          <span className="text-xs text-muted-foreground shrink-0">View:</span>
          {GRAN_OPTIONS.map((g) => (
            <PillBtn
              key={g.value}
              active={filters.granularity === g.value}
              onClick={() => set("granularity", g.value)}
            >
              {g.label}
            </PillBtn>
          ))}
        </div>
      )}

      {/* ── Activity tab filters ──────────────────────────────────── */}
      {activeTab === "Activity" && (
        <div className="flex flex-wrap gap-3 items-center border-t border-foreground/5 pt-2">
          <span className="text-xs text-muted-foreground">Step goal:</span>
          <input
            type="number"
            value={filters.stepThreshold}
            min={0}
            step={500}
            onChange={(e) => set("stepThreshold", Number(e.target.value))}
            className="bg-foreground/10 border border-foreground/20 rounded px-2 py-1 text-xs text-foreground w-20"
          />
          <span className="text-xs text-muted-foreground">Heatmap year:</span>
          {heatmapYears.map((y) => (
            <PillBtn
              key={y}
              active={filters.heatmapYear === y}
              onClick={() => set("heatmapYear", y)}
            >
              {y}
            </PillBtn>
          ))}
        </div>
      )}

      {/* ── Heart tab filters ─────────────────────────────────────── */}
      {activeTab === "Heart" && (
        <div className="flex flex-wrap gap-2 items-center border-t border-foreground/5 pt-2">
          <span className="text-xs text-muted-foreground">Show:</span>
          {(
            [
              ["avg", "HR Avg"],
              ["max", "HR Max"],
              ["resting", "Resting HR"],
              ["hrv", "HRV"],
              ["spo2", "SpO₂"],
            ] as const
          ).map(([key, label]) => (
            <PillBtn
              key={key}
              active={filters.heartMetrics[key]}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  heartMetrics: {
                    ...f.heartMetrics,
                    [key]: !f.heartMetrics[key],
                  },
                }))
              }
            >
              {label}
            </PillBtn>
          ))}
        </div>
      )}

      {/* ── Performance tab filters ───────────────────────────────── */}
      {activeTab === "Performance" && workoutTypes.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center border-t border-foreground/5 pt-2">
          <span className="text-xs text-muted-foreground shrink-0">Workout types:</span>
          <PillBtn
            active={filters.workoutTypeFilter.length === 0}
            onClick={() => set("workoutTypeFilter", [])}
          >
            All
          </PillBtn>
          {workoutTypes.slice(0, 10).map((t) => (
            <PillBtn
              key={t.type}
              active={filters.workoutTypeFilter.includes(t.type)}
              onClick={() => toggleArr("workoutTypeFilter", t.type)}
            >
              {t.type}
            </PillBtn>
          ))}
        </div>
      )}

      {/* ── Running tab filters ────────────────────────────────────── */}
      {activeTab === "Running" && (
        <div className="flex flex-wrap gap-2 items-center border-t border-foreground/5 pt-2">
          <span className="text-xs text-muted-foreground shrink-0">Distance:</span>
          <input
            type="number"
            value={filters.routeMinKm}
            min={0}
            onChange={(e) => set("routeMinKm", Number(e.target.value))}
            className="bg-foreground/10 border border-foreground/20 rounded px-2 py-1 text-xs text-foreground w-16"
            placeholder="min"
          />
          <span className="text-xs text-muted-foreground">–</span>
          <input
            type="number"
            value={filters.routeMaxKm === 9999 ? "" : filters.routeMaxKm}
            min={0}
            onChange={(e) =>
              set("routeMaxKm", e.target.value ? Number(e.target.value) : 9999)
            }
            className="bg-foreground/10 border border-foreground/20 rounded px-2 py-1 text-xs text-foreground w-16"
            placeholder="max"
          />
          <span className="text-xs text-muted-foreground">km</span>

          {routeYears.length > 1 && (
            <>
              <span className="text-xs text-muted-foreground ml-2 shrink-0">Year:</span>
              <PillBtn
                active={filters.routeYear === null}
                onClick={() => set("routeYear", null)}
              >
                All
              </PillBtn>
              {routeYears.map((y) => (
                <PillBtn
                  key={y}
                  active={filters.routeYear === y}
                  onClick={() => set("routeYear", filters.routeYear === y ? null : y)}
                >
                  {y}
                </PillBtn>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── ECG tab filters ───────────────────────────────────────── */}
      {activeTab === "ECG" && ecgClasses.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center border-t border-foreground/5 pt-2">
          <span className="text-xs text-muted-foreground shrink-0">Classification:</span>
          <PillBtn
            active={filters.ecgClassifications.length === 0}
            onClick={() => set("ecgClassifications", [])}
          >
            All
          </PillBtn>
          {ecgClasses.map((c) => (
            <PillBtn
              key={c}
              active={filters.ecgClassifications.includes(c)}
              onClick={() => toggleArr("ecgClassifications", c)}
            >
              {c}
            </PillBtn>
          ))}
        </div>
      )}
    </div>
  );
}

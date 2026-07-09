"use client";

import type { TechPeriod } from "@/lib/tech-performance/period";

const PERIODS: { label: string; value: TechPeriod }[] = [
  { label: "Today", value: "today" },
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "This year", value: "year" },
  { label: "All time", value: "all" },
];

export default function PeriodSelector({
  value,
  onChange,
}: {
  value: TechPeriod;
  onChange: (period: TechPeriod) => void;
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap" role="radiogroup" aria-label="Time period">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          role="radio"
          aria-checked={value === p.value}
          onClick={() => onChange(p.value)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            value === p.value
              ? "bg-indigo-500 text-white"
              : "bg-foreground/5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

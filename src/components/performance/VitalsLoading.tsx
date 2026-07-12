"use client";

import { motion } from "framer-motion";
import { SkeletonCard } from "@/components/ui/Skeleton";

const ECG_PATH =
  "M0 40 H60 L75 40 L85 10 L100 70 L112 40 L122 25 L132 40 H190 L205 40 L215 10 L230 70 L242 40 L252 25 L262 40 H320";

/** ECG trace that keeps re-drawing itself — read as "checking your vitals". */
function ECGPulse() {
  return (
    <div className="flex items-center gap-3 text-rose-500 dark:text-rose-400">
      <svg viewBox="0 0 320 80" className="w-40 h-10 shrink-0" fill="none">
        <path d={ECG_PATH} stroke="currentColor" strokeOpacity={0.15} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <motion.path
          d={ECG_PATH}
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, pathOffset: 0 }}
          animate={{ pathLength: [0, 1], pathOffset: [0, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        />
      </svg>
      <span className="text-sm font-medium text-foreground/70">Loading vitals…</span>
    </div>
  );
}

export default function VitalsLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center py-6">
        <ECGPulse />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} className="h-28" />
        ))}
      </div>
      <SkeletonCard className="h-80" />
      <div className="grid md:grid-cols-2 gap-4">
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-64" />
      </div>
      <SkeletonCard className="h-72" />
    </div>
  );
}

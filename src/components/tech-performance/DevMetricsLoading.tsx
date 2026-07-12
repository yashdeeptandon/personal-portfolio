"use client";

import { motion } from "framer-motion";
import { SkeletonCard } from "@/components/ui/Skeleton";

const BAR_HEIGHTS = [0.4, 0.9, 0.55, 1, 0.7, 0.45];

/** Bars rising/falling like a commit graph rendering — read as "crunching your activity". */
function BarsPulse() {
  return (
    <div className="flex items-center gap-3 text-indigo-500 dark:text-indigo-400">
      <div className="flex items-end gap-1 h-10 w-14 shrink-0">
        {BAR_HEIGHTS.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 h-full rounded-sm bg-current"
            initial={{ scaleY: 0.2 }}
            animate={{ scaleY: [0.2, h, 0.2] }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.12,
            }}
            style={{ transformOrigin: "bottom" }}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-foreground/70">Loading dev metrics…</span>
    </div>
  );
}

export default function DevMetricsLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center py-6">
        <BarsPulse />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} className="h-28" />
        ))}
      </div>
      <SkeletonCard className="h-64" />
    </div>
  );
}

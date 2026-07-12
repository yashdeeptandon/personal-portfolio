"use client";

import { motion } from "framer-motion";

const PULSE_PATH = "M1 8.5h3l1.5-4L8 13l1.8-7 1.2 2.5h3";

/** Mini ECG trace, continuously redrawing — nav mark for the Vitals page. */
export function PulseIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={`inline-block ${className}`} aria-hidden="true">
      <path d={PULSE_PATH} stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" strokeOpacity={0.25} />
      <motion.path
        d={PULSE_PATH}
        stroke="currentColor"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, pathOffset: 0 }}
        animate={{ pathLength: [0, 1], pathOffset: [0, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  );
}

const BAR_HEIGHTS = [0.45, 1, 0.65, 0.85];

/** Mini equalizer bars, continuously pulsing — nav mark for the Dev Metrics page. */
export function BarsIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <span className={`inline-flex items-end gap-[1.5px] ${className}`} aria-hidden="true">
      {BAR_HEIGHTS.map((h, i) => (
        <motion.span
          key={i}
          className="flex-1 h-full rounded-[1px] bg-current"
          initial={{ scaleY: 0.25 }}
          animate={{ scaleY: [0.25, h, 0.25] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
          style={{ transformOrigin: "bottom" }}
        />
      ))}
    </span>
  );
}

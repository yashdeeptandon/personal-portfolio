"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number; // 0-100
  height?: number;
  trackClassName?: string;
  fillClassName?: string;
  fillColor?: string; // overrides fillClassName with a solid CSS color
  animate?: boolean;
}

/**
 * Generalized from the inline width-animate pattern in `Skills.tsx`
 * (`initial={{width:0}} whileInView={{width:'${level}%'}}`). Track/fill are
 * both overridable so this serves the homepage's light-track gradient look
 * and the dashboard's dark glass look from the same component.
 */
export default function ProgressBar({
  value,
  height = 6,
  trackClassName = "bg-gray-100 dark:bg-gray-600",
  fillClassName = "bg-linear-to-r from-blue-500 to-indigo-500",
  fillColor,
  animate = true,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className={`w-full rounded-full overflow-hidden ${trackClassName}`}
      style={{ height }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={`h-full rounded-full ${fillColor ? "" : fillClassName}`}
        style={fillColor ? { background: fillColor } : undefined}
        initial={{ width: 0 }}
        {...(animate
          ? { whileInView: { width: `${clamped}%` }, viewport: { once: true } }
          : { animate: { width: `${clamped}%` } })}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
      />
    </div>
  );
}

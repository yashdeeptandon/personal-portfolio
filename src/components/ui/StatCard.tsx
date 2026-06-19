"use client";

import { motion } from "framer-motion";
import CountUp from "./CountUp";

interface StatCardProps {
  label: string;
  value: number | null;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  icon?: React.ReactNode;
  accent?: string;
  sub?: string;
}

export default function StatCard({
  label,
  value,
  suffix = "",
  prefix = "",
  decimals = 0,
  icon,
  accent,
  sub,
}: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 flex flex-col gap-2"
    >
      {accent && (
        <div
          className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl"
          style={{ background: accent }}
        />
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-gray-400 uppercase">
          {label}
        </span>
        {icon && (
          <span className="text-gray-500" style={{ color: accent }}>
            {icon}
          </span>
        )}
      </div>

      <div className="text-2xl font-bold text-white tabular-nums">
        {value === null ? (
          <span className="text-gray-600">—</span>
        ) : (
          <CountUp
            target={value}
            suffix={suffix}
            prefix={prefix}
            decimals={decimals}
          />
        )}
      </div>

      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </motion.div>
  );
}

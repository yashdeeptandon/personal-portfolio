"use client";

import AnimatedSection from "./AnimatedSection";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export default function ChartCard({
  title,
  subtitle,
  children,
  className = "",
  fullWidth = false,
}: ChartCardProps) {
  return (
    <AnimatedSection
      className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 ${fullWidth ? "col-span-full" : ""} ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white tracking-wide">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
      {children}
    </AnimatedSection>
  );
}

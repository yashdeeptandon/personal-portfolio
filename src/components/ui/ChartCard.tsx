"use client";

import AnimatedSection from "./AnimatedSection";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  action?: React.ReactNode;
}

export default function ChartCard({
  title,
  subtitle,
  children,
  className = "",
  fullWidth = false,
  action,
}: ChartCardProps) {
  return (
    <AnimatedSection
      className={`rounded-xl border border-foreground/10 bg-foreground/5 backdrop-blur-sm p-5 ${fullWidth ? "col-span-full" : ""} ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground tracking-wide">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0 ml-4">{action}</div>}
      </div>
      {children}
    </AnimatedSection>
  );
}

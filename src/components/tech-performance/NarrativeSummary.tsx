"use client";

import ChartCard from "@/components/ui/ChartCard";

export default function NarrativeSummary({ narrative }: { narrative: string }) {
  return (
    <ChartCard title="Engineering Impact" subtitle="Auto-generated from the metrics above — no AI usage claimed or implied">
      <p className="text-sm text-foreground leading-relaxed">{narrative}</p>
    </ChartCard>
  );
}

import type { Metadata } from "next";
import PerformancePage from "@/components/performance/PerformancePage";

export const metadata: Metadata = {
  title: "Performance Data | Yashdeep Tandon",
  description:
    "Real Apple Health data pipeline: steps, heart rate, VO₂ Max, training load, and recovery metrics visualised with interactive charts.",
};

export default function Page() {
  return (
    // Performance dashboard always renders in dark mode — charts are designed for dark backgrounds
    <div className="dark bg-gray-950 min-h-screen">
      <PerformancePage />
    </div>
  );
}

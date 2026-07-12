import type { Metadata } from "next";
import PerformancePage from "@/components/performance/PerformancePage";

export const metadata: Metadata = {
  title: "Vitals | Yashdeep Tandon",
  description:
    "Real Apple Health data pipeline: steps, heart rate, VO₂ Max, training load, and recovery metrics visualised with interactive charts.",
};

export default function Page() {
  return (
    <div className="bg-background min-h-screen">
      <PerformancePage />
    </div>
  );
}

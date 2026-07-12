import type { Metadata } from "next";
import TechPerformancePage from "@/components/tech-performance/TechPerformancePage";

export const metadata: Metadata = {
  title: "Dev Metrics | Yashdeep Tandon",
  description:
    "A data-driven developer profile — coding activity, GitHub contributions, and engineering output, sourced live from WakaTime, GitHub, and other real tools.",
};

export default function Page() {
  return (
    <div className="bg-background min-h-screen">
      <TechPerformancePage />
    </div>
  );
}

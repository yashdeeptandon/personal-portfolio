import type { Metadata } from "next";
import TechPerformancePage from "@/components/tech-performance/TechPerformancePage";

export const metadata: Metadata = {
  title: "Tech Performance | Yashdeep Tandon",
  description:
    "A data-driven developer profile — coding activity, GitHub contributions, and engineering output, sourced live from WakaTime, GitHub, and other real tools.",
};

export default function Page() {
  return (
    // Tech Performance dashboard always renders in dark mode — charts are designed for dark backgrounds
    <div className="dark bg-gray-950 min-h-screen">
      <TechPerformancePage />
    </div>
  );
}

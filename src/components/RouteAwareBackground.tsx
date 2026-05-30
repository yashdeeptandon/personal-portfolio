"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const GlobalAnimatedBackground = dynamic(
  () => import("./GlobalAnimatedBackground"),
  { ssr: false }
);

export default function RouteAwareBackground() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <GlobalAnimatedBackground />;
}

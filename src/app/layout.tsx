// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import SessionProvider from "@/components/SessionProvider";
import RouteAwareBackground from "@/components/RouteAwareBackground";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
// ❗ Remove your GoogleAnalytics component for now; GTM/GA should be loaded
//     by your consent managers only AFTER consent.

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Yashdeep Tandon - Sr. Software Engineer Portfolio",
  description:
    "Professional portfolio showcasing software engineering skills, projects, and experience. Specializing in full-stack development with modern technologies.",
  keywords:
    "software engineer, full-stack developer, React, Next.js, TypeScript, portfolio",
  authors: [{ name: "Yashdeep Tandon" }],
  openGraph: {
    title: "Yashdeep Tandon - Sr. Software Engineer Portfolio",
    description:
      "Professional portfolio showcasing software engineering skills, projects, and experience.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head></head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <RouteAwareBackground />
        <SessionProvider>{children}</SessionProvider>

        {/* 📈 Vercel Analytics is fine; it won’t inject third-party cookies by itself.
            If you prefer, you can move it behind consent as well. */}
        <Analytics />
      </body>
    </html>
  );
}

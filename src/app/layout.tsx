import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yashdeep Tandon - Software Engineer Portfolio",
  description:
    "Professional portfolio showcasing software engineering skills, projects, and experience. Specializing in full-stack development with modern technologies.",
  keywords:
    "software engineer, full-stack developer, React, Next.js, TypeScript, portfolio",
  authors: [{ name: "Yashdeep Tandon" }],
  openGraph: {
    title: "Yashdeep Tandon - Software Engineer Portfolio",
    description:
      "Professional portfolio showcasing software engineering skills, projects, and experience.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <GoogleAnalytics gaId={process.env.GOOGLE_ANALYTICS_ID || "JY83MF1718"} />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter" />
        <Script src="https://api.ipify.org?format=json" strategy="afterInteractive" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        <Analytics />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

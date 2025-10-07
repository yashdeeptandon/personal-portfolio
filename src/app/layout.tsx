// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import SessionProvider from "@/components/SessionProvider";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
// ❗ Remove your GoogleAnalytics component for now; GTM/GA should be loaded
//     by your consent managers only AFTER consent.

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* 🔒 Load the GoTrust banner bundle BEFORE any tracking/vendor scripts */}
        <Script
          id="gotrust-bundle"
          src="https://ydt-aws-bucket.s3.ap-south-1.amazonaws.com/cookie-banner-uat.bundle.js"
          strategy="beforeInteractive"
          data-safe="true"
        />

        {/* ⚠️ OPTIONAL (for blocking tests only). Leave these in if you want to
            verify the baseline blocker stops them pre-consent; otherwise remove. */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter" />
        <Script src="https://api.ipify.org?format=json" strategy="afterInteractive" />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* 🍪 Banner mount point (must exist in DOM) */}
        <div id="gotrust-cookie-banner" data-consent-banner="gotrust" />

        {/* 🔧 Initialize AFTER DOM is ready, retry briefly, respect DNT */}
        <Script id="gotrust-init" strategy="afterInteractive">
          {`
            (function () {
              var selector = '#gotrust-cookie-banner';
              var props = {
                domainUrl: 'https://www.yashdeeptandon.me/',
                environment: 'https://dev.gotrust.tech',
                domain_id: '242',
                respectDNT: (navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes')
              };

              // avoid double init for this selector
              window.__GOTRUST_BANNER_INITED__ = window.__GOTRUST_BANNER_INITED__ || {};

              function tryInit(){
                if (!window.CookieBanner || typeof window.CookieBanner.init !== 'function') return false;
                if (window.__GOTRUST_BANNER_INITED__[selector]) return true;
                window.__GOTRUST_BANNER_INITED__[selector] = true;
                window.CookieBanner.init(selector, props);
                return true;
              }

              function ready(fn){
                if (document.readyState !== 'loading') fn();
                else document.addEventListener('DOMContentLoaded', fn);
              }

              ready(function(){
                if (tryInit()) return;
                var onReady = function(){
                  if (tryInit()) window.removeEventListener('CookieBannerReady', onReady);
                };
                window.addEventListener('CookieBannerReady', onReady);

                var attempts = 0;
                var t = setInterval(function(){
                  attempts++;
                  if (tryInit() || attempts > 20) clearInterval(t);
                }, 100);
              });
            })();
          `}
        </Script>

        {/* 🧠 Your app */}
        <SessionProvider>{children}</SessionProvider>

        {/* 📈 Vercel Analytics is fine; it won’t inject third-party cookies by itself.
            If you prefer, you can move it behind consent as well. */}
        <Analytics />
      </body>
    </html>
  );
}

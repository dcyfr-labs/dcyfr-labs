import type { Metadata } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import "./print.css";
import { ThemeProvider } from "@/components/theme-provider";
import {
  SITE_URL,
  SITE_TITLE,
  SITE_TITLE_PLAIN,
  SITE_DOMAIN,
  SITE_DESCRIPTION,
  getOgImageUrl,
  getTwitterImageUrl,
} from "@/lib/site-config";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BottomNav } from "@/components/bottom-nav";
import { Toaster } from "@/components/ui/sonner";
import { LoadingBar } from "@/components/loading-bar";
import { WebVitalsReporter } from "@/components/web-vitals-reporter";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { headers } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "optional",
  preload: true,
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "optional",
  preload: true,
  adjustFontFallback: true,
});

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "optional",
  preload: true,
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s — " + SITE_TITLE_PLAIN, // Use plain title for meta tags
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE_PLAIN,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_TITLE_PLAIN,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: getOgImageUrl(),
        width: 1200,
        height: 630,
        type: "image/png",
        alt: `${SITE_DOMAIN} — Developer Portfolio`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE_PLAIN,
    description: SITE_DESCRIPTION,
    images: [getTwitterImageUrl()],
  },
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      "application/atom+xml": [
        { url: `${SITE_URL}/feed`, title: `${SITE_TITLE} — All Content` },
        { url: `${SITE_URL}/blog/feed`, title: `${SITE_TITLE} — Blog` },
        { url: `${SITE_URL}/projects/feed`, title: `${SITE_TITLE} — Projects` },
      ],
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get nonce from proxy for CSP-compliant theme injection
  const nonce = (await headers()).get("x-nonce") || undefined;
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${newsreader.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem nonce={nonce}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
          >
            Skip to main content
          </a>
          <LoadingBar />
          <SiteHeader />
          <main id="main-content" className="min-h-[calc(100dvh-128px)] pb-20 md:pb-8">{children}</main>
          <SiteFooter />
          <BottomNav />
          <Toaster richColors position="top-center" />
          {/* Vercel Analytics & Speed Insights */}
          <Analytics mode="production" debug={false} />
          <SpeedInsights sampleRate={0.1} />
          {/* Web Vitals Tracking */}
          <WebVitalsReporter />
        </ThemeProvider>
      </body>
    </html>
  );
}

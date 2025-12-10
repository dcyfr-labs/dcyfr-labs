import type { Metadata } from "next";
import { Geist, Geist_Mono, Alegreya } from "next/font/google";
import "./globals.css";
import "@/styles/print.css";
import "@/styles/katex.css";
import { ThemeProvider } from "@/components/features/theme/theme-provider";
import { PageTransitionProvider } from "@/components/features/page-transition-provider";
import {
  SITE_URL,
  SITE_TITLE,
  SITE_TITLE_PLAIN,
  SITE_DOMAIN,
  SITE_DESCRIPTION,
  getOgImageUrl,
  getTwitterImageUrl,
} from "@/lib/site-config";
import { SiteHeader, SiteFooter, BottomNav } from "@/components/navigation";
import { Toaster } from "@/components/ui/sonner";
import { LayoutUtilities } from "@/components/features/layout-utilities";
import { DevBanner } from "@/components/features/dev-banner";
import { ScrollToAnchor } from "@/components/features/scroll-to-anchor";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AxiomWebVitals } from "next-axiom";
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

const alegreya = Alegreya({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
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
        { url: `${SITE_URL}/activity/feed`, title: `${SITE_TITLE} — Activity` },
        { url: `${SITE_URL}/blog/feed`, title: `${SITE_TITLE} — Blog` },
        { url: `${SITE_URL}/work/feed`, title: `${SITE_TITLE} — Portfolio` },
      ],
      "application/feed+json": [
        { url: `${SITE_URL}/activity/feed.json`, title: `${SITE_TITLE} — Activity (JSON)` },
        { url: `${SITE_URL}/blog/feed.json`, title: `${SITE_TITLE} — Blog (JSON)` },
        { url: `${SITE_URL}/work/feed.json`, title: `${SITE_TITLE} — Portfolio (JSON)` },
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
        {/* Font optimization */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Analytics & monitoring */}
        <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />
        <link rel="preconnect" href="https://vercel-insights.com" crossOrigin="anonymous" />
        
        {/* GitHub resources (for heatmap & avatars) */}
        <link rel="dns-prefetch" href="https://avatars.githubusercontent.com" />
        <link rel="dns-prefetch" href="https://github.githubassets.com" />
        
        {/* Giscus comments (loaded on blog posts) */}
        <link rel="dns-prefetch" href="https://giscus.app" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${alegreya.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem nonce={nonce}>
          <PageTransitionProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
            >
              Skip to main content
            </a>
            <LayoutUtilities />
            {/* Dev Banner: Only show in development environment */}
            {process.env.NODE_ENV === 'development' && <DevBanner />}
            <ScrollToAnchor offset={80} />
            <SiteHeader />
            <main id="main-content" className="min-h-[calc(100dvh-128px)] pb-8">{children}</main>
            <SiteFooter />
            {/* <BottomNav /> */}
            <Toaster richColors position="top-center" />
            {/* Vercel Analytics & Speed Insights - Only in production */}
            {process.env.NODE_ENV === 'production' && (
              <>
                <Analytics debug={false} />
                <SpeedInsights sampleRate={0.1} />
              </>
            )}
            {/* Axiom Web Vitals - Production only */}
            <AxiomWebVitals />
          </PageTransitionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

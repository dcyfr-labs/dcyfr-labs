/**
 * Web Vitals Tracking
 *
 * Tracks Core Web Vitals (CWV) metrics and sends them to Vercel Analytics.
 * Monitors performance against established budgets and provides real-time insights.
 *
 * Core Web Vitals Targets:
 * - LCP (Largest Contentful Paint): < 2.5s (good), < 4.0s (needs improvement)
 * - INP (Interaction to Next Paint): < 200ms (good), < 500ms (needs improvement)
 * - CLS (Cumulative Layout Shift): < 0.1 (good), < 0.25 (needs improvement)
 *
 * @see https://web.dev/vitals/
 * @see https://vercel.com/docs/speed-insights
 */

import type { Metric } from "web-vitals";

/**
 * Performance thresholds based on Web Vitals recommendations
 */
export const WEB_VITALS_THRESHOLDS = {
  LCP: {
    good: 2500, // 2.5s
    needsImprovement: 4000, // 4.0s
  },
  INP: {
    good: 200, // 200ms
    needsImprovement: 500, // 500ms
  },
  FCP: {
    good: 1800, // 1.8s
    needsImprovement: 3000, // 3.0s
  },
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
  },
  TTFB: {
    good: 800, // 800ms
    needsImprovement: 1800, // 1.8s
  },
} as const;

/**
 * Rating categories for Web Vitals
 */
export type WebVitalsRating = "good" | "needs-improvement" | "poor";

/**
 * Get rating for a metric based on thresholds
 */
export function getMetricRating(
  name: string,
  value: number
): WebVitalsRating {
  const thresholds =
    WEB_VITALS_THRESHOLDS[name as keyof typeof WEB_VITALS_THRESHOLDS];

  if (!thresholds) return "good";

  if (value <= thresholds.good) return "good";
  if (value <= thresholds.needsImprovement) return "needs-improvement";
  return "poor";
}

/**
 * Report Web Vitals to Vercel Analytics
 *
 * This function is called automatically by Next.js when web vitals are measured.
 * It sends the metrics to Vercel Speed Insights for visualization and analysis.
 *
 * @param metric - Web Vitals metric object
 */
export function reportWebVitals(metric: Metric): void {
  // Only report in production or when explicitly enabled
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_ENABLE_WEB_VITALS !== "true"
  ) {
    console.warn("[Web Vitals]", metric.name, metric.value, metric.rating);
    return;
  }

  // Send to Vercel Analytics (automatically handled by Speed Insights)
  // The data is available in the Vercel dashboard under Speed Insights

  // For custom analytics, you can also send to your own endpoint
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", metric.name, {
      value: Math.round(
        metric.name === "CLS" ? metric.value * 1000 : metric.value
      ),
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Log to console in development for debugging
  if (process.env.NODE_ENV === "development") {
    const rating = getMetricRating(metric.name, metric.value);
    const emoji = rating === "good" ? "✅" : rating === "needs-improvement" ? "⚠️" : "❌";
    
    console.warn(
      `[Web Vitals] ${emoji} ${metric.name}:`,
      metric.value.toFixed(2),
      `(${rating})`
    );
  }
}

/**
 * Initialize Web Vitals tracking
 *
 * Call this function in your root layout to start tracking Core Web Vitals.
 * It dynamically imports the web-vitals library to avoid blocking the main thread.
 */
export async function initWebVitals(): Promise<void> {
  try {
    const { onCLS, onINP, onLCP, onFCP, onTTFB } = await import("web-vitals");

    // Track Core Web Vitals
    onCLS(reportWebVitals);
    onINP(reportWebVitals);
    onLCP(reportWebVitals);
    onFCP(reportWebVitals);
    onTTFB(reportWebVitals);
  } catch (error) {
    console.warn("[Web Vitals] Failed to initialize:", error);
  }
}

/**
 * Get human-readable description for a metric
 */
export function getMetricDescription(name: string): string {
  const descriptions: Record<string, string> = {
    LCP: "Largest Contentful Paint - Loading performance",
    INP: "Interaction to Next Paint - Interactivity",
    FCP: "First Contentful Paint - Initial render",
    CLS: "Cumulative Layout Shift - Visual stability",
    TTFB: "Time to First Byte - Server response time",
  };

  return descriptions[name] || name;
}

/**
 * Format metric value for display
 */
export function formatMetricValue(name: string, value: number): string {
  if (name === "CLS") {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
}

// Type augmentation for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params: Record<string, unknown>
    ) => void;
  }
}

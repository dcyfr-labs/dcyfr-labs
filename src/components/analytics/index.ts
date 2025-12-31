/**
 * Analytics Components Index
 *
 * Reusable components for the analytics dashboard.
 * Extracted from AnalyticsClient.tsx for modularity and reusability.
 *
 * @module components/analytics
 */

export { AnalyticsOverview } from "./analytics-overview";
export { AnalyticsFilters } from "./analytics-filters";
export { AnalyticsTrending } from "./analytics-trending";
export { AnalyticsRecommendations } from "./analytics-recommendations";
export { AnalyticsInsights } from "./analytics-insights";
export { ConversionMetrics } from "./conversion-metrics";
export { default as VercelInsights } from "./vercel-insights";
export { VercelInsights as VercelInsightsComponent } from "./vercel-insights";

// Re-export types
export type {
  PostAnalytics,
  TopPost,
  MostSharedPost,
  AnalyticsSummary,
  AnalyticsData,
  DateRange,
} from "@/types/analytics";

export { DATE_RANGE_LABELS } from "@/types/analytics";

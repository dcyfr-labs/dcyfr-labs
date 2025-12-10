/**
 * Series Page Analytics Tracker
 *
 * Client component that tracks individual series page views with metadata.
 *
 * Usage:
 * ```tsx
 * <SeriesPageAnalyticsTracker
 *   series={{
 *     slug: series.slug,
 *     name: series.name,
 *     postCount: series.postCount,
 *     totalReadingTime: series.totalReadingTime
 *   }}
 * />
 * ```
 */

"use client";

import { useEffect } from "react";
import { trackSeriesView } from "@/lib/analytics";

interface SeriesPageAnalyticsTrackerProps {
  series: {
    slug: string;
    name: string;
    postCount: number;
    totalReadingTime: number;
  };
}

export function SeriesPageAnalyticsTracker({ series }: SeriesPageAnalyticsTrackerProps) {
  useEffect(() => {
    trackSeriesView(
      series.slug,
      series.name,
      series.postCount,
      series.totalReadingTime
    );
  }, [series.slug, series.name, series.postCount, series.totalReadingTime]);

  // This component doesn't render anything
  return null;
}

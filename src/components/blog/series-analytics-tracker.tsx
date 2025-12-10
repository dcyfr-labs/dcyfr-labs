/**
 * Series Index Analytics Tracker
 *
 * Client component that tracks series index page views with metadata.
 *
 * Usage:
 * ```tsx
 * <SeriesAnalyticsTracker seriesCount={allSeries.length} />
 * ```
 */

"use client";

import { useEffect } from "react";
import { trackSeriesIndexView } from "@/lib/analytics";

interface SeriesAnalyticsTrackerProps {
  seriesCount: number;
}

export function SeriesAnalyticsTracker({ seriesCount }: SeriesAnalyticsTrackerProps) {
  useEffect(() => {
    trackSeriesIndexView(seriesCount);
  }, [seriesCount]);

  // This component doesn't render anything
  return null;
}

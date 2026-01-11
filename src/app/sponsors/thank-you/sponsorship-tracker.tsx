"use client";

/**
 * Sponsorship Tracker Component
 *
 * Client component that tracks sponsor conversions when users land on the thank you page.
 * Uses session storage to prevent double-counting on page refreshes.
 */

import { useEffect } from "react";

interface SponsorshipTrackerProps {
  /** GitHub username of sponsor (optional) */
  sponsorName?: string | null;
  /** Sponsorship tier name (optional) */
  tierName?: string | null;
}

/**
 * Tracks sponsor conversion event once per session
 * Prevents double-counting using session storage
 */
export function SponsorshipTracker({ sponsorName, tierName }: SponsorshipTrackerProps) {
  useEffect(() => {
    // Check if already tracked in this session
    const tracked = sessionStorage.getItem("sponsor_conversion_tracked");

    if (!tracked) {
      // Track the conversion event
      trackSponsorConversion(sponsorName, tierName);

      // Mark as tracked for this session
      sessionStorage.setItem("sponsor_conversion_tracked", "true");
    }
  }, [sponsorName, tierName]);

  // This component doesn't render anything
  return null;
}

/**
 * Track sponsor conversion using Vercel Analytics
 */
async function trackSponsorConversion(sponsorName: string | null | undefined, tierName: string | null | undefined) {
  // Only track in browser
  if (typeof window === "undefined") {
    return;
  }

  // Debug mode in development
  if (process.env.NODE_ENV === "development") {
    console.warn("[Analytics] sponsor_conversion", {
      sponsor: sponsorName || "anonymous",
      tier: tierName || "unknown",
      timestamp: Date.now(),
    });
  }

  try {
    const { track } = await import("@vercel/analytics");
    track("sponsor_conversion", {
      sponsor: sponsorName || "anonymous",
      tier: tierName || "unknown",
      timestamp: Date.now(),
    });
  } catch (error) {
    // Gracefully handle analytics failures
    if (process.env.NODE_ENV === "development") {
      console.warn("[Analytics] Failed to track sponsor conversion:", error);
    }
  }
}

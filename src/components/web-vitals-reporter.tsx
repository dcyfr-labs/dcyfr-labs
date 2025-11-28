"use client";

/**
 * Web Vitals Reporter Component
 *
 * Client component that initializes Web Vitals tracking on mount.
 * This component should be included in the root layout to track
 * performance metrics across all pages.
 */

import { useEffect } from "react";
import { initWebVitals } from "@/lib/web-vitals";

export function WebVitalsReporter() {
  useEffect(() => {
    // Initialize Web Vitals tracking when component mounts
    initWebVitals();
  }, []);

  // This component doesn't render anything
  return null;
}

"use client";

import { useAnchorExpansion } from "@/lib/hooks";

/**
 * AnchorExpansionWrapper - Client-side wrapper to activate anchor expansion
 *
 * This component is necessary because useAnchorExpansion is a client hook,
 * but blog post pages are server components. This wrapper bridges the gap.
 *
 * Usage: Add this to any page that contains collapsed components
 * ```tsx
 * <AnchorExpansionWrapper />
 * ```
 */
export function AnchorExpansionWrapper() {
  useAnchorExpansion();
  return null; // This component doesn't render anything
}

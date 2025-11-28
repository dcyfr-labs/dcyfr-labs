"use client";

import { useViewTracking } from "@/hooks/use-view-tracking";

type ViewTrackerProps = {
  postId: string;
  enabled?: boolean;
};

/**
 * Client component for tracking blog post views
 * 
 * This component automatically tracks page views with anti-spam protection:
 * - Only counts views after 5 seconds of visible time
 * - Tracks page visibility changes
 * - One view per session per post per 30 minutes
 * - IP-based rate limiting
 * - Bot detection
 * 
 * Usage:
 * ```tsx
 * <ViewTracker postId={post.id} />
 * ```
 */
export function ViewTracker({ postId, enabled = true }: ViewTrackerProps) {
  useViewTracking(postId, enabled);

  // This component doesn't render anything visible
  // It only tracks views in the background
  return null;
}

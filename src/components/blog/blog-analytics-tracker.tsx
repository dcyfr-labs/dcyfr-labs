/**
 * Blog Post Analytics Tracker
 *
 * Client component that tracks comprehensive blog post analytics:
 * - Initial view event with post metadata
 * - Reading progress and completion
 * - Time on page and scroll depth
 * - Social media referrals (Twitter/X, DEV, LinkedIn, Reddit, HN, GitHub)
 *
 * Integrates with both:
 * - Custom view tracking system (Redis-backed counts)
 * - Vercel Analytics (custom events for insights)
 * - Referral tracking system (social media sources)
 *
 * Usage:
 * ```tsx
 * <BlogAnalyticsTracker
 *   post={{
 *     id: post.id,
 *     slug: post.slug,
 *     title: post.title,
 *     tags: post.tags,
 *     readingTime: post.readingTime.minutes
 *   }}
 * />
 * ```
 */

"use client";

import { useEffect } from "react";
import { useBlogAnalytics } from "@/hooks/use-blog-analytics";
import { trackBlogView } from "@/lib/analytics";
import { useReferralTracking } from "@/hooks/use-referral-tracking";

interface BlogAnalyticsTrackerProps {
  post: {
    id: string;
    slug: string;
    title: string;
    tags: string[];
    readingTime: number; // in minutes
  };
}

export function BlogAnalyticsTracker({ post }: BlogAnalyticsTrackerProps) {
  // Track reading progress and completion
  useBlogAnalytics({ slug: post.slug });

  // Track referrals from social media
  useReferralTracking(post.id);

  // Track initial page view
  useEffect(() => {
    trackBlogView(post.slug, post.title, post.tags, post.readingTime);
  }, [post.slug, post.title, post.tags, post.readingTime]);

  // This component doesn't render anything
  return null;
}

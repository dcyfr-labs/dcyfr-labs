/**
 * Custom Analytics Tracking Library
 *
 * Provides type-safe utilities for tracking custom events with Vercel Analytics.
 * All events are tracked client-side and server-side where appropriate.
 *
 * Features:
 * - Type-safe event tracking with TypeScript
 * - Client-side and server-side tracking
 * - Privacy-respecting (no PII collection)
 * - Graceful degradation when analytics unavailable
 * - Debug mode for development
 *
 * @see https://vercel.com/docs/analytics/custom-events
 */

// ============================================================================
// Event Type Definitions
// ============================================================================

/**
 * Blog Post Events
 */
export type BlogEvent =
  | {
      name: "blog_post_viewed";
      properties: {
        slug: string;
        title: string;
        tags: string[];
        readingTime: number; // in minutes
      };
    }
  | {
      name: "blog_post_completed";
      properties: {
        slug: string;
        timeSpent: number; // in seconds
        scrollDepth: number; // percentage (0-100)
      };
    }
  | {
      name: "blog_scroll_milestone";
      properties: {
        slug: string;
        milestone: 25 | 50 | 75 | 90; // percentage milestones
        timeOnPage: number; // seconds when milestone reached
      };
    }
  | {
      name: "blog_toc_clicked";
      properties: {
        slug: string;
        heading: string;
        level: number; // h2=2, h3=3
      };
    }
  | {
      name: "blog_related_post_clicked";
      properties: {
        fromSlug: string;
        toSlug: string;
        position: number; // 0-indexed
      };
    }
  | {
      name: "blog_code_copied";
      properties: {
        slug: string;
        language: string;
      };
    }
  | {
      name: "blog_share_clicked";
      properties: {
        slug: string;
        platform: "linkedin" | "facebook" | "reddit" | "copy";
      };
    };

/**
 * RIVET Component Events
 */
export type RivetEvent =
  | {
      name: "rivet_key_takeaway_viewed";
      properties: {
        slug: string;
        variant: "insight" | "security" | "warning" | "tip";
        title: string | null; // Optional title
        position: number; // 1-indexed position in post
      };
    }
  | {
      name: "rivet_role_based_cta_viewed";
      properties: {
        slug: string;
        role: "executive" | "developer" | "security";
        title: string;
        position: number; // 1-indexed position in post
      };
    }
  | {
      name: "rivet_role_based_cta_clicked";
      properties: {
        slug: string;
        role: "executive" | "developer" | "security";
        title: string;
        buttonText: string;
        buttonHref: string;
        position: number; // 1-indexed position in post
      };
    }
  | {
      name: "rivet_collapsible_section_toggled";
      properties: {
        slug: string;
        sectionId: string;
        title: string;
        action: "expanded" | "collapsed";
        position: number; // 1-indexed position in post
      };
    }
  | {
      name: "rivet_glossary_tooltip_viewed";
      properties: {
        slug: string;
        term: string;
        position: number; // 1-indexed position in post
      };
    }
  | {
      name: "rivet_section_share_clicked";
      properties: {
        slug: string;
        sectionId: string;
        sectionTitle: string;
        platform: "linkedin" | "twitter" | "copy";
        position: number; // 1-indexed position in post
      };
    };

/**
 * Series Events
 */
export type SeriesEvent =
  | {
      name: "series_index_viewed";
      properties: {
        seriesCount: number;
      };
    }
  | {
      name: "series_viewed";
      properties: {
        seriesSlug: string;
        seriesName: string;
        postCount: number;
        totalReadingTime: number; // in minutes
      };
    }
  | {
      name: "series_card_clicked";
      properties: {
        seriesSlug: string;
        seriesName: string;
        postCount: number;
        position: number; // 0-indexed position in grid
      };
    }
  | {
      name: "series_post_clicked";
      properties: {
        seriesSlug: string;
        seriesName: string;
        postSlug: string;
        postTitle: string;
        position: number; // position within series (1-indexed)
      };
    }
  | {
      name: "series_navigation_clicked";
      properties: {
        seriesSlug: string;
        fromPostSlug: string;
        toPostSlug: string;
        direction: "prev" | "next";
      };
    };

/**
 * Search and Filter Events
 */
export type SearchEvent =
  | {
      name: "blog_search_performed";
      properties: {
        query: string;
        resultsCount: number;
      };
    }
  | {
      name: "blog_tag_filtered";
      properties: {
        tags: string[];
        resultsCount: number;
      };
    }
  | {
      name: "blog_filters_cleared";
      properties: {
        hadSearch: boolean;
        hadTags: boolean;
      };
    }
  | {
      name: "project_filtered";
      properties: {
        tags: string[];
        resultsCount: number;
      };
    };

/**
 * Navigation Events
 */
export type NavigationEvent =
  | {
      name: "external_link_clicked";
      properties: {
        url: string;
        source: string; // page/component where click occurred
      };
    }
  | {
      name: "project_card_clicked";
      properties: {
        projectName: string;
        tags: string[];
      };
    }
  | {
      name: "github_heatmap_day_clicked";
      properties: {
        date: string;
        contributionCount: number;
      };
    }
  | {
      name: "theme_toggled";
      properties: {
        theme: "light" | "dark" | "system";
      };
    };

/**
 * Form and Interaction Events
 */
export type InteractionEvent =
  | {
      name: "contact_form_submitted";
      properties: {
        messageLength: number;
        hasGitHub: boolean;
        hasLinkedIn: boolean;
      };
    }
  | {
      name: "contact_form_error";
      properties: {
        error: string;
      };
    }
  | {
      name: "newsletter_signup_clicked";
      properties: {
        source: string;
      };
    }
  | {
      name: "resume_downloaded";
      properties: {
        source: string;
      };
    };

/**
 * Performance Events
 */
export type PerformanceEvent = {
  name: "performance_metric";
  properties: {
    metric: "LCP" | "FID" | "CLS" | "FCP" | "TTFB";
    value: number;
    rating: "good" | "needs-improvement" | "poor";
  };
};

/**
 * Union of all event types
 */
export type AnalyticsEvent =
  | BlogEvent
  | RivetEvent
  | SeriesEvent
  | SearchEvent
  | NavigationEvent
  | InteractionEvent
  | PerformanceEvent;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Sanitize properties for Vercel Analytics
 * Converts arrays to comma-separated strings since Vercel Analytics
 * only supports string, number, boolean, or null values
 */
function sanitizeProperties(
  properties: Record<string, unknown>
): Record<string, string | number | boolean | null> {
  const sanitized: Record<string, string | number | boolean | null> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (Array.isArray(value)) {
      // Convert arrays to comma-separated strings
      sanitized[key] = value.join(", ");
    } else if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      sanitized[key] = value;
    } else {
      // Convert other types to strings
      sanitized[key] = String(value);
    }
  }

  return sanitized;
}

// ============================================================================
// Core Tracking Functions
// ============================================================================

/**
 * Track a custom analytics event (client-side)
 *
 * @param event - The event to track with name and properties
 * @returns Promise that resolves when tracking completes
 *
 * @example
 * ```typescript
 * trackEvent({
 *   name: "blog_post_viewed",
 *   properties: {
 *     slug: "my-post",
 *     title: "My Post Title",
 *     tags: ["nextjs", "react"],
 *     readingTime: 5
 *   }
 * });
 * ```
 */
export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  // Only track in browser
  if (typeof window === "undefined") {
    return;
  }

  // Debug mode in development
  if (process.env.NODE_ENV === "development") {
    console.warn("[Analytics]", event.name, event.properties);
  }

  try {
    const { track } = await import("@vercel/analytics");
    // Convert arrays to comma-separated strings (Vercel Analytics requirement)
    const sanitizedProperties = sanitizeProperties(event.properties);
    track(event.name, sanitizedProperties);
  } catch (error) {
    // Gracefully handle analytics failures
    if (process.env.NODE_ENV === "development") {
      console.warn("[Analytics] Failed to track event:", error);
    }
  }
}

/**
 * Track a server-side analytics event
 *
 * Use this for events that happen on the server (API routes, server actions, etc.)
 *
 * @param event - The event to track with name and properties
 * @returns Promise that resolves when tracking completes
 *
 * @example
 * ```typescript
 * // In a server action or API route
 * await trackServerEvent({
 *   name: "contact_form_submitted",
 *   properties: {
 *     messageLength: 150,
 *     hasGitHub: true,
 *     hasLinkedIn: false
 *   }
 * });
 * ```
 */
export async function trackServerEvent(event: AnalyticsEvent): Promise<void> {
  // Only track on server
  if (typeof window !== "undefined") {
    return;
  }

  // Debug mode in development
  if (process.env.NODE_ENV === "development") {
    console.warn("[Analytics Server]", event.name, event.properties);
  }

  try {
    const { track } = await import("@vercel/analytics/server");
    // Convert arrays to comma-separated strings (Vercel Analytics requirement)
    const sanitizedProperties = sanitizeProperties(event.properties);
    await track(event.name, sanitizedProperties);
  } catch (error) {
    // Gracefully handle analytics failures
    if (process.env.NODE_ENV === "development") {
      console.warn("[Analytics Server] Failed to track event:", error);
    }
  }
}

// ============================================================================
// Convenience Functions for Common Events
// ============================================================================

/**
 * Track blog post view
 */
export function trackBlogView(
  slug: string,
  title: string,
  tags: string[],
  readingTime: number
) {
  return trackEvent({
    name: "blog_post_viewed",
    properties: { slug, title, tags, readingTime },
  });
}

/**
 * Track blog post completion (user spent time and scrolled)
 */
export function trackBlogCompleted(
  slug: string,
  timeSpent: number,
  scrollDepth: number
) {
  return trackEvent({
    name: "blog_post_completed",
    properties: { slug, timeSpent, scrollDepth },
  });
}

/**
 * Track blog scroll milestone (25%, 50%, 75%, 90%)
 */
export function trackScrollMilestone(
  slug: string,
  milestone: 25 | 50 | 75 | 90,
  timeOnPage: number
) {
  return trackEvent({
    name: "blog_scroll_milestone",
    properties: { slug, milestone, timeOnPage },
  });
}

/**
 * Track table of contents navigation
 */
export function trackToCClick(slug: string, heading: string, level: number) {
  return trackEvent({
    name: "blog_toc_clicked",
    properties: { slug, heading, level },
  });
}

/**
 * Track related post click
 */
export function trackRelatedPostClick(
  fromSlug: string,
  toSlug: string,
  position: number
) {
  return trackEvent({
    name: "blog_related_post_clicked",
    properties: { fromSlug, toSlug, position },
  });
}

/**
 * Track code block copy
 */
export function trackCodeCopy(slug: string, language: string) {
  return trackEvent({
    name: "blog_code_copied",
    properties: { slug, language },
  });
}

/**
 * Track social share
 */
export function trackShare(
  slug: string,
  platform: "linkedin" | "facebook" | "reddit" | "copy"
) {
  return trackEvent({
    name: "blog_share_clicked",
    properties: { slug, platform },
  });
}

/**
 * Track search query
 */
export function trackSearch(query: string, resultsCount: number) {
  return trackEvent({
    name: "blog_search_performed",
    properties: { query, resultsCount },
  });
}

/**
 * Track tag filter
 */
export function trackTagFilter(tags: string[], resultsCount: number) {
  return trackEvent({
    name: "blog_tag_filtered",
    properties: { tags, resultsCount },
  });
}

/**
 * Track project tag filter
 */
export function trackProjectFilter(tags: string[], resultsCount: number) {
  return trackEvent({
    name: "project_filtered",
    properties: { tags, resultsCount },
  });
}

/**
 * Track filter clear
 */
export function trackFiltersClear(hadSearch: boolean, hadTags: boolean) {
  return trackEvent({
    name: "blog_filters_cleared",
    properties: { hadSearch, hadTags },
  });
}

/**
 * Track external link click
 */
export function trackExternalLink(url: string, source: string) {
  return trackEvent({
    name: "external_link_clicked",
    properties: { url, source },
  });
}

/**
 * Track project card click
 */
export function trackProjectClick(projectName: string, tags: string[]) {
  return trackEvent({
    name: "project_card_clicked",
    properties: { projectName, tags },
  });
}

/**
 * Track GitHub heatmap interaction
 */
export function trackHeatmapClick(date: string, contributionCount: number) {
  return trackEvent({
    name: "github_heatmap_day_clicked",
    properties: { date, contributionCount },
  });
}

/**
 * Track theme toggle
 */
export function trackThemeToggle(theme: "light" | "dark" | "system") {
  return trackEvent({
    name: "theme_toggled",
    properties: { theme },
  });
}

/**
 * Track contact form submission (server-side)
 */
export function trackContactFormSubmission(
  messageLength: number,
  hasGitHub: boolean,
  hasLinkedIn: boolean
) {
  return trackServerEvent({
    name: "contact_form_submitted",
    properties: { messageLength, hasGitHub, hasLinkedIn },
  });
}

/**
 * Track contact form error
 */
export function trackContactFormError(error: string) {
  return trackEvent({
    name: "contact_form_error",
    properties: { error },
  });
}

/**
 * Track newsletter signup click
 */
export function trackNewsletterClick(source: string) {
  return trackEvent({
    name: "newsletter_signup_clicked",
    properties: { source },
  });
}

/**
 * Track resume download
 */
export function trackResumeDownload(source: string) {
  return trackEvent({
    name: "resume_downloaded",
    properties: { source },
  });
}

/**
 * Track web vitals performance metric
 */
export function trackPerformanceMetric(
  metric: "LCP" | "FID" | "CLS" | "FCP" | "TTFB",
  value: number,
  rating: "good" | "needs-improvement" | "poor"
) {
  return trackEvent({
    name: "performance_metric",
    properties: { metric, value, rating },
  });
}

/**
 * Track series index page view
 */
export function trackSeriesIndexView(seriesCount: number) {
  return trackEvent({
    name: "series_index_viewed",
    properties: { seriesCount },
  });
}

/**
 * Track series page view
 */
export function trackSeriesView(
  seriesSlug: string,
  seriesName: string,
  postCount: number,
  totalReadingTime: number
) {
  return trackEvent({
    name: "series_viewed",
    properties: { seriesSlug, seriesName, postCount, totalReadingTime },
  });
}

/**
 * Track series card click
 */
export function trackSeriesCardClick(
  seriesSlug: string,
  seriesName: string,
  postCount: number,
  position: number
) {
  return trackEvent({
    name: "series_card_clicked",
    properties: { seriesSlug, seriesName, postCount, position },
  });
}

/**
 * Track series post click
 */
export function trackSeriesPostClick(
  seriesSlug: string,
  seriesName: string,
  postSlug: string,
  postTitle: string,
  position: number
) {
  return trackEvent({
    name: "series_post_clicked",
    properties: { seriesSlug, seriesName, postSlug, postTitle, position },
  });
}

/**
 * Track series navigation (prev/next) click
 */
export function trackSeriesNavigation(
  seriesSlug: string,
  fromPostSlug: string,
  toPostSlug: string,
  direction: "prev" | "next"
) {
  return trackEvent({
    name: "series_navigation_clicked",
    properties: { seriesSlug, fromPostSlug, toPostSlug, direction },
  });
}

// ============================================================================
// RIVET Component Tracking Functions
// ============================================================================

/**
 * Track KeyTakeaway component view (intersection observer)
 */
export function trackKeyTakeawayView(
  slug: string,
  variant: "insight" | "security" | "warning" | "tip",
  title: string | null,
  position: number
) {
  return trackEvent({
    name: "rivet_key_takeaway_viewed",
    properties: { slug, variant, title, position },
  });
}

/**
 * Track RoleBasedCTA component view (intersection observer)
 */
export function trackRoleBasedCTAView(
  slug: string,
  role: "executive" | "developer" | "security",
  title: string,
  position: number
) {
  return trackEvent({
    name: "rivet_role_based_cta_viewed",
    properties: { slug, role, title, position },
  });
}

/**
 * Track RoleBasedCTA button click
 */
export function trackRoleBasedCTAClick(
  slug: string,
  role: "executive" | "developer" | "security",
  title: string,
  buttonText: string,
  buttonHref: string,
  position: number
) {
  return trackEvent({
    name: "rivet_role_based_cta_clicked",
    properties: { slug, role, title, buttonText, buttonHref, position },
  });
}

/**
 * Track CollapsibleSection toggle (expand/collapse)
 */
export function trackCollapsibleSectionToggle(
  slug: string,
  sectionId: string,
  title: string,
  action: "expanded" | "collapsed",
  position: number
) {
  return trackEvent({
    name: "rivet_collapsible_section_toggled",
    properties: { slug, sectionId, title, action, position },
  });
}

/**
 * Track GlossaryTooltip view (hover or click)
 */
export function trackGlossaryTooltipView(
  slug: string,
  term: string,
  position: number
) {
  return trackEvent({
    name: "rivet_glossary_tooltip_viewed",
    properties: { slug, term, position },
  });
}

/**
 * Track SectionShare button click
 */
export function trackSectionShareClick(
  slug: string,
  sectionId: string,
  sectionTitle: string,
  platform: "linkedin" | "twitter" | "copy",
  position: number
) {
  return trackEvent({
    name: "rivet_section_share_clicked",
    properties: { slug, sectionId, sectionTitle, platform, position },
  });
}

// ============================================================================
// Utility Functions (Continued)
// ============================================================================

/**
 * Sanitize URL for privacy (remove query params with sensitive data)
 */
export function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove common sensitive query params
    const sensitiveParams = ["token", "key", "secret", "password", "email"];
    sensitiveParams.forEach((param) => {
      urlObj.searchParams.delete(param);
    });
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Check if analytics is enabled
 */
export function isAnalyticsEnabled(): boolean {
  return (
    typeof window !== "undefined" &&
    process.env.NODE_ENV === "production" &&
    !!process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID
  );
}

// ============================================================================
// Re-export Referral Tracker
// ============================================================================

export {
  detectReferralSource,
  trackReferral,
  shouldTrackReferral,
  getPlatformDisplayName,
  type ReferralSource,
  type ReferralTrackingResult,
} from "./analytics/referral-tracker";

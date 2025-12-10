/**
 * Type definitions for Inngest events and function payloads
 * 
 * @remarks
 * All events follow the pattern: "category/resource.action"
 * - category: domain area (contact, blog, github)
 * - resource: specific entity (form, post, data)
 * - action: what happened (submitted, viewed, refreshed)
 * 
 * @see https://www.inngest.com/docs/guides/typing-inngest-functions
 */

/**
 * Contact form submission event
 * Triggered when a user submits the contact form
 */
export interface ContactFormSubmittedEvent {
  name: "contact/form.submitted";
  data: {
    name: string;
    email: string;
    message: string;
    /** ISO timestamp of submission */
    submittedAt: string;
    /** User's IP address (for rate limiting context) */
    ip?: string;
  };
}

/**
 * Email delivery status event
 * Triggered after attempting to send an email
 */
export interface EmailDeliveryEvent {
  name: "contact/email.delivered" | "contact/email.failed";
  data: {
    email: string;
    type: "notification" | "confirmation";
    messageId?: string;
    error?: string;
  };
}

/**
 * Blog post view event
 * Triggered when a user views a blog post
 */
export interface BlogPostViewedEvent {
  name: "blog/post.viewed";
  data: {
    /** Permanent post identifier (from post.id field) */
    postId: string;
    slug: string;
    title: string;
    /** ISO timestamp of view */
    viewedAt: string;
    /** Referring URL if available */
    referrer?: string;
    /** User's country/region if available */
    region?: string;
  };
}

/**
 * Blog milestone event
 * Triggered when a post reaches a view milestone
 */
export interface BlogMilestoneEvent {
  name: "blog/milestone.reached";
  data: {
    slug: string;
    title: string;
    milestone: 100 | 1000 | 10000 | 50000 | 100000;
    totalViews: number;
    /** ISO timestamp when milestone was reached */
    reachedAt: string;
  };
}

/**
 * GitHub data refresh event
 * Triggered on scheduled refresh or manual request
 */
export interface GitHubDataRefreshEvent {
  name: "github/data.refresh";
  data: {
    /** Manual refresh requested by user */
    manual?: boolean;
    /** Force refresh even if cache is valid */
    force?: boolean;
  };
}

/**
 * Analytics summary event
 * Triggered on schedule (daily/weekly/monthly)
 */
export interface AnalyticsSummaryEvent {
  name: "analytics/summary.generate";
  data: {
    period: "daily" | "weekly" | "monthly";
    /** ISO timestamp for start of period */
    startDate: string;
    /** ISO timestamp for end of period */
    endDate: string;
  };
}

/**
 * Google Indexing API events
 * Triggered when submitting URLs to Google for indexing
 */
export interface GoogleUrlSubmitEvent {
  name: "google/url.submit";
  data: {
    /** Full URL to submit for indexing */
    url: string;
    /** Type of notification (default: URL_UPDATED) */
    type?: "URL_UPDATED" | "URL_DELETED";
  };
}

export interface GoogleUrlDeleteEvent {
  name: "google/url.delete";
  data: {
    /** Full URL to remove from index */
    url: string;
  };
}

export interface GoogleBatchSubmitEvent {
  name: "google/urls.batch-submit";
  data: {
    /** Array of URLs to submit */
    urls: string[];
  };
}

/**
 * Union type of all Inngest events in the application
 */
export type InngestEvents =
  | ContactFormSubmittedEvent
  | EmailDeliveryEvent
  | BlogPostViewedEvent
  | BlogMilestoneEvent
  | GitHubDataRefreshEvent
  | AnalyticsSummaryEvent
  | GoogleUrlSubmitEvent
  | GoogleUrlDeleteEvent
  | GoogleBatchSubmitEvent;

/**
 * Analytics data structures
 */
export interface PostAnalytics {
  slug: string;
  title: string;
  views: number;
  uniqueViews: number;
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  trending: boolean;
  /** Views per day for the last 30 days */
  viewHistory: Array<{
    date: string;
    views: number;
  }>;
}

export interface TrendingPost {
  slug: string;
  title: string;
  views: number;
  recentViews: number;
  growthRate: number;
  tags: string[];
}

export interface AnalyticsSummary {
  period: "daily" | "weekly" | "monthly";
  startDate: string;
  endDate: string;
  totalViews: number;
  uniqueVisitors: number;
  topPosts: Array<{
    slug: string;
    title: string;
    views: number;
  }>;
  trendingPosts: TrendingPost[];
  newMilestones: Array<{
    slug: string;
    title: string;
    milestone: number;
  }>;
  topReferrers?: Array<{
    source: string;
    views: number;
  }>;
}

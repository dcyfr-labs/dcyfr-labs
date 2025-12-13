/**
 * Analytics Data Types
 * 
 * Shared types for analytics dashboard components.
 * Extracted from AnalyticsClient.tsx for reusability.
 */

export interface PostAnalytics {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  tags: string[];
  archived?: boolean;
  draft?: boolean;
  views: number;
  views24h: number;
  viewsRange: number;
  shares: number;
  shares24h: number;
  comments: number;
  comments24h: number;
  readingTime: {
    words: number;
    minutes: number;
    text: string;
  };
}

export interface TopPost {
  slug: string;
  title: string;
  views: number;
  views24h: number;
  viewsRange: number;
  shares: number;
  shares24h: number;
  comments: number;
  comments24h: number;
}

export interface MostSharedPost {
  slug: string;
  title: string;
  views: number;
  shares: number;
  shares24h: number;
  comments: number;
  comments24h: number;
}

export interface AnalyticsSummary {
  totalPosts: number;
  totalViews: number;
  totalViewsRange: number;
  totalShares: number;
  totalComments: number;
  averageViews: number;
  averageViewsRange: number;
  averageShares: number;
  averageComments: number;
  topPost: TopPost | null;
  topPostRange: TopPost | null;
  mostSharedPost: MostSharedPost | null;
  mostCommentedPost: MostSharedPost | null;
}

export interface AnalyticsData {
  success: boolean;
  timestamp: string;
  dateRange: string;
  summary: AnalyticsSummary;
  posts: PostAnalytics[];
  trending: PostAnalytics[];
  // Optional Vercel analytics data (added for Vercel integration)
  vercel?: {
    topPages: { path: string; views: number; url?: string }[] | null;
    topReferrers: { referrer: string; views: number }[] | null;
    topDevices: { device: string; views: number }[] | null;
  } | null;
  vercelLastSynced?: string | null;
}

// Vercel analytics types
export type VercelTopPage = { path: string; views: number; url?: string };
export type VercelReferrer = { referrer: string; views: number };
export type VercelDevice = { device: string; views: number };

export interface VercelAnalytics {
  topPages: VercelTopPage[] | null;
  topReferrers: VercelReferrer[] | null;
  topDevices: VercelDevice[] | null;
}

export type DateRange = "1" | "7" | "30" | "90" | "all";

export const DATE_RANGE_LABELS: Record<DateRange, string> = {
  "1": "1 Day",
  "7": "7 Days",
  "30": "30 Days",
  "90": "90 Days",
  "all": "All Time",
};

/**
 * Daily time-series data for charts
 */
export interface DailyData {
  date: string; // ISO date or formatted string
  views: number;
  shares: number;
  comments: number;
  engagement: number;
}

/**
 * Publication date cohort filters
 */
export type PublicationCohort = 
  | "last-7-days"
  | "last-30-days"
  | "last-90-days"
  | "this-quarter"
  | "last-quarter"
  | "this-year"
  | "last-year"
  | "all";

export const PUBLICATION_COHORT_LABELS: Record<PublicationCohort, string> = {
  "last-7-days": "Last 7 Days",
  "last-30-days": "Last 30 Days",
  "last-90-days": "Last 90 Days",
  "this-quarter": "This Quarter",
  "last-quarter": "Last Quarter",
  "this-year": "This Year",
  "last-year": "Last Year",
  "all": "All Time",
};

/**
 * Performance tier filters
 */
export type PerformanceTierFilter = "all" | "top" | "above-average" | "below-average" | "needs-attention";

export const PERFORMANCE_TIER_LABELS: Record<PerformanceTierFilter, string> = {
  "all": "All Posts",
  "top": "Top 10%",
  "above-average": "Above Average",
  "below-average": "Below Average",
  "needs-attention": "Needs Attention",
};

/**
 * Tag filter mode (AND vs OR logic)
 */
export type TagFilterMode = "AND" | "OR";

/**
 * Filter preset configurations
 */
export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: {
    performanceTier?: PerformanceTierFilter;
    publicationCohort?: PublicationCohort;
    tags?: string[];
    tagMode?: TagFilterMode;
    hideDrafts?: boolean;
    hideArchived?: boolean;
  };
}

export const DEFAULT_FILTER_PRESETS: FilterPreset[] = [
  {
    id: "top-performers",
    name: "Top Performers",
    description: "Best performing posts (Top 10%)",
    filters: {
      performanceTier: "top",
      hideDrafts: true,
      hideArchived: true,
    },
  },
  {
    id: "needs-attention",
    name: "Needs Attention",
    description: "Low performing posts that need optimization",
    filters: {
      performanceTier: "needs-attention",
      hideDrafts: true,
      hideArchived: true,
    },
  },
  {
    id: "recent-posts",
    name: "Recent Posts",
    description: "Posts from last 30 days",
    filters: {
      publicationCohort: "last-30-days",
      hideDrafts: true,
      hideArchived: true,
    },
  },
  {
    id: "this-quarter",
    name: "This Quarter",
    description: "Posts published this quarter",
    filters: {
      publicationCohort: "this-quarter",
      hideDrafts: true,
      hideArchived: true,
    },
  },
];

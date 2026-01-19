/**
 * Inoreader API Types
 *
 * Complete TypeScript types for Inoreader API integration.
 * Based on official documentation: https://www.inoreader.com/developers/
 */

// OAuth 2.0 Token Response
export interface InoreaderTokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token: string;
  scope: "read" | "read write";
}

// Article Categories (Tags/Labels)
export type ArticleCategory =
  | "user/-/state/com.google/reading-list" // All articles
  | "user/-/state/com.google/read" // Read articles
  | "user/-/state/com.google/starred" // Starred articles
  | "user/-/state/com.google/broadcast" // Broadcasted articles
  | "user/-/state/com.google/like" // Liked articles
  | `user/-/label/${string}`; // Custom tags/folders

// Article Origin (Feed Information)
export interface ArticleOrigin {
  streamId: string; // Feed ID
  title: string; // Feed title
  htmlUrl: string; // Feed website URL
}

// Article Summary Content
export interface ArticleSummary {
  direction: "ltr" | "rtl";
  content: string; // HTML content
}

// Article Canonical/Alternate Links
export interface ArticleLink {
  href: string;
  type?: string;
}

// Individual Article Item
export interface InoreaderArticle {
  crawlTimeMsec: string; // Millisecond timestamp
  timestampUsec: string; // Microsecond timestamp (preferred)
  id: string; // Article ID (long format)
  categories: ArticleCategory[];
  title: string;
  published: number; // Unix timestamp
  updated?: number; // Unix timestamp (if updated)
  canonical?: ArticleLink[];
  alternate?: ArticleLink[];
  summary: ArticleSummary;
  author?: string;
  likingUsers?: unknown[];
  comments?: unknown[];
  commentsNum?: number;
  annotations?: ArticleAnnotation[];
  origin: ArticleOrigin;
}

// Article Annotation (Highlights with notes)
export interface ArticleAnnotation {
  id: number;
  start: number; // Character offset
  end: number; // Character offset
  added_on: number; // Unix timestamp
  text: string; // Highlighted text
  note?: string; // Optional user note
  user_id: number;
  user_name: string;
  user_profile_picture?: string;
}

// Stream Contents Response
export interface InoreaderStreamResponse {
  direction: "ltr" | "rtl";
  id: string; // Stream ID
  title: string;
  description?: string;
  self: { href: string };
  updated: number; // Unix timestamp
  updatedUsec: string; // Microsecond timestamp
  items: InoreaderArticle[];
  continuation?: string; // Pagination token
}

// Stream Contents Request Options
export interface StreamContentsOptions {
  n?: number; // Number of items (default 20, max 100)
  r?: "o"; // Sort order: 'o' for oldest first (default: newest first)
  ot?: number; // Unix timestamp - start from this time
  xt?: ArticleCategory; // Exclude target (e.g., exclude read items)
  it?: ArticleCategory; // Include target (e.g., only starred items)
  c?: string; // Continuation token for pagination
  output?: "json"; // Response format
  includeAllDirectStreamIds?: boolean; // Include auto-added folder tags
  annotations?: boolean | "1" | "true"; // Include annotations
}

// User Information Response
export interface InoreaderUserInfo {
  userId: string;
  userName: string;
  userProfileId: string;
  userEmail: string;
  isBloggerUser: boolean;
  signupTimeSec: number;
  isMultiLoginEnabled: boolean;
}

// Subscription (Feed) Item
export interface InoreaderSubscription {
  id: string; // Feed ID (stream ID format)
  title: string;
  categories?: Array<{ id: string; label: string }>; // Folders/labels
  sortid?: string;
  firstitemmsec?: string;
  url: string; // Feed URL
  htmlUrl?: string; // Website URL
  iconUrl?: string;
}

// Subscription List Response
export interface InoreaderSubscriptionList {
  subscriptions: InoreaderSubscription[];
}

// Unread Counts Response
export interface InoreaderUnreadCounts {
  max: number;
  unreadcounts: Array<{
    id: string; // Stream ID
    count: number; // Unread count
    newestItemTimestampUsec: string;
  }>;
}

// API Error Response
export interface InoreaderErrorResponse {
  error: string;
  error_description?: string;
}

// Stream ID Types (for type-safe stream IDs)
export type StreamId =
  | `feed/${string}` // Individual feed
  | `user/-/label/${string}` // Folder/tag
  | `user/-/state/com.google/reading-list` // All items
  | `user/-/state/com.google/starred` // Starred
  | `user/-/state/com.google/broadcast` // Broadcasted
  | `user/-/state/com.google/like`; // Liked

// Redis Storage Types (for caching)
export interface CachedArticle extends InoreaderArticle {
  cached_at: number; // Unix timestamp
  ttl: number; // Time-to-live in seconds
}

export interface CachedStream {
  articles: InoreaderArticle[];
  continuation?: string;
  cached_at: number;
  ttl: number;
}

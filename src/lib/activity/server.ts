/**
 * Activity Server-Only Exports
 *
 * This file re-exports server-side activity transformers that require Node.js APIs.
 *
 * ⚠️ IMPORTANT: Only import this in Server Components or API Routes!
 * Importing in Client Components will bloat the client bundle with Redis/Node.js code.
 *
 * Usage:
 * ```typescript
 * // ✅ CORRECT - in a server component or API route
 * import { transformPostsWithViews } from "@/lib/activity/server";
 *
 * // ❌ WRONG - don't import in client components
 * // This will pull Redis into the browser bundle!
 * ```
 */

export {
  transformPostsWithViews,
  transformTrendingPosts,
  transformMilestones,
  transformHighEngagementPosts,
  transformCommentMilestones,
  transformWebhookGitHubCommits,
  transformGitHubActivity,
  transformVercelAnalytics,
  transformGitHubTraffic,
  transformGoogleAnalytics,
  transformSearchConsole,
  transformCredlyBadges,
} from "./sources.server";

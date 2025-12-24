/**
 * Activity Module - Barrel Export
 *
 * Universal activity timeline for the site, inspired by modern social media feeds.
 */

// Types
export type {
  ActivitySource,
  ActivityVerb,
  ActivityVariant,
  ActivityItem,
  ActivityMeta,
  TimeGroup,
  GroupedActivityItem,
  ActivityFilters,
  ActivityFeedProps,
} from "./types";

// Constants
export {
  ACTIVITY_SOURCE_COLORS,
  ACTIVITY_SOURCE_LABELS,
  ACTIVITY_VERB_LABELS,
} from "./types";

// Transformers
export {
  transformPosts,
  transformProjects,
  transformChangelog,
  aggregateActivities,
  type AggregateOptions,
} from "./sources";

// GitHub activity
export {
  fetchGitHubActivity,
  getGitHubActivities,
  transformCommits,
  transformReleases,
  type GitHubCommit,
  type GitHubRelease,
  type GitHubActivity,
} from "./github";

// Heatmap utilities
export {
  aggregateActivitiesByDate,
  calculateHeatmapStats,
  getHeatmapColorClass,
  getHeatmapIntensity,
  type ActivityHeatmapDay,
  type ActivityHeatmapStats,
} from "./heatmap";

// Time utilities
export {
  getTimeGroup,
  groupActivitiesByTime,
  formatActivityDate,
  formatActivityDateFull,
  TIME_GROUP_LABELS,
} from "./sources";

// RSS feed generation
export {
  generateRSSFeed,
  filterActivitiesForRSS,
  type RSSFeedConfig,
} from "./rss";

// Bookmarks
export * from "./bookmarks";

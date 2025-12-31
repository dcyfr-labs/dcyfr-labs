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
  getActivitySourceIcon,
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

// Heatmap export
export {
  exportHeatmapAsImage,
  generateDefaultFilename,
  type ExportHeatmapOptions,
  type ExportResult,
} from "./heatmap-export";

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

// Presets
export {
  loadPresets,
  savePresets,
  createPreset,
  updatePreset,
  deletePreset,
  markPresetUsed,
  reorderPresets,
  exportPresets,
  importPresets,
  downloadPresetsAsFile,
  DEFAULT_PRESETS,
  type ActivityFilterPreset,
  type TimeRangeFilter,
  type PresetCollection,
} from "./presets";

// Threading
export {
  groupActivitiesIntoThreads,
  canBeThreadPrimary,
  isReplySource,
  getCollapsedSummary,
  type ActivityThread,
} from "./threading";

// Reactions
export {
  loadReactions,
  saveReactions,
  toggleReaction,
  isActivityLiked,
  getSimulatedReactionCount,
  getReactionStats,
  type ReactionType,
  type ReactionCollection,
} from "./reactions";

// Topics
export {
  extractTopics,
  buildCooccurrenceMatrix,
  getRelatedTopics,
  filterByTopics,
  getActivityTopics,
  type Topic,
  type TopicExtractionOptions,
  type TopicCooccurrence,
} from "./topics";

// Search
export {
  createSearchIndex,
  parseSearchQuery,
  searchActivities,
  loadSearchHistory,
  saveSearchToHistory,
  clearSearchHistory,
  extractSearchTerms,
  highlightSearchTerms,
  type SearchResult,
  type SearchQuery,
  type SearchHistoryItem,
} from "./search";

// Trending
export {
  calculateEngagementScore,
  calculateTrendingStatus,
  getTrendingBadgeLabel,
  type EngagementMetrics,
  type TrendingStatus,
  type TrendingThresholds,
} from "./trending";

// Trending Projects
export {
  getTrendingProjects,
  getMockTrendingProjects,
} from "./trending-projects";

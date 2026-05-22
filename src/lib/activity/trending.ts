/**
 * Trending Calculation Utility
 *
 * Determines trending status for activities based on engagement metrics:
 * - Views (page visits)
 * - Likes (reactions)
 * - Comments (discussion activity)
 * - Reading completion (scroll depth, time on page)
 *
 * Supports both weekly (7 days) and monthly (30 days) trending windows.
 *
 * @module lib/activity/trending
 */

// ============================================================================
// TYPES
// ============================================================================

export interface EngagementMetrics {
  /** Total views in time period */
  views: number;
  /** Total likes/reactions */
  likes: number;
  /** Total comments */
  comments: number;
  /** Average reading completion percentage (0-100) */
  readingCompletion?: number;
  /** Time period for metrics */
  periodDays: number;
}

export interface TrendingStatus {
  /** Is trending in weekly window (7 days) */
  isWeeklyTrending: boolean;
  /** Is trending in monthly window (30 days) */
  isMonthlyTrending: boolean;
  /** Engagement score (normalized 0-100) */
  engagementScore: number;
  /** Raw metrics used for calculation */
  metrics: EngagementMetrics;
}

export interface TrendingThresholds {
  /** Minimum engagement score for weekly trending (0-100) */
  weeklyScore: number;
  /** Minimum engagement score for monthly trending (0-100) */
  monthlyScore: number;
  /** Minimum views required (anti-spam) */
  minViews: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default trending thresholds
 * These can be tuned based on your site's traffic patterns
 */
export const DEFAULT_THRESHOLDS: TrendingThresholds = {
  weeklyScore: 60, // Trending if score >= 60 in past 7 days
  monthlyScore: 50, // Trending if score >= 50 in past 30 days
  minViews: 10, // Minimum 10 views to be eligible for trending
};

/**
 * Engagement weights for scoring
 * Higher weight = more important for trending calculation
 */
const ENGAGEMENT_WEIGHTS = {
  views: 1, // Base metric
  likes: 5, // Likes are 5x more valuable than views
  comments: 10, // Comments are 10x more valuable (high engagement)
  readingCompletion: 2, // Reading completion is 2x more valuable
};

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Calculate engagement score (0-100) based on metrics
 *
 * Formula:
 * score = (views * 1 + likes * 5 + comments * 10 + completion * 2) / periodDays
 * Normalized to 0-100 range
 */
export function calculateEngagementScore(metrics: EngagementMetrics): number {
  const { views, likes, comments, readingCompletion = 0, periodDays } = metrics;

  // Calculate weighted score
  const rawScore =
    views * ENGAGEMENT_WEIGHTS.views +
    likes * ENGAGEMENT_WEIGHTS.likes +
    comments * ENGAGEMENT_WEIGHTS.comments +
    (readingCompletion / 100) * ENGAGEMENT_WEIGHTS.readingCompletion;

  // Normalize by time period (daily engagement rate)
  const dailyScore = rawScore / Math.max(periodDays, 1);

  // Normalize to 0-100 scale (assumes max daily score of 100)
  // This threshold can be tuned based on your site's traffic
  const normalizedScore = Math.min(100, (dailyScore / 10) * 100);

  return Math.round(normalizedScore);
}

/**
 * Determine if content is trending based on engagement metrics
 *
 * @param metrics - Engagement metrics for the content
 * @param thresholds - Optional custom thresholds (uses defaults if not provided)
 * @returns Trending status with scores and flags
 */
export function calculateTrendingStatus(
  metrics: EngagementMetrics,
  thresholds: TrendingThresholds = DEFAULT_THRESHOLDS
): TrendingStatus {
  const score = calculateEngagementScore(metrics);

  // Check minimum view threshold
  const hasMinViews = metrics.views >= thresholds.minViews;

  // Determine trending status based on time period
  const isWeeklyTrending =
    hasMinViews && metrics.periodDays <= 7 && score >= thresholds.weeklyScore;

  const isMonthlyTrending =
    hasMinViews && metrics.periodDays <= 30 && score >= thresholds.monthlyScore;

  return {
    isWeeklyTrending,
    isMonthlyTrending,
    engagementScore: score,
    metrics,
  };
}

/**
 * Get trending badge label based on status
 */
export function getTrendingBadgeLabel(status: TrendingStatus): string | null {
  if (status.isWeeklyTrending) {
    return '🔥 Trending this week';
  }
  if (status.isMonthlyTrending) {
    return '📈 Trending this month';
  }
  return null;
}

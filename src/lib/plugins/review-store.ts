/**
 * Plugin Review Store
 *
 * Module-level singleton for the plugin rating and review system.
 * Uses PluginRatingAggregator from @dcyfr/ai when available.
 * Falls back to an in-memory local implementation when the package
 * version does not expose the aggregator export.
 *
 * In a production system, this would be backed by a database.
 * Reviews are lost on server restart — acceptable for this phase.
 *
 * @module lib/plugins/review-store
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalForReviews = globalThis as unknown as { __pluginReviewAggregator?: any };

let aggregatorInstance: PluginRatingAggregatorType | null = null;

type StarRating = 1 | 2 | 3 | 4 | 5;
type ReviewStatus = 'approved' | 'pending' | 'flagged' | 'removed';
type FlagReason = 'spam' | 'inappropriate' | 'fake' | 'other';

type PluginReview = {
  id: string;
  pluginId: string;
  userId: string;
  displayName: string;
  rating: StarRating;
  comment?: string;
  status: ReviewStatus;
  helpfulVotes: number;
  createdAt: string;
  updatedAt: string;
  flags: Array<{ reportedBy: string; reason: FlagReason; reportedAt: string }>;
};

type ReviewPage = {
  items: PluginReview[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type RatingStats = {
  averageRating: number;
  totalReviews: number;
  approvedReviews: number;
  distribution: Record<StarRating, number>;
};

type PluginRatingAggregatorType = {
  createReview(input: {
    pluginId: string;
    userId: string;
    displayName: string;
    rating: StarRating;
    comment?: string;
  }): PluginReview;
  getReviews(
    pluginId: string,
    options?: {
      page?: number;
      pageSize?: number;
      sortBy?: 'rating' | 'helpfulVotes' | 'createdAt';
      sortOrder?: 'asc' | 'desc';
    }
  ): ReviewPage;
  getRatingStats(pluginId: string): RatingStats;
  getReview(reviewId: string): PluginReview | undefined;
  flagReview(input: { reviewId: string; reportedBy: string; reason: FlagReason }): PluginReview;
  approveReview(reviewId: string): PluginReview;
  removeReview(reviewId: string): PluginReview;
  getCommunityScore(pluginId: string): number;
};

class InMemoryPluginRatingAggregator implements PluginRatingAggregatorType {
  private readonly reviews = new Map<string, PluginReview>();
  private readonly autoApproveOnCreate: boolean;

  constructor(config: { autoApproveOnCreate?: boolean } = {}) {
    this.autoApproveOnCreate = config.autoApproveOnCreate ?? true;
  }

  createReview(input: {
    pluginId: string;
    userId: string;
    displayName: string;
    rating: StarRating;
    comment?: string;
  }): PluginReview {
    const duplicate = Array.from(this.reviews.values()).find(
      (review) =>
        review.pluginId === input.pluginId &&
        review.userId === input.userId &&
        review.status !== 'removed'
    );

    if (duplicate) {
      const error = new Error('Duplicate review');
      (error as Error & { code: string }).code = 'DUPLICATE_REVIEW';
      throw error;
    }

    const now = new Date().toISOString();
    const review: PluginReview = {
      id: `${input.pluginId}:${input.userId}:${Date.now()}`,
      pluginId: input.pluginId,
      userId: input.userId,
      displayName: input.displayName,
      rating: input.rating,
      comment: input.comment,
      status: this.autoApproveOnCreate ? 'approved' : 'pending',
      helpfulVotes: 0,
      createdAt: now,
      updatedAt: now,
      flags: [],
    };

    this.reviews.set(review.id, review);
    return review;
  }

  getReviews(
    pluginId: string,
    options: {
      page?: number;
      pageSize?: number;
      sortBy?: 'rating' | 'helpfulVotes' | 'createdAt';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): ReviewPage {
    const page = Math.max(1, options.page ?? 1);
    const pageSize = Math.max(1, options.pageSize ?? 10);
    const sortBy = options.sortBy ?? 'createdAt';
    const sortOrder = options.sortOrder ?? 'desc';

    const visibleReviews = Array.from(this.reviews.values()).filter(
      (review) => review.pluginId === pluginId && review.status !== 'removed'
    );

    const getSortableValue = (
      review: PluginReview,
      key: 'rating' | 'helpfulVotes' | 'createdAt'
    ): number => {
      if (key === 'createdAt') {
        return new Date(review.createdAt).getTime();
      }
      if (key === 'rating') {
        return review.rating;
      }
      return review.helpfulVotes;
    };

    visibleReviews.sort((a, b) => {
      const left = getSortableValue(a, sortBy);
      const right = getSortableValue(b, sortBy);

      return sortOrder === 'asc' ? left - right : right - left;
    });

    const total = visibleReviews.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const items = visibleReviews.slice(start, start + pageSize);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  getRatingStats(pluginId: string): RatingStats {
    const approvedReviews = Array.from(this.reviews.values()).filter(
      (review) => review.pluginId === pluginId && review.status === 'approved'
    );

    const distribution: Record<StarRating, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const review of approvedReviews) {
      distribution[review.rating] += 1;
    }

    const totalReviews = approvedReviews.length;
    const averageRating =
      totalReviews === 0
        ? 0
        : Number(
            (
              approvedReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
            ).toFixed(2)
          );

    return {
      averageRating,
      totalReviews,
      approvedReviews: totalReviews,
      distribution,
    };
  }

  getReview(reviewId: string): PluginReview | undefined {
    return this.reviews.get(reviewId);
  }

  flagReview(input: { reviewId: string; reportedBy: string; reason: FlagReason }): PluginReview {
    const review = this.reviews.get(input.reviewId);
    if (!review) {
      const error = new Error('Review not found');
      (error as Error & { code: string }).code = 'REVIEW_NOT_FOUND';
      throw error;
    }

    review.flags.push({
      reportedBy: input.reportedBy,
      reason: input.reason,
      reportedAt: new Date().toISOString(),
    });
    review.status = 'flagged';
    review.updatedAt = new Date().toISOString();

    this.reviews.set(review.id, review);
    return review;
  }

  approveReview(reviewId: string): PluginReview {
    const review = this.reviews.get(reviewId);
    if (!review) {
      const error = new Error('Review not found');
      (error as Error & { code: string }).code = 'REVIEW_NOT_FOUND';
      throw error;
    }

    review.status = 'approved';
    review.updatedAt = new Date().toISOString();
    this.reviews.set(review.id, review);
    return review;
  }

  removeReview(reviewId: string): PluginReview {
    const review = this.reviews.get(reviewId);
    if (!review) {
      const error = new Error('Review not found');
      (error as Error & { code: string }).code = 'REVIEW_NOT_FOUND';
      throw error;
    }

    review.status = 'removed';
    review.updatedAt = new Date().toISOString();
    this.reviews.set(review.id, review);
    return review;
  }

  getCommunityScore(pluginId: string): number {
    const { averageRating, totalReviews } = this.getRatingStats(pluginId);
    if (totalReviews === 0) return 0;
    return Math.round(averageRating * 20);
  }
}

/**
 * Get or create the singleton PluginRatingAggregator.
 * Lazy-initializes on first access to avoid import issues in edge runtime.
 */
export async function getReviewStore(): Promise<PluginRatingAggregatorType> {
  if (!aggregatorInstance) {
    // Dynamically import to support edge runtime and avoid circular deps.
    // Some published @dcyfr/ai versions do not yet export PluginRatingAggregator,
    // so we gracefully fall back to local in-memory implementation.
    const aiModule = (await import('@dcyfr/ai')) as {
      PluginRatingAggregator?: new (config?: {
        autoApproveOnCreate?: boolean;
      }) => PluginRatingAggregatorType;
    };

    // Use globalThis to survive hot-reloads in development
    if (globalForReviews.__pluginReviewAggregator) {
      aggregatorInstance = globalForReviews.__pluginReviewAggregator as PluginRatingAggregatorType;
    } else {
      aggregatorInstance = aiModule.PluginRatingAggregator
        ? new aiModule.PluginRatingAggregator({ autoApproveOnCreate: true })
        : new InMemoryPluginRatingAggregator({ autoApproveOnCreate: true });
      globalForReviews.__pluginReviewAggregator = aggregatorInstance;
    }
  }
  return aggregatorInstance;
}

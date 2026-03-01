'use client';

/**
 * ReviewList — paginated list of plugin reviews with rating stats.
 *
 * Props:
 *   pluginId   – ID of the plugin to display reviews for.
 *   initialPage – Preloaded first page of reviews (optional, for SSR).
 *
 * Fetches reviews from /api/plugins/[id]/reviews on mount and on page change.
 *
 * Design tokens used: TYPOGRAPHY, SPACING, SEMANTIC_COLORS (alert)
 */

import { useState, useEffect, useCallback } from 'react';
import { TYPOGRAPHY, SPACING, SEMANTIC_COLORS } from '@/lib/design-tokens';
import { StarRating } from './StarRating';

interface ReviewItem {
  readonly id: string;
  readonly displayName: string;
  readonly rating: number;
  readonly comment?: string;
  readonly createdAt: string;
  readonly helpfulVotes: number;
  readonly status: string;
}

interface RatingStats {
  readonly averageRating: number;
  readonly totalReviews: number;
  readonly communityScore: number;
  readonly distribution: Record<string, number>;
}

interface ReviewPage {
  readonly reviews: ReviewItem[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasMore: boolean;
  readonly stats?: RatingStats;
}

interface ReviewListProps {
  readonly pluginId: string;
  readonly initialPage?: ReviewPage;
}

const PAGE_SIZE = 10;

export function ReviewList({ pluginId, initialPage }: ReviewListProps) {
  const [reviewPage, setReviewPage] = useState<ReviewPage | null>(initialPage ?? null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(!initialPage);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(
    async (page: number) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(PAGE_SIZE),
          sortBy: 'createdAt',
          sortOrder: 'desc',
        });
        const res = await fetch(`/api/plugins/${encodeURIComponent(pluginId)}/reviews?${params}`);
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          setError(data.error ?? 'Failed to load reviews.');
          return;
        }
        const data = (await res.json()) as ReviewPage;
        setReviewPage(data);
      } catch {
        setError('Network error. Unable to load reviews.');
      } finally {
        setLoading(false);
      }
    },
    [pluginId]
  );

  useEffect(() => {
    if (!initialPage || currentPage !== 1) {
      void fetchReviews(currentPage);
    }
  }, [fetchReviews, currentPage, initialPage]);

  function handlePageChange(newPage: number) {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (loading && !reviewPage) {
    return (
      <div className={`${SPACING.content} animate-pulse`} aria-busy="true">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-lg ${SEMANTIC_COLORS.alert.critical.container}`} role="alert">
        <p className={`${TYPOGRAPHY.body} ${SEMANTIC_COLORS.alert.critical.text}`}>{error}</p>
      </div>
    );
  }

  if (!reviewPage || reviewPage.reviews.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className={`${TYPOGRAPHY.body} text-muted-foreground`}>
          No reviews yet. Be the first to review this plugin!
        </p>
      </div>
    );
  }

  const { reviews, total, stats } = reviewPage;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className={SPACING.content}>
      {/* Rating summary */}
      {stats && stats.totalReviews > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/20">
          <div className="text-center">
            <p className="text-3xl font-bold text-foreground">{stats.averageRating.toFixed(1)}</p>
            <StarRating value={stats.averageRating} readonly size="sm" />
            <p className={`${TYPOGRAPHY.metadata} text-muted-foreground mt-1`}>
              {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          <div className="flex-1">
            <p className={`${TYPOGRAPHY.label.small} text-muted-foreground mb-1`}>
              Community Score:{' '}
              <span className="text-foreground font-semibold">{stats.communityScore}/100</span>
            </p>
            {/* Rating distribution bars */}
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.distribution[String(star)] ?? 0;
              const pct =
                stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 mb-0.5">
                  <span className={`${TYPOGRAPHY.metadata} w-4 text-right`}>{star}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-warning rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`${TYPOGRAPHY.metadata} text-muted-foreground w-6`}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review cards */}
      <div className={SPACING.content}>
        {reviews.map((review) => (
          <div key={review.id} className="p-4 rounded-lg border border-border bg-background">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className={TYPOGRAPHY.label.standard}>{review.displayName}</p>
                <StarRating value={review.rating} readonly size="sm" />
              </div>
              <p className={`${TYPOGRAPHY.metadata} text-muted-foreground`}>
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            {review.comment && (
              <p className={`${TYPOGRAPHY.body} text-foreground/90 mt-2`}>{review.comment}</p>
            )}
            {review.helpfulVotes > 0 && (
              <p className={`${TYPOGRAPHY.metadata} text-muted-foreground mt-2`}>
                {review.helpfulVotes} {review.helpfulVotes === 1 ? 'person' : 'people'} found this
                helpful
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2" aria-label="Review pagination">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className={`${TYPOGRAPHY.label.small} px-3 py-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
            aria-label="Previous page"
          >
            ‹ Prev
          </button>
          <span className={`${TYPOGRAPHY.metadata} text-muted-foreground`}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!reviewPage.hasMore || loading}
            className={`${TYPOGRAPHY.label.small} px-3 py-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
            aria-label="Next page"
          >
            Next ›
          </button>
        </nav>
      )}
    </div>
  );
}

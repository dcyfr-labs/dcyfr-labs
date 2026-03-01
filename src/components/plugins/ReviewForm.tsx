'use client';

/**
 * ReviewForm — form to submit a new plugin review with star rating.
 *
 * Props:
 *   pluginId   – ID of the plugin being reviewed.
 *   userId     – Current user ID.
 *   displayName – User display name.
 *   onSubmit   – Called with the newly created review on success.
 *   onCancel   – Called when the user dismisses the form.
 *
 * Design tokens used: TYPOGRAPHY, SPACING
 */

import { useState } from 'react';
import { TYPOGRAPHY, SPACING } from '@/lib/design-tokens';
import { StarRating } from './StarRating';

/** StarRating value type (1–5). Mirrors @dcyfr/ai StarRating. */
type StarRatingValue = 1 | 2 | 3 | 4 | 5;

interface ReviewFormProps {
  readonly pluginId: string;
  readonly userId: string;
  readonly displayName: string;
  readonly onSubmit?: (review: unknown) => void;
  readonly onCancel?: () => void;
}

export function ReviewForm({ pluginId, userId, displayName, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState<StarRatingValue | 0>(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isValid = rating > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/plugins/${encodeURIComponent(pluginId)}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, displayName, rating, comment: comment.trim() || undefined }),
      });

      const data = (await res.json()) as { review?: unknown; error?: string };

      if (!res.ok) {
        setError(data.error ?? 'Failed to submit review. Please try again.');
        return;
      }

      setSuccess(true);
      onSubmit?.(data.review);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div
        className="p-4 rounded-lg border border-success/30 bg-success-subtle"
        role="status"
        aria-live="polite"
      >
        <p className={`${TYPOGRAPHY.label.standard} text-success`}>
          Thank you! Your review has been submitted for moderation.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={SPACING.content} noValidate>
      <div>
        <label className={`${TYPOGRAPHY.label.standard} block mb-2`}>
          Your rating{' '}
          <span aria-hidden="true" className="text-error">
            *
          </span>
        </label>
        <StarRating size="lg" value={rating} onChange={(v) => setRating(v)} showLabel />
      </div>

      <div>
        <label htmlFor="review-comment" className={`${TYPOGRAPHY.label.standard} block mb-2`}>
          Comment <span className={TYPOGRAPHY.metadata}>(optional, max 2000 chars)</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Share your experience with this plugin…"
          className={[
            'w-full rounded-md border border-border bg-background',
            'px-3 py-2 text-sm text-foreground placeholder-muted-foreground',
            'resize-y focus:outline-none focus:ring-2 focus:ring-primary/60',
            TYPOGRAPHY.body,
          ].join(' ')}
        />
        <p className={`${TYPOGRAPHY.metadata} text-muted-foreground text-right mt-1`}>
          {comment.length}/2000
        </p>
      </div>

      {error && (
        <p className={`${TYPOGRAPHY.metadata} text-error`} role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className={`${TYPOGRAPHY.label.small} px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors`}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid || submitting}
          className={[
            TYPOGRAPHY.label.small,
            'px-4 py-2 rounded-md bg-primary text-primary-foreground',
            'hover:bg-primary/90 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          {submitting ? 'Submitting…' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}

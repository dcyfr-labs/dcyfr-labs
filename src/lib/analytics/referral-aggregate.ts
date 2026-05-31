/**
 * Referral aggregation
 *
 * Pure helpers for combining per-post referral counts (as returned by
 * `GET /api/analytics/referral`) into a single platform → count aggregate.
 * Kept free of React/IO so it can be unit-tested in the node environment.
 */

export type ReferralCounts = Record<string, number>;

export interface PostReferralData {
  /** Referral counts keyed by platform (twitter, dev, linkedin, …). */
  referrals: ReferralCounts;
  /** Total referrals across all platforms for the post. */
  total: number;
}

/**
 * Sum a list of per-post referral results into one aggregate.
 *
 * - Sums each platform's counts across all posts.
 * - Derives `total` from the aggregated platform counts (self-consistent,
 *   so it never drifts from the per-platform breakdown the UI renders).
 * - Ignores missing/non-numeric entries defensively.
 *
 * @example
 * aggregateReferralCounts([
 *   { referrals: { twitter: 3, dev: 1 }, total: 4 },
 *   { referrals: { twitter: 2 },        total: 2 },
 * ])
 * // => { referrals: { twitter: 5, dev: 1 }, total: 6 }
 */
export function aggregateReferralCounts(
  perPost: Array<PostReferralData | null | undefined>
): PostReferralData {
  const referrals: ReferralCounts = {};

  for (const post of perPost) {
    if (!post || typeof post.referrals !== 'object' || post.referrals === null) continue;
    for (const [platform, count] of Object.entries(post.referrals)) {
      if (typeof count !== 'number' || !Number.isFinite(count)) continue;
      referrals[platform] = (referrals[platform] ?? 0) + count;
    }
  }

  const total = Object.values(referrals).reduce((sum, count) => sum + count, 0);
  return { referrals, total };
}

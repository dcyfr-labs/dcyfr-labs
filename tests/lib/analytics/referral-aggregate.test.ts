import { describe, expect, it } from 'vitest';
import { aggregateReferralCounts } from '@/lib/analytics/referral-aggregate';

describe('aggregateReferralCounts', () => {
  it('returns an empty aggregate for no posts', () => {
    expect(aggregateReferralCounts([])).toEqual({ referrals: {}, total: 0 });
  });

  it('passes a single post through unchanged (total derived from platforms)', () => {
    const result = aggregateReferralCounts([{ referrals: { twitter: 3, dev: 1 }, total: 4 }]);
    expect(result).toEqual({ referrals: { twitter: 3, dev: 1 }, total: 4 });
  });

  it('sums counts per platform across posts and totals them', () => {
    const result = aggregateReferralCounts([
      { referrals: { twitter: 3, dev: 1 }, total: 4 },
      { referrals: { twitter: 2, github: 5 }, total: 7 },
    ]);
    expect(result.referrals).toEqual({ twitter: 5, dev: 1, github: 5 });
    expect(result.total).toBe(11);
  });

  it('derives total from platform counts, not the provided per-post totals', () => {
    // Even if a caller passes an inconsistent `total`, the aggregate stays
    // consistent with the per-platform breakdown the UI renders.
    const result = aggregateReferralCounts([{ referrals: { twitter: 2 }, total: 999 }]);
    expect(result.total).toBe(2);
  });

  it('ignores null/undefined entries and non-numeric counts', () => {
    const result = aggregateReferralCounts([
      null,
      undefined,
      { referrals: { twitter: 4 }, total: 4 },
      // @ts-expect-error — defensive: runtime guards against bad shapes
      { referrals: { twitter: 'nope', dev: Number.NaN, linkedin: 2 }, total: 0 },
    ]);
    expect(result.referrals).toEqual({ twitter: 4, linkedin: 2 });
    expect(result.total).toBe(6);
  });

  it('does not mutate the input objects', () => {
    const input = [{ referrals: { twitter: 1 }, total: 1 }];
    const snapshot = structuredClone(input);
    aggregateReferralCounts(input);
    expect(input).toEqual(snapshot);
  });
});

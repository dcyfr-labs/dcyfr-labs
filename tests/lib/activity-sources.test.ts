/**
 * Tests for transformHighEngagementPosts, focused on the share-count
 * contribution to the engagement rate that gates which posts surface.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Post } from '@/data/posts';

vi.mock('@/lib/views.server', () => ({
  getMultiplePostViews: vi.fn(),
  getMultiplePostViewsInRange: vi.fn(),
}));
vi.mock('@/lib/comments', () => ({
  getPostCommentsBulk: vi.fn(),
}));
vi.mock('@/lib/shares', () => ({
  getPostSharesBulk: vi.fn(),
}));
vi.mock('@/lib/giscus-reactions', () => ({
  getActivityReactionsBulk: vi.fn(),
  mapGiscusReactionsToLikes: vi.fn(),
}));
vi.mock('@/lib/redis-client', () => ({
  redis: { mGet: vi.fn(), get: vi.fn() },
}));

import { getMultiplePostViews } from '@/lib/views.server';
import { getPostCommentsBulk } from '@/lib/comments';
import { getPostSharesBulk } from '@/lib/shares';
import { transformHighEngagementPosts } from '@/lib/activity/sources.server';

function makePost(overrides: Partial<Post> & Pick<Post, 'id' | 'slug'>): Post {
  return {
    title: `Post ${overrides.id}`,
    summary: 'Summary',
    publishedAt: '2026-01-01T00:00:00.000Z',
    tags: ['security'],
    body: '',
    readingTime: { words: 100, minutes: 1, text: '1 min read' },
    ...overrides,
  } as Post;
}

describe('transformHighEngagementPosts — share signal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('counts shares toward the engagement rate that gates inclusion', async () => {
    const posts = [makePost({ id: 'a', slug: 'a' }), makePost({ id: 'b', slug: 'b' })];

    vi.mocked(getMultiplePostViews).mockResolvedValue(
      new Map([
        ['a', 1000],
        ['b', 1000],
      ])
    );
    vi.mocked(getPostCommentsBulk).mockResolvedValue({ a: 0, b: 0 });
    // Post b's engagement comes entirely from shares.
    vi.mocked(getPostSharesBulk).mockResolvedValue({ a: 0, b: 100 });

    const result = await transformHighEngagementPosts(posts);

    // a: 0% engagement -> excluded. b: 100/1000 = 10% -> clears the 5% threshold.
    expect(result.map((item) => item.id)).toEqual(['engagement-b']);
    expect(result[0]?.meta?.engagement).toBeCloseTo(10);
  });

  it('reads share counts keyed by post id, not slug', async () => {
    // id and slug deliberately differ — a slug-keyed lookup would read undefined.
    const posts = [makePost({ id: 'real-id', slug: 'pretty-slug' })];

    vi.mocked(getMultiplePostViews).mockResolvedValue(new Map([['real-id', 1000]]));
    vi.mocked(getPostCommentsBulk).mockResolvedValue({ 'pretty-slug': 0 });
    vi.mocked(getPostSharesBulk).mockResolvedValue({ 'real-id': 200 });

    const result = await transformHighEngagementPosts(posts);

    expect(result.map((item) => item.id)).toEqual(['engagement-real-id']);
    expect(result[0]?.meta?.engagement).toBeCloseTo(20);
  });
});

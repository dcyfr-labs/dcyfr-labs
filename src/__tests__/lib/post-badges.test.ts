/**
 * Tests for lib/post-badges.ts - Badge metadata for blog posts
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { getPostBadgeMetadata } from '@/lib/post-badges.server';
import type { Post } from '@/data/posts';
import * as viewsModule from '@/lib/views.server';

// Mock the views module
vi.mock('@/lib/views.server', () => ({
  getMultiplePostViews: vi.fn(),
}));

describe('getPostBadgeMetadata', () => {
  // Sample posts for testing
  const mockPosts: Post[] = [
    {
      id: 'post-1',
      slug: 'oldest-post',
      title: 'Oldest Post',
      summary: 'The oldest post',
      body: 'Content',
      publishedAt: '2024-01-01',
      readingTime: { words: 100, minutes: 1, text: '1 min read' },
      archived: false,
      draft: false,
      featured: false,
      tags: ['test'],
    },
    {
      id: 'post-2',
      slug: 'middle-post',
      title: 'Middle Post',
      summary: 'A middle post',
      body: 'Content',
      publishedAt: '2024-06-01',
      readingTime: { words: 100, minutes: 1, text: '1 min read' },
      archived: false,
      draft: false,
      featured: false,
      tags: ['test'],
    },
    {
      id: 'post-3',
      slug: 'latest-post',
      title: 'Latest Post',
      summary: 'The newest post',
      body: 'Content',
      publishedAt: '2024-12-01',
      readingTime: { words: 100, minutes: 1, text: '1 min read' },
      archived: false,
      draft: false,
      featured: false,
      tags: ['test'],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Latest Post Badge', () => {
    it('identifies the most recent post as latest', async () => {
      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map([
        ['post-1', 100],
        ['post-2', 200],
        ['post-3', 50],
      ]));

      const result = await getPostBadgeMetadata(mockPosts);
      expect(result.latestSlug).toBe('latest-post');
    });

    it('excludes archived posts from latest consideration', async () => {
      const postsWithArchived: Post[] = [
        ...mockPosts,
        {
          id: 'post-4',
          slug: 'newer-but-archived',
          title: 'Archived Post',
          summary: 'Archived',
          body: 'Content',
          publishedAt: '2024-12-15', // Newer than latest-post
          readingTime: { words: 100, minutes: 1, text: '1 min read' },
          archived: true, // But archived
          draft: false,
          featured: false,
          tags: ['test'],
        },
      ];

      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map());

      const result = await getPostBadgeMetadata(postsWithArchived);
      expect(result.latestSlug).toBe('latest-post'); // Still the non-archived one
    });

    it('excludes draft posts from latest consideration', async () => {
      const postsWithDraft: Post[] = [
        ...mockPosts,
        {
          id: 'post-4',
          slug: 'newer-but-draft',
          title: 'Draft Post',
          summary: 'Draft',
          body: 'Content',
          publishedAt: '2024-12-15', // Newer than latest-post
          readingTime: { words: 100, minutes: 1, text: '1 min read' },
          archived: false,
          draft: true, // But draft
          featured: false,
          tags: ['test'],
        },
      ];

      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map());

      const result = await getPostBadgeMetadata(postsWithDraft);
      expect(result.latestSlug).toBe('latest-post'); // Still the published one
    });

    it('returns null when no eligible posts exist', async () => {
      const archivedPosts: Post[] = [
        {
          id: 'post-1',
          slug: 'archived-post',
          title: 'Archived',
          summary: 'Archived',
          body: 'Content',
          publishedAt: '2024-01-01',
          readingTime: { words: 100, minutes: 1, text: '1 min read' },
          archived: true,
          draft: false,
          featured: false,
          tags: ['test'],
        },
      ];

      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map());

      const result = await getPostBadgeMetadata(archivedPosts);
      expect(result.latestSlug).toBeNull();
    });

    it('returns null when posts array is empty', async () => {
      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map());

      const result = await getPostBadgeMetadata([]);
      expect(result.latestSlug).toBeNull();
    });
  });

  describe('Hottest Post Badge', () => {
    it('identifies post with most views as hottest', async () => {
      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map([
        ['post-1', 100],
        ['post-2', 500], // Highest views
        ['post-3', 50],
      ]));

      const result = await getPostBadgeMetadata(mockPosts);
      expect(result.hottestSlug).toBe('middle-post');
    });

    it('excludes archived posts from hottest consideration', async () => {
      const postsWithArchived: Post[] = [
        ...mockPosts,
        {
          id: 'post-4',
          slug: 'archived-with-views',
          title: 'Archived Popular Post',
          summary: 'Archived',
          body: 'Content',
          publishedAt: '2024-06-15',
          readingTime: { words: 100, minutes: 1, text: '1 min read' },
          archived: true,
          draft: false,
          featured: false,
          tags: ['test'],
        },
      ];

      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map([
        ['post-1', 100],
        ['post-2', 200],
        ['post-3', 50],
        ['post-4', 1000], // Would be hottest but is archived
      ]));

      const result = await getPostBadgeMetadata(postsWithArchived);
      expect(result.hottestSlug).toBe('middle-post'); // Next highest non-archived
    });

    it('excludes draft posts from hottest consideration', async () => {
      const postsWithDraft: Post[] = [
        ...mockPosts,
        {
          id: 'post-4',
          slug: 'draft-with-views',
          title: 'Draft Popular Post',
          summary: 'Draft',
          body: 'Content',
          publishedAt: '2024-06-15',
          readingTime: { words: 100, minutes: 1, text: '1 min read' },
          archived: false,
          draft: true,
          featured: false,
          tags: ['test'],
        },
      ];

      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map([
        ['post-1', 100],
        ['post-2', 200],
        ['post-3', 50],
        ['post-4', 1000], // Would be hottest but is draft
      ]));

      const result = await getPostBadgeMetadata(postsWithDraft);
      expect(result.hottestSlug).toBe('middle-post'); // Next highest published
    });

    it('returns null when no posts have views', async () => {
      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map([
        ['post-1', 0],
        ['post-2', 0],
        ['post-3', 0],
      ]));

      const result = await getPostBadgeMetadata(mockPosts);
      expect(result.hottestSlug).toBeNull();
    });

    it('returns null when view map is empty', async () => {
      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map());

      const result = await getPostBadgeMetadata(mockPosts);
      expect(result.hottestSlug).toBeNull();
    });

    it('treats missing view data as zero views', async () => {
      // Only provide view data for some posts
      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map([
        ['post-2', 100],
        // post-1 and post-3 missing from view data
      ]));

      const result = await getPostBadgeMetadata(mockPosts);
      expect(result.hottestSlug).toBe('middle-post');
    });

    it('handles tie by choosing first post with max views', async () => {
      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map([
        ['post-1', 100],
        ['post-2', 100], // Tie with post-1
        ['post-3', 50],
      ]));

      const result = await getPostBadgeMetadata(mockPosts);
      // First post in iteration order with max views
      expect(result.hottestSlug).toBe('oldest-post');
    });
  });

  describe('Combined Badge Logic', () => {
    it('can assign different posts for latest and hottest', async () => {
      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map([
        ['post-1', 500], // Oldest but hottest
        ['post-2', 200],
        ['post-3', 50], // Latest but not hottest
      ]));

      const result = await getPostBadgeMetadata(mockPosts);
      expect(result.latestSlug).toBe('latest-post');
      expect(result.hottestSlug).toBe('oldest-post');
    });

    it('can assign same post for both latest and hottest', async () => {
      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map([
        ['post-1', 100],
        ['post-2', 200],
        ['post-3', 500], // Latest AND hottest
      ]));

      const result = await getPostBadgeMetadata(mockPosts);
      expect(result.latestSlug).toBe('latest-post');
      expect(result.hottestSlug).toBe('latest-post');
    });

    it('returns both null when no eligible posts', async () => {
      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map());

      const result = await getPostBadgeMetadata([]);
      expect(result.latestSlug).toBeNull();
      expect(result.hottestSlug).toBeNull();
    });
  });

  describe('Integration with Views Service', () => {
    it('calls getMultiplePostViews with eligible post IDs', async () => {
      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map());

      await getPostBadgeMetadata(mockPosts);

      expect(viewsModule.getMultiplePostViews).toHaveBeenCalledWith([
        'post-1',
        'post-2',
        'post-3',
      ]);
      expect(viewsModule.getMultiplePostViews).toHaveBeenCalledTimes(1);
    });

    it('only includes non-archived, non-draft posts in view request', async () => {
      const mixedPosts: Post[] = [
        mockPosts[0], // eligible
        { ...mockPosts[1], archived: true }, // excluded
        { ...mockPosts[2], draft: true }, // excluded
      ];

      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map());

      await getPostBadgeMetadata(mixedPosts);

      expect(viewsModule.getMultiplePostViews).toHaveBeenCalledWith([
        'post-1', // Only eligible post
      ]);
    });

    it('handles empty eligible posts list', async () => {
      const allArchivedPosts: Post[] = [
        { ...mockPosts[0], archived: true },
        { ...mockPosts[1], archived: true },
        { ...mockPosts[2], archived: true },
      ];

      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map());

      await getPostBadgeMetadata(allArchivedPosts);

      expect(viewsModule.getMultiplePostViews).toHaveBeenCalledWith([]);
    });
  });

  describe('Edge Cases', () => {
    it('handles posts with same publish date', async () => {
      const sameDatePosts: Post[] = [
        {
          id: 'post-1',
          slug: 'post-a',
          title: 'Post A',
          summary: 'Post A',
          body: 'Content',
          publishedAt: '2024-01-01',
          readingTime: { words: 100, minutes: 1, text: '1 min read' },
          archived: false,
          draft: false,
          featured: false,
          tags: ['test'],
        },
        {
          id: 'post-2',
          slug: 'post-b',
          title: 'Post B',
          summary: 'Post B',
          body: 'Content',
          publishedAt: '2024-01-01', // Same date
          readingTime: { words: 100, minutes: 1, text: '1 min read' },
          archived: false,
          draft: false,
          featured: false,
          tags: ['test'],
        },
      ];

      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map([
        ['post-1', 100],
        ['post-2', 100],
      ]));

      const result = await getPostBadgeMetadata(sameDatePosts);
      // Should pick one consistently
      expect(result.latestSlug).toBeTruthy();
      expect(['post-a', 'post-b']).toContain(result.latestSlug);
    });

    it('handles very large view counts', async () => {
      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map([
        ['post-1', 1000000],
        ['post-2', 999999],
        ['post-3', 50],
      ]));

      const result = await getPostBadgeMetadata(mockPosts);
      expect(result.hottestSlug).toBe('oldest-post');
    });

    it('handles negative view counts (treats as valid)', async () => {
      // Edge case: Redis could theoretically return negative
      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map([
        ['post-1', -10],
        ['post-2', 100],
        ['post-3', 50],
      ]));

      const result = await getPostBadgeMetadata(mockPosts);
      expect(result.hottestSlug).toBe('middle-post'); // Highest valid count
    });

    it('preserves original posts array (immutability)', async () => {
      const originalPosts = [...mockPosts];
      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map());

      await getPostBadgeMetadata(mockPosts);

      expect(mockPosts).toEqual(originalPosts);
    });
  });

  describe('Type Safety', () => {
    it('returns PostBadgeMetadata with correct shape', async () => {
      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map([
        ['post-1', 100],
      ]));

      const result = await getPostBadgeMetadata(mockPosts);

      expect(result).toHaveProperty('latestSlug');
      expect(result).toHaveProperty('hottestSlug');
      expect(typeof result.latestSlug === 'string' || result.latestSlug === null).toBe(true);
      expect(typeof result.hottestSlug === 'string' || result.hottestSlug === null).toBe(true);
    });

    it('returns string slugs or null values', async () => {
      vi.mocked(viewsModule.getMultiplePostViews).mockResolvedValue(new Map([
        ['post-2', 100],
      ]));

      const result = await getPostBadgeMetadata(mockPosts);

      if (result.latestSlug !== null) {
        expect(typeof result.latestSlug).toBe('string');
      }
      if (result.hottestSlug !== null) {
        expect(typeof result.hottestSlug).toBe('string');
      }
    });
  });
});

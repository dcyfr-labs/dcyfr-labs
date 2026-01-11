/**
 * DEV.to Analytics Integration Tests
 *
 * Tests for DEV.to API integration and metrics processing.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchDevToArticle,
  fetchDevToMetrics,
  fetchDevToMetricsBatch,
  getDevToUrl,
  isValidDevSlug,
  getEngagementRate,
  areMetricsStale,
  type DevToArticle,
  type DevToMetrics,
} from '../dev-to';

describe('DEV.to Analytics', () => {
  describe('fetchDevToArticle', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should fetch article successfully', async () => {
      const mockArticle: DevToArticle = {
        id: 123456,
        title: 'Test Article',
        slug: 'test-article',
        url: 'https://dev.to/dcyfr/test-article',
        published_at: '2024-01-01T00:00:00Z',
        page_views_count: 1000,
        public_reactions_count: 50,
        comments_count: 10,
        tag_list: ['javascript', 'typescript'],
        reading_time_minutes: 5,
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockArticle,
      } as Response);

      const result = await fetchDevToArticle('dcyfr', 'test-article');

      expect(result).toEqual(mockArticle);
      expect(fetch).toHaveBeenCalledWith(
        'https://dev.to/api/articles/dcyfr/test-article',
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json',
          },
          next: {
            revalidate: 3600,
          },
        })
      );
    });

    it('should return null for 404 errors', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not Found',
      } as Response);

      const result = await fetchDevToArticle('dcyfr', 'non-existent');

      expect(result).toBeNull();
    });

    it('should return null for other API errors', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      } as Response);

      const result = await fetchDevToArticle('dcyfr', 'test-article');

      expect(result).toBeNull();
    });

    it('should return null for network errors', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchDevToArticle('dcyfr', 'test-article');

      expect(result).toBeNull();
    });

    it('should use default username if not provided', async () => {
      const mockArticle: DevToArticle = {
        id: 123456,
        title: 'Test Article',
        slug: 'test-article',
        url: 'https://dev.to/dcyfr/test-article',
        published_at: '2024-01-01T00:00:00Z',
        page_views_count: 1000,
        public_reactions_count: 50,
        comments_count: 10,
        tag_list: ['javascript'],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockArticle,
      } as Response);

      await fetchDevToArticle(undefined, 'test-article');

      expect(fetch).toHaveBeenCalledWith(
        'https://dev.to/api/articles/dcyfr/test-article',
        expect.any(Object)
      );
    });
  });

  describe('fetchDevToMetrics', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should fetch and process metrics successfully', async () => {
      const mockArticle: DevToArticle = {
        id: 123456,
        title: 'Test Article',
        slug: 'test-article',
        url: 'https://dev.to/dcyfr/test-article',
        published_at: '2024-01-01T00:00:00Z',
        page_views_count: 1000,
        public_reactions_count: 50,
        comments_count: 10,
        tag_list: ['javascript'],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockArticle,
      } as Response);

      const result = await fetchDevToMetrics('post-123', 'test-article', 'dcyfr');

      expect(result).toMatchObject({
        postId: 'post-123',
        devSlug: 'test-article',
        devId: 123456,
        pageViews: 1000,
        reactions: 50,
        comments: 10,
        url: 'https://dev.to/dcyfr/test-article',
      });
      expect(result?.publishedAt).toBeInstanceOf(Date);
      expect(result?.lastFetchedAt).toBeInstanceOf(Date);
    });

    it('should return null when article not found', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not Found',
      } as Response);

      const result = await fetchDevToMetrics('post-123', 'non-existent');

      expect(result).toBeNull();
    });
  });

  describe('fetchDevToMetricsBatch', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it('should fetch multiple articles in batch', async () => {
      const mockArticle1: DevToArticle = {
        id: 1,
        title: 'Article 1',
        slug: 'article-1',
        url: 'https://dev.to/dcyfr/article-1',
        published_at: '2024-01-01T00:00:00Z',
        page_views_count: 100,
        public_reactions_count: 5,
        comments_count: 1,
        tag_list: ['test'],
      };

      const mockArticle2: DevToArticle = {
        id: 2,
        title: 'Article 2',
        slug: 'article-2',
        url: 'https://dev.to/dcyfr/article-2',
        published_at: '2024-01-02T00:00:00Z',
        page_views_count: 200,
        public_reactions_count: 10,
        comments_count: 2,
        tag_list: ['test'],
      };

      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockArticle1,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockArticle2,
        } as Response);

      const articles = [
        { postId: 'post-1', devSlug: 'article-1' },
        { postId: 'post-2', devSlug: 'article-2' },
      ];

      const resultPromise = fetchDevToMetricsBatch(articles);

      // Fast-forward timers to complete the batch
      await vi.runAllTimersAsync();
      const results = await resultPromise;

      expect(results).toHaveLength(2);
      expect(results[0]).toMatchObject({
        postId: 'post-1',
        devSlug: 'article-1',
        devId: 1,
        pageViews: 100,
      });
      expect(results[1]).toMatchObject({
        postId: 'post-2',
        devSlug: 'article-2',
        devId: 2,
        pageViews: 200,
      });
    });

    it('should handle failures in batch gracefully', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 1,
            title: 'Article 1',
            slug: 'article-1',
            url: 'https://dev.to/dcyfr/article-1',
            published_at: '2024-01-01T00:00:00Z',
            page_views_count: 100,
            public_reactions_count: 5,
            comments_count: 1,
            tag_list: ['test'],
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          text: async () => 'Not Found',
        } as Response);

      const articles = [
        { postId: 'post-1', devSlug: 'article-1' },
        { postId: 'post-2', devSlug: 'non-existent' },
      ];

      const resultPromise = fetchDevToMetricsBatch(articles);

      await vi.runAllTimersAsync();
      const results = await resultPromise;

      expect(results).toHaveLength(2);
      expect(results[0]).not.toBeNull();
      expect(results[1]).toBeNull();
    });
  });

  describe('getDevToUrl', () => {
    it('should generate correct DEV.to URL', () => {
      const url = getDevToUrl('dcyfr', 'my-article');
      expect(url).toBe('https://dev.to/dcyfr/my-article');
    });
  });

  describe('isValidDevSlug', () => {
    it('should validate correct slugs', () => {
      expect(isValidDevSlug('my-article')).toBe(true);
      expect(isValidDevSlug('article-123')).toBe(true);
      expect(isValidDevSlug('test-article-slug')).toBe(true);
      expect(isValidDevSlug('a')).toBe(true);
    });

    it('should reject invalid slugs', () => {
      expect(isValidDevSlug('My Article')).toBe(false); // uppercase
      expect(isValidDevSlug('my_article')).toBe(false); // underscore
      expect(isValidDevSlug('my article')).toBe(false); // space
      expect(isValidDevSlug('my@article')).toBe(false); // special char
      expect(isValidDevSlug('')).toBe(false); // empty
      expect(isValidDevSlug('a'.repeat(101))).toBe(false); // too long
    });
  });

  describe('getEngagementRate', () => {
    it('should calculate engagement rate correctly', () => {
      const metrics: DevToMetrics = {
        postId: 'post-123',
        devSlug: 'test',
        devId: 123,
        pageViews: 1000,
        reactions: 50,
        comments: 10,
        publishedAt: new Date(),
        lastFetchedAt: new Date(),
        url: 'https://dev.to/dcyfr/test',
      };

      const rate = getEngagementRate(metrics);
      expect(rate).toBe(0.06); // (50 + 10) / 1000 = 0.06
    });

    it('should return 0 for zero page views', () => {
      const metrics: DevToMetrics = {
        postId: 'post-123',
        devSlug: 'test',
        devId: 123,
        pageViews: 0,
        reactions: 50,
        comments: 10,
        publishedAt: new Date(),
        lastFetchedAt: new Date(),
        url: 'https://dev.to/dcyfr/test',
      };

      const rate = getEngagementRate(metrics);
      expect(rate).toBe(0);
    });

    it('should handle zero engagement', () => {
      const metrics: DevToMetrics = {
        postId: 'post-123',
        devSlug: 'test',
        devId: 123,
        pageViews: 1000,
        reactions: 0,
        comments: 0,
        publishedAt: new Date(),
        lastFetchedAt: new Date(),
        url: 'https://dev.to/dcyfr/test',
      };

      const rate = getEngagementRate(metrics);
      expect(rate).toBe(0);
    });
  });

  describe('areMetricsStale', () => {
    it('should return true for stale metrics (>6 hours)', () => {
      const metrics: DevToMetrics = {
        postId: 'post-123',
        devSlug: 'test',
        devId: 123,
        pageViews: 1000,
        reactions: 50,
        comments: 10,
        publishedAt: new Date(),
        lastFetchedAt: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
        url: 'https://dev.to/dcyfr/test',
      };

      expect(areMetricsStale(metrics)).toBe(true);
    });

    it('should return false for fresh metrics (<6 hours)', () => {
      const metrics: DevToMetrics = {
        postId: 'post-123',
        devSlug: 'test',
        devId: 123,
        pageViews: 1000,
        reactions: 50,
        comments: 10,
        publishedAt: new Date(),
        lastFetchedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        url: 'https://dev.to/dcyfr/test',
      };

      expect(areMetricsStale(metrics)).toBe(false);
    });

    it('should respect custom max age', () => {
      const metrics: DevToMetrics = {
        postId: 'post-123',
        devSlug: 'test',
        devId: 123,
        pageViews: 1000,
        reactions: 50,
        comments: 10,
        publishedAt: new Date(),
        lastFetchedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        url: 'https://dev.to/dcyfr/test',
      };

      expect(areMetricsStale(metrics, 1)).toBe(true); // 1 hour max age
      expect(areMetricsStale(metrics, 3)).toBe(false); // 3 hour max age
    });

    it('should handle very recent metrics', () => {
      const metrics: DevToMetrics = {
        postId: 'post-123',
        devSlug: 'test',
        devId: 123,
        pageViews: 1000,
        reactions: 50,
        comments: 10,
        publishedAt: new Date(),
        lastFetchedAt: new Date(), // just now
        url: 'https://dev.to/dcyfr/test',
      };

      expect(areMetricsStale(metrics)).toBe(false);
    });
  });
});

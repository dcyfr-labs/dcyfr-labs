/**
 * Tests for Related Posts Recommendation Algorithm
 *
 * Tests the content recommendation system based on shared tags,
 * featured status, and archived status scoring.
 */

import { describe, it, expect, vi } from 'vitest';
import { getRelatedPosts } from '@/lib/related-posts';
import type { Post } from '@/data/posts';

describe('related-posts.ts', () => {
  // Helper to create test posts
  const createPost = (overrides: Partial<Post> = {}): Post => ({
    id: 'test-id',
    slug: 'test-slug',
    title: 'Test Post',
    summary: 'Test summary',
    body: 'Test body',
    publishedAt: '2024-01-15',
    tags: [],
    readingTime: { words: 600, minutes: 3, text: '3 min read' },
    ...overrides,
  });

  describe('getRelatedPosts', () => {
    it('should return posts with shared tags', () => {
      const currentPost = createPost({
        slug: 'current',
        tags: ['javascript', 'testing'],
      });

      const allPosts = [
        currentPost,
        createPost({ slug: 'related-1', tags: ['javascript', 'react'] }),
        createPost({ slug: 'related-2', tags: ['testing', 'vitest'] }),
        createPost({ slug: 'unrelated', tags: ['python', 'django'] }),
      ];

      const related = getRelatedPosts(currentPost, allPosts);

      expect(related).toHaveLength(2);
      expect(related.map((p) => p.slug)).toContain('related-1');
      expect(related.map((p) => p.slug)).toContain('related-2');
      expect(related.map((p) => p.slug)).not.toContain('unrelated');
    });

    it('should exclude the current post', () => {
      const currentPost = createPost({
        slug: 'current',
        tags: ['javascript'],
      });

      const allPosts = [currentPost, createPost({ slug: 'related', tags: ['javascript'] })];

      const related = getRelatedPosts(currentPost, allPosts);

      expect(related).toHaveLength(1);
      expect(related[0].slug).toBe('related');
      expect(related[0].slug).not.toBe('current');
    });

    it('should respect the limit parameter', () => {
      const currentPost = createPost({
        slug: 'current',
        tags: ['javascript'],
      });

      const allPosts = [
        currentPost,
        createPost({ slug: 'post-1', tags: ['javascript'] }),
        createPost({ slug: 'post-2', tags: ['javascript'] }),
        createPost({ slug: 'post-3', tags: ['javascript'] }),
        createPost({ slug: 'post-4', tags: ['javascript'] }),
      ];

      const related = getRelatedPosts(currentPost, allPosts, 2);

      expect(related).toHaveLength(2);
    });

    it('should use default limit of 3', () => {
      const currentPost = createPost({
        slug: 'current',
        tags: ['javascript'],
      });

      const allPosts = [
        currentPost,
        createPost({ slug: 'post-1', tags: ['javascript'] }),
        createPost({ slug: 'post-2', tags: ['javascript'] }),
        createPost({ slug: 'post-3', tags: ['javascript'] }),
        createPost({ slug: 'post-4', tags: ['javascript'] }),
        createPost({ slug: 'post-5', tags: ['javascript'] }),
      ];

      const related = getRelatedPosts(currentPost, allPosts);

      expect(related).toHaveLength(3);
    });

    it('should prioritize posts with more shared tags', () => {
      const currentPost = createPost({
        slug: 'current',
        tags: ['javascript', 'testing', 'react'],
      });

      const allPosts = [
        currentPost,
        createPost({
          slug: 'high-match',
          tags: ['javascript', 'testing', 'react'],
          publishedAt: '2024-01-10',
        }),
        createPost({
          slug: 'medium-match',
          tags: ['javascript', 'testing'],
          publishedAt: '2024-01-11',
        }),
        createPost({
          slug: 'low-match',
          tags: ['javascript'],
          publishedAt: '2024-01-12',
        }),
      ];

      const related = getRelatedPosts(currentPost, allPosts);

      expect(related[0].slug).toBe('high-match');
      expect(related[1].slug).toBe('medium-match');
      expect(related[2].slug).toBe('low-match');
    });

    it('should give bonus score to featured posts', () => {
      const currentPost = createPost({
        slug: 'current',
        tags: ['javascript'],
      });

      const allPosts = [
        currentPost,
        createPost({
          slug: 'featured',
          tags: ['javascript'],
          featured: true,
          publishedAt: '2024-01-10',
        }),
        createPost({
          slug: 'normal',
          tags: ['javascript'],
          publishedAt: '2024-01-15', // Newer but not featured
        }),
      ];

      const related = getRelatedPosts(currentPost, allPosts);

      // Featured post should come first despite being older
      expect(related[0].slug).toBe('featured');
    });

    it('should give penalty to archived posts', () => {
      const currentPost = createPost({
        slug: 'current',
        tags: ['javascript'],
      });

      const allPosts = [
        currentPost,
        createPost({
          slug: 'archived',
          tags: ['javascript'],
          archived: true,
          publishedAt: '2024-01-15',
        }),
        createPost({
          slug: 'active',
          tags: ['javascript'],
          publishedAt: '2024-01-10', // Older but not archived
        }),
      ];

      const related = getRelatedPosts(currentPost, allPosts);

      // Active post should come first despite being older
      expect(related[0].slug).toBe('active');
    });

    it('should sort by date when scores are equal', () => {
      const currentPost = createPost({
        slug: 'current',
        tags: ['javascript'],
      });

      const allPosts = [
        currentPost,
        createPost({
          slug: 'older',
          tags: ['javascript'],
          publishedAt: '2024-01-10',
        }),
        createPost({
          slug: 'newer',
          tags: ['javascript'],
          publishedAt: '2024-01-20',
        }),
        createPost({
          slug: 'middle',
          tags: ['javascript'],
          publishedAt: '2024-01-15',
        }),
      ];

      const related = getRelatedPosts(currentPost, allPosts);

      // Should be sorted by date (newest first) when scores are equal
      expect(related[0].slug).toBe('newer');
      expect(related[1].slug).toBe('middle');
      expect(related[2].slug).toBe('older');
    });

    it('should return empty array when no posts share tags', () => {
      const currentPost = createPost({
        slug: 'current',
        tags: ['javascript'],
      });

      const allPosts = [
        currentPost,
        createPost({ slug: 'python-post', tags: ['python'] }),
        createPost({ slug: 'rust-post', tags: ['rust'] }),
      ];

      const related = getRelatedPosts(currentPost, allPosts);

      expect(related).toEqual([]);
    });

    it('should return empty array when current post has no tags', () => {
      const currentPost = createPost({
        slug: 'current',
        tags: [],
      });

      const allPosts = [currentPost, createPost({ slug: 'tagged-post', tags: ['javascript'] })];

      const related = getRelatedPosts(currentPost, allPosts);

      expect(related).toEqual([]);
    });

    it('should return empty array when all posts array is empty', () => {
      const currentPost = createPost({
        slug: 'current',
        tags: ['javascript'],
      });

      const related = getRelatedPosts(currentPost, []);

      expect(related).toEqual([]);
    });

    it('should return empty array when only current post exists', () => {
      const currentPost = createPost({
        slug: 'current',
        tags: ['javascript'],
      });

      const related = getRelatedPosts(currentPost, [currentPost]);

      expect(related).toEqual([]);
    });

    it('should handle complex scoring scenario', () => {
      const currentPost = createPost({
        slug: 'current',
        tags: ['javascript', 'testing'],
      });

      const allPosts = [
        currentPost,
        createPost({
          slug: 'post-1',
          tags: ['javascript', 'testing', 'react'], // 2 shared + featured = 2.5 score
          featured: true,
          publishedAt: '2024-01-10',
        }),
        createPost({
          slug: 'post-2',
          tags: ['javascript', 'testing', 'vue'], // 2 shared = 2 score
          publishedAt: '2024-01-15',
        }),
        createPost({
          slug: 'post-3',
          tags: ['javascript', 'testing'], // 2 shared - archived = 1.5 score
          archived: true,
          publishedAt: '2024-01-20',
        }),
        createPost({
          slug: 'post-4',
          tags: ['javascript'], // 1 shared = 1 score
          publishedAt: '2024-01-18',
        }),
      ];

      const related = getRelatedPosts(currentPost, allPosts);

      expect(related[0].slug).toBe('post-1'); // Score: 2.5
      expect(related[1].slug).toBe('post-2'); // Score: 2.0
      expect(related[2].slug).toBe('post-3'); // Score: 1.5
    });

    it('should handle posts with many tags', () => {
      const currentPost = createPost({
        slug: 'current',
        tags: ['javascript', 'typescript', 'react', 'testing', 'webpack'],
      });

      const allPosts = [
        currentPost,
        createPost({
          slug: 'super-match',
          tags: ['javascript', 'typescript', 'react', 'testing', 'webpack', 'jest'],
        }),
        createPost({
          slug: 'partial-match',
          tags: ['javascript', 'python'],
        }),
      ];

      const related = getRelatedPosts(currentPost, allPosts);

      expect(related[0].slug).toBe('super-match');
      expect(related[1].slug).toBe('partial-match');
    });

    it('should return fewer posts than limit if not enough matches', () => {
      const currentPost = createPost({
        slug: 'current',
        tags: ['javascript'],
      });

      const allPosts = [currentPost, createPost({ slug: 'only-match', tags: ['javascript'] })];

      const related = getRelatedPosts(currentPost, allPosts, 5);

      expect(related).toHaveLength(1);
    });
  });

  describe('production environment behavior', () => {
    it('should exclude draft posts in production', () => {
      vi.stubEnv('NODE_ENV', 'production');

      const currentPost = createPost({
        slug: 'current',
        tags: ['javascript'],
      });

      const allPosts = [
        currentPost,
        createPost({
          slug: 'published',
          tags: ['javascript'],
          draft: false,
        }),
        createPost({
          slug: 'draft',
          tags: ['javascript'],
          draft: true,
        }),
      ];

      const related = getRelatedPosts(currentPost, allPosts);

      expect(related).toHaveLength(1);
      expect(related[0].slug).toBe('published');
      expect(related.map((p) => p.slug)).not.toContain('draft');

      vi.unstubAllEnvs();
    });

    it('should include draft posts in development', () => {
      vi.stubEnv('NODE_ENV', 'development');

      const currentPost = createPost({
        slug: 'current',
        tags: ['javascript'],
      });

      const allPosts = [
        currentPost,
        createPost({
          slug: 'published',
          tags: ['javascript'],
          draft: false,
        }),
        createPost({
          slug: 'draft',
          tags: ['javascript'],
          draft: true,
        }),
      ];

      const related = getRelatedPosts(currentPost, allPosts);

      expect(related).toHaveLength(2);
      expect(related.map((p) => p.slug)).toContain('published');
      expect(related.map((p) => p.slug)).toContain('draft');

      vi.unstubAllEnvs();
    });
  });

  describe('edge cases', () => {
    it('should handle posts with duplicate tags', () => {
      const currentPost = createPost({
        slug: 'current',
        tags: ['javascript', 'javascript'], // Duplicate tag
      });

      const allPosts = [
        currentPost,
        createPost({
          slug: 'related',
          tags: ['javascript'],
        }),
      ];

      const related = getRelatedPosts(currentPost, allPosts);

      expect(related).toHaveLength(1);
      expect(related[0].slug).toBe('related');
    });

    it('should handle case-sensitive tag matching', () => {
      const currentPost = createPost({
        slug: 'current',
        tags: ['JavaScript'],
      });

      const allPosts = [
        currentPost,
        createPost({
          slug: 'exact-case',
          tags: ['JavaScript'],
        }),
        createPost({
          slug: 'different-case',
          tags: ['javascript'],
        }),
      ];

      const related = getRelatedPosts(currentPost, allPosts);

      // Should only match exact case
      expect(related).toHaveLength(1);
      expect(related[0].slug).toBe('exact-case');
    });

    it('should handle limit of 0', () => {
      const currentPost = createPost({
        slug: 'current',
        tags: ['javascript'],
      });

      const allPosts = [currentPost, createPost({ slug: 'related', tags: ['javascript'] })];

      const related = getRelatedPosts(currentPost, allPosts, 0);

      expect(related).toEqual([]);
    });

    it('should handle very large limit', () => {
      const currentPost = createPost({
        slug: 'current',
        tags: ['javascript'],
      });

      const allPosts = [
        currentPost,
        createPost({ slug: 'post-1', tags: ['javascript'] }),
        createPost({ slug: 'post-2', tags: ['javascript'] }),
      ];

      const related = getRelatedPosts(currentPost, allPosts, 1000);

      expect(related).toHaveLength(2);
    });

    it('should handle posts with same slug but different instances', () => {
      const currentPost = createPost({
        slug: 'same-slug',
        tags: ['javascript'],
      });

      const duplicatePost = createPost({
        slug: 'same-slug',
        tags: ['javascript', 'testing'],
      });

      const allPosts = [
        currentPost,
        duplicatePost,
        createPost({ slug: 'different', tags: ['javascript'] }),
      ];

      const related = getRelatedPosts(currentPost, allPosts);

      // Should exclude posts with the same slug
      expect(related).toHaveLength(1);
      expect(related[0].slug).toBe('different');
    });
  });
});

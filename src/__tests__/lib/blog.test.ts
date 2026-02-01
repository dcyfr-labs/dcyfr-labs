import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  buildRedirectMap,
  getCanonicalSlug,
  getPostByAnySlug,
  calculateReadingTime,
  generatePostId,
  isScheduledPost,
  isPostVisible,
} from '@/lib/blog.server';
import type { Post } from '@/data/posts';

/**
 * Unit tests for blog utility functions
 *
 * Note: getAllPosts() and getPostBySlug() are file system dependent and
 * are better tested with integration tests or E2E tests.
 * Here we test the pure functions that don't depend on file system.
 */

describe('blog utilities', () => {
  // Mock posts for testing redirect and slug resolution functions
  const mockPosts: Post[] = [
    {
      id: 'post-1',
      slug: 'current-slug',
      title: 'Test Post',
      summary: 'Test summary',
      publishedAt: '2025-01-01',
      tags: ['test'],
      body: 'Content',
      previousSlugs: ['old-slug-1', 'old-slug-2'],
      readingTime: { words: 100, minutes: 1, text: '1 min read' },
    },
    {
      id: 'post-2',
      slug: 'another-slug',
      title: 'Another Post',
      summary: 'Another summary',
      publishedAt: '2025-01-02',
      tags: ['test'],
      body: 'More content',
      previousSlugs: ['another-old-slug'],
      readingTime: { words: 100, minutes: 1, text: '1 min read' },
    },
    {
      id: 'post-3',
      slug: 'no-redirects',
      title: 'No Redirects',
      summary: 'No redirects summary',
      publishedAt: '2025-01-03',
      tags: [],
      body: 'Content',
      readingTime: { words: 100, minutes: 1, text: '1 min read' },
    },
  ];

  describe('buildRedirectMap', () => {
    it('should build redirect map from previousSlugs', () => {
      const redirectMap = buildRedirectMap(mockPosts);

      expect(redirectMap.get('old-slug-1')).toBe('current-slug');
      expect(redirectMap.get('old-slug-2')).toBe('current-slug');
      expect(redirectMap.get('another-old-slug')).toBe('another-slug');
      expect(redirectMap.get('non-existent')).toBeUndefined();
    });

    it('should return empty map for posts without previousSlugs', () => {
      const posts: Post[] = [
        {
          id: 'post-1',
          slug: 'current-slug',
          title: 'Test',
          summary: 'Summary',
          publishedAt: '2025-01-01',
          tags: [],
          body: 'Content',
          readingTime: { words: 10, minutes: 1, text: '1 min read' },
        },
      ];

      const redirectMap = buildRedirectMap(posts);
      expect(redirectMap.size).toBe(0);
    });

    it('should handle multiple posts with previousSlugs', () => {
      const redirectMap = buildRedirectMap(mockPosts);

      // Should have 3 total redirects (2 from post-1, 1 from post-2)
      expect(redirectMap.size).toBe(3);
    });
  });

  describe('getCanonicalSlug', () => {
    it('should return canonical slug for old slug', () => {
      const canonical = getCanonicalSlug('old-slug-1', mockPosts);
      expect(canonical).toBe('current-slug');
    });

    it('should return canonical slug for another old slug', () => {
      const canonical = getCanonicalSlug('another-old-slug', mockPosts);
      expect(canonical).toBe('another-slug');
    });

    it('should return input slug if not in redirect map', () => {
      const canonical = getCanonicalSlug('some-random-slug', mockPosts);
      expect(canonical).toBe('some-random-slug');
    });

    it('should return current slug as-is', () => {
      const canonical = getCanonicalSlug('current-slug', mockPosts);
      expect(canonical).toBe('current-slug');
    });
  });

  describe('getPostByAnySlug', () => {
    it('should find post by current slug without redirect', () => {
      const result = getPostByAnySlug('current-slug', mockPosts);

      expect(result).not.toBeNull();
      expect(result?.post.slug).toBe('current-slug');
      expect(result?.post.title).toBe('Test Post');
      expect(result?.needsRedirect).toBe(false);
      expect(result?.canonicalSlug).toBe('current-slug');
    });

    it('should find post by previous slug with redirect', () => {
      const result = getPostByAnySlug('old-slug-1', mockPosts);

      expect(result).not.toBeNull();
      expect(result?.post.slug).toBe('current-slug');
      expect(result?.needsRedirect).toBe(true);
      expect(result?.canonicalSlug).toBe('current-slug');
    });

    it('should find post by another previous slug with redirect', () => {
      const result = getPostByAnySlug('another-old-slug', mockPosts);

      expect(result).not.toBeNull();
      expect(result?.post.slug).toBe('another-slug');
      expect(result?.needsRedirect).toBe(true);
      expect(result?.canonicalSlug).toBe('another-slug');
    });

    it('should return null for non-existent slug', () => {
      const result = getPostByAnySlug('non-existent-slug', mockPosts);
      expect(result).toBeNull();
    });

    it('should handle posts without previous slugs', () => {
      const result = getPostByAnySlug('no-redirects', mockPosts);

      expect(result).not.toBeNull();
      expect(result?.post.slug).toBe('no-redirects');
      expect(result?.needsRedirect).toBe(false);
    });
  });

  describe('calculateReadingTime', () => {
    it('should calculate reading time for short text', () => {
      const shortText = 'This is a short text with about ten words here.';
      const result = calculateReadingTime(shortText);

      expect(result.words).toBe(10);
      expect(result.minutes).toBe(1); // Minimum 1 minute
      expect(result.text).toBe('1 min read');
    });

    it('should calculate reading time for longer text', () => {
      // Generate text with ~450 words (should be 2 minutes at 225 wpm)
      const words = new Array(450).fill('word').join(' ');
      const result = calculateReadingTime(words);

      expect(result.words).toBe(450);
      expect(result.minutes).toBe(2);
      expect(result.text).toBe('2 min read');
    });

    it('should exclude code blocks from word count', () => {
      const textWithCode = `
        Some text before.
        \`\`\`javascript
        function example() {
          console.warn("This code should be ignored");
          const manyWordsInCode = "lots of words here that should not count";
        }
        \`\`\`
        Some text after.
      `;
      const result = calculateReadingTime(textWithCode);

      // Should only count "Some text before" (3) and "Some text after" (3) = 6 words
      expect(result.words).toBeLessThan(20); // Much less than if code was counted
      expect(result.minutes).toBe(1);
    });

    it('should exclude HTML tags from word count', () => {
      const textWithHtml = '<div>Hello <strong>world</strong> this is <em>test</em></div>';
      const result = calculateReadingTime(textWithHtml);

      // Should count "Hello world this is test" = 5 words
      expect(result.words).toBe(5);
      expect(result.minutes).toBe(1);
    });

    it('should handle empty string', () => {
      const result = calculateReadingTime('');

      expect(result.words).toBe(0);
      expect(result.minutes).toBe(1); // Minimum 1 minute
      expect(result.text).toBe('1 min read');
    });

    it('should handle whitespace-only string', () => {
      const result = calculateReadingTime('   \n\n   \t  ');

      expect(result.words).toBe(0);
      expect(result.minutes).toBe(1);
    });

    it('should round up minutes correctly', () => {
      // 226 words should round up to 2 minutes
      const words = new Array(226).fill('word').join(' ');
      const result = calculateReadingTime(words);

      expect(result.words).toBe(226);
      expect(result.minutes).toBe(2);
    });

    it('should handle multiple code blocks', () => {
      const textWithMultipleCodeBlocks = `
        Introduction text.
        \`\`\`javascript
        const code1 = "first block";
        \`\`\`
        Middle text.
        \`\`\`python
        code2 = "second block"
        \`\`\`
        Conclusion text.
      `;
      const result = calculateReadingTime(textWithMultipleCodeBlocks);

      // Should count "Introduction text" (2) + "Middle text" (2) + "Conclusion text" (2) = 6 words
      expect(result.words).toBeLessThan(15);
      expect(result.minutes).toBe(1);
    });

    it('should handle realistic blog post length', () => {
      // Generate realistic post ~1125 words (5 minutes)
      const words = new Array(1125).fill('word').join(' ');
      const result = calculateReadingTime(words);

      expect(result.words).toBe(1125);
      expect(result.minutes).toBe(5);
      expect(result.text).toBe('5 min read');
    });
  });

  describe('generatePostId', () => {
    it('should generate stable ID from date and slug', () => {
      const id1 = generatePostId('2025-01-15', 'test-post');
      const id2 = generatePostId('2025-01-15', 'test-post');

      expect(id1).toBe(id2); // Should be deterministic
      expect(id1).toMatch(/^post-20250115-[a-f0-9]{8}$/);
    });

    it('should generate different IDs for different dates', () => {
      const id1 = generatePostId('2025-01-15', 'test-post');
      const id2 = generatePostId('2025-01-16', 'test-post');

      expect(id1).not.toBe(id2);
    });

    it('should generate different IDs for different slugs', () => {
      const id1 = generatePostId('2025-01-15', 'test-post-1');
      const id2 = generatePostId('2025-01-15', 'test-post-2');

      expect(id1).not.toBe(id2);
    });

    it('should format date without hyphens', () => {
      const id = generatePostId('2025-10-05', 'test');

      expect(id).toContain('post-20251005-');
    });

    it('should generate 8-character hash', () => {
      const id = generatePostId('2025-01-15', 'test-post');
      const hashPart = id.split('-')[2];

      expect(hashPart).toHaveLength(8);
      expect(hashPart).toMatch(/^[a-f0-9]{8}$/);
    });

    it('should be stable across multiple calls', () => {
      const ids = Array.from({ length: 100 }, () => generatePostId('2025-01-15', 'test-post'));

      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(1); // All IDs should be identical
    });

    it('should handle special characters in slug', () => {
      const id = generatePostId('2025-01-15', 'test-post-with-special_chars-123');

      expect(id).toMatch(/^post-20250115-[a-f0-9]{8}$/);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty posts array in buildRedirectMap', () => {
      const redirectMap = buildRedirectMap([]);
      expect(redirectMap.size).toBe(0);
    });

    it('should handle empty posts array in getCanonicalSlug', () => {
      const canonical = getCanonicalSlug('any-slug', []);
      expect(canonical).toBe('any-slug');
    });

    it('should handle empty posts array in getPostByAnySlug', () => {
      const result = getPostByAnySlug('any-slug', []);
      expect(result).toBeNull();
    });

    it('should handle posts with empty previousSlugs array', () => {
      const posts: Post[] = [
        {
          id: 'post-1',
          slug: 'test-slug',
          title: 'Test',
          summary: 'Summary',
          publishedAt: '2025-01-01',
          tags: [],
          body: 'Content',
          previousSlugs: [],
          readingTime: { words: 10, minutes: 1, text: '1 min read' },
        },
      ];

      const redirectMap = buildRedirectMap(posts);
      expect(redirectMap.size).toBe(0);
    });

    it('should handle multiple posts with overlapping tags', () => {
      const posts: Post[] = [
        {
          id: 'post-1',
          slug: 'post-1',
          title: 'Post 1',
          summary: 'Summary 1',
          publishedAt: '2025-01-01',
          tags: ['javascript', 'testing'],
          body: 'Content',
          readingTime: { words: 10, minutes: 1, text: '1 min read' },
        },
        {
          id: 'post-2',
          slug: 'post-2',
          title: 'Post 2',
          summary: 'Summary 2',
          publishedAt: '2025-01-02',
          tags: ['javascript', 'react'],
          body: 'Content',
          readingTime: { words: 10, minutes: 1, text: '1 min read' },
        },
      ];

      const result1 = getPostByAnySlug('post-1', posts);
      const result2 = getPostByAnySlug('post-2', posts);

      expect(result1?.post.tags).toContain('javascript');
      expect(result2?.post.tags).toContain('javascript');
      expect(result1?.post.slug).toBe('post-1');
      expect(result2?.post.slug).toBe('post-2');
    });

    it('should prioritize current slug over previous slugs', () => {
      // Edge case: if a current slug matches another post's previous slug
      const posts: Post[] = [
        {
          id: 'post-1',
          slug: 'new-slug',
          title: 'Post 1',
          summary: 'Summary 1',
          publishedAt: '2025-01-01',
          tags: [],
          body: 'Content',
          readingTime: { words: 10, minutes: 1, text: '1 min read' },
        },
        {
          id: 'post-2',
          slug: 'another-slug',
          title: 'Post 2',
          summary: 'Summary 2',
          publishedAt: '2025-01-02',
          tags: [],
          body: 'Content',
          previousSlugs: ['new-slug'],
          readingTime: { words: 10, minutes: 1, text: '1 min read' },
        },
      ];

      const result = getPostByAnySlug('new-slug', posts);

      // Should find post-1 directly without redirect
      expect(result?.post.slug).toBe('new-slug');
      expect(result?.needsRedirect).toBe(false);
    });

    it('should handle very long previousSlugs array', () => {
      const manyPreviousSlugs = Array.from({ length: 100 }, (_, i) => `old-slug-${i}`);
      const posts: Post[] = [
        {
          id: 'post-1',
          slug: 'current-slug',
          title: 'Test',
          summary: 'Summary',
          publishedAt: '2025-01-01',
          tags: [],
          body: 'Content',
          previousSlugs: manyPreviousSlugs,
          readingTime: { words: 10, minutes: 1, text: '1 min read' },
        },
      ];

      const redirectMap = buildRedirectMap(posts);
      expect(redirectMap.size).toBe(100);

      const result = getPostByAnySlug('old-slug-50', posts);
      expect(result?.post.slug).toBe('current-slug');
      expect(result?.needsRedirect).toBe(true);
    });
  });

  describe('isScheduledPost', () => {
    it('should return true for future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(isScheduledPost(futureDate.toISOString())).toBe(true);
    });

    it('should return false for past dates', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);
      expect(isScheduledPost(pastDate.toISOString())).toBe(false);
    });

    it('should return false for current date', () => {
      // Use a date slightly in the past to avoid race conditions
      const now = new Date();
      now.setSeconds(now.getSeconds() - 10);
      expect(isScheduledPost(now.toISOString())).toBe(false);
    });

    it('should handle ISO date strings with timezone', () => {
      const futureDate = '2099-12-31T23:59:59Z';
      expect(isScheduledPost(futureDate)).toBe(true);
    });

    it('should handle simple date strings', () => {
      expect(isScheduledPost('2099-01-01')).toBe(true);
      expect(isScheduledPost('2000-01-01')).toBe(false);
    });
  });

  describe('isPostVisible', () => {
    const pastDate = '2020-01-01T12:00:00Z';
    const futureDate = '2099-01-01T12:00:00Z';

    describe('in development (isProduction = false)', () => {
      it('should show regular posts', () => {
        const post = { draft: false, publishedAt: pastDate };
        expect(isPostVisible(post, false)).toBe(true);
      });

      it('should show draft posts', () => {
        const post = { draft: true, publishedAt: pastDate };
        expect(isPostVisible(post, false)).toBe(true);
      });

      it('should show scheduled posts', () => {
        const post = { draft: false, publishedAt: futureDate };
        expect(isPostVisible(post, false)).toBe(true);
      });

      it('should show draft scheduled posts', () => {
        const post = { draft: true, publishedAt: futureDate };
        expect(isPostVisible(post, false)).toBe(true);
      });
    });

    describe('in production (isProduction = true)', () => {
      it('should show regular published posts', () => {
        const post = { draft: false, publishedAt: pastDate };
        expect(isPostVisible(post, true)).toBe(true);
      });

      it('should hide draft posts', () => {
        const post = { draft: true, publishedAt: pastDate };
        expect(isPostVisible(post, true)).toBe(false);
      });

      it('should hide scheduled posts', () => {
        const post = { draft: false, publishedAt: futureDate };
        expect(isPostVisible(post, true)).toBe(false);
      });

      it('should hide draft scheduled posts', () => {
        const post = { draft: true, publishedAt: futureDate };
        expect(isPostVisible(post, true)).toBe(false);
      });

      it('should show posts with undefined draft', () => {
        const post = { draft: undefined, publishedAt: pastDate };
        expect(isPostVisible(post, true)).toBe(true);
      });
    });

    describe('in Vercel preview (VERCEL_ENV = "preview")', () => {
      beforeEach(() => {
        vi.stubEnv('NODE_ENV', 'production')
        vi.stubEnv('VERCEL_ENV', 'preview')
      })

      afterEach(() => {
        vi.unstubAllEnvs()
      })

      it('should behave like development and show draft posts by default', () => {
        const post = { draft: true, publishedAt: pastDate };
        // Call without explicit isProduction to use runtime env defaults
        expect(isPostVisible(post)).toBe(true);
      });

      it('should show scheduled posts in preview', () => {
        const post = { draft: false, publishedAt: futureDate };
        expect(isPostVisible(post)).toBe(true);
      });
    });
  });

  describe('Category filtering with archived posts', () => {
    const mockPostsWithCategories: Post[] = [
      {
        id: 'post-1',
        slug: 'active-career-post',
        title: 'Active Career Post',
        summary: 'Summary',
        publishedAt: '2025-01-01',
        category: 'Career',
        tags: [],
        body: 'Content',
        archived: false,
        readingTime: { words: 100, minutes: 1, text: '1 min read' },
      },
      {
        id: 'post-2',
        slug: 'archived-career-post',
        title: 'Archived Career Post',
        summary: 'Summary',
        publishedAt: '2024-01-01',
        category: 'Career',
        tags: [],
        body: 'Content',
        archived: true,
        readingTime: { words: 100, minutes: 1, text: '1 min read' },
      },
      {
        id: 'post-3',
        slug: 'only-archived-demo-post',
        title: 'Only Archived Demo Post',
        summary: 'Summary',
        publishedAt: '2023-01-01',
        category: 'Demo',
        tags: [],
        body: 'Content',
        archived: true,
        readingTime: { words: 100, minutes: 1, text: '1 min read' },
      },
      {
        id: 'post-4',
        slug: 'active-ai-post',
        title: 'Active AI Post',
        summary: 'Summary',
        publishedAt: '2025-01-15',
        category: 'AI',
        tags: [],
        body: 'Content',
        archived: false,
        readingTime: { words: 100, minutes: 1, text: '1 min read' },
      },
    ];

    it('should include categories with non-archived posts when sortBy is not "archived"', () => {
      const allCategories = Array.from(
        new Set(mockPostsWithCategories.map((p) => p.category).filter(Boolean))
      ).sort();

      const availableCategories = allCategories.filter((category) => {
        return mockPostsWithCategories.some((post) => post.category === category && !post.archived);
      });

      // Should include "Career" (has active post) and "AI" (has active post)
      // Should NOT include "Demo" (only has archived posts)
      expect(availableCategories).toContain('Career');
      expect(availableCategories).toContain('AI');
      expect(availableCategories).not.toContain('Demo');
      expect(availableCategories).toHaveLength(2);
    });

    it('should include all categories when sortBy is "archived"', () => {
      const allCategories = Array.from(
        new Set(mockPostsWithCategories.map((p) => p.category).filter(Boolean))
      ).sort();

      // When viewing archived posts, show all categories
      const availableCategories = allCategories;

      // Should include all categories: "AI", "Career", "Demo"
      expect(availableCategories).toContain('AI');
      expect(availableCategories).toContain('Career');
      expect(availableCategories).toContain('Demo');
      expect(availableCategories).toHaveLength(3);
    });

    it('should filter categories correctly for mixed archived/active posts', () => {
      const allCategories = Array.from(
        new Set(mockPostsWithCategories.map((p) => p.category).filter(Boolean))
      ).sort();

      const availableCategories = allCategories.filter((category) => {
        return mockPostsWithCategories.some((post) => post.category === category && !post.archived);
      });

      // Career has both active and archived posts - should be included
      expect(availableCategories).toContain('Career');

      // Count posts in Career category
      const careerPosts = mockPostsWithCategories.filter((p) => p.category === 'Career');
      const activeCareerPosts = careerPosts.filter((p) => !p.archived);
      const archivedCareerPosts = careerPosts.filter((p) => p.archived);

      expect(careerPosts).toHaveLength(2);
      expect(activeCareerPosts).toHaveLength(1);
      expect(archivedCareerPosts).toHaveLength(1);
    });
  });
});

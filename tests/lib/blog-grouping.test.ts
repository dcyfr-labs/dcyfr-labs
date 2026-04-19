import { describe, it, expect } from 'vitest';

import { groupPostsByCategory, sortCategoriesByCount } from '@/lib/blog-grouping';
import type { Post } from '@/data/posts';

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    slug: 'test-post',
    title: 'Test Post',
    date: '2025-01-01',
    description: 'A test post',
    category: 'AI',
    ...overrides,
  } as Post;
}

describe('blog-grouping', () => {
  describe('groupPostsByCategory', () => {
    it('groups posts by category', () => {
      const posts = [
        makePost({ slug: 'a', category: 'AI' }),
        makePost({ slug: 'b', category: 'Web' }),
        makePost({ slug: 'c', category: 'AI' }),
      ];
      const grouped = groupPostsByCategory(posts);
      expect(grouped.get('AI')?.length).toBe(2);
      expect(grouped.get('Web')?.length).toBe(1);
    });

    it('excludes posts without category', () => {
      const posts = [
        makePost({ slug: 'a', category: 'AI' }),
        makePost({ slug: 'b', category: undefined }),
      ];
      const grouped = groupPostsByCategory(posts);
      expect(grouped.size).toBe(1);
    });

    it('returns empty map for empty array', () => {
      const grouped = groupPostsByCategory([]);
      expect(grouped.size).toBe(0);
    });

    it('returns empty map when all posts lack categories', () => {
      const posts = [
        makePost({ slug: 'a', category: undefined }),
        makePost({ slug: 'b', category: undefined }),
      ];
      const grouped = groupPostsByCategory(posts);
      expect(grouped.size).toBe(0);
    });
  });

  describe('sortCategoriesByCount', () => {
    it('sorts categories by post count descending', () => {
      const grouped = new Map<any, Post[]>();
      grouped.set('AI', [makePost(), makePost(), makePost()]);
      grouped.set('Web', [makePost()]);
      grouped.set('Design', [makePost(), makePost()]);

      const sorted = sortCategoriesByCount(grouped);
      expect(sorted[0][0]).toBe('AI');
      expect(sorted[1][0]).toBe('Design');
      expect(sorted[2][0]).toBe('Web');
    });

    it('returns empty array for empty map', () => {
      const sorted = sortCategoriesByCount(new Map());
      expect(sorted).toHaveLength(0);
    });
  });
});

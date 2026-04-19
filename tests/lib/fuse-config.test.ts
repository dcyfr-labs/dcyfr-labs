import { describe, it, expect } from 'vitest';
import { fuseOptions, projectFuseOptions } from '@/lib/search/fuse-config';
import type { SearchablePost, SearchableProject, SearchIndex } from '@/lib/search/fuse-config';

describe('fuseOptions', () => {
  it('has correct threshold', () => {
    expect(fuseOptions.threshold).toBe(0.4);
  });

  it('has minimum match char length', () => {
    expect(fuseOptions.minMatchCharLength).toBe(2);
  });

  it('includes score and matches', () => {
    expect(fuseOptions.includeScore).toBe(true);
    expect(fuseOptions.includeMatches).toBe(true);
  });

  it('ignores location for better fuzzy matching', () => {
    expect(fuseOptions.ignoreLocation).toBe(true);
  });

  it('has title as highest weighted key', () => {
    const titleKey = fuseOptions.keys?.find(
      (k: any) => (typeof k === 'object' ? k.name : k) === 'title'
    ) as any;
    expect(titleKey).toBeDefined();
    expect(titleKey.weight).toBe(0.5);
  });

  it('has content as lowest weighted key', () => {
    const contentKey = fuseOptions.keys?.find(
      (k: any) => (typeof k === 'object' ? k.name : k) === 'content'
    ) as any;
    expect(contentKey).toBeDefined();
    expect(contentKey.weight).toBe(0.05);
  });

  it('searches four fields', () => {
    expect(fuseOptions.keys).toHaveLength(4);
  });
});

describe('projectFuseOptions', () => {
  it('has correct threshold', () => {
    expect(projectFuseOptions.threshold).toBe(0.4);
  });

  it('includes score', () => {
    expect(projectFuseOptions.includeScore).toBe(true);
  });

  it('has four search fields', () => {
    expect(projectFuseOptions.keys).toHaveLength(4);
  });

  it('has title as highest weighted key', () => {
    const titleKey = projectFuseOptions.keys?.find(
      (k: any) => (typeof k === 'object' ? k.name : k) === 'title'
    ) as any;
    expect(titleKey.weight).toBe(0.5);
  });
});

describe('SearchablePost type', () => {
  it('accepts valid post objects', () => {
    const post: SearchablePost = {
      id: '1',
      title: 'Test Post',
      summary: 'A test post',
      content: 'Content here',
      tags: ['test'],
      series: null,
      publishedAt: '2026-01-01',
      readingTime: 5,
      url: '/blog/test',
    };
    expect(post.id).toBe('1');
    expect(post.series).toBeNull();
  });
});

describe('SearchableProject type', () => {
  it('accepts valid project objects', () => {
    const project: SearchableProject = {
      slug: 'test-project',
      title: 'Test Project',
      description: 'A test project',
      category: 'code',
      tech: ['typescript'],
      tags: ['test'],
      status: 'active',
      url: '/work/test',
    };
    expect(project.slug).toBe('test-project');
  });
});

describe('SearchIndex type', () => {
  it('accepts valid index objects', () => {
    const index: SearchIndex = {
      posts: [],
      projects: [],
      tags: ['test'],
      series: ['intro'],
      generatedAt: '2026-01-01T00:00:00Z',
    };
    expect(index.tags).toContain('test');
    expect(index.generatedAt).toBeTruthy();
  });
});

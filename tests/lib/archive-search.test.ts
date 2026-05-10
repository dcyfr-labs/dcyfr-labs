/**
 * Regression guard for /blog?q=… search behavior.
 *
 * History: a 2026-05-09 production audit briefly flagged this path as broken
 * because in-browser DOM queries returned 0 article elements while the page's
 * Suspense streaming was still rendering. Curling the SSR HTML confirmed the
 * search filter was working correctly. These tests pin the behavior so future
 * changes to `getArchiveData` / `filterItems` don't silently regress it.
 *
 * Search is **substring + case-insensitive**, applied across all `searchFields`
 * (currently `['title', 'summary', 'body']` for blog). A `body` match counts —
 * meaning a query like `?q=ai` legitimately matches every post that mentions
 * "AI" anywhere in its content. That's by design; it's broader than a typical
 * title-only search and may produce more results than a reader expects.
 */
import { describe, it, expect } from 'vitest';
import { filterItems, getArchiveData } from '@/lib/archive';

interface MockPost {
  id: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  publishedAt: string;
}

const samplePosts: MockPost[] = [
  {
    id: '1',
    title: 'Shipping a Developer Portfolio',
    summary:
      'How I used Next.js App Router, Tailwind v4, and shadcn/ui to build a production-ready developer portfolio',
    body: 'Server components and server-first rendering...',
    tags: ['Next.js', 'Tailwind CSS', 'TypeScript'],
    publishedAt: '2025-09-10T12:00:00Z',
  },
  {
    id: '2',
    title: 'Building with AI',
    summary: 'Exploring the Model Context Protocol (MCP) and how it enables new patterns',
    body: 'MCP exposes capabilities to AI assistants...',
    tags: ['MCP', 'Developer Tools'],
    publishedAt: '2025-11-11T12:00:00Z',
  },
  {
    id: '3',
    title: 'OWASP Top 10 for Agentic AI',
    summary: 'Critical security risks facing autonomous AI systems',
    body: 'OWASP first Top 10 for Agentic Applications...',
    tags: ['AI Security', 'OWASP'],
    publishedAt: '2025-12-19T12:00:00Z',
  },
];

describe('blog filterItems search', () => {
  it('matches title substring case-insensitive', () => {
    const result = filterItems(samplePosts, {
      searchQuery: 'portfolio',
      searchFields: ['title', 'summary', 'body'],
    });
    expect(result.map((p) => p.id).sort()).toEqual(['1']);
  });

  it('matches title case-insensitive (uppercase query)', () => {
    const result = filterItems(samplePosts, {
      searchQuery: 'OWASP',
      searchFields: ['title', 'summary', 'body'],
    });
    expect(result.map((p) => p.id)).toContain('3');
  });

  it('matches summary substring', () => {
    const result = filterItems(samplePosts, {
      searchQuery: 'mcp',
      searchFields: ['title', 'summary', 'body'],
    });
    expect(result.map((p) => p.id)).toContain('2');
  });

  it('returns all items when searchQuery is empty string', () => {
    const result = filterItems(samplePosts, {
      searchQuery: '',
      searchFields: ['title', 'summary', 'body'],
    });
    expect(result.length).toBe(samplePosts.length);
  });
});

describe('blog getArchiveData search integration', () => {
  it('exposes filtered count via allFilteredItems', () => {
    const result = getArchiveData<MockPost>(
      {
        items: samplePosts,
        searchFields: ['title', 'summary', 'body'],
        tagField: 'tags',
        dateField: 'publishedAt',
        itemsPerPage: 12,
      },
      { search: 'portfolio', page: '' }
    );

    expect(result.totalItems).toBe(1);
    expect(result.allFilteredItems[0].id).toBe('1');
  });

  it('exposes filtered count for OWASP', () => {
    const result = getArchiveData<MockPost>(
      {
        items: samplePosts,
        searchFields: ['title', 'summary', 'body'],
        tagField: 'tags',
        dateField: 'publishedAt',
        itemsPerPage: 12,
      },
      { search: 'OWASP', page: '' }
    );

    expect(result.totalItems).toBe(1);
    expect(result.allFilteredItems[0].id).toBe('3');
  });

  it('reproduces the production "/blog?q=portfolio" URL flow', () => {
    // Mirror the exact searchParams shape that page.tsx passes
    const searchParams = { search: 'portfolio', page: '' };
    const result = getArchiveData<MockPost>(
      {
        items: samplePosts,
        searchFields: ['title', 'summary', 'body'],
        tagField: 'tags',
        dateField: 'publishedAt',
        itemsPerPage: 12,
      },
      searchParams
    );

    // Hero shows sortedArchiveData.totalItems — must reflect search filter
    expect(result.totalItems).toBe(1);
    expect(result.items.length).toBe(1);
  });
});

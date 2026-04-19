import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSearchIndex, searchItems } from '@/lib/search/search-engine';
import type { SearchConfig } from '@/lib/search/types';

interface TestItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
}

const testItems: TestItem[] = [
  {
    id: '1',
    title: 'Security Best Practices',
    description: 'A guide to web security',
    tags: ['security', 'web'],
    category: 'devops',
  },
  {
    id: '2',
    title: 'React Performance Tips',
    description: 'Optimize your React app',
    tags: ['react', 'performance'],
    category: 'web',
  },
  {
    id: '3',
    title: 'API Design Patterns',
    description: 'RESTful API best practices',
    tags: ['api', 'rest', 'security'],
    category: 'backend',
  },
  {
    id: '4',
    title: 'TypeScript Advanced Types',
    description: 'Deep dive into TypeScript generics',
    tags: ['typescript', 'types'],
    category: 'web',
  },
];

const config: SearchConfig<TestItem> = {
  fields: [
    { name: 'title', weight: 3 },
    { name: 'description', weight: 2 },
    { name: 'tags', weight: 1.5 },
  ],
  idField: 'id',
  fuzzyThreshold: 0.2,
};

describe('createSearchIndex', () => {
  it('creates a search index', () => {
    const index = createSearchIndex(testItems, config);
    expect(index).toBeDefined();
  });

  it('indexes all items', () => {
    const index = createSearchIndex(testItems, config);
    const results = index.search('security');
    expect(results.length).toBeGreaterThan(0);
  });
});

describe('searchItems', () => {
  let searchIndex: ReturnType<typeof createSearchIndex<TestItem>>;

  beforeEach(() => {
    searchIndex = createSearchIndex(testItems, config);
  });

  it('finds items by title', () => {
    const results = searchItems(testItems, searchIndex, 'React', config);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.title).toContain('React');
  });

  it('returns scored results', () => {
    const results = searchItems(testItems, searchIndex, 'security', config);
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.score).toBeGreaterThan(0);
    }
  });

  it('handles filter-only queries', () => {
    const results = searchItems(testItems, searchIndex, '', config);
    expect(results).toHaveLength(testItems.length);
    for (const r of results) {
      expect(r.score).toBe(1);
    }
  });

  it('applies field filters', () => {
    const results = searchItems(testItems, searchIndex, 'category:web', config);
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.item.category).toBe('web');
    }
  });

  it('applies exclusion filters', () => {
    const results = searchItems(testItems, searchIndex, 'security -API', config);
    for (const r of results) {
      expect(r.item.title.toLowerCase()).not.toContain('api');
    }
  });

  it('applies exact phrase filtering', () => {
    const results = searchItems(testItems, searchIndex, '"best practices"', config);
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      const text = `${r.item.title} ${r.item.description}`.toLowerCase();
      expect(text).toContain('best practices');
    }
  });

  it('returns matched terms for highlighting', () => {
    const results = searchItems(testItems, searchIndex, 'security', config);
    if (results.length > 0) {
      expect(results[0].matchedTerms).toContain('security');
    }
  });

  it('handles no-match queries', () => {
    const results = searchItems(testItems, searchIndex, 'xyznonexistent', config);
    expect(results).toHaveLength(0);
  });

  it('applies category filter', () => {
    const results = searchItems(testItems, searchIndex, 'category:web', config);
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.item.category).toBe('web');
    }
  });
});

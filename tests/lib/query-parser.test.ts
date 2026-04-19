import { describe, it, expect } from 'vitest';
import {
  parseSearchQuery,
  queryToString,
  getSearchTermsForHighlighting,
} from '@/lib/search/query-parser';

describe('parseSearchQuery', () => {
  it('parses simple terms', () => {
    const result = parseSearchQuery('security testing');
    expect(result.terms).toEqual(['security', 'testing']);
    expect(result.isFilterOnly).toBe(false);
  });

  it('parses exact phrases', () => {
    const result = parseSearchQuery('"exact match" other');
    expect(result.phrases).toEqual(['exact match']);
    expect(result.terms).toEqual(['other']);
  });

  it('parses multiple phrases', () => {
    const result = parseSearchQuery('"first phrase" "second phrase"');
    expect(result.phrases).toEqual(['first phrase', 'second phrase']);
  });

  it('parses exclusion terms', () => {
    const result = parseSearchQuery('security -test -draft');
    expect(result.terms).toEqual(['security']);
    expect(result.excludeTerms).toEqual(['test', 'draft']);
  });

  it('parses field filters', () => {
    const result = parseSearchQuery('tag:security category:code');
    expect(result.filters).toEqual({
      tag: ['security'],
      category: ['code'],
    });
  });

  it('handles multiple values for same filter', () => {
    const result = parseSearchQuery('tag:security tag:api');
    expect(result.filters.tag).toEqual(['security', 'api']);
  });

  it('lowercases terms and filters', () => {
    const result = parseSearchQuery('Security TAG:API');
    expect(result.terms).toEqual(['security']);
    expect(result.filters.tag).toEqual(['api']);
  });

  it('marks empty query as filter-only', () => {
    const result = parseSearchQuery('');
    expect(result.isFilterOnly).toBe(true);
    expect(result.terms).toEqual([]);
  });

  it('marks filter-only query correctly', () => {
    const result = parseSearchQuery('tag:security');
    expect(result.isFilterOnly).toBe(true);
    expect(result.terms).toEqual([]);
  });

  it('handles null/undefined input', () => {
    const result = parseSearchQuery(null as unknown as string);
    expect(result.isFilterOnly).toBe(true);
  });

  it('handles complex mixed query', () => {
    const result = parseSearchQuery('security -test tag:api "exact match"');
    expect(result.terms).toEqual(['security']);
    expect(result.phrases).toEqual(['exact match']);
    expect(result.excludeTerms).toEqual(['test']);
    expect(result.filters.tag).toEqual(['api']);
    expect(result.isFilterOnly).toBe(false);
  });

  it('handles filter with colon in value', () => {
    const result = parseSearchQuery('field:value:extra');
    expect(result.filters.field).toEqual(['value:extra']);
  });

  it('ignores empty filter field', () => {
    const result = parseSearchQuery(':value');
    expect(Object.keys(result.filters)).toHaveLength(0);
  });

  it('ignores lone hyphen', () => {
    const result = parseSearchQuery('-');
    expect(result.excludeTerms).toHaveLength(0);
  });

  it('handles whitespace-only input', () => {
    const result = parseSearchQuery('   ');
    expect(result.isFilterOnly).toBe(true);
  });
});

describe('queryToString', () => {
  it('converts query back to string', () => {
    const query = parseSearchQuery('security -test tag:api "exact match"');
    const str = queryToString(query);
    expect(str).toContain('"exact match"');
    expect(str).toContain('security');
    expect(str).toContain('-test');
    expect(str).toContain('tag:api');
  });

  it('handles empty query', () => {
    const query = parseSearchQuery('');
    expect(queryToString(query)).toBe('');
  });

  it('handles terms only', () => {
    const query = parseSearchQuery('hello world');
    expect(queryToString(query)).toBe('hello world');
  });
});

describe('getSearchTermsForHighlighting', () => {
  it('returns all terms and phrases', () => {
    const query = parseSearchQuery('security "best practices"');
    const terms = getSearchTermsForHighlighting(query);
    expect(terms).toContain('security');
    expect(terms).toContain('best practices');
    expect(terms).toContain('best');
    expect(terms).toContain('practices');
  });

  it('returns unique terms', () => {
    const query = parseSearchQuery('test "test phrase"');
    const terms = getSearchTermsForHighlighting(query);
    const testCount = terms.filter((t) => t === 'test').length;
    expect(testCount).toBe(1);
  });

  it('returns empty for empty query', () => {
    const query = parseSearchQuery('');
    expect(getSearchTermsForHighlighting(query)).toEqual([]);
  });
});

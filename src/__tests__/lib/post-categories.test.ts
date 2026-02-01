import { describe, it, expect } from 'vitest';
import { normalizeCategory, getCategoryLabel, isValidCategory } from '@/lib/post-categories';

describe('post category normalization', () => {
  it('normalizes ai variants to "AI"', () => {
    expect(normalizeCategory('ai')).toBe('AI');
    expect(normalizeCategory('Ai')).toBe('AI');
    expect(normalizeCategory('AI')).toBe('AI');
  });

  it('normalizes career variants to "Career"', () => {
    expect(normalizeCategory('career')).toBe('Career');
    expect(normalizeCategory('Career')).toBe('Career');
    expect(getCategoryLabel('career')).toBe('Career');
  });

  it('normalizes web lowercase to "Web"', () => {
    expect(normalizeCategory('web')).toBe('Web');
    expect(getCategoryLabel('web')).toBe('Web Development');
  });

  it('getCategoryLabel supports lowercase ai/career', () => {
    expect(getCategoryLabel('ai')).toBe('AI');
    expect(getCategoryLabel('career')).toBe('Career');
  });

  it('returns undefined for unknown categories', () => {
    expect(normalizeCategory('unknown-category')).toBeUndefined();
    expect(isValidCategory('unknown-category')).toBe(false);
  });

  it('isValidCategory is case-insensitive for known variants', () => {
    expect(isValidCategory('Ai')).toBe(true);
    expect(isValidCategory('career')).toBe(true);
    expect(isValidCategory('web')).toBe(true);
  });
});

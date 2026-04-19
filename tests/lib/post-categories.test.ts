import { describe, it, expect } from 'vitest';

import {
  POST_CATEGORY_LABEL,
  CATEGORIES,
  normalizeCategory,
  isValidCategory,
  getCategoryLabel,
  getValidCategories,
} from '@/lib/post-categories';

describe('post-categories', () => {
  describe('CATEGORIES', () => {
    it('contains expected categories', () => {
      const ids = CATEGORIES.map((c) => c.id);
      expect(ids).toContain('AI');
      expect(ids).toContain('Architecture');
      expect(ids).toContain('Career');
      expect(ids).toContain('Demo');
      expect(ids).toContain('Design');
      expect(ids).toContain('DevSecOps');
      expect(ids).toContain('Web');
    });

    it('includes legacy lowercase categories', () => {
      const ids = CATEGORIES.map((c) => c.id);
      expect(ids).toContain('development');
      expect(ids).toContain('security');
      expect(ids).toContain('career');
      expect(ids).toContain('ai');
      expect(ids).toContain('tutorial');
    });
  });

  describe('POST_CATEGORY_LABEL', () => {
    it('maps category IDs to labels', () => {
      expect(POST_CATEGORY_LABEL['AI']).toBe('AI');
      expect(POST_CATEGORY_LABEL['Web']).toBe('Web Development');
      expect(POST_CATEGORY_LABEL['development']).toBe('Development');
    });
  });

  describe('normalizeCategory', () => {
    it('normalizes case-insensitive match', () => {
      expect(normalizeCategory('ai')).toBe('AI');
      expect(normalizeCategory('AI')).toBe('AI');
    });

    it('normalizes exact match', () => {
      expect(normalizeCategory('Architecture')).toBe('Architecture');
    });

    it('returns undefined for unknown categories', () => {
      expect(normalizeCategory('unknown')).toBeUndefined();
    });

    it('returns undefined for empty/undefined input', () => {
      expect(normalizeCategory()).toBeUndefined();
      expect(normalizeCategory('')).toBeUndefined();
    });

    it('trims whitespace', () => {
      expect(normalizeCategory('  AI  ')).toBe('AI');
    });

    it('prefers uppercase variant for duplicates', () => {
      // Both 'AI' and 'ai' exist; 'AI' should be canonical
      expect(normalizeCategory('ai')).toBe('AI');
    });

    it('normalizes career case-insensitively', () => {
      expect(normalizeCategory('Career')).toBe('Career');
      expect(normalizeCategory('career')).toBe('Career');
    });
  });

  describe('isValidCategory', () => {
    it('returns true for valid categories', () => {
      expect(isValidCategory('AI')).toBe(true);
      expect(isValidCategory('Web')).toBe(true);
      expect(isValidCategory('development')).toBe(true);
    });

    it('returns true for case-insensitive valid categories', () => {
      expect(isValidCategory('ai')).toBe(true);
    });

    it('returns false for invalid categories', () => {
      expect(isValidCategory('nonexistent')).toBe(false);
    });
  });

  describe('getCategoryLabel', () => {
    it('returns label for valid category', () => {
      expect(getCategoryLabel('AI')).toBe('AI');
      expect(getCategoryLabel('Web')).toBe('Web Development');
    });

    it('returns fallback for undefined', () => {
      expect(getCategoryLabel(undefined)).toBe('Uncategorized');
    });

    it('returns custom fallback', () => {
      expect(getCategoryLabel(undefined, 'Other')).toBe('Other');
    });

    it('returns fallback for unknown category', () => {
      expect(getCategoryLabel('nonexistent')).toBe('Uncategorized');
    });

    it('handles case-insensitive lookup', () => {
      expect(getCategoryLabel('ai')).toBe('AI');
    });
  });

  describe('getValidCategories', () => {
    it('returns all category IDs', () => {
      const cats = getValidCategories();
      expect(cats.length).toBe(CATEGORIES.length);
      expect(cats).toContain('AI');
      expect(cats).toContain('Web');
      expect(cats).toContain('tutorial');
    });
  });
});

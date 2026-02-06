import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cn, sanitizeUrl } from '@/lib/utils';

describe('utils', () => {
  describe('cn()', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      expect(cn('base', isActive && 'active')).toBe('base active');

      const isInactive = false;
      expect(cn('base', isInactive && 'inactive')).toBe('base');
    });

    it('should merge Tailwind classes correctly', () => {
      // TailwindMerge should handle conflicting classes
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
    });

    it('should handle arrays of class names', () => {
      expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
    });

    it('should handle objects with boolean values', () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
    });

    it('should handle undefined and null values', () => {
      expect(cn('foo', undefined, 'bar', null)).toBe('foo bar');
    });

    it('should return empty string for no arguments', () => {
      expect(cn()).toBe('');
    });
  });

  describe('sanitizeUrl()', () => {
    // Suppress console.warn for these tests
    beforeEach(() => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should allow valid http URLs', () => {
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('should allow valid https URLs', () => {
      expect(sanitizeUrl('https://github.com/user/repo')).toBe('https://github.com/user/repo');
    });

    it('should allow valid mailto URLs', () => {
      expect(sanitizeUrl('mailto:user@example.com')).toBe('mailto:user@example.com');
    });

    it('should block javascript: protocol', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('#');
    });

    it('should block data: protocol', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
    });

    it('should block vbscript: protocol', () => {
      expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('#');
    });

    it('should block file: protocol', () => {
      expect(sanitizeUrl('file:///etc/passwd')).toBe('#');
    });

    it('should handle null/undefined input', () => {
      expect(sanitizeUrl(null as any)).toBe('#');
      expect(sanitizeUrl(undefined as any)).toBe('#');
    });

    it('should handle non-string input', () => {
      expect(sanitizeUrl(123 as any)).toBe('#');
      expect(sanitizeUrl({} as any)).toBe('#');
    });

    it('should handle invalid URL format', () => {
      expect(sanitizeUrl('not a url')).toBe('#');
      expect(sanitizeUrl('//example.com')).toBe('#');
    });

    it('should handle empty string', () => {
      expect(sanitizeUrl('')).toBe('#');
    });

    it('should preserve query parameters in valid URLs', () => {
      const url = 'https://example.com/path?param=value&other=123';
      expect(sanitizeUrl(url)).toBe(url);
    });

    it('should preserve URL fragments in valid URLs', () => {
      const url = 'https://example.com/page#section';
      expect(sanitizeUrl(url)).toBe(url);
    });
  });
});

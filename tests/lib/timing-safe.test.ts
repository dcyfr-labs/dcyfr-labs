import { describe, it, expect } from 'vitest';
import { timingSafeEqual } from '@/lib/security/timing-safe';

describe('timingSafeEqual', () => {
  it('returns true for equal strings', () => {
    expect(timingSafeEqual('secret-token', 'secret-token')).toBe(true);
  });

  it('returns false for different strings', () => {
    expect(timingSafeEqual('secret-token', 'wrong-token')).toBe(false);
  });

  it('returns false for different lengths', () => {
    expect(timingSafeEqual('short', 'much-longer-string')).toBe(false);
  });

  it('returns true for empty strings', () => {
    expect(timingSafeEqual('', '')).toBe(true);
  });

  it('handles unicode strings', () => {
    expect(timingSafeEqual('héllo wörld', 'héllo wörld')).toBe(true);
    expect(timingSafeEqual('héllo wörld', 'hello world')).toBe(false);
  });

  it('returns false when only one char differs', () => {
    expect(timingSafeEqual('abcdef', 'abcdeg')).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import { escapeRegExp, createSafeRegex, matchesPattern } from '@/lib/security/regex-utils';

describe('escapeRegExp', () => {
  it('escapes regex special characters', () => {
    expect(escapeRegExp('test.key')).toBe('test\\.key');
    expect(escapeRegExp('user+admin')).toBe('user\\+admin');
    expect(escapeRegExp('test[abc]')).toBe('test\\[abc\\]');
    expect(escapeRegExp('a(b)c')).toBe('a\\(b\\)c');
    expect(escapeRegExp('x^y$z')).toBe('x\\^y\\$z');
    expect(escapeRegExp('a{1,3}')).toBe('a\\{1,3\\}');
    expect(escapeRegExp('a|b')).toBe('a\\|b');
    expect(escapeRegExp('a?b')).toBe('a\\?b');
  });

  it('converts * wildcard to .*', () => {
    expect(escapeRegExp('pageviews:*')).toBe('pageviews:.*');
    expect(escapeRegExp('*')).toBe('.*');
    expect(escapeRegExp('a*b*c')).toBe('a.*b.*c');
  });

  it('handles strings with no special chars', () => {
    expect(escapeRegExp('plaintext')).toBe('plaintext');
  });

  it('handles empty string', () => {
    expect(escapeRegExp('')).toBe('');
  });

  it('escapes backslashes', () => {
    expect(escapeRegExp('path\\to\\file')).toBe('path\\\\to\\\\file');
  });
});

describe('createSafeRegex', () => {
  it('creates anchored regex from wildcard pattern', () => {
    const regex = createSafeRegex('pageviews:*');
    expect(regex.test('pageviews:123')).toBe(true);
    expect(regex.test('pageviews:')).toBe(true);
    expect(regex.test('other:123')).toBe(false);
  });

  it('supports case-insensitive flag', () => {
    const regex = createSafeRegex('user:*', 'i');
    expect(regex.test('USER:admin')).toBe(true);
    expect(regex.test('user:admin')).toBe(true);
  });

  it('creates exact match regex without wildcards', () => {
    const regex = createSafeRegex('exact');
    expect(regex.test('exact')).toBe(true);
    expect(regex.test('not-exact')).toBe(false);
    expect(regex.test('exacttoo')).toBe(false);
  });
});

describe('matchesPattern', () => {
  it('matches wildcard patterns', () => {
    expect(matchesPattern('pageviews:123', 'pageviews:*')).toBe(true);
    expect(matchesPattern('engagement:45', 'pageviews:*')).toBe(false);
  });

  it('supports case-insensitive matching', () => {
    expect(matchesPattern('User:Admin', 'user:*', true)).toBe(true);
    expect(matchesPattern('User:Admin', 'user:*', false)).toBe(false);
  });

  it('matches exact strings without wildcards', () => {
    expect(matchesPattern('hello', 'hello')).toBe(true);
    expect(matchesPattern('hello', 'world')).toBe(false);
  });

  it('prevents regex injection', () => {
    // Even though the pattern contains regex chars, they should be escaped
    expect(matchesPattern('.+secret', '.+secret')).toBe(true);
    expect(matchesPattern('anything', '.+secret')).toBe(false);
  });
});

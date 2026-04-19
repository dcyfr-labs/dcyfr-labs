import { describe, it, expect } from 'vitest';
import { maskIp, extractOriginLikeValue } from '@/lib/security/ip-masking';

describe('maskIp', () => {
  it('masks IPv4 last octet', () => {
    expect(maskIp('192.168.1.100')).toBe('192.168.1.xxx');
  });

  it('masks IPv6 with ellipsis', () => {
    expect(maskIp('2001:db8:85a3:0000:0000:8a2e:0370:7334')).toBe('2001:db8:...:7334');
  });

  it('returns [redacted] for undefined', () => {
    expect(maskIp()).toBe('[redacted]');
    expect(maskIp(undefined)).toBe('[redacted]');
  });

  it('returns [redacted] for empty string', () => {
    expect(maskIp('')).toBe('[redacted]');
  });

  it('returns [redacted] for short IPv6 (2 or fewer parts)', () => {
    expect(maskIp('::1')).toBe('[redacted]');
  });

  it('returns [redacted] for invalid IPv4', () => {
    expect(maskIp('123')).toBe('[redacted]');
    expect(maskIp('1.2.3')).toBe('[redacted]');
  });

  it('handles short IPv6 with 3 parts', () => {
    expect(maskIp('2001:db8:1')).toBe('2001:db8:...:1');
  });
});

describe('extractOriginLikeValue', () => {
  // origin and referer are forbidden request headers in Fetch API,
  // so we create a mock request with a custom headers.get
  function createMockRequest(headers: Record<string, string>): Request {
    return {
      headers: {
        get: (name: string) => headers[name.toLowerCase()] ?? null,
      },
    } as unknown as Request;
  }

  it('returns origin header when present', () => {
    const req = createMockRequest({ origin: 'https://example.com' });
    expect(extractOriginLikeValue(req)).toBe('https://example.com');
  });

  it('falls back to referer when origin is absent', () => {
    const req = createMockRequest({ referer: 'https://ref.com/page' });
    expect(extractOriginLikeValue(req)).toBe('https://ref.com/page');
  });

  it('prefers origin over referer', () => {
    const req = createMockRequest({ origin: 'https://origin.com', referer: 'https://ref.com' });
    expect(extractOriginLikeValue(req)).toBe('https://origin.com');
  });

  it('returns null when neither header is present', () => {
    const req = createMockRequest({});
    expect(extractOriginLikeValue(req)).toBeNull();
  });
});

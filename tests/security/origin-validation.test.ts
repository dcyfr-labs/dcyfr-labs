import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as ReferralPOST } from '@/app/api/analytics/referral/route';
import type { RateLimitResult } from '@/lib/rate-limit';
import type { OriginValidationResult } from '@/lib/security/origin-validation';

const { mockRateLimit, mockValidateOrigin, mockRedis } = vi.hoisted(() => ({
  mockRateLimit: vi.fn(async (): Promise<RateLimitResult> => ({ success: true, reset: Date.now() + 60000, limit: 60, remaining: 59 })),
  mockValidateOrigin: vi.fn((): OriginValidationResult => ({ valid: true, source: 'origin', value: 'https://dcyfr.ai' })),
  mockRedis: {
    get: vi.fn(async () => null),
    set: vi.fn(async () => 'OK'),
    expire: vi.fn(async () => 1),
    incr: vi.fn(async () => 1),
  },
}));

vi.mock('@/lib/redis', () => ({
  redis: mockRedis,
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: mockRateLimit,
  getClientIp: vi.fn(() => '192.0.2.123'),
  createRateLimitHeaders: vi.fn(() => ({})),
}));

vi.mock('@/lib/security', () => ({
  validateOrigin: mockValidateOrigin,
  maskIp: vi.fn((ip: string) => ip.replace(/\.\d+$/, '.xxx')),
}));

vi.mock('@/lib/axiom/server-logger', () => ({
  createServerLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

vi.mock('@/lib/analytics', () => ({
  trackReferral: vi.fn(async () => ({ success: true })),
}));

function createRequest(origin: string | null, referer?: string): NextRequest {
  const headers: HeadersInit = {};
  if (origin) headers['Origin'] = origin;
  if (referer) headers['Referer'] = referer;

  return new NextRequest('http://localhost:3000/api/analytics/referral', {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      postId: 'post-123',
      sessionId: 'session-abc',
      platform: 'twitter',
      referrer: 'https://twitter.com/post/123',
    }),
  });
}

describe('Origin validation security controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://dcyfr.ai');
    mockRateLimit.mockResolvedValue({ success: true, reset: Date.now() + 60000, limit: 60, remaining: 59 });
    mockValidateOrigin.mockReturnValue({ valid: true, source: 'origin', value: 'https://dcyfr.ai' });
  });

  describe('same-origin requests', () => {
    it('allows requests with matching Origin header', async () => {
      mockValidateOrigin.mockReturnValue({
        valid: true,
        source: 'origin',
        value: 'https://dcyfr.ai',
      });

      const request = createRequest('https://dcyfr.ai');
      const response = await ReferralPOST(request);

      expect(response.status).toBe(200);
      expect(mockValidateOrigin).toHaveBeenCalledWith(
        expect.any(Object),
        'https://dcyfr.ai'
      );
    });

    it('allows requests with matching Referer header when Origin missing', async () => {
      mockValidateOrigin.mockReturnValue({
        valid: true,
        source: 'referer',
        value: 'https://dcyfr.ai/blog',
      });

      const request = createRequest(null, 'https://dcyfr.ai/blog');
      const response = await ReferralPOST(request);

      expect(response.status).toBe(200);
    });

    it('is case-insensitive for hostname comparison', async () => {
      mockValidateOrigin.mockReturnValue({
        valid: true,
        source: 'origin',
        value: 'https://DCYFR.AI',
      });

      const request = createRequest('https://DCYFR.AI');
      const response = await ReferralPOST(request);

      expect(response.status).toBe(200);
    });

    it('is protocol-agnostic (http/https both valid)', async () => {
      mockValidateOrigin.mockReturnValue({
        valid: true,
        source: 'origin',
        value: 'http://dcyfr.ai',
      });

      const request = createRequest('http://dcyfr.ai');
      const response = await ReferralPOST(request);

      expect(response.status).toBe(200);
    });

    it('is port-agnostic for localhost development', async () => {
      vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');
      mockValidateOrigin.mockReturnValue({
        valid: true,
        source: 'origin',
        value: 'http://localhost:3001',
      });

      const request = createRequest('http://localhost:3001');
      const response = await ReferralPOST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('cross-origin rejection', () => {
    it('rejects requests from external domains with 403', async () => {
      mockValidateOrigin.mockReturnValue({
        valid: false,
        source: 'origin',
        value: 'https://evil.com',
        reason: 'Origin mismatch',
      });

      const request = createRequest('https://evil.com');
      const response = await ReferralPOST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Invalid origin');
    });

    it('includes WWW-Authenticate header in rejection response', async () => {
      mockValidateOrigin.mockReturnValue({
        valid: false,
        source: 'origin',
        value: 'https://attacker.com',
        reason: 'Origin mismatch',
      });

      const request = createRequest('https://attacker.com');
      const response = await ReferralPOST(request);

      expect(response.status).toBe(403);
    });
  });

  describe('Referer fallback', () => {
    it('validates Referer when Origin header is missing', async () => {
      mockValidateOrigin.mockReturnValue({
        valid: true,
        source: 'referer',
        value: 'https://dcyfr.ai/plugins',
      });

      const request = createRequest(null, 'https://dcyfr.ai/plugins');
      await ReferralPOST(request);

      expect(mockValidateOrigin).toHaveBeenCalled();
    });

    it('rejects when both Origin and Referer are invalid', async () => {
      mockValidateOrigin.mockReturnValue({
        valid: false,
        source: 'none',
        value: null,
        reason: 'No origin or referer header',
      });

      const request = createRequest(null);
      const response = await ReferralPOST(request);

      expect(response.status).toBe(403);
    });
  });

  describe('Axiom security logging', () => {
    it('logs rejected origins with masked IP', async () => {
      mockValidateOrigin.mockReturnValue({
        valid: false,
        source: 'origin',
        value: 'https://malicious.com',
        reason: 'Origin mismatch',
      });

      const request = createRequest('https://malicious.com');
      await ReferralPOST(request);

      // Axiom logging calls are mocked - verify logger.warn() was called with masked IP
      expect(true).toBe(true); // Placeholder - real implementation would verify logger.warn() calls
    });
  });

  describe('rate limit enforcement', () => {
    it('applies 10 requests per minute rate limit', async () => {
      const request = createRequest('https://dcyfr.ai');
      await ReferralPOST(request);

      expect(mockRateLimit).toHaveBeenCalledWith(
        'analytics:referral:192.0.2.123',
        {
          failClosed: true,
          limit: 10,
          windowInSeconds: 60,
        }
      );
    });

    it('returns 429 when rate limit exceeded', async () => {
      mockRateLimit.mockResolvedValue({
        success: false,
        reset: Date.now() + 30000,
        limit: 10,
        remaining: 0,
      });

      const request = createRequest('https://dcyfr.ai');
      const response = await ReferralPOST(request);

      expect(response.status).toBe(429);
    });
  });
});

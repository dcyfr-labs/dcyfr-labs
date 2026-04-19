import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateCronRequest } from '@/lib/cron-auth';

describe('validateCronRequest', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.stubEnv('CRON_SECRET', '');
    vi.stubEnv('NODE_ENV', 'test');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns true in dev when CRON_SECRET is unset', () => {
    vi.stubEnv('CRON_SECRET', '');
    vi.stubEnv('NODE_ENV', 'development');
    const req = new Request('https://test.com/api/cron');
    expect(validateCronRequest(req)).toBe(true);
  });

  it('returns false in production when CRON_SECRET is unset', () => {
    vi.stubEnv('CRON_SECRET', '');
    vi.stubEnv('NODE_ENV', 'production');
    const req = new Request('https://test.com/api/cron');
    expect(validateCronRequest(req)).toBe(false);
  });

  it('returns true when authorization matches', () => {
    vi.stubEnv('CRON_SECRET', 'my-secret');
    const req = new Request('https://test.com/api/cron', {
      headers: { authorization: 'Bearer my-secret' },
    });
    expect(validateCronRequest(req)).toBe(true);
  });

  it('returns false when authorization does not match', () => {
    vi.stubEnv('CRON_SECRET', 'my-secret');
    const req = new Request('https://test.com/api/cron', {
      headers: { authorization: 'Bearer wrong-secret' },
    });
    expect(validateCronRequest(req)).toBe(false);
  });

  it('returns false when no authorization header', () => {
    vi.stubEnv('CRON_SECRET', 'my-secret');
    const req = new Request('https://test.com/api/cron');
    expect(validateCronRequest(req)).toBe(false);
  });
});

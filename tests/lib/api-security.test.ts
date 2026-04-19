import { describe, it, expect, vi, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import {
  blockExternalAccessExceptInngest,
  blockExternalAccessExceptInngestAndSameOrigin,
  blockExternalAccess,
  withCronAuth,
  validateExternalUrl,
  safeFetch,
  whitelistExternalDomain,
} from '@/lib/api/api-security';

function createNextRequest(url: string, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(url, { headers });
}

describe('blockExternalAccessExceptInngest', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('allows any request in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const req = createNextRequest('https://test.com/api');
    expect(blockExternalAccessExceptInngest(req)).toBeNull();
  });

  it('blocks external request in production without inngest headers', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const req = createNextRequest('https://test.com/api', {
      'user-agent': 'Mozilla/5.0',
    });
    const res = blockExternalAccessExceptInngest(req);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(404);
  });

  it('allows inngest request in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const req = createNextRequest('https://test.com/api', {
      'user-agent': 'inngest/1.0',
      'x-inngest-signature': 'sig123',
      'x-inngest-timestamp': '12345',
    });
    expect(blockExternalAccessExceptInngest(req)).toBeNull();
  });
});

describe('blockExternalAccessExceptInngestAndSameOrigin', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('allows requests in test env', () => {
    vi.stubEnv('NODE_ENV', 'test');
    const req = createNextRequest('https://test.com/api');
    expect(blockExternalAccessExceptInngestAndSameOrigin(req)).toBeNull();
  });
});

describe('blockExternalAccess', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('blocks all access in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const req = createNextRequest('https://test.com/api');
    const res = blockExternalAccess(req);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(404);
  });

  it('allows internal requests in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const req = createNextRequest('https://test.com/api', {
      'user-agent': 'inngest/1.0',
    });
    expect(blockExternalAccess(req)).toBeNull();
  });

  it('blocks non-internal requests in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const req = createNextRequest('https://test.com/api', {
      'user-agent': 'Mozilla/5.0',
    });
    const res = blockExternalAccess(req);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(404);
  });
});

describe('withCronAuth', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('allows request when secret matches', () => {
    vi.stubEnv('CRON_SECRET', 'my-secret');
    const req = createNextRequest('https://test.com/api', {
      'x-cron-secret': 'my-secret',
    });
    expect(withCronAuth(req)).toBeNull();
  });

  it('rejects request when secret is wrong', () => {
    vi.stubEnv('CRON_SECRET', 'my-secret');
    const req = createNextRequest('https://test.com/api', {
      'x-cron-secret': 'wrong',
    });
    const res = withCronAuth(req);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });

  it('rejects request when no secret header provided', () => {
    vi.stubEnv('CRON_SECRET', 'my-secret');
    const req = createNextRequest('https://test.com/api');
    const res = withCronAuth(req);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });

  it('allows request in dev when CRON_SECRET is not configured', () => {
    vi.stubEnv('CRON_SECRET', '');
    vi.stubEnv('NODE_ENV', 'development');
    const req = createNextRequest('https://test.com/api');
    expect(withCronAuth(req)).toBeNull();
  });

  it('rejects request in production when CRON_SECRET is not configured', () => {
    vi.stubEnv('CRON_SECRET', '');
    vi.stubEnv('NODE_ENV', 'production');
    const req = createNextRequest('https://test.com/api');
    const res = withCronAuth(req);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(401);
  });
});

describe('validateExternalUrl', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('accepts whitelisted HTTPS URLs', () => {
    expect(validateExternalUrl('https://api.github.com/repos')).toEqual({ valid: true });
    expect(validateExternalUrl('https://api.perplexity.ai/chat')).toEqual({ valid: true });
  });

  it('rejects non-whitelisted domains', () => {
    const result = validateExternalUrl('https://evil.com/exploit');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('not whitelisted');
  });

  it('rejects internal IP ranges (SSRF prevention)', () => {
    const ips = ['http://127.0.0.1', 'http://10.0.0.1', 'http://192.168.1.1', 'http://172.16.0.1'];
    for (const ip of ips) {
      const result = validateExternalUrl(ip);
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Internal IP range blocked');
    }
  });

  it('rejects invalid URLs', () => {
    expect(validateExternalUrl('not a url')).toEqual({
      valid: false,
      reason: 'Invalid URL format',
    });
  });

  it('rejects non-HTTPS in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const result = validateExternalUrl('http://api.github.com/repos');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('HTTPS');
  });
});

describe('safeFetch', () => {
  it('throws on invalid URL', async () => {
    await expect(safeFetch('http://127.0.0.1/evil')).rejects.toThrow('SSRF protection');
  });
});

describe('whitelistExternalDomain', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('does not add domain in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    whitelistExternalDomain('evil.com');
    expect(validateExternalUrl('https://evil.com')).toHaveProperty('valid', false);
  });

  it('adds domain in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    whitelistExternalDomain('custom-api.example.com');
    expect(validateExternalUrl('https://custom-api.example.com/data')).toEqual({ valid: true });
  });
});

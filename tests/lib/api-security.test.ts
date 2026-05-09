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
    expect(validateExternalUrl('https://www.googleapis.com/v1/search')).toEqual({ valid: true });
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

/** Create a NextRequest with headers that would normally be forbidden (origin, referer) */
function createNextRequestWithForbiddenHeaders(
  url: string,
  headers: Record<string, string>
): NextRequest {
  const req = new NextRequest(url);
  const headerMap = new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  const origGet = req.headers.get.bind(req.headers);
  vi.spyOn(req.headers, 'get').mockImplementation((name: string) => {
    return headerMap.get(name.toLowerCase()) ?? origGet(name);
  });
  const origForEach = req.headers.forEach.bind(req.headers);
  vi.spyOn(req.headers, 'forEach').mockImplementation(
    (cb: (value: string, key: string, parent: Headers) => void) => {
      origForEach(cb);
      for (const [k, v] of headerMap) {
        if (!req.headers.has(k)) cb(v, k, req.headers);
      }
    }
  );
  return req;
}

describe('blockExternalAccessExceptInngestAndSameOrigin (branch coverage)', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('allows same-origin request in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://www.dcyfr.ai');
    const req = createNextRequestWithForbiddenHeaders('https://test.com/api', {
      origin: 'https://www.dcyfr.ai',
    });
    expect(blockExternalAccessExceptInngestAndSameOrigin(req)).toBeNull();
  });

  it('allows localhost origin in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const req = createNextRequestWithForbiddenHeaders('https://test.com/api', {
      origin: 'http://localhost:3000',
    });
    expect(blockExternalAccessExceptInngestAndSameOrigin(req)).toBeNull();
  });

  it('blocks non-matching origin in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://www.dcyfr.ai');
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const req = createNextRequest('https://test.com/api', {
      origin: 'https://evil.com',
      'user-agent': 'Mozilla/5.0',
    });
    const res = blockExternalAccessExceptInngestAndSameOrigin(req);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
    spy.mockRestore();
  });

  it('blocks request with no origin and no inngest headers', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const req = createNextRequest('https://test.com/api', {
      'user-agent': 'Mozilla/5.0',
    });
    const res = blockExternalAccessExceptInngestAndSameOrigin(req);
    expect(res).not.toBeNull();
    expect(res!.status).toBe(403);
    spy.mockRestore();
  });

  it('allows inngest request in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const req = createNextRequest('https://test.com/api', {
      'user-agent': 'inngest/1.0',
      'x-inngest-signature': 'sig',
      'x-inngest-timestamp': '12345',
    });
    expect(blockExternalAccessExceptInngestAndSameOrigin(req)).toBeNull();
  });
});

describe('blockExternalAccess (branch coverage)', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('allows request with referer containing localhost in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const req = createNextRequestWithForbiddenHeaders('https://test.com/api', {
      referer: 'http://localhost:3000/dashboard',
    });
    expect(blockExternalAccess(req)).toBeNull();
  });

  it('allows request with x-vercel-deployment-url header in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const req = createNextRequest('https://test.com/api', {
      'x-vercel-deployment-url': 'test.vercel.app',
    });
    expect(blockExternalAccess(req)).toBeNull();
  });

  it('allows request with x-internal-request header in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const req = createNextRequest('https://test.com/api', {
      'x-internal-request': 'true',
    });
    expect(blockExternalAccess(req)).toBeNull();
  });

  it('allows request with vercel-cron user agent in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const req = createNextRequest('https://test.com/api', {
      'user-agent': 'vercel-cron/1.0',
    });
    expect(blockExternalAccess(req)).toBeNull();
  });
});

describe('validateExternalUrl (branch coverage)', () => {
  it('allows subdomain of whitelisted domain', () => {
    const result = validateExternalUrl('https://v1.api.github.com/repos');
    expect(result.valid).toBe(true);
  });

  it('blocks IPv6 loopback', () => {
    expect(validateExternalUrl('http://[::1]/test')).toHaveProperty('valid', false);
  });

  it('allows HTTP in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(validateExternalUrl('http://api.github.com/repos')).toEqual({ valid: true });
    vi.unstubAllEnvs();
  });
});

describe('safeFetch (branch coverage)', () => {
  it('calls fetch for valid URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue(new Response('ok'));
    vi.stubGlobal('fetch', mockFetch);
    const resp = await safeFetch('https://api.github.com/repos');
    expect(resp).toBeDefined();
    expect(mockFetch).toHaveBeenCalledWith('https://api.github.com/repos', undefined);
    vi.unstubAllGlobals();
  });
});

describe('whitelistExternalDomain', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('does not add domain in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    whitelistExternalDomain('evil.com');
    expect(validateExternalUrl('https://evil.com')).toHaveProperty('valid', false);
    spy.mockRestore();
  });

  it('adds domain in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    whitelistExternalDomain('custom-api.example.com');
    expect(validateExternalUrl('https://custom-api.example.com/data')).toEqual({ valid: true });
  });

  it('does not duplicate already-whitelisted domain', () => {
    vi.stubEnv('NODE_ENV', 'development');
    whitelistExternalDomain('api.github.com');
    // Should not throw or add duplicate
    expect(validateExternalUrl('https://api.github.com/repos')).toEqual({ valid: true });
  });
});

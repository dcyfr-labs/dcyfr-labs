import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/indexnow/submit/route';

const { mockSend } = vi.hoisted(() => ({
  mockSend: vi.fn(),
}));

vi.mock('@/inngest/client', () => ({
  inngest: {
    send: mockSend,
  },
}));

vi.mock('@/lib/api/api-security', () => ({
  blockExternalAccessExceptInngestAndSameOrigin: vi.fn(() => null),
}));

describe('POST /api/indexnow/submit', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      INDEXNOW_API_KEY: '00000000-0000-4000-8000-000000000000',
      NEXT_PUBLIC_SITE_URL: 'https://www.dcyfr.ai',
    };

    mockSend.mockResolvedValue({ ids: ['evt-1'] });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  function createRequest(body: unknown, forwardedFor = '203.0.113.10') {
    return new NextRequest('http://localhost:3000/api/indexnow/submit', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': forwardedFor,
      },
    });
  }

  it('returns 200 and queues a valid submission', async () => {
    const response = await POST(
      createRequest({ urls: ['https://www.dcyfr.ai/blog/indexnow-test'] })
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.queueStatus).toBe('queued');
    expect(data.queued.urls).toBe(1);
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(response.headers.get('X-RateLimit-Limit')).toBe('30');
  });

  it('returns 400 for invalid body payload', async () => {
    const response = await POST(createRequest({ urls: ['not-a-url'] }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request body');
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('returns 400 when urls do not match application domain', async () => {
    const response = await POST(createRequest({ urls: ['https://evil.example.com/phish'] }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('same domain');
    expect(data.allowedDomain).toBe('www.dcyfr.ai');
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('returns 503 when INDEXNOW_API_KEY is missing', async () => {
    delete process.env.INDEXNOW_API_KEY;

    const response = await POST(createRequest({ urls: ['https://www.dcyfr.ai/blog/no-key'] }));
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe('IndexNow API key not configured');
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('returns 429 when limit is exceeded for same client', async () => {
    const forwardedFor = '198.51.100.20';
    let lastResponse: Response | null = null;

    for (let i = 0; i < 31; i += 1) {
      lastResponse = await POST(
        createRequest({ urls: ['https://www.dcyfr.ai/blog/rate-limit'] }, forwardedFor)
      );
    }

    const data = await lastResponse?.json();

    expect(lastResponse?.status).toBe(429);
    expect(data.error).toBe('Rate limit exceeded');
    expect(lastResponse?.headers.get('Retry-After')).toBeTruthy();
    expect(lastResponse?.headers.get('X-RateLimit-Remaining')).toBe('0');
  });
});

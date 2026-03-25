import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/newsletter/route';
import { rateLimit } from '@/lib/rate-limit';
import { inngest } from '@/inngest/client';

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(),
  getClientIp: vi.fn(() => '203.0.113.10'),
  createRateLimitHeaders: vi.fn(() => ({
    'X-RateLimit-Limit': '5',
    'X-RateLimit-Remaining': '4',
    'X-RateLimit-Reset': '123456789',
  })),
}));

vi.mock('@/inngest/client', () => ({
  inngest: {
    send: vi.fn().mockResolvedValue({ ids: ['evt-1'] }),
  },
}));

describe('Newsletter API Integration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.RESEND_API_KEY = 're_test_123';
    delete process.env.RESEND_SEGMENT_ID;

    vi.mocked(rateLimit).mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 60_000,
    });

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => '',
    } as Response) as typeof fetch;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns 429 when rate limit is exceeded', async () => {
    vi.mocked(rateLimit).mockResolvedValue({
      success: false,
      limit: 5,
      remaining: 0,
      reset: Date.now() + 30_000,
    });

    const request = new NextRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toContain('Too many requests');
    expect(inngest.send).not.toHaveBeenCalled();
  });

  it('returns 503 when RESEND_API_KEY is missing', async () => {
    delete process.env.RESEND_API_KEY;

    const request = new NextRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toContain('not configured');
    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(inngest.send).not.toHaveBeenCalled();
  });

  it('creates contact via /contacts when segment ID is not set', async () => {
    const request = new NextRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: 'User@Example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);

    expect(globalThis.fetch).toHaveBeenCalledWith('https://api.resend.com/contacts', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer re_test_123',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@example.com',
        unsubscribed: false,
      }),
    });

    expect(inngest.send).toHaveBeenCalledWith({
      name: 'newsletter/subscribe.submitted',
      data: {
        email: 'user@example.com',
        subscribedAt: expect.any(String),
        ip: '203.0.113.10',
      },
    });
  });

  it('creates contact via /contacts with segments payload when segment ID is set', async () => {
    process.env.RESEND_SEGMENT_ID = '8b10d4b1-4cec-41fa-b087-4029c17bf61a';

    const request = new NextRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(globalThis.fetch).toHaveBeenCalledWith('https://api.resend.com/contacts', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer re_test_123',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@example.com',
        unsubscribed: false,
        segments: [{ id: '8b10d4b1-4cec-41fa-b087-4029c17bf61a' }],
      }),
    });
    expect(inngest.send).toHaveBeenCalled();
  });

  it('ignores legacy audience ID and remains segment-based', async () => {
    process.env.RESEND_SEGMENT_ID = '8b10d4b1-4cec-41fa-b087-4029c17bf61a';
    process.env.RESEND_AUDIENCE_ID = 'aud_123';

    const request = new NextRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(globalThis.fetch).toHaveBeenCalledWith('https://api.resend.com/contacts', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer re_test_123',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'user@example.com',
        unsubscribed: false,
        segments: [{ id: '8b10d4b1-4cec-41fa-b087-4029c17bf61a' }],
      }),
    });
    expect(inngest.send).toHaveBeenCalled();
  });

  it('treats 409 contact conflict as success and continues', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      text: async () => 'Contact already exists',
    } as Response) as typeof fetch;

    const request = new NextRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(inngest.send).toHaveBeenCalled();
  });

  it('returns 502 and does not queue Inngest when contacts API fails', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Resend internal error',
    } as Response) as typeof fetch;

    const request = new NextRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toContain('Failed to register');
    expect(inngest.send).not.toHaveBeenCalled();
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as LikeGET, POST as LikePOST } from '@/app/api/engagement/like/route';
import { GET as BookmarkGET, POST as BookmarkPOST } from '@/app/api/engagement/bookmark/route';

const { mockRateLimit } = vi.hoisted(() => ({
  mockRateLimit: vi.fn(async () => ({ success: true, reset: Date.now() + 60000 })),
}));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: mockRateLimit,
  getClientIp: vi.fn(() => '127.0.0.1'),
  createRateLimitHeaders: vi.fn(() => ({})),
}));

vi.mock('@/lib/engagement-analytics', () => ({
  incrementLikes: vi.fn(async () => 1),
  decrementLikes: vi.fn(async () => 0),
  getLikes: vi.fn(async () => 1),
  incrementBookmarks: vi.fn(async () => 1),
  decrementBookmarks: vi.fn(async () => 0),
  getBookmarks: vi.fn(async () => 1),
}));

describe('API hardening regressions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();

    mockRateLimit.mockResolvedValue({ success: true, reset: Date.now() + 60000 });
  });

  it('rejects invalid slugs for like endpoints (POST + GET)', async () => {
    const postRequest = new NextRequest('http://localhost:3000/api/engagement/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: '../bad',
        contentType: 'post',
        action: 'like',
      }),
    });

    const postResponse = await LikePOST(postRequest);
    expect(postResponse.status).toBe(400);

    const getRequest = new NextRequest(
      'http://localhost:3000/api/engagement/like?slug=../bad&contentType=post'
    );
    const getResponse = await LikeGET(getRequest);
    expect(getResponse.status).toBe(400);
  });

  it('rejects invalid slugs for bookmark endpoints (POST + GET)', async () => {
    const postRequest = new NextRequest('http://localhost:3000/api/engagement/bookmark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: '../bad',
        contentType: 'post',
        action: 'bookmark',
      }),
    });

    const postResponse = await BookmarkPOST(postRequest);
    expect(postResponse.status).toBe(400);

    const getRequest = new NextRequest(
      'http://localhost:3000/api/engagement/bookmark?slug=../bad&contentType=post'
    );
    const getResponse = await BookmarkGET(getRequest);
    expect(getResponse.status).toBe(400);
  });
});

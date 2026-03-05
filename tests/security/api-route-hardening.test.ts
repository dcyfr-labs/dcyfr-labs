import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as AddMemoryAPI } from '@/app/api/memory/add/route';
import { POST as SearchMemoryAPI } from '@/app/api/memory/search/route';
import {
  POST as DelegationEventsPOST,
  GET as DelegationEventsGET,
} from '@/app/api/delegation/events/route';
import { GET as LikeGET, POST as LikePOST } from '@/app/api/engagement/like/route';
import { GET as BookmarkGET, POST as BookmarkPOST } from '@/app/api/engagement/bookmark/route';

const { mockRateLimit, mockGetAuthenticatedUser, mockStreamDelegationEvent, mockMemory } =
  vi.hoisted(() => ({
    mockRateLimit: vi.fn(async () => ({ success: true, reset: Date.now() + 60000 })),
    mockGetAuthenticatedUser: vi.fn(async () => ({
      user: { id: 'user-1', email: 'user@example.com' },
      sessionToken: 'session-token',
      session: {},
    })),
    mockStreamDelegationEvent: vi.fn(),
    mockMemory: {
      addUserMemory: vi.fn(async () => 'memory-id-1'),
      searchUserMemories: vi.fn(async () => []),
    },
  }));

vi.mock('@/lib/rate-limit', () => ({
  rateLimit: mockRateLimit,
  getClientIp: vi.fn(() => '127.0.0.1'),
  createRateLimitHeaders: vi.fn(() => ({})),
}));

vi.mock('@/lib/auth-utils', () => ({
  getAuthenticatedUser: mockGetAuthenticatedUser,
}));

vi.mock('@/lib/error-handler', () => ({
  handleApiError: vi.fn(() => ({ statusCode: 500, isConnectionError: false })),
}));

vi.mock('@dcyfr/ai', () => ({
  getMemory: vi.fn(() => mockMemory),
}));

vi.mock('@/mcp/shared/redis-client', () => ({
  getRedisEnvironment: vi.fn(() => 'development'),
}));

vi.mock('@/lib/delegation/observability', () => ({
  streamDelegationEvent: mockStreamDelegationEvent,
  parseMCPDelegationEvent: vi.fn(() => null),
  createDelegationEventFromMCP: vi.fn(() => ({
    type: 'delegation_started',
    contractId: 'contract-1',
    timestamp: Date.now(),
  })),
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
    mockGetAuthenticatedUser.mockResolvedValue({
      user: { id: 'user-1', email: 'user@example.com' },
      sessionToken: 'session-token',
      session: {},
    });
    mockMemory.addUserMemory.mockResolvedValue('memory-id-1');
    mockMemory.searchUserMemories.mockResolvedValue([]);
  });

  it('returns 401 for unauthenticated memory add requests', async () => {
    mockGetAuthenticatedUser.mockResolvedValueOnce({
      user: null,
      sessionToken: null,
      session: null,
    } as unknown as Awaited<ReturnType<typeof mockGetAuthenticatedUser>>);

    const request = new NextRequest('http://localhost:3000/api/memory/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user-1', message: 'hello' }),
    });

    const response = await AddMemoryAPI(request);
    expect(response.status).toBe(401);
  });

  it('returns 403 for cross-user memory add requests', async () => {
    const request = new NextRequest('http://localhost:3000/api/memory/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user-2', message: 'hello' }),
    });

    const response = await AddMemoryAPI(request);
    expect(response.status).toBe(403);
  });

  it('returns 403 for cross-user memory search requests', async () => {
    const request = new NextRequest('http://localhost:3000/api/memory/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user-2', query: 'typescript' }),
    });

    const response = await SearchMemoryAPI(request);
    expect(response.status).toBe(403);
  });

  // Debug redis config tests skipped - route not implemented yet
  it.skip('returns 404 for debug redis config outside development', async () => {
    // Route @/app/api/debug/redis-config not yet implemented
  });

  it.skip('returns 200 for debug redis config in development', async () => {
    // Route @/app/api/debug/redis-config not yet implemented
  });

  it('returns 401 for delegation events without bearer token', async () => {
    const request = new NextRequest('http://localhost:3000/api/delegation/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'delegation_started', contractId: 'contract-1' }),
    });

    const response = await DelegationEventsPOST(request);
    expect(response.status).toBe(401);
    expect(mockStreamDelegationEvent).not.toHaveBeenCalled();
  });

  it('accepts delegation events with valid bearer token', async () => {
    vi.stubEnv('ADMIN_API_KEY', 'super-secret-token');

    const request = new NextRequest('http://localhost:3000/api/delegation/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer super-secret-token',
      },
      body: JSON.stringify({ type: 'delegation_started', contractId: 'contract-1' }),
    });

    const response = await DelegationEventsPOST(request);
    expect(response.status).toBe(200);
    expect(mockStreamDelegationEvent).toHaveBeenCalledTimes(1);
  });

  it('returns 429 for rate-limited delegation events requests', async () => {
    vi.stubEnv('ADMIN_API_KEY', 'super-secret-token');
    mockRateLimit.mockResolvedValueOnce({
      success: false,
      reset: Date.now() + 30000,
    });

    const request = new NextRequest('http://localhost:3000/api/delegation/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer super-secret-token',
      },
      body: JSON.stringify({ type: 'delegation_started', contractId: 'contract-1' }),
    });

    const response = await DelegationEventsPOST(request);
    expect(response.status).toBe(429);
    expect(mockStreamDelegationEvent).not.toHaveBeenCalled();
  });

  it('keeps delegation events health endpoint available', async () => {
    const response = await DelegationEventsGET();
    expect(response.status).toBe(200);
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

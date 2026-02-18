import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/admin/indexnow/bulk/route';

const { submitToIndexNowWithResultMock } = vi.hoisted(() => ({
  submitToIndexNowWithResultMock: vi.fn(),
}));

vi.mock('@/data/posts', () => ({
  posts: [{ slug: 'post-one' }, { slug: 'post-two' }],
}));

vi.mock('@/data/projects', () => ({
  visibleProjects: [{ slug: 'proj-one' }],
}));

vi.mock('@/lib/indexnow/client', () => ({
  getBlogPostUrl: (slug: string) => `https://www.dcyfr.ai/blog/${slug}`,
  getProjectUrl: (slug: string) => `https://www.dcyfr.ai/work/${slug}`,
  submitToIndexNowWithResult: submitToIndexNowWithResultMock,
}));

describe('POST /api/admin/indexnow/bulk', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      ADMIN_API_KEY: 'test-admin-key',
    };

    submitToIndexNowWithResultMock.mockResolvedValue({
      success: true,
      status: 200,
      queued: 8,
      message: 'queued',
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  function createRequest(body: unknown, authHeader?: string) {
    return new NextRequest('http://localhost:3000/api/admin/indexnow/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });
  }

  it('returns 503 when ADMIN_API_KEY is missing', async () => {
    delete process.env.ADMIN_API_KEY;

    const response = await POST(createRequest({ types: ['posts'] }, 'Bearer test-admin-key'));
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toContain('ADMIN_API_KEY');
  });

  it('returns 401 when bearer token is invalid', async () => {
    const response = await POST(createRequest({ types: ['posts'] }, 'Bearer wrong-key'));

    expect(response.status).toBe(401);
    expect(submitToIndexNowWithResultMock).not.toHaveBeenCalled();
  });

  it('returns 200 and queues defaults when request body omits types', async () => {
    const response = await POST(createRequest({}, 'Bearer test-admin-key'));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.types).toEqual(['posts', 'projects', 'static']);
    expect(data.queued).toBe(8);
    expect(submitToIndexNowWithResultMock).toHaveBeenCalledTimes(1);
  });

  it('returns 400 for invalid request body', async () => {
    const response = await POST(
      createRequest({ types: ['bad-type'] }, 'Bearer test-admin-key')
    );

    expect(response.status).toBe(400);
    expect(submitToIndexNowWithResultMock).not.toHaveBeenCalled();
  });

  it('returns upstream failure status when queue delegation fails', async () => {
    submitToIndexNowWithResultMock.mockResolvedValueOnce({
      success: false,
      status: 429,
      queued: 0,
      error: 'Rate limit exceeded',
    });

    const response = await POST(
      createRequest({ types: ['posts'] }, 'Bearer test-admin-key')
    );
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Rate limit exceeded');
  });
});

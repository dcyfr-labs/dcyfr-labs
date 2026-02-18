import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import {
  getBlogPostUrl,
  getProjectUrl,
  submitToIndexNow,
  submitToIndexNowWithResult,
} from '@/lib/indexnow/client';

describe('indexnow client helper', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('builds canonical blog and project urls', () => {
    expect(getBlogPostUrl('my-post')).toBe('https://www.dcyfr.ai/blog/my-post');
    expect(getProjectUrl('my-project')).toBe('https://www.dcyfr.ai/work/my-project');
  });

  it('returns successful queue details for successful submit API call', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: 'queued',
          queued: { urls: 2 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    ) as typeof fetch;

    const result = await submitToIndexNowWithResult([
      'https://www.dcyfr.ai/blog/a',
      'https://www.dcyfr.ai/blog/b',
    ]);

    expect(result.success).toBe(true);
    expect(result.status).toBe(200);
    expect(result.queued).toBe(2);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('returns failure details for non-2xx response', async () => {
    global.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })
    ) as typeof fetch;

    const result = await submitToIndexNowWithResult('https://www.dcyfr.ai/blog/one');

    expect(result.success).toBe(false);
    expect(result.status).toBe(429);
    expect(result.error).toContain('Rate limit exceeded');
  });

  it('submitToIndexNow does not throw on failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network down')) as typeof fetch;

    await expect(submitToIndexNow('https://www.dcyfr.ai/blog/one')).resolves.toBeUndefined();
  });
});

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import type { IndexNowSubmissionRequestedEventData } from '@/lib/indexnow/events';

// Capture the handler that gets passed to createFunction
vi.mock('@/inngest/client', () => ({
  inngest: {
    createFunction: (_config: unknown, handler: unknown) => ({
      _handler: handler,
    }),
  },
}));

// Import AFTER mock is registered so createFunction uses the mock
const { processIndexNowSubmission, verifyIndexNowKeyFile } =
  await import('@/inngest/indexnow-functions');

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Call the captured handler with mocked step + event */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = (processIndexNowSubmission as any)._handler as (ctx: {
  event: { data: IndexNowSubmissionRequestedEventData };
  step: MockStep;
}) => Promise<unknown>;

interface MockStep {
  run: ReturnType<typeof vi.fn>;
}

function createMockStep(): MockStep {
  return {
    // call-through: execute the callback and return its result
    run: vi.fn(async (_name: string, fn: () => unknown) => fn()),
  };
}

const VALID_KEY = 'e53b0a2c-74fb-4987-b6d1-add3616156c9'; // gitleaks:allow

function makeEvent(overrides: Partial<IndexNowSubmissionRequestedEventData> = {}): {
  data: IndexNowSubmissionRequestedEventData;
} {
  return {
    data: {
      urls: ['https://www.dcyfr.ai/blog/test-post'],
      key: VALID_KEY,
      keyLocation: `https://www.dcyfr.ai/${VALID_KEY}.txt`,
      requestId: 'req-test-001',
      requestedAt: Date.now(),
      ...overrides,
    },
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('processIndexNowSubmission Inngest function', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  // ── Happy path ──────────────────────────────────────────────────────────

  test('returns success summary when IndexNow API responds with 200', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 })) as typeof fetch;

    const result = await handler({ event: makeEvent(), step: createMockStep() });

    expect(result).toMatchObject({
      success: true,
      requestId: 'req-test-001',
      totalUrls: expect.any(Number),
      submissions: { successRate: expect.any(Number) },
      timestamp: expect.any(String),
    });
  });

  test('runs all four steps in order', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 })) as typeof fetch;

    const step = createMockStep();
    await handler({ event: makeEvent(), step });

    const stepNames = (step.run.mock.calls as [string, unknown][]).map(([name]) => name);
    expect(stepNames).toEqual([
      'validate-submission',
      'prepare-payloads',
      'submit-to-indexnow',
      'analyze-results',
    ]);
  });

  // ── Validation failures ─────────────────────────────────────────────────

  test('throws when API key is not UUID v4 format', async () => {
    await expect(
      handler({
        event: makeEvent({ key: 'not-a-valid-uuid' }),
        step: createMockStep(),
      })
    ).rejects.toThrow('Invalid API key format');
  });

  test('throws when keyLocation is not a valid URL', async () => {
    await expect(
      handler({
        event: makeEvent({ keyLocation: 'not-a-url' }),
        step: createMockStep(),
      })
    ).rejects.toThrow('Invalid key location URL');
  });

  test('throws when all provided URLs are invalid', async () => {
    await expect(
      handler({
        event: makeEvent({ urls: ['not-a-url', 'also-invalid'] }),
        step: createMockStep(),
      })
    ).rejects.toThrow('No valid URLs to submit');
  });

  // ── HTTP error handling ─────────────────────────────────────────────────

  test('records 403 Forbidden as a failed result (no throw)', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response('Forbidden', { status: 403 })) as typeof fetch;

    const result = await handler({ event: makeEvent(), step: createMockStep() });

    // Function should complete (not throw) — 403 is recorded in failures
    expect(result).toMatchObject({
      requestId: 'req-test-001',
      timestamp: expect.any(String),
    });
    expect((result as { submissions: { successRate: number } }).submissions.successRate).toBe(0);
  });

  test('records 422 Unprocessable as a failed result (no throw)', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response('Unprocessable Entity', { status: 422 })) as typeof fetch;

    const result = await handler({ event: makeEvent(), step: createMockStep() });

    expect(
      (result as { submissions: { successRate: number; failed: number } }).submissions.successRate
    ).toBe(0);
    expect((result as { submissions: { failed: number } }).submissions.failed).toBeGreaterThan(0);
  });

  test('records 429 Rate Limit as a failed result (no throw)', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response('Too Many Requests', { status: 429 })) as typeof fetch;

    const result = await handler({ event: makeEvent(), step: createMockStep() });

    expect((result as { submissions: { successRate: number } }).submissions.successRate).toBe(0);
  });

  test('records 500 Server Error as a failed result (no throw)', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response('Internal Server Error', { status: 500 })) as typeof fetch;

    const result = await handler({ event: makeEvent(), step: createMockStep() });

    expect((result as { submissions: { successRate: number } }).submissions.successRate).toBe(0);
  });

  test('records network/fetch error as a failed result (no throw)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error')) as typeof fetch;

    const result = await handler({ event: makeEvent(), step: createMockStep() });

    expect(
      (result as { submissions: { successRate: number; failed: number } }).submissions.successRate
    ).toBe(0);
    expect((result as { submissions: { failed: number } }).submissions.failed).toBeGreaterThan(0);
  });

  // ── Multiple URLs / batching ────────────────────────────────────────────

  test('handles multiple URLs in a single submission', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 })) as typeof fetch;

    const result = await handler({
      event: makeEvent({
        urls: [
          'https://www.dcyfr.ai/blog/post-1',
          'https://www.dcyfr.ai/blog/post-2',
          'https://www.dcyfr.ai/work/project-1',
        ],
      }),
      step: createMockStep(),
    });

    expect((result as { totalUrls: number }).totalUrls).toBe(3);
    expect((result as { success: boolean }).success).toBe(true);
  });

  test('filters out invalid URLs and submits only valid ones', async () => {
    global.fetch = vi.fn().mockResolvedValue(new Response(null, { status: 200 })) as typeof fetch;

    const result = await handler({
      event: makeEvent({
        urls: ['https://www.dcyfr.ai/blog/valid-post', 'not-a-url', 'also-invalid'],
      }),
      step: createMockStep(),
    });

    // 1 valid URL should succeed; 2 invalid filtered
    expect((result as { totalUrls: number }).totalUrls).toBe(1);
    expect((result as { success: boolean }).success).toBe(true);
  });
});

// ── verifyIndexNowKeyFile ─────────────────────────────────────────────────────

describe('verifyIndexNowKeyFile Inngest function', () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const verifyHandler = (verifyIndexNowKeyFile as any)._handler as (ctx: {
    step: MockStep;
  }) => Promise<unknown>;

  test('returns failure when INDEXNOW_API_KEY is not set', async () => {
    delete process.env.INDEXNOW_API_KEY;
    delete process.env.NEXT_PUBLIC_SITE_URL;

    const result = await verifyHandler({ step: createMockStep() });

    expect(result).toMatchObject({
      success: false,
      error: expect.stringContaining('Missing'),
    });
  });

  test('returns success when key file responds with correct content', async () => {
    const key = VALID_KEY;
    process.env.INDEXNOW_API_KEY = key;
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.dcyfr.ai';

    global.fetch = vi.fn().mockResolvedValue(new Response(key, { status: 200 })) as typeof fetch;

    const result = await verifyHandler({ step: createMockStep() });

    expect(result).toMatchObject({
      success: true,
      contentValid: true,
    });
  });

  test('returns failure when key file content does not match', async () => {
    process.env.INDEXNOW_API_KEY = VALID_KEY;
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.dcyfr.ai';

    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response('wrong-content', { status: 200 })) as typeof fetch;

    const result = await verifyHandler({ step: createMockStep() });

    expect(result).toMatchObject({
      success: false,
      error: expect.stringContaining('mismatch'),
    });
  });

  test('returns failure when key file returns non-200', async () => {
    process.env.INDEXNOW_API_KEY = VALID_KEY;
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.dcyfr.ai';

    global.fetch = vi
      .fn()
      .mockResolvedValue(new Response('Not Found', { status: 404 })) as typeof fetch;

    const result = await verifyHandler({ step: createMockStep() });

    expect(result).toMatchObject({
      success: false,
      error: expect.stringContaining('404'),
    });
  });
});

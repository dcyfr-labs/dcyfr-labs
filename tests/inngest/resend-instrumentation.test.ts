import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

/**
 * Instrumentation coverage for the Resend send sites inside the Inngest
 * functions. Each function's raw handler is exposed as `.fn` on the Inngest
 * function object; we invoke it with a fake `step` that simply executes each
 * closure, and assert `recordApiCall('resend', …)` fires after a successful
 * `resend.emails.send`.
 *
 * RESEND_API_KEY must be truthy *before* the SUT modules are imported (they
 * construct the Resend client at module-eval time), so the SUTs are pulled in
 * via dynamic import after the env + module mocks are in place.
 */

// recordApiCall seam — assert invocation without touching Redis.
const recordApiCall = vi.fn(async (..._args: unknown[]) => {});
vi.mock('@/lib/api', () => ({ recordApiCall }));
vi.mock('@/lib/api/api-guardrails', () => ({ recordApiCall }));

// Resend client mock — emails.send always succeeds.
const emailsSend = vi.fn(async () => ({ data: { id: 'msg_test_123' } }));
vi.mock('resend', () => ({
  // Must be constructable (`new Resend(key)`), so use a class, not an arrow.
  Resend: class {
    emails = { send: emailsSend };
  },
}));

// Vercel analytics track is a no-op in tests.
vi.mock('@vercel/analytics/server', () => ({ track: vi.fn(async () => {}) }));

// Sentry is a no-op in tests (used by the error handler).
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  lastEventId: vi.fn(() => 'evt_test'),
}));

// Fake step that runs each closure inline.
const fakeStep = { run: async (_name: string, fn: () => unknown) => await fn() };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = { fn: (ctx: any) => Promise<unknown> };

describe('Resend send-site instrumentation', () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = 'test-resend-key';
    process.env.INNGEST_ERROR_ALERTS_EMAIL = 'alerts@example.com';
    recordApiCall.mockClear();
    emailsSend.mockClear();
    emailsSend.mockResolvedValue({ data: { id: 'msg_test_123' } });
    vi.resetModules();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('contactFormSubmitted records resend for owner notify + confirmation', async () => {
    const mod = await import('@/inngest/contact-functions');
    const handler = mod.contactFormSubmitted as unknown as AnyFn;

    await handler.fn({
      event: {
        data: {
          name: 'Ada',
          email: 'ada@example.com',
          message: 'Hello there',
          role: 'engineer',
          submittedAt: new Date().toISOString(),
        },
      },
      step: fakeStep,
    });

    expect(emailsSend).toHaveBeenCalledTimes(2);
    expect(recordApiCall).toHaveBeenCalledTimes(2);
    const services = recordApiCall.mock.calls.map((c) => c[0]);
    expect(services.every((s) => s === 'resend')).toBe(true);
  });

  it('contactFormSubmitted does NOT record when a send throws', async () => {
    // First send (owner notify) throws -> step rethrows for retry, confirmation never runs.
    emailsSend.mockRejectedValueOnce(new Error('resend 500'));
    const mod = await import('@/inngest/contact-functions');
    const handler = mod.contactFormSubmitted as unknown as AnyFn;

    await expect(
      handler.fn({
        event: {
          data: {
            name: 'Ada',
            email: 'ada@example.com',
            message: 'Hello there',
            submittedAt: new Date().toISOString(),
          },
        },
        step: fakeStep,
      })
    ).rejects.toThrow();

    // The failed owner-notify send must not have recorded usage.
    expect(recordApiCall).not.toHaveBeenCalled();
  });

  it('newsletterSubscribeSubmitted records resend for confirmation + owner notify', async () => {
    const mod = await import('@/inngest/newsletter-functions');
    const handler = mod.newsletterSubscribeSubmitted as unknown as AnyFn;

    await handler.fn({
      event: {
        data: {
          email: 'sub@example.com',
          subscribedAt: new Date().toISOString(),
        },
      },
      step: fakeStep,
    });

    expect(emailsSend).toHaveBeenCalledTimes(2);
    expect(recordApiCall).toHaveBeenCalledTimes(2);
    expect(recordApiCall.mock.calls.every((c) => c[0] === 'resend')).toBe(true);
  });

  it('inngestErrorHandler records resend after sending a critical alert email', async () => {
    const mod = await import('@/inngest/error-handler');
    const handler = mod.inngestErrorHandler as unknown as AnyFn;

    await handler.fn({
      event: {
        data: {
          functionId: 'contact-form-submitted', // critical severity
          functionName: 'Contact Form',
          error: { message: 'boom' },
          event: { name: 'contact/form.submitted', data: {} },
          attempt: 3,
          maxRetries: 3,
          executionId: 'exec_1',
          timestamp: new Date().toISOString(),
        },
      },
      step: fakeStep,
    });

    expect(emailsSend).toHaveBeenCalledTimes(1);
    expect(recordApiCall).toHaveBeenCalledTimes(1);
    expect(recordApiCall).toHaveBeenCalledWith('resend', expect.any(String));
  });
});

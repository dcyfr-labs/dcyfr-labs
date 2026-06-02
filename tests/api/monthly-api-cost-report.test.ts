import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Shared mock fns must be created via vi.hoisted so they exist when the
// hoisted vi.mock factories run.
const { emailsSend, captureMessage } = vi.hoisted(() => ({
  emailsSend: vi.fn(async (_payload: { html: string; [k: string]: unknown }) => ({
    data: { id: 'msg_1' },
  })),
  captureMessage: vi.fn(),
}));

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: emailsSend };
  },
}));

vi.mock('@sentry/nextjs', () => ({
  captureMessage,
  captureException: vi.fn(),
}));

// Mock only the data source; the real calculator + headroom helpers run.
vi.mock('@/lib/api/api-usage-tracker', () => ({
  getMonthlyUsage: vi.fn(),
  getHistoricalUsage: vi.fn(),
}));

import { GET } from '@/app/api/cron/monthly-api-cost-report/route';
import { getMonthlyUsage, getHistoricalUsage } from '@/lib/api/api-usage-tracker';

function lastEmailHtml(): string {
  const call = emailsSend.mock.calls.at(-1);
  if (!call) throw new Error('expected an email to have been sent');
  return call[0].html;
}

describe('monthly-api-cost-report route — free-tier headroom reframe', () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = 'test-key';
    delete process.env.CRON_SECRET; // test env -> validateCronRequest allows
    emailsSend.mockClear();
    captureMessage.mockClear();
    vi.mocked(getHistoricalUsage).mockResolvedValue([]);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders an explicit empty-state when no usage was recorded', async () => {
    vi.mocked(getMonthlyUsage).mockResolvedValue(null);

    const res = await GET(new Request('https://x.test/cron'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);

    expect(emailsSend).toHaveBeenCalledTimes(1);
    const html = lastEmailHtml();
    expect(html).toContain('No API usage was recorded');
    expect(html).toContain('recordApiCall');
    // Misleading budget framing must be gone.
    expect(html).not.toContain('Budget Used');
    expect(html).not.toContain('Within Budget');
  });

  it('renders free-tier headroom (requests vs limit + percent) when usage exists', async () => {
    vi.mocked(getMonthlyUsage).mockImplementation(async (service: string) => {
      if (service === 'resend')
        return {
          service: 'resend',
          month: '2026-05',
          totalRequests: 300,
          totalCost: 0,
          totalTokens: 0,
          avgDuration: 10,
          daysActive: 10,
        };
      if (service === 'github')
        return {
          service: 'github',
          month: '2026-05',
          totalRequests: 1200,
          totalCost: 0,
          totalTokens: 0,
          avgDuration: 5,
          daysActive: 20,
        };
      return null;
    });

    const res = await GET(new Request('https://x.test/cron'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.servicesReported).toBeGreaterThanOrEqual(2);

    const html = lastEmailHtml();
    // Honest free-tier framing
    expect(html).toContain('Free-Tier Headroom');
    expect(html).toContain('Total estimated cost');
    // Resend free-tier limit (3,000) should be shown as the denominator
    expect(html).toContain('3,000');
    // Percent-of-limit column header present
    expect(html.toLowerCase()).toContain('% of limit');
    // Misleading budget framing must be gone
    expect(html).not.toContain('Budget Used');
    expect(html).not.toContain('Within Budget');
  });

  it('still captures a Sentry message and preserves the JSON response shape', async () => {
    vi.mocked(getMonthlyUsage).mockResolvedValue(null);

    const res = await GET(new Request('https://x.test/cron'));
    const json = await res.json();

    expect(captureMessage).toHaveBeenCalledWith(
      expect.stringContaining('Monthly API Cost Report'),
      expect.objectContaining({ level: 'info' })
    );
    expect(json).toHaveProperty('success', true);
    expect(json).toHaveProperty('month');
    expect(json).toHaveProperty('totalCost');
    expect(json).toHaveProperty('servicesReported');
    expect(json).toHaveProperty('predictions');
  });

  it('rejects unauthorized requests in production', async () => {
    const prev = process.env.NODE_ENV;
    const prevSecret = process.env.CRON_SECRET;
    // @ts-expect-error test override
    process.env.NODE_ENV = 'production';
    process.env.CRON_SECRET = 'secret';

    const res = await GET(new Request('https://x.test/cron'));
    expect(res.status).toBe(401);

    // @ts-expect-error restore
    process.env.NODE_ENV = prev;
    if (prevSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = prevSecret;
  });
});

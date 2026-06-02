import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

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

// Mock only the data source; real calculator + headroom helpers run.
vi.mock('@/lib/api/api-usage-tracker', () => ({
  getMonthlyUsage: vi.fn(),
  getHistoricalUsage: vi.fn(),
  getUsageSummary: vi.fn(async () => ({
    totalServices: 0,
    totalCost: 0,
    servicesNearLimit: [],
    servicesAtLimit: [],
  })),
}));

import { GET } from '@/app/api/cron/monitor-api-costs/route';
import { getMonthlyUsage, getHistoricalUsage } from '@/lib/api/api-usage-tracker';

function lastEmailHtml(): string {
  const call = emailsSend.mock.calls.at(-1);
  if (!call) throw new Error('expected an email to have been sent');
  return call[0].html;
}

describe('monitor-api-costs route — free-tier headroom reframe', () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = 'test-key';
    delete process.env.CRON_SECRET;
    emailsSend.mockClear();
    captureMessage.mockClear();
    vi.mocked(getHistoricalUsage).mockResolvedValue([]);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('raises no alerts and sends no email when usage is well within free tiers', async () => {
    vi.mocked(getMonthlyUsage).mockImplementation(async (service: string) => {
      if (service === 'resend')
        return {
          service: 'resend',
          month: '2026-05',
          totalRequests: 100, // 100/3000 ~ 3%
          totalCost: 0,
          totalTokens: 0,
          avgDuration: 10,
          daysActive: 10,
        };
      return null;
    });

    const res = await GET(new Request('https://x.test/cron'));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.alerts.total).toBe(0);
    expect(json.alerts.critical).toBe(0);
    expect(emailsSend).not.toHaveBeenCalled();
  });

  it('raises a critical headroom alert and emails when a free tier is ≥90% consumed', async () => {
    vi.mocked(getMonthlyUsage).mockImplementation(async (service: string) => {
      if (service === 'resend')
        return {
          service: 'resend',
          month: '2026-05',
          totalRequests: 2900, // 2900/3000 ~ 96.7% -> critical
          totalCost: 0,
          totalTokens: 0,
          avgDuration: 10,
          daysActive: 25,
        };
      return null;
    });

    const res = await GET(new Request('https://x.test/cron'));
    const json = await res.json();

    expect(json.alerts.critical).toBeGreaterThanOrEqual(1);
    expect(captureMessage).toHaveBeenCalled();
    expect(emailsSend).toHaveBeenCalledTimes(1);

    const html = lastEmailHtml();
    expect(html).toContain('Resend Email');
    // headroom phrasing, not budget phrasing
    expect(html.toLowerCase()).toContain('free-tier');
    expect(html).not.toContain('Budget Used');
  });

  it('raises a warning (no email) when a free tier is between 70% and 90%', async () => {
    vi.mocked(getMonthlyUsage).mockImplementation(async (service: string) => {
      if (service === 'resend')
        return {
          service: 'resend',
          month: '2026-05',
          totalRequests: 2400, // 2400/3000 = 80% -> warning
          totalCost: 0,
          totalTokens: 0,
          avgDuration: 10,
          daysActive: 20,
        };
      return null;
    });

    const res = await GET(new Request('https://x.test/cron'));
    const json = await res.json();

    expect(json.alerts.warning).toBeGreaterThanOrEqual(1);
    expect(json.alerts.critical).toBe(0);
    expect(emailsSend).not.toHaveBeenCalled();
  });

  it('preserves the JSON response shape', async () => {
    vi.mocked(getMonthlyUsage).mockResolvedValue(null);
    const res = await GET(new Request('https://x.test/cron'));
    const json = await res.json();
    expect(json).toHaveProperty('success', true);
    expect(json).toHaveProperty('alerts');
    expect(json.alerts).toHaveProperty('total');
    expect(json.alerts).toHaveProperty('critical');
    expect(json.alerts).toHaveProperty('warning');
    expect(json).toHaveProperty('recommendations');
  });
});

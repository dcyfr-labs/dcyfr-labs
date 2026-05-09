import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  API_LIMITS,
  RATE_LIMITS,
  ALERT_THRESHOLDS,
  trackApiUsage,
  checkServiceLimit,
  getAllUsageStats,
  getServiceUsageStats,
  resetUsageTracking,
  getUsageSummary,
  checkApiLimitMiddleware,
  recordApiCall,
  estimateMonthlyCosts,
  getApiHealthStatus,
  logDailyUsageSummary,
} from '@/lib/api/api-guardrails';

beforeEach(() => {
  resetUsageTracking();
  vi.restoreAllMocks();
});

// ── Configuration ──────────────────────────────────────────

describe('API_LIMITS', () => {
  it('defines limits for all supported services', () => {
    expect(API_LIMITS.inngest.maxEventsPerMonth).toBe(10000);
    expect(API_LIMITS.resend.maxEmailsPerMonth).toBe(2500);
    expect(API_LIMITS.github.maxRequestsPerHour).toBe(4500);
    expect(API_LIMITS.redis.maxCommandsPerDay).toBe(9000);
    expect(API_LIMITS.sentry.maxEventsPerMonth).toBe(45000);
    expect(API_LIMITS.promptintel.maxRequestsPerMonth).toBe(10000);
  });
});

describe('RATE_LIMITS', () => {
  it('defines rate limits for public endpoints', () => {
    expect(RATE_LIMITS.contact.requestsPerDay).toBe(20);
    expect(RATE_LIMITS.views.requestsPerMinute).toBe(60);
    expect(RATE_LIMITS.shares.requestsPerMinute).toBe(30);
  });
});

describe('ALERT_THRESHOLDS', () => {
  it('has warning and critical thresholds', () => {
    expect(ALERT_THRESHOLDS.warning).toBe(0.7);
    expect(ALERT_THRESHOLDS.critical).toBe(0.9);
  });
});

// ── Usage Tracking ─────────────────────────────────────────

describe('trackApiUsage', () => {
  it('tracks a new service usage', () => {
    trackApiUsage('inngest');
    const stats = getAllUsageStats();
    expect(stats).toHaveLength(1);
    expect(stats[0].service).toBe('inngest');
    expect(stats[0].count).toBe(1);
  });

  it('increments count on subsequent calls', () => {
    trackApiUsage('inngest');
    trackApiUsage('inngest');
    trackApiUsage('inngest');
    const stats = getServiceUsageStats('inngest');
    expect(stats[0].count).toBe(3);
  });

  it('tracks with endpoint differentiation', () => {
    trackApiUsage('inngest', '/event');
    trackApiUsage('inngest', '/function');
    const stats = getAllUsageStats();
    expect(stats).toHaveLength(2);
  });

  it('accumulates cost', () => {
    trackApiUsage('inngest', undefined, 0.05);
    trackApiUsage('inngest', undefined, 0.1);
    const stats = getServiceUsageStats('inngest');
    expect(stats[0].estimatedCost).toBeCloseTo(0.15);
  });

  it('computes percentUsed', () => {
    trackApiUsage('inngest');
    trackApiUsage('inngest');
    const stats = getServiceUsageStats('inngest');
    // 2/10000 = 0.02%
    expect(stats[0].percentUsed).toBeCloseTo(0.02);
  });

  it('triggers warning alert at 70%', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Simulate 7000 calls (70% of 10000)
    for (let i = 0; i < 7000; i++) trackApiUsage('inngest');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('WARNING'), expect.any(String));
  });

  it('triggers critical alert at 90%', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    for (let i = 0; i < 9000; i++) trackApiUsage('inngest');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('CRITICAL'), expect.any(String));
  });
});

describe('checkServiceLimit', () => {
  it('allows when no tracking exists', () => {
    const result = checkServiceLimit('inngest');
    expect(result.allowed).toBe(true);
  });

  it('allows when under limit', () => {
    trackApiUsage('inngest');
    const result = checkServiceLimit('inngest');
    expect(result.allowed).toBe(true);
    expect(result.stats).toBeDefined();
  });

  it('rejects when at limit', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    for (let i = 0; i < 10000; i++) trackApiUsage('inngest');
    const result = checkServiceLimit('inngest');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('monthly limit reached');
  });

  it('checks with endpoint key', () => {
    trackApiUsage('inngest', '/event');
    const result = checkServiceLimit('inngest', '/event');
    expect(result.allowed).toBe(true);
    expect(result.stats?.endpoint).toBe('/event');
  });
});

describe('resetUsageTracking', () => {
  it('clears all tracking data', () => {
    trackApiUsage('inngest');
    trackApiUsage('github');
    resetUsageTracking();
    expect(getAllUsageStats()).toHaveLength(0);
  });
});

describe('getUsageSummary', () => {
  it('returns empty summary when no tracking', () => {
    const summary = getUsageSummary();
    expect(summary.totalServices).toBe(0);
    expect(summary.totalCost).toBe(0);
    expect(summary.servicesNearLimit).toEqual([]);
    expect(summary.servicesAtLimit).toEqual([]);
  });

  it('counts distinct services', () => {
    trackApiUsage('inngest');
    trackApiUsage('github');
    const summary = getUsageSummary();
    expect(summary.totalServices).toBe(2);
  });

  it('sums costs', () => {
    trackApiUsage('inngest', undefined, 0.05);
    trackApiUsage('inngest', undefined, 0.1);
    const summary = getUsageSummary();
    expect(summary.totalCost).toBeCloseTo(0.15);
  });

  it('identifies services near limit', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Get 70%+ of inngest limit (10000 * 0.7 = 7000)
    for (let i = 0; i < 7001; i++) trackApiUsage('inngest');
    const summary = getUsageSummary();
    expect(summary.servicesNearLimit).toContain('inngest');
  });
});

// ── Middleware ──────────────────────────────────────────────

describe('checkApiLimitMiddleware', () => {
  it('allows when under limit', async () => {
    const result = await checkApiLimitMiddleware('github');
    expect(result.allowed).toBe(true);
  });

  it('returns 429 when at limit', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    for (let i = 0; i < 10000; i++) trackApiUsage('inngest');
    const result = await checkApiLimitMiddleware('inngest');
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.status).toBe(429);
      expect(result.retryAfter).toBe(3600);
    }
  });
});

describe('recordApiCall', () => {
  it('tracks usage with options', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    recordApiCall('inngest', '/event', { cost: 0.05, tokens: 500 });
    const stats = getServiceUsageStats('inngest');
    expect(stats).toHaveLength(1);
  });
});

// ── Cost Estimation ────────────────────────────────────────

describe('estimateMonthlyCosts', () => {
  it('returns empty when no tracking', () => {
    expect(estimateMonthlyCosts()).toEqual([]);
  });

  it('returns services with costs', () => {
    trackApiUsage('inngest', undefined, 0.05);
    const costs = estimateMonthlyCosts();
    expect(costs).toHaveLength(1);
    expect(costs[0].service).toBe('inngest');
    expect(costs[0].estimatedCost).toBeCloseTo(0.05);
  });
});

// ── Health Status ──────────────────────────────────────────

describe('getApiHealthStatus', () => {
  it('returns healthy when no usage', () => {
    const status = getApiHealthStatus();
    expect(status.status).toBe('healthy');
    expect(status.message).toBe('All services within limits');
  });

  it('returns warning when service near limit', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    for (let i = 0; i < 7001; i++) trackApiUsage('inngest');
    const status = getApiHealthStatus();
    expect(status.status).toBe('warning');
    expect(status.details.servicesNearLimit).toBe(1);
  });

  it('returns critical when service at limit', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    for (let i = 0; i < 10000; i++) trackApiUsage('inngest');
    const status = getApiHealthStatus();
    expect(status.status).toBe('critical');
    expect(status.details.servicesAtLimit).toBe(1);
  });
});

describe('logDailyUsageSummary', () => {
  it('logs summary without error', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    trackApiUsage('inngest', undefined, 0.05);
    expect(() => logDailyUsageSummary()).not.toThrow();
  });
});

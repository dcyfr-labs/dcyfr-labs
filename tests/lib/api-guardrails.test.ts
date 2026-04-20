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
  estimatePerplexityCost,
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
    expect(API_LIMITS.perplexity.maxRequestsPerMonth).toBe(1000);
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
    expect(RATE_LIMITS.research.requestsPerMinute).toBe(5);
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
    trackApiUsage('perplexity');
    const stats = getAllUsageStats();
    expect(stats).toHaveLength(1);
    expect(stats[0].service).toBe('perplexity');
    expect(stats[0].count).toBe(1);
  });

  it('increments count on subsequent calls', () => {
    trackApiUsage('perplexity');
    trackApiUsage('perplexity');
    trackApiUsage('perplexity');
    const stats = getServiceUsageStats('perplexity');
    expect(stats[0].count).toBe(3);
  });

  it('tracks with endpoint differentiation', () => {
    trackApiUsage('perplexity', '/research');
    trackApiUsage('perplexity', '/search');
    const stats = getAllUsageStats();
    expect(stats).toHaveLength(2);
  });

  it('accumulates cost', () => {
    trackApiUsage('perplexity', undefined, 0.05);
    trackApiUsage('perplexity', undefined, 0.1);
    const stats = getServiceUsageStats('perplexity');
    expect(stats[0].estimatedCost).toBeCloseTo(0.15);
  });

  it('computes percentUsed', () => {
    trackApiUsage('perplexity');
    trackApiUsage('perplexity');
    const stats = getServiceUsageStats('perplexity');
    // 2/1000 = 0.2%
    expect(stats[0].percentUsed).toBeCloseTo(0.2);
  });

  it('triggers warning alert at 70%', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Simulate 700 calls (70% of 1000)
    for (let i = 0; i < 700; i++) trackApiUsage('perplexity');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('WARNING'), expect.any(String));
  });

  it('triggers critical alert at 90%', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    for (let i = 0; i < 900; i++) trackApiUsage('perplexity');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('CRITICAL'), expect.any(String));
  });
});

describe('checkServiceLimit', () => {
  it('allows when no tracking exists', () => {
    const result = checkServiceLimit('perplexity');
    expect(result.allowed).toBe(true);
  });

  it('allows when under limit', () => {
    trackApiUsage('perplexity');
    const result = checkServiceLimit('perplexity');
    expect(result.allowed).toBe(true);
    expect(result.stats).toBeDefined();
  });

  it('rejects when at limit', () => {
    for (let i = 0; i < 1000; i++) trackApiUsage('perplexity');
    const result = checkServiceLimit('perplexity');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('monthly limit reached');
  });

  it('rejects perplexity when cost limit exceeded', () => {
    // Track with high cost to exceed $50 budget
    trackApiUsage('perplexity', undefined, 51);
    trackApiUsage('perplexity', undefined, 0); // Second call checks cost
    const result = checkServiceLimit('perplexity');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('cost limit reached');
  });

  it('checks with endpoint key', () => {
    trackApiUsage('perplexity', '/research');
    const result = checkServiceLimit('perplexity', '/research');
    expect(result.allowed).toBe(true);
    expect(result.stats?.endpoint).toBe('/research');
  });
});

describe('resetUsageTracking', () => {
  it('clears all tracking data', () => {
    trackApiUsage('perplexity');
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
    trackApiUsage('perplexity');
    trackApiUsage('github');
    const summary = getUsageSummary();
    expect(summary.totalServices).toBe(2);
  });

  it('sums costs', () => {
    trackApiUsage('perplexity', undefined, 0.05);
    trackApiUsage('perplexity', undefined, 0.1);
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
    for (let i = 0; i < 1000; i++) trackApiUsage('perplexity');
    const result = await checkApiLimitMiddleware('perplexity');
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
    recordApiCall('perplexity', '/research', { cost: 0.05, tokens: 500 });
    const stats = getServiceUsageStats('perplexity');
    expect(stats).toHaveLength(1);
  });
});

// ── Cost Estimation ────────────────────────────────────────

describe('estimatePerplexityCost', () => {
  it('calculates cost for known model', () => {
    const cost = estimatePerplexityCost({
      model: 'llama-3.1-sonar-large-128k-online',
      promptTokens: 1000,
      completionTokens: 500,
    });
    // (1000/1000 * 0.001) + (500/1000 * 0.001) = 0.001 + 0.0005 = 0.0015
    expect(cost).toBeCloseTo(0.0015);
  });

  it('uses default pricing for unknown model', () => {
    const cost = estimatePerplexityCost({
      model: 'unknown-model',
      promptTokens: 1000,
      completionTokens: 1000,
    });
    // Falls back to large model pricing
    expect(cost).toBeCloseTo(0.002);
  });

  it('calculates cost for small model', () => {
    const cost = estimatePerplexityCost({
      model: 'llama-3.1-sonar-small-128k-online',
      promptTokens: 1000,
      completionTokens: 1000,
    });
    // (1000/1000 * 0.0002) + (1000/1000 * 0.0002) = 0.0004
    expect(cost).toBeCloseTo(0.0004);
  });
});

describe('estimateMonthlyCosts', () => {
  it('returns empty when no tracking', () => {
    expect(estimateMonthlyCosts()).toEqual([]);
  });

  it('returns services with costs', () => {
    trackApiUsage('perplexity', undefined, 0.05);
    const costs = estimateMonthlyCosts();
    expect(costs).toHaveLength(1);
    expect(costs[0].service).toBe('perplexity');
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
    trackApiUsage('perplexity', undefined, 0.05);
    expect(() => logDailyUsageSummary()).not.toThrow();
  });
});

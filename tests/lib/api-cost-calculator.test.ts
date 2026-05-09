import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  calculateServiceCost,
  calculateMonthlyCost,
  predictLimitDate,
  generateCostRecommendations,
  PRICING,
  BUDGET,
} from '@/lib/api/api-cost-calculator';
import { getMonthlyUsage, getHistoricalUsage } from '@/lib/api/api-usage-tracker';
import type { MonthlyUsageAggregate } from '@/lib/api/api-usage-tracker';

// Mock the api-usage-tracker module (async functions used by calculateMonthlyCost)
vi.mock('@/lib/api/api-usage-tracker', () => ({
  getMonthlyUsage: vi.fn(),
  getHistoricalUsage: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

function makeUsage(overrides: Partial<MonthlyUsageAggregate> = {}): MonthlyUsageAggregate {
  return {
    service: 'test',
    month: '2026-04',
    totalRequests: 100,
    totalCost: 0,
    totalTokens: 0,
    avgDuration: 50,
    daysActive: 10,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// calculateServiceCost — per-service branches
// ---------------------------------------------------------------------------

describe('calculateServiceCost', () => {
  describe('resend', () => {
    it('stays on free tier within limit', () => {
      const usage = makeUsage({ service: 'resend', totalRequests: 1000 });
      const result = calculateServiceCost('resend', usage);

      expect(result.estimatedCost).toBe(0);
      expect(result.tier).toBe('free');
      expect(result.breakdown).toContain('1000/3000');
    });

    it('calculates pro tier cost for overage', () => {
      const usage = makeUsage({ service: 'resend', totalRequests: 55_000 });
      const result = calculateServiceCost('resend', usage);

      expect(result.tier).toBe('pro');
      expect(result.estimatedCost).toBeGreaterThan(20); // base $20 + overage
    });
  });

  describe('free services', () => {
    it.each(['semanticScholar', 'github', 'inngest'] as const)(
      '%s returns free tier',
      (service) => {
        const usage = makeUsage({ service, totalRequests: 42 });
        const result = calculateServiceCost(service, usage);

        expect(result.estimatedCost).toBe(0);
        expect(result.tier).toBe('free');
        expect(result.withinBudget).toBe(true);
      }
    );
  });

  describe('redis', () => {
    it('stays on free tier when within daily limit', () => {
      // 10k commands/day * 10 days active = 100k total
      const usage = makeUsage({ service: 'redis', totalRequests: 50_000, daysActive: 10 });
      const result = calculateServiceCost('redis', usage);

      expect(result.estimatedCost).toBe(0);
      expect(result.tier).toBe('free');
    });

    it('calculates pay-as-you-go for excess commands', () => {
      // 10k/day * 10 days = 100k free. 200k total means 100k excess
      const usage = makeUsage({ service: 'redis', totalRequests: 200_000, daysActive: 10 });
      const result = calculateServiceCost('redis', usage);

      expect(result.tier).toBe('pay-as-you-go');
      expect(result.estimatedCost).toBeGreaterThan(0);
      // 100k excess / 100k * $0.20 = $0.20
      expect(result.estimatedCost).toBeCloseTo(0.2);
    });
  });

  describe('sentry', () => {
    it('stays on developer tier within limit', () => {
      const usage = makeUsage({ service: 'sentry', totalRequests: 3000 });
      const result = calculateServiceCost('sentry', usage);

      expect(result.estimatedCost).toBe(0);
      expect(result.tier).toBe('developer');
    });

    it('reports team tier when over developer limit', () => {
      const usage = makeUsage({ service: 'sentry', totalRequests: 10_000 });
      const result = calculateServiceCost('sentry', usage);

      expect(result.estimatedCost).toBe(26);
      expect(result.tier).toBe('team');
    });

    it('reports over limit when exceeding team tier', () => {
      const usage = makeUsage({ service: 'sentry', totalRequests: 60_000 });
      const result = calculateServiceCost('sentry', usage);

      expect(result.tier).toBe('team (over limit)');
      expect(result.withinBudget).toBe(false);
    });
  });

  describe('unknown service', () => {
    it('returns default fallback', () => {
      const usage = makeUsage({ service: 'unknown' });
      // Cast to bypass type checking for the unknown branch
      const result = calculateServiceCost('unknown' as any, usage);

      expect(result.estimatedCost).toBe(0);
      expect(result.tier).toBe('unknown');
    });
  });
});

// ---------------------------------------------------------------------------
// PRICING / BUDGET constants
// ---------------------------------------------------------------------------

describe('PRICING constants', () => {
  it('has all expected services', () => {
    expect(Object.keys(PRICING)).toEqual(
      expect.arrayContaining(['resend', 'semanticScholar', 'github', 'redis', 'sentry', 'inngest'])
    );
  });
});

describe('BUDGET constants', () => {
  it('total equals sum of individual budgets', () => {
    const { total, ...services } = BUDGET;
    const sum = Object.values(services).reduce<number>((a, b) => a + b, 0);
    expect(sum).toBe(total);
  });
});

// ---------------------------------------------------------------------------
// calculateMonthlyCost
// ---------------------------------------------------------------------------

describe('calculateMonthlyCost', () => {
  beforeEach(() => {
    vi.mocked(getMonthlyUsage).mockReset();
  });

  it('aggregates costs across services', async () => {
    vi.mocked(getMonthlyUsage).mockImplementation(async (service: string) => {
      if (service === 'resend') return makeUsage({ service: 'resend', totalRequests: 55_000 });
      if (service === 'sentry') return makeUsage({ service: 'sentry', totalRequests: 12_000 });
      return null;
    });

    const result = await calculateMonthlyCost();
    expect(result.services.length).toBeGreaterThanOrEqual(2);
    expect(result.totalCost).toBeGreaterThan(0);
    expect(result.totalBudget).toBe(BUDGET.total);
    expect(typeof result.percentUsed).toBe('number');
    expect(typeof result.withinBudget).toBe('boolean');
  });

  it('handles no usage data', async () => {
    vi.mocked(getMonthlyUsage).mockResolvedValue(null);

    const result = await calculateMonthlyCost();
    expect(result.services).toHaveLength(0);
    expect(result.totalCost).toBe(0);
    expect(result.withinBudget).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// predictLimitDate
// ---------------------------------------------------------------------------

describe('predictLimitDate', () => {
  beforeEach(() => {
    vi.mocked(getHistoricalUsage).mockReset();
  });

  it('returns null prediction with no history', async () => {
    vi.mocked(getHistoricalUsage).mockResolvedValue([]);

    const result = await predictLimitDate('resend');
    expect(result.daysUntilLimit).toBeNull();
    expect(result.estimatedDate).toBeNull();
    expect(result.confidence).toBe('low');
  });

  it('predicts based on historical usage', async () => {
    vi.mocked(getHistoricalUsage).mockResolvedValue([
      { service: 'resend', date: '2026-04-01', count: 10, estimatedCost: 0 },
      { service: 'resend', date: '2026-04-02', count: 15, estimatedCost: 0 },
      { service: 'resend', date: '2026-04-03', count: 20, estimatedCost: 0 },
    ]);

    const result = await predictLimitDate('resend');
    expect(result.averageDailyUsage).toBeGreaterThan(0);
    expect(result.currentUsage).toBe(20);
    expect(result.limit).toBeGreaterThan(0);
    expect(['high', 'medium', 'low']).toContain(result.confidence);
  });
});

// ---------------------------------------------------------------------------
// generateCostRecommendations
// ---------------------------------------------------------------------------

describe('generateCostRecommendations', () => {
  beforeEach(() => {
    vi.mocked(getMonthlyUsage).mockReset();
  });

  it('returns healthy message when all within budget', async () => {
    vi.mocked(getMonthlyUsage).mockResolvedValue(null);

    const result = await generateCostRecommendations();
    expect(result).toContain('✅ All services operating within budget and healthy limits');
  });

  it('returns warnings for over-budget services', async () => {
    vi.mocked(getMonthlyUsage).mockImplementation(async (service: string) => {
      if (service === 'sentry')
        return makeUsage({
          service: 'sentry',
          totalRequests: 60_000, // exceeds team tier max (50k)
        });
      return null;
    });

    const result = await generateCostRecommendations();
    expect(result.some((r) => r.includes('❌'))).toBe(true);
  });
});

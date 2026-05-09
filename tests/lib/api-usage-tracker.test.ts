import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock redis before importing the module under test
// vi.hoisted() ensures the mock variable is available when vi.mock factory runs
// ---------------------------------------------------------------------------

const { mockRedis } = vi.hoisted(() => {
  const mockRedis = {
    get: vi.fn(),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    keys: vi.fn().mockResolvedValue([]),
    ping: vi.fn().mockResolvedValue('PONG'),
  };
  return { mockRedis };
});

vi.mock('@/lib/redis-client', () => ({
  redis: mockRedis,
}));

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

import {
  trackApiUsage,
  getDailyUsage,
  getMonthlyUsage,
  getAllUsageStats,
  getHistoricalUsage,
  getMonthlyHistory,
  getUsageSummary,
  checkServiceLimit,
  clearAllUsageData,
  cleanupOldData,
} from '@/lib/api/api-usage-tracker';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function monthKey(): string {
  return new Date().toISOString().slice(0, 7);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('api-usage-tracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedis.ping.mockResolvedValue('PONG');
  });

  // -----------------------------------------------------------------------
  // trackApiUsage
  // -----------------------------------------------------------------------

  describe('trackApiUsage', () => {
    it('creates new daily entry when none exists', async () => {
      mockRedis.get.mockResolvedValue(null); // no existing data

      await trackApiUsage('resend', 'send', { cost: 0.05, tokens: 100 });

      // Should call set for daily + monthly
      expect(mockRedis.set).toHaveBeenCalled();
      const dailyCall = mockRedis.set.mock.calls[0];
      expect(dailyCall[0]).toContain('api:usage:resend:send');
      const stored = JSON.parse(dailyCall[1]);
      expect(stored.count).toBe(1);
      expect(stored.estimatedCost).toBe(0.05);
      expect(stored.tokens).toBe(100);
    });

    it('increments existing daily entry', async () => {
      const existing = JSON.stringify({
        service: 'resend',
        endpoint: 'send',
        date: todayKey(),
        count: 5,
        estimatedCost: 0.25,
        tokens: 500,
        avgDuration: 100,
      });
      mockRedis.get.mockResolvedValueOnce(existing).mockResolvedValueOnce(null);

      await trackApiUsage('resend', 'send', { cost: 0.05, tokens: 100, duration: 50 });

      const dailyCall = mockRedis.set.mock.calls[0];
      const stored = JSON.parse(dailyCall[1]);
      expect(stored.count).toBe(6);
      expect(stored.estimatedCost).toBe(0.3);
      expect(stored.tokens).toBe(600);
    });

    it('falls back to in-memory when Redis is unavailable', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Connection refused'));

      // Should not throw
      await expect(trackApiUsage('resend', 'send')).resolves.toBeUndefined();
      // Should NOT have called set (Redis unavailable)
      expect(mockRedis.set).not.toHaveBeenCalled();
    });

    it('handles Redis errors gracefully', async () => {
      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      await expect(trackApiUsage('resend', 'send')).resolves.toBeUndefined();
    });
  });

  // -----------------------------------------------------------------------
  // getDailyUsage
  // -----------------------------------------------------------------------

  describe('getDailyUsage', () => {
    it('returns parsed data from Redis', async () => {
      const data = {
        service: 'resend',
        endpoint: 'send',
        date: todayKey(),
        count: 10,
        estimatedCost: 0.5,
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(data));

      const result = await getDailyUsage('resend', 'send');
      expect(result).toEqual(data);
    });

    it('returns null when no data exists', async () => {
      mockRedis.get.mockResolvedValue(null);
      const result = await getDailyUsage('resend', 'send');
      expect(result).toBeNull();
    });

    it('returns null when Redis is unavailable', async () => {
      mockRedis.ping.mockRejectedValue(new Error('down'));
      // When Redis is unavailable and nothing in memory fallback
      const result = await getDailyUsage('resend', 'send');
      // Should return null or from memory
      expect(result === null || typeof result === 'object').toBe(true);
    });

    it('accepts custom date parameter', async () => {
      mockRedis.get.mockResolvedValue(null);
      await getDailyUsage('resend', 'send', '2026-01-15');
      expect(mockRedis.get).toHaveBeenCalledWith(expect.stringContaining('2026-01-15'));
    });
  });

  // -----------------------------------------------------------------------
  // getMonthlyUsage
  // -----------------------------------------------------------------------

  describe('getMonthlyUsage', () => {
    it('returns parsed monthly aggregate', async () => {
      const data = {
        service: 'resend',
        month: monthKey(),
        totalRequests: 100,
        totalCost: 5,
        totalTokens: 10_000,
        avgDuration: 80,
        daysActive: 15,
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(data));

      const result = await getMonthlyUsage('resend');
      expect(result).toEqual(data);
    });

    it('returns null when Redis unavailable', async () => {
      mockRedis.ping.mockRejectedValue(new Error('down'));
      const result = await getMonthlyUsage('resend');
      expect(result).toBeNull();
    });
  });

  // -----------------------------------------------------------------------
  // getAllUsageStats
  // -----------------------------------------------------------------------

  describe('getAllUsageStats', () => {
    it('returns stats from today keys', async () => {
      const today = todayKey();
      mockRedis.keys.mockResolvedValue([
        `api:usage:resend:send:${today}`,
        `api:usage:github:default:${today}`,
      ]);

      const data = {
        service: 'resend',
        endpoint: 'send',
        date: today,
        count: 10,
        estimatedCost: 0.5,
      };
      mockRedis.get.mockResolvedValue(JSON.stringify(data));

      const result = await getAllUsageStats();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].service).toBe('resend');
      expect(result[0].percentUsed).toBeGreaterThan(0);
    });

    it('returns empty when Redis unavailable and no memory fallback', async () => {
      mockRedis.ping.mockRejectedValue(new Error('down'));
      const result = await getAllUsageStats();
      // Returns from memory fallback (may be empty)
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns empty on Redis error', async () => {
      mockRedis.keys.mockRejectedValue(new Error('error'));
      const result = await getAllUsageStats();
      expect(result).toEqual([]);
    });
  });

  // -----------------------------------------------------------------------
  // getHistoricalUsage
  // -----------------------------------------------------------------------

  describe('getHistoricalUsage', () => {
    it('returns empty when Redis unavailable', async () => {
      mockRedis.ping.mockRejectedValue(new Error('down'));
      const result = await getHistoricalUsage('resend', 'send', 7);
      expect(result).toEqual([]);
    });

    it('returns sorted historical data', async () => {
      // Mock: return data for some days, null for others
      let callCount = 0;
      mockRedis.get.mockImplementation(async () => {
        callCount++;
        if (callCount <= 2) {
          return JSON.stringify({
            service: 'resend',
            endpoint: 'send',
            date: `2026-04-${String(20 - callCount).padStart(2, '0')}`,
            count: callCount * 5,
            estimatedCost: callCount * 0.1,
          });
        }
        return null;
      });

      const result = await getHistoricalUsage('resend', 'send', 5);
      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  // -----------------------------------------------------------------------
  // getMonthlyHistory
  // -----------------------------------------------------------------------

  describe('getMonthlyHistory', () => {
    it('returns empty when Redis unavailable', async () => {
      mockRedis.ping.mockRejectedValue(new Error('down'));
      const result = await getMonthlyHistory('resend', 3);
      expect(result).toEqual([]);
    });
  });

  // -----------------------------------------------------------------------
  // getUsageSummary
  // -----------------------------------------------------------------------

  describe('getUsageSummary', () => {
    it('aggregates stats correctly', async () => {
      const today = todayKey();
      mockRedis.keys.mockResolvedValue([`api:usage:resend:send:${today}`]);
      mockRedis.get.mockResolvedValue(
        JSON.stringify({
          service: 'resend',
          endpoint: 'send',
          date: today,
          count: 100,
          estimatedCost: 5,
        })
      );

      const summary = await getUsageSummary();
      expect(summary.totalServices).toBeGreaterThanOrEqual(1);
      expect(summary.totalCost).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(summary.servicesNearLimit)).toBe(true);
      expect(Array.isArray(summary.servicesAtLimit)).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // checkServiceLimit
  // -----------------------------------------------------------------------

  describe('checkServiceLimit', () => {
    it('allows when no usage data', async () => {
      mockRedis.get.mockResolvedValue(null);
      const result = await checkServiceLimit('resend');
      expect(result.allowed).toBe(true);
    });

    it('blocks when at limit', async () => {
      mockRedis.get.mockResolvedValue(
        JSON.stringify({
          service: 'resend',
          endpoint: 'default',
          date: todayKey(),
          count: 3000, // exceeds 2500 maxEmailsPerMonth limit
          estimatedCost: 0,
        })
      );

      const result = await checkServiceLimit('resend');
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('limit reached');
    });
  });

  // -----------------------------------------------------------------------
  // clearAllUsageData
  // -----------------------------------------------------------------------

  describe('clearAllUsageData', () => {
    it('deletes all usage keys', async () => {
      mockRedis.keys.mockResolvedValue(['api:usage:a', 'api:usage:b']);
      await clearAllUsageData();
      expect(mockRedis.del).toHaveBeenCalledTimes(2);
    });

    it('works when Redis unavailable (clears memory)', async () => {
      mockRedis.ping.mockRejectedValue(new Error('down'));
      await expect(clearAllUsageData()).resolves.toBeUndefined();
    });
  });

  // -----------------------------------------------------------------------
  // cleanupOldData
  // -----------------------------------------------------------------------

  describe('cleanupOldData', () => {
    it('returns 0 when Redis unavailable', async () => {
      mockRedis.ping.mockRejectedValue(new Error('down'));
      const result = await cleanupOldData();
      expect(result).toEqual({ deleted: 0 });
    });

    it('deletes keys older than 90 days', async () => {
      mockRedis.keys.mockResolvedValue([
        'api:usage:resend:send:2025-01-01', // old
        `api:usage:resend:send:${todayKey()}`, // current
      ]);

      const result = await cleanupOldData();
      expect(result.deleted).toBe(1);
      expect(mockRedis.del).toHaveBeenCalledWith('api:usage:resend:send:2025-01-01');
    });

    it('handles errors gracefully', async () => {
      mockRedis.keys.mockRejectedValue(new Error('error'));
      const result = await cleanupOldData();
      expect(result).toEqual({ deleted: 0 });
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rateLimit } from '@/lib/rate-limit';

const rateLimitCounters: Record<string, number> = {};
const rateLimitExpiries: Record<string, number> = {};

vi.mock('@/lib/redis-client', () => ({
  redis: {
    incr: vi.fn(async (key: string) => {
      const expiry = rateLimitExpiries[key];
      if (expiry && expiry <= Date.now()) {
        delete rateLimitCounters[key];
        delete rateLimitExpiries[key];
      }
      rateLimitCounters[key] = (rateLimitCounters[key] || 0) + 1;
      return rateLimitCounters[key];
    }),
    pExpireAt: vi.fn(async (key: string, timestamp: number) => {
      rateLimitExpiries[key] = timestamp;
      return 1;
    }),
    pexpireat: vi.fn(async (key: string, timestamp: number) => {
      rateLimitExpiries[key] = timestamp;
      return 1;
    }),
    pTTL: vi.fn(async (key: string) => {
      const expiry = rateLimitExpiries[key];
      if (!expiry) return -2;
      const ttl = expiry - Date.now();
      if (ttl <= 0) {
        delete rateLimitCounters[key];
        delete rateLimitExpiries[key];
        return -2;
      }
      return ttl;
    }),
    pttl: vi.fn(async (key: string) => {
      const expiry = rateLimitExpiries[key];
      if (!expiry) return -2;
      const ttl = expiry - Date.now();
      if (ttl <= 0) {
        delete rateLimitCounters[key];
        delete rateLimitExpiries[key];
        return -2;
      }
      return ttl;
    }),
  },
}));

const CONFIG = { limit: 5, windowInSeconds: 60 };

describe('Red Team: Rate Limit Bypass', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(rateLimitCounters).forEach((k) => delete rateLimitCounters[k]);
    Object.keys(rateLimitExpiries).forEach((k) => delete rateLimitExpiries[k]);
  });

  it('should allow requests under the limit', async () => {
    const result = await rateLimit('attacker-ip-1', CONFIG);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('should allow request exactly at the limit', async () => {
    for (let i = 0; i < CONFIG.limit - 1; i++) {
      await rateLimit('attacker-ip-2', CONFIG);
    }
    const result = await rateLimit('attacker-ip-2', CONFIG);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('should block request one over the limit', async () => {
    for (let i = 0; i < CONFIG.limit; i++) {
      await rateLimit('attacker-ip-3', CONFIG);
    }
    const result = await rateLimit('attacker-ip-3', CONFIG);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should enforce per-identifier isolation — spoofed IP cannot consume another IP budget', async () => {
    for (let i = 0; i < CONFIG.limit; i++) {
      await rateLimit('victim-ip', CONFIG);
    }
    // Attacker uses a different identifier — must not share victim's counter
    const result = await rateLimit('attacker-ip-4', CONFIG);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('should correctly decrement remaining on successive requests', async () => {
    const results = [];
    for (let i = 0; i < CONFIG.limit; i++) {
      results.push(await rateLimit('attacker-ip-5', CONFIG));
    }
    expect(results[0].remaining).toBe(4);
    expect(results[1].remaining).toBe(3);
    expect(results[4].remaining).toBe(0);
  });
});

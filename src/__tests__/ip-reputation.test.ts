/**
 * IP Reputation System Tests
 *
 * Tests for GreyNoise integration and IP reputation functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IPReputationService, GreyNoiseClient } from '@/lib/ip-reputation';
import { BlockedIPsManager, isIPBlocked, isIPSuspicious } from '@/lib/blocked-ips';
import { rateLimitWithProtection, getClientIp } from '@/lib/rate-limit';

// Mock the Upstash redis singleton with in-memory behavior for tests
const hashes: Record<string, Record<string, string>> = {};
const lists: Record<string, string[]> = {};

vi.mock('@/lib/redis-client', () => ({
  redis: {
    get: vi.fn(async (k: string) => null),
    set: vi.fn(async () => null),
    setex: vi.fn(async () => null),
    hset: vi.fn(
      async (key: string, fieldOrHash: string | Record<string, string>, value?: string) => {
        hashes[key] ||= {};
        if (typeof fieldOrHash === 'string' && value !== undefined) {
          // hset(key, field, value)
          hashes[key][fieldOrHash] = value;
        } else if (typeof fieldOrHash === 'object') {
          // hset(key, { field: value, ... })
          Object.assign(hashes[key], fieldOrHash);
        }
        return 1;
      }
    ),
    hget: vi.fn(async (key: string, field: string) => {
      if (!hashes[key]) return null;
      return hashes[key][field] ?? null;
    }),
    hexists: vi.fn(async (key: string, field: string) => {
      if (!hashes[key]) return 0;
      return hashes[key][field] ? 1 : 0;
    }),
    hgetall: vi.fn(async (key: string) => {
      return hashes[key] ?? {};
    }),
    hdel: vi.fn(async (key: string, field: string) => {
      if (!hashes[key] || !hashes[key][field]) return 0;
      delete hashes[key][field];
      return 1;
    }),
    lpush: vi.fn(async (key: string, value: string) => {
      lists[key] ||= [];
      lists[key].unshift(value);
      return lists[key].length;
    }),
    expire: vi.fn(async () => 1),
    incr: vi.fn(async () => 1),
    pexpireat: vi.fn(async () => 1),
    pttl: vi.fn(async () => 60000),
  },
}));

// Mock environment variables
process.env.GREYNOISE_API_KEY = 'test-api-key';

describe('GreyNoise Client', () => {
  let client: GreyNoiseClient;

  beforeEach(() => {
    // Reset in-memory stores
    Object.keys(hashes).forEach((key) => delete hashes[key]);
    Object.keys(lists).forEach((key) => delete lists[key]);

    client = new GreyNoiseClient('test-api-key');
    global.fetch = vi.fn();
  });

  it('should handle malicious IP classification', async () => {
    const mockResponse = {
      ip: '1.2.3.4',
      seen: true,
      classification: 'malicious',
      tags: ['scanner', 'botnet'],
      metadata: {
        country: 'US',
        organization: 'Example ISP',
      },
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await client.getIpContext('1.2.3.4');
    expect(result.classification).toBe('malicious');
    expect(result.tags).toContain('scanner');
  });

  it('should handle RIOT benign classification', async () => {
    const mockRiotResponse = {
      ip: '8.8.8.8',
      riot: true,
      category: 'public_dns',
      name: 'Google Public DNS',
      trust_level: 1,
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockRiotResponse,
    });

    const result = await client.riotCheck('8.8.8.8');
    expect(result.riot).toBe(true);
    expect(result.category).toBe('public_dns');
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
    });

    await expect(client.getIpContext('1.2.3.4')).rejects.toThrow(
      'GreyNoise API error: 429 Too Many Requests'
    );
  });
});

describe('IP Reputation Service', () => {
  let service: IPReputationService;

  beforeEach(async () => {
    service = new IPReputationService('test-api-key');
    // TODO: initialize() method removed with Upstash migration
    // await service.initialize();
  });

  it('should classify malicious IPs correctly', async () => {
    const mockGreynoiseData = {
      ip: '1.2.3.4',
      classification: 'malicious' as const,
      seen: true,
      tags: ['botnet', 'malware'],
      first_seen: '2024-01-01T00:00:00Z',
      last_seen: '2024-12-14T12:00:00Z',
      metadata: {
        country: 'RU',
        organization: 'Evil Corp',
      },
    };

    // Mock GreyNoise API calls
    vi.spyOn(service['greynoiseClient'], 'getIpContext').mockResolvedValue(mockGreynoiseData);
    vi.spyOn(service['greynoiseClient'], 'riotCheck').mockRejectedValue(new Error('Not in RIOT'));

    const result = await service.getIpReputation('1.2.3.4', false);

    expect(result.is_malicious).toBe(true);
    expect(result.should_block).toBe(true);
    expect(result.confidence).toBeGreaterThan(80);
    expect(result.details?.classification).toBe('malicious');
  });

  it('should handle bulk IP checks efficiently', async () => {
    const ips = ['1.1.1.1', '8.8.8.8', '1.2.3.4'];

    // Mock individual IP checks
    vi.spyOn(service, 'getIpReputation')
      .mockResolvedValueOnce({
        // 1.1.1.1 - benign
        ip: '1.1.1.1',
        is_malicious: false,
        is_suspicious: false,
        is_benign: true,
        should_block: false,
        should_rate_limit: false,
        confidence: 95,
        sources: ['greynoise'],
        details: null,
        cache_hit: false,
        checked_at: new Date().toISOString(),
      })
      .mockResolvedValueOnce({
        // 8.8.8.8 - benign
        ip: '8.8.8.8',
        is_malicious: false,
        is_suspicious: false,
        is_benign: true,
        should_block: false,
        should_rate_limit: false,
        confidence: 95,
        sources: ['greynoise'],
        details: null,
        cache_hit: false,
        checked_at: new Date().toISOString(),
      })
      .mockResolvedValueOnce({
        // 1.2.3.4 - malicious
        ip: '1.2.3.4',
        is_malicious: true,
        is_suspicious: false,
        is_benign: false,
        should_block: true,
        should_rate_limit: true,
        confidence: 90,
        sources: ['greynoise'],
        details: null,
        cache_hit: false,
        checked_at: new Date().toISOString(),
      });

    const result = await service.bulkCheckReputation(ips);

    expect(result.total_checked).toBe(3);
    expect(result.malicious_count).toBe(1);
    expect(result.benign_count).toBe(2);
    expect(result.processing_time_ms).toBeGreaterThanOrEqual(0);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Blocked IPs Manager', () => {
  let manager: BlockedIPsManager;

  beforeEach(async () => {
    manager = new BlockedIPsManager();
    // TODO: initialize() method removed with Upstash migration
    // await manager.initialize();
  });

  it('should block malicious IPs', async () => {
    await manager.blockIP('1.2.3.4', 'malicious', 'greynoise', {
      confidence_score: 90,
      metadata: {
        country: 'RU',
        tags: ['botnet'],
      },
    });

    const isBlocked = await manager.isBlocked('1.2.3.4');
    expect(isBlocked.is_blocked).toBe(true);
    expect(isBlocked.reason).toBe('malicious');
  });

  it('should handle temporary blocks', async () => {
    const futureTime = new Date(Date.now() + 3600000); // 1 hour from now

    await manager.blockIP('5.6.7.8', 'suspicious', 'manual', {
      temporary_hours: 1,
    });

    const isBlocked = await manager.isBlocked('5.6.7.8');
    expect(isBlocked.is_blocked).toBe(true);
    expect(isBlocked.blocked_until).toBeDefined();
  });

  it('should provide blocking statistics', async () => {
    // Add some test data
    await manager.blockIP('1.1.1.1', 'malicious', 'greynoise');
    await manager.blockIP('2.2.2.2', 'suspicious', 'manual');
    await manager.markSuspicious('3.3.3.3', 'honeypot');

    const stats = await manager.getBlockStats();
    expect(stats.total_blocked).toBeGreaterThan(0);
    expect(stats.malicious_count).toBeGreaterThan(0);
  });
});

import * as BlockedIpsModule from '@/lib/blocked-ips';

describe('Rate Limiting with Reputation', () => {
  it('should apply different limits based on IP reputation', async () => {
    const mockRequest = {
      headers: {
        get: (name: string) => {
          if (name === 'x-forwarded-for') return '1.2.3.4';
          return null;
        },
      },
    } as any;

    // Mock IP reputation checks
    vi.spyOn(BlockedIpsModule, 'isIPBlocked').mockResolvedValue(false as any);
    vi.spyOn(BlockedIpsModule, 'isIPSuspicious').mockResolvedValue(true as any);

    const result = await rateLimitWithProtection(mockRequest, {
      standard: { limit: 100, windowInSeconds: 300 },
      suspicious: { limit: 10, windowInSeconds: 300 },
    });

    expect(result.reputation?.is_suspicious).toBe(true);
    expect(result.reputation?.classification).toBe('suspicious');
    expect(result.limit).toBe(10); // Should use suspicious limits
  });

  it('should block requests from blocked IPs', async () => {
    const mockRequest = {
      headers: {
        get: (name: string) => {
          if (name === 'x-forwarded-for') return '1.2.3.4';
          return null;
        },
      },
    } as any;

    // Mock blocked IP
    vi.spyOn(BlockedIpsModule, 'isIPBlocked').mockResolvedValue(true as any);
    vi.spyOn(BlockedIpsModule, 'isIPSuspicious').mockResolvedValue(false as any);

    const result = await rateLimitWithProtection(mockRequest);

    expect(result.success).toBe(false);
    expect(result.reputation?.is_blocked).toBe(true);
    expect(result.limit).toBe(0);
  });
});

describe('IP Helper Functions', () => {
  it('should extract client IP from headers', () => {
    const mockRequest = {
      headers: {
        get: (name: string) => {
          if (name === 'x-forwarded-for') return '1.2.3.4, 5.6.7.8';
          return null;
        },
      },
    } as any;

    const ip = getClientIp(mockRequest);
    expect(ip).toBe('1.2.3.4'); // Should get first IP from forwarded-for
  });

  it('should handle missing headers gracefully', () => {
    const mockRequest = {
      headers: {
        get: () => null,
      },
    } as any;

    const ip = getClientIp(mockRequest);
    expect(ip).toBe('unknown');
  });
});

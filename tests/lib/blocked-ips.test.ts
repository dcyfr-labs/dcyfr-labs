import { describe, it, expect, beforeEach, vi } from 'vitest';
import { redis } from '@/lib/redis-client';

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  addBreadcrumb: vi.fn(),
}));

// Mock vercel-waf-client
vi.mock('@/lib/vercel-waf-client', () => ({
  getVercelWAFClient: vi.fn(() => null),
}));

import { BlockedIPsManager, type BlockedIPEntry } from '@/lib/blocked-ips';

describe('BlockedIPsManager', () => {
  let manager: BlockedIPsManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new BlockedIPsManager();
  });

  describe('isBlocked', () => {
    it('returns not blocked when IP not found', async () => {
      vi.mocked(redis.hGet).mockResolvedValueOnce(null);
      const result = await manager.isBlocked('1.2.3.4');
      expect(result.is_blocked).toBe(false);
    });

    it('returns blocked with entry data', async () => {
      const entry: BlockedIPEntry = {
        ip: '1.2.3.4',
        reason: 'malicious',
        blocked_at: new Date().toISOString(),
        source: 'greynoise',
        confidence_score: 95,
        request_count_when_blocked: 100,
      };
      vi.mocked(redis.hGet).mockResolvedValueOnce(JSON.stringify(entry));
      const result = await manager.isBlocked('1.2.3.4');
      expect(result.is_blocked).toBe(true);
      expect(result.reason).toBe('malicious');
      expect(result.entry?.confidence_score).toBe(95);
    });

    it('unblocks expired temporary blocks', async () => {
      const entry: BlockedIPEntry = {
        ip: '1.2.3.4',
        reason: 'suspicious',
        blocked_at: new Date(Date.now() - 86400000).toISOString(),
        blocked_until: new Date(Date.now() - 3600000).toISOString(), // expired 1h ago
        source: 'rate-limit',
        confidence_score: 60,
        request_count_when_blocked: 50,
      };
      vi.mocked(redis.hGet).mockResolvedValueOnce(JSON.stringify(entry));
      // Mock the unblockIP chain
      vi.mocked(redis.hDel).mockResolvedValueOnce(1);
      vi.mocked(redis.lPush).mockResolvedValueOnce(1);

      const result = await manager.isBlocked('1.2.3.4');
      expect(result.is_blocked).toBe(false);
    });

    it('returns not blocked on Redis error (fail-open)', async () => {
      vi.mocked(redis.hGet).mockRejectedValueOnce(new Error('conn'));
      const result = await manager.isBlocked('1.2.3.4');
      expect(result.is_blocked).toBe(false);
    });
  });

  describe('blockIP', () => {
    it('stores entry in Redis', async () => {
      vi.mocked(redis.hSet).mockResolvedValueOnce(1);
      vi.mocked(redis.lPush).mockResolvedValueOnce(1);
      vi.mocked(redis.expire).mockResolvedValue(1);

      await manager.blockIP('5.6.7.8', 'malicious', 'greynoise', {
        confidence_score: 90,
        request_count: 200,
      });

      expect(redis.hSet).toHaveBeenCalledWith(
        'security:blocked-ips',
        '5.6.7.8',
        expect.stringContaining('"reason":"malicious"')
      );
    });

    it('stores temporary block with expiry', async () => {
      vi.mocked(redis.hSet).mockResolvedValueOnce(1);
      vi.mocked(redis.lPush).mockResolvedValueOnce(1);
      vi.mocked(redis.expire).mockResolvedValue(1);

      await manager.blockIP('5.6.7.8', 'suspicious', 'rate-limit', {
        temporary_hours: 24,
      });

      expect(redis.hSet).toHaveBeenCalledWith(
        'security:blocked-ips',
        '5.6.7.8',
        expect.stringContaining('"blocked_until"')
      );
    });
  });

  describe('unblockIP', () => {
    it('removes from Redis and logs history', async () => {
      vi.mocked(redis.hDel).mockResolvedValueOnce(1);
      vi.mocked(redis.lPush).mockResolvedValueOnce(1);

      await manager.unblockIP('1.2.3.4', 'manual');
      expect(redis.hDel).toHaveBeenCalledWith('security:blocked-ips', '1.2.3.4');
      expect(redis.lPush).toHaveBeenCalled();
    });

    it('does nothing when IP not found', async () => {
      vi.mocked(redis.hDel).mockResolvedValueOnce(0);
      await manager.unblockIP('1.2.3.4', 'manual');
      expect(redis.lPush).not.toHaveBeenCalled();
    });
  });

  describe('markSuspicious', () => {
    it('stores suspicious entry', async () => {
      vi.mocked(redis.hSet).mockResolvedValueOnce(1);
      vi.mocked(redis.expire).mockResolvedValue(1);

      await manager.markSuspicious('9.8.7.6', 'rate-limit');
      expect(redis.hSet).toHaveBeenCalledWith(
        'security:suspicious-ips',
        '9.8.7.6',
        expect.stringContaining('"source":"rate-limit"')
      );
    });
  });

  describe('isSuspicious', () => {
    it('returns true when IP is suspicious', async () => {
      vi.mocked(redis.hExists).mockResolvedValueOnce(1 as any);
      expect(await manager.isSuspicious('1.2.3.4')).toBeTruthy();
    });

    it('returns false when IP is not suspicious', async () => {
      vi.mocked(redis.hExists).mockResolvedValueOnce(0 as any);
      expect(await manager.isSuspicious('1.2.3.4')).toBeFalsy();
    });

    it('returns false on error', async () => {
      vi.mocked(redis.hExists).mockRejectedValueOnce(new Error('fail'));
      expect(await manager.isSuspicious('1.2.3.4')).toBe(false);
    });
  });

  describe('getAllBlockedIPs', () => {
    it('returns parsed entries', async () => {
      const entries = {
        '1.1.1.1': JSON.stringify({ ip: '1.1.1.1', reason: 'malicious' }),
        '2.2.2.2': JSON.stringify({ ip: '2.2.2.2', reason: 'manual' }),
      };
      vi.mocked(redis.hGetAll).mockResolvedValueOnce(entries);
      const result = await manager.getAllBlockedIPs();
      expect(result).toHaveLength(2);
    });

    it('returns empty array on null', async () => {
      vi.mocked(redis.hGetAll).mockResolvedValueOnce(null as any);
      expect(await manager.getAllBlockedIPs()).toEqual([]);
    });

    it('returns empty array on error', async () => {
      vi.mocked(redis.hGetAll).mockRejectedValueOnce(new Error('fail'));
      expect(await manager.getAllBlockedIPs()).toEqual([]);
    });
  });

  describe('getBlockStats', () => {
    it('computes correct stats', async () => {
      const entries = {
        a: JSON.stringify({ ip: 'a', reason: 'malicious' }),
        b: JSON.stringify({ ip: 'b', reason: 'suspicious' }),
        c: JSON.stringify({ ip: 'c', reason: 'manual', blocked_until: '2099-01-01' }),
      };
      vi.mocked(redis.hGetAll).mockResolvedValueOnce(entries);
      const stats = await manager.getBlockStats();
      expect(stats.total_blocked).toBe(3);
      expect(stats.malicious_count).toBe(1);
      expect(stats.suspicious_count).toBe(1);
      expect(stats.manual_count).toBe(1);
      expect(stats.temporary_count).toBe(1);
      expect(stats.permanent_count).toBe(2);
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkIpDeduplication } from '@/lib/engagement-analytics';

const dedupStore: Record<string, string> = {};

vi.mock('@/lib/redis-client', () => ({
  redis: {
    get: vi.fn(async (key: string) => dedupStore[key] ?? null),
    set: vi.fn(async (key: string, value: string) => {
      dedupStore[key] = value;
      return 'OK';
    }),
    // rate-limit functions (not exercised here but imported transitively)
    incr: vi.fn(async () => 1),
    pExpireAt: vi.fn(async () => 1),
    pexpireat: vi.fn(async () => 1),
    pTTL: vi.fn(async () => -2),
    pttl: vi.fn(async () => -2),
  },
}));

describe('Red Team: IP Deduplication Bypass', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(dedupStore).forEach((k) => delete dedupStore[k]);
  });

  it('should return false (not duplicate) on first action from an IP', async () => {
    const isDup = await checkIpDeduplication('bookmark', 'post:hello-world', '1.2.3.4');
    expect(isDup).toBe(false);
  });

  it('should return true (duplicate) on second action from same IP within window', async () => {
    await checkIpDeduplication('bookmark', 'post:hello-world', '1.2.3.4');
    const isDup = await checkIpDeduplication('bookmark', 'post:hello-world', '1.2.3.4');
    expect(isDup).toBe(true);
  });

  it('should treat different IPs as independent — bypass attempt via IP rotation fails', async () => {
    await checkIpDeduplication('bookmark', 'post:hello-world', '1.2.3.4');
    // Attacker rotates IP — gets a fresh slot, but the first IP is still tracked
    const isDupRotated = await checkIpDeduplication('bookmark', 'post:hello-world', '5.6.7.8');
    expect(isDupRotated).toBe(false);
    // Original IP is still deduplicated
    const isDupOriginal = await checkIpDeduplication('bookmark', 'post:hello-world', '1.2.3.4');
    expect(isDupOriginal).toBe(true);
  });

  it('should return false for unknown IP (fail-open, not a bypass)', async () => {
    const isDup = await checkIpDeduplication('bookmark', 'post:hello-world', 'unknown');
    expect(isDup).toBe(false);
  });
});

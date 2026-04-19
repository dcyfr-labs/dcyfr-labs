import { describe, it, expect, beforeEach, vi } from 'vitest';
import { redis } from '@/lib/redis-client';

// Must unmock redis-client to use our own mock in this file
vi.unmock('@/lib/redis-client');

// Mock the entire secure-session-manager module's Redis dependency
vi.mock('@/lib/redis-client', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
  },
}));

// Mock crypto module for deterministic tests
const mockRandomBytes = vi.fn();
vi.mock('crypto', async () => {
  const actual = await vi.importActual<typeof import('crypto')>('crypto');
  return {
    ...actual,
    randomBytes: (size: number) => {
      if (mockRandomBytes.mock.calls.length > 0) {
        return mockRandomBytes(size);
      }
      return actual.randomBytes(size);
    },
  };
});

describe('SecureSessionManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('SESSION_ENCRYPTION_KEY', 'test-encryption-key-32-bytes-long');
    vi.stubEnv('REDIS_URL', 'redis://:token@localhost:6379');
  });

  // Import dynamically to pick up mocked environment
  async function getManager() {
    // Clear module cache to re-evaluate with new env
    vi.resetModules();
    // Re-mock redis-client for the fresh import
    vi.doMock('@/lib/redis-client', () => ({
      redis: {
        get: vi.fn(),
        set: vi.fn(),
        setex: vi.fn(),
        del: vi.fn(),
        keys: vi.fn(),
      },
    }));
    const mod = await import('@/lib/secure-session-manager');
    return mod.SecureSessionManager;
  }

  describe('generateSessionToken', () => {
    it('returns a base64url string', async () => {
      const SSM = await getManager();
      const token = SSM.generateSessionToken();
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(20);
    });

    it('generates unique tokens', async () => {
      const SSM = await getManager();
      const t1 = SSM.generateSessionToken();
      const t2 = SSM.generateSessionToken();
      expect(t1).not.toBe(t2);
    });
  });

  describe('generateCSRFToken', () => {
    it('returns a base64url string', async () => {
      const SSM = await getManager();
      const token = SSM.generateCSRFToken();
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(10);
    });
  });

  describe('encryption round-trip', () => {
    it('encrypt then decrypt returns original data', async () => {
      const SSM = await getManager();
      // Access private methods via bracket notation for testing
      const data = JSON.stringify({ userId: 'test', email: 'test@example.com' });
      const encrypted = (SSM as any).encrypt(data);
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('authTag');
      expect(encrypted).toHaveProperty('encrypted');
      expect(encrypted.encrypted).not.toBe(data);

      const decrypted = (SSM as any).decrypt(encrypted);
      expect(decrypted).toBe(data);
    });

    it('throws when encryption key is missing', async () => {
      vi.stubEnv('SESSION_ENCRYPTION_KEY', '');
      const SSM = await getManager();
      expect(() => (SSM as any).getEncryptionKey()).toThrow(
        'SESSION_ENCRYPTION_KEY not configured'
      );
    });
  });
});

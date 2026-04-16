import '@testing-library/jest-dom';
import { cleanup, configure } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './msw-handlers';

/**
 * MSW (MOCK SERVICE WORKER) SETUP
 * Intercepts network requests during tests for reliable mocking
 *
 * @see https://mswjs.io/docs/getting-started/integrate/node
 */
const server = setupServer(...handlers);

// Start MSW server before any tests run
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

// Reset handlers between tests (but keep server running)
afterEach(() => {
  server.resetHandlers();
});

// Clean up after all tests
afterAll(() => {
  server.close();
});

/**
 * TESTING LIBRARY OPTIMIZATIONS
 * Reduces test setup time by configuring sensible defaults
 */

// Configure testing library for performance
// - asyncUtilTimeout: Timeout for async queries (prevents infinite waits)
// - getElementError: Faster error object creation without stack trace
configure({
  asyncUtilTimeout: 2000,
  getElementError: (message: string | null) => {
    const error = new Error(message ?? 'Element not found');
    error.name = 'TestingLibraryElementError';
    return error;
  },
});

// Clean up after each test (e.g., clearing jsdom)
// This runs automatically in parallel with next test's setup phase
afterEach(() => {
  cleanup();
  // Clear all mocks to prevent test pollution
  vi.clearAllMocks();
});

/**
 * ENVIRONMENT VARIABLES FOR TESTS
 * Ensures consistent test environment
 */
// NODE_ENV is set to 'test' via vitest.config.ts env option (overrides shell environment)
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';

/**
 * GLOBAL LOCALSTORAGE SHIM
 *
 * Some test files run in a Node environment via environmentMatchGlobs, while
 * others run in happy-dom. Ensure a consistent Storage-like API exists across
 * all workers to prevent cross-suite localStorage shape drift.
 */
const createLocalStorageShim = (): Storage => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  } as Storage;
};

const ensureLocalStorage = () => {
  const current = (globalThis as { localStorage?: Partial<Storage> }).localStorage;
  const hasMinimumStorageApi =
    current &&
    typeof current.getItem === 'function' &&
    typeof current.setItem === 'function' &&
    typeof current.clear === 'function';

  if (!hasMinimumStorageApi) {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageShim(),
      writable: true,
      configurable: true,
    });
  }
};

beforeAll(() => {
  ensureLocalStorage();
});

beforeEach(() => {
  ensureLocalStorage();
});

/**
 * REDIS CLIENT MOCK
 * Mock redis-client module to prevent actual Redis connections in tests
 */
vi.mock('@/lib/redis-client', () => ({
  redis: (() => {
    const hashStore: Record<string, Record<string, string>> = {};
    const listStore: Record<string, string[]> = {};
    const counters: Record<string, number> = {};
    const counterExpiries: Record<string, number> = {};

    const resetIfExpired = (key: string) => {
      const expiry = counterExpiries[key];
      if (expiry && expiry <= Date.now()) {
        delete counters[key];
        delete counterExpiries[key];
      }
    };

    const hSetImpl = async (
      key: string,
      fieldOrHash: string | Record<string, string>,
      value?: string
    ) => {
      hashStore[key] ||= {};
      if (typeof fieldOrHash === 'string' && value !== undefined) {
        hashStore[key][fieldOrHash] = value;
      } else if (typeof fieldOrHash === 'object') {
        Object.assign(hashStore[key], fieldOrHash);
      }
      return 1;
    };

    const hGetImpl = async (key: string, field: string) => hashStore[key]?.[field] ?? null;
    const hExistsImpl = async (key: string, field: string) => (hashStore[key]?.[field] ? 1 : 0);
    const hGetAllImpl = async (key: string) => hashStore[key] ?? {};
    const hDelImpl = async (key: string, field: string) => {
      if (!hashStore[key]?.[field]) return 0;
      delete hashStore[key][field];
      return 1;
    };
    const lPushImpl = async (key: string, value: string) => {
      listStore[key] ||= [];
      listStore[key].unshift(value);
      return listStore[key].length;
    };

    const pExpireAtImpl = async (key: string, timestamp: number) => {
      counterExpiries[key] = timestamp;
      return 1;
    };

    return {
      get: vi.fn(),
      set: vi.fn(),
      setex: vi.fn(),
      setEx: vi.fn(),
      del: vi.fn(),
      hSet: vi.fn(hSetImpl),
      hGet: vi.fn(hGetImpl),
      hExists: vi.fn(hExistsImpl),
      hGetAll: vi.fn(hGetAllImpl),
      hDel: vi.fn(hDelImpl),
      lPush: vi.fn(lPushImpl),
      expire: vi.fn(async () => 1),
      incr: vi.fn(async (key: string) => {
        resetIfExpired(key);
        counters[key] = (counters[key] || 0) + 1;
        return counters[key];
      }),
      pexpireat: vi.fn(pExpireAtImpl),
      pExpireAt: vi.fn(pExpireAtImpl),
      pttl: vi.fn(async (key: string) => {
        resetIfExpired(key);
        const expiry = counterExpiries[key];
        if (!expiry) return -2;
        const ttl = expiry - Date.now();
        return ttl > 0 ? ttl : -2;
      }),
      // Backward-compatible aliases used by older tests
      hset: vi.fn(hSetImpl),
      hget: vi.fn(hGetImpl),
      hexists: vi.fn(hExistsImpl),
      hgetall: vi.fn(hGetAllImpl),
      hdel: vi.fn(hDelImpl),
      lpush: vi.fn(lPushImpl),
    };
  })(),
  getRedisClient: vi.fn(() => ({
    connect: vi.fn(),
    quit: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  })),
}));

/**
 * GLOBAL MOCK STUBS (not initialized here to avoid issues)
 * Individual tests should mock as needed using vi.mock()
 * Common patterns:
 *
 * 1. Mock Next.js router:
 *    vi.mock('next/navigation', () => ({
 *      useRouter: vi.fn(),
 *      usePathname: vi.fn(),
 *    }))
 *
 * 2. Mock window.matchMedia:
 *    Object.defineProperty(window, 'matchMedia', { ... })
 *
 * 3. Mock fetch:
 *    global.fetch = vi.fn()
 *
 * See individual test files for examples
 */

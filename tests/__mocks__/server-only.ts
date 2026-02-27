/**
 * No-op mock for Next.js `server-only` package in test environment.
 *
 * The `server-only` package throws at import time if code is somehow imported
 * in a browser/client context. In Vitest (test runner), we simply ignore this
 * guard so server-only modules can be tested in isolation.
 */
export {};

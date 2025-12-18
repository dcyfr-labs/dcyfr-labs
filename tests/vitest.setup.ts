import '@testing-library/jest-dom'
import { cleanup, configure } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

/**
 * TESTING LIBRARY OPTIMIZATIONS
 * Reduces test setup time by configuring sensible defaults
 */

// Increase timeout for async operations to prevent flaky tests
configure({ asyncUtilTimeout: 2000 })

// Clean up after each test (e.g., clearing jsdom)
afterEach(() => {
  cleanup()
  // Clear all mocks to prevent test pollution
  vi.clearAllMocks()
})

/**
 * ENVIRONMENT VARIABLES FOR TESTS
 * Ensures consistent test environment
 */
// NODE_ENV is set by vitest automatically
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'

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




import '@testing-library/jest-dom'
import { cleanup, configure } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

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
    const error = new Error(message ?? 'Element not found')
    error.name = 'TestingLibraryElementError'
    return error
  },
})

// Clean up after each test (e.g., clearing jsdom)
// This runs automatically in parallel with next test's setup phase
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




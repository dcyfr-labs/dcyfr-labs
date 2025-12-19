/**
 * COMMON TEST MOCKS
 *
 * Centralized mocks to reduce duplication and setup overhead across test files.
 * Import only what you need to avoid unnecessary module initialization.
 *
 * Usage:
 *   import { mockNextRouter, mockFetch, mockMatchMedia } from '@/tests/common-mocks'
 */

import { vi } from 'vitest'

/**
 * Mock Next.js navigation hooks
 * Use when testing components that use useRouter, usePathname, etc.
 */
export function mockNextRouter() {
  const useRouter = vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    pathname: '/',
    query: {},
  }))

  const usePathname = vi.fn(() => '/')
  const useSearchParams = vi.fn(() => new URLSearchParams())

  vi.mock('next/navigation', () => ({
    useRouter,
    usePathname,
    useSearchParams,
  }))

  return { useRouter, usePathname, useSearchParams }
}

/**
 * Mock window.matchMedia for media query tests
 * Use when testing responsive components or media query hooks
 */
export function mockMatchMedia() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

/**
 * Mock global fetch
 * Use when testing API calls or external requests
 */
export function mockFetch(responses: Record<string, any> = {}) {
  const mockFetchFn = vi.fn((url: string | Request | URL, options?: any) => {
    const urlStr = typeof url === 'string' ? url : url instanceof URL ? url.toString() : (url as Request).url
    const response = responses[urlStr] ?? { ok: true, status: 200, json: vi.fn() }
    return Promise.resolve(response as any)
  })

  ;(global as any).fetch = mockFetchFn
  return mockFetchFn
}

/**
 * Mock window.IntersectionObserver
 * Use when testing components with lazy loading or infinite scroll
 */
export function mockIntersectionObserver() {
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as any
}

/**
 * Mock window.ResizeObserver
 * Use when testing components that respond to size changes
 */
export function mockResizeObserver() {
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })) as any
}

/**
 * Mock Next.js Image component
 * Use when testing components with images
 */
export function mockNextImage() {
  vi.mock('next/image', () => ({
    default: ({ src, alt, ...props }: any) => {
      // Returns a simple img element representation
      return { src, alt, props }
    },
  }))
}

/**
 * Quick setup for common browser APIs
 * Use as: setupBrowserAPIs()
 */
export function setupBrowserAPIs() {
  mockMatchMedia()
  mockIntersectionObserver()
  mockResizeObserver()
}

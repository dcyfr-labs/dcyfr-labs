import { http, HttpResponse } from 'msw'

/**
 * MSW (Mock Service Worker) handlers for API mocking in tests
 * 
 * These handlers intercept network requests during tests and return mock responses.
 * Useful for integration tests that need to mock external APIs.
 * 
 * @see https://mswjs.io/docs/
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const handlers = [
  // Mock GitHub contributions API
  http.get(`${BASE_URL}/api/github-contributions`, () => {
    return HttpResponse.json({
      contributions: Array.from({ length: 365 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        count: Math.floor(Math.random() * 10),
        level: Math.floor(Math.random() * 5),
      })),
      cached: true,
    })
  }),

  // Mock contact form API
  http.post(`${BASE_URL}/api/contact`, async () => {
    return HttpResponse.json({ success: true }, { status: 200 })
  }),

  // Mock health check API
  http.get(`${BASE_URL}/api/health`, () => {
    return HttpResponse.json({ status: 'ok', timestamp: Date.now() })
  }),
]

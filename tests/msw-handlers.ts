import { http, HttpResponse } from 'msw'
import { apiHandlers } from './mocks/handlers'

/**
 * MSW (Mock Service Worker) handlers for API mocking in tests
 * 
 * These handlers intercept network requests during tests and return mock responses.
 * Useful for integration tests that need to mock external APIs and services.
 * 
 * @see https://mswjs.io/docs/
 * 
 * For modular handler definitions, see: tests/mocks/handlers/
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

/**
 * PUBLIC API HANDLERS
 * Mocks external services and public endpoints
 */
const publicApiHandlers = [
  // GitHub GraphQL API
  // Note: Actual endpoint removed for security, but handlers ready for integration
  http.post('https://api.github.com/graphql', () => {
    return HttpResponse.json({
      data: {
        user: {
          repositories: { totalCount: 42 },
          pinnedItems: {
            nodes: [
              {
                name: 'dcyfr-labs',
                description: 'Personal development lab',
                url: 'https://github.com/dcyfr/dcyfr-labs',
                stargazerCount: 10,
                forkCount: 2,
                primaryLanguage: { name: 'TypeScript', color: '#3178c6' },
              },
            ],
          },
          contributionsCollection: {
            contributionCalendar: {
              totalContributions: 500,
              weeks: Array.from({ length: 52 }, () => ({
                contributionDays: Array.from({ length: 7 }, (_, i) => ({
                  date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  contributionCount: Math.floor(Math.random() * 10),
                })),
              })),
            },
          },
        },
      },
    })
  }),
]

/**
 * MAIN HANDLERS EXPORT
 * Combines:
 * - Public API handlers (GitHub GraphQL, external services)
 * - Internal API handlers (from tests/mocks/handlers/api.ts)
 * 
 * These are used in vitest.setup.ts with:
 * const server = setupServer(...handlers)
 */
export const handlers = [...publicApiHandlers, ...apiHandlers]

/**
 * For advanced mocking, import individual handlers:
 * 
 * import { errorHandlers } from '@/tests/mocks/handlers/api'
 * server.use(errorHandlers.viewsRateLimited) // Override specific handler
 */


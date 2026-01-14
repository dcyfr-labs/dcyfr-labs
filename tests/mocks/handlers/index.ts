/**
 * MSW HANDLERS INDEX
 * 
 * Central export point for all Mock Service Worker handlers
 * 
 * Usage in tests:
 * import { apiHandlers } from '@/tests/mocks/handlers'
 * import { server } from '@/tests/mocks'
 * 
 * To override handlers in a test:
 * import { errorHandlers } from '@/tests/mocks/handlers/api'
 * server.use(errorHandlers.viewsRateLimited)
 */

export { apiHandlers, errorHandlers as apiErrorHandlers } from './api'
export * from './api'

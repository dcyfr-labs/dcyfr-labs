# Test Setup Files

This directory contains setup and configuration files for the testing infrastructure.

## Files

### `vitest.setup.ts`
Global setup file for Vitest that runs before all tests. Includes:
- Testing Library cleanup after each test
- Global fetch mock for Node.js environment
- Jest DOM matchers setup

### `msw-handlers.ts`
Mock Service Worker (MSW) handlers for API mocking. Defines mock responses for:
- `/api/github-contributions` - Returns sample contribution data
- `/api/contact` - Returns success response
- `/api/health` - Returns OK status

## Usage

These files are automatically loaded by Vitest via the `setupFiles` configuration in `vitest.config.ts`.

To use MSW handlers in integration tests:

```typescript
import { setupServer } from 'msw/node'
import { handlers } from '@/tests/setup/msw-handlers'

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

# Testing Documentation

Comprehensive testing setup for the application.

**Current Status** (Nov 15, 2025):

- ✅ Testing infrastructure complete
- ✅ 19/19 tests passing (unit + E2E)
- 📊 Coverage: 0.63% (target: 80%)
- 🎯 3-phase roadmap to reach coverage goals

---

## Quick Links

- **[Coverage Roadmap](./coverage-roadmap.md)** - Detailed plan to reach 80% coverage
- **[Testing Guide](./testing-guide.md)** - How to write and run tests
- **[E2E Testing](./e2e-testing.md)** - Playwright end-to-end tests

---

## Testing Stack

### Unit & Integration Testing

- **Vitest** - Fast unit test runner (Jest-compatible)
- **Testing Library** - React component testing utilities
- **happy-dom** - Lightweight DOM for Node.js testing
- **MSW** (Mock Service Worker) - API mocking

### E2E Testing

- **Playwright** - Browser automation and testing
- **Vercel Preview** - Test against preview deployments

### E2E Helpers

This repo includes a small set of E2E helpers under `e2e/utils/` to reduce flakiness and standardize common flows, for example:

- `e2e/utils/nav.ts` - `openMobileNav(page)` and `closeMobileNav(page)` helpers to reliably open/close the MobileNav for tests across browsers and viewports.

Use the helper in tests like:

```ts
import openMobileNav from './utils/nav'

const nav = await openMobileNav(page)
await nav?.getByRole('link', { name: /blog/ }).click()
```

---

## Running Tests

### Unit Tests

```bash
# Run all tests
npm test

# Watch mode (development)
npm run test:watch

# Coverage report
npm run test:coverage

# UI mode (interactive)
npm run test:ui
```

# E2E Tests

```bash
# Run E2E tests (headless). Note: by default this command runs a production build and starts the server
# to avoid issues with Next.js dev overlay and dev-only behavior. Use `npm run test:e2e:dev` to run
# against a dev server instead.
npm run test:e2e

# Run E2E tests against local dev server
npm run test:e2e:dev

# Run with UI (interactive)
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

---

## Current Coverage

### ✅ Tested Files (100% coverage)

- `lib/utils.ts` - Class name utilities (7 tests)

### 🟡 Partially Tested (33% coverage)

- `lib/blog.ts` - Post processing (12 tests for pure functions)

### ❌ Priority Files for Testing

**Phase 1** (Critical business logic):

- `lib/metadata.ts` - SEO/Open Graph generation
- `lib/rate-limit.ts` - Rate limiting logic
- `lib/feeds.ts` - RSS/Atom feed generation
- `lib/json-ld.ts` - Structured data

**Phase 2** (Components & hooks):

- Component logic (filters, MDX, analytics)
- Custom hooks (view tracking, animations)
- Data layer (projects, resume, socials)

**Phase 3** (Integration & edge cases):

- API route integration tests
- Blog system lifecycle tests
- Error scenarios and edge cases

See **[Coverage Roadmap](./coverage-roadmap.md)** for detailed plan.

---

## Test Organization

```text
src/__tests__/              # Unit tests (co-located with source)
├── lib/
│   ├── blog.test.ts
│   └── utils.test.ts
├── components/             # Component tests (future)
└── hooks/                  # Hook tests (future)

tests/                      # Shared test utilities
├── setup/
│   ├── vitest.setup.ts     # Global test configuration
│   └── test-utils.tsx      # Testing Library setup (future)
└── mocks/                  # Mock implementations (future)
    ├── redis.ts
    ├── inngest.ts
    └── github.ts

e2e/                        # Playwright E2E tests
├── blog.spec.ts            # Blog system E2E tests
└── homepage.spec.ts        # Homepage E2E tests
```

---

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '@/lib/my-module'

describe('myFunction', () => {
  it('should return expected value', () => {
    const result = myFunction('input')
    expect(result).toBe('expected')
  })

  it('should handle edge cases', () => {
    expect(myFunction(null)).toBe(undefined)
    expect(myFunction('')).toBe('')
  })
})
```

### Component Test Example (Future)

```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/my-component'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Drew's Lab/)
})
```

---

## Mocking Strategies

### Mock Redis

```typescript
import { vi } from 'vitest'

vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    incr: vi.fn(),
  },
}))
```

### Mock File System

```typescript
import { vi } from 'vitest'

vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(() => true),
    readdirSync: vi.fn(() => ['file1.mdx', 'file2.mdx']),
    readFileSync: vi.fn(() => 'mock content'),
  },
}))
```

### Mock API Routes (MSW)

```typescript
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.get('/api/views/:slug', (req, res, ctx) => {
    return res(ctx.json({ views: 100 }))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

---

## CI/CD Integration

Tests run automatically on:

- ✅ Every push to any branch
- ✅ Every pull request
- ✅ Before merging to main

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
```

---

## Coverage Thresholds

### Current Thresholds (Aspirational)

```typescript
// vitest.config.ts
thresholds: {
  lines: 80,
  functions: 80,
  branches: 75,
  statements: 80,
}
```

### Incremental Goals

| Phase | Timeline | Target | Status |
| ----- | -------- | ------ | ------ |
| Setup | ✅ Done  | Infrastructure | Complete |
| Phase 1 | Weeks 1-2 | 25% coverage | Pending |
| Phase 2 | Weeks 3-4 | 50% coverage | Pending |
| Phase 3 | Weeks 5-8 | 80% coverage | Pending |

**Note**: Thresholds will be lowered temporarily to ~10% to unblock CI, then raised incrementally as coverage improves.

---

## Best Practices

### DO

✅ Write tests for business logic first (highest ROI)  
✅ Mock external dependencies (Redis, APIs, file system)  
✅ Test edge cases and error scenarios  
✅ Keep tests fast (< 30 seconds total runtime)  
✅ Use descriptive test names  
✅ Follow AAA pattern (Arrange, Act, Assert)

### DON'T

❌ Test implementation details  
❌ Test third-party libraries  
❌ Write flaky tests  
❌ Mock everything (test real code when possible)  
❌ Skip edge cases  
❌ Test UI styling (use visual regression tools instead)

---

## Troubleshooting

### Tests Fail Locally But Pass in CI

- Check Node.js version matches CI (v20)
- Clear cache: `npm run test:clean`
- Verify environment variables

### Slow Test Suite

- Check for expensive operations (network, file I/O)
- Mock external dependencies
- Use `test.concurrent()` for independent tests
- Profile with `npm run test:ui`

### Flaky Tests

- Add proper `waitFor()` in component tests
- Increase timeouts for E2E tests
- Mock time-dependent operations
- Check for race conditions

---

## Resources

### Documentation

- [Vitest Docs](https://vitest.dev)
- [Testing Library](https://testing-library.com)
- [Playwright](https://playwright.dev)
- [MSW](https://mswjs.io)

### Internal Docs

- [Coverage Roadmap](./coverage-roadmap.md) - Detailed testing plan
- [Testing Guide](./testing-guide.md) - How-to guide
- [E2E Testing](./e2e-testing.md) - Playwright setup

---

**Last Updated**: November 15, 2025

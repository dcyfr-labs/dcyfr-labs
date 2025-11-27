# Testing Infrastructure

This project uses a modern, comprehensive testing setup optimized for Next.js 16, TypeScript, Vercel, and VS Code.

## Quick Start

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## Stack Overview

| Layer | Tool | Purpose |
|-------|------|---------|
| **Unit Tests** | Vitest + Happy DOM | Fast tests for pure functions |
| **Component Tests** | Vitest + Testing Library | React component testing |
| **Integration Tests** | Vitest + MSW | API and multi-component tests |
| **E2E Tests** | Playwright | Full browser testing |
| **Coverage** | V8 (built into Vitest) | Code coverage reporting |

## Test Structure

```
dcyfr-labs/
├── src/__tests__/          # Unit & Component tests
│   ├── lib/                # Tests for lib/ utilities
│   │   ├── utils.test.ts
│   │   └── blog.test.ts
│   └── components/         # Tests for React components
│
├── tests/                  # Integration tests
│   ├── integration/
│   └── setup/
│       ├── vitest.setup.ts
│       └── msw-handlers.ts
│
├── e2e/                    # E2E tests (Playwright)
│   ├── homepage.spec.ts
│   └── blog.spec.ts
│
├── vitest.config.ts        # Vitest configuration
└── playwright.config.ts    # Playwright configuration
```

## Writing Tests

### Unit Tests

Unit tests are for pure functions with no side effects:

```typescript
// src/__tests__/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn()', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle Tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})
```

### Component Tests

Component tests use Testing Library:

```typescript
// src/__tests__/components/button.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })
})
```

### Integration Tests

Integration tests mock APIs with MSW:

```typescript
// tests/integration/blog-flow.test.ts
import { setupServer } from 'msw/node'
import { handlers } from '@/tests/setup/msw-handlers'

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### E2E Tests

E2E tests use Playwright:

```typescript
// e2e/homepage.spec.ts
import { test, expect } from '@playwright/test'

test('should load homepage', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()
})
```

## VS Code Integration

### Recommended Extensions

Install these extensions for the best experience:

- **Vitest** (`vitest.explorer`) - Run tests inline
- **Playwright Test** (`ms-playwright.playwright`) - E2E test runner
- **Error Lens** (`usernamehw.errorlens`) - Inline error display

### Test Explorer

VS Code Test Explorer will automatically detect and display all tests. You can:

- Run individual tests
- Debug tests with breakpoints
- View test results inline
- Re-run failed tests

### Keyboard Shortcuts

- `Cmd/Ctrl + Shift + P` → "Test: Run All Tests"
- Click the ▶️ icon next to any test to run it
- Click the 🐛 icon to debug

## Configuration

### Vitest (`vitest.config.ts`)

- Uses Happy DOM for fast DOM simulation
- Resolves `@/*` path aliases
- Excludes Next.js pages from coverage
- 80% coverage threshold for critical code

### Playwright (`playwright.config.ts`)

- Tests against Chromium, Firefox, WebKit
- Mobile viewport testing (Pixel 5, iPhone 12)
- Automatically starts dev server if not running
- Supports Vercel preview deployments via `VERCEL_URL`

## Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# Open HTML coverage report
open coverage/index.html
```

Coverage thresholds:
- Lines: 80%
- Functions: 80%
- Branches: 75%
- Statements: 80%

## CI/CD Integration

See `.github/workflows/test.yml` for GitHub Actions setup.

```yaml
# Example workflow
- name: Run Tests
  run: npm run test:ci
```

## MCP Integration

The testing infrastructure can leverage MCP servers:

### Memory MCP
Store successful test patterns and solutions:

```typescript
// Track common mocking strategies
await mcp_memory.create_entities([{
  name: "GitHub API Mock",
  entityType: "test-pattern",
  observations: ["Use MSW to mock /api/github-contributions"]
}])
```

### Context7 MCP
Get real-time testing documentation:

- "How to test Next.js Server Components?"
- "Testing Library best practices"
- "Playwright visual regression setup"

### Sequential Thinking MCP
Debug complex test failures:

- Analyze stack traces
- Identify root causes
- Suggest fixes

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ❌ Bad: Testing implementation details
expect(component.state.count).toBe(1)

// ✅ Good: Testing user-visible behavior
expect(screen.getByText('Count: 1')).toBeInTheDocument()
```

### 2. Use Data Test IDs Sparingly

```typescript
// ❌ Bad: Coupling to implementation
screen.getByTestId('submit-button')

// ✅ Good: Using accessible queries
screen.getByRole('button', { name: /submit/i })
```

### 3. Keep Tests Isolated

```typescript
// Use beforeEach/afterEach to reset state
beforeEach(() => {
  vi.clearAllMocks()
})
```

### 4. Test Edge Cases

```typescript
it('should handle empty input', () => {
  expect(calculateReadingTime('')).toEqual({ words: 0, minutes: 1 })
})
```

## Troubleshooting

### Tests Fail Locally But Pass in CI

- Check Node.js version (should be 20+)
- Clear cache: `rm -rf node_modules/.vite`
- Ensure all dependencies are installed

### Playwright Tests Timeout

- Increase timeout in `playwright.config.ts`
- Check if dev server is running
- Use `test.slow()` for slow tests

### Coverage Not Updating

- Run: `npm run test:coverage -- --run`
- Delete `coverage/` directory and rerun

### Mock Not Working

- Ensure `vi.mock()` is at the top of the file
- Use `vi.mocked()` for TypeScript
- Check mock is cleared in `beforeEach()`

## Next Steps

1. ✅ Add more unit tests for utilities
2. ✅ Add component tests for UI components
3. ✅ Add integration tests for API routes
4. ✅ Add visual regression tests with Playwright
5. ✅ Set up GitHub Actions workflow

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)

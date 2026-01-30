<!-- TLP:CLEAR -->

# Testing Quick Reference

**Quick commands and patterns for testing**

---

## Commands

```bash
# Unit tests
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
npm run test:ui             # Interactive UI

# E2E tests
npm run test:e2e            # Run E2E tests
npm run test:e2e:ui         # UI mode
npm run test:e2e:debug      # Debug mode
```

---

## Writing Tests

### Unit Test Template

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Module/Function Name', () => {
  beforeEach(() => {
    // Setup before each test
  })

  afterEach(() => {
    // Cleanup after each test
    vi.clearAllMocks()
  })

  it('should [expected behavior]', () => {
    // Arrange
    const input = 'test'

    // Act
    const result = myFunction(input)

    // Assert
    expect(result).toBe('expected')
  })
})
```

### Component Test Template

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { MyComponent } from '@/components/my-component'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    render(<MyComponent />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(await screen.findByText('Clicked')).toBeInTheDocument()
  })
})
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should [expected behavior]', async ({ page }) => {
    await page.goto('/path')
    await expect(page.getByRole('heading')).toHaveText('Expected Text')
  })
})
```

---

## Common Mocks

### Mock Redis

```typescript
vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
  },
}))
```

### Mock File System

```typescript
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(() => true),
    readdirSync: vi.fn(() => ['file.mdx']),
    readFileSync: vi.fn(() => 'content'),
  },
}))
```

### Mock Next.js Router

```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))
```

### Mock Environment Variables

```typescript
const originalEnv = process.env

beforeEach(() => {
  process.env = { ...originalEnv, NODE_ENV: 'test' }
})

afterEach(() => {
  process.env = originalEnv
})
```

---

## Assertions

### Basic

```typescript
expect(value).toBe(expected) // Strict equality
expect(value).toEqual(expected) // Deep equality
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeNull()
expect(value).toBeUndefined()
expect(value).toBeDefined()
```

### Numbers

```typescript
expect(number).toBeGreaterThan(3)
expect(number).toBeLessThan(5)
expect(number).toBeCloseTo(4.5, 1) // Precision
```

### Strings

```typescript
expect(string).toMatch(/pattern/)
expect(string).toContain('substring')
expect(string).toHaveLength(5)
```

### Arrays

```typescript
expect(array).toContain(item)
expect(array).toHaveLength(3)
expect(array).toEqual(expect.arrayContaining([item1, item2]))
```

### Objects

```typescript
expect(obj).toHaveProperty('key', value)
expect(obj).toMatchObject({ key: value })
expect(obj).toEqual(expect.objectContaining({ key: value }))
```

### Functions

```typescript
expect(fn).toHaveBeenCalled()
expect(fn).toHaveBeenCalledTimes(2)
expect(fn).toHaveBeenCalledWith(arg1, arg2)
expect(fn).toHaveReturned()
expect(fn).toHaveReturnedWith(value)
```

### Async

```typescript
await expect(promise).resolves.toBe(value)
await expect(promise).rejects.toThrow(Error)
```

### DOM (Testing Library)

```typescript
expect(element).toBeInTheDocument()
expect(element).toHaveTextContent('text')
expect(element).toHaveAttribute('attr', 'value')
expect(element).toHaveClass('className')
expect(element).toBeVisible()
expect(element).toBeDisabled()
```

---

## Testing Library Queries

### Priority Order (Use in this order)

1. **getByRole** - Accessibility-first

   ```typescript
   screen.getByRole('button', { name: /submit/i })
   ```

2. **getByLabelText** - Forms

   ```typescript
   screen.getByLabelText('Email address')
   ```

3. **getByPlaceholderText** - Form inputs

   ```typescript
   screen.getByPlaceholderText('Enter email')
   ```

4. **getByText** - Content

   ```typescript
   screen.getByText(/loading/i)
   ```

5. **getByTestId** - Last resort
   ```typescript
   screen.getByTestId('custom-element')
   ```

### Query Variants

```typescript
// Throws error if not found
getBy...

// Returns null if not found
queryBy...

// Waits for element (async)
await findBy...

// Multiple elements
getAllBy...
queryAllBy...
await findAllBy...
```

---

## Async Testing

### Wait for Element

```typescript
const element = await screen.findByText('Loaded', {}, { timeout: 3000 })
```

### Wait for Condition

```typescript
import { waitFor } from '@testing-library/react'

await waitFor(() => {
  expect(mockFn).toHaveBeenCalled()
})
```

### Wait for Disappearance

```typescript
await waitFor(() => {
  expect(screen.queryByText('Loading')).not.toBeInTheDocument()
})
```

---

## Playwright Selectors

### By Role

```typescript
page.getByRole('button', { name: 'Submit' })
page.getByRole('heading', { level: 1 })
```

### By Text

```typescript
page.getByText('Welcome')
page.getByText(/pattern/i)
```

### By Label

```typescript
page.getByLabel('Email')
```

### By Placeholder

```typescript
page.getByPlaceholder('Enter name')
```

### By Test ID

```typescript
page.getByTestId('custom-id')
```

### CSS Selector

```typescript
page.locator('.class-name')
page.locator('#id')
```

---

## Coverage Commands

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html

# Check specific file
npm run test:coverage -- src/lib/utils.ts
```

---

## Debugging

### VS Code Debugger

1. Set breakpoint in test file
2. Open VS Code Test Explorer
3. Right-click test → "Debug Test"

### Console Debugging

```typescript
import { screen, debug } from '@testing-library/react'

// Print entire DOM
screen.debug()

// Print specific element
screen.debug(element)
```

### Playwright Debugging

```bash
# UI mode with inspector
npm run test:e2e:ui

# Debug mode with Playwright Inspector
npm run test:e2e:debug

# Headed mode (see browser)
npm run test:e2e -- --headed
```

### Vitest UI

```bash
npm run test:ui
```

---

## Common Patterns

### Test API Endpoint

```typescript
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.get('/api/endpoint', (req, res, ctx) => {
    return res(ctx.json({ data: 'value' }))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Test Error Handling

```typescript
it('should handle errors', async () => {
  const mockFn = vi.fn(() => {
    throw new Error('Test error')
  })

  expect(() => mockFn()).toThrow('Test error')
})
```

### Test Loading State

```typescript
it('should show loading state', async () => {
  render(<Component />)

  expect(screen.getByText('Loading...')).toBeInTheDocument()

  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })
})
```

### Test Form Submission

```typescript
it('should submit form', async () => {
  const onSubmit = vi.fn()
  render(<Form onSubmit={onSubmit} />)

  const input = screen.getByLabelText('Name')
  fireEvent.change(input, { target: { value: 'John' } })

  const button = screen.getByRole('button', { name: /submit/i })
  fireEvent.click(button)

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({ name: 'John' })
  })
})
```

---

## Performance Tips

### Run Specific Tests

```bash
# By file pattern
npm test -- blog

# By test name
npm test -- -t "should validate metadata"

# Single file
npm test -- src/__tests__/lib/utils.test.ts
```

### Concurrent Tests

```typescript
import { describe, it } from 'vitest'

// Run tests in parallel
describe.concurrent('Independent tests', () => {
  it.concurrent('test 1', async () => {
    // ...
  })

  it.concurrent('test 2', async () => {
    // ...
  })
})
```

### Skip/Only

```typescript
// Skip test
it.skip('not ready yet', () => {})

// Only run this test
it.only('debug this', () => {})

// Skip entire suite
describe.skip('Suite', () => {})
```

---

## Next Steps

- **Phase 1**: Test critical business logic (`lib/metadata.ts`, `lib/rate-limit.ts`)
- **Phase 2**: Test components and hooks
- **Phase 3**: Integration and E2E tests

See [Coverage Roadmap](./coverage-roadmap) for detailed plan.

---

**Last Updated**: November 15, 2025

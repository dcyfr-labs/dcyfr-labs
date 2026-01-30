<!-- TLP:CLEAR -->

# Testing Strategy Guide

**Purpose**: Define testing levels, coverage targets, and when to use each testing approach.

**Last Updated**: January 15, 2026  
**Status**: Production Standard - Automated Testing Priority

**Testing Philosophy**: Prioritize automated testing over manual testing. Aim for 90%+ coverage with fast, reliable tests.

---

## Testing Pyramid

```
        /\
       /E2E\        10% - End-to-End (Playwright)
      /______\
     /        \
    /Integration\ 20% - Integration (React Testing Library + MSW)
   /____________\
  /              \
 /  Unit Tests    \ 70% - Unit (Vitest + React Testing Library)
/__________________\
```

**Target Distribution**:
- **70% Unit Tests**: Fast, isolated, component/function level
- **20% Integration Tests**: Component integration, API mocking
- **10% E2E Tests**: Critical user flows, production-like environment

---

## 1. Unit Tests (Vitest + React Testing Library)

### Coverage Targets by File Type

| File Type | Target Coverage | Why |
|-----------|----------------|-----|
| **Utilities** (`src/lib/*.ts`) | 95%+ | Pure functions, critical business logic |
| **Hooks** (`src/hooks/*.ts`) | 90%+ | Reusable logic, shared across components |
| **Components** (`src/components/**/*.tsx`) | 85%+ | UI logic, user interactions |
| **API Routes** (`src/app/api/**/*.ts`) | 90%+ | Business logic, data validation |
| **MCP Servers** (`src/mcp/**/*.ts`) | 90%+ | Tool integrations, AI workflows |

### When to Write Unit Tests

**✅ Always test:**
- Pure functions (utilities, helpers)
- Custom hooks
- Component logic (event handlers, state management)
- Form validation
- Data transformations
- Error handling

**❌ Don't unit test:**
- Next.js App Router files (`app/*/page.tsx`, `app/*/layout.tsx`)
- Simple presentational components (just props rendering)
- Third-party library internals
- Type definitions only

### Component Testing Pattern

```tsx
// src/components/ui/__tests__/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../button';

expect.extend(toHaveNoViolations);

describe('Button', () => {
  describe('Rendering', () => {
    it('should render children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('should apply variant styles', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive');
    });

    it('should render as child when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/link">Link Button</a>
        </Button>
      );
      expect(screen.getByRole('link')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick} disabled>Click me</Button>);
      
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Button>Accessible Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be keyboard accessible', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Keyboard Button</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalled();
    });
  });
});
```

### Hook Testing Pattern

```tsx
// src/hooks/__tests__/use-form-validation.test.ts
import { renderHook, act } from '@testing-library/react';
import { useFormValidation, validators } from '../use-form-validation';

describe('useFormValidation', () => {
  const initialValues = { email: '', name: '' };
  const validationRules = {
    email: [validators.required(), validators.email()],
    name: [validators.required(), validators.minLength(2)],
  };

  it('should initialize with initial values', () => {
    const { result } = renderHook(() =>
      useFormValidation({ initialValues, validationRules })
    );

    expect(result.current.values).toEqual(initialValues);
  });

  it('should validate field on blur', async () => {
    const { result } = renderHook(() =>
      useFormValidation({ initialValues, validationRules })
    );

    act(() => {
      result.current.setValue('email', 'invalid-email');
      result.current.handleBlur('email');
    });

    expect(result.current.fieldStates.email.error).toBe('Invalid email address');
  });

  it('should show success when field is valid', () => {
    const { result } = renderHook(() =>
      useFormValidation({ initialValues, validationRules })
    );

    act(() => {
      result.current.setValue('email', 'valid@example.com');
    });

    expect(result.current.fieldStates.email.showSuccess).toBe(true);
    expect(result.current.fieldStates.email.error).toBeNull();
  });

  it('should submit form when all fields are valid', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues,
        validationRules,
        onSubmit,
      })
    );

    act(() => {
      result.current.setValue('email', 'test@example.com');
      result.current.setValue('name', 'John');
    });

    await act(async () => {
      await result.current.handleSubmit(new Event('submit') as any);
    });

    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      name: 'John',
    });
  });
});
```

### Utility Testing Pattern

```tsx
// src/lib/__tests__/design-tokens.test.ts
import { TYPOGRAPHY, SPACING, CONTAINER_WIDTHS } from '../design-tokens';

describe('Design Tokens', () => {
  describe('TYPOGRAPHY', () => {
    it('should have all heading variants', () => {
      expect(TYPOGRAPHY.h1.standard).toContain('text-');
      expect(TYPOGRAPHY.h2.standard).toContain('text-');
      expect(TYPOGRAPHY.h3.standard).toContain('text-');
    });

    it('should use semibold for h1', () => {
      expect(TYPOGRAPHY.h1.standard).toContain('font-semibold');
      expect(TYPOGRAPHY.h1.standard).not.toContain('font-bold');
    });

    it('should use fluid typography with clamp', () => {
      expect(TYPOGRAPHY.h1.standard).toContain('clamp(');
    });
  });

  describe('SPACING', () => {
    it('should have consistent spacing scale', () => {
      expect(SPACING.section).toMatch(/space-y-\d+/);
      expect(SPACING.content).toMatch(/space-y-\d+/);
      expect(SPACING.element).toMatch(/space-y-\d+/);
    });

    it('should have responsive spacing', () => {
      expect(SPACING.section).toContain('md:');
      expect(SPACING.section).toContain('lg:');
    });
  });

  describe('CONTAINER_WIDTHS', () => {
    it('should have semantic width names', () => {
      expect(CONTAINER_WIDTHS.narrow).toBe('max-w-4xl');
      expect(CONTAINER_WIDTHS.standard).toBe('max-w-5xl');
      expect(CONTAINER_WIDTHS.content).toBe('max-w-6xl');
    });
  });
});
```

### Running Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test src/components/ui/__tests__/button.test.tsx

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
```

---

## 2. Integration Tests (React Testing Library + MSW)

### When to Write Integration Tests

**✅ Test integration between:**
- Components + hooks
- Components + API calls
- Multiple components working together
- Form submission + validation + API

**Coverage**: 20% of total tests (focus on critical flows)

### Setup: Mock Service Worker (MSW)

```bash
npm install --save-dev msw
```

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock successful post fetch
  http.get('/api/posts', () => {
    return HttpResponse.json([
      { id: '1', title: 'Test Post 1', slug: 'test-post-1' },
      { id: '2', title: 'Test Post 2', slug: 'test-post-2' },
    ]);
  }),

  // Mock post creation
  http.post('/api/posts', async ({ request }) => {
    const newPost = await request.json();
    return HttpResponse.json(
      { id: '3', ...newPost },
      { status: 201 }
    );
  }),

  // Mock error response
  http.get('/api/posts/:id', ({ params }) => {
    if (params.id === 'invalid') {
      return HttpResponse.json(
        { message: 'Post not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json({ id: params.id, title: 'Test Post' });
  }),
];
```

```typescript
// src/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```typescript
// src/setupTests.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Start server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
```

### Integration Test Pattern

```tsx
// tests/integration/post-list.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';
import { PostList } from '@/components/blog/post-list';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }, // Disable retries in tests
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

describe('PostList Integration', () => {
  it('should fetch and display posts', async () => {
    renderWithProviders(<PostList />);

    // Should show loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for posts to load
    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Test Post 2')).toBeInTheDocument();
    });
  });

  it('should handle API errors', async () => {
    // Override handler to return error
    server.use(
      http.get('/api/posts', () => {
        return HttpResponse.json(
          { message: 'Internal Server Error' },
          { status: 500 }
        );
      })
    );

    renderWithProviders(<PostList />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load posts/i)).toBeInTheDocument();
    });
  });

  it('should show empty state when no posts', async () => {
    server.use(
      http.get('/api/posts', () => {
        return HttpResponse.json([]);
      })
    );

    renderWithProviders(<PostList />);

    await waitFor(() => {
      expect(screen.getByText(/no posts found/i)).toBeInTheDocument();
    });
  });
});
```

### Form Integration Test

```tsx
// tests/integration/contact-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';
import { ContactForm } from '@/components/common/contact-form';

describe('ContactForm Integration', () => {
  it('should submit form successfully', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    // Fill out form
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/message/i), 'This is a test message that is long enough');

    // Submit form
    await user.click(screen.getByRole('button', { name: /send/i }));

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/message sent successfully/i)).toBeInTheDocument();
    });
  });

  it('should show validation errors', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    // Try to submit empty form
    await user.click(screen.getByRole('button', { name: /send/i }));

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('should handle server errors', async () => {
    server.use(
      http.post('/api/contact', () => {
        return HttpResponse.json(
          { message: 'Server error' },
          { status: 500 }
        );
      })
    );

    const user = userEvent.setup();
    render(<ContactForm />);

    // Fill and submit form
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/message/i), 'This is a test message');
    await user.click(screen.getByRole('button', { name: /send/i }));

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/failed to send message/i)).toBeInTheDocument();
    });
  });
});
```

---

## 3. End-to-End Tests (Playwright)

### Coverage Target: 10% (Critical User Flows)

**✅ Test these critical flows:**
- User authentication (sign in, sign out)
- Content creation (create post, publish)
- Content consumption (read post, navigate)
- E-commerce (add to cart, checkout)
- Forms (contact form, newsletter signup)

**❌ Don't E2E test:**
- Edge cases (test in unit/integration)
- All UI variations (test in Storybook)
- Performance (use Lighthouse CI)

### E2E Test Pattern

```typescript
// e2e/blog/read-post.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Blog Post Reading Flow', () => {
  test('should read a blog post end-to-end', async ({ page }) => {
    // Navigate to blog
    await page.goto('/blog');
    await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();

    // Click on first post
    const firstPost = page.getByRole('article').first();
    await firstPost.click();

    // Verify post page
    await expect(page).toHaveURL(/\/blog\/.+/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Check table of contents
    const toc = page.getByRole('navigation', { name: /table of contents/i });
    await expect(toc).toBeVisible();

    // Click TOC link
    const tocLink = toc.getByRole('link').first();
    await tocLink.click();

    // Verify scroll (section should be visible)
    const firstSection = page.getByRole('heading', { level: 2 }).first();
    await expect(firstSection).toBeInViewport();

    // Verify reading progress
    const progressBar = page.getByRole('progressbar', { name: /reading progress/i });
    await expect(progressBar).toBeVisible();

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Progress should be 100%
    await expect(progressBar).toHaveAttribute('aria-valuenow', '100');
  });

  test('should share post section', async ({ page, context }) => {
    await page.goto('/blog/test-post');

    // Find share button
    const shareButton = page.getByRole('button', { name: /share/i }).first();
    await shareButton.click();

    // Click Twitter share
    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('link', { name: /twitter/i }).click(),
    ]);

    // Verify Twitter share URL
    expect(popup.url()).toContain('twitter.com');
    expect(popup.url()).toContain(encodeURIComponent('test-post'));

    await popup.close();
  });
});
```

### Accessibility E2E Tests

```typescript
// e2e/accessibility/homepage.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Homepage Accessibility', () => {
  test('should have no WCAG 2.1 AA violations', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeFocused();

    // Press Enter on skip link
    await page.keyboard.press('Enter');
    const mainContent = page.getByRole('main');
    await expect(mainContent).toBeInViewport();

    // Navigate with keyboard shortcuts
    await page.keyboard.press('/');
    const searchInput = page.getByRole('searchbox');
    await expect(searchInput).toBeFocused();
  });

  test('should work with screen reader', async ({ page }) => {
    await page.goto('/blog/test-post');

    // Check ARIA attributes
    const main = page.getByRole('main');
    await expect(main).toHaveAttribute('aria-label', 'Article content');

    const nav = page.getByRole('navigation', { name: /table of contents/i });
    await expect(nav).toBeVisible();

    const progressBar = page.getByRole('progressbar');
    await expect(progressBar).toHaveAttribute('aria-label', 'Reading progress');
  });
});
```

### Performance E2E Tests

```typescript
// e2e/performance/core-web-vitals.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Core Web Vitals', () => {
  test('should meet LCP target', async ({ page }) => {
    await page.goto('/');

    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          resolve(lastEntry.renderTime || lastEntry.loadTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      });
    });

    // LCP should be < 2.5s
    expect(lcp).toBeLessThan(2500);
  });

  test('should have good CLS', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    const cls = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          resolve(clsValue);
        }).observe({ type: 'layout-shift', buffered: true });
      });
    });

    // CLS should be < 0.1
    expect(cls).toBeLessThan(0.1);
  });
});
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run against production build
npm run test:e2e:prod

# Run in UI mode (visual debugging)
npm run test:e2e:ui

# Run in debug mode (step through tests)
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/blog/read-post.spec.ts

# Run tests on specific browser
npx playwright test --project=chromium
npx playwright test --project=webkit
```

---

## 4. Visual Regression Testing (Storybook + Chromatic)

### Setup Storybook

```bash
npm install --save-dev @storybook/react @storybook/addon-a11y @storybook/addon-interactions
npx storybook@latest init
```

### Story Pattern

```tsx
// src/components/ui/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'ghost', 'link', 'cta'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Cancel',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading...',
    disabled: true,
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Save
      </>
    ),
  },
};

// Accessibility test
export const AccessibilityTest: Story = {
  args: {
    children: 'Accessible Button',
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
};
```

### Running Storybook

```bash
# Start Storybook
npm run storybook

# Build Storybook
npm run build-storybook

# Deploy to Chromatic (visual regression)
npx chromatic --project-token=<token>
```

---

## 5. Accessibility Testing (axe-core + Playwright)

### Automated Accessibility Tests

```typescript
// All component tests should include axe-core
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### E2E Accessibility Tests

```typescript
import AxeBuilder from '@axe-core/playwright';

test('should have no WCAG violations', async ({ page }) => {
  await page.goto('/');
  
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2aa'])
    .analyze();
  
  expect(results.violations).toEqual([]);
});
```

### Running Accessibility Tests

```bash
# Run color contrast validation
npm run validate:contrast

# Run automated accessibility audit
npm run a11y:audit

# Run E2E accessibility tests
npm run test:e2e -- --grep "accessibility"
```

---

## Coverage Targets

### Global Coverage Targets

```json
{
  "coverageThreshold": {
    "global": {
      "statements": 85,
      "branches": 80,
      "functions": 85,
      "lines": 85
    }
  }
}
```

### File-Specific Targets

```json
{
  "coverageThreshold": {
    "src/lib/**/*.ts": {
      "statements": 95,
      "branches": 90,
      "functions": 95,
      "lines": 95
    },
    "src/hooks/**/*.ts": {
      "statements": 90,
      "branches": 85,
      "functions": 90,
      "lines": 90
    },
    "src/components/**/*.tsx": {
      "statements": 85,
      "branches": 80,
      "functions": 85,
      "lines": 85
    }
  }
}
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/tests.yml
name: Tests

on:
  pull_request:
  push:
    branches: [main, preview]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: npm ci
      - run: npm run test:run
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e:prod

  accessibility-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: npm ci
      - run: npm run validate:contrast
      - run: npm run a11y:audit
```

---

## Testing Checklist

### Before Merging PR

- [ ] Unit tests passing (90%+ coverage)
- [ ] Integration tests passing
- [ ] E2E tests passing (critical flows)
- [ ] Accessibility tests passing (axe-core, WCAG 2.1 AA)
- [ ] Visual regression baseline approved (Storybook)
- [ ] No new console errors or warnings
- [ ] Performance budgets met (Lighthouse CI)
- [ ] Code coverage threshold met

---

## Resources

### Internal
- [Component Lifecycle](./component-lifecycle.md)
- [Error Handling Patterns](./error-handling-patterns.md)
- [Design System](../../docs/ai/design-system.md)

### External
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Storybook Documentation](https://storybook.js.org/)
- [axe-core Documentation](https://www.deque.com/axe/core-documentation/)

---

**Last Updated**: January 15, 2026  
**Next Review**: Q2 2026

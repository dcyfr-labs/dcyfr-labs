# Testing Patterns & Strategy

**File:** `.github/agents/patterns/TESTING_PATTERNS.md`  
**Last Updated:** December 9, 2025  
**Scope:** Test coverage, strategic skips, testing philosophy

---

## Testing Philosophy

**Target: 99% Pass Rate** (1339/1346 tests passing)

This includes **strategic skips** for known blockers:
- 5 unit tests (component refactors in progress)
- 4 E2E WebKit tests (CI timing issues)

**Why strategic skips?**
- Prevents blocking deploys for legitimate in-progress work
- Documents known issues clearly
- Allows progress on other areas
- Maintains high baseline quality (99%+)

---

## DCYFR Testing Workflow

When implementing a feature or fix, follow this workflow:

### 1. Run Existing Tests
```bash
npm run test
```
Identifies which tests are affected by your changes.

### 2. Identify Affected Tests
- Which components changed?
- Which utilities changed?
- Which API routes changed?

### 3. Update Tests for New Behavior
If you changed a component's prop or behavior:
```typescript
// ✅ UPDATE - Component prop changed
it('renders with new prop', () => {
  const { getByText } = render(<Component newProp="value" />);
  expect(getByText('expected')).toBeInTheDocument();
});
```

### 4. Add Tests for New Features
For every new component, utility, or API:
```typescript
// ✅ ADD - New component
describe('NewComponent', () => {
  it('renders content', () => {
    const { getByText } = render(<NewComponent />);
    expect(getByText('content')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    const { getByRole } = render(<NewComponent />);
    const button = getByRole('button');
    fireEvent.click(button);
    expect(/* assertion */);
  });
});
```

### 5. Validate ≥99% Pass Rate
```bash
npm run test
# Output should show ≥99% pass rate
```

---

## When NOT to Write Tests

### ❌ Static Pages Without Logic
```typescript
// src/app/about/page.tsx
export default function About() {
  return (
    <PageLayout>
      <h1>About</h1>
      <p>Static content</p>
    </PageLayout>
  );
}

// ❌ No test needed - just JSX, no logic
```

### ❌ Trivial Prop Changes
```typescript
// ❌ DON'T test simple prop passing
it('renders with title prop', () => {
  const { getByText } = render(<Component title="Test" />);
  expect(getByText('Test')).toBeInTheDocument();
});
```

### ❌ Documentation Updates
```typescript
// ❌ No tests for .md files, comments, or docs
// Just review for accuracy
```

### ❌ Styling-Only Changes
```typescript
// ❌ Don't test CSS class application
it('has className', () => {
  const { container } = render(<Component />);
  expect(container.firstChild).toHaveClass('some-class');
});

// ✅ Instead: Visual regression test or manual check
```

---

## When TO Write Tests

### ✅ New Components with Logic
```typescript
// ✅ Component has conditional rendering
describe('PostCard', () => {
  it('shows draft badge for draft posts', () => {
    const { getByText } = render(<PostCard post={draftPost} />);
    expect(getByText('Draft')).toBeInTheDocument();
  });

  it('hides draft badge for published posts', () => {
    const { queryByText } = render(<PostCard post={publishedPost} />);
    expect(queryByText('Draft')).not.toBeInTheDocument();
  });
});
```

### ✅ API Routes
```typescript
// ✅ API route with validation
describe('POST /api/contact', () => {
  it('validates email format', async () => {
    const response = await POST(createRequest({ email: 'invalid' }));
    expect(response.status).toBe(400);
  });

  it('queues submission on valid input', async () => {
    const response = await POST(createRequest({ email: 'test@example.com' }));
    expect(response.status).toBe(202);
  });
});
```

### ✅ Utility Functions
```typescript
// ✅ Pure functions with logic
describe('slugify', () => {
  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Hello & World!')).toBe('hello-world');
  });
});
```

### ✅ State Management
```typescript
// ✅ Custom hooks with logic
describe('useCounterStore', () => {
  it('increments count', () => {
    const { result } = renderHook(() => useCounterStore());
    act(() => result.current.increment());
    expect(result.current.count).toBe(1);
  });
});
```

### ✅ Error Handling
```typescript
// ✅ Error boundaries and edge cases
describe('ImageComponent', () => {
  it('shows fallback on load error', () => {
    const { getByAltText } = render(<Image src="bad.jpg" fallback="/default.jpg" />);
    const img = getByAltText('image');
    fireEvent.error(img);
    expect(/* fallback visible */);
  });
});
```

---

## Strategic Test Skips

### Marking Tests as Skipped

```typescript
// ✅ Temporary skip while refactoring
describe.skip('ComponentBeingRefactored', () => {
  it('renders', () => {
    // Will not run during test suite
  });
});

// ✅ Skip specific test
it.skip('should handle edge case', () => {
  // Will not run during test suite
});
```

### Documenting Skips

```typescript
describe('ComponentBeingRefactored', () => {
  // @skip - Temporary skip during major refactor (PR #123)
  // Will be re-enabled when refactor is complete (ETA: Dec 15)
  it.skip('renders correctly', () => {
    // ...
  });
});
```

### Why Skip Instead of Delete?

- ✅ Preserves test logic
- ✅ Easy to re-enable
- ✅ Documents known issues
- ✅ Prevents regressions when re-enabling

---

## E2E Testing Strategy

### When to Use E2E Tests

E2E tests are for **critical user flows** only:

```typescript
// ✅ Critical flow: User can read blog
describe('Blog Reading', () => {
  test('user can navigate to blog and read post', async ({ page }) => {
    await page.goto('/blog');
    await page.click('[data-testid="post-link"]');
    await expect(page.locator('h1')).toContainText('Post Title');
  });
});

// ❌ Don't E2E test internal components
// Use unit tests for component logic
```

### WebKit Test Timing

Some WebKit E2E tests fail due to CI timing issues. These are marked as skipped:

```typescript
test.skip('webkit-specific timing issue', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'Timing issue on webkit');
  // Test implementation
});
```

---

## Test File Naming

```
src/
├── components/
│   ├── post-list.tsx
│   └── post-list.test.tsx        # Component tests
├── lib/
│   ├── slug.ts
│   └── slug.test.ts              # Utility tests
└── app/
    └── api/
        ├── contact/
        │   ├── route.ts
        │   └── route.test.ts      # API tests
```

---

## Coverage Targets

| Type | Target | Rationale |
|------|--------|-----------|
| **Components** | 80%+ | Complex UI logic needs coverage |
| **Utilities** | 90%+ | Pure functions should be well-tested |
| **API Routes** | 90%+ | Critical path requires validation |
| **Overall** | 70%+ baseline | Don't over-test trivial code |

---

## Running Tests

### All Tests
```bash
npm run test
```

### Watch Mode
```bash
npm run test -- --watch
```

### Specific File
```bash
npm run test -- post-list.test.tsx
```

### E2E Tests
```bash
npm run test:e2e
```

### Coverage Report
```bash
npm run test -- --coverage
```

---

## Quick Reference

| Question | Answer |
|----------|--------|
| **Pass rate target?** | ≥99% (1339/1346) |
| **Skip tests?** | Yes, strategically for blockers |
| **Test static pages?** | No |
| **Test logic?** | Yes, always |
| **Test CSS?** | No, use visual regression instead |
| **Test API routes?** | Yes, validation + business logic |
| **Test utilities?** | Yes, 90%+ coverage |
| **Test components?** | Yes if logic, no if just JSX |

---

## Related Documentation

- **Component Patterns:** `.github/agents/patterns/COMPONENT_PATTERNS.md`
- **API Patterns:** `.github/agents/patterns/API_PATTERNS.md`
- **Validation Checklist:** `.github/agents/enforcement/VALIDATION_CHECKLIST.md`
- **Testing Guide:** `docs/testing/README.md`

---
name: dcyfr-testing
description: Testing patterns, 99% pass rate target, strategic skips, and E2E workflows
compatibility: opencode
metadata:
  audience: developers
  workflow: testing
  category: quality-assurance
---

## What I do

I ensure DCYFR testing follows quality standards:

- **99% test pass rate** target (not 100%)
- **Strategic skips** for valid reasons (not failures)
- **When/when-not-to-test** decision making
- **E2E testing** with Playwright
- **Test data protection** with environment checks

## When to use me

✅ **Use this skill when:**
- Writing new tests for components or API routes
- Deciding whether to skip tests strategically
- Setting up E2E test suites
- Fixing failing tests
- Reviewing test coverage

❌ **Don't use this skill for:**
- Production deployments (tests run in CI)
- Manual testing workflows
- Performance benchmarking (use separate tools)

## Core Rules

### 1. 99% Pass Rate Target (Not 100%)

**Why not 100%?**
- Strategic skips are acceptable for valid reasons
- Flaky tests should be skipped temporarily (with GitHub issues)
- Environment-specific tests (e.g., requires Redis) can be skipped

**Current status:** 1659/1717 tests passing (96.6%)

### 2. Strategic Skips vs Failures

```typescript
// ✅ CORRECT: Strategic skip with reason
test.skip('renders with Redis data', () => {
  // Skipped: Requires Redis connection (issue #123)
});

// ❌ WRONG: Failing test left as-is
test('renders with Redis data', () => {
  expect(fetchData()).resolves.toBe(data); // Fails in CI
});
```

### 3. When to Write Tests

✅ **Always test:**
- Public API routes (validation, error handling)
- Utility functions (pure functions, data transformations)
- Critical user flows (auth, payments, form submissions)
- Bug fixes (regression tests)

⚠️ **Sometimes test:**
- UI components (if complex logic or many props)
- Integration points (database, external APIs)
- Edge cases (boundary conditions)

❌ **Don't test:**
- Simple pass-through components (`<div>{children}</div>`)
- Third-party library internals
- Implementation details (use public APIs)

## Test Commands

```bash
# Run tests once (no watch) - RECOMMENDED for AI agents
npm run test:run

# Run specific test file
npm run test:run src/components/blog/post-card.test.tsx

# Run E2E tests
npm run test:e2e

# Run E2E in headed mode (see browser)
npm run test:e2e:headed

# Full quality check (type + lint + test)
npm run check
```

**⚠️ For AI Agents:** Always use `npm run test:run` instead of `npm test` to avoid watch mode hanging.

## Common Test Patterns

### Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { PostCard } from './post-card';

describe('PostCard', () => {
  it('renders post title and excerpt', () => {
    render(
      <PostCard
        title="Test Post"
        excerpt="Test excerpt"
        date="2024-01-01"
        slug="test-post"
      />
    );

    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('Test excerpt')).toBeInTheDocument();
  });
});
```

### API Route Test

```typescript
import { POST } from './route';
import { NextRequest } from 'next/server';

describe('/api/submit', () => {
  it('validates required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/submit', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields');
  });
});
```

### Utility Function Test

```typescript
import { formatDate } from './date-utils';

describe('formatDate', () => {
  it('formats date as YYYY-MM-DD', () => {
    expect(formatDate(new Date('2024-01-15'))).toBe('2024-01-15');
  });

  it('handles invalid dates', () => {
    expect(formatDate(null)).toBe('');
  });
});
```

## E2E Testing with Playwright

### Basic E2E Test

```typescript
import { test, expect } from '@playwright/test';

test('navigates to blog and filters by category', async ({ page }) => {
  await page.goto('/blog');

  await expect(page.getByRole('heading', { name: 'Blog' })).toBeVisible();

  await page.getByRole('button', { name: 'Web Development' }).click();

  await expect(page.getByText('Showing posts in: Web Development')).toBeVisible();
});
```

### Authenticated E2E Test

```typescript
test.use({ storageState: 'playwright/.auth/user.json' });

test('creates new post as admin', async ({ page }) => {
  await page.goto('/admin/posts/new');

  await page.fill('[name="title"]', 'New Post');
  await page.fill('[name="content"]', 'Post content');

  await page.click('[type="submit"]');

  await expect(page.getByText('Post created')).toBeVisible();
});
```

## Test Data Protection

**All test data MUST have environment checks:**

```typescript
// ✅ CORRECT: Environment-protected test data
if (process.env.NODE_ENV !== 'production' && process.env.VERCEL_ENV !== 'production') {
  await redis.set('test:user:123', { name: 'Test User' });
}

// ❌ WRONG: No environment checks
await redis.set('test:user:123', { name: 'Test User' });
```

## Strategic Skip Reasons

Valid reasons to skip tests:

1. **Environment-specific** - Requires Redis, Postgres, etc.
2. **Flaky test** - Intermittent failures (create GitHub issue)
3. **Component refactor planned** - Will be rewritten soon
4. **CI timing issues** - E2E tests timeout in CI only
5. **External dependency** - Requires third-party API

## Related Documentation

- **Full testing patterns**: `.github/agents/patterns/TESTING_PATTERNS.md`
- **Test data prevention**: `.github/agents/enforcement/TEST_DATA_PREVENTION.md`
- **Automated testing guide**: `docs/testing/automated-testing-guide.md`

## Approval Gates

Testing compliance is **FLEXIBLE** (warning only):

- ⚠️ Target: ≥99% test pass rate
- ⚠️ Strategic skips allowed (document reason)
- ✅ Must maintain ≥95% pass rate minimum
- ✅ All tests must run (no permanent skips without issues)

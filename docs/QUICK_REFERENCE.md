{/_ TLP:CLEAR _/}

# Quick Reference - DCYFR Labs

**Fast access to frequently used documentation**
**Information Classification:** TLP:CLEAR (Public)

---

## 🚀 Getting Started (5 minutes)

```bash
# Install dependencies
npm install

# Start development
npm run dev           # Next.js dev server (http://localhost:3000)
npm run inngest:dev   # Inngest dev server (http://localhost:8288)

# Run checks
npm run check         # TypeScript + ESLint + tests
npm run test:run      # Run tests once (no watch)
```

---

## 📖 Most Used Docs

### Development

| Topic                   | Link                                                                          | Use When                    |
| ----------------------- | ----------------------------------------------------------------------------- | --------------------------- |
| **Design Tokens**       | [docs/design/design-tokens.md](design/design-tokens.md)                       | Building UI components      |
| **Component Patterns**  | [docs/ai/component-patterns.md](ai/component-patterns.md)                     | Creating page layouts       |
| **Best Practices**      | [docs/ai/best-practices.md](ai/best-practices.md)                             | API patterns & workflows    |
| **Inngest Integration** | [docs/features/inngest/INDEX.md](features/inngest/INDEX.md)                   | Background jobs & workflows |
| **Testing Patterns**    | [docs/testing/automated-testing-guide.md](testing/automated-testing-guide.md) | Writing tests               |

### Project Info

| Topic            | Link                                      | Use When                   |
| ---------------- | ----------------------------------------- | -------------------------- |
| **README**       | [README.md](../README.md)                 | Project overview           |
| **Tech Stack**   | [CLAUDE.md#quick-reference](../CLAUDE.md) | Understanding architecture |
| **Contributing** | [CONTRIBUTING.md](../CONTRIBUTING.md)     | Making contributions       |
| **Changelog**    | [CHANGELOG.md](../CHANGELOG.md)           | Recent changes             |

### Operations

| Topic                    | Link                                                                          | Use When                  |
| ------------------------ | ----------------------------------------------------------------------------- | ------------------------- |
| **Maintenance Playbook** | [docs/operations/MAINTENANCE_PLAYBOOK.md](operations/MAINTENANCE_PLAYBOOK.md) | Routine maintenance       |
| **Cleanup Log**          | [docs/operations/CLEANUP_LOG.md](operations/CLEANUP_LOG.md)                   | Recovering deleted files  |
| **TODO Review**          | [docs/operations/TODO_REVIEW.md](operations/TODO_REVIEW.md)                   | Understanding TODO status |

---

## 🎨 Design System

### Tokens (Mandatory)

**Always use design tokens - never hardcode values!**

```typescript
import { SPACING, TYPOGRAPHY, SEMANTIC_COLORS } from '@/lib/design-tokens';

// ✅ Correct
<div className={SPACING.SECTION_X}> // → "px-6 lg:px-8"

// ❌ Wrong
<div className="px-6">  // Hardcoded, will break themes
```

**Token Categories:**

- **SPACING**: Margins, padding, gaps (`SECTION_X`, `SECTION_Y`, `STACK_XS` to `STACK_2XL`)
- **TYPOGRAPHY**: Font sizes, weights, line heights (`TEXT_SM`, `HEADING_2XL`)
- **SEMANTIC_COLORS**: Text, backgrounds, borders (`TEXT.PRIMARY`, `BG.SECONDARY`)

**Learn more:** [docs/design/design-tokens.md](design/design-tokens.md)

---

## 🏗️ Common Patterns

### Page Layout (90% Rule)

**Use PageLayout for 90% of pages:**

```typescript
import { PageLayout } from '@/components/layouts';

export default function MyPage() {
  return (
    <PageLayout
      title="Page Title"
      description="Page description"
      backgroundImage={{ url: '/images/hero.jpg', alt: 'Hero' }}
    >
      <p>Page content here</p>
    </PageLayout>
  );
}
```

**Decision tree:** [docs/ai/component-patterns.md#pagelayout-decision-tree](ai/component-patterns.md)

---

### API Routes (Validate → Queue → Respond)

```typescript
// 1. VALIDATE
const validated = schema.parse(await request.json());

// 2. QUEUE (Inngest)
await inngest.send({ name: 'app/event', data: validated });

// 3. RESPOND (immediate)
return NextResponse.json({ success: true });
```

**Learn more:** [docs/features/inngest/INDEX.md](features/inngest/INDEX.md)

---

### Barrel Exports

**Always import from barrel exports:**

```typescript
// ✅ Correct
import { Button, Card } from '@/components/ui';
import { PageLayout } from '@/components/layouts';

// ❌ Wrong
import { Button } from '@/components/ui/button';
```

**Learn more:** [docs/ai/component-patterns.md#barrel-exports](ai/component-patterns.md)

---

## 🧪 Testing

### Run Tests

```bash
# All tests (no watch)
npm run test:run

# Specific file
npm run test:run src/__tests__/components/button.test.tsx

# With coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('ComponentName', () => {
  it('should render successfully', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

**Learn more:** [docs/testing/automated-testing-guide.md](testing/automated-testing-guide.md)

---

## 🔧 Common Commands

### Development

```bash
npm run dev               # Start Next.js dev server
npm run inngest:dev       # Start Inngest dev server
npm run format            # Format code with Prettier
npm run lint              # Run ESLint
npm run lint -- --fix     # Auto-fix ESLint issues
```

### Quality Checks

```bash
npm run check             # TypeScript + ESLint + tests (all checks)
npm run typecheck         # TypeScript type checking only
npm run test:run          # Run tests once (recommended for CI/pre-commit)
npm run test:coverage     # Test coverage report
```

### Build & Deploy

```bash
npm run build             # Production build
npm run start             # Start production server
npm run validate:build    # Validate build output
```

### Utilities

```bash
npm run find:token-violations  # Find hardcoded values (design tokens)
npm run validate:tokens        # Check design token compliance (exit 0 if compliant)
npm run fix:tokens             # Auto-fix token violations
npm run lint:test-data         # Check for fabricated/test data in production
npm run validate:links         # Check for broken links
npm run mcp:check              # Check MCP server health
```

---

## 📂 Project Structure

```
dcyfr-labs/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities and shared code
│   ├── inngest/          # Inngest functions
│   └── __tests__/        # Tests
├── docs/                 # Documentation (you are here!)
├── e2e/                  # E2E tests (Playwright)
├── scripts/              # Build and utility scripts
└── public/               # Static assets
```

---

## 🆘 Troubleshooting

### Issue: Tests hanging

**Cause:** Using `npm test` (watch mode)
**Fix:** Use `npm run test:run` instead

### Issue: Design token violations

**Cause:** Hardcoded spacing/colors
**Fix:**

1. Find violations: `npm run find:token-violations`
2. Auto-fix common patterns: `npm run fix:tokens`
3. Manually replace remaining hardcoded values with design tokens:
   ```typescript
   import { SPACING, TYPOGRAPHY } from '@/lib/design-tokens';
   ```

### Issue: Test data in production

**Cause:** Demo/fabricated data not environment-guarded
**Fix:** Ensure all test data is protected:

```typescript
// ✅ CORRECT
if (process.env.NODE_ENV === 'production') {
  return null; // Don't use test data in production
}
return mockData;
```

### Issue: Inngest function not triggering

**Cause:** Inngest dev server not running or event name mismatch
**Fix:**

1. Start Inngest: `npm run inngest:dev`
2. Check event name matches exactly
3. View logs at http://localhost:8288

### Issue: TypeScript errors

**Cause:** Missing type definitions or configuration
**Fix:** Run `npm run typecheck` to see full errors

---

## 📚 Full Documentation Index

For complete documentation structure, see: [docs/INDEX.md](INDEX.md)

**Key Sections:**

- **AI**: AI agent instructions, patterns, decision trees
- **Design**: Design system, tokens, components
- **Features**: Feature documentation (Inngest, analytics, etc.)
- **Operations**: Maintenance, cleanup, troubleshooting
- **Testing**: Testing guides and patterns

---

**Last Updated:** January 17, 2026
**Maintained By:** DCYFR Labs Team

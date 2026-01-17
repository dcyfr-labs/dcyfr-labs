---
name: dcyfr-design-tokens
description: Enforce DCYFR design token patterns and fix hardcoded values
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: compliance
  category: design-system
---

## What I do

I enforce strict design token compliance across the DCYFR portfolio project by:

- Detecting hardcoded Tailwind values (gap-8, text-3xl, max-w-4xl, etc.)
- Replacing them with proper design tokens from `@/lib/design-tokens`
- Validating color, spacing, typography, and container width usage
- Providing ESLint auto-fix guidance for common violations

## When to use me

✅ **Use this skill when:**
- Fixing ESLint design token violations (`@dcyfr/design-tokens/*`)
- Converting legacy code to use design tokens
- Reviewing PRs for token compliance
- Implementing new components following DCYFR patterns

❌ **Don't use this skill for:**
- General Tailwind CSS questions (use documentation)
- Non-DCYFR projects (patterns are project-specific)
- Performance optimization (use dcyfr-performance skill)

## Core Rules (NON-NEGOTIABLE)

### 1. Import Design Tokens

```typescript
// ✅ CORRECT: Import tokens
import { SPACING, TYPOGRAPHY, CONTAINER_WIDTHS, COLORS } from "@/lib/design-tokens";

// ❌ WRONG: Hardcoded values
<div className="gap-8 text-3xl max-w-4xl text-gray-900">
```

### 2. Use Token Categories

| Category | Import | Example Usage |
|----------|--------|---------------|
| **Spacing** | `SPACING.section`, `SPACING.content` | `mt-${SPACING.section}` |
| **Typography** | `TYPOGRAPHY.h1.standard` | `className={TYPOGRAPHY.h1.standard}` |
| **Containers** | `CONTAINER_WIDTHS.standard` | `className={CONTAINER_WIDTHS.standard}` |
| **Colors** | `COLORS.text.primary` | `className={COLORS.text.primary}` |

### 3. Common Replacements

```typescript
// Spacing
gap-8     → gap-${SPACING.content}
mt-16     → mt-${SPACING.section}
p-4       → p-${SPACING.card}

// Typography
text-3xl  → ${TYPOGRAPHY.h1.standard}
text-sm   → text-base (use standard sizes)

// Containers
max-w-4xl → ${CONTAINER_WIDTHS.standard}
max-w-7xl → ${CONTAINER_WIDTHS.wide}

// Colors
text-gray-900     → ${COLORS.text.primary}
bg-neutral-50     → ${COLORS.background.subtle}
```

## Validation Commands

```bash
# Check design token compliance
npm run lint

# Auto-fix violations
npm run lint -- --fix

# Enhanced validation (OpenCode-specific)
npm run check:opencode
```

## ESLint Rules

The project uses custom ESLint rules to enforce design tokens:

- `@dcyfr/design-tokens/no-hardcoded-spacing` - Blocks `gap-*`, `mt-*`, `p-*`
- `@dcyfr/design-tokens/no-hardcoded-typography` - Blocks `text-*` size utilities
- `@dcyfr/design-tokens/no-hardcoded-containers` - Blocks `max-w-*`

**Target: ≥90% design token compliance**

## Common Patterns

### Blog Post Card

```typescript
import { SPACING, TYPOGRAPHY, CONTAINER_WIDTHS } from "@/lib/design-tokens";

export function PostCard() {
  return (
    <article className={`flex flex-col gap-${SPACING.content}`}>
      <h2 className={TYPOGRAPHY.h2.standard}>
        {title}
      </h2>
      <div className={`mt-${SPACING.content}`}>
        {excerpt}
      </div>
    </article>
  );
}
```

### Page Layout

```typescript
import { PageLayout } from "@/components/layouts";
import { CONTAINER_WIDTHS, SPACING } from "@/lib/design-tokens";

export default function Page() {
  return (
    <PageLayout>
      <div className={`mx-auto ${CONTAINER_WIDTHS.standard}`}>
        <div className={`mt-${SPACING.section}`}>
          Content
        </div>
      </div>
    </PageLayout>
  );
}
```

## Related Documentation

- **Full enforcement rules**: `.github/agents/enforcement/DESIGN_TOKENS.md`
- **Quick reference**: `docs/ai/quick-reference.md`
- **Component patterns**: `.github/agents/patterns/COMPONENT_PATTERNS.md`

## Approval Gates

Design token violations are **STRICT** (hard block):

- ❌ PR builds fail with ESLint errors
- ❌ Pre-commit hooks warn about violations
- ✅ Must fix before merging

**No exceptions** - design tokens are mandatory for visual consistency.

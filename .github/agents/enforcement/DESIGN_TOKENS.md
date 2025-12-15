# Design Token Enforcement

**File:** `.github/agents/enforcement/DESIGN_TOKENS.md`  
**Last Updated:** December 9, 2025  
**Scope:** Design system rules, token usage, mandatory compliance

---

## Core Principle: Design Tokens Are NON-NEGOTIABLE

All styling **must** use design tokens. Hardcoded values are not allowed in this project.

**Enforcement:**
- ✅ ESLint catches violations (warnings)
- ✅ Pre-commit hooks block commits with errors
- ✅ DCYFR validates before completion
- ✅ CI/CD requires ≥90% compliance

---

## Token Categories

### SPACING

```typescript
import { SPACING } from "@/lib/design-tokens";

// ✅ CORRECT - Use tokens
<div className={`mt-${SPACING.content}`}>Content</div>
<div className={`gap-${SPACING.small}`}>Gap</div>

// ❌ WRONG - Hardcoded values
<div className="mt-8">Content</div>
<div className="gap-4">Gap</div>
```

**Available Values:**
- `SPACING.xs` - Extra small (4px)
- `SPACING.sm` - Small (8px)
- `SPACING.content` - Content default (16px)
- `SPACING.lg` - Large (24px)
- `SPACING.xl` - Extra large (32px)
- `SPACING.page` - Page margin (48px)

### TYPOGRAPHY

```typescript
import { TYPOGRAPHY } from "@/lib/design-tokens";

// ✅ CORRECT - Use tokens
<h1 className={TYPOGRAPHY.h1.standard}>Title</h1>
<p className={TYPOGRAPHY.body.default}>Text</p>
<span className={TYPOGRAPHY.label.small}>Label</span>

// ❌ WRONG - Hardcoded values
<h1 className="text-3xl font-semibold">Title</h1>
<p className="text-base">Text</p>
```

**Available Styles:**
- `h1`, `h2`, `h3`, `h4`, `h5`, `h6` (headings)
- `body` (body text variants)
- `label` (small labels)
- `caption` (captions)

**Variants:**
- `.standard` - Default variant
- `.compact` - Reduced size
- `.extended` - Expanded size

### CONTAINER WIDTHS

```typescript
import { CONTAINER_WIDTHS } from "@/lib/design-tokens";

// ✅ CORRECT - Use tokens
<div className={`mx-auto ${CONTAINER_WIDTHS.standard}`}>
  Content
</div>

// ❌ WRONG - Hardcoded values
<div className="mx-auto max-w-4xl">
  Content
</div>
```

**Available Widths:**
- `CONTAINER_WIDTHS.standard` - Default (54rem)
- `CONTAINER_WIDTHS.wide` - Wide layout (72rem)
- `CONTAINER_WIDTHS.narrow` - Narrow layout (36rem)

### COLOR TOKENS

```typescript
import { COLORS } from "@/lib/design-tokens";

// ✅ CORRECT
<div style={{ color: COLORS.text.primary }}>
  Primary text
</div>

// ❌ WRONG
<div style={{ color: "#000000" }}>
  Primary text
</div>
```

**Categories:**
- `COLORS.text` - Text colors
- `COLORS.background` - Background colors
- `COLORS.border` - Border colors
- `COLORS.accent` - Accent colors

---

## Common Patterns

### Margin & Padding

```typescript
// ✅ CORRECT - All spacing uses tokens
<div className={`p-${SPACING.content} mt-${SPACING.lg}`}>
  Content
</div>

// ❌ WRONG - Mixed hardcoded and tokens
<div className={`p-${SPACING.content} mt-8`}>
  Content
</div>
```

### Headings with Spacing

```typescript
// ✅ CORRECT
<div className={`mb-${SPACING.lg}`}>
  <h1 className={TYPOGRAPHY.h1.standard}>Title</h1>
</div>

// ❌ WRONG - Hardcoded values
<div className="mb-8">
  <h1 className="text-3xl font-bold">Title</h1>
</div>
```

### Responsive Spacing

```typescript
// ✅ CORRECT - Use Tailwind with tokens
<div className={`p-${SPACING.sm} md:p-${SPACING.content}`}>
  Responsive padding
</div>

// ❌ WRONG - Hardcoded responsive values
<div className="p-4 md:p-8">
  Responsive padding
</div>
```

---

## Implementation Guide

### Step 1: Import Tokens

```typescript
import { SPACING, TYPOGRAPHY, CONTAINER_WIDTHS } from "@/lib/design-tokens";
```

### Step 2: Replace Hardcoded Values

**Before:**
```typescript
<div className="space-y-8">
  <h1 className="text-3xl font-semibold">Title</h1>
  <p className="text-base">Description</p>
</div>
```

**After:**
```typescript
<div className={`space-y-${SPACING.content}`}>
  <h1 className={TYPOGRAPHY.h1.standard}>Title</h1>
  <p className={TYPOGRAPHY.body.default}>Description</p>
</div>
```

### Step 3: Use in Page Layouts

```typescript
export default function Page() {
  return (
    <PageLayout>
      <div className={`mx-auto ${CONTAINER_WIDTHS.standard}`}>
        <h1 className={TYPOGRAPHY.h1.standard}>Page Title</h1>
        <div className={`mt-${SPACING.content}`}>
          Content
        </div>
      </div>
    </PageLayout>
  );
}
```

---

## ESLint Validation

### Rules Enforced

The ESLint configuration prevents hardcoded values:

```javascript
// eslint.config.mjs
{
  rules: {
    'no-hardcoded-tailwind': ['warn', {
      allowed: ['space-y-0', 'space-x-0'], // Only allow zero spacing hardcoded
      message: 'Use design tokens from @/lib/design-tokens instead'
    }]
  }
}
```

### Common Violations

**Won't compile/commit:**
- `className="mt-8"` → Use `SPACING.lg`
- `className="text-3xl"` → Use `TYPOGRAPHY.h1`
- `className="max-w-4xl"` → Use `CONTAINER_WIDTHS.standard`
- `className="text-gray-600"` → Use `COLORS.text.secondary`

---

## Compliance Targets

| Metric | Target | Method |
|--------|--------|--------|
| **Overall compliance** | ≥90% | Run `npm run validate-design-tokens` |
| **New code** | 100% | DCYFR enforces before merge |
| **Legacy code** | ≥80% | Gradual migration allowed |

---

## Validation Commands

### Check Compliance

```bash
# Run design token validator
npm run validate-design-tokens

# Output example:
# ✅ Design Token Compliance: 92%
# ⚠️ 15 hardcoded values found (use tokens instead)
```

### Fix Violations

```bash
# ESLint can auto-fix some violations
npm run lint -- --fix

# Manual check for violations
grep -r "className=\"[a-z]" src/ | grep -v SPACING
```

---

## Migration Path for Legacy Code

### Priority 1 (Critical Components)
- PageLayout
- Article & Archive layouts
- Post components
- Navigation

### Priority 2 (High-Traffic Pages)
- Blog archive
- Work portfolio
- Home page

### Priority 3 (Everything Else)
- Utility components
- Dev-only pages
- Admin components

---

## Design Tokens File

**Location:** `src/lib/design-tokens.ts`

```typescript
export const SPACING = {
  xs: '1',     // 4px
  sm: '2',     // 8px
  content: '4', // 16px
  lg: '6',     // 24px
  xl: '8',     // 32px
  page: '12',  // 48px
} as const;

export const TYPOGRAPHY = {
  h1: {
    standard: 'text-4xl font-bold leading-tight',
    compact: 'text-3xl font-semibold',
    extended: 'text-5xl font-bold',
  },
  // ... more styles
} as const;

export const CONTAINER_WIDTHS = {
  standard: 'max-w-4xl',
  wide: 'max-w-6xl',
  narrow: 'max-w-2xl',
} as const;
```

---

## Quick Reference

| Token | Use | Example |
|-------|-----|---------|
| **SPACING** | Margins, padding, gaps | `className={`mt-${SPACING.lg}`}` |
| **TYPOGRAPHY** | Text styling | `className={TYPOGRAPHY.h1.standard}` |
| **CONTAINER_WIDTHS** | Max widths | `className={CONTAINER_WIDTHS.standard}` |
| **COLORS** | Colors | `className={COLORS.text.primary}` |

---

## Related Documentation

- **Component Patterns:** `.github/agents/patterns/COMPONENT_PATTERNS.md`
- **Validation Checklist:** `.github/agents/enforcement/VALIDATION_CHECKLIST.md`
- **Design System:** `docs/ai/DESIGN_SYSTEM.md`
- **Quick Reference:** `docs/ai/QUICK_REFERENCE.md`

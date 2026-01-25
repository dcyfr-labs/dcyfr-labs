{/* TLP:CLEAR */}

# Enforcement Rules

Automated validation and mandatory patterns enforced via ESLint, pre-commit hooks, and CI/CD.

## Table of Contents

- [Design Token Enforcement](#design-token-enforcement)
- [Pre-commit Validation](#pre-commit-validation)
- [CI/CD Requirements](#cicd-requirements)
- [Validation Scripts](#validation-scripts)

---

## Design Token Enforcement

**Current compliance: 92% across all components** ✅

**Status: MANDATORY** - Non-compliant code will be flagged by ESLint and blocked in pre-commit hooks.

### What Are Design Tokens?

Centralized constants for spacing, typography, colors, and breakpoints. Located in `src/lib/design-tokens.ts`.

**Why strict enforcement?**
- Consistent spacing across 100+ components
- Typography hierarchy (h1-h6, body, display)
- Light/dark mode theming
- Responsive breakpoints
- Easy global redesigns

### Import and Use

```typescript
import { SPACING, TYPOGRAPHY, HOVER_EFFECTS, CONTAINER_WIDTHS } from "@/lib/design-tokens";

// ✅ CORRECT - Use tokens
<div className={`gap-${SPACING.content} p-${SPACING.element}`}>
  <h1 className={TYPOGRAPHY.h1.standard}>Title</h1>
  <button className={HOVER_EFFECTS.button}>Click</button>
</div>

// ❌ WRONG - Hardcoded values (ESLint will warn)
<div className="gap-8 p-4">
  <h1 className="text-3xl font-semibold">Title</h1>
  <button className="hover:scale-105">Click</button>
</div>
```

### Available Tokens

```typescript
// Spacing (VERTICAL spacing only - for space-y-* patterns)
SPACING = {
  section: "space-y-10 md:space-y-12",    // Major page sections
  subsection: "space-y-6 md:space-y-8",   // Related content blocks
  content: "space-y-4",                   // Within content blocks
  proseHero: "prose space-y-4",           // Page hero sections
  proseSection: "prose space-y-4",        // Generic prose sections
  image: "mt-6 mb-6 md:mt-8 md:mb-8",    // Image elements
}

// Typography (semantic headings)
TYPOGRAPHY = {
  h1: { standard: "...", hero: "...", article: "..." },
  h2: { standard: "...", featured: "..." },
  h3: { standard: "..." },
  // ... h4, h5, h6, body variants
}

// Container widths
CONTAINER_WIDTHS = {
  narrow: "max-w-4xl",
  standard: "max-w-5xl",
  content: "max-w-6xl",
  archive: "max-w-7xl",
  dashboard: "max-w-[1536px]",
}

// Hover effects
HOVER_EFFECTS = {
  button: "transition-shadow hover:shadow-xl...",
  card: "transition-all hover:shadow-lg...",
  // ...
}
```

### ⚠️ SPACING Token Critical Rules

**SPACING tokens are ONLY for vertical spacing (space-y-*).**

Valid SPACING tokens:
- `SPACING.section` - Major page sections (space-y-10 md:space-y-12)
- `SPACING.subsection` - Content blocks (space-y-6 md:space-y-8)
- `SPACING.content` - Within blocks (space-y-4)
- `SPACING.compact` - Dense lists/alerts (space-y-2)
- `SPACING.postList` - Blog post card lists (space-y-2) ⭐ **New for blog spacing**
- `SPACING.list` - Item lists (no spacing / tight)

**✅ CORRECT Usage:**
```tsx
// Use SPACING tokens directly for vertical spacing
<div className={SPACING.section}>
  <section>...</section>
</div>

// Blog post lists must use SPACING.postList (guardrail for consistency)
<div className={SPACING.postList}>
  {posts.map(post => <PostCard key={post.id} {...post} />)}
</div>

// Use numeric values for gap, padding, small spacing
<div className="flex gap-4">
  <div className="p-4 space-y-2">...</div>
</div>
```

**❌ INCORRECT Usage (Build Failures):**
```tsx
// ❌ Hardcoded spacing in blog post lists
<div className="space-y-3">  // WRONG: Use SPACING.postList instead
  {posts.map(...)}
</div>

// ❌ Template literals with non-existent SPACING properties
<div className={`gap-${SPACING.compact}`}>  // SPACING has no 'compact' for gaps
<div className={`space-y-${SPACING.tight}`}>  // SPACING has no 'tight'

// ❌ Using SPACING for non-vertical spacing
<div className={`p-${SPACING.content}`}>  // SPACING is for space-y only
```

**Common Mistakes:**
- Using hardcoded `space-y-*` in blog post lists (use `SPACING.postList`)
- Using non-existent properties: `SPACING.tight`, `SPACING.small`, `SPACING.dense`
- Using SPACING in template literals for inline properties (gap, padding)
- Using SPACING for horizontal spacing

**⭐ Blog Post List Guardrail:**
All blog post card list containers MUST use `SPACING.postList`. This is NOT negotiable - it ensures consistent spacing across:
- Homepage featured posts
- Blog archive page (/blog)
- Search results
- Tag/category filtered lists

**⭐ List Item Spacing Guardrail:**
List item (`<li>`) vertical spacing is ONLY controlled by the parent container's `SPACING.list` token or class.
- `.prose li` must have `margin-top: 0; margin-bottom: 0;` (NO hardcoded margins)
- `.prose li` line-height is explicitly set to `1.6` to override global `.prose { line-height: 1.9; }`
- Never add `margin-top` or `margin-bottom` to `li` elements in globals.css
- Never let global prose rules override list item line-height (list items need compact spacing)
- Parent `<ul>` or `<ol>` elements control all spacing via SPACING tokens
- This prevents unintended whitespace between list items

**Where to control list spacing:**
```tsx
// ✅ CORRECT: Control spacing via parent container
<ul className={SPACING.list}>  {/* SPACING.list = "" for tight spacing */}
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

// ❌ WRONG: Never add margins to li elements in CSS
.prose li {
  margin-top: 0.5rem;  // ❌ DO NOT DO THIS
}
```

If you see: `Property 'X' does not exist on type 'SPACING'`
**Solution:** Check the valid SPACING properties above or use numeric values (2, 4, 6, 8)

### ESLint Rules

**File:** `eslint.config.mjs`

Prohibited patterns (will trigger ESLint warnings):

```javascript
// ❌ Hardcoded spacing (gap-5 to gap-9, p-6, p-7, space-y-6, etc.)
"Selector[value=/gap-[5-9]/]"
"Selector[value=/p-[67]/]"
"Selector[value=/space-y-[5-9]/]"

// ❌ Inline typography combinations (text-* + font-*)
// Examples that will be flagged:
//   "text-3xl font-semibold" → Use {TYPOGRAPHY.h1.standard}
//   "text-2xl font-semibold" → Use {TYPOGRAPHY.h2.standard}
//   "text-sm font-medium" → Use {TYPOGRAPHY.label.small}
"Selector[value=/text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl).*font-(bold|semibold|medium)/]"

// ❌ Hardcoded animation durations (duration-150, duration-300, transition-300, etc.)
// Examples that will be flagged:
//   "duration-150" → Use {ANIMATION.duration.fast} or .transition-movement
//   "duration-300" → Use {ANIMATION.duration.normal} or .transition-appearance
//   "duration-500" → Use {ANIMATION.duration.slow} or .transition-theme
"Selector[value=/\\b(duration|transition)-(75|100|150|200|300|500|700|1000)\\b/]"

// ❌ Hardcoded container widths (max-w-[px] patterns)
"Selector[value=/max-w-\\[\\d+px\\]/]"

// ❌ Manual hover effects (individual scale/shadow classes)
"Selector[value=/hover:scale-/]"
"Selector[value=/transition-all.*hover:shadow-(sm|md|lg|xl|2xl)/]"
```

**New Rules (2024-01):**
- **Typography enforcement** - Prevents mixing text-* and font-* classes
- **Animation duration enforcement** - Requires ANIMATION.duration tokens or transition utilities
- **Improved hover effect detection** - Catches transition-all + hover:shadow patterns

**Why These Rules?**
- **Consistency** - 150+ components use the same animation speeds
- **Maintainability** - Change durations globally via design tokens
- **Performance** - Transition utilities use optimized CSS custom properties
- **Accessibility** - Respects prefers-reduced-motion automatically

**Exclusions:**
- `src/components/ui/**` - shadcn/ui uses its own system
- `src/lib/design-tokens.ts` - Token definitions
- `**/loading.tsx`, `**/skeleton.tsx` - Mirror component structure

### Exceptions (Rare)

If you have a legitimate reason to bypass token enforcement:

1. Add ESLint disable comment with explanation:
```typescript
// eslint-disable-next-line no-restricted-syntax -- Reason: shadcn/ui pattern
<div className="gap-5">
```

2. Document in PR why token doesn't apply

---

## Pre-commit Validation

**Husky + lint-staged** runs on every commit.

### What Gets Validated

```json
// package.json lint-staged config
"*.{ts,tsx}": [
  "eslint --fix",                                    // Auto-fix linting errors
  "node scripts/validate-design-tokens.mjs --warn-only --files"  // Check tokens
]
```

### Behavior

1. **ESLint auto-fixes** - Formatting and simple rule violations
2. **Design token validation** - Warns on hardcoded values (non-blocking)
3. **Commit blocked** if ESLint errors remain after auto-fix

### Manual Validation

```bash
# Check design tokens before committing
node scripts/validate-design-tokens.mjs

# Check specific files
node scripts/validate-design-tokens.mjs --files src/components/my-component.tsx

# Generate full report
node scripts/validate-design-tokens.mjs --output report.json
```

---

## CI/CD Requirements

**All PRs must pass these checks before merge:**

### GitHub Actions Workflows

1. **Design System Validation** (`.github/workflows/design-system-validation.yml`)
   - Runs `validate-design-tokens.mjs`
   - Posts PR comment with violations
   - Blocks merge if compliance drops below 90%

2. **Test Suite** (`.github/workflows/test.yml`)
   - Unit tests: `npm run test`
   - Integration tests: `npm run test:integration`
   - E2E tests: `npm run test:e2e`
   - **Pass rate:** ≥99% (currently 99.5%)

3. **Lighthouse CI** (`.github/workflows/lighthouse.yml`)
   - Performance: ≥90
   - Accessibility: ≥95
   - Best Practices: ≥90
   - SEO: ≥95

4. **TypeScript** (`npm run typecheck`)
   - Strict mode enabled
   - Zero type errors allowed

5. **ESLint** (`npm run lint`)
   - Zero errors allowed
   - Warnings permitted but discouraged

### Quality Gates

```bash
# Run all checks locally (same as CI)
npm run check

# Individual checks
npm run lint          # ESLint
npm run typecheck     # TypeScript
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run build         # Production build
```

---

## Validation Scripts

Located in `scripts/` directory.

### Design Token Validator

**File:** `scripts/validate-design-tokens.mjs`

**Usage:**
```bash
# Default - check all files
node scripts/validate-design-tokens.mjs

# Specific files
node scripts/validate-design-tokens.mjs --files src/components/**/*.tsx

# Warn only (don't exit with error)
node scripts/validate-design-tokens.mjs --warn-only

# JSON output
node scripts/validate-design-tokens.mjs --output report.json
```

**Checks:**
- Hardcoded spacing values (`gap-5`, `p-6`, etc.)
- Inline typography patterns (`text-3xl`, `font-semibold`)
- Hardcoded widths (`max-w-[1120px]`)
- Manual hover effects (`hover:scale-105`)

**Output:**
```
✅ Design Token Compliance: 92%
⚠️  Found 15 violations in 8 files:

src/components/example.tsx:
  Line 42: gap-8 (use SPACING.content)
  Line 56: text-3xl font-semibold (use TYPOGRAPHY.h1.standard)
```

### Other Validators

```bash
# Blog frontmatter validation
node scripts/validate-frontmatter.mjs

# Markdown content standards
node scripts/validate-markdown-content.mjs

# Post ID uniqueness
node scripts/validate-post-ids.mjs

# Structured data (SEO)
node scripts/validate-structured-data.mjs

# Bundle size regression
node scripts/check-bundle-size.mjs

# Test health monitoring
node scripts/analyze-test-health.mjs
```

---

## Compliance Dashboard

**Coming Soon:** `/dev/analytics/compliance` will show:
- Real-time design token compliance %
- Violation trends over time
- Top violating files
- Compliance by directory

---

## Constraints (Do NOT Change)

These are **non-negotiable architecture decisions**. Changing them requires team discussion and approval.

### Mandatory Patterns

1. **Import alias:** Always `@/*` (never relative paths)
2. **Styling:** Tailwind v4 + shadcn/ui (no CSS modules, no styled-components)
3. **Architecture:** Server-first (React Server Components by default)
4. **Design tokens:** Required for spacing, typography, colors
5. **MDX pipeline:** Use existing rehype/remark plugins
6. **Background jobs:** Inngest for async tasks (no manual setTimeout)

### Framework Constraints

- **Next.js 16** - App Router only (no Pages Router)
- **React 19** - Server Components default
- **TypeScript** - Strict mode enabled
- **Node.js** - v20+ required

---

## Related Documentation

- [Component Patterns](./component-patterns) - Layout usage, imports
- [Quick Reference](./quick-reference) - Commands and 80/20 rules
- [Decision Trees](./decision-trees) - Visual flowcharts
- [Design System Details](./design-system) - Deep dive into token system

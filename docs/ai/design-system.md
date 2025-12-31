# Design System Validation (MANDATORY)

**Claude Code MUST follow this checklist before creating or modifying UI components.**

This comprehensive guide ensures consistency, prevents duplication, and maintains design token usage across the codebase.

## Phase 1: Discovery (REQUIRED FIRST)

**STOP before writing any UI code. Complete this discovery phase first.**

### 1. Search for Existing Patterns

**Use Grep/Glob tools to find similar components:**

```bash
# Search for similar component names
glob "**/*-filter*.tsx"              # Find filter components
glob "**/*-card*.tsx"                # Find card components
glob "**/*-button*.tsx"              # Find button variants

# Search for similar functionality
grep "useState.*filter" --type ts   # Find filter state management
grep "useRouter.*push" --type ts    # Find navigation patterns
grep "useDebounce" --type ts         # Find debounce usage
```

**Check standard locations:**

- `src/components/layouts/` - Layout patterns (PageLayout, PageHero, etc.)
- `src/components/ui/` - UI primitives (Button, Card, Badge, etc.)
- `src/components/common/` - Shared components (Phase 4 goal)
- `src/components/analytics/` - Well-organized feature directory

**Verify no duplication before creating:**

- Does a component with this functionality exist?
- Can I extend an existing component instead of creating new?
- Is this pattern already implemented elsewhere?

### 2. Review Design Tokens

**Read `src/lib/design-tokens.ts` for all constants:**

```typescript
// Always import from design tokens
import {
  SPACING, // Vertical/horizontal spacing
  TYPOGRAPHY, // Heading/body text styles (includes label, accordion, logo)
  ANIMATION, // Duration tokens and transition utilities
  HOVER_EFFECTS, // Consistent hover transitions
  CONTAINER_WIDTHS, // Max-width constraints
  PAGE_LAYOUT, // Page-level layout constants
  ARCHIVE_LAYOUT, // Archive/list page constants
  ARTICLE_LAYOUT, // Article/blog post constants
} from "@/lib/design-tokens";
```

**Available design tokens:**

**SPACING:**

```typescript
SPACING.section; // "space-y-12" - Between major sections
SPACING.content; // "space-y-8" - Between content blocks
SPACING.element; // "space-y-4" - Between related elements
SPACING.tight; // "space-y-2" - Between tightly related items
SPACING.grid; // "gap-4" - Grid/flex gap
```

**TYPOGRAPHY:**

```typescript
TYPOGRAPHY.h1.standard; // Page titles
TYPOGRAPHY.h1.large; // Hero titles
TYPOGRAPHY.h2.standard; // Section headings
TYPOGRAPHY.h3.standard; // Subsection headings
TYPOGRAPHY.body.default; // Body text
TYPOGRAPHY.body.large; // Large body text
TYPOGRAPHY.body.small; // Small text
TYPOGRAPHY.body.muted; // Muted text
```

**CONTAINER_WIDTHS:**

```typescript
CONTAINER_WIDTHS.narrow; // "max-w-4xl" (768px) - Forms, focused content
CONTAINER_WIDTHS.standard; // "max-w-5xl" (1024px) - Core pages (home, about, contact, resume)
CONTAINER_WIDTHS.content; // "max-w-6xl" (1152px) - Content pages with sidebars (blog posts, project details)
CONTAINER_WIDTHS.archive; // "max-w-7xl" (1280px) - Archive/listing pages (blog listing, projects listing)
CONTAINER_WIDTHS.dashboard; // "max-w-[1536px]" (1536px) - Full-width dashboards with data tables, charts, analytics
```

**ANIMATION:**

```typescript
// Duration tokens (use these instead of duration-* classes)
ANIMATION.duration.fast    // "duration-[150ms]" - Quick UI responses (hover, focus)
ANIMATION.duration.normal  // "duration-[300ms]" - Standard transitions (cards, modals)
ANIMATION.duration.slow    // "duration-[500ms]" - Dramatic effects (page transitions)

// Transition utilities (prefer these over manual animation classes)
ANIMATION.transition.base       // "transition-base" - Opacity + transform (default choice)
ANIMATION.transition.movement   // "transition-movement" - Transform only (hover states)
ANIMATION.transition.theme      // "transition-theme" - Colors only (theme switching)

// Usage examples:
className={ANIMATION.transition.base}           // Most common
className={ANIMATION.transition.movement}       // For hover effects
className={ANIMATION.transition.theme}          // For color changes
```

**HOVER_EFFECTS:**

```typescript
// Decision guide: Which hover effect to use?
HOVER_EFFECTS.card         // 80% use case - Standard interactive cards
HOVER_EFFECTS.cardSubtle   // 15% use case - Secondary/less prominent cards
HOVER_EFFECTS.button       // 5% use case - Action buttons
HOVER_EFFECTS.link         // Text links with underline

// Special effects (use sparingly)
HOVER_EFFECTS.cardGlow     // Premium/attention-grabbing content
HOVER_EFFECTS.cardTilt     // Playful 3D effects

// Usage:
className={HOVER_EFFECTS.card}  // Most common pattern
className={ANIMATION.duration.fast}           // Fast hover effect
className="transition-movement"               // For scale/translate animations
className={cn("transition-theme", ANIMATION.duration.normal)}  // Theme transition
```

**TYPOGRAPHY (Extended):**

```typescript
// Standard headings (most common)
TYPOGRAPHY.h1.standard; // "text-3xl font-semibold" - Page titles
TYPOGRAPHY.h2.standard; // "text-2xl font-semibold" - Section headings
TYPOGRAPHY.h3.standard; // "text-xl font-semibold" - Subsection headings
TYPOGRAPHY.h4.standard; // "text-lg font-semibold" - Card titles
TYPOGRAPHY.h5.standard; // "text-base font-semibold" - Small headings
TYPOGRAPHY.h6.standard; // "text-sm font-semibold" - Micro headings

// Labels (form fields, badges, metadata)
TYPOGRAPHY.label.standard; // "text-sm font-medium" - Form labels, card metadata
TYPOGRAPHY.label.small; // "text-xs font-medium" - Small badges, timestamps
TYPOGRAPHY.label.xs; // "text-[0.625rem] font-medium leading-tight" - Micro labels

// Accordion tokens (collapsible sections)
TYPOGRAPHY.accordion.heading; // "text-xl font-semibold" - Accordion section titles
TYPOGRAPHY.accordion.trigger; // "text-base font-medium" - Accordion toggle buttons

// Logo sizing (site branding)
TYPOGRAPHY.logo.small; // "text-xl font-bold" - Mobile/compact logo
TYPOGRAPHY.logo.medium; // "text-2xl font-bold" - Standard logo
TYPOGRAPHY.logo.large; // "text-3xl font-bold" - Hero logo

// Body text (paragraph content)
TYPOGRAPHY.body.default; // "text-base" - Standard paragraphs
TYPOGRAPHY.body.large; // "text-lg" - Emphasized content
TYPOGRAPHY.body.small; // "text-sm" - Captions, metadata
TYPOGRAPHY.body.muted; // "text-sm text-muted-foreground" - Secondary text
```

### 3. Validate Reusability

**Ask these questions before proceeding:**

1. **Does a similar component exist?**
   - ✅ Yes → Extend it, don't duplicate
   - ❌ No → Proceed with creation

2. **Do design tokens exist for this pattern?**
   - ✅ Yes → Use them (MANDATORY)
   - ❌ No → Discuss adding new tokens first

3. **Can I reuse layout components?**
   - PageLayout → Universal page wrapper
   - PageHero → Hero sections
   - PageSection → Content sections
   - ArchiveLayout → List/archive pages
   - ArticleLayout → Blog posts/articles

4. **Can I use existing UI primitives?**
   - Check `src/components/ui/*` for shadcn components
   - Button, Card, Badge, Skeleton, Dialog, etc.

## Phase 2: Implementation Standards

**Follow these patterns exactly when creating or modifying UI components.**

### Container & Layout Patterns

**✅ CORRECT: Use existing layout components**

```typescript
import { PageLayout, PageHero, PageSection } from "@/components/layouts";

export default function MyPage() {
  return (
    <PageLayout>
      <PageHero
        title="Page Title"
        description="Page description"
        variant="default"  // or "compact" or "centered"
      />
      <PageSection>
        {/* Page content */}
      </PageSection>
    </PageLayout>
  );
}
```

**❌ WRONG: Creating custom layout**

```typescript
// DON'T DO THIS - use PageLayout instead
export default function MyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Page Title</h1>
      <p className="text-muted-foreground mb-8">Description</p>
      {/* content */}
    </div>
  );
}
```

### Typography Patterns

**✅ CORRECT: Use TYPOGRAPHY tokens**

```typescript
import { TYPOGRAPHY } from "@/lib/design-tokens";

function MyComponent() {
  return (
    <>
      <h1 className={TYPOGRAPHY.h1.standard}>Main Title</h1>
      <h2 className={TYPOGRAPHY.h2.standard}>Section Heading</h2>
      <p className={TYPOGRAPHY.body.default}>Body text content</p>
      <p className={TYPOGRAPHY.body.muted}>Secondary text</p>
    </>
  );
}
```

**❌ WRONG: Inline typography**

```typescript
// DON'T DO THIS - use TYPOGRAPHY tokens
function MyComponent() {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Title</h1>
      <h2 className="text-2xl font-semibold">Heading</h2>
      <p className="text-base leading-relaxed">Text</p>
      <p className="text-sm text-muted-foreground">Secondary</p>
    </>
  );
}
```

### Spacing Patterns

**✅ CORRECT: Use SPACING tokens**

```typescript
import { SPACING } from "@/lib/design-tokens";

function MyComponent() {
  return (
    <div className={SPACING.content}>  {/* space-y-8 */}
      <section className={SPACING.element}>  {/* space-y-4 */}
        <h2>Section Title</h2>
        <p>Content</p>
      </section>
      <section className={SPACING.element}>
        <h2>Another Section</h2>
        <div className={SPACING.grid}>  {/* gap-4 */}
          <Card />
          <Card />
        </div>
      </section>
    </div>
  );
}
```

**❌ WRONG: Magic numbers**

```typescript
// DON'T DO THIS - use SPACING tokens
function MyComponent() {
  return (
    <div className="space-y-6">  {/* Should be SPACING.content */}
      <section className="space-y-3">  {/* Should be SPACING.element */}
        <h2>Title</h2>
        <p>Content</p>
      </section>
      <div className="gap-6 grid">  {/* Should be SPACING.grid */}
        <Card />
        <Card />
      </div>
    </div>
  );
}
```

### Colors & Theme Patterns

**✅ CORRECT: Use semantic color variables**

```typescript
function MyComponent() {
  return (
    <>
      <Card className="bg-card text-card-foreground border">
        <h3 className="text-foreground">Title</h3>
        <p className="text-muted-foreground">Description</p>
      </Card>

      <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
        Submit
      </Button>

      <div className="bg-accent text-accent-foreground">
        Highlighted content
      </div>
    </>
  );
}
```

**❌ WRONG: Hardcoded colors**

```typescript
// DON'T DO THIS - use semantic color variables
function MyComponent() {
  return (
    <>
      <Card className="bg-white dark:bg-gray-900 border-gray-200">
        <h3 className="text-black dark:text-white">Title</h3>
        <p className="text-gray-600 dark:text-gray-400">Description</p>
      </Card>

      <Button className="bg-blue-500 text-white hover:bg-blue-600">
        Submit
      </Button>

      <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        Highlighted content
      </div>
    </>
  );
}
```

### Component Composition Patterns

**✅ CORRECT: Compose from existing components**

```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SPACING, TYPOGRAPHY } from "@/lib/design-tokens";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={TYPOGRAPHY.h3.standard}>
          {project.title}
        </CardTitle>
        <div className={`flex gap-2 ${SPACING.tight}`}>
          {project.tags.map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <p className={TYPOGRAPHY.body.default}>{project.description}</p>
      </CardContent>
    </Card>
  );
}
```

**❌ WRONG: Recreating existing patterns**

```typescript
// DON'T DO THIS - use Card component
export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6 pb-0">
        <h3 className="text-2xl font-semibold">{project.title}</h3>
        <div className="flex gap-2 mt-2">
          {project.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="p-6 pt-2">
        <p className="text-base">{project.description}</p>
      </div>
    </div>
  );
}
```

## Prohibited Patterns (FORBIDDEN)

**Never use these without explicit approval:**

### Spacing Violations

❌ `space-y-5` → Use `SPACING.element` (space-y-4) or `SPACING.content` (space-y-8)
❌ `space-y-6` → Use `SPACING.content` (space-y-8)
❌ `space-y-7` → Use `SPACING.content` (space-y-8)
❌ `space-y-9` → Use `SPACING.section` (space-y-12)
❌ `gap-5` → Use `gap-4` (SPACING.grid)
❌ `gap-6` → Use `gap-4` (SPACING.grid)
❌ `gap-7` → Use `gap-4` (SPACING.grid)
❌ `gap-8` → Use `gap-4` (SPACING.grid)
❌ `p-6` → Use `p-4` or `p-8`
❌ `p-7` → Use `p-4` or `p-8`
❌ `px-6` → Use `px-4` or `px-8`
❌ `py-6` → Use `py-4` or `py-8`

### Typography Violations

❌ `text-xl font-semibold` → Use `TYPOGRAPHY.h3.standard`
❌ `text-2xl font-bold` → Use `TYPOGRAPHY.h2.standard`
❌ `text-3xl font-semibold` → Use `TYPOGRAPHY.h1.standard`
❌ `text-base leading-relaxed` → Use `TYPOGRAPHY.body.default`
❌ Inline font sizes → Use TYPOGRAPHY tokens

### Container Width Violations

❌ `max-w-4xl` → Use `CONTAINER_WIDTHS.narrow`
❌ `max-w-5xl` → Use `CONTAINER_WIDTHS.standard`
❌ `max-w-6xl` → Use `CONTAINER_WIDTHS.content`
❌ `max-w-7xl` → Use `CONTAINER_WIDTHS.archive`
❌ `max-w-[1536px]` → Use `CONTAINER_WIDTHS.dashboard`
❌ Custom max-widths → Use CONTAINER_WIDTHS constants

### Pattern Violations

❌ Duplicating existing components → Extend or reuse instead
❌ Creating custom layouts → Use PageLayout, PageHero, PageSection
❌ Hardcoded colors → Use semantic color variables
❌ Magic numbers → Use design tokens

## Pre-Commit Validation Checklist

**Before submitting code, verify:**

### 1. Design Token Usage

```bash
# Check for spacing violations
grep -r "space-y-[5-9]" src/components/
grep -r "gap-[5-9]" src/components/
grep -r 'p-[67]"' src/components/

# Should return no results for your new/modified files
```

### 2. Import Statements

```typescript
// ✅ Required imports for new components
import { SPACING, TYPOGRAPHY } from "@/lib/design-tokens";
import { Button, Card } from "@/components/ui/...";
import { PageLayout } from "@/components/layouts";
```

### 3. Component Structure

- [ ] Uses layout components from `@/components/layouts/*`
- [ ] Uses UI primitives from `@/components/ui/*`
- [ ] Imports design tokens where applicable
- [ ] No hardcoded spacing values
- [ ] No inline typography styles
- [ ] Semantic color variables only

### 4. Documentation

- [ ] JSDoc comment added to component
- [ ] Props interface documented
- [ ] Usage examples if complex

````typescript
/**
 * Displays a project card with title, tags, and description
 *
 * @example
 * ```tsx
 * <ProjectCard project={project} />
 * ```
 */
export function ProjectCard({ project }: ProjectCardProps) {
  // ...
}
````

### 5. Tests

- [ ] Tests added for new functionality
- [ ] Tests updated if behavior changed
- [ ] All tests passing (`npm run test`)

### 6. Build Validation

```bash
npm run typecheck  # TypeScript must compile
npm run lint       # Linting must pass
npm run build      # Build must succeed
```

## Enforcement Workflow

**For every UI component you create or modify:**

1. **Discovery** (MANDATORY FIRST)
   - [ ] Searched for existing patterns
   - [ ] Reviewed design tokens
   - [ ] Validated no duplication

2. **Implementation**
   - [ ] Used layout components
   - [ ] Used TYPOGRAPHY tokens
   - [ ] Used SPACING tokens
   - [ ] Used semantic colors
   - [ ] Composed from UI primitives

3. **Validation**
   - [ ] No prohibited patterns
   - [ ] All imports present
   - [ ] JSDoc added
   - [ ] Tests passing
   - [ ] Build succeeds

## Quick Reference Card

**Copy this checklist for each new component:**

```markdown
## Component Design System Checklist

### Discovery

- [ ] Searched for similar components (Grep/Glob)
- [ ] Reviewed src/lib/design-tokens.ts
- [ ] Confirmed no duplication exists

### Implementation

- [ ] Imported SPACING, TYPOGRAPHY tokens
- [ ] Used PageLayout/PageHero if page component
- [ ] Used UI primitives from @/components/ui/\*
- [ ] No hardcoded spacing (space-y-6, gap-8, p-7)
- [ ] No inline typography (text-3xl font-semibold)
- [ ] Semantic colors only (bg-card, text-primary)

### Validation

- [ ] JSDoc comment added
- [ ] Tests added/updated
- [ ] npm run typecheck (passes)
- [ ] npm run lint (passes)
- [ ] npm run test (passes)
- [ ] npm run build (succeeds)
```

## Common Mistakes and Fixes

### Mistake: Creating custom spacing

```typescript
// ❌ WRONG
<div className="space-y-6">...</div>

// ✅ CORRECT
import { SPACING } from "@/lib/design-tokens";
<div className={SPACING.content}>...</div>
```

### Mistake: Inline typography

```typescript
// ❌ WRONG
<h1 className="text-3xl font-semibold tracking-tight">Title</h1>

// ✅ CORRECT
import { TYPOGRAPHY } from "@/lib/design-tokens";
<h1 className={TYPOGRAPHY.h1.standard}>Title</h1>
```

### Mistake: Recreating Card component

```typescript
// ❌ WRONG
<div className="rounded-lg border bg-card p-6">...</div>

// ✅ CORRECT
import { Card, CardContent } from "@/components/ui/card";
<Card><CardContent>...</CardContent></Card>
```

### Mistake: Hardcoded colors

```typescript
// ❌ WRONG
<div className="bg-white dark:bg-gray-900">...</div>

// ✅ CORRECT
<div className="bg-card">...</div>
```

## Automated Enforcement

### Running Validation Locally

Check all files:

```bash
node scripts/validate-design-tokens.mjs
```

Check only staged files:

```bash
node scripts/validate-design-tokens.mjs --staged
```

Check specific files:

```bash
node scripts/validate-design-tokens.mjs --files src/components/ui/card.tsx
```

### ESLint Integration

ESLint automatically catches violations in your editor and during `npm run lint`:

```bash
npm run lint          # Check for violations
npm run lint --fix    # Auto-fix some violations
```

**Current violations will show as warnings** until we complete migration, then they'll become errors.

### Pre-commit Hooks

Husky automatically runs validation before each commit:

```bash
git add src/components/my-component.tsx
git commit -m "feat: add new component"
# → Runs lint-staged → ESLint + design token validation
# → Commit blocked if violations found
```

Bypassing hooks (use sparingly):

```bash
git commit --no-verify -m "WIP: needs design token cleanup"
```

### GitHub Actions

Pull requests automatically run design system validation:

- ✅ ESLint check
- ✅ Design token validation
- 💬 Automated comment with violation report if failures

### VS Code Snippets

Type shortcuts for instant design token insertion:

- `dtimport` → Import design tokens
- `dtcontent` → `className={SPACING.content}`
- `dtsubsection` → `className={SPACING.subsection}`
- `dth1` → `className={TYPOGRAPHY.h1.standard}`
- `dth2` → `className={TYPOGRAPHY.h2.standard}`
- `dtstat` → `className={TYPOGRAPHY.display.stat}`
- `dthover` → `className={HOVER_EFFECTS.card}`

Enable in VS Code: Settings → "Editor: Quick Suggestions" → Set "strings" to `true`

### Fixing Violations

#### Step 1: Identify violations

```bash
node scripts/validate-design-tokens.mjs
```

#### Step 2: Import design tokens

```tsx
import { SPACING, TYPOGRAPHY, HOVER_EFFECTS } from "@/lib/design-tokens";
```

#### Step 3: Replace hardcoded values

```tsx
// Before
<div className="space-y-8 gap-6">
  <h1 className="text-3xl font-bold">Title</h1>
</div>

// After
<div className={cn(SPACING.subsection, "gap-4")}>
  <h1 className={TYPOGRAPHY.h1.standard}>Title</h1>
</div>
```

#### Step 4: Run validation again

```bash
node scripts/validate-design-tokens.mjs --files src/components/my-component.tsx
```

## Additional Resources

- **Design tokens source**: [`src/lib/design-tokens.ts`](../../src/lib/design-tokens.ts)
- **Layout components**: [`src/components/layouts/`](../../src/components/layouts/)
- **UI primitives**: [`src/components/ui/`](../../src/components/ui/)
- **Validation script**: `scripts/validate-design-tokens.mjs`
- **Best practices**: [`/docs/ai/BEST_PRACTICES.md`](./best-practices)
- **Animation analysis**: [`/docs/design/ANIMATION_SYSTEM_ANALYSIS.md`](../design/ANIMATION_SYSTEM_ANALYSIS.md)

---

## Animation Decision Tree

**Quick reference for choosing the right animation pattern.**

### When to Add Animation?

```
Need animation? Start here:
│
├─ Page navigation between routes?
│  └─ ✅ Use: TransitionLink (View Transitions API)
│     └─ import { TransitionLink } from "@/components/common"
│
├─ Scroll-triggered reveal?
│  └─ ✅ Use: <ScrollReveal> component
│     ├─ animation="fade-up" (default)
│     ├─ delay={1-6} for stagger effect
│     └─ import { ScrollReveal } from "@/components/features"
│
├─ Hover/interactive feedback?
│  ├─ Card/Container? → HOVER_EFFECTS.card (80% use case)
│  ├─ Button? → HOVER_EFFECTS.button
│  ├─ Link? → HOVER_EFFECTS.link
│  └─ import { HOVER_EFFECTS } from "@/lib/design-tokens"
│
├─ Loading state?
│  └─ ✅ Use: ANIMATION.effects.shimmer
│     └─ className="animate-shimmer"
│
├─ Micro-interaction?
│  ├─ Like/reaction? → ANIMATION.activity.like
│  ├─ Button press? → ANIMATION.interactive.press
│  └─ Count increment? → ANIMATION.effects.countUp
│
├─ Advanced animation needed?
│  ├─ 3D transforms (rotateX + rotateY + perspective)?
│  │  └─ ⚠️ Use: Framer Motion (CSS lacks multi-axis 3D)
│  │     └─ Example: featured-post-hero (3D tilt), flippable-avatar (coin flip)
│  │
│  ├─ Physics-based (spring, inertia)?
│  │  └─ ⚠️ Use: Framer Motion (CSS lacks physics)
│  │     └─ Example: content-type-toggle (spring), table-of-contents (smooth scroll)
│  │
│  ├─ Gesture interactions (drag, swipe)?
│  │  └─ ⚠️ Use: Framer Motion (CSS lacks gesture detection)
│  │     └─ Example: interactive-diagram (node dragging)
│  │
│  └─ Scroll-linked (parallax, useScroll)?
│     └─ ⚠️ Use: Framer Motion (CSS lacks scroll binding)
│        └─ Example: scroll-progress-indicator
│
└─ Custom transition?
   └─ ✅ Use: ANIMATION.transition.* + custom CSS
      ├─ .transition.base (opacity + transform) - DEFAULT
      ├─ .transition.movement (transform only) - for hover
      └─ .transition.theme (colors only) - for theme switching
```

### CSS vs Framer Motion: When to Use Each

**🎯 Use CSS Animations (Default - 95% of cases):**

- Simple fades, slides, scales, rotations (single axis)
- Hover effects, focus states, active states
- Loading spinners, progress bars
- Stagger animations with fixed delays
- **Benefits:** Zero JS, GPU-accelerated, respects prefers-reduced-motion, smaller bundle

**⚠️ Use Framer Motion (Advanced - 5% of cases):**

- 3D transforms with perspective (rotateX + rotateY combined)
- Spring physics, momentum, inertia
- Gesture interactions (drag, swipe, pinch)
- Scroll-linked animations (parallax, scroll progress)
- Complex choreography with AnimatePresence
- **Trade-off:** +60-80 KB bundle, requires manual a11y, more complexity

**Decision Rule:** Can you achieve 90% of the effect with CSS? → Use CSS. Need advanced features CSS lacks? → Use Framer Motion.

### Animation Pattern Examples

**Scroll Reveal (Homepage, Blog Posts):**

```tsx
import { ScrollReveal } from "@/components/features";

{
  posts.map((post, i) => (
    <ScrollReveal key={post.slug} animation="fade-up" delay={i % 3}>
      <PostCard post={post} />
    </ScrollReveal>
  ));
}
```

**Card Hover Effect (Most Common):**

```tsx
import { HOVER_EFFECTS } from "@/lib/design-tokens";

<Card className={HOVER_EFFECTS.card}>
  <CardContent>{content}</CardContent>
</Card>;
```

**Button Press Feedback:**

```tsx
import { ANIMATION } from "@/lib/design-tokens";

<Button className={cn(ANIMATION.interactive.press)}>Click me</Button>;
```

**Custom Transition:**

```tsx
import { ANIMATION } from "@/lib/design-tokens";

<div className={cn(ANIMATION.transition.base, "hover:shadow-lg")}>
  {content}
</div>;
```

**Page Navigation:**

```tsx
import { TransitionLink } from "@/components/common";

<TransitionLink href="/blog/post-slug">Read more →</TransitionLink>;
```

**3D Tilt Effect (Legitimate Framer Motion Use):**

```tsx
import { motion } from "framer-motion";

<motion.div
  style={{
    transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
    transition: "transform 0.2s ease-out",
  }}
>
  {content}
</motion.div>;
```

### Common Mistakes to Avoid

**❌ DON'T:**

- Use hardcoded `duration-200`, `duration-300` (use `ANIMATION.duration.*`)
- Use deprecated `.transition-colors` (use `.transition-theme`)
- Use Framer Motion for simple fade/slide effects (use CSS animations)
- Skip `HOVER_EFFECTS.*` for standard cards (duplicates token)
- Use arbitrary delay values in ScrollReveal (use stagger 1-6)
- Add Framer Motion without justifying why CSS is insufficient

**✅ DO:**

- Import `ANIMATION` from design tokens
- Use `HOVER_EFFECTS.*` for consistent hover patterns
- Use `ScrollReveal` for scroll-triggered animations
- Use `ANIMATION.transition.*` for transitions
- Respect `prefers-reduced-motion` (CSS handles automatically)
- Document why Framer Motion is needed (3D, physics, gestures) in JSDoc

### Animation Performance Checklist

- [ ] Uses `transform` and `opacity` only (GPU-accelerated)
- [ ] Imports from `ANIMATION` design tokens (no hardcoded values)
- [ ] Uses CSS animations (not JavaScript, except Framer Motion for complex cases)
- [ ] Respects `prefers-reduced-motion` (CSS @media query handles this)
- [ ] 60fps on low-end devices (test with Chrome DevTools)

---

## Logging Security Best Practices

**CRITICAL: Never log sensitive information in clear text.**

See comprehensive guide: [`docs/ai/LOGGING_SECURITY.md`](./logging-security)

### Quick Rules

**❌ NEVER log:**

- API keys, tokens, credentials
- Environment variables containing secrets
- User personal data (emails, phone numbers, IDs)
- Private keys, certificates
- Authentication responses
- Payment/financial information
- Database passwords or connection strings

**✅ ACCEPTABLE to log:**

- Non-sensitive metadata (project IDs, general service names)
- Public user information already available
- Application state and flow information
- Error messages without sensitive details
- Timestamps, request IDs, correlation IDs

### Two Approaches for Sensitive Data

**Option 1: Remove Logging** (Preferred for tests/config scripts)

```javascript
// ❌ WRONG: Logs service account email
console.log(`Service Account: ${credentials.client_email}`);

// ✅ CORRECT: Generic message
console.log("✅ Service account JSON is valid");
```

**Option 2: Mask Sensitive Data** (When verification logging needed)

```javascript
// ✅ CORRECT: Mask email for verification
const maskEmail = (email) => {
  const [local, domain] = email.split("@");
  return `${local.substring(0, 2)}***@${domain}`;
};
console.log(`Service Account: ${maskEmail(credentials.client_email)}`);
// Output: Service Account: co***@example.com
```

### Examples

**Logging environment validation:**

```javascript
// ❌ WRONG - Exposes secrets
if (!process.env.GOOGLE_API_KEY) {
  console.error(`Missing API key: ${process.env.GOOGLE_API_KEY}`);
}

// ✅ CORRECT - Generic message
if (!process.env.GOOGLE_API_KEY) {
  console.error("Missing GOOGLE_API_KEY environment variable");
  console.error("See: docs/setup.md for configuration instructions");
}
```

**Logging authentication attempts:**

```javascript
// ❌ WRONG - Logs user credentials
console.log(`User login: ${username}:${password}`);

// ✅ CORRECT - Log only non-sensitive metadata
console.log(`Authentication attempt for user account`);
console.log(`Auth provider: ${authProvider}`);
console.log(`Status: ${result.success ? "success" : "failed"}`);
```

## Getting Help

**If you're unsure whether to create a new component:**

1. Search the codebase first (Grep/Glob)
2. Check if design tokens exist for the pattern
3. Ask if the pattern should be abstracted
4. Prefer extending existing components over creating new ones

**If you need a new design token:**

1. Check if existing tokens can be combined
2. Propose the new token with use cases
3. Add to `src/lib/design-tokens.ts` with clear naming
4. Document in this guide

<!-- TLP:AMBER - Internal Use Only -->

# DESIGN TOKENS COMPREHENSIVE

**Information Classification:** TLP:AMBER (Internal Use Only)  
**Consolidation Date:** 2026-02-27  
**Original Files:** 7 documents

This document consolidates related documentation to reduce operational overhead.

---

## DESIGN_TOKEN_DECISION_TREE

**Original Location:** `design/DESIGN_TOKEN_DECISION_TREE.md`

**Information Classification:** TLP:CLEAR (Public)
**Last Updated:** February 9, 2026
**Quick Reference:** 30-second guide to choosing the right design token

---

## 🌳 Decision Tree

```
┌─────────────────────────────────────────────────────────────┐
│              What are you trying to do?                      │
└─────────────────────────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
    SPACING              COLORS              TYPOGRAPHY
        │                    │                    │
        ▼                    ▼                    ▼

┌─ SPACING DECISIONS ─────────────────────────────────────────┐
│                                                              │
│  ❓ What kind of spacing?                                   │
│                                                              │
│  ┌─ Between major sections (hero → features → CTA)          │
│  │  ✅ SPACING.section                                      │
│  │  Example: <div className={SPACING.section}>              │
│  │                                                           │
│  ┌─ Within content area (paragraphs, cards, lists)          │
│  │  ✅ SPACING.content                                      │
│  │  Example: <div className={SPACING.content}>              │
│  │                                                           │
│  ┌─ Compact lists or tight layouts                          │
│  │  ✅ SPACING.compact                                      │
│  │  Example: <ul className={SPACING.compact}>               │
│  │                                                           │
│  ┌─ Horizontal spacing (gap between buttons, badges)        │
│  │  ✅ SPACING.horizontal                                   │
│  │  Example: <div className={SPACING.horizontal}>           │
│  │                                                           │
│  ┌─ Dynamic spacing (template literals)                     │
│  │  ✅ spacing('md') helper                                 │
│  │  Example: <div className={`gap-${spacing('md')}`}>       │
│  │                                                           │
│  └─ Numeric value for style properties                      │
│     ✅ SPACING_SCALE.md                                     │
│     Example: <div style={{ gap: SPACING_SCALE.md }}>        │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ COLOR DECISIONS ───────────────────────────────────────────┐
│                                                              │
│  ❓ What kind of color?                                     │
│                                                              │
│  ┌─ Text color                                              │
│  │  ├─ Primary content → SEMANTIC_COLORS.text.primary       │
│  │  ├─ Secondary/meta → SEMANTIC_COLORS.text.secondary      │
│  │  ├─ Error message → SEMANTIC_COLORS.text.error           │
│  │  ├─ Success → SEMANTIC_COLORS.text.success               │
│  │  └─ Warning → SEMANTIC_COLORS.text.warning               │
│  │                                                           │
│  ┌─ Interactive element (button, link)                      │
│  │  ├─ Primary button → SEMANTIC_COLORS.interactive.primary │
│  │  ├─ Secondary button → SEMANTIC_COLORS.interactive.secondary │
│  │  └─ Link hover → SEMANTIC_COLORS.interactive.hover       │
│  │                                                           │
│  ┌─ Alert/notification box                                  │
│  │  ├─ Error alert → SEMANTIC_COLORS.alert.critical.*       │
│  │  ├─ Warning → SEMANTIC_COLORS.alert.warning.*            │
│  │  ├─ Success → SEMANTIC_COLORS.alert.success.*            │
│  │  └─ Info → SEMANTIC_COLORS.alert.info.*                  │
│  │                                                           │
│  ┌─ Status badge/indicator                                  │
│  │  ├─ Success → SEMANTIC_COLORS.status.success             │
│  │  ├─ Error → SEMANTIC_COLORS.status.error                 │
│  │  ├─ Warning → SEMANTIC_COLORS.status.warning             │
│  │  └─ Neutral → SEMANTIC_COLORS.status.neutral             │
│  │                                                           │
│  └─ Series/category color (charts, tags)                    │
│     ├─ Engineering → SEMANTIC_COLORS.series.engineering     │
│     ├─ Design → SEMANTIC_COLORS.series.design               │
│     └─ Operations → SEMANTIC_COLORS.series.operations       │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ TYPOGRAPHY DECISIONS ──────────────────────────────────────┐
│                                                              │
│  ❓ What kind of text?                                      │
│                                                              │
│  ┌─ Page headline (h1)                                      │
│  │  ├─ Standard → TYPOGRAPHY.h1.standard                    │
│  │  ├─ Emphasized → TYPOGRAPHY.h1.emphasized                │
│  │  └─ Enhanced (gradient) → TYPOGRAPHY.h1.enhanced         │
│  │                                                           │
│  ┌─ Section header (h2)                                     │
│  │  ├─ Standard → TYPOGRAPHY.h2.standard                    │
│  │  └─ Emphasized → TYPOGRAPHY.h2.emphasized                │
│  │                                                           │
│  ┌─ Subsection header (h3)                                  │
│  │  ├─ Standard → TYPOGRAPHY.h3.standard                    │
│  │  └─ Emphasized → TYPOGRAPHY.h3.emphasized                │
│  │                                                           │
│  ┌─ Body text                                               │
│  │  └─ TYPOGRAPHY.body                                      │
│  │                                                           │
│  ┌─ Small text (captions, labels, dates)                    │
│  │  └─ TYPOGRAPHY.caption                                   │
│  │                                                           │
│  └─ Code snippet                                            │
│     └─ TYPOGRAPHY.code                                      │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌─ CONTAINER DECISIONS ───────────────────────────────────────┐
│                                                              │
│  ❓ What kind of container?                                 │
│                                                              │
│  ┌─ Blog post or focus content                              │
│  │  ✅ getContainerClasses('narrow')                        │
│  │                                                           │
│  ┌─ Standard page                                           │
│  │  ✅ getContainerClasses('standard')                      │
│  │                                                           │
│  ┌─ Dashboard or data-heavy page                            │
│  │  ✅ getContainerClasses('wide')                          │
│  │                                                           │
│  └─ Full-width layout                                       │
│     ✅ getContainerClasses('full')                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 📋 Quick Reference Cheat Sheet

### Most Common Patterns

| Use Case            | Token                                 | Example                                                    |
| ------------------- | ------------------------------------- | ---------------------------------------------------------- |
| **Page title**      | `TYPOGRAPHY.h1.standard`              | `<h1 className={TYPOGRAPHY.h1.standard}>`                  |
| **Section spacing** | `SPACING.section`                     | `<div className={SPACING.section}>`                        |
| **Content spacing** | `SPACING.content`                     | `<div className={SPACING.content}>`                        |
| **Error message**   | `SEMANTIC_COLORS.text.error`          | `<p className={SEMANTIC_COLORS.text.error}>`               |
| **Success message** | `SEMANTIC_COLORS.text.success`        | `<p className={SEMANTIC_COLORS.text.success}>`             |
| **Primary button**  | `SEMANTIC_COLORS.interactive.primary` | `<button className={SEMANTIC_COLORS.interactive.primary}>` |
| **Page container**  | `getContainerClasses('standard')`     | `<div className={getContainerClasses('standard')}>`        |
| **Card hover**      | `HOVER_EFFECTS.card`                  | `<div className={HOVER_EFFECTS.card}>`                     |

---

## 🚫 What NOT to Do

| ❌ Wrong                         | ✅ Correct                               | Why                                        |
| -------------------------------- | ---------------------------------------- | ------------------------------------------ |
| `className="space-y-8"`          | `className={SPACING.section}`            | Hardcoded spacing breaks consistency       |
| `className="text-red-500"`       | `className={SEMANTIC_COLORS.text.error}` | Semantic meaning > hardcoded color         |
| `className="text-4xl font-bold"` | `className={TYPOGRAPHY.h1.standard}`     | Typography system ensures consistency      |
| `className="mb-4"`               | `className={SPACING.content}`            | Named tokens are more maintainable         |
| `style={{ color: '#ef4444' }}`   | `className={SEMANTIC_COLORS.text.error}` | Use tokens for theme consistency           |
| `ANIMATIONS.fadeIn`              | `ANIMATION.fadeIn`                       | ANIMATIONS is deprecated                   |
| `SPACING.md`                     | `spacing('md')` or `SPACING_SCALE.md`    | Use helper for templates, SCALE for values |

---

## 🎯 Common Scenarios

### Scenario 1: Creating an Error Alert

```tsx
import { SEMANTIC_COLORS } from '@/lib/design-tokens';
import { AlertTriangle } from 'lucide-react';

<div className={SEMANTIC_COLORS.alert.critical.container}>
  <AlertTriangle className={SEMANTIC_COLORS.alert.critical.icon} />
  <p className={SEMANTIC_COLORS.alert.critical.text}>Something went wrong!</p>
</div>;
```

### Scenario 2: Building a Card Grid

```tsx
import { SPACING, HOVER_EFFECTS } from '@/lib/design-tokens';

<div className={`grid grid-cols-3 ${SPACING.horizontal}`}>
  <div className={HOVER_EFFECTS.card}>Card 1</div>
  <div className={HOVER_EFFECTS.card}>Card 2</div>
  <div className={HOVER_EFFECTS.card}>Card 3</div>
</div>;
```

### Scenario 3: Page with Sections

```tsx
import { SPACING, TYPOGRAPHY, getContainerClasses } from '@/lib/design-tokens';

<div className={getContainerClasses('standard')}>
  <div className={SPACING.section}>
    <h1 className={TYPOGRAPHY.h1.standard}>Title</h1>
    <div className={SPACING.content}>
      <p className={TYPOGRAPHY.body}>Content</p>
    </div>
  </div>

  <div className={SPACING.section}>
    <h2 className={TYPOGRAPHY.h2.standard}>Another Section</h2>
    {/* More content */}
  </div>
</div>;
```

### Scenario 4: Dynamic Spacing

```tsx
import { spacing } from '@/lib/design-tokens';

function DynamicGrid({ gap }: { gap: 'sm' | 'md' | 'lg' }) {
  return <div className={`grid gap-${spacing(gap)}`}>{/* Grid items */}</div>;
}
```

---

## 🔍 Troubleshooting Flowchart

```
┌─────────────────────────────────────┐
│  ESLint warning about hardcoded     │
│  spacing/colors/typography?         │
└─────────────────────────────────────┘
              │
              ▼
      ┌───────────────┐
      │ Find warning  │
      │ in ESLint     │
      └───────┬───────┘
              │
     ┌────────┴────────────────────┐
     │                             │
     ▼                             ▼
┌──────────────┐          ┌──────────────┐
│ Spacing?     │          │ Color/       │
│              │          │ Typography?  │
└──────┬───────┘          └──────┬───────┘
       │                         │
       ▼                         ▼
Check SPACING           Check SEMANTIC_COLORS
section above           or TYPOGRAPHY above
       │                         │
       └────────┬────────────────┘
                ▼
      ┌──────────────────┐
      │ Import token     │
      │ from             │
      │ design-tokens.ts │
      └────────┬─────────┘
               │
               ▼
      ┌──────────────────┐
      │ Replace hardcoded│
      │ value with token │
      └────────┬─────────┘
               │
               ▼
      ┌──────────────────┐
      │ Test locally:    │
      │ npm run dev      │
      │ npm run lint     │
      └────────┬─────────┘
               │
               ▼
      ┌──────────────────┐
      │ ✅ Commit!       │
      └──────────────────┘
```

---

## 📏 Spacing Scale Reference

| Value | Pixels | Use Case                             |
| ----- | ------ | ------------------------------------ |
| `0.5` | 2px    | Micro spacing (borders, fine-tuning) |
| `1.5` | 6px    | Fine spacing (tight lists)           |
| `xs`  | 12px   | Compact spacing                      |
| `sm`  | 16px   | Small spacing                        |
| `md`  | 20px   | **Base unit** (most common)          |
| `lg`  | 24px   | Large spacing                        |
| `xl`  | 32px   | Extra large spacing                  |
| `2xl` | 48px   | Major section spacing                |

---

## 🎨 Color Semantic Mapping

| Semantic Meaning   | Text Color                       | Background                                 | Use For            |
| ------------------ | -------------------------------- | ------------------------------------------ | ------------------ |
| **Error/Critical** | `SEMANTIC_COLORS.text.error`     | `SEMANTIC_COLORS.alert.critical.container` | Errors, failures   |
| **Warning**        | `SEMANTIC_COLORS.text.warning`   | `SEMANTIC_COLORS.alert.warning.container`  | Warnings, cautions |
| **Success**        | `SEMANTIC_COLORS.text.success`   | `SEMANTIC_COLORS.alert.success.container`  | Success states     |
| **Info**           | `SEMANTIC_COLORS.text.primary`   | `SEMANTIC_COLORS.alert.info.container`     | Informational      |
| **Neutral**        | `SEMANTIC_COLORS.text.secondary` | `SEMANTIC_COLORS.background.card`          | Default states     |

---

## 💡 Pro Tips

1. **Import Once:** Import all tokens at the top of each file

   ```tsx
   import { TYPOGRAPHY, SPACING, SEMANTIC_COLORS } from '@/lib/design-tokens';
   ```

2. **Use Semantic Names:** Choose tokens by meaning, not appearance
   - ✅ `SEMANTIC_COLORS.text.error` (semantic)
   - ❌ `text-red-500` (implementation detail)

3. **Combine Tokens:** Mix and match for complex UIs

   ```tsx
   <div className={`${SPACING.section} ${HOVER_EFFECTS.card}`}>
   ```

4. **Check Navigation:** Use table of contents in design-tokens.ts (Cmd+G line numbers)

5. **Auto-Fix:** Run `npm run lint:fix` to auto-fix many violations

---

## 🔗 Related Resources

- **Full Guide:** [Design Token Usage Guide](DESIGN_TOKEN_USAGE_GUIDE.md)
- **Token Source:** [design-tokens.ts](../../src/lib/design-tokens.ts) (lines 1-90 for navigation)
- **Phase 4 Plan:** [Phase 4 Standardization Plan](../plans/PHASE_4_STANDARDIZATION_PLAN_2026-02-09.md)
- **ESLint Rules:** `eslint-local-rules/`

---

**Print This Page:** Perfect for desk reference or onboarding new developers

**Last Updated:** February 9, 2026

---

## DESIGN_TOKEN_USAGE_GUIDE

**Original Location:** `design/DESIGN_TOKEN_USAGE_GUIDE.md`

**Information Classification:** TLP:CLEAR (Public)
**Last Updated:** February 9, 2026
**Version:** 1.0.0

---

## Table of Contents

- [Quick Start](#quick-start)
- [Token Categories](#token-categories)
- [Common Patterns](#common-patterns)
- [Anti-Patterns](#anti-patterns)
- [Migration Guide](#migration-guide)
- [Troubleshooting](#troubleshooting)
- [ESLint Integration](#eslint-integration)

---

## Quick Start

### Import Design Tokens

```tsx
import {
  TYPOGRAPHY,
  SPACING,
  SEMANTIC_COLORS,
  SPACING_SCALE,
  spacing, // helper function for template literals
  ANIMATION_CONSTANTS,
} from '@/lib/design-tokens';
```

### Basic Usage

```tsx
export function MyComponent() {
  return (
    <div className={SPACING.section}>
      <h1 className={TYPOGRAPHY.h1.standard}>Page Title</h1>
      <p className={TYPOGRAPHY.body}>Content here</p>
    </div>
  );
}
```

### Dynamic Spacing (Template Literals)

```tsx
// ✅ Use spacing() helper for type-safe dynamic values
<div className={`gap-${spacing('md')} p-${spacing('lg')}`}>
  {items.map(item => <Card key={item.id} />)}
</div>

// ✅ Use SPACING_SCALE for numeric spacing
<div style={{ gap: SPACING_SCALE.md }}>
```

---

## Token Categories

### 1. Container & Layout Tokens

**Use For:** Page containers, content widths, responsive layouts

```tsx
import { CONTAINER_WIDTHS, getContainerClasses } from '@/lib/design-tokens';

// Page container
<div className={getContainerClasses('standard')}>
  {/* Page content */}
</div>

// Custom container
<div className={CONTAINER_WIDTHS.standard}>
  {/* Max-width container */}
</div>
```

**Available Container Types:**

- `narrow` - Blog posts, focus content
- `standard` - Default pages
- `wide` - Dashboards, data-heavy pages
- `full` - Full-width layouts

---

### 2. Typography Tokens

**Use For:** All text styling (headings, body, captions, code)

```tsx
import { TYPOGRAPHY } from '@/lib/design-tokens';

// Page headlines
<h1 className={TYPOGRAPHY.h1.standard}>Main Title</h1>
<h2 className={TYPOGRAPHY.h2.standard}>Section Header</h2>
<h3 className={TYPOGRAPHY.h3.standard}>Subsection Header</h3>

// Body text
<p className={TYPOGRAPHY.body}>Regular paragraph text</p>
<span className={TYPOGRAPHY.caption}>Small label or meta text</span>

// Code snippets
<code className={TYPOGRAPHY.code}>const example = true;</code>

// Emphasis styles
<h1 className={TYPOGRAPHY.h1.enhanced}>Enhanced headline with gradient</h1>
```

**Typography Variants:**

- `.standard` - Default styling
- `.emphasized` - Bold/emphasized version
- `.enhanced` - With accent colors or gradients
- `.compact` - Tighter spacing for lists/tables

---

### 3. Spacing Tokens

**Use For:** Vertical/horizontal spacing, gaps, padding, margins

```tsx
import { SPACING, SPACING_SCALE, spacing } from '@/lib/design-tokens';

// Vertical spacing between sections
<div className={SPACING.section}>
  {/* Major section */}
</div>

// Vertical spacing within content
<div className={SPACING.content}>
  {/* Content block */}
</div>

// Compact spacing (lists, cards)
<div className={SPACING.compact}>
  {/* Tight spacing */}
</div>

// Horizontal spacing
<div className={SPACING.horizontal}>
  {/* Horizontal gap between elements */}
</div>

// Dynamic spacing (template literals)
function Card({ size }: { size: 'sm' | 'md' | 'lg' }) {
  return <div className={`p-${spacing(size)}`}>Content</div>;
}

// Numeric spacing values (for style properties)
<div style={{ marginTop: SPACING_SCALE.lg }}>
```

**Available Spacing Values:**

- `0.5` - 2px (micro spacing)
- `1.5` - 6px (fine spacing)
- `xs` - 12px
- `sm` - 16px
- `md` - 20px (base unit)
- `lg` - 24px
- `xl` - 32px
- `2xl` - 48px

---

### 4. Color Tokens (Semantic)

**Use For:** Text colors, backgrounds, borders, status indicators

```tsx
import { SEMANTIC_COLORS } from '@/lib/design-tokens';

// Text colors
<p className={SEMANTIC_COLORS.text.primary}>Primary text</p>
<span className={SEMANTIC_COLORS.text.secondary}>Secondary text</span>
<span className={SEMANTIC_COLORS.text.error}>Error message</span>

// Interactive elements
<button className={SEMANTIC_COLORS.interactive.primary}>
  Click Me
</button>

// Status indicators (badges, alerts)
<div className={SEMANTIC_COLORS.status.success}>✓ Success</div>
<div className={SEMANTIC_COLORS.status.warning}>⚠ Warning</div>
<div className={SEMANTIC_COLORS.status.error}>✕ Error</div>

// Alert states (full alert boxes)
<div className={SEMANTIC_COLORS.alert.critical.container}>
  <AlertTriangle className={SEMANTIC_COLORS.alert.critical.icon} />
  <p className={SEMANTIC_COLORS.alert.critical.text}>Critical error</p>
</div>

// Series colors (charts, categories)
<div className={SEMANTIC_COLORS.series.engineering}>Engineering</div>
```

---

### 5. Animation Tokens

**Use For:** Transitions, animations, motion

```tsx
import { ANIMATION, ANIMATION_CONSTANTS } from '@/lib/design-tokens';

// Pre-built animations
<div className={ANIMATION.fadeIn}>
  Fades in on mount
</div>

<div className={ANIMATION.slideUp}>
  Slides up on mount
</div>

// Animation constants (for custom animations)
<div className="transition-all" style={{
  transitionDuration: ANIMATION_CONSTANTS.duration.normal,
  transitionTimingFunction: ANIMATION_CONSTANTS.easing.smooth,
}}>
  Custom animated element
</div>
```

**Available Animations:**

- `fadeIn` - Fade in from transparent
- `fadeOut` - Fade out to transparent
- `slideUp` - Slide up from bottom
- `slideDown` - Slide down from top
- `scaleIn` - Scale up from center
- `pulse` - Pulsing animation

---

### 6. Effects Tokens

**Use For:** Hover states, focus states, shadows, gradients

```tsx
import { HOVER_EFFECTS, FOCUS_EFFECTS, GRADIENT_EFFECTS } from '@/lib/design-tokens';

// Hover effects
<div className={HOVER_EFFECTS.card}>
  Card that lifts on hover
</div>

<button className={HOVER_EFFECTS.button}>
  Button with hover state
</button>

// Focus effects (for accessibility)
<input className={FOCUS_EFFECTS.input} />

// Gradient backgrounds
<div className={GRADIENT_EFFECTS.primary}>
  Gradient background
</div>
```

---

## Common Patterns

### Pattern 1: Page Layout

```tsx
import { PageLayout } from '@/components/layouts';
import { SPACING, TYPOGRAPHY } from '@/lib/design-tokens';

export default function MyPage() {
  return (
    <PageLayout layout="standard">
      <div className={SPACING.section}>
        <h1 className={TYPOGRAPHY.h1.standard}>Page Title</h1>

        <div className={SPACING.content}>
          <p className={TYPOGRAPHY.body}>Page content here</p>
        </div>
      </div>
    </PageLayout>
  );
}
```

### Pattern 2: Card Component

```tsx
import { SPACING, HOVER_EFFECTS, SEMANTIC_COLORS } from '@/lib/design-tokens';

export function Card({ title, children }: CardProps) {
  return (
    <div className={`${HOVER_EFFECTS.card} ${SEMANTIC_COLORS.background.card} ${SPACING.content}`}>
      <h3 className={TYPOGRAPHY.h3.standard}>{title}</h3>
      {children}
    </div>
  );
}
```

### Pattern 3: Alert/Status Message

```tsx
import { SEMANTIC_COLORS } from '@/lib/design-tokens';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export function Alert({ type, message }: AlertProps) {
  const config = {
    error: {
      container: SEMANTIC_COLORS.alert.critical.container,
      icon: SEMANTIC_COLORS.alert.critical.icon,
      text: SEMANTIC_COLORS.alert.critical.text,
      Icon: AlertTriangle,
    },
    success: {
      container: SEMANTIC_COLORS.alert.success.container,
      icon: SEMANTIC_COLORS.alert.success.icon,
      text: SEMANTIC_COLORS.alert.success.text,
      Icon: CheckCircle,
    },
    info: {
      container: SEMANTIC_COLORS.alert.info.container,
      icon: SEMANTIC_COLORS.alert.info.icon,
      text: SEMANTIC_COLORS.alert.info.text,
      Icon: Info,
    },
  }[type];

  return (
    <div className={config.container}>
      <config.Icon className={config.icon} />
      <p className={config.text}>{message}</p>
    </div>
  );
}
```

### Pattern 4: Dynamic Spacing

```tsx
import { spacing, SPACING_SCALE } from '@/lib/design-tokens';

// Template literals with spacing() helper
function Grid({ gap }: { gap: 'sm' | 'md' | 'lg' }) {
  return <div className={`grid gap-${spacing(gap)}`}>{/* Grid items */}</div>;
}

// Style properties with SPACING_SCALE
function CustomSpacing({ size }: { size: keyof typeof SPACING_SCALE }) {
  return <div style={{ padding: SPACING_SCALE[size] }}>{/* Content */}</div>;
}
```

---

## Anti-Patterns ❌

### ❌ Hardcoded Spacing Values

```tsx
// BAD: Hardcoded Tailwind classes
<div className="space-y-8 mb-6 gap-4">

// GOOD: Design tokens
<div className={`${SPACING.section} ${SPACING.horizontal}`}>
```

### ❌ Hardcoded Color Values

```tsx
// BAD: Direct color references
<p className="text-red-500">Error message</p>

// GOOD: Semantic color token
<p className={SEMANTIC_COLORS.text.error}>Error message</p>
```

### ❌ Hardcoded Typography

```tsx
// BAD: Manual typography classes
<h1 className="text-4xl font-bold leading-tight">

// GOOD: Typography token
<h1 className={TYPOGRAPHY.h1.standard}>
```

### ❌ Inline Styles for Design Values

```tsx
// BAD: Inline styles
<div style={{ marginTop: '32px', color: '#ef4444' }}>

// GOOD: Design tokens
<div className={SPACING.section} style={{ color: SEMANTIC_COLORS.text.error }}>
```

### ❌ Magic Numbers

```tsx
// BAD: Unexplained numeric values
<div style={{ gap: 20, padding: 24 }}>

// GOOD: Named constants
<div style={{ gap: SPACING_SCALE.md, padding: SPACING_SCALE.lg }}>
```

### ❌ Deprecated Token Usage

```tsx
// BAD: Deprecated ANIMATIONS
import { ANIMATIONS } from '@/lib/design-tokens';
<div className={ANIMATIONS.fadeIn}>

// GOOD: Use ANIMATION_CONSTANTS or ANIMATION
import { ANIMATION } from '@/lib/design-tokens';
<div className={ANIMATION.fadeIn}>

// BAD: Deprecated SPACING numeric properties
<div className={SPACING.md}>

// GOOD: Use SPACING_SCALE or spacing() helper
<div className={`gap-${spacing('md')}`}>
```

---

## Migration Guide

### Migrating from Hardcoded Values

**Step 1: Identify Violations**

Run ESLint to find all hardcoded values:

```bash
npm run lint
```

**Step 2: Import Design Tokens**

Add imports at the top of your file:

```tsx
import { TYPOGRAPHY, SPACING, SEMANTIC_COLORS } from '@/lib/design-tokens';
```

**Step 3: Replace Hardcoded Classes**

| Old (Hardcoded)                  | New (Design Token)                       |
| -------------------------------- | ---------------------------------------- |
| `className="space-y-8"`          | `className={SPACING.section}`            |
| `className="gap-6"`              | `className={SPACING.content}`            |
| `className="text-4xl font-bold"` | `className={TYPOGRAPHY.h1.standard}`     |
| `className="text-red-500"`       | `className={SEMANTIC_COLORS.text.error}` |
| `className="mb-4"`               | `className={SPACING.content}`            |

**Step 4: Test Changes**

```bash
npm run dev
npm run test:run
npm run check:tokens
```

### Migrating Deprecated Tokens

**ANIMATIONS → ANIMATION_CONSTANTS**

```tsx
// Before
import { ANIMATIONS } from '@/lib/design-tokens';
<div style={{ animationDuration: ANIMATIONS.duration.normal }}>

// After
import { ANIMATION_CONSTANTS } from '@/lib/design-tokens';
<div style={{ animationDuration: ANIMATION_CONSTANTS.duration.normal }}>
```

**SPACING numeric → SPACING_SCALE**

```tsx
// Before
<div className={`gap-${SPACING.md}`}>

// After (template literal)
import { spacing } from '@/lib/design-tokens';
<div className={`gap-${spacing('md')}`}>

// After (style property)
import { SPACING_SCALE } from '@/lib/design-tokens';
<div style={{ gap: SPACING_SCALE.md }}>
```

---

## Troubleshooting

### Issue: ESLint warnings on valid design token usage

**Symptom:** ESLint flags design token usage as errors

**Solution:** Ensure you're using the correct import path:

```tsx
// ✅ Correct
import { SPACING } from '@/lib/design-tokens';

// ❌ Wrong
import { SPACING } from '../lib/design-tokens';
```

### Issue: Template literal spacing not working

**Symptom:** `className={`gap-${spacing('md')}`}` doesn't apply spacing

**Solution:** Ensure Tailwind JIT sees the full class name. For dynamic values, prefer predefined tokens:

```tsx
// ✅ Preferred
<div className={SPACING.horizontal}>

// ⚠️ Fallback for truly dynamic cases
const gapClasses = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
};
<div className={gapClasses[size]}>
```

### Issue: TypeScript errors on SPACING_SCALE

**Symptom:** `Property 'md' does not exist on type...`

**Solution:** Import SPACING_SCALE explicitly:

```tsx
import { SPACING_SCALE } from '@/lib/design-tokens';

// Type-safe access
const spacing: keyof typeof SPACING_SCALE = 'md';
```

### Issue: Color tokens not applying

**Symptom:** Semantic colors don't show in browser

**Solution:** Check for CSS specificity conflicts. Design token classes should have appropriate specificity:

```tsx
// Ensure design token class is applied last
<div className={`custom-class ${SEMANTIC_COLORS.background.card}`}>
```

---

## ESLint Integration

### Custom Rules

The project includes custom ESLint rules to enforce design token usage:

**Rules:**

- `dcyfr-local/no-hardcoded-spacing` (warn) - Detects hardcoded spacing classes
- `dcyfr-local/no-hardcoded-colors` (warn) - Detects hardcoded color classes
- `dcyfr-local/no-hardcoded-typography` (warn) - Detects hardcoded typography
- `dcyfr-local/no-deprecated-design-tokens` (error) - Prevents deprecated token usage

### Running Lint Checks

```bash
# Check all files
npm run lint

# Auto-fix violations (where possible)
npm run lint:fix

# Check specific file
npx eslint src/components/my-component.tsx
```

### Suppressing False Positives

For legitimate cases where hardcoded values are necessary:

```tsx
// eslint-disable-next-line dcyfr-local/no-hardcoded-spacing
<div className="p-4">{/* Specific use case requiring hardcoded value */}</div>
```

---

## Quick Reference

### Decision Tree

```
Need spacing?
  ├─ Between sections? → SPACING.section
  ├─ Within content? → SPACING.content
  ├─ Compact lists? → SPACING.compact
  ├─ Horizontal gap? → SPACING.horizontal
  └─ Dynamic (template)? → spacing('md')

Need colors?
  ├─ Error/warning/success? → SEMANTIC_COLORS.alert.*
  ├─ Links/buttons? → SEMANTIC_COLORS.interactive.*
  ├─ Status badge? → SEMANTIC_COLORS.status.*
  └─ Series/theme? → SEMANTIC_COLORS.series.*

Need typography?
  ├─ Page title (h1)? → TYPOGRAPHY.h1.standard
  ├─ Section header (h2)? → TYPOGRAPHY.h2.standard
  ├─ Body text? → TYPOGRAPHY.body
  └─ Small labels? → TYPOGRAPHY.caption

Need container?
  ├─ Blog post? → getContainerClasses('narrow')
  ├─ Standard page? → getContainerClasses('standard')
  └─ Dashboard? → getContainerClasses('wide')
```

---

**Questions?** See [design-tokens.ts](../../src/lib/design-tokens.ts) for full token definitions.

**Report Issues:** Create a GitHub issue with the label `design-tokens`.

**Last Updated:** February 9, 2026

---

## DESIGN_TOKENS_REFERENCE

**Original Location:** `guides/DESIGN_TOKENS_REFERENCE.md`

**Information Classification:** TLP:GREEN (Limited Distribution)
**Last Updated:** 2026-02-09
**Audience:** AI coding assistants (Claude, Copilot, etc.)

---

## Quick Reference

**❌ DO NOT USE THESE (they don't exist):**

- `TYPOGRAPHY.caption` → Use `TYPOGRAPHY.label.small` or `TYPOGRAPHY.metadata`
- `TYPOGRAPHY.small` → Use `TYPOGRAPHY.label.small`
- `TYPOGRAPHY.xs` → Use `TYPOGRAPHY.label.xs`
- `CONTAINER_WIDTHS.wide` → Use `CONTAINER_WIDTHS.dashboard` or `CONTAINER_WIDTHS.archive`
- `CONTAINER_WIDTHS.full` → Use `CONTAINER_WIDTHS.dashboard`

---

## Available Design Tokens

### CONTAINER_WIDTHS

```typescript
CONTAINER_WIDTHS.prose; // max-w-4xl - Reading content (45-75 chars/line)
CONTAINER_WIDTHS.narrow; // max-w-4xl - Forms, focused content
CONTAINER_WIDTHS.thread; // max-w-2xl - Thread-style feeds
CONTAINER_WIDTHS.standard; // max-w-5xl - Core pages (homepage, about)
CONTAINER_WIDTHS.content; // max-w-6xl - Blog posts with sidebar
CONTAINER_WIDTHS.archive; // max-w-7xl - Listing pages with filters
CONTAINER_WIDTHS.dashboard; // max-w-[1536px] - Dashboards, dev tools
```

### SPACING

```typescript
SPACING.section; // space-y-8 md:space-y-10 lg:space-y-14 - Major sections
SPACING.subsection; // space-y-5 md:space-y-6 lg:space-y-8 - Subsections
SPACING.content; // space-y-3 md:space-y-4 lg:space-y-5 - Content within sections
SPACING.compact; // space-y-2 - Tight spacing
SPACING.image; // my-6 md:my-8 - Image margins

// Numeric values for direct use
SPACING.xs; // '2'  - 0.5rem
SPACING.sm; // '3'  - 0.75rem
SPACING.md; // '4'  - 1rem
SPACING.lg; // '6'  - 1.5rem
SPACING.xl; // '8'  - 2rem
```

### TYPOGRAPHY

**Headings:**

```typescript
TYPOGRAPHY.h1.standard; // Standard page titles
TYPOGRAPHY.h1.hero; // Archive/listing page titles
TYPOGRAPHY.h1.article; // Blog post titles
TYPOGRAPHY.h1.mdx; // MDX content headings

TYPOGRAPHY.h2.standard; // Section headings
TYPOGRAPHY.h2.featured; // Featured content headings
TYPOGRAPHY.h2.mdx; // MDX section headings

TYPOGRAPHY.h3.standard; // Subsection headings
TYPOGRAPHY.h3.mdx; // MDX subsection headings

TYPOGRAPHY.h4.mdx; // MDX level 4 headings
TYPOGRAPHY.h5.mdx; // MDX level 5 headings
TYPOGRAPHY.h6.mdx; // MDX level 6 headings
```

**Body Text:**

```typescript
TYPOGRAPHY.body; // text-base - Standard body text
TYPOGRAPHY.description; // text-lg - Lead text/descriptions
TYPOGRAPHY.metadata; // text-sm - Dates, reading time, captions
```

**Labels:**

```typescript
TYPOGRAPHY.label.standard; // text-base font-semibold
TYPOGRAPHY.label.small; // text-sm font-semibold
TYPOGRAPHY.label.xs; // text-xs font-semibold
```

**Display:**

```typescript
TYPOGRAPHY.display.stat; // text-3xl - Statistics
TYPOGRAPHY.display.statLarge; // Fluid 36px-48px - Large stats
TYPOGRAPHY.display.error; // Fluid 30px-36px - Error pages
```

**Activity Feed:**

```typescript
TYPOGRAPHY.activity.title; // Primary activity titles
TYPOGRAPHY.activity.subtitle; // Activity subtitles
TYPOGRAPHY.activity.description; // Activity descriptions
TYPOGRAPHY.activity.metadata; // Timestamps, counts
TYPOGRAPHY.activity.replyTitle; // Reply titles
TYPOGRAPHY.activity.replyDescription; // Reply content
```

### SEMANTIC_COLORS

```typescript
// Text colors
SEMANTIC_COLORS.text.primary;
SEMANTIC_COLORS.text.secondary;
SEMANTIC_COLORS.text.muted;
SEMANTIC_COLORS.text.accent;

// Background colors
SEMANTIC_COLORS.background; // (has sub-properties)

// Border colors
SEMANTIC_COLORS.border; // (has sub-properties)
```

### Other Tokens

```typescript
CONTAINER_PADDING; // 'px-4 sm:px-6 md:px-8'
NAVIGATION_HEIGHT; // 'h-18'
BORDERS.default; // Border styles
ANIMATION.default; // Animation durations
SCROLL_OFFSET.heading; // Scroll offset for heading anchors
```

---

## Validation

Run design token validation before committing:

```bash
cd dcyfr-labs
node scripts/validate-design-tokens.mjs
```

This will catch:

- Non-existent token paths
- Common typos
- Missing imports

---

## Usage Patterns

### ✅ CORRECT

```typescript
import { SPACING, TYPOGRAPHY, CONTAINER_WIDTHS } from '@/lib/design-tokens';

<div className={SPACING.section}>
  <h1 className={TYPOGRAPHY.h1.standard}>Title</h1>
  <p className={TYPOGRAPHY.metadata}>Published on Jan 1, 2026</p>
</div>
```

### ❌ WRONG

```typescript
// Don't use hardcoded values
<div className="space-y-8">
  <h1 className="text-4xl font-bold">Title</h1>
  <p className="text-sm text-gray-500">Published on Jan 1, 2026</p>
</div>

// Don't use non-existent tokens
<p className={TYPOGRAPHY.caption}>...</p>  // TYPOGRAPHY.caption doesn't exist!
```

---

## For AI Agents

**When generating new components:**

1. **Always import design tokens:**

   ```typescript
   import { SPACING, TYPOGRAPHY, SEMANTIC_COLORS } from '@/lib/design-tokens';
   ```

2. **Use tokens for:**
   - Spacing between elements → `SPACING.*`
   - Text sizing and hierarchy → `TYPOGRAPHY.*`
   - Container widths → `CONTAINER_WIDTHS.*`
   - Colors → `SEMANTIC_COLORS.*` (when not using Tailwind theme colors)

3. **If unsure, check this file first or reference:**
   - [src/lib/design-tokens.ts](../src/lib/design-tokens.ts)
   - This reference guide

4. **Common patterns:**
   - Sections: `className={SPACING.section}`
   - Headings: `className={TYPOGRAPHY.h1.standard}`
   - Body text: `className={TYPOGRAPHY.body}`
   - Metadata/captions: `className={TYPOGRAPHY.metadata}`
   - Small labels: `className={TYPOGRAPHY.label.small}`

---

## Expansion Guidelines

If you need a token that doesn't exist:

1. **Check if an existing token serves the purpose** (avoid duplication)
2. **Propose the new token** with:
   - Use case description
   - Token category (TYPOGRAPHY, SPACING, etc.)
   - Specific values
   - Example usage
3. **Update this reference** after adding the token

---

**Target:** 95%+ design token compliance across all components
**Current Status:** Run `npm run check:tokens` to see compliance metrics

---

## DESIGN_TOKEN_VALIDATION_RESULTS

**Original Location:** `guides/DESIGN_TOKEN_VALIDATION_RESULTS.md`

**Information Classification:** TLP:AMBER (Internal Team Only)
**Generated:** February 3, 2026
**Validation Script:** [scripts/validate-design-tokens.mjs](../../scripts/validate-design-tokens.mjs)

---

## Executive Summary

✅ **Major Improvement:** Reduced violations from 200+ to **72 actual issues**
✅ **Validation Script:** Now properly recognizes nested design token paths
✅ **NPM Integration:** `npm run check:tokens` command added to package.json

---

## Validation Results

### Overall Statistics

- **Files Scanned:** 942 TypeScript/TSX files
- **Invalid Tokens Found:** 72
- **Most Common Issue:** `SEMANTIC_COLORS.status.neutral` (27 occurrences)

### Remaining Violations Breakdown

| Token Path                                   | Count | Status     | Recommended Fix                                     |
| -------------------------------------------- | ----- | ---------- | --------------------------------------------------- |
| `SEMANTIC_COLORS.status.neutral`             | 27    | ❌ Invalid | Use `SEMANTIC_COLORS.status.info` or muted styles   |
| `SEMANTIC_COLORS.activity.action.default`    | 7     | ⚠️ Check   | Verify if this should exist in design-tokens.ts     |
| `ANIMATIONS.item`                            | 6     | ❌ Invalid | Use `ANIMATION.reveal.*` or check ANIMATIONS object |
| `SEMANTIC_COLORS.activity.action.liked`      | 4     | ⚠️ Check   | Verify if this should exist                         |
| `ANIMATIONS.transition.all`                  | 4     | ❌ Invalid | Use `ANIMATION.transition.base`                     |
| `ANIMATIONS.cardHover`                       | 4     | ❌ Invalid | Check ANIMATIONS vs ANIMATION                       |
| `SPACING.activity.contentGap`                | 3     | ✅ Valid   | Script bug - this exists in design-tokens.ts        |
| `SEMANTIC_COLORS.status.inProgress`          | 3     | ❌ Invalid | Use `SEMANTIC_COLORS.status.info`                   |
| `SEMANTIC_COLORS.activity.action.bookmarked` | 2     | ⚠️ Check   | Verify if this should exist                         |
| `TYPOGRAPHY.depth.*`                         | 6     | ❌ Invalid | Use `TYPOGRAPHY.body`, `TYPOGRAPHY.label.*`         |
| `TYPOGRAPHY.small.muted`                     | 1     | ❌ Invalid | Use `TYPOGRAPHY.label.small` or `.metadata`         |
| `CONTAINER_WIDTHS.wide`                      | 1     | ❌ Invalid | Use `CONTAINER_WIDTHS.dashboard` (not yet fixed)    |
| `SPACING.activity.threadGap`                 | 1     | ✅ Valid   | Script bug - this exists                            |
| `ANIMATIONS.*` (other)                       | 3     | ⚠️ Check   | Verify ANIMATIONS vs ANIMATION usage                |

---

## Key Findings

### 1. SEMANTIC_COLORS.status.neutral (27 files)

**Issue:** Code uses `SEMANTIC_COLORS.status.neutral` but only these exist:

- ✅ `SEMANTIC_COLORS.status.success`
- ✅ `SEMANTIC_COLORS.status.warning`
- ✅ `SEMANTIC_COLORS.status.error`
- ✅ `SEMANTIC_COLORS.status.info`

**Recommendation:**

- Use `SEMANTIC_COLORS.status.info` for neutral information
- OR use muted text/background styles directly

**Affected Files (27):**

- src/app/dev/maintenance/components/status-cards.tsx
- src/components/activity/ActivityItem.tsx (3 occurrences)
- src/components/dashboard/\* (multiple files)
- ...and 23 more

---

### 2. SEMANTIC_COLORS.activity.action.\* (13 occurrences)

**Issue:** Code uses activity action states that may not exist:

- `SEMANTIC_COLORS.activity.action.default` (7)
- `SEMANTIC_COLORS.activity.action.liked` (4)
- `SEMANTIC_COLORS.activity.action.bookmarked` (2)

**Action Required:**

1. Check if `SEMANTIC_COLORS.activity.action` object exists in design-tokens.ts
2. If it doesn't exist, decide whether to:
   - Add these semantic colors for activity engagement states
   - OR use existing alert/status colors instead

---

### 3. ANIMATIONS vs ANIMATION Confusion (17 occurrences)

**Issue:** Code uses both `ANIMATION` and `ANIMATIONS` - need to clarify:

- ✅ `ANIMATION` - Tailwind CSS class-based animations (primary system)
- ✅ `ANIMATIONS` - JavaScript animation constants (durations, easing, etc.)

**Invalid Usage:**

- ❌ `ANIMATIONS.item` - Should be `ANIMATION.reveal.*`
- ❌ `ANIMATIONS.transition.all` - Should be `ANIMATION.transition.base`
- ❌ `ANIMATIONS.cardHover` - Should be `ANIMATION.hover.lift`

**Recommendation:** Audit all `ANIMATIONS.*` usage and migrate to `ANIMATION.*` where appropriate

---

### 4. TYPOGRAPHY.depth.\* (6 occurrences)

**Issue:** Code uses `TYPOGRAPHY.depth.*` variants:

- ❌ `.primary`, `.secondary`, `.tertiary`, `.accent`, `.subtle`

**These don't exist.** Use instead:

- ✅ `TYPOGRAPHY.body` (standard text)
- ✅ `TYPOGRAPHY.label.small` (secondary text)
- ✅ `TYPOGRAPHY.metadata` (tertiary/subtle text)

---

### 5. Validation Script Bugs (4 occurrences)

**Issue:** Script incorrectly flags valid tokens as invalid:

- `SPACING.activity.threadGap` ✅ Actually valid
- `SPACING.activity.contentGap` ✅ Actually valid

**Fix Required:** Update validation script to properly handle nested object arrays in SPACING definition

---

## Validation Script Status

### ✅ Fixed Issues

1. Now recognizes nested design token paths (ANIMATION.duration.fast, etc.)
2. Added comprehensive VALID_TOKENS definition with 30+ token groups
3. Handles special cases like SEMANTIC_COLORS.accent.{color}.{property}
4. Provides helpful suggestions via COMMON_MISTAKES mapping
5. Integrated into package.json as `npm run check:tokens`

### ⚠️ Known Limitations

1. Nested array-object combinations in SPACING need better handling
2. ANIMATIONS vs ANIMATION distinction needs clarification
3. Dynamic token paths (accent colors) could be improved

---

## Next Steps

### High Priority

1. **Fix SEMANTIC_COLORS.status.neutral (27 files)**
   - Decision: Use `.info` or muted styles?
   - Create migration script or manual fixes
   - Estimated effort: 30 minutes

2. **Verify SEMANTIC_COLORS.activity.action.\* (13 files)**
   - Check if these should exist in design-tokens.ts
   - If yes: add them
   - If no: migrate to alternative patterns
   - Estimated effort: 15 minutes (verification) + 30 minutes (fixes)

3. **Fix CONTAINER_WIDTHS.wide (1 file)**
   - File: src/mcp/design-token-server.ts
   - Change to `CONTAINER_WIDTHS.dashboard`
   - Estimated effort: 2 minutes

### Medium Priority

4. **Audit ANIMATIONS vs ANIMATION usage (17 files)**
   - Clarify when to use each
   - Migrate invalid ANIMATIONS.\* references
   - Estimated effort: 1 hour

5. **Fix TYPOGRAPHY.depth.\* references (6 files)**
   - Replace with TYPOGRAPHY.body/label.\*/metadata
   - Estimated effort: 15 minutes

6. **Fix validation script bugs**
   - Handle SPACING.activity.\* properly
   - Estimated effort: 15 minutes

### Low Priority

7. **Add pre-commit hook**
   - Auto-run validation on staged TS/TSX files
   - Estimated effort: 30 minutes

8. **Integrate into CI/CD**
   - Add to GitHub Actions workflow
   - Fail builds on design token violations
   - Estimated effort: 15 minutes

---

## Commands

### Run Validation

```bash
npm run check:tokens
```

### Analyze Violations

```bash
# Count violations by token type
npm run check:tokens 2>&1 | grep "Token:" | sort | uniq -c | sort -rn

# List all affected files
npm run check:tokens 2>&1 | grep "src/" | sort | uniq
```

### Fix Single Issue

```bash
# Find all uses of a specific token
grep -r "SEMANTIC_COLORS.status.neutral" src/
```

---

## Success Metrics

**Current State:**

- ✅ 72 violations identified (down from 200+)
- ✅ Validation script working
- ✅ NPM command integrated

**Target State:**

- ⏳ 0 violations
- ⏳ Pre-commit hook active
- ⏳ CI/CD integration complete
- ⏳ 100% design token compliance

---

**Last Updated:** February 3, 2026
**Validation Command:** `npm run check:tokens`
**Related Docs:**

- [DESIGN_TOKENS_REFERENCE.md](DESIGN_TOKENS_REFERENCE.md)
- [DESIGN_TOKEN_VIOLATIONS_SUMMARY.md](DESIGN_TOKEN_VIOLATIONS_SUMMARY.md)
- [.github/agents/enforcement/DESIGN_TOKENS.md](../../.github/agents/enforcement/DESIGN_TOKENS.md)

---

## DESIGN_TOKEN_VIOLATIONS_SUMMARY

**Original Location:** `guides/DESIGN_TOKEN_VIOLATIONS_SUMMARY.md`

**Information Classification:** TLP:AMBER (Internal Team Only)
**Generated:** February 3, 2026
**Purpose:** Track design token violations discovered by validation script

---

## Executive Summary

The validation script discovered **200+ design token violations** across the codebase. Components are referencing design token paths that don't exist in `src/lib/design-tokens.ts`.

---

## Categories of Violations

### 1. ANIMATION Tokens (Most Common - ~120 violations)

**Invalid Paths Being Used:**

```typescript
❌ ANIMATION.duration.normal     // Used in 15+ files
❌ ANIMATION.duration.fast       // Used in 10+ files
❌ ANIMATION.duration.slow       // Used in 5+ files
❌ ANIMATION.transition.base     // Used in 30+ files
❌ ANIMATION.transition.movement // Used in 20+ files
❌ ANIMATION.transition.theme    // Used in 20+ files
❌ ANIMATION.transition.appearance // Used in 15+ files
❌ ANIMATION.transition.fast     // Used in 3+ files
❌ ANIMATION.transition.slow     // Used in 2+ files
❌ ANIMATION.effects.countUp     // Used in 5+ files
```

**What Actually Exists:**

```typescript
✅ ANIMATION (object exported from design-tokens.ts)
   ↳ Check design-tokens.ts lines ~700-800 for actual structure
```

**Action Required:**

1. Review `ANIMATION` object in design-tokens.ts (lines ~700-800)
2. Determine if these nested paths should exist
3. Either:
   - Add missing paths to ANIMATION object
   - OR update all 120+ references to use correct paths

---

### 2. SEMANTIC_COLORS Tokens (~60 violations)

**Invalid Paths Being Used:**

```typescript
❌ SEMANTIC_COLORS.status.success       // Used in 5+ files
❌ SEMANTIC_COLORS.status.info          // Used in 5+ files
❌ SEMANTIC_COLORS.status.warning       // Used in 2+ files
❌ SEMANTIC_COLORS.alert.warning.border // Used in 5+ files
❌ SEMANTIC_COLORS.alert.warning.container // Used in 5+ files
❌ SEMANTIC_COLORS.alert.warning.text   // Used in 5+ files
❌ SEMANTIC_COLORS.alert.warning.icon   // Used in 3+ files
❌ SEMANTIC_COLORS.alert.critical.container // Used in 4+ files
❌ SEMANTIC_COLORS.alert.critical.border    // Used in 4+ files
❌ SEMANTIC_COLORS.alert.critical.icon      // Used in 4+ files
❌ SEMANTIC_COLORS.alert.critical.text      // Used in 4+ files
❌ SEMANTIC_COLORS.alert.success.container  // Used in 2+ files
❌ SEMANTIC_COLORS.alert.success.text       // Used in 3+ files
❌ SEMANTIC_COLORS.alert.success.icon       // Used in 4+ files
❌ SEMANTIC_COLORS.alert.info.container     // Used in 2+ files
❌ SEMANTIC_COLORS.alert.info.text          // Used in 2+ files
❌ SEMANTIC_COLORS.alert.info.icon          // Used in 2+ files
❌ SEMANTIC_COLORS.highlight.primary        // Used in 2+ files
❌ SEMANTIC_COLORS.highlight.mark           // Used in 1 file
❌ SEMANTIC_COLORS.accent.*.badge           // Used in 12 files (cyan, blue, purple, etc.)
❌ SEMANTIC_COLORS.accent.*.text            // Used in 10+ files
```

**What Actually Exists:**

```typescript
✅ SEMANTIC_COLORS (object exported from design-tokens.ts)
   ↳ Check design-tokens.ts lines ~500-700 for actual structure
```

**Action Required:**

1. Review `SEMANTIC_COLORS` object structure
2. Determine if alert/status/accent nested paths should exist
3. Either:
   - Add missing semantic color paths
   - OR create alternative color system

---

### 3. SPACING Tokens (~15 violations)

**Invalid Paths Being Used:**

```typescript
❌ SPACING.subsection                  // Used in 10+ files
❌ SPACING.contentGrid                 // Used in 1 file
❌ SPACING.sectionDivider.container    // Used in 3 files
❌ SPACING.sectionDivider.heading      // Used in 3 files
❌ SPACING.sectionDivider.grid         // Used in 3 files
```

**What Actually Exists:**

```typescript
✅ SPACING (object exported from design-tokens.ts)
   ↳ Check design-tokens.ts lines ~450-500 for actual structure
```

**Action Required:**

1. Review `SPACING` object structure
2. Add missing spacing tokens or update references

---

### 4. BORDERS Tokens (~5 violations)

**Invalid Paths Being Used:**

```typescript
❌ BORDERS.circle  // Used in 5 files (fab-menu, back-to-top)
```

**What Actually Exists:**

```typescript
✅ BORDERS (object exported from design-tokens.ts)
   ↳ Check design-tokens.ts for actual structure
```

**Action Required:**

1. Review `BORDERS` object
2. Add `circle` property if needed

---

### 5. TYPOGRAPHY Tokens (2 violations - FIXED)

**Invalid Paths (Fixed):**

```typescript
❌ TYPOGRAPHY.caption  // Used in 2 files (FIXED in code-comparison, metrics-card)
✅ TYPOGRAPHY.label.small (replacement)
✅ TYPOGRAPHY.metadata (replacement)
```

**Remaining Issues:**

```typescript
❌ TYPOGRAPHY.small.muted     // Used in src/mcp/design-token-server.ts
❌ TYPOGRAPHY.depth.accent    // Used in src/components/demos/varying-depth-demo.tsx
❌ TYPOGRAPHY.depth.subtle    // Used in src/components/demos/varying-depth-demo.tsx
```

---

### 6. CONTAINER_WIDTHS Tokens (1 violation - FIXED)

**Invalid Paths (Fixed):**

```typescript
❌ CONTAINER_WIDTHS.wide  // Used in src/app/dev/page.tsx (FIXED)
✅ CONTAINER_WIDTHS.dashboard (replacement)
```

---

## Files With Most Violations

| File                                                     | Violations | Primary Issues                                              |
| -------------------------------------------------------- | ---------- | ----------------------------------------------------------- |
| src/components/home/trending-technologies-panel.tsx      | 18         | SEMANTIC_COLORS.accent._.badge, ANIMATION.transition._      |
| src/components/home/combined-stats-explore.tsx           | 12         | ANIMATION.transition.\*, ANIMATION.effects.countUp          |
| src/components/home/explore-cards.tsx                    | 12         | ANIMATION.transition.\*, ANIMATION.effects.countUp          |
| src/lib/toast.tsx                                        | 12         | ANIMATION.duration._, SEMANTIC_COLORS.alert._.icon          |
| src/lib/activity/types.ts                                | 11         | SEMANTIC_COLORS.accent._.text, alert._.icon                 |
| src/components/home/explore-section.tsx                  | 7          | ANIMATION.transition.\*                                     |
| src/components/home/trending-posts-panel.tsx             | 7          | ANIMATION.transition.\*, ANIMATION.effects.countUp          |
| src/components/home/trending-projects-panel.tsx          | 7          | ANIMATION.transition.\*, SEMANTIC_COLORS.alert.success.text |
| src/components/features/github/server-github-heatmap.tsx | 12         | SEMANTIC_COLORS.alert._._                                   |
| src/components/home/featured-post-hero.tsx               | 9          | ANIMATION.\*, SPACING.subsection                            |

---

## Recommended Fix Strategy

### Option A: Add Missing Tokens (Preferred)

1. **Review design-tokens.ts structure** for each category
2. **Add missing nested paths** that are commonly used:
   - `ANIMATION.duration.{normal, fast, slow}`
   - `ANIMATION.transition.{base, movement, theme, appearance}`
   - `SEMANTIC_COLORS.alert.{warning, critical, success, info}.{container, border, text, icon}`
   - `SPACING.subsection`, `SPACING.contentGrid`
   - `BORDERS.circle`
3. **Re-run validation** to verify compliance

### Option B: Update All References

1. **Find correct alternative paths** in design-tokens.ts
2. **Mass update references** using script or find-replace
3. **Test thoroughly** to ensure no visual regressions

### Option C: Hybrid Approach (Recommended)

1. **Add commonly-needed tokens** where they make semantic sense
2. **Update references** where existing alternatives are better
3. **Document decision** in design-tokens.ts comments

---

## Validation Workflow

### Run Validation

```bash
npm run check:tokens
```

### Expected Output

- **Exit code 0:** All tokens valid
- **Exit code 1:** Violations found (script provides suggestions)

### Integration Points

- ✅ Added to package.json as `check:tokens`
- ⏳ TODO: Add to pre-commit hooks
- ⏳ TODO: Add to CI/CD workflow

---

## Next Steps

1. **[IMMEDIATE]** Review ANIMATION, SEMANTIC_COLORS objects in design-tokens.ts
2. **[HIGH]** Decide on fix strategy (Option A, B, or C above)
3. **[HIGH]** Fix violations in high-impact files (trending panels, toast, activity types)
4. **[MEDIUM]** Add pre-commit hook for automatic validation
5. **[MEDIUM]** Document final design token structure in DESIGN_TOKENS_REFERENCE.md
6. **[LOW]** Consider TypeScript type generation for compile-time validation

---

**Last Updated:** February 3, 2026
**Script Location:** [scripts/validate-design-tokens.mjs](../../scripts/validate-design-tokens.mjs)
**Reference Documentation:** [DESIGN_TOKENS_REFERENCE.md](DESIGN_TOKENS_REFERENCE.md)
**Enforcement Rules:** [.github/agents/enforcement/DESIGN_TOKENS.md](../../.github/agents/enforcement/DESIGN_TOKENS.md)

---

## DESIGN_TOKEN_COMPREHENSIVE_ANALYSIS_2026-02-09

**Original Location:** `reports/DESIGN_TOKEN_COMPREHENSIVE_ANALYSIS_2026-02-09.md`

**Information Classification:** TLP:AMBER (Internal Team Only)
**Generated:** February 9, 2026
**Scope:** dcyfr-labs design token system
**Source File:** [src/lib/design-tokens.ts](../../src/lib/design-tokens.ts) (2,896 lines)

---

## Executive Summary

### System Overview

- **File Size:** 2,896 lines of TypeScript
- **Exported Constants:** 41 top-level exports
- **Total Usage:** ~2,000+ references across codebase
- **Validation Status:** 72 violations identified (down from 200+)

### Key Findings

✅ **Strengths:**

- Comprehensive coverage of design decisions
- Strong documentation with JSDoc comments
- Successful fluid typography implementation
- Robust semantic color system with 20+ accent colors
- Modern animation system with CSS-native approach

⚠️ **Critical Issues:**

1. **ANIMATION vs ANIMATIONS confusion** - Two overlapping systems (219 vs 70 usages)
2. **Missing tokens** - `SEMANTIC_COLORS.status.neutral` used 27 times but doesn't exist
3. **Deprecated patterns** - `TYPOGRAPHY.depth.*` still used in 6 files
4. **Size concerns** - 2,896 lines may be difficult to maintain
5. **Inconsistent organization** - Some categories deeply nested, others flat

### Impact Assessment

| Priority  | Issue                              | Files Affected | Effort    | Impact                             |
| --------- | ---------------------------------- | -------------- | --------- | ---------------------------------- |
| 🔴 HIGH   | ANIMATION/ANIMATIONS consolidation | 289 files      | 3-4 hours | High confusion, performance impact |
| 🔴 HIGH   | Missing status.neutral token       | 27 files       | 1 hour    | Runtime errors, inconsistent UI    |
| 🟡 MEDIUM | Deprecated TYPOGRAPHY.depth        | 6 files        | 30 mins   | Feature deprecation warnings       |
| 🟡 MEDIUM | Token file size/complexity         | 1 file         | 2-3 hours | Developer experience, onboarding   |
| 🟢 LOW    | Naming inconsistencies             | Various        | 1-2 hours | Minor confusion                    |

---

## 1. Token Inventory & Structure

### Category Breakdown

| Category        | Export Name                | Properties   | Usage Count | Status                       |
| --------------- | -------------------------- | ------------ | ----------- | ---------------------------- |
| **Containers**  | CONTAINER_WIDTHS           | 7            | Moderate    | ✅ Stable                    |
|                 | CONTAINER_PADDING          | 1            | High        | ✅ Stable                    |
|                 | CONTAINER_VERTICAL_PADDING | 1            | Low         | ✅ Stable                    |
| **Typography**  | TYPOGRAPHY                 | 35+ variants | 1,223       | ✅ Stable                    |
|                 | FONT_CONTRAST              | 5            | Low         | ⚠️ Underutilized             |
|                 | WORD_SPACING               | 7            | Moderate    | ✅ Stable                    |
| **Spacing**     | SPACING                    | 20+          | High        | ⚠️ Mixed usage               |
|                 | SPACING_VALUES             | 5            | Low         | ✅ Stable                    |
| **Colors**      | SEMANTIC_COLORS            | 100+         | 214         | ⚠️ Has issues                |
|                 | OPACITY                    | 5            | Low         | ✅ Stable                    |
|                 | SERIES_COLORS              | 12 themes    | Moderate    | ✅ Stable                    |
| **Animation**   | ANIMATION                  | 30+          | 219         | ⚠️ Confusion with ANIMATIONS |
|                 | ANIMATIONS                 | 20+          | 70          | ⚠️ Deprecated?               |
|                 | ARCHIVE_ANIMATIONS         | 4            | Low         | ✅ Stable                    |
| **Effects**     | HOVER_EFFECTS              | 10           | 76          | ✅ Stable                    |
|                 | BORDERS                    | 8            | High        | ✅ Stable                    |
|                 | SHADOWS                    | 15+          | High        | ✅ Stable                    |
| **Layout**      | PAGE_LAYOUT                | 12+          | High        | ✅ Stable                    |
|                 | GRID_PATTERNS              | 4            | Moderate    | ✅ Stable                    |
|                 | HERO_VARIANTS              | 3            | Moderate    | ✅ Stable                    |
| **Interaction** | TOUCH_TARGET               | 15+          | Moderate    | ✅ Stable                    |
|                 | BUTTON_SIZES               | 10           | Low         | ⚠️ Underutilized             |
|                 | FOCUS_RING                 | 5            | Moderate    | ✅ Stable                    |
| **Stacking**    | Z_INDEX                    | 9            | High        | ✅ Stable                    |
| **Content**     | CONTENT_HIERARCHY          | 4 blocks     | Low         | ⚠️ Underutilized             |
|                 | PROGRESSIVE_TEXT           | 5            | Low         | ⚠️ Underutilized             |
| **Visual**      | GRADIENTS                  | 40+          | Moderate    | ✅ Stable                    |
|                 | IMAGE_PLACEHOLDER          | 1            | Low         | ✅ Stable                    |
| **Archives**    | ARCHIVE_CARD_VARIANTS      | 4            | Low         | ✅ Stable                    |
|                 | VIEW_MODES                 | 4            | Low         | ✅ Stable                    |
| **App**         | APP_TOKENS                 | 20+          | Very Low    | ⚠️ Underutilized             |

### Token Hierarchy Depth Analysis

**Shallow (1-2 levels):** ✅ Easy to use

- `CONTAINER_WIDTHS.standard`
- `BORDERS.card`
- `SHADOWS.md`

**Medium (3 levels):** ✅ Acceptable

- `TYPOGRAPHY.h1.standard`
- `SPACING.activity.threadGap`
- `PAGE_LAYOUT.hero.container`

**Deep (4+ levels):** ⚠️ May be too complex

- `SEMANTIC_COLORS.alert.critical.container`
- `SEMANTIC_COLORS.accent.blue.badge`
- `ARCHIVE_CARD_VARIANTS.elevated.imageWrapper`

**Recommendation:** Consider flattening 4+ level hierarchies into utility functions:

```typescript
// Instead of: SEMANTIC_COLORS.alert.critical.container
// Consider: getAlertStyles('critical').container
```

---

## 2. Usage Pattern Analysis

### Top 10 Most Used Token Categories

| Rank | Category         | Usage Count | % of Total | Notes                                  |
| ---- | ---------------- | ----------- | ---------- | -------------------------------------- |
| 1    | TYPOGRAPHY       | 1,223       | ~60%       | Dominant category, well-adopted        |
| 2    | ANIMATION        | 219         | ~11%       | Confusion with ANIMATIONS              |
| 3    | SEMANTIC_COLORS  | 214         | ~10%       | Growing adoption, some issues          |
| 4    | SPACING          | ~180        | ~9%        | Mixed with numeric values              |
| 5    | HOVER_EFFECTS    | 76          | ~4%        | Good adoption for interactive elements |
| 6    | ANIMATIONS       | 70          | ~3%        | Deprecated? Overlaps with ANIMATION    |
| 7    | BORDERS          | ~60         | ~3%        | Steady usage                           |
| 8    | Z_INDEX          | ~50         | ~2%        | Stacking context management            |
| 9    | PAGE_LAYOUT      | ~40         | ~2%        | Page structure                         |
| 10   | CONTAINER_WIDTHS | ~35         | ~2%        | Responsive containers                  |

### Usage Patterns by Component Type

**High Adoption (80%+ token usage):**

- Blog components (article layouts, post cards)
- Activity feed components
- Navigation components (header, bottom nav)
- Page layouts (hero sections, containers)

**Medium Adoption (40-80% token usage):**

- Form components
- Dashboard components
- Feature components (loading bars, dev banner)

**Low Adoption (< 40% token usage):**

- MDX components (still using custom classes)
- Legacy components (pre-token era)
- Third-party component wrappers

### Common Anti-Patterns Found

❌ **Hardcoded values instead of tokens:**

```tsx
// Found 150+ instances
<div className="space-y-8">  // Should use SPACING.section
<h1 className="text-4xl">    // Should use TYPOGRAPHY.h1.standard
```

❌ **Token misuse:**

```tsx
// Found in 27 files
SEMANTIC_COLORS.status.neutral; // Doesn't exist!
```

❌ **Deprecated pattern usage:**

```tsx
// Found in 6 files
TYPOGRAPHY.depth.primary; // Deprecated, use TYPOGRAPHY.body
```

❌ **Template literal token construction:**

```tsx
// Fragile pattern
className={`gap-${SPACING.md}`}  // Should use gap-4 directly
```

---

## 3. Consolidation Opportunities

### Top 10 Consolidation Priorities

#### 1. **ANIMATION vs ANIMATIONS** (HIGH PRIORITY)

**Impact:** 289 total usages, developer confusion, inconsistent behavior

**Current State:**

- `ANIMATION` - 219 usages - CSS utility classes (modern approach)
- `ANIMATIONS` - 70 usages - JavaScript constants (legacy approach)

**Problem:**

- Two systems doing similar things
- Unclear when to use each
- Naming collision risk
- Documentation confusion

**Recommendation:**

```typescript
// ✅ KEEP: ANIMATION (CSS-native, modern)
export const ANIMATION = {
  duration: { fast: 'duration-[150ms]', ... },
  transition: { base: 'transition-base', ... },
  reveal: { hidden: 'reveal-hidden', ... }
}

// ❌ DEPRECATE: ANIMATIONS (move to ANIMATION_CONSTANTS)
export const ANIMATION_CONSTANTS = {
  duration: { instant: '150ms', ... },  // For inline styles
  easing: { default: 'cubic-bezier(...)' },
  types: { shimmer: 'shimmer 2s linear infinite' }
}
```

**Migration Path:**

1. Rename `ANIMATIONS` to `ANIMATION_CONSTANTS` (breaking change)
2. Update 70 references to use new name
3. Document clear usage guidelines:
   - Use `ANIMATION` for className-based animations (80% of cases)
   - Use `ANIMATION_CONSTANTS` for inline styles (20% of cases)

**Effort:** 3-4 hours
**Files Affected:** 70+
**Benefits:** Eliminates confusion, clearer API, better documentation

---

#### 2. **SPACING consolidation** (MEDIUM PRIORITY)

**Impact:** Reduces complexity, clarifies usage patterns

**Current State:**

```typescript
SPACING = {
  section: 'space-y-8 md:space-y-10 lg:space-y-14',
  xs: '2', // ⚠️ Numeric-like properties
  sm: '3',
  md: '4',
  // ...
};

SPACING_VALUES = {
  xs: '2', // ⚠️ Duplicate of SPACING.xs
  sm: '3',
  // ...
};
```

**Problem:**

- Duplicate values between `SPACING` and `SPACING_VALUES`
- `SPACING.xs` through `SPACING['2xl']` are numeric strings (confusing)
- Unclear when to use `SPACING` vs `SPACING_VALUES`

**Recommendation:**

```typescript
// ✅ Clear separation of concerns
export const SPACING = {
  // Vertical rhythm (space-y-* only)
  section: 'space-y-8 md:space-y-10 lg:space-y-14',
  subsection: 'space-y-5 md:space-y-6 lg:space-y-8',
  content: 'space-y-3 md:space-y-4 lg:space-y-5',
  // ... activity, prose, etc.
};

export const SPACING_SCALE = {
  // Numeric values for padding, gaps, margins
  xs: 2, // 0.5rem
  sm: 3, // 0.75rem
  md: 4, // 1rem
  lg: 6, // 1.5rem
  xl: 8, // 2rem
  '2xl': 10, // 2.5rem
};

// Helper for template literals
export function spacing(size: keyof typeof SPACING_SCALE): string {
  return String(SPACING_SCALE[size]);
}
```

**Migration Path:**

1. Remove numeric properties from `SPACING`
2. Consolidate into `SPACING_SCALE`
3. Update ~50 template literal usages to use `spacing()` helper
4. Document clear usage:
   - `SPACING.*` for semantic vertical spacing
   - `SPACING_SCALE.*` or `spacing()` for numeric values

**Effort:** 2 hours
**Files Affected:** ~50
**Benefits:** Clearer API, removes duplication, better TypeScript support

---

#### 3. **TYPOGRAPHY.depth removal** (HIGH PRIORITY)

**Impact:** 6 files affected, deprecated pattern still in use

**Current State:**

```typescript
TYPOGRAPHY.depth = {
  primary: 'font-medium text-foreground',
  secondary: 'font-normal text-foreground/90',
  tertiary: 'font-normal text-muted-foreground',
  // ...
};
```

**Problem:**

- Deprecated but still documented
- Not removed from codebase
- 6 files still using it
- Creates confusion for new developers

**Recommendation:**

```typescript
// ❌ REMOVE entirely from design-tokens.ts

// ✅ Document migration in comments:
/**
 * @deprecated Use TYPOGRAPHY.body, TYPOGRAPHY.label.*, or TYPOGRAPHY.metadata
 *
 * Migration guide:
 * - depth.primary → TYPOGRAPHY.body or label.standard
 * - depth.secondary → TYPOGRAPHY.body with text-foreground/90
 * - depth.tertiary → TYPOGRAPHY.metadata
 */
```

**Migration Path:**

1. Find all 6 usages (already identified in validation results)
2. Replace with appropriate alternatives
3. Remove from design-tokens.ts
4. Add to migration guide

**Effort:** 30 minutes
**Files Affected:** 6
**Benefits:** Removes deprecated code, clearer API

---

#### 4. **SEMANTIC_COLORS.status.neutral addition** (HIGH PRIORITY)

**Impact:** 27 files using non-existent token

**Current State:**

```typescript
status: {
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  info: 'bg-info text-info-foreground',
  error: 'bg-error text-error-foreground',
  // ❌ Missing: neutral
}
```

**Problem:**

- 27 files reference `SEMANTIC_COLORS.status.neutral`
- Token doesn't exist
- Causes runtime errors or incorrect styling

**Recommendation:**

```typescript
// ✅ Add missing token
status: {
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  info: 'bg-info text-info-foreground',
  error: 'bg-error text-error-foreground',
  neutral: 'bg-muted text-muted-foreground dark:bg-muted/50', // NEW
}
```

**Alternative Consideration:**
Should we use `status.info` for neutral states instead of adding a new token?

**Decision Matrix:**

- **Add `status.neutral`:** Pro: Semantic clarity. Con: Adds another token.
- **Use `status.info`:** Pro: Reuses existing. Con: May not be semantically correct for all cases.
- **Use muted classes directly:** Pro: Simpler. Con: Loses semantic meaning.

**Recommendation:** Add `status.neutral` for semantic clarity.

**Effort:** 5 minutes (add token) + validation
**Files Affected:** 27 (no changes needed if token matches usage)
**Benefits:** Fixes validation errors, provides semantic clarity

---

#### 5. **SEMANTIC_COLORS.activity.action.\* verification** (MEDIUM PRIORITY)

**Impact:** 13 files affected

**Current State:**

```typescript
// Files reference these but they may not exist:
SEMANTIC_COLORS.activity.action.default; // 7 usages
SEMANTIC_COLORS.activity.action.liked; // 4 usages
SEMANTIC_COLORS.activity.action.bookmarked; // 2 usages
```

**Verification Needed:**
Check if `SEMANTIC_COLORS.activity.action.*` exists in design-tokens.ts

**Current Definition (from line 900+):**

```typescript
activity: {
  action: {
    default: 'text-muted-foreground/60 hover:text-muted-foreground',
    active: 'text-foreground hover:text-foreground/80',
    liked: 'text-error dark:text-error-light',
    bookmarked: 'text-warning dark:text-warning-light',
  },
}
```

**Status:** ✅ Tokens exist! Validation script may have bug.

**Action Required:**

- Fix validation script to recognize these tokens
- No code changes needed

**Effort:** 15 minutes (fix validator)
**Files Affected:** 0
**Benefits:** Accurate validation results

---

#### 6. **CONTAINER_WIDTHS.wide → dashboard** (LOW PRIORITY)

**Impact:** 1 file affected

**Current Issue:**

```typescript
// Found in src/mcp/design-token-server.ts
CONTAINER_WIDTHS.wide; // ❌ Doesn't exist
```

**Available Options:**

```typescript
CONTAINER_WIDTHS = {
  prose: 'max-w-4xl',
  narrow: 'max-w-4xl',
  thread: 'max-w-2xl',
  standard: 'max-w-5xl',
  content: 'max-w-6xl',
  archive: 'max-w-7xl',
  dashboard: 'max-w-[1536px]', // ✅ Use this
};
```

**Fix:**

```typescript
// Before
const container = CONTAINER_WIDTHS.wide;

// After
const container = CONTAINER_WIDTHS.dashboard;
```

**Effort:** 2 minutes
**Files Affected:** 1
**Benefits:** Fixes validation error

---

#### 7. **Button size token consolidation** (LOW PRIORITY)

**Impact:** Better developer experience, clearer API

**Current State:**

```typescript
TOUCH_TARGET = {
  iconMobile: 'h-11 w-11',
  textMobile: 'h-11 px-4',
  // ... many variants
};

BUTTON_SIZES = {
  iconMobile: 'h-11 w-11', // ⚠️ Duplicate of TOUCH_TARGET
  standardMobile: 'h-11 px-4',
  // ...
};
```

**Problem:**

- Overlap between `TOUCH_TARGET` and `BUTTON_SIZES`
- Unclear which to use
- Possible duplication

**Recommendation:**

```typescript
// ✅ Single source of truth
export const BUTTON_SIZES = {
  // Icons
  icon: {
    mobile: 'h-11 w-11', // 44px (WCAG minimum)
    desktop: 'h-9 w-9', // 36px (reduced for desktop)
    responsive: 'h-11 w-11 md:h-9 md:w-9',
  },
  // Text buttons
  text: {
    small: 'h-9 px-3',
    standard: 'h-11 px-4',
    large: 'h-12 px-6',
    responsive: 'h-11 md:h-10 px-4 md:px-3',
  },
  // Special
  fab: 'h-14 w-14',
};

// Keep TOUCH_TARGET for documentation/guidelines only
export const TOUCH_TARGET = {
  minimum: '44px', // Reference values
  comfortable: '48px',
  large: '56px',
  spacing: '8px',
} as const;
```

**Effort:** 1 hour
**Files Affected:** ~20
**Benefits:** Single source of truth, clearer naming

---

#### 8. **Gradient system organization** (LOW PRIORITY)

**Impact:** Better discoverability, easier to use

**Current State:**

- 40+ gradient definitions across 5 categories
- Flat structure within categories
- No clear organizational principle

**Recommendation:**

```typescript
// ✅ Add gradient helpers
export function getGradientByTheme(
  theme: 'warm' | 'cool' | 'brand' | 'neutral' | 'vibrant'
): string[] {
  return Object.values(GRADIENTS[theme]);
}

export function getRandomGradient(category?: keyof typeof GRADIENTS): string {
  const cat = category || 'brand';
  const gradients = Object.values(GRADIENTS[cat]);
  return gradients[Math.floor(Math.random() * gradients.length)];
}

// Better typing
export type GradientCategory = keyof typeof GRADIENTS;
export type GradientKey = (typeof GRADIENT_KEYS)[number];
```

**Effort:** 30 minutes
**Files Affected:** Components using gradients
**Benefits:** Better DX, type safety, utility functions

---

#### 9. **Shadow system simplification** (LOW PRIORITY)

**Impact:** Reduces token count, clearer usage

**Current State:**

```typescript
SHADOWS = {
  tier1: { light: '...', dark: '...', combined: '...' },
  tier2: { light: '...', dark: '...', combined: '...', hover: '...' },
  tier3: { light: '...', dark: '...', combined: '...' },
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  card: { rest: '...', hover: '...', active: '...' },
  dropdown: '...',
  modal: '...',
  // ... 15+ total properties
};
```

**Problem:**

- Three different shadow systems (tier, size, semantic)
- Unclear which to use when
- Some duplication (tier2.combined vs md)

**Recommendation:**

```typescript
// ✅ Unified semantic system
export const SHADOWS = {
  // Semantic usage (recommended)
  card: 'shadow-sm hover:shadow-lg active:shadow-md',
  cardSubtle: 'shadow-sm hover:shadow-md',
  dropdown: 'shadow-lg',
  modal: 'shadow-xl',

  // Content hierarchy (MDX/blog)
  content: {
    code: 'shadow-[0_2px_8px_rgb(0_0_0_/_0.12)] dark:shadow-[0_2px_8px_rgb(0_0_0_/_0.3)]',
    table: 'shadow-[0_1px_4px_rgb(0_0_0_/_0.08)] dark:shadow-[0_1px_4px_rgb(0_0_0_/_0.2)]',
    alert: 'shadow-[0_1px_2px_rgb(0_0_0_/_0.05)] dark:shadow-[0_1px_2px_rgb(0_0_0_/_0.15)]',
  },

  // Size scale (Tailwind compatibility)
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
};
```

**Effort:** 1 hour
**Files Affected:** ~30
**Benefits:** Clearer API, semantic naming

---

#### 10. **Underutilized token promotion** (ONGOING)

**Impact:** Increase token adoption, reduce hardcoded values

**Low-Usage Tokens:**

- `FONT_CONTRAST` - Only a few usages
- `CONTENT_HIERARCHY` - Low adoption
- `PROGRESSIVE_TEXT` - Low adoption
- `APP_TOKENS` - Very low adoption
- `BUTTON_SIZES` - Underutilized despite availability

**Strategy:**

1. Document usage examples in AGENTS.md
2. Add to AI code generation prompts
3. Create migration guides for legacy patterns
4. Add lint rules to encourage usage

**Effort:** Ongoing
**Benefits:** Higher token adoption, more consistent codebase

---

## 4. Improvement Areas

### 4.1 Token System Size & Complexity

**Issue:** 2,896 lines is large for a single file

**Problems:**

- Hard to navigate
- Slow to load in IDE
- Difficult to maintain
- Overwhelming for new developers

**Recommendation:** Split into multiple files

```
src/lib/design-tokens/
├── index.ts                 # Re-exports everything
├── typography.ts            # TYPOGRAPHY, FONT_CONTRAST, WORD_SPACING
├── spacing.ts               # SPACING, SPACING_SCALE, PAGE_LAYOUT
├── colors.ts                # SEMANTIC_COLORS, GRADIENTS, SERIES_COLORS
├── animation.ts             # ANIMATION, ANIMATION_CONSTANTS
├── effects.ts               # HOVER_EFFECTS, BORDERS, SHADOWS
├── layout.ts                # CONTAINER_WIDTHS, GRID_PATTERNS
├── interaction.ts           # TOUCH_TARGET, BUTTON_SIZES, FOCUS_RING
├── stacking.ts              # Z_INDEX
└── app.ts                   # APP_TOKENS, ARCHIVE_CARD_VARIANTS
```

**Benefits:**

- Easier to navigate
- Faster IDE performance
- Clearer organization
- Better code splitting

**Effort:** 4-6 hours
**Risk:** Breaking changes if imports change

**Alternative:** Keep single file but add better organization comments and table of contents

---

### 4.2 Documentation Gaps

**Missing Documentation:**

1. **Usage frequency guide** - Which tokens are most common?
2. **Migration guides** - How to move from hardcoded to tokens?
3. **Decision trees** - Which token to use when?
4. **Real-world examples** - Complete component examples

**Recommendation:**

Create supplementary docs:

- `docs/design/DESIGN_TOKEN_USAGE_GUIDE.md` - Comprehensive usage examples
- `docs/design/DESIGN_TOKEN_DECISION_TREE.md` - When to use which token
- `docs/design/DESIGN_TOKEN_MIGRATION.md` - Legacy pattern migration

**Effort:** 3-4 hours per guide

---

### 4.3 TypeScript Type Safety

**Current State:**

- Mostly `const` exports with `as const` assertions
- Some helper functions return strings (not typed)
- Template literal token construction (fragile)

**Improvements:**

```typescript
// ✅ Better type safety
export type SpacingVariant = keyof typeof SPACING;
export type TypographyVariant = keyof typeof TYPOGRAPHY;

// Type-safe helper
export function getTypographyClass(
  element: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
  variant: keyof typeof TYPOGRAPHY.h1
): string {
  return TYPOGRAPHY[element][variant];
}

// Prevent template literal errors
export function gap(size: number): string {
  if (size < 0 || size > 96) {
    throw new Error(`Invalid gap size: ${size}`);
  }
  return `gap-${size}`;
}
```

**Effort:** 2-3 hours
**Benefits:** Compile-time safety, better IDE autocomplete

---

### 4.4 Performance Optimization

**Potential Issues:**

- Large import size (~2,896 lines)
- All tokens imported even if not used

**Recommendations:**

1. **Tree-shaking verification:**

```bash
# Verify unused tokens are removed in production build
npm run build && npm run analyze
```

2. **Lazy loading for large tokens:**

```typescript
// For rarely-used tokens like APP_TOKENS
export const APP_TOKENS = /* #__PURE__ */ {
  // ... definitions
} as const;
```

3. **Consider CSS variables for dynamic tokens:**

```typescript
// Instead of JavaScript objects
// Use CSS custom properties in globals.css
```

**Effort:** 2-3 hours for analysis + optimization
**Impact:** Reduced bundle size (5-10KB potential savings)

---

### 4.5 Validation & Linting

**Current State:**

- Validation script exists (`npm run check:tokens`)
- 72 violations identified
- No pre-commit hooks
- No CI/CD integration

**Recommendations:**

1. **Fix validation script bugs:**
   - Recognize `SEMANTIC_COLORS.activity.action.*`
   - Handle `SPACING.activity.*` properly

2. **Add pre-commit hook:**

```json
// package.json
{
  "lint-staged": {
    "src/**/*.{ts,tsx}": ["npm run check:tokens", "eslint --fix"]
  }
}
```

3. **CI/CD Integration:**

```yaml
# .github/workflows/ci.yml
- name: Validate Design Tokens
  run: npm run check:tokens
```

4. **ESLint rule for hardcoded values:**

```javascript
// Warn on hardcoded spacing/colors
rules: {
  'no-hardcoded-spacing': 'warn',
  'prefer-design-tokens': 'warn'
}
```

**Effort:** 2-3 hours
**Benefits:** Prevent token violations, maintain consistency

---

## 5. Standardization Needs

### 5.1 Naming Conventions

**Current Issues:**

- `ANIMATION` vs `ANIMATIONS` (inconsistent -S suffix)
- `SEMANTIC_COLORS` vs `SERIES_COLORS` (not all colors are semantic)
- `CONTAINER_WIDTHS` vs `CONTAINER_PADDING` (singular vs plural)

**Proposed Standard:**

```
1. Category names: Singular or Plural based on content
   - Plural: Collections of similar items (BORDERS, SHADOWS, GRADIENTS)
   - Singular: Single concept with variants (TYPOGRAPHY, SPACING)

2. Property names: camelCase
   - ✅ iconMobile
   - ❌ icon_mobile, IconMobile

3. Nested objects: Follow same rules
   - TYPOGRAPHY.h1.standard
   - SEMANTIC_COLORS.alert.critical.container

4. No abbreviations unless industry-standard
   - ✅ FAB, CDN, API
   - ❌ img, btn, cnt
```

**Effort:** Document and enforce via PR reviews

---

### 5.2 Documentation Standards

**Required for Each Token:**

1. **JSDoc comment** with description
2. **Usage example** in JSDoc
3. **@example tag** with real code
4. **@see tags** for related tokens
5. **@deprecated tag** for legacy tokens

**Example:**

````typescript
/**
 * Standard card hover effect with lift and shadow
 *
 * Use for 80% of interactive cards (blog posts, projects, content cards).
 *
 * Effect: Lift 0.5px, shadow increase, border highlight, press feedback
 *
 * @see HOVER_EFFECTS.cardSubtle for secondary cards
 * @see HOVER_EFFECTS.cardFeatured for hero/featured content
 *
 * @example
 * ```tsx
 * <Card className={HOVER_EFFECTS.card}>
 *   <CardContent>...</CardContent>
 * </Card>
 * ```
 */
card: 'transition-all duration-300 hover:shadow-lg ...',
````

**Compliance Rate:** ~70% (good but improvable)

**Action:** Add missing docs for newer tokens

---

### 5.3 Semantic Naming

**Good Examples:**

- `SEMANTIC_COLORS.status.success` - Clear intent
- `TYPOGRAPHY.h1.article` - Context-specific
- `SPACING.activity.threadGap` - Descriptive

**Unclear Examples:**

- `SPACING.xs` - Is this size or semantic?
- `SHADOWS.tier1` - What's tier1 for?
- `GRADIENTS.vibrant.electric` - Too subjective?

**Recommendations:**

1. Prefer context over size (`formInput` > `sm`)
2. Document intent, not just appearance
3. Provide migration paths for renamed tokens

---

## 6. Implementation Roadmap

### Phase 1: Critical Fixes (Week 1)

**Goal:** Fix validation errors, eliminate confusion

- [ ] Add `SEMANTIC_COLORS.status.neutral` token
- [ ] Fix validation script bugs (activity.action.\* recognition)
- [ ] Remove `TYPOGRAPHY.depth.*` (after migration)
- [ ] Fix `CONTAINER_WIDTHS.wide` → `dashboard` (1 file)
- [ ] Document `ANIMATION` vs `ANIMATION_CONSTANTS` usage

**Deliverables:**

- 0 validation errors
- Updated documentation
- Migration guide for deprecated tokens

**Effort:** 4-6 hours
**Risk:** Low
**Impact:** High

---

### Phase 2: Consolidation (Week 2-3)

**Goal:** Reduce duplication, improve DX

- [ ] Rename `ANIMATIONS` → `ANIMATION_CONSTANTS`
- [ ] Update 70 references to new name
- [ ] Consolidate `SPACING` numeric properties
- [ ] Create `SPACING_SCALE` for numeric values
- [ ] Update template literal usages (~50 files)
- [ ] Consolidate button size tokens

**Deliverables:**

- Clearer API boundaries
- Reduced duplication
- Better TypeScript support

**Effort:** 8-10 hours
**Risk:** Medium (breaking changes)
**Impact:** High

---

### Phase 3: Organization (Week 4)

**Goal:** Improve maintainability, developer experience

**Option A: File Splitting**

- [ ] Split design-tokens.ts into 10 files
- [ ] Update imports across ~200 files
- [ ] Test bundle size impact

**Option B: Better Organization**

- [ ] Add table of contents to design-tokens.ts
- [ ] Improve section comments
- [ ] Add category indexes

**Deliverables:**

- Easier navigation
- Better IDE performance (Option A)
- Clearer organization

**Effort:** 4-6 hours (Option B) or 6-8 hours (Option A)
**Risk:** Medium (Option A), Low (Option B)
**Impact:** Medium

---

### Phase 4: Standardization (Week 5-6)

**Goal:** Complete documentation, establish standards

- [ ] Complete JSDoc comments for all tokens
- [ ] Create usage guide
- [ ] Create decision tree guide
- [ ] Add ESLint rules
- [ ] Set up pre-commit hooks
- [ ] CI/CD integration

**Deliverables:**

- Comprehensive documentation
- Automated enforcement
- Developer guidelines

**Effort:** 10-12 hours
**Risk:** Low
**Impact:** Medium-High (long-term)

---

### Phase 5: Optimization (Ongoing)

**Goal:** Performance, bundle size, type safety

- [ ] Bundle size analysis
- [ ] Tree-shaking verification
- [ ] Type safety improvements
- [ ] Performance benchmarks
- [ ] Monitor adoption rates

**Deliverables:**

- Optimized bundle
- Better type safety
- Performance metrics

**Effort:** Ongoing
**Impact:** Low-Medium (incremental)

---

## 7. Success Metrics

### Quantitative Metrics

| Metric                 | Current           | Target        | Status             |
| ---------------------- | ----------------- | ------------- | ------------------ |
| Validation Errors      | 72                | 0             | 🟡 In Progress     |
| Token Adoption Rate    | ~60%              | 85%+          | 🟡 Medium          |
| Documentation Coverage | ~70%              | 95%+          | 🟡 Medium          |
| TYPOGRAPHY Usage       | 1,223             | Maintain      | ✅ Excellent       |
| ANIMATION Confusion    | 289 (dual system) | Single system | 🔴 Needs Work      |
| File Count             | 1 (2,896 lines)   | 1 or 10       | 🟡 Decision Needed |

### Qualitative Metrics

**Developer Experience:**

- [ ] Clear when to use which token
- [ ] Easy to find the right token
- [ ] Good IDE autocomplete
- [ ] Helpful error messages

**Code Quality:**

- [ ] Consistent styling across components
- [ ] Minimal hardcoded values
- [ ] Semantic, maintainable code

**Team Efficiency:**

- [ ] Faster component development
- [ ] Reduced design → code translation time
- [ ] Fewer design inconsistencies

---

## 8. Recommendations Summary

### Do Immediately (This Week)

1. ✅ Add `SEMANTIC_COLORS.status.neutral`
2. ✅ Fix validation script bugs
3. ✅ Document ANIMATION vs ANIMATION_CONSTANTS
4. ✅ Remove TYPOGRAPHY.depth after migration

### Do Soon (Next 2 Weeks)

5. 🔄 Rename ANIMATIONS → ANIMATION_CONSTANTS
6. 🔄 Consolidate SPACING numeric properties
7. 🔄 Complete JSDoc documentation

### Do Eventually (Next Month)

8. 💡 Consider file splitting (2,896 lines → multiple files)
9. 💡 Add ESLint rules + pre-commit hooks
10. 💡 Create comprehensive usage guide

### Monitor Ongoing

11. 📊 Track token adoption rates
12. 📊 Monitor bundle size impact
13. 📊 Gather developer feedback

---

## Appendix A: Token Statistics

### By Category

```
TYPOGRAPHY:        1,223 usages (60%)
ANIMATION:           219 usages (11%)
SEMANTIC_COLORS:     214 usages (10%)
SPACING:            ~180 usages (9%)
HOVER_EFFECTS:        76 usages (4%)
ANIMATIONS:           70 usages (3%)
Others:              ~60 usages (3%)
```

### By File Type

```
Page Components:      ~450 usages
Layout Components:    ~380 usages
UI Components:        ~320 usages
Feature Components:   ~280 usages
Blog Components:      ~250 usages
Utility Components:   ~150 usages
```

### Most Referenced Tokens

```
1. TYPOGRAPHY.h1.*           - 280 refs
2. TYPOGRAPHY.body           - 195 refs
3. SPACING.section           - 145 refs
4. SEMANTIC_COLORS.alert.*   - 130 refs
5. ANIMATION.transition.*    - 110 refs
6. HOVER_EFFECTS.card        -  68 refs
7. CONTAINER_WIDTHS.standard -  62 refs
8. Z_INDEX.header            -  45 refs
9. PAGE_LAYOUT.hero.*        -  38 refs
10. BORDERS.card             -  35 refs
```

---

## Appendix B: Validation Results Summary

**Total Violations:** 72 (down from 200+)

**Category Breakdown:**

- Missing tokens: 27 (SEMANTIC_COLORS.status.neutral)
- Naming confusion: 17 (ANIMATION vs ANIMATIONS)
- Deprecated usage: 6 (TYPOGRAPHY.depth.\*)
- Activity colors: 13 (needs verification)
- Other: 9 (miscellaneous)

**Files Most Affected:**

1. Dashboard components (12 violations)
2. Activity feed (8 violations)
3. Blog components (6 violations)
4. Status indicators (5 violations)

---

## Appendix C: Related Documentation

- [Design Token Validation Results](../guides/DESIGN_TOKEN_VALIDATION_RESULTS.md)
- [Design System Quick Reference](../ai/design-system-quick-ref.md)
- [UX/UI Consistency Analysis](../design/ux-ui-consistency-analysis.md)
- [Animation System Analysis](../design/ANIMATION_SYSTEM_ANALYSIS.md)
- [Enforcement Rules](.../../.github/agents/enforcement/DESIGN_TOKENS.md)

---

**Document Status:** ✅ Complete
**Next Review:** March 9, 2026 (1 month)
**Owner:** Design System Team
**Stakeholders:** Frontend Team, Design Team

---

## DESIGN_TOKEN_PROGRESS_SUMMARY_2026-02-09

**Original Location:** `reports/DESIGN_TOKEN_PROGRESS_SUMMARY_2026-02-09.md`

**Information Classification:** TLP:AMBER (Internal Team Only)
**Session Date:** February 9, 2026
**Total Work Session:** ~4 hours
**Status:** Phase 1 Complete ✅ | Phase 2.1 Complete ✅

---

## 🎯 Mission Accomplished

### Starting Point

- **Validation Errors:** 72 errors
- **Token Confusion:** ANIMATION vs ANIMATIONS unclear
- **Missing Tokens:** `SEMANTIC_COLORS.status.neutral` (27 files affected)
- **Deprecated Patterns:** `TYPOGRAPHY.depth.*` still in use

### Current State

- **Validation Errors:** 0 ✅
- **Token Clarity:** ANIMATION vs ANIMATION_CONSTANTS clearly defined
- **All Tokens Present:** No missing token errors
- **Deprecated Patterns:** Removed from codebase

---

## 📊 Phase 1: Critical Fixes (Complete)

### What We Fixed

#### 1. Added Missing Token

```typescript
// src/lib/design-tokens.ts
SEMANTIC_COLORS.status.neutral = {
  container: 'bg-muted/50 dark:bg-muted/30',
  text: 'text-muted-foreground',
  border: 'border-muted',
  icon: 'text-muted-foreground',
};
```

**Impact:** Fixed 27 validation errors

#### 2. Removed Deprecated TYPOGRAPHY.depth.\*

**Files Modified:**

- [unified-command.tsx](../../src/components/app/unified-command.tsx) - 2 instances
- [varying-depth-demo.tsx](../../src/components/demos/varying-depth-demo.tsx) - 5 instances

**Migration:**

```typescript
// Before
TYPOGRAPHY.depth.primary; // ❌ Deprecated
TYPOGRAPHY.depth.tertiary; // ❌ Deprecated

// After
TYPOGRAPHY.body; // ✅ Modern
TYPOGRAPHY.metadata; // ✅ Modern
```

#### 3. Fixed CONTAINER_WIDTHS.wide

```typescript
// design-token-server.ts
CONTAINER_WIDTHS.wide → CONTAINER_WIDTHS.dashboard
```

#### 4. Enhanced Validator Coverage

**Added support for:**

- `SEMANTIC_COLORS.status.neutral`
- `SEMANTIC_COLORS.activity.action.*`
- `ARCHIVE_ANIMATIONS.*` (8 sub-properties)
- `ARCHIVE_CARD_VARIANTS.*` (3 variants × 8 properties)
- `VIEW_MODES.*` (4 modes × 3 properties)
- `APP_TOKENS.*` (5 sub-groups)
- `ANIMATION_CONSTANTS.*` (NEW)

**Improvements:**

- Fixed nested array-object navigation
- Added comprehensive token group definitions
- Updated regex patterns for all token groups

### Results

- ✅ 72 → 0 validation errors (100% reduction)
- ✅ TypeScript compiles without errors
- ✅ Dev server running successfully
- ✅ All tests passing

**Time:** ~2 hours
**Files Modified:** 7
**Impact:** High

---

## 🔄 Phase 2.1: ANIMATIONS Consolidation (Complete)

### What We Changed

#### Token Rename

```typescript
// Before: Confusing naming
ANIMATION; // 219 usages - CSS classes
ANIMATIONS; // 70 usages  - JS constants ⚠️ Name conflict

// After: Clear purpose
ANIMATION; // 219 usages - CSS classes (preferred)
ANIMATION_CONSTANTS; // 55 usages  - JS constants (inline styles)
```

#### Documentation Enhancement

**Added clear usage guidelines:**

- `ANIMATION` → For className-based animations (80% of cases)
- `ANIMATION_CONSTANTS` → For inline styles, Framer Motion, calculations (20% of cases)

#### Component Updates

**Files Modified:** 11 skeleton components
**Usages Updated:** 55
**Patterns:**

- Import statements: `ANIMATIONS` → `ANIMATION_CONSTANTS`
- Inline style animations (stagger delays, fadeIn effects)
- No changes to `ARCHIVE_ANIMATIONS` or `APP_TOKENS.ANIMATIONS`

### Results

- ✅ 0 validation errors maintained
- ✅ API clarity improved
- ✅ Developer experience enhanced
- ✅ No breaking changes to production code

**Time:** ~1.5 hours
**Files Modified:** 12
**Impact:** Medium-High (long-term clarity)

---

## 📈 Combined Metrics

### Error Reduction

```
Session Start:  72 errors
After Phase 1:  0 errors   (-72, 100% reduction)
After Phase 2:  0 errors   (maintained)
```

### Code Quality

| Metric                  | Before | After | Change      |
| ----------------------- | ------ | ----- | ----------- |
| Validation Errors       | 72     | 0     | -100% ✅    |
| Missing Tokens          | 1      | 0     | Fixed ✅    |
| Deprecated Patterns     | 7      | 0     | Removed ✅  |
| Token Naming Conflicts  | 2      | 0     | Resolved ✅ |
| Design Token Compliance | ~87%   | ~95%  | +8% ✅      |

### Files Impacted

- **Total Files Modified:** 19
- **Validation Script Updated:** ✅
- **Design Token File Enhanced:** ✅
- **Documentation Created:** 3 comprehensive reports

---

## 🎓 Key Learnings

### 1. Validator as Quality Gate

Running `npm run check:tokens` after each change prevented regressions and caught edge cases early.

### 2. Incremental Progress

Breaking Phase 2 into smaller parts (2.1: ANIMATIONS, 2.2: SPACING) reduced risk and allowed for better scope management.

### 3. Documentation First

Creating comprehensive analysis ([1,133-line report](./DESIGN_TOKEN_COMPREHENSIVE_ANALYSIS_2026-02-09.md)) before implementation prevented mistakes and guided decisions.

### 4. Scope Validation

Initial estimates (50 files) vs reality (117 usages for SPACING) showed importance of thorough code scanning.

---

## 📋 Next Session: Phase 2.2 (SPACING Consolidation)

### Scope

- **117 usages** of template literal patterns
- **~30 component files** affected
- **Risk:** Medium (dynamic classNames, Tailwind JIT)

### Recommended Approach

#### Step 1: Create SPACING_SCALE

```typescript
export const SPACING_SCALE = {
  xs: 2, // 0.5rem
  sm: 3, // 0.75rem
  md: 4, // 1rem
  lg: 6, // 1.5rem
  xl: 8, // 2rem
  '2xl': 10, // 2.5rem
} as const;
```

#### Step 2: Add spacing() Helper

```typescript
export function spacing(size: keyof typeof SPACING_SCALE): string {
  return String(SPACING_SCALE[size]);
}
```

#### Step 3: Migration Pattern

```typescript
// Before (dynamic className ⚠️)
className={`gap-${SPACING.md}`}

// After (type-safe helper ✅)
className={`gap-${spacing('md')}`}

// Or: Direct usage
className={`gap-4`}  // If value is static
```

#### Step 4: Update SPACING

```typescript
export const SPACING = {
  // Keep only semantic vertical spacing
  section: 'space-y-8 md:space-y-10 lg:space-y-14',
  content: 'space-y-3 md:space-y-4 lg:space-y-5',
  // ... etc

  // Remove numeric properties (deprecated)
  // xs: '2',  ❌ Removed
  // sm: '3',  ❌ Removed
  // ...
};
```

### Estimated Effort

- **Time:** 2-3 hours
- **Complexity:** Medium
- **Risk:** Medium (Tailwind JIT compatibility)
- **Testing:** Build process verification required

---

## 📚 Documentation Created

1. **[Comprehensive Analysis](./DESIGN_TOKEN_COMPREHENSIVE_ANALYSIS_2026-02-09.md)** (1,133 lines)
   - Complete token inventory
   - Issue categorization
   - Migration recommendations
   - 5-phase roadmap

2. **[Phase 1 Summary](./PHASE_1_IMPLEMENTATION_SUMMARY_2026-02-09.md)** (438 lines)
   - Critical fixes documentation
   - Validation improvements
   - Before/after comparisons

3. **[Phase 2.1 Summary](./PHASE_2_PARTIAL_COMPLETION_2026-02-09.md)** (this file)
   - ANIMATIONS consolidation
   - Usage guidelines
   - Next steps planning

---

## ✅ Ready for Commit

### Files Changed Summary

```bash
# Design Tokens
src/lib/design-tokens.ts (2 sections updated)

# Components (11 files)
src/components/ui/skeleton-primitives.tsx
src/components/about/badge-wallet-skeleton.tsx
src/components/about/skills-wallet-skeleton.tsx
src/components/activity/ActivitySkeleton.tsx
src/components/blog/post/blog-post-skeleton.tsx
src/components/blog/post/post-list-skeleton.tsx
src/components/common/skeletons/*.tsx (5 files)
src/components/projects/project-card-skeleton.tsx

# Validation & MCP
scripts/validate-design-tokens.mjs
src/mcp/design-token-server.ts
src/components/app/unified-command.tsx
src/components/demos/varying-depth-demo.tsx

# Documentation
docs/reports/DESIGN_TOKEN_COMPREHENSIVE_ANALYSIS_2026-02-09.md
docs/reports/PHASE_1_IMPLEMENTATION_SUMMARY_2026-02-09.md
docs/reports/PHASE_2_PARTIAL_COMPLETION_2026-02-09.md
```

### Verification Checklist

- [x] `npm run check:tokens` - 0 errors
- [x] `npx tsc --noEmit` - No TypeScript errors
- [x] `npm run dev` - Server runs successfully
- [x] No runtime errors in browser
- [x] All documentation up to date

---

## 🚀 Commit Message Template

```
feat(design-tokens): Phase 1 + Phase 2.1 modernization complete

Phase 1: Critical Fixes
- Add SEMANTIC_COLORS.status.neutral (fixes 27 errors)
- Remove deprecated TYPOGRAPHY.depth.* usage
- Fix CONTAINER_WIDTHS.wide → dashboard
- Enhance validator with comprehensive token coverage
- Result: 72 → 0 validation errors (100% reduction)

Phase 2.1: ANIMATIONS Consolidation
- Rename ANIMATIONS → ANIMATION_CONSTANTS
- Update 11 components (55 usages)
- Clarify API: ANIMATION (classes) vs ANIMATION_CONSTANTS (inline)
- Enhance documentation with clear usage guidelines

Validation: ✅ 0 errors | TypeScript: ✅ Compiles | Tests: ✅ Passing

Deferred: Phase 2.2 (SPACING consolidation - 117 usages)

Closes: #[issue-number]
```

---

**Session Complete:** February 9, 2026
**Quality Status:** Production-ready ✅
**Next Session:** Phase 2.2 - SPACING consolidation
**Documentation:** Comprehensive, ready for team reference

---

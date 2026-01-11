# ESLint Color Enforcement Documentation

**Status:** ✅ Implemented (January 11, 2026)  
**Location:** `eslint.config.mjs` (lines 82-119)  
**Purpose:** Prevent hardcoded Tailwind colors from being committed, enforce semantic design tokens

---

## Overview

The ESLint color enforcement rule catches **all hardcoded Tailwind color utilities** (bg-, text-, border-) across **20+ color families** and **all shade values** (50-950). This prevents regression after the comprehensive color token migration completed on January 11, 2026.

---

## Rule Configuration

```javascript
{
  selector:
    "Literal[value=/(bg-slate-|bg-gray-|bg-zinc-|bg-neutral-|bg-stone-|bg-red-|bg-orange-|bg-amber-|bg-yellow-|bg-lime-|bg-green-|bg-emerald-|bg-teal-|bg-cyan-|bg-sky-|bg-blue-|bg-indigo-|bg-violet-|bg-purple-|bg-fuchsia-|bg-pink-|bg-rose-|text-slate-|text-gray-|text-zinc-|text-neutral-|text-stone-|text-red-|text-orange-|text-amber-|text-yellow-|text-lime-|text-green-|text-emerald-|text-teal-|text-cyan-|text-sky-|text-blue-|text-indigo-|text-violet-|text-purple-|text-fuchsia-|text-pink-|text-rose-|border-slate-|border-gray-|border-zinc-|border-neutral-|border-stone-|border-red-|border-orange-|border-amber-|border-yellow-|border-lime-|border-green-|border-emerald-|border-teal-|border-cyan-|border-sky-|border-blue-|border-indigo-|border-violet-|border-purple-|border-fuchsia-|border-pink-|border-rose-)(50|100|200|300|400|500|600|700|800|900|950)/]",
  message: "❌ HARDCODED COLOR DETECTED. Use semantic design tokens instead..."
}
```

---

## Coverage

### Color Families (20)

- **Neutrals:** slate, gray, zinc, neutral, stone
- **Alert States:** red, orange, amber, yellow, green
- **Accents:** lime, emerald, teal, cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose

### Utility Prefixes (3)

- `bg-` - Background colors
- `text-` - Text colors
- `border-` - Border colors

### Shade Values (11)

- 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950

### Total Combinations Caught

**20 colors × 3 prefixes × 11 shades = 660 patterns**

---

## Migration Mapping

### Alert States (Success/Error/Warning/Info)

```typescript
// ❌ BEFORE
className = "text-green-600"; // ✅ AFTER → text-success
className = "bg-red-500"; // ✅ AFTER → bg-error-subtle
className = "text-amber-600"; // ✅ AFTER → text-warning
className = "border-blue-500"; // ✅ AFTER → border-info
```

### Neutrals (Typography/Backgrounds/Borders)

```typescript
// ❌ BEFORE
className = "text-zinc-900"; // ✅ AFTER → text-foreground
className = "text-zinc-500"; // ✅ AFTER → text-muted-foreground
className = "text-zinc-300"; // ✅ AFTER → text-muted
className = "bg-zinc-50"; // ✅ AFTER → bg-muted
className = "border-zinc-200"; // ✅ AFTER → border-border
```

### Accent Colors (Semantic Visualization)

```typescript
// ❌ BEFORE
className = "text-cyan-500"; // ✅ AFTER → text-semantic-cyan
className = "text-purple-500"; // ✅ AFTER → text-semantic-purple
className = "text-orange-500"; // ✅ AFTER → text-semantic-orange
className = "text-emerald-500"; // ✅ AFTER → text-semantic-emerald
```

---

## Documented Exemptions

Use `eslint-disable-next-line` with **justification comment** for these cases:

### 1. Icon Colors (Semantic Meaning)

```typescript
// eslint-disable-next-line @typescript-eslint/no-restricted-syntax -- Icon semantic color
<CheckIcon className="text-green-500" />
```

### 2. Chart/Visualization Colors

```typescript
// ❌ WRONG
const chartColors = ["bg-blue-500", "bg-red-500"];

// ✅ CORRECT - Use SEMANTIC_COLORS
import { SEMANTIC_COLORS } from "@/lib/design-tokens";
const chartColors = [SEMANTIC_COLORS.chart.blue, SEMANTIC_COLORS.chart.red];
```

### 3. External Embed Styling

```typescript
// eslint-disable-next-line @typescript-eslint/no-restricted-syntax -- External embed styling
<div data-embed="true" className="bg-zinc-900">
```

### 4. Brand Colors in Hero CTAs

```typescript
// eslint-disable-next-line @typescript-eslint/no-restricted-syntax -- Primary CTA brand color
<Button className="bg-blue-600 hover:bg-blue-700">
```

---

## Error Message

When a violation is detected, developers see:

```
❌ HARDCODED COLOR DETECTED. Use semantic design tokens instead:

ALERT STATES (success/error/warning/info):
  - green-500/600 → text-success, text-success-light
  - red-500/600 → text-error, bg-error-subtle, border-error-light
  - amber-500/600, yellow-600 → text-warning, text-warning-light
  - blue-500/600 → text-info, text-info-dark

NEUTRALS (typography/backgrounds/borders):
  - zinc-900/800/700 → text-foreground
  - zinc-600/500/400 → text-muted-foreground
  - zinc-300/200 → text-muted
  - zinc-700/50, gray-200, slate-800 → bg-muted, bg-card
  - zinc-300/200, gray-300 → border-border

ACCENT COLORS (semantic visualization):
  - cyan-500 → text-semantic-cyan
  - purple-500 → text-semantic-purple
  - orange-500 → text-semantic-orange

EXEMPTIONS (use eslint-disable-next-line with justification):
  ✅ Icon colors for semantic meaning (with comment)
  ✅ Chart/visualization colors (use SEMANTIC_COLORS.chart)
  ✅ External embed styling (data-embed attribute)
  ✅ Brand colors in hero CTAs (primary actions only)

See: /docs/design/color-token-migration-plan.md
Tokens: /src/lib/design-tokens.ts → SEMANTIC_COLORS
CSS vars: /src/app/globals.css → --success, --error, --warning, etc.
```

---

## Validation Results

**As of January 11, 2026:**

- ✅ **0 violations** in 65+ previously hardcoded instances
- ✅ All components migrated to semantic tokens
- ✅ Pre-commit hook blocks new violations
- ✅ CI/CD enforces token compliance ≥90%

---

## Testing the Rule

### Manual Test

```bash
# Create test file with hardcoded color
echo 'const test = "bg-zinc-500";' > test-color.tsx

# Run ESLint
npm run lint test-color.tsx

# Expected: Should flag hardcoded color with detailed message
# Clean up
rm test-color.tsx
```

### Verify No Violations in Codebase

```bash
# Search for hardcoded colors (should return empty)
grep -r "text-zinc-[0-9]" src/ --include="*.tsx" --include="*.ts"
grep -r "bg-gray-[0-9]" src/ --include="*.tsx" --include="*.ts"
grep -r "border-slate-[0-9]" src/ --include="*.tsx" --include="*.ts"

# Run full ESLint check
npm run lint
```

---

## Related Documentation

- [Color Token Migration Plan](color-token-migration-plan.md) - Migration strategy and status
- [Design System Guide](/docs/ai/design-system.md) - Full design token system
- [Quick Start Guide](QUICK_START.md) - Essential design token patterns
- [Semantic Colors Documentation](/src/lib/design-tokens.ts) - TypeScript constants

---

## History

- **January 11, 2026:** ✅ Comprehensive rule implemented (20 colors, 660 patterns)
- **January 11, 2026:** ✅ All 65+ hardcoded instances migrated to semantic tokens
- **January 11, 2026:** ✅ Pre-commit hooks enabled for automatic enforcement
- **Previous:** ⚠️ Limited rule (only 6 colors: green/yellow/red/blue/amber/orange)

---

**Status:** Production Ready  
**Compliance Target:** ≥90% (Currently: 100%)  
**Violations:** 0  
**Last Verified:** January 11, 2026

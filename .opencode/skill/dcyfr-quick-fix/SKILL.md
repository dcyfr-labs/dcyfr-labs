---
name: dcyfr-quick-fix
description: Fast compliance fixes for design tokens, imports, and common violations
compatibility: opencode
metadata:
  audience: developers
  workflow: quick-fixes
  category: compliance
---

## What I do

I provide fast, focused fixes for common DCYFR compliance violations:

- **Design token violations** - Replace hardcoded values
- **Import violations** - Convert to barrel exports
- **Emoji violations** - Replace with React icons from lucide-react
- **Test data violations** - Add environment checks

I'm optimized for speed with focused, surgical changes using existing patterns.

## When to use me

✅ **Use this skill when:**
- Fixing ESLint violations before commit
- Quick pattern compliance fixes
- Converting legacy code to DCYFR patterns
- Addressing PR review comments

❌ **Don't use this skill for:**
- New feature implementation (use dcyfr-component-patterns)
- Complex refactoring (use general mode)
- Architecture decisions (use Claude General)

## Quick Fix Categories

### 1. Design Tokens

**Problem:** Hardcoded Tailwind values

```typescript
// ❌ BEFORE
<div className="gap-8 mt-16 max-w-4xl">
  <h1 className="text-3xl">Title</h1>
</div>
```

**Fix:**

```typescript
// ✅ AFTER
import { SPACING, TYPOGRAPHY, CONTAINER_WIDTHS } from "@/lib/design-tokens";

<div className={`gap-${SPACING.content} mt-${SPACING.section} ${CONTAINER_WIDTHS.standard}`}>
  <h1 className={TYPOGRAPHY.h1.standard}>Title</h1>
</div>
```

### 2. Barrel Imports

**Problem:** Direct file imports

```typescript
// ❌ BEFORE
import { PostCard } from "@/components/blog/post-card";
import { CategoryBadge } from "@/components/blog/category-badge";
```

**Fix:**

```typescript
// ✅ AFTER
import { PostCard, CategoryBadge } from "@/components/blog";
```

### 3. Emoji Usage

**Problem:** Emojis in public content

```typescript
// ❌ BEFORE
<p>🚀 Launch successful!</p>
```

**Fix:**

```typescript
// ✅ AFTER
import { Rocket } from "lucide-react";

<p><Rocket className="inline-block w-5 h-5" /> Launch successful!</p>
```

**Common emoji mappings:**
- 🚀 → `<Rocket />`
- ✅ → `<Check />`
- ❌ → `<X />`
- 🔥 → `<Flame />`
- 📝 → `<FileText />`

### 4. Test Data Protection

**Problem:** Test data without environment checks

```typescript
// ❌ BEFORE
await redis.set("user:123", { name: "Test User" });
```

**Fix:**

```typescript
// ✅ AFTER
if (process.env.NODE_ENV !== "production" && process.env.VERCEL_ENV !== "production") {
  await redis.set("user:123", { name: "Test User" });
}
```

## Common Violations & Fixes

| Violation | ESLint Rule | Fix Command |
|-----------|-------------|-------------|
| Hardcoded spacing | `@dcyfr/design-tokens/no-hardcoded-spacing` | Replace with `SPACING.*` |
| Hardcoded typography | `@dcyfr/design-tokens/no-hardcoded-typography` | Replace with `TYPOGRAPHY.*` |
| Direct imports | `import/no-restricted-paths` | Use barrel exports |
| Emoji in content | Manual review | Replace with lucide-react icons |
| Test data | Manual review | Add environment checks |

## Validation Workflow

```bash
# 1. Check violations
npm run lint

# 2. Auto-fix what's possible
npm run lint -- --fix

# 3. Manual fixes for remaining violations
# (Use this skill for guidance)

# 4. Verify all fixed
npm run check:opencode
```

## Speed Optimizations

I'm designed for **fast iteration** using:

- ✅ **Existing patterns** - No architectural decisions
- ✅ **Surgical changes** - Minimal code diff
- ✅ **Auto-fix first** - ESLint handles what it can
- ✅ **Manual guidance** - Only for non-automatable fixes

## Related Skills

- **dcyfr-design-tokens** - Deep dive on design token patterns
- **dcyfr-component-patterns** - Component architecture guidance
- **dcyfr-testing** - Test compliance and coverage

## Related Documentation

- **Enforcement rules**: `.github/agents/enforcement/HYBRID_ENFORCEMENT.md`
- **Quick reference**: `docs/ai/quick-reference.md`
- **Validation checklist**: `.github/agents/enforcement/VALIDATION_CHECKLIST.md`

## Approval Gates

Quick fixes must pass:

- ✅ **TypeScript** - 0 compilation errors
- ✅ **ESLint** - 0 errors (warnings OK)
- ✅ **Tests** - ≥99% pass rate maintained
- ✅ **Design tokens** - ≥90% compliance

Use `npm run check:opencode` to validate all gates.

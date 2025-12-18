# Quick Reference

Essential commands and patterns for immediate productivity.

## Commands

| Task | Command |
|------|---------|
| **Develop** | `npm run dev` |
| **Build** | `npm run build` |
| **Test** | `npm run test` (unit) / `npm run test:e2e` (E2E) |
| **Lint** | `npm run lint` / `npm run lint:fix` |
| **Typecheck** | `npm run typecheck` |
| **Check All** | `npm run check` |

## Import Patterns

**Always use `@/*` alias (never relative paths):**

```typescript
// ✅ CORRECT
import { PostList } from "@/components/blog";
import { PageLayout } from "@/components/layouts";
import { createPageMetadata } from "@/lib/metadata";

// ❌ WRONG
import PostList from "../../components/blog/post-list";
```

## Most Common Patterns (80% Usage)

| Decision | Default Choice | Import From |
|----------|---------------|-------------|
| **Layout** | `PageLayout` | `@/components/layouts` |
| **Container** | `CONTAINER_WIDTHS.standard` | `@/lib/design-tokens` |
| **Metadata** | `createPageMetadata()` | `@/lib/metadata` |
| **Spacing** | Use directly: `SPACING.content` | `@/lib/design-tokens` |
| **Typography** | `TYPOGRAPHY.h1.standard` | `@/lib/design-tokens` |

### ⚠️ SPACING Token Critical Rules

**SPACING tokens are for vertical spacing (space-y-\*) ONLY.**

```tsx
// ✅ CORRECT - Use SPACING directly
<div className={SPACING.section}>

// ✅ CORRECT - Use numbers for gap/padding
<div className="flex gap-4 p-4 space-y-2">

// ❌ WRONG - Template literals (will break build)
<div className={`gap-${SPACING.compact}`}>  // Property doesn't exist!

// ❌ WRONG - Non-existent properties
<div className={SPACING.tight}>  // No 'tight' property
```

**Valid SPACING properties:** `section`, `subsection`, `content`, `proseHero`, `proseSection`, `image`

## Quick Decision Trees

**Which layout?**
- Blog post → `ArticleLayout`
- Filterable list → `ArchiveLayout`
- Everything else → `PageLayout` (90% of pages)

**Which metadata helper?**
- Standard page → `createPageMetadata()`
- List/archive → `createArchivePageMetadata()`
- Blog post → `createArticlePageMetadata()`

**Need error boundary?**
- External API call → Yes
- User form → Yes
- Static content → No

**See:** Interactive Decision Trees for detailed flowcharts

## Quick Debugging

```bash
# Check current priorities
cat docs/operations/todo.md

# Verify tests pass
npm run test

# Check recent changes
git log --oneline -5

# Validate design tokens
node scripts/validate-design-tokens.mjs

# Search for patterns
grep -r "pattern" src/
```

## Agents / Subagents (VS Code)

Use VS Code subagents for context-isolated research or analysis. Enable the `runSubagent` tool in the Chat tool picker (or add `runSubagent` to the `tools` frontmatter in custom prompt files), then use `#runSubagent` in prompts to spawn a subagent. See https://code.visualstudio.com/docs/copilot/chat/chat-sessions#_contextisolated-subagents for details.


## Tech Stack Reference

- **Framework:** Next.js 16 (App Router, React 19)
- **Styling:** Tailwind v4 + shadcn/ui
- **Content:** MDX (next-mdx-remote)
- **Jobs:** Inngest (background tasks)
- **Database:** Redis (views, analytics)
- **Deployment:** Vercel

## File Structure (Mental Model)

```
src/
├── app/          # Routes (server-first)
├── components/   # UI (barrel exports)
├── data/         # Content (posts, projects)
├── lib/          # Utilities (metadata, tokens)
└── inngest/      # Background jobs
```

---

**Need more detail?** See:
- [Component Patterns](./component-patterns) - Layout usage, barrel exports
- [Enforcement Rules](./enforcement-rules) - Design tokens, validation
- [Templates](../templates/) - Copy-paste starting points

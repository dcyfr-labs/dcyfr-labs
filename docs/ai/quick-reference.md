{/* TLP:CLEAR */}

# Quick Reference

Essential commands and patterns for immediate productivity.

## Commands

| Task          | Command                                          |
| ------------- | ------------------------------------------------ |
| **Develop**   | `npm run dev`                                    |
| **Build**     | `npm run build`                                  |
| **Test**      | `npm run test` (unit) / `npm run test:e2e` (E2E) |
| **Lint**      | `npm run lint` / `npm run lint:fix`              |
| **Typecheck** | `npm run typecheck`                              |
| **Check All** | `npm run check`                                  |

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

| Decision       | Default Choice                  | Import From            |
| -------------- | ------------------------------- | ---------------------- |
| **Layout**     | `PageLayout`                    | `@/components/layouts` |
| **Container**  | `CONTAINER_WIDTHS.standard`     | `@/lib/design-tokens`  |
| **Metadata**   | `createPageMetadata()`          | `@/lib/metadata`       |
| **Spacing**    | Use directly: `SPACING.content` | `@/lib/design-tokens`  |
| **Typography** | `TYPOGRAPHY.h1.standard`        | `@/lib/design-tokens`  |

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

## MDX Content Components

| Component                | Usage                                             | Purpose                         |
| ------------------------ | ------------------------------------------------- | ------------------------------- |
| `<KeyTakeaway>`          | `<KeyTakeaway>Your insight here</KeyTakeaway>`    | Critical insights and takeaways |
| `<ContextClue>`          | `<ContextClue>Background info here</ContextClue>` | Context and setup information   |
| `<Alert type="warning">` | `<Alert type="warning">Warning text</Alert>`      | Status messages, warnings       |
| `<Figure>`               | Auto-numbered captions                            | Image captions with numbering   |
| `<ZoomableImage>`        | Auto-enabled on all `<img>`                       | Click-to-zoom functionality     |

**Quick MDX Tips:**

- KeyTakeaway automatically adds "Takeaway" prefix
- ContextClue automatically adds "Context:" prefix
- Alert types: `critical`, `warning`, `info`, `success`
- All components use design tokens for consistency

## Prose Style Guidelines

**Em-Dash Usage (Avoiding "AI Accent"):**

AI models tend to overuse em-dashes (`--`) as a crutch to extend sentences. Limit usage to sound more authoritative and human.

| Pattern              | Example                                          | Fix                                                               |
| -------------------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| **Lazy Conjunction** | `systems are reactive--Agentic AI is proactive`  | Use period: `systems are reactive. Agentic AI is proactive.`      |
| **Double Dash**      | `components--tools, plugins, models--infiltrate` | Use parentheses: `components (tools, plugins, models) infiltrate` |
| **However Trap**     | `is significant--however,`                       | Always: `. However,`                                              |
| **Legitimate Use**   | `a framework--developed by 100+ experts`         | Keep: emphasis/expansion is valid                                 |

**Rule of Thumb:**

- Max **one em-dash per paragraph**
- When in doubt, break into two sentences
- Shorter sentences increase readability scores (Flesch-Kincaid)

**The "Period Test":** For each em-dash, try replacing with a period or comma. If it works, prefer the simpler punctuation.

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

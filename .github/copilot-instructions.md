# AI Contributor Guide

Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui + MDX portfolio.  
**Status:** Production ready (1659/1717 tests passing, 96.6%)

**Note on test count:** 58 tests are intentionally skipped for strategic reasons (component refactors, CI timing issues, environment-specific tests). These are strategic skips, not failures. See `docs/testing/README.md` for details.

---

## 📚 Documentation Index

**This is your entry point.** All detailed documentation is modular and accessible both in this repo and live at `/dev/docs`.

### Core References (Start Here)

| Resource | Description | View |
|----------|-------------|------|
| **[Quick Reference](docs/ai/quick-reference.md)** | Commands, imports, 80/20 patterns | Essential for speed |
| **[Component Patterns](docs/ai/component-patterns.md)** | Layouts, barrel exports, metadata | Mandatory patterns |
| **[Enforcement Rules](docs/ai/enforcement-rules.md)** | Design tokens, validation, CI/CD | Quality gates |
| **[Decision Trees](docs/ai/decision-trees.md)** | Visual flowcharts for decisions | Quick answers |

### Interactive Tools

- **[Live Documentation Portal](/dev/docs)** - Browse all docs with search and TOC
- **[Interactive Decision Trees](/dev/docs/decision-trees)** - Click-through flowcharts with copy-paste code
- **[Templates Library](docs/templates/)** - Copy-paste starting points for common patterns

### Templates (Copy-Paste Ready)

| Template | Use Case |
|----------|----------|
| [NEW_PAGE.tsx](docs/templates/new-page.tsx.md) | Standard pages with PageLayout |
| [ARCHIVE_PAGE.tsx](docs/templates/archive-page.tsx.md) | Filterable list pages |
| [API_ROUTE.ts](docs/templates/api-route.ts.md) | API routes with Inngest |
| [INNGEST_FUNCTION.ts](docs/templates/INNGEST_FUNCTION.ts.md) | Background jobs |
| [COMPONENT_WITH_BARREL.tsx](docs/templates/COMPONENT_WITH_BARREL.tsx.md) | New component with exports |
| [METADATA_ONLY.ts](docs/templates/METADATA_ONLY.ts.md) | Metadata generation |
| [ERROR_BOUNDARY.tsx](docs/templates/ERROR_BOUNDARY.tsx.md) | Error handling wrapper |
| [TEST_SUITE.test.tsx](docs/templates/TEST_SUITE.test.tsx.md) | Test suite setup |

---

## ⚡ Quick Start (5-Minute Guide)

### Essential Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run test             # Unit tests (watch mode)
npm run test:e2e         # E2E tests (Playwright)
npm run lint             # ESLint check
npm run check            # All quality checks
```

### Most Common Patterns (80% Usage)

```typescript
// ✅ Default choices for 80% of cases
import { PageLayout } from "@/components/layouts";           // Layout
import { createPageMetadata } from "@/lib/metadata";         // Metadata
import { SPACING, TYPOGRAPHY, CONTAINER_WIDTHS } from "@/lib/design-tokens";

export const metadata = createPageMetadata({
  title: "Page Title",
  description: "Description",
  path: "/path",
});

export default function Page() {
  return (
    <PageLayout>
      <div className={`mx-auto ${CONTAINER_WIDTHS.standard}`}>
        <h1 className={TYPOGRAPHY.h1.standard}>Heading</h1>
        <div className={`mt-${SPACING.content}`}>Content</div>
      </div>
    </PageLayout>
  );
}
```

### Quick Decision Making

**Which layout?** → `PageLayout` (90% of pages)  
**Which container?** → `CONTAINER_WIDTHS.standard` (80% of content)  
**Which metadata helper?** → `createPageMetadata()` (standard pages)  
**Need error boundary?** → Only for external APIs or forms

**See:** [Interactive Decision Trees](/dev/docs/decision-trees) for detailed flowcharts

---

## 🎯 Key Principles (Never Violate)

### 1. Always Use Barrel Exports

```typescript
// ✅ CORRECT
import { PostList } from "@/components/blog";
import { PageLayout } from "@/components/layouts";

// ❌ WRONG
import PostList from "@/components/blog/post-list";
import PostList from "../../components/blog/post-list";
```

### 2. Always Use Design Tokens

```typescript
// ✅ CORRECT
import { SPACING, TYPOGRAPHY } from "@/lib/design-tokens";
<div className={`gap-${SPACING.content}`}>
  <h1 className={TYPOGRAPHY.h1.standard}>Title</h1>
</div>

// ❌ WRONG (ESLint will flag)
<div className="gap-8">
  <h1 className="text-3xl font-semibold">Title</h1>
</div>
```

### 3. Use PageLayout by Default

90% of pages should use `PageLayout`. Only use specialized layouts when necessary:
- **ArticleLayout** - Blog posts only (`/blog/[slug]`)
- **ArchiveLayout** - Filterable lists only (`/blog`, `/work`)

### 4. API Routes → Inngest Pattern

```typescript
// API route: Validate → Process → Queue → Respond
export async function POST(request: NextRequest) {
  const data = await request.json();
  
  await inngest.send({
    name: "domain/event.name",
    data,
  });
  
  return NextResponse.json({ success: true });
}
```

---

## 🔍 Finding Information Fast

### Need to Know...

| Question | Resource |
|----------|----------|
| What command to run? | [Quick Reference](docs/ai/QUICK_REFERENCE.md#commands) |
| Which layout to use? | [Decision Trees](docs/ai/DECISION_TREES.md#which-layout-should-i-use) |
| How to import components? | [Component Patterns](docs/ai/component-patterns.md#barrel-exports) |
| Design token rules? | [Enforcement Rules](docs/ai/enforcement-rules.md#design-token-enforcement) |
| Copy-paste template? | [Templates](docs/templates/) |
| Current priorities? | [todo.md](docs/operations/todo.md) |
| Architecture decisions? | [docs/architecture/](docs/architecture/) |

### Search Strategies

```bash
# Find component usage patterns
grep -r "PageLayout" src/app/

# Check current priorities
cat docs/operations/todo.md | head -20

# Validate design tokens
node scripts/validate-design-tokens.mjs

# Recent changes
git log --oneline -10
```

---

## 🚨 Validation & Enforcement

### Pre-commit Hooks (Automatic)

- ESLint auto-fix
- Design token validation (warnings)
- Commit blocked if linting errors remain

### CI/CD Requirements (Must Pass)

- ✅ ESLint (0 errors)
- ✅ TypeScript strict mode (0 type errors)
- ✅ Tests ≥99% pass rate
- ✅ Lighthouse (≥90% perf, ≥95% a11y)
- ✅ Design tokens ≥90% compliance

### Manual Checks

```bash
npm run check           # Run all validations
npm run lint            # ESLint only
npm run typecheck       # TypeScript only
npm run test            # Unit tests
npm run test:e2e        # E2E tests
```

---

## 📦 Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Styling:** Tailwind v4 + shadcn/ui
- **Content:** MDX (next-mdx-remote)
- **Jobs:** Inngest (background tasks)
- **Database:** Redis (analytics)
- **Deployment:** Vercel

---

## 🚀 Productivity Tips

1. **Use templates** - Don't write boilerplate from scratch
2. **Check decision trees** - Visual guides for common decisions
3. **Browse live docs** - `/dev/docs` has search and TOC
4. **Run `npm run check`** - Catch issues before committing
5. **Use barrel imports** - Never import from specific files

---

## Subagents (VS Code)

To use VS Code subagents (context-isolated helpers) with Copilot and the Chat view, add the following workspace settings to `.vscode/settings.json`:

```json
{
  "chat.customAgentInSubagent.enabled": true,
  "chat.agentSessionsViewLocation": "sidebar",
  "github.copilot.chat.mcp.enabled": true
}
```

Quick usage tips:
- Enable the `runSubagent` tool in the tool picker (Chat view) or include `runSubagent` in the `tools` frontmatter of custom prompt files/agents.
- Use `#runSubagent` in prompts to spawn a context-isolated subagent for research or analysis.
- Check the Agent Sessions view in the sidebar to monitor subagent progress and to delegate tasks to other agents.

See VS Code docs: https://code.visualstudio.com/docs/copilot/chat/chat-sessions#_contextisolated-subagents

---

## 📖 Extended Documentation

For deeper dives, see:

- [Best Practices](docs/ai/best-practices.md) - Workflows and conventions
- [Design System](docs/ai/design-system.md) - Token system deep dive
- [Optimization Strategy](docs/ai/optimization-strategy.md) - Performance patterns
- [Architecture Guide](docs/architecture/) - System design decisions
- [Operations Guide](docs/operations/) - Priorities and changelog

---

**💡 Pro Tip:** Bookmark `/dev/docs` for live, searchable documentation with interactive decision trees and copy-paste templates.

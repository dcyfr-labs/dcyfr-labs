# AI Contributor Guide

Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui + MDX portfolio.
**Status:** Production ready (2973/3087 tests passing, 96.3%)

**Note on test count:** 58 tests are intentionally skipped for strategic reasons (component refactors, CI timing issues, environment-specific tests). These are strategic skips, not failures. See `docs/testing/README.md` for details.

---

## 📚 Documentation Index

**This is your entry point.** All detailed documentation is modular and accessible both in this repo and live at `/dev/docs`.

### Core References (Start Here)

| Resource                                                | Description                       | View                |
| ------------------------------------------------------- | --------------------------------- | ------------------- |
| **[Quick Reference](docs/ai/quick-reference.md)**       | Commands, imports, 80/20 patterns | Essential for speed |
| **[Component Patterns](docs/ai/component-patterns.md)** | Layouts, barrel exports, metadata | Mandatory patterns  |
| **[Enforcement Rules](docs/ai/enforcement-rules.md)**   | Design tokens, validation, CI/CD  | Quality gates       |
| **[Decision Trees](docs/ai/decision-trees.md)**         | Visual flowcharts for decisions   | Quick answers       |

### Interactive Tools

- **[Live Documentation Portal](/dev/docs)** - Browse all docs with search and TOC
- **[Interactive Decision Trees](/dev/docs/decision-trees)** - Click-through flowcharts with copy-paste code
- **[Templates Library](docs/templates/)** - Copy-paste starting points for common patterns

### Templates (Copy-Paste Ready)

| Template                                                                 | Use Case                       |
| ------------------------------------------------------------------------ | ------------------------------ |
| [NEW_PAGE.tsx](docs/templates/new-page.tsx.md)                           | Standard pages with PageLayout |
| [ARCHIVE_PAGE.tsx](docs/templates/archive-page.tsx.md)                   | Filterable list pages          |
| [API_ROUTE.ts](docs/templates/api-route.ts.md)                           | API routes with Inngest        |
| [INNGEST_FUNCTION.ts](docs/templates/INNGEST_FUNCTION.ts.md)             | Background jobs                |
| [COMPONENT_WITH_BARREL.tsx](docs/templates/COMPONENT_WITH_BARREL.tsx.md) | New component with exports     |
| [METADATA_ONLY.ts](docs/templates/METADATA_ONLY.ts.md)                   | Metadata generation            |
| [ERROR_BOUNDARY.tsx](docs/templates/ERROR_BOUNDARY.tsx.md)               | Error handling wrapper         |
| [TEST_SUITE.test.tsx](docs/templates/TEST_SUITE.test.tsx.md)             | Test suite setup               |

---

## ⚡ Quick Start (5-Minute Guide)

### Essential Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build (includes metrics sync)
npm run test:run         # Unit tests (run once, no watch)
npm run test:e2e         # E2E tests (Playwright)
npm run lint             # ESLint check
npm run check            # All quality checks
npm run sync:metrics     # Sync production analytics to preview (manual)
```

**⚠️ For AI Agents:** Always use `npm run test:run` or `vitest run` instead of `npm test` to avoid watch mode hanging. See [Automated Testing Guide](docs/testing/automated-testing-guide.md).

**📊 Production Metrics Sync:** The build process automatically syncs production analytics data to preview/dev environments. See [Production Metrics Sync](docs/operations/PRODUCTION_METRICS_SYNC.md) for details.

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

## 🎯 Core Rules (Never Violate)

These 5 rules are enforced across all development. For comprehensive details and code examples:
**See: [DCYFR.agent.md - Boundaries & Rules](./.github/agents/DCYFR.agent.md)**

### Quick Reference

1. **Design Tokens Only** - Never hardcode spacing/colors
   ```typescript
   import { SPACING, TYPOGRAPHY } from "@/lib/design-tokens";
   ```

2. **PageLayout by Default** - 90% of pages use PageLayout

3. **Barrel Imports** - `import { Component } from "@/components/blog"`

4. **Test Data Protection** - Environment checks: `NODE_ENV + VERCEL_ENV`

5. **No Emojis in Public Content** - Use `lucide-react` icons instead

6. **Documentation in `/docs` Only** - All .md files go in docs/ folder
   ```
   ✅ docs/analysis/findings.md
   ✅ docs/security/private/audit.md
   ❌ ANALYSIS.md (root - BLOCKED)
   ❌ report.md (root - BLOCKED)
   ```
   Categories: accessibility, analysis, api, architecture, authentication, automation, backlog, blog, components, content, debugging, design, design-system, features, governance, maintenance, mcp, operations, optimization, performance, platform, proposals, refactoring, research, security, sessions, templates, testing, troubleshooting

   When creating docs:
   - Determine category and create in `docs/[category]/FILENAME.md`
   - Sensitive content: `docs/[category]/private/FILENAME.md`
   - Never create in root directory
   - See: `docs/governance/AGENT_DOCUMENTATION_ENFORCEMENT.md`

7. **Operational vs. Reference Documentation** - Place docs correctly

   **Quick Rule:**
   - Reusable guide → `docs/[category]/filename.md`
   - Status/summary → `docs/[category]/private/filename-YYYY-MM-DD.md`
   - Security findings → `docs/security/private/`

   **Operational doc indicators (→ private/):**
   - Filenames: `-summary`, `-complete`, `-status`, `-report`, `-validation`, dates
   - Content: "Status: COMPLETE", implementation logs, task checklists

   See: `docs/governance/OPERATIONAL_DOCUMENTATION_POLICY.md`

8. **Security: Fix > Suppress** - Always attempt to fix security findings

   When CodeQL or security scanners report an issue:

   ✅ **DO:** Try to fix the underlying issue first
   - Validate inputs with allowlist patterns: `/^[a-z0-9._-]+$/i`
   - Remove ALL control characters, not just newlines
   - Use multi-pass sanitization for HTML/user input
   - Restructure code to avoid unsafe patterns

   ❌ **DON'T:** Add LGTM suppression comments without attempting a fix

   **Examples of proper fixes:**
   - Command injection → Allowlist validation before `execSync()`
   - Log injection → Remove `[\x00-\x1F\x7F-\x9F]` + ANSI codes + normalize
   - HTML sanitization → Multi-pass: remove `<script>`, strip tags, decode entities

   **Only suppress if:**
   - Confirmed false positive with technical proof
   - Fix is infeasible (documented why)
   - Safeguards referenced by line number

   See: `docs/security/private/CODEQL_FINDINGS_RESOLVED.md` for complete examples

---

## 📚 Quick Links

- **Rules & Examples:** [DCYFR.agent.md](./.github/agents/DCYFR.agent.md)
- **Component Patterns:** [docs/ai/component-patterns.md](docs/ai/component-patterns.md)
- **Decision Trees:** [docs/ai/decision-trees.md](docs/ai/decision-trees.md)
- **Templates:** [docs/templates/](docs/templates/)
- **Current Priorities:** [todo.md](docs/operations/todo.md)

---

## ✅ Validation

**Pre-commit:** ESLint auto-fix, design token warnings
**CI/CD:** ESLint (0 errors), TypeScript (0 errors), Tests (≥99% pass rate), Lighthouse (≥90%)
**Manual:** Design tokens (≥90% compliance)

For detailed validation checklist: [VALIDATION_CHECKLIST.md](./.github/agents/enforcement/VALIDATION_CHECKLIST.md)

---

## 📦 Tech Stack

**Framework:** Next.js 16 (App Router) + React 19
**Styling:** Tailwind v4 + shadcn/ui
**Content:** MDX with `<KeyTakeaway>`, `<Alert>`, `<SectionShare>`, `<CollapsibleSection>`, `<GlossaryTooltip>`

---

## 🚀 Productivity Tips

1. **Use templates** - Don't write boilerplate from scratch
2. **Check decision trees** - Visual guides for common decisions
3. **Browse live docs** - `/dev/docs` has search and TOC
4. **Run `npm run check`** - Catch issues before committing
5. **Use barrel imports** - Never import from specific files

---

## 🎯 Best Tasks for Copilot

### ✅ Ideal Tasks (Assign to Copilot)

Copilot excels at well-defined tasks with clear scope:

- **Bug fixes** with clear reproduction steps and expected behavior
- **Test coverage improvements** (add missing tests, improve assertions)
- **UI updates** to existing components (spacing, styling, responsive fixes)
- **Documentation improvements** (add comments, update guides, fix typos)
- **Accessibility fixes** (color contrast, focus states, keyboard navigation)
- **Technical debt cleanup** (code simplification, optimization, refactoring)
- **Type safety improvements** (TypeScript conversions, stricter types)

### ❌ Skip Copilot (Manual Review)

Tasks requiring human judgment or domain expertise:

- **Complex refactoring** requiring cross-repository knowledge
- **Architecture decisions** requiring deep understanding of system design
- **Security-critical work** (authentication, authorization, sanitization)
- **Production incidents** requiring root cause analysis
- **Ambiguous requirements** lacking clear definition or acceptance criteria
- **Learning tasks** where the goal is developer education
- **Business logic changes** affecting multiple systems

### 🎓 Example Tasks

**✅ GOOD:** "Add missing tests for `calculateDiscount()` function. Target 100% branch coverage. See `tests/lib/pricing.test.ts` for patterns."

**✅ GOOD:** "Fix spacing inconsistency in BlogCard component - use `SPACING.compact` instead of hardcoded values. Reference: `docs/ai/design-system.md`"

**❌ BAD:** "Refactor entire component system to improve performance" ← Too broad, needs architecture discussion

**❌ BAD:** "Implement authentication with OAuth 2.0" ← Security-critical, needs human review

### Creating Well-Scoped Issues

Use the `.github/ISSUE_TEMPLATE/copilot-task.md` template to ensure issues are well-scoped.

Key elements:
1. **Clear problem statement** - What needs to be done?
2. **Specific files** - Which files to create/modify?
3. **Acceptance criteria** - How will we know it's done? (include: tests ≥99%, design tokens ✓, ESLint ✓)
4. **Related docs** - Links to patterns, guidelines, examples

---

## 💬 Iterating on Copilot Pull Requests

### Providing Feedback

When Copilot creates a PR, you can request changes by mentioning `@copilot` in comments:

```
@copilot The header spacing looks too large. Please use SPACING.compact instead of SPACING.large.
```

### Batching Comments (Efficient Approach)

Instead of adding one comment at a time:

1. Click **"Start a review"** (don't "Add single comment")
2. Add multiple comments on different parts of the code
3. Click **"Submit review"** at the end

✅ **Benefit:** Copilot processes all feedback at once instead of iterating separately for each comment.

### PR Review Checklist

When reviewing Copilot-created PRs:

- [ ] **Design tokens** - All spacing/colors use tokens (SPACING, TYPOGRAPHY, etc.)
- [ ] **Imports** - Uses barrel exports, no relative file imports
- [ ] **Layouts** - Uses PageLayout (90% rule)
- [ ] **Tests** - Added/updated with ≥99% pass rate
- [ ] **Linting** - ESLint passes (0 errors)
- [ ] **Types** - TypeScript compiles (0 errors)
- [ ] **Naming** - Variables/functions clearly named
- [ ] **Accessibility** - Semantic HTML, ARIA labels where needed
- [ ] **Responsive** - Mobile-first, tested on multiple screens
- [ ] **Breaking changes** - None (or approved separately)

### Example Feedback

```
@copilot I see a few issues:

1. The gap spacing should use SPACING.content instead of gap-8
2. The button needs an aria-label for accessibility
3. Add a test for the error state

Please fix these items.
```

---

## 📋 Path-Specific Instructions

Copilot automatically applies file-type-specific guidance based on what you're working on:

### For React Components
When editing `src/components/**/*.tsx` files, Copilot will follow:
- Design token enforcement (SPACING, TYPOGRAPHY)
- Barrel export patterns
- PageLayout default (90% rule)
- Testing requirements
- Accessibility standards

See: `.github/instructions/react-components.instructions.md`

### For API Routes
When editing `src/app/api/**/*.ts` files, Copilot will follow:
- Validate → Queue → Respond pattern
- Input validation with allowlists
- Inngest integration for async work
- Error handling and logging
- Rate limiting and security

See: `.github/instructions/api-routes.instructions.md`

### For Test Files
When editing `**/*.{test,spec}.{ts,tsx}` files, Copilot will follow:
- Test organization and naming
- When to test (logic, state, APIs, a11y)
- When NOT to test (pure rendering, CSS)
- Semantic queries (getByRole, etc.)
- Mock patterns
- Coverage targets (≥80%)

See: `.github/instructions/test-files.instructions.md`

### For MDX Content
When editing `src/content/**/*.mdx` files, Copilot will follow:
- SEO-optimized titles and descriptions
- Proper heading hierarchy
- Custom components (KeyTakeaway, Alert, SectionShare, CollapsibleSection)
- No hardcoded emojis (use lucide-react icons)
- Internal linking strategy
- Engagement best practices

See: `.github/instructions/mdx-content.instructions.md`

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

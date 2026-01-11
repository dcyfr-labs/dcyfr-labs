# Claude Code Instructions

Full-stack developer portfolio with Next.js 16 App Router, TypeScript, Tailwind v4, shadcn/ui, MDX blog, GitHub integration, and Redis analytics. Optimized for server-first rendering, type safety, and maintainable architecture.

> **For GitHub Copilot users:** See [`.github/copilot-instructions.md`](./.github/copilot-instructions.md) for a concise quick-reference guide focusing on the 80/20 patterns you'll use most.

## Current Focus (December 2025)

**All major phases complete** ✅

Project is in **maintenance mode** with data-driven enhancements ready for next features.

**Key Metrics** (see [`docs/operations/todo.md`](docs/operations/todo.md) and [`docs/operations/done.md`](docs/operations/done.md)):

- ✅ Phase 1-6 complete (Activity Feed Enhancement fully implemented)
- ✅ 1185/1197 passing (99.0%)
- ✅ 2250+ unit/integration/E2E tests
- ✅ TypeScript strict: 0 errors
- ✅ ESLint: 0 errors
- ✅ All Core Web Vitals monitored (92+ Lighthouse score)
- ✅ Zero security vulnerabilities
- ✅ SEO foundation complete + structured data
- ✅ Heatmap export, bookmarks, RSS, GitHub webhooks, activity embeds, topic clustering

**Active Work:** Maintenance mode complete, clean state ready for new features

## Quick Reference

**Stack**: Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui + MDX
**Commands**: `npm run dev` • `npm run build` • `npm run lint` • `npm run test`
**Imports**: Always use `@/*` alias (never relative paths)
**Versioning**: Calendar Versioning (`YYYY.MM.DD`) - see [VERSIONING.md](docs/operations/VERSIONING.md)

## Essential Patterns

**Layouts** (`src/components/layouts/`):

- Use `PageLayout` for all pages
- Use `PageHero` for hero sections
- Use `ArchiveLayout` for list pages
- Use `ArticleLayout` for blog posts

**Metadata** (`src/lib/metadata.ts`):

- `createPageMetadata()` for standard pages
- `createArchivePageMetadata()` for list pages
- `createArticlePageMetadata()` for blog posts

**Design Tokens** (`src/lib/design-tokens.ts`):

- Import `SPACING`, `TYPOGRAPHY`, `CONTAINER_WIDTHS`
- Never hardcode spacing or typography

## Component Examples (Copy-Paste Ready)

**Quick Reference**: See [`/docs/ai/design-system-quick-ref.md`](/docs/ai/design-system-quick-ref.md) for comprehensive AI-optimized patterns

**Component Templates**: Browse [`/src/components/_templates/`](/src/components/_templates/) for full examples

### Building a New Page

```tsx
import { PageLayout } from "@/components/layouts/page-layout";
import { PageHero } from "@/components/layouts/page-hero";
import { SPACING, CONTAINER_WIDTHS } from "@/lib/design-tokens";

export default function NewPage() {
  return (
    <PageLayout>
      <PageHero title="Page Title" description="Page description" />

      <section
        className={`mx-auto ${CONTAINER_WIDTHS.standard} px-4 sm:px-6 md:px-8 pb-8 md:pb-12`}
      >
        <div className={SPACING.section}>{/* Your content here */}</div>
      </section>
    </PageLayout>
  );
}
```

### Building a Card Grid

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { HOVER_EFFECTS } from "@/lib/design-tokens";

export function ProjectGrid({ projects }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className={HOVER_EFFECTS.card}>
          <CardHeader>
            <CardTitle>{project.title}</CardTitle>
          </CardHeader>
          <CardContent>{project.description}</CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Building a Form

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SPACING } from "@/lib/design-tokens";

export function ContactForm() {
  return (
    <form className={SPACING.content}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" />
      </div>
      <Button type="submit">Send</Button>
    </form>
  );
}
```

**More Examples**: See templates in `/src/components/_templates/` for hero sections, CTAs, content sections, and more.

### MDX Components for Blog Posts

**Available components for blog content** (interactive and engaging):

| Component                | Usage                                                                  | Purpose                                          |
| ------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------ |
| `<KeyTakeaway>`          | `<KeyTakeaway>Your insight</KeyTakeaway>`                              | Highlight key insights and conclusions           |
| `<ContextClue>`          | `<ContextClue>Background info</ContextClue>`                           | Provide background context                       |
| `<Alert type="warning">` | `<Alert type="warning">Warning</Alert>`                                | Warnings and status messages                     |
| `<SectionShare>`         | `<SectionShare sectionId="id" sectionTitle="Title" />`                 | Social sharing buttons (Twitter, LinkedIn, Copy) |
| `<CollapsibleSection>`   | `<CollapsibleSection id="id" title="Title">...</CollapsibleSection>`   | Expandable content with LocalStorage             |
| `<GlossaryTooltip>`      | `<GlossaryTooltip term="Term" definition="Def">text</GlossaryTooltip>` | Interactive tooltips for technical terms         |

**Engagement Best Practices:**

- Add `<SectionShare>` after major sections for social sharing and SEO (increases backlinks)
- Use `<CollapsibleSection>` for role-specific or advanced content (progressive disclosure)
- Wrap technical terms in `<GlossaryTooltip>` for better accessibility and comprehension
- SectionShare creates trackable section-specific URLs with hash anchors for SEO
- CollapsibleSection reduces initial page complexity while maintaining depth

## Design System Rules (MANDATORY)

**Before creating/modifying UI components:**

1. **Search for existing patterns** (use Grep/Glob)
2. **Check design tokens** in `src/lib/design-tokens.ts`
3. **Reuse components** from `layouts/` and `ui/`

**Always use:**

- ✅ `TYPOGRAPHY.h1.standard` for headings
- ✅ `SPACING.content` for spacing
- ✅ Semantic colors: `bg-card`, `text-primary`
- ✅ `PageLayout`, `PageHero` for layouts

**Never use:**

- ❌ Hardcoded spacing: `space-y-6`, `gap-8`, `p-7`
- ❌ Inline typography: `text-3xl font-semibold`
- ❌ Hardcoded colors: `bg-white dark:bg-gray-900`
- ❌ Duplicate existing components

**Automated Enforcement:**

- ✅ ESLint catches spacing/typography violations (warnings in real-time)
- ✅ Pre-commit hooks prevent violations from being committed
- ✅ GitHub Actions validate PRs and post violation reports
- ✅ Validation script: `node scripts/validate-design-tokens.mjs`
- ✅ VS Code snippets: Type `dt` + Tab for design token shortcuts

**See [`docs/ai/design-system.md`](docs/ai/design-system.md) for comprehensive validation checklist**

## Test Data Prevention (MANDATORY)

**NEVER commit test/fabricated data to production.** All test data must:

1. **Be behind environment checks** - Both NODE_ENV and VERCEL_ENV
2. **Have cleanup scripts** - Remove test data if leaked (npm run clear:analytics)
3. **Log warnings in production** - Alert if fallback/demo data used
4. **Be documented** - Compare sample values to actual metrics

### Key Pattern

```typescript
// ✅ CORRECT: Environment-aware with explicit warning
const isProduction =
  process.env.NODE_ENV === "production" ||
  process.env.VERCEL_ENV === "production";

if (isProduction && !hasRealData) {
  console.error("❌ CRITICAL: Using demo data in production!");
  return null; // Don't use fake data - return empty or error
}

// Safe to use test data in development only
return mockData;
```

**Reference:** [TEST_DATA_PREVENTION.md](.github/agents/enforcement/TEST_DATA_PREVENTION.md)

**History:** [December 25, 2025] Removed 13 fabricated analytics items from production Redis.

### 6. Never Use Emojis in Public Content

```typescript
// ❌ WRONG: Emoji in blog post
Emojis work great: 🚀 ✅ ❌ ⚠️ 💡

// ✅ CORRECT: Use React icons
import { Rocket, CheckCircle, XCircle, AlertTriangle, Lightbulb } from 'lucide-react';

<div className="flex gap-2">
  <Rocket className="w-4 h-4" />
  <CheckCircle className="w-4 h-4" />
  <XCircle className="w-4 h-4" />
  <AlertTriangle className="w-4 h-4" />
  <Lightbulb className="w-4 h-4" />
</div>
```

**Prohibited locations:**

- Blog posts (`src/content/blog/*.mdx`)
- Projects (`src/content/projects/*.mdx`)
- Public UI components
- User-facing text

**Acceptable locations:**

- Internal docs (`docs/`, `.github/`)
- Code comments (`//`, `/* */`)
- Console.log statements
- Test files

## Key Constraints

**Do NOT change without discussion:**

- UI framework (Tailwind + shadcn/ui)
- Import alias (`@/*`)
- SEO routes (`sitemap.ts`, `robots.ts` location)
- MDX pipeline
- Design tokens
- Test coverage (maintain ≥94%)

## Workflow Guidelines

**Starting a session:**

1. Check [`docs/operations/todo.md`](docs/operations/todo.md) for priorities
2. Review recent commits: `git log --oneline -5`
3. Run tests: `npm run test`

**During implementation:**

1. Use TodoWrite for multi-step tasks
2. Follow existing patterns (layouts, metadata, design tokens)
3. Maintain test coverage
4. Be token-conscious (see optimization guide)

**Completing work:**

1. ✅ TypeScript compiles (`npm run typecheck`)
2. ✅ All tests pass (`npm run test`)
3. ✅ Lint passes (`npm run lint`)
4. ✅ Design tokens used (no hardcoded values)
5. ✅ Security scanning passes (CodeQL/manual review)
6. Update `CHANGELOG.md` with CalVer date (format: `YYYY.MM.DD`)
7. Update `todo.md` and `done.md`

## Project Maintenance

**Health Monitoring:**

- **Monthly**: Run health check (15 min) - See [`docs/operations/MAINTENANCE_PLAYBOOK.md`](docs/operations/MAINTENANCE_PLAYBOOK.md)
- **Quarterly**: Deep cleanup (2-3 hours) - Dependencies, unused code, documentation
- **Annually**: Full audit (1 day) - Architecture, performance, security review

**Quick Health Check:**

```bash
npm outdated              # Check dependency updates
npm audit                 # Security vulnerabilities
npm run test:run          # Test suite health
npm run build             # Build verification
npx depcheck              # Find unused dependencies
```

**Key Maintenance Documents:**

- [`docs/operations/PROJECT_HEALTH_AUDIT.md`](docs/operations/PROJECT_HEALTH_AUDIT.md) - Latest comprehensive audit
- [`docs/operations/MAINTENANCE_PLAYBOOK.md`](docs/operations/MAINTENANCE_PLAYBOOK.md) - Repeatable processes
- [`docs/operations/VERSIONING.md`](docs/operations/VERSIONING.md) - Calendar versioning scheme
- [`docs/operations/todo.md`](docs/operations/todo.md) - Current priorities
- [`docs/operations/done.md`](docs/operations/done.md) - Completed work

**Red Flags (Take Action Immediately):**

- Test pass rate <95%
- Critical security vulnerabilities
- Build failures
- Bundle size increase >10%

**Security Vulnerability Handling (CRITICAL):**

When discovering a CodeQL alert or security issue:

1. Analyze using [SECURITY_VULNERABILITY_TROUBLESHOOTING.md](/.github/agents/patterns/SECURITY_VULNERABILITY_TROUBLESHOOTING.md)
2. Implement fix with defense-in-depth approach
3. Add comprehensive security tests (attack vectors + valid patterns)
4. Document in `/docs/private/SECURITY_FIX_*.md` (private storage)
5. Merge **immediately** (security > approval gates)

See: [APPROVAL_GATES.md#security-vulnerability-fixes](/.github/agents/enforcement/APPROVAL_GATES.md)

## Claude Code Agents (AI-Powered Quality Assurance)

**8 specialized agents available** to enforce quality, security, and consistency standards:

### Tier 1: Core Quality (Auto-Triggered)

- **`/design-check`** - Design token compliance & hardcoded value detection
  - Validates SPACING, TYPOGRAPHY, SEMANTIC_COLORS usage
  - Detects hardcoded spacing/colors/typography
  - Auto-triggers: Component changes

- **`/create-blog`** - Blog post creation with proper structure & metadata
  - Generates frontmatter (id, title, summary, tags, series)
  - Ensures SEO-optimized metadata
  - Auto-triggers: Content creation

- **`/security-audit`** - OWASP compliance & vulnerability detection
  - Checks all OWASP Top 10 violations
  - Validates logging security (no secrets, PII, IP addresses)
  - Auto-triggers: API routes, auth logic, external calls

### Tier 2: Performance & Maintenance

- **`/seo-optimize`** - Metadata optimization & Core Web Vitals (90%+ Lighthouse CI)
  - Validates metadata completeness & character counts
  - Checks heading hierarchy & structured data
  - Monitors Core Web Vitals (LCP <2.5s, INP <200ms, CLS <0.1)

- **`/deps-audit`** - Dependency security & update safety
  - Runs `npm audit` with vulnerability categorization
  - Analyzes breaking changes in major version upgrades
  - Checks Node.js compatibility

### Tier 3: Polish & Advanced

- **`/edit-content`** - Prose quality & consistency
  - Improves clarity, readability, tone
  - Ensures consistent terminology
  - Validates Flesch Reading Ease score (target: 60-70)

- **`/perf-optimize`** - Bundle analysis & rendering optimization
  - Profiles Lighthouse scores
  - Detects rendering bottlenecks
  - Recommends code splitting & React patterns

- **`/arch-review`** - Architectural pattern enforcement
  - Validates Next.js App Router & server-first patterns
  - Ensures @/\* import aliases (no relative paths)
  - Detects code duplication & suggests refactoring

**Quick start:** Type `/agent-help` to see all agents and usage guide

**Workflow integration:**

```bash
Creating content:
1. /create-blog     → Generate structure
2. /edit-content    → Polish prose
3. /seo-optimize    → Optimize metadata

Building features:
1. /design-check    → Validate design tokens
2. /security-audit  → Check OWASP compliance
3. /arch-review     → Ensure patterns

Maintaining:
1. /deps-audit      → Security & updates
2. /perf-optimize   → Performance analysis
3. /seo-optimize    → Verify Lighthouse scores
```

**For Detailed Patterns & Enforcement:**

- **Public/Shared:** See [`.github/agents/DCYFR.agent.md`](./.github/agents/DCYFR.agent.md) for modular enforcement documentation
- **Internal Only:** For Claude Code users with access to proprietary `.claude/agents/` files, see your internal documentation (not available in public repo)

## Security Best Practices

### Logging Security (CRITICAL)

Never log sensitive information in clear text. Use one of two approaches:

1. **Remove logging** (preferred for tests/config scripts)

```javascript
// ❌ WRONG: console.log(credentials.client_email);
// ✅ CORRECT: console.log("✅ Service account JSON is valid");
```

1. **Mask sensitive data** (when verification logging needed)

```javascript
const maskEmail = (email) =>
  `${email.split("@")[0].substring(0, 2)}***@${email.split("@")[1]}`;
console.log(`Service Account: ${maskEmail(credentials.client_email)}`);
```

**Never log:** API keys, tokens, credentials, environment variables containing secrets, user personal data, private keys, passwords, payment info

**See detailed guide:** [`docs/ai/logging-security.md`](docs/ai/logging-security.md)

## Documentation

**Comprehensive guides** (load only when needed):

- [`docs/ai/best-practices.md`](docs/ai/best-practices.md) - Workflow best practices
- [`docs/ai/design-system.md`](docs/ai/design-system.md) - Complete design validation
- [`docs/ai/logging-security.md`](docs/ai/logging-security.md) - Logging security best practices
- [`docs/ai/OPTIMIZATION_STRATEGY.md`](docs/ai/OPTIMIZATION_STRATEGY.md) - Token optimization
- [`docs/ai/claude-code-setup.md`](docs/ai/claude-code-setup.md) - Claude Code integration setup

**Domain-specific docs:**

- `/docs/architecture/` - Patterns, migration guides
- `/docs/design/` - Design system enforcement
- `/docs/security/` - Security scanning (Nuclei, CodeQL)
- `/docs/testing/` - Test infrastructure
- `/docs/features/` - Feature guides
- `/docs/operations/` - Todo system, done.md

## Token Optimization

**Be conscious of context window usage:**

- Use **Grep** instead of Read for searching
- Read files **only when editing** them
- Load detailed docs **only when needed**
- Use agents **judiciously** (prefer direct tools)

**Typical budgets:**

- Quick fix: <20k tokens
- Feature: <50k tokens
- Refactoring: <100k tokens

See [`docs/ai/OPTIMIZATION_STRATEGY.md`](docs/ai/OPTIMIZATION_STRATEGY.md) for details.

## CI/CD

**All PRs must pass:**

- ESLint (0 errors)
- TypeScript compilation
- Tests (≥99% pass rate, 1339/1346 passing)
- Lighthouse CI (≥90% perf, ≥95% a11y)

**GitHub Actions:**

- CodeQL security scanning (daily)
- Nuclei external vulnerability scanning (on deploy + daily)
- Dependabot auto-merge
- Test suite on PR
- Lighthouse CI on deploy

## AI Development Tool Hierarchy

**Primary: Claude Code** (200K context) → Complex refactoring, architectural work
**Secondary: GitHub Copilot** (~8K context) → Inline suggestions, quick edits
**Fallback: OpenCode.ai** (75+ providers) → Token exhaustion, cost optimization, offline work

**NEW:** See [AI Agent Architecture Improvements](docs/operations/AI_AGENT_ARCHITECTURE_IMPROVEMENTS_2026-01-06.md) for complete system documentation.

### Agent Operational Systems (NEW - January 2026)

**Three systems ensure continuous, data-driven development:**

1. **Session Recovery System** - Auto-checkpoint every 30 minutes
   - `npm run checkpoint:start <agent>` - Start background checkpointing
   - `npm run session:recover <agent> latest` - Recover from interruption
   - Prevents data loss from crashes, rate limits, network failures
   - See: [SESSION_RECOVERY_SYSTEM.md](docs/operations/SESSION_RECOVERY_SYSTEM.md)

2. **Provider Fallback Manager** - Automatic failover on rate limits
   - `npm run fallback:status` - Check provider health
   - `npm run fallback:health` - Monitor all providers
   - Seamless switch: Claude → Groq → Ollama
   - See: [PROVIDER_FALLBACK_SYSTEM.md](docs/operations/PROVIDER_FALLBACK_SYSTEM.md)

3. **Agent Telemetry System** - Track usage, quality, costs
   - `npm run telemetry:stats <agent> 7d` - Agent-specific metrics
   - `npm run telemetry:compare` - Compare all agents
   - `npm run telemetry:handoffs` - Handoff analytics
   - See: [agent-telemetry.ts](src/lib/agents/agent-telemetry.ts)

**Quick Start Workflow:**

```bash
# 1. Start development with auto-recovery
npm run dev &
npm run checkpoint:start claude &

# 2. Work normally - failover is automatic
# ... develop features ...

# 3. If interrupted, recover instantly
npm run session:recover claude latest

# 4. View analytics
npm run telemetry:compare
```

### When to Use OpenCode.ai

**Trigger Conditions:**

- ❌ Claude Code rate limit exceeded
- ❌ Token budget exhausted for the day
- ✅ Extended development sessions (6+ hours)
- ✅ Cost optimization needed (10-100x cheaper with Groq)
- ✅ Offline development (local models via Ollama)
- ✅ Alternative AI perspectives (GPT-4, Gemini, etc.)

**Quick Start:**

```bash
npm run ai:setup          # One-time setup
npm run ai:opencode       # Start session (primary provider)
npm run ai:opencode:groq  # Cost-effective provider
npm run ai:opencode:local # Offline (local models)
```

**VS Code Extension:**

Install [sst-dev.opencode](https://marketplace.visualstudio.com/items?itemName=sst-dev.opencode) for seamless IDE integration:

- **Quick Launch:** `Cmd+Esc` (Mac) or `Ctrl+Esc` (Windows/Linux)
- **New Session:** `Cmd+Shift+Esc` (Mac) or `Ctrl+Shift+Esc` (Windows/Linux)
- **File References:** `Cmd+Option+K` (Mac) or `Alt+Ctrl+K` (Windows/Linux)
- **Context Sharing:** Automatically shares current selection/tab
- **Editor Button:** Quick access from title bar

**See:** [`docs/ai/opencode-fallback-architecture.md`](docs/ai/opencode-fallback-architecture.md) for complete setup guide

## MCP Servers (Chat)

Perplexity, Context, Axiom, Filesystem, GitHub, Vercel, Sentry, arXiv

_Note: Memory and Sequential Thinking MCPs removed Dec 2025 - replaced by native Claude/Copilot capabilities and built-in memory tools._

---

**For quick tasks**: Use this guide + design tokens
**For complex tasks**: Load relevant detailed guides from `/docs/ai/`
**For Phase 4 work**: See [`docs/operations/phase-4-guide.md`](docs/operations/phase-4-guide.md)

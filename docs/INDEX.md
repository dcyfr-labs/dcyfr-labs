<!-- TLP:CLEAR -->

{/_ TLP:CLEAR _/}

# Documentation Index

**Last Updated:** January 21, 2026
**Status:** Production-ready documentation ✅
**Classification:** TLP Implementation - Most content TLP:CLEAR (public)

🔒 **Note:** This documentation is public. Sensitive content (security findings, operational metrics, compliance audits) is in subdirectory `private/` folders (e.g., `/docs/security/private/`, `/docs/operations/private/`). See DOCS_GOVERNANCE.md for policies.

---

## 📊 Current Structure

The documentation is organized into **18 focused directories**:

### 📁 Core Documentation (10 directories)

1. **`architecture/`** - Architecture patterns, refactoring guides, and migration docs
2. **`blog/`** - Blog system documentation, content strategy, RSS feeds (includes `feeds/` subdirectory)
3. **`components/`** - Component documentation (26 files)
4. **`api/`** - API integration references and route documentation (includes `routes/` subdirectory)
5. **`features/`** - Feature guides (Inngest, GitHub, MCP, Activity Feed, Series)
6. **`design/`** - Design system and UX (organized by topic: `typography/`, `mobile/`, `print/`, `spacing/`, `ui-patterns/`)
7. **`security/`** - Security implementation (`csp/`, `rate-limiting/` subdirectories)
8. **`platform/`** - Platform configuration (env vars, site config)
9. **`operations/`** - Project management (todo, done, deployment, `sessions/` subdirectory)
10. **`automation/`** - Automated updates, dependency management, CI/CD

### 🔧 Development & Optimization (4 directories)

1. **`development/`** - Performance optimization and development guides
2. **`testing/`** - Test infrastructure and coverage roadmap
3. **`optimization/`** - SEO + accessibility + analytics (merged from earlier `/seo`, `/analytics`)
4. **`content/`** - Content validation and markdown standards

### 📦 Reference (2 directories)

1. **`ai/`** - AI contributor guides and discovery research (`discovery/` subdirectory)
2. **`maintenance/`** - Dashboard modularization and maintenance patterns

---

## 🚀 Quick Navigation

### Getting Started

- **[README.md](./readme)** - Directory overview and quick links
- **[QUICK_START.md](./quick-start)** - Single-page navigation hub

### Architecture & Code

- **[architecture/README.md](./architecture/readme)** - Architecture overview
- **architecture/migration-guide.md** - Step-by-step migration
- **architecture/private-package-integration.md** - 🔐 **Secure proprietary package integration**
- **architecture/private-package-setup-guide.md** - 🔐 **Quick setup for @dcyfr/agents**
- **[components/](./components/)** - Component documentation

### Blog System

- **[blog/architecture.md](./blog/architecture)** - Complete blog architecture
- **[blog/blog-quick-ref.md](./blog/quick-reference)** - Common patterns
- **[blog/feeds/](./blog/feeds/)** - RSS/Atom feed documentation

### Features

- **[features/inngest-integration.md](./features/inngest-integration)** - Background jobs
- **[features/github-integration.md](./features/github-integration)** - GitHub API
- **[features/mcp/](./features/mcp/)** - Model Context Protocol
- **[features/inngest-integration.md](./features/inngest-integration)** - Background jobs
- **[features/github-integration.md](./features/github-integration)** - GitHub API
- **[features/mcp/](./features/mcp/)** - Model Context Protocol
- **[features/rss-mdx-transformation.md](./features/rss-mdx-transformation)** - ✨ **RSS feed custom component transformation**
- **[features/ACTIVITY_FEED_AUTOMATION.md](./features/activity-feed-automation)** - Activity feed automation strategy
- **[features/ACTIVITY_AUTOMATION_QUICK_START.md](./features/activity-automation-quick-start)** - 30-min activity caching implementation
- **[features/ACTIVITY_CACHING_IMPLEMENTATION.md](./features/activity-caching-implementation)** - Implementation summary & testing guide
- **features/SERIES_REFACTOR_PROGRESS.md** - Blog series refactor progress tracker
- **features/FUTURE_IDEAS.md** - Post-launch feature ideas & evaluation

### Design System

- **[design/typography/](./design/typography/)** - Typography system
- **[design/mobile/](./design/mobile/)** - Mobile-first design
- **[design/spacing/](./design/spacing/)** - Spacing standards
- **[design/PAGE_TEMPLATES.md](./design/page-templates)** - ✨ **Complete page templates with design tokens**
- **design/DESIGN_TOKEN_COMPLIANCE_REPORT.md** - ✨ **Series refactor compliance audit**

### Automation

- **automation/AUTOMATED_UPDATES.md** - ✨ **Complete automation system guide**
- **automation/ENABLE_AUTO_MERGE.md** - ✨ **Auto-merge setup instructions**
- **automation/IMPLEMENTATION_SUMMARY.md** - ✨ **Deployment guide**

---

## 🔒 Documentation Governance

### Public vs. Private Documentation

**This directory (`/docs`)** contains public documentation for contributors and users.

**Private documentation** (subdirectory `private/` folders) contains sensitive content:

- Security vulnerability details and audit findings → `docs/security/private/`
- Operational metrics and performance benchmarks → `docs/operations/private/`
- Internal team decisions and sprint backlogs → `docs/operations/private/`
- Design analysis and metrics → `docs/design/private/`
- Infrastructure credentials and procedures → `docs/development/private/`

**DOCS_GOVERNANCE.md** - Complete policy document

- What belongs in public vs. private docs
- Classification matrix for different document types
- Enforcement mechanisms and guardrails
- Contributor guidelines for documentation

**DOCUMENTATION_CONSOLIDATION_GUIDE.md** - How to find everything

- Complete index of all documentation locations
- Migration status of recent reorganization
- Guardrails in place (pre-commit hooks, .gitignore)
- Setup instructions for your machine

---

### Development

- **[testing/README.md](./testing/readme)** - Testing overview
- **[testing/coverage-roadmap.md](./testing/coverage-roadmap)** - 3-phase coverage plan
- **[testing/quick-reference.md](./testing/quick-reference)** - Testing commands & patterns
- **development/** - Performance optimization guides
- **[optimization/](./optimization/)** - SEO + accessibility + analytics
- **[optimization/search-channel-priority-automation.md](./optimization/search-channel-priority-automation.md)** -
  SEO channel priority and automation policy
- **[optimization/youtube-seo-automation-guide.md](./optimization/youtube-seo-automation-guide.md)** -
  YouTube metadata-pack contract, quality checks, cross-linking, VideoObject JSON-LD
- **[optimization/reddit-policy-safe-workflow.md](./optimization/reddit-policy-safe-workflow.md)** -
  Reddit policy-safe lane with mandatory human approval and rate limits
- **[optimization/channel-automation-monitoring.md](./optimization/channel-automation-monitoring.md)** -
  Channel audit log schema, per-channel metrics, violation tracking, monthly review
- **[features/SEO_CHANNEL_PRIORITY.md](./features/SEO_CHANNEL_PRIORITY.md)** -
  SEO channel priority matrix (Google, Bing, YouTube, Reddit status overview)
- **[runbooks/](./runbooks/)** - Operational troubleshooting playbooks
- **[runbooks/INDEXNOW_TROUBLESHOOTING.md](./runbooks/INDEXNOW_TROUBLESHOOTING.md)** -
  IndexNow API troubleshooting and bulk resubmission procedures

### Configuration

- **[platform/environment-variables.md](./platform/environment-variables)** - Complete env setup
- **[security/](./security/)** - CSP, rate limiting, security guides
- **[api/routes/overview.md](./api/routes/overview)** - API architecture

### Operations

- **operations/todo.md** - Active tasks
- **operations/done.md** - Completed work
- **operations/KNOWN_ISSUES.md** - ✨ **Known issues & acceptable warnings**
- **[.github/docs/PREVIEW_BRANCH_WORKFLOW.md](../.github/docs/PREVIEW_BRANCH_WORKFLOW)** - Preview branch management and protection

---

## 🎯 Directory Purposes

### `architecture/`

Architecture patterns, refactoring guides, migration docs, best practices, and private package integration (GitHub Packages, secure NPM registry configuration)

### `blog/`

Blog system architecture, content creation, MDX processing, frontmatter schema, RSS feeds, content strategy

### `components/`

Component docs covering UI components, error boundaries, loading states, and advanced features

### `api/`

API integration references, route documentation, rate limiting, error handling

### `features/`

Feature guides for Inngest, GitHub integration, MCP servers, analytics, OG images, activity feed automation, blog series refactor, and future ideas tracking

### `design/`

Design system organized by topic:

- `typography/` - Font system and rendering
- `mobile/` - Mobile-first optimization
- `print/` - Print stylesheet
- `spacing/` - Spacing standards
- `ui-patterns/` - Component patterns
- Complete page templates with design token enforcement
- Design token compliance audits

### `automation/`

Automated update system:

- Dependabot auto-merge configuration
- Quarterly AI instruction sync
- Continuous test metrics collection
- Daily security scanning
- Setup and deployment guides

### `security/`

Security implementation guides for CSP, rate limiting, and security best practices

### `platform/`

Platform configuration: environment variables, site config, view counts, deployment

### `operations/`

Project management: todo lists, completed work, deployment guides, automation, and session archives.

**Subdirectories:**

- `sessions/` - Archived session summaries and audit reports
  - `2026-01/` - January 2026 session summaries (RIVET phases, audits, bundle optimization)

### `development/`

Performance: Lighthouse CI, bundle analysis, INP optimization, ISR

### `performance/`

Performance optimization documentation including bundle optimization strategies, image optimization guides, and audit results.

**Key Documents:**

- `bundle-optimization-strategy.md` - Bundle size reduction techniques
- `image-optimization-guide.md` - Image format and sizing best practices
- `week-1-image-audit-results.md` - Comprehensive image audit findings

### `governance/`

Project governance documentation including legal pages implementation, documentation policies, and agent security governance.

**Key Documents:**

- `DOCS_GOVERNANCE.md` - Documentation classification and policies
- `LEGAL_PAGES_ANALYSIS_AND_RECOMMENDATIONS.md` - Legal pages requirements
- `LEGAL_PAGES_IMPLEMENTATION_PLAN.md` - Implementation strategy
- `LEGAL_PAGES_IMPLEMENTATION_SUMMARY.md` - Completion summary
- `LEGAL_PAGES_VALIDATION_SUMMARY.md` - Validation results
- `AGENT-SECURITY-GOVERNANCE.md` - AI agent security policies
- `data-governance-policy.md` - Data handling and privacy policies

### `testing/`

Test infrastructure setup (Vitest, Playwright, Testing Library), coverage roadmap, mocking strategies

### `optimization/`

SEO, accessibility, and analytics: meta tags, alt text, JSON-LD, tag analytics

**Key Documents:**

- `search-channel-priority-automation.md` - Priority strategy for
  Google/Bing/YouTube/Reddit with Reddit anti-automation guardrails

### `content/`

Content validation, markdown standards, Mermaid best practices, and horizontal rule semantic usage

**Key Documents:**

- `rivet-component-library.md` - Week-by-week component implementation tracking
- `horizontal-rule-best-practices.md` - ✨ **Semantic `<hr>` usage guidelines for blog posts**
- `horizontal-rules-in-rss-feeds.md` - ✨ **RSS/Atom feed best practices for `<hr>` tags**
- `horizontal-rule-audit-2026-01-19.md` - ✨ **Complete blog post analysis & compliance audit**
- `horizontal-rule-analysis-summary.md` - ✨ **Executive summary and findings**

### `ai/`

AI contributor guides, instruction alignment analysis, AITMPL integration documentation, and discovery research. Includes comprehensive testing strategy, component lifecycle patterns, error handling, state management, and animation decision matrices.

**Key Documents:**

- `INSTRUCTION_ALIGNMENT_INDEX.md` - Guide to instruction alignment analysis
- `aitmpl-enhancement-plan.md` - AITMPL template integration strategy
- `aitmpl-integration-summary.md` - Integration completion summary
- `testing-strategy.md` - Comprehensive testing approach
- `component-lifecycle.md` - React component patterns
- `error-handling-patterns.md` - Error handling best practices
- `state-management-matrix.md` - State management decision guide
- `animation-decision-matrix.md` - Animation implementation patterns
- `claude-code-validation-report.md` - Validation results

### `maintenance/`

Dashboard modularization patterns and maintenance documentation

---

## 📝 Maintenance Guidelines

- Keep documentation in appropriate topical folders
- Use subdirectories when a category grows beyond 10-12 files
- Update this INDEX and README when structure changes
- Cross-reference related docs with relative links

---

_Last updated: December 9, 2025_

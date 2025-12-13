<!-- TLP:CLEAR -->
# Documentation

This directory is the knowledge base for the portfolio. Content is organized by topic-focused subfolders for faster navigation.

> **🔒 Information Classification:** This documentation follows the [Traffic Light Protocol (TLP)](./security/TLP_CLASSIFICATION_IMPLEMENTATION.md) for information sharing. Most content is TLP:CLEAR (public), with sensitive implementation details marked as TLP:GREEN (limited distribution).

## 🚀 Quick Navigation

- **[`INDEX.md`](./index)** – Complete directory structure (start here!)
- **[`QUICK_START.md`](./quick-start)** – Navigation hub for quick references

## Directory Overview

**Core Documentation (10 directories):**

- **`architecture/`** – Architecture patterns and refactoring guides
  - [`README.md`](./architecture/readme) - Architecture overview
  - [`refactoring-complete.md`](./architecture/refactoring-complete) - Complete refactoring summary
  - [`migration-guide.md`](./architecture/migration-guide) - Step-by-step migration guide
  - [`examples.md`](./architecture/examples) - Practical code examples
  - [`best-practices.md`](./architecture/best-practices) - Architectural guidelines
  
- **`blog/`** – Blog system documentation + content strategy + RSS feeds:
  - [`architecture.md`](./blog/architecture) - Complete blog system architecture and data flow
  - [`quick-reference.md`](./blog/quick-reference) - Quick patterns and common tasks
  - [`content-creation.md`](./blog/content-creation) - Post authoring guide
  - [`blog-images-consolidated.md`](./blog/blog-images-consolidated) - **Complete images guide** (SVG generation + Unsplash + defaults + OG)
  - [`mdx-processing.md`](./blog/mdx-processing) - MDX pipeline and plugins
  - [`frontmatter-schema.md`](./blog/frontmatter-schema) - Post metadata reference
  - `feeds/` - RSS/Atom feed documentation

- **`components/`** – Component documentation (26 files):
  - **Quick References:** [`post-badges.md`](./components/post-badges) · [`error-boundaries.md`](./components/error-boundaries) · [`loading-states.md`](./components/loading-states)
  - **Advanced Components:** [`related-posts.md`](./components/related-posts) · [`table-of-contents.md`](./components/table-of-contents) · [`syntax-highlighting.md`](./components/syntax-highlighting)
  - **Core Components:** [`mdx.md`](./components/mdx) · [`post-list.md`](./components/post-list) · [`blog-search-form.md`](./components/blog-search-form)

- **`api/`** – API integration references:
  - [`routes/overview.md`](./api/routes/overview) - API architecture, rate limiting, error handling
  - [`routes/contact.md`](./api/routes/contact) - Contact form endpoint
  - [`routes/github-contributions.md`](./api/routes/github-contributions) - GitHub API integration
  - [`reference.md`](./api/reference) - Quick API reference

- **`features/`** – Feature guides:
  - [`inngest-integration.md`](./features/inngest-integration) - Complete Inngest background jobs guide
  - [`inngest-testing.md`](./features/inngest-testing) - Testing and debugging guide
  - [`github-integration.md`](./features/github-integration) - GitHub API integration
  - [`ACTIVITY_FEED_AUTOMATION.md`](./features/activity-feed-automation) - ✨ Activity feed automation strategy
  - [`ACTIVITY_CACHING_IMPLEMENTATION.md`](./features/activity-caching-implementation) - ✨ Activity caching implementation
  - [`SERIES_REFACTOR_PROGRESS.md`](./features/series-refactor-progress) - ✨ Blog series refactor tracker
  - [`FUTURE_IDEAS.md`](./features/future-ideas) - ✨ Post-launch feature ideas
  - `mcp/` - Model Context Protocol documentation

- **`accessibility/`** – Accessibility patterns and implementation:
  - [`dcyfr-pronunciation-consolidated.md`](./accessibility/dcyfr-pronunciation-consolidated) - **Complete DCYFR pronunciation guide** (quick ref + implementation + checklist)
  - [`acronym-pronunciation.md`](./accessibility/acronym-pronunciation) - General acronym strategies

- **`design/`** – Design system and UX (organized into subdirectories):
  - `typography/` - Typography system (Geist Sans, Source Serif 4, Geist Mono)
  - `mobile/` - Mobile-first optimization and analysis
  - `print/` - Print stylesheet implementation
  - `spacing/` - Spacing standards and audit
  - `ui-patterns/` - Component patterns and UI consistency
  - [`design-system.md`](./design/design-system) - Overall design system
  - [`eslint-design-system-consolidated.md`](./design/eslint-design-system-consolidated) - **ESLint warnings guide** (quick ref + resolution + checklist)
  - [`PAGE_TEMPLATES.md`](./design/page-templates) - ✨ Complete page templates
  - [`DESIGN_TOKEN_COMPLIANCE_REPORT.md`](./design/design-token-compliance-report) - ✨ Compliance audit

- **`security/`** – Security implementation:
  - `csp/` - Content Security Policy with nonce implementation
  - `rate-limiting/` - Rate limiting guides and flows
  - [`security-findings-resolution.md`](./security/security-findings-resolution)

- **`platform/`** – Platform configuration:
  - [`environment-variables.md`](./platform/environment-variables) - Complete environment setup
  - [`site-config.md`](./platform/site-config) - Domain and URL configuration
  - [`view-counts.md`](./platform/view-counts) - Blog analytics and Redis setup

- **`operations/`** – Project management:
  - [`todo.md`](./operations/todo) - Active tasks and priorities
  - [`done.md`](./operations/done) - Completed projects archive
  - [`automation-backlog.md`](./operations/automation-backlog) - CI/CD automation status

- **`automation/`** – ✨ Automated updates and dependency management:
  - [`automation-system-consolidated.md`](./automation/automation-system-consolidated) - **Complete automation guide** (setup + overview + implementation)

**Development & Optimization (4 directories):**

- **`development/`** – Performance optimization:
  - [`lighthouse-ci.md`](./development/lighthouse-ci) - Lighthouse CI setup
  - [`inp-optimization.md`](./development/inp-optimization) - INP optimization
  - [`isr-implementation.md`](./development/isr-implementation) - ISR setup
  - [`bundle-analysis.md`](./development/bundle-analysis) - Bundle optimization

- **`testing/`** – Test infrastructure and coverage:
  - [`README.md`](./testing/readme) - Testing overview and setup
  - [`coverage-roadmap.md`](./testing/coverage-roadmap) - 3-phase coverage plan
  - [`quick-reference.md`](./testing/quick-reference) - Testing commands & patterns

- **`optimization/`** – SEO + accessibility + analytics:
  - [`json-ld-implementation.md`](./optimization/json-ld-implementation) - Structured data
  - [`alt-text-guide.md`](./optimization/alt-text-guide) - Accessibility
  - [`tag-analytics.md`](./optimization/tag-analytics) - Tag analytics

- **`content/`** – Content validation and standards:
  - [`CONTENT_VALIDATION.md`](./content/content-validation) - Validation workflows
  - [`MARKDOWN_STANDARDS.md`](./content/markdown-standards) - Markdown conventions
  - [`MERMAID_BEST_PRACTICES.md`](./content/mermaid-best-practices) - Diagram guidelines

**Reference (2 directories):**

- **`ai/`** – AI contributor guides:
  - [`BEST_PRACTICES.md`](./ai/best-practices) - AI development practices
  - [`DESIGN_SYSTEM.md`](./ai/design-system) - Design system for AI
  - [`OPTIMIZATION_STRATEGY.md`](./ai/optimization-strategy) - Token optimization
  - `discovery/` - AI discovery documentation

- **`maintenance/`** – Maintenance patterns:
  - [`MODULARIZATION.md`](./maintenance/modularization) - Dashboard modularization

## Quick Links

| Topic | Primary References |
|-------|--------------------|
| **Getting Started** | **[`QUICK_START.md`](./quick-start) - Navigation hub** |
| **Architecture** | **[`architecture/README.md`](./architecture/readme) · [`architecture/migration-guide.md`](./architecture/migration-guide)** |
| AI Discovery | [`ai/discovery/overview.md`](./ai/discovery/overview) |
| APIs | [`api/reference.md`](./api/reference) · [`api/routes/overview.md`](./api/routes/overview) |
| Blog System | [`blog/architecture.md`](./blog/architecture) · [`blog/quick-reference.md`](./blog/quick-reference) |
| Blog Feeds | [`blog/feeds/improvements.md`](./blog/feeds/improvements) |
| Components | [`components/post-badges.md`](./components/post-badges) · [`components/mdx.md`](./components/mdx) |
| Design System | [`design/design-system.md`](./design/design-system) |
| Typography | [`design/typography/typography.md`](./design/typography/typography) |
| **Mobile-First UX** | **[`design/mobile/mobile-first-optimization-analysis.md`](./design/mobile/mobile-first-optimization-analysis)** |
| Print Styles | [`design/print/print-stylesheet.md`](./design/print/print-stylesheet) |
| Spacing System | [`design/spacing/spacing-system.md`](./design/spacing/spacing-system) |
| **Background Jobs** | **[`features/inngest-integration.md`](./features/inngest-integration)** |
| GitHub Integration | [`features/github-integration.md`](./features/github-integration) |
| MCP Servers | [`features/mcp/servers.md`](./features/mcp/servers) |
| **Operations** | **[`operations/todo.md`](./operations/todo) · [`operations/done.md`](./operations/done)** |
| Testing | [`testing/README.md`](./testing/readme) · [`testing/coverage-roadmap.md`](./testing/coverage-roadmap) |
| Performance | [`development/lighthouse-ci.md`](./development/lighthouse-ci) · [`development/inp-optimization.md`](./development/inp-optimization) |
| SEO & Accessibility | [`optimization/json-ld-implementation.md`](./optimization/json-ld-implementation) · [`optimization/alt-text-guide.md`](./optimization/alt-text-guide) |
| Security – CSP | [`security/csp/nonce-implementation.md`](./security/csp/nonce-implementation) |
| Security – Rate Limiting | [`security/rate-limiting/guide.md`](./security/rate-limiting/guide) |
| **Environment Setup** | **[`platform/environment-variables.md`](./platform/environment-variables)** |
| Platform Config | [`platform/site-config.md`](./platform/site-config) · [`platform/view-counts.md`](./platform/view-counts) |

## Maintenance Guidelines

- Keep new documentation in the appropriate topical folder; avoid reintroducing flat files at the root.
- Normalize headings to start with a level-one title (`# Title`) followed by a short **Summary** section when adding new content.
- Update this README whenever folders or key references change to maintain a reliable entry point.

## Related References

- `.github/copilot-instructions.md` – AI contributor guidelines and architectural constraints.
- Project root `README.md` – High-level overview and developer quick start.

_Last updated: December 2, 2025_

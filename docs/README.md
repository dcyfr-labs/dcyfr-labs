# Documentation

This directory is the knowledge base for the portfolio. Content is organized by topic-focused subfolders for faster navigation.

## 🚀 Quick Navigation

- **[`INDEX.md`](./INDEX.md)** – Complete directory structure (start here!)
- **[`QUICK_START.md`](./QUICK_START.md)** – Navigation hub for quick references

## Directory Overview

**Core Documentation (10 directories):**

- **`architecture/`** – Architecture patterns and refactoring guides
  - [`README.md`](./architecture/README.md) - Architecture overview
  - [`refactoring-complete.md`](./architecture/refactoring-complete.md) - Complete refactoring summary
  - [`migration-guide.md`](./architecture/migration-guide.md) - Step-by-step migration guide
  - [`examples.md`](./architecture/examples.md) - Practical code examples
  - [`best-practices.md`](./architecture/best-practices.md) - Architectural guidelines
  
- **`blog/`** – Blog system documentation + content strategy + RSS feeds:
  - [`architecture.md`](./blog/architecture.md) - Complete blog system architecture and data flow
  - [`quick-reference.md`](./blog/quick-reference.md) - Quick patterns and common tasks
  - [`content-creation.md`](./blog/content-creation.md) - Post authoring guide
  - [`mdx-processing.md`](./blog/mdx-processing.md) - MDX pipeline and plugins
  - [`frontmatter-schema.md`](./blog/frontmatter-schema.md) - Post metadata reference
  - `feeds/` - RSS/Atom feed documentation

- **`components/`** – Component documentation (26 files):
  - **Quick References:** [`post-badges.md`](./components/post-badges.md) · [`error-boundaries.md`](./components/error-boundaries.md) · [`loading-states.md`](./components/loading-states.md)
  - **Advanced Components:** [`related-posts.md`](./components/related-posts.md) · [`table-of-contents.md`](./components/table-of-contents.md) · [`syntax-highlighting.md`](./components/syntax-highlighting.md)
  - **Core Components:** [`mdx.md`](./components/mdx.md) · [`post-list.md`](./components/post-list.md) · [`blog-search-form.md`](./components/blog-search-form.md)

- **`api/`** – API integration references:
  - [`routes/overview.md`](./api/routes/overview.md) - API architecture, rate limiting, error handling
  - [`routes/contact.md`](./api/routes/contact.md) - Contact form endpoint
  - [`routes/github-contributions.md`](./api/routes/github-contributions.md) - GitHub API integration
  - [`reference.md`](./api/reference.md) - Quick API reference

- **`features/`** – Feature guides:
  - [`inngest-integration.md`](./features/inngest-integration.md) - Complete Inngest background jobs guide
  - [`inngest-testing.md`](./features/inngest-testing.md) - Testing and debugging guide
  - [`github-integration.md`](./features/github-integration.md) - GitHub API integration
  - [`ACTIVITY_FEED_AUTOMATION.md`](./features/ACTIVITY_FEED_AUTOMATION.md) - ✨ Activity feed automation strategy
  - [`ACTIVITY_CACHING_IMPLEMENTATION.md`](./features/ACTIVITY_CACHING_IMPLEMENTATION.md) - ✨ Activity caching implementation
  - [`SERIES_REFACTOR_PROGRESS.md`](./features/SERIES_REFACTOR_PROGRESS.md) - ✨ Blog series refactor tracker
  - [`FUTURE_IDEAS.md`](./features/FUTURE_IDEAS.md) - ✨ Post-launch feature ideas
  - `mcp/` - Model Context Protocol documentation

- **`design/`** – Design system and UX (organized into subdirectories):
  - `typography/` - Typography system (Geist Sans, Source Serif 4, Geist Mono)
  - `mobile/` - Mobile-first optimization and analysis
  - `print/` - Print stylesheet implementation
  - `spacing/` - Spacing standards and audit
  - `ui-patterns/` - Component patterns and UI consistency
  - [`design-system.md`](./design/design-system.md) - Overall design system
  - [`PAGE_TEMPLATES.md`](./design/PAGE_TEMPLATES.md) - ✨ Complete page templates
  - [`DESIGN_TOKEN_COMPLIANCE_REPORT.md`](./design/DESIGN_TOKEN_COMPLIANCE_REPORT.md) - ✨ Compliance audit

- **`security/`** – Security implementation:
  - `csp/` - Content Security Policy with nonce implementation
  - `rate-limiting/` - Rate limiting guides and flows
  - [`security-findings-resolution.md`](./security/security-findings-resolution.md)

- **`platform/`** – Platform configuration:
  - [`environment-variables.md`](./platform/environment-variables.md) - Complete environment setup
  - [`site-config.md`](./platform/site-config.md) - Domain and URL configuration
  - [`view-counts.md`](./platform/view-counts.md) - Blog analytics and Redis setup

- **`operations/`** – Project management:
  - [`todo.md`](./operations/todo.md) - Active tasks and priorities
  - [`done.md`](./operations/done.md) - Completed projects archive
  - [`automation-backlog.md`](./operations/automation-backlog.md) - CI/CD automation status

- **`automation/`** – ✨ Automated updates and dependency management:
  - [`AUTOMATED_UPDATES.md`](./automation/AUTOMATED_UPDATES.md) - Complete automation system guide
  - [`ENABLE_AUTO_MERGE.md`](./automation/ENABLE_AUTO_MERGE.md) - Auto-merge setup instructions
  - [`IMPLEMENTATION_SUMMARY.md`](./automation/IMPLEMENTATION_SUMMARY.md) - Deployment guide

**Development & Optimization (4 directories):**

- **`development/`** – Performance optimization:
  - [`lighthouse-ci.md`](./development/lighthouse-ci.md) - Lighthouse CI setup
  - [`inp-optimization.md`](./development/inp-optimization.md) - INP optimization
  - [`isr-implementation.md`](./development/isr-implementation.md) - ISR setup
  - [`bundle-analysis.md`](./development/bundle-analysis.md) - Bundle optimization

- **`testing/`** – Test infrastructure and coverage:
  - [`README.md`](./testing/README.md) - Testing overview and setup
  - [`coverage-roadmap.md`](./testing/coverage-roadmap.md) - 3-phase coverage plan
  - [`quick-reference.md`](./testing/quick-reference.md) - Testing commands & patterns

- **`optimization/`** – SEO + accessibility + analytics:
  - [`json-ld-implementation.md`](./optimization/json-ld-implementation.md) - Structured data
  - [`alt-text-guide.md`](./optimization/alt-text-guide.md) - Accessibility
  - [`tag-analytics.md`](./optimization/tag-analytics.md) - Tag analytics

- **`content/`** – Content validation and standards:
  - [`CONTENT_VALIDATION.md`](./content/CONTENT_VALIDATION.md) - Validation workflows
  - [`MARKDOWN_STANDARDS.md`](./content/MARKDOWN_STANDARDS.md) - Markdown conventions
  - [`MERMAID_BEST_PRACTICES.md`](./content/MERMAID_BEST_PRACTICES.md) - Diagram guidelines

**Reference (2 directories):**

- **`ai/`** – AI contributor guides:
  - [`BEST_PRACTICES.md`](./ai/BEST_PRACTICES.md) - AI development practices
  - [`DESIGN_SYSTEM.md`](./ai/DESIGN_SYSTEM.md) - Design system for AI
  - [`OPTIMIZATION_STRATEGY.md`](./ai/OPTIMIZATION_STRATEGY.md) - Token optimization
  - `discovery/` - AI discovery documentation

- **`maintenance/`** – Maintenance patterns:
  - [`MODULARIZATION.md`](./maintenance/MODULARIZATION.md) - Dashboard modularization

## Quick Links

| Topic | Primary References |
|-------|--------------------|
| **Getting Started** | **[`QUICK_START.md`](./QUICK_START.md) - Navigation hub** |
| **Architecture** | **[`architecture/README.md`](./architecture/README.md) · [`architecture/migration-guide.md`](./architecture/migration-guide.md)** |
| AI Discovery | [`ai/discovery/overview.md`](./ai/discovery/overview.md) |
| APIs | [`api/reference.md`](./api/reference.md) · [`api/routes/overview.md`](./api/routes/overview.md) |
| Blog System | [`blog/architecture.md`](./blog/architecture.md) · [`blog/quick-reference.md`](./blog/quick-reference.md) |
| Blog Feeds | [`blog/feeds/improvements.md`](./blog/feeds/improvements.md) |
| Components | [`components/post-badges.md`](./components/post-badges.md) · [`components/mdx.md`](./components/mdx.md) |
| Design System | [`design/design-system.md`](./design/design-system.md) |
| Typography | [`design/typography/typography.md`](./design/typography/typography.md) |
| **Mobile-First UX** | **[`design/mobile/mobile-first-optimization-analysis.md`](./design/mobile/mobile-first-optimization-analysis.md)** |
| Print Styles | [`design/print/print-stylesheet.md`](./design/print/print-stylesheet.md) |
| Spacing System | [`design/spacing/spacing-system.md`](./design/spacing/spacing-system.md) |
| **Background Jobs** | **[`features/inngest-integration.md`](./features/inngest-integration.md)** |
| GitHub Integration | [`features/github-integration.md`](./features/github-integration.md) |
| MCP Servers | [`features/mcp/servers.md`](./features/mcp/servers.md) |
| **Operations** | **[`operations/todo.md`](./operations/todo.md) · [`operations/done.md`](./operations/done.md)** |
| Testing | [`testing/README.md`](./testing/README.md) · [`testing/coverage-roadmap.md`](./testing/coverage-roadmap.md) |
| Performance | [`development/lighthouse-ci.md`](./development/lighthouse-ci.md) · [`development/inp-optimization.md`](./development/inp-optimization.md) |
| SEO & Accessibility | [`optimization/json-ld-implementation.md`](./optimization/json-ld-implementation.md) · [`optimization/alt-text-guide.md`](./optimization/alt-text-guide.md) |
| Security – CSP | [`security/csp/nonce-implementation.md`](./security/csp/nonce-implementation.md) |
| Security – Rate Limiting | [`security/rate-limiting/guide.md`](./security/rate-limiting/guide.md) |
| **Environment Setup** | **[`platform/environment-variables.md`](./platform/environment-variables.md)** |
| Platform Config | [`platform/site-config.md`](./platform/site-config.md) · [`platform/view-counts.md`](./platform/view-counts.md) |

## Maintenance Guidelines

- Keep new documentation in the appropriate topical folder; avoid reintroducing flat files at the root.
- Normalize headings to start with a level-one title (`# Title`) followed by a short **Summary** section when adding new content.
- Update this README whenever folders or key references change to maintain a reliable entry point.

## Related References

- `.github/copilot-instructions.md` – AI contributor guidelines and architectural constraints.
- Project root `README.md` – High-level overview and developer quick start.

_Last updated: December 2, 2025_

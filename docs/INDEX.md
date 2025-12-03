# Documentation Index

**Last Updated:** December 2, 2025
**Status:** Production-ready documentation ✅

---

## 📊 Current Structure

The documentation is organized into **15 focused directories**:

### 📁 Core Documentation (9 directories)

1. **`architecture/`** - Architecture patterns, refactoring guides, and migration docs
2. **`blog/`** - Blog system documentation, content strategy, RSS feeds (includes `feeds/` subdirectory)
3. **`components/`** - Component documentation (26 files)
4. **`api/`** - API integration references and route documentation (includes `routes/` subdirectory)
5. **`features/`** - Feature guides (Inngest, GitHub, MCP) with `mcp/` subdirectory
6. **`design/`** - Design system and UX (organized by topic: `typography/`, `mobile/`, `print/`, `spacing/`, `ui-patterns/`)
7. **`security/`** - Security implementation (`csp/`, `rate-limiting/` subdirectories)
8. **`platform/`** - Platform configuration (env vars, site config)
9. **`operations/`** - Project management (todo, done, deployment, `sessions/` subdirectory)

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
- **[README.md](./README.md)** - Directory overview and quick links
- **[QUICK_START.md](./QUICK_START.md)** - Single-page navigation hub

### Architecture & Code
- **[architecture/README.md](./architecture/README.md)** - Architecture overview
- **[architecture/migration-guide.md](./architecture/migration-guide.md)** - Step-by-step migration
- **[components/](./components/)** - Component documentation

### Blog System
- **[blog/architecture.md](./blog/architecture.md)** - Complete blog architecture
- **[blog/quick-reference.md](./blog/quick-reference.md)** - Common patterns
- **[blog/feeds/](./blog/feeds/)** - RSS/Atom feed documentation

### Features
- **[features/inngest-integration.md](./features/inngest-integration.md)** - Background jobs
- **[features/github-integration.md](./features/github-integration.md)** - GitHub API
- **[features/mcp/](./features/mcp/)** - Model Context Protocol

### Design System
- **[design/typography/](./design/typography/)** - Typography system
- **[design/mobile/](./design/mobile/)** - Mobile-first design
- **[design/spacing/](./design/spacing/)** - Spacing standards

### Development
- **[testing/README.md](./testing/README.md)** - Testing overview
- **[testing/coverage-roadmap.md](./testing/coverage-roadmap.md)** - 3-phase coverage plan
- **[testing/quick-reference.md](./testing/quick-reference.md)** - Testing commands & patterns
- **[development/](./development/)** - Performance optimization guides
- **[optimization/](./optimization/)** - SEO + accessibility + analytics

### Configuration
- **[platform/environment-variables.md](./platform/environment-variables.md)** - Complete env setup
- **[security/](./security/)** - CSP, rate limiting, security guides
- **[api/routes/overview.md](./api/routes/overview.md)** - API architecture

### Operations
- **[operations/todo.md](./operations/todo.md)** - Active tasks
- **[operations/done.md](./operations/done.md)** - Completed work

---

## 🎯 Directory Purposes

### `architecture/`
Architecture patterns, refactoring guides, migration docs, best practices

### `blog/`
Blog system architecture, content creation, MDX processing, frontmatter schema, RSS feeds, content strategy

### `components/`
Component docs covering UI components, error boundaries, loading states, and advanced features

### `api/`
API integration references, route documentation, rate limiting, error handling

### `features/`
Feature guides for Inngest, GitHub integration, MCP servers, analytics, OG images

### `design/`
Design system organized by topic:
- `typography/` - Font system and rendering
- `mobile/` - Mobile-first optimization
- `print/` - Print stylesheet
- `spacing/` - Spacing standards
- `ui-patterns/` - Component patterns

### `security/`
Security implementation guides for CSP, rate limiting, and security best practices

### `platform/`
Platform configuration: environment variables, site config, view counts, deployment

### `operations/`
Project management: todo lists, completed work, deployment guides, automation

### `development/`
Performance: Lighthouse CI, bundle analysis, INP optimization, ISR

### `testing/`
Test infrastructure setup (Vitest, Playwright, Testing Library), coverage roadmap, mocking strategies

### `optimization/`
SEO, accessibility, and analytics: meta tags, alt text, JSON-LD, tag analytics

### `content/`
Content validation, markdown standards, Mermaid best practices

### `ai/`
AI contributor guides and discovery research

### `maintenance/`
Dashboard modularization patterns and maintenance documentation

---

## 📝 Maintenance Guidelines

- Keep documentation in appropriate topical folders
- Use subdirectories when a category grows beyond 10-12 files
- Update this INDEX and README when structure changes
- Cross-reference related docs with relative links

---

_Last updated: December 2, 2025_

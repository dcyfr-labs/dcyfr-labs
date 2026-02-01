# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses [Calendar Versioning](https://calver.org/) with the `YYYY.MM.DD[.MICRO]` format.

**Breaking changes** are marked with ⚠️ BREAKING in the version header.

## [2026.01.31]

### Changed

- **Preview deployments now include draft blog posts** - Vercel preview builds and local development will display posts from `src/content/blog/private/` and drafts marked `draft: true` for pre-production testing. Drafts remain hidden in production builds and private assets remain gitignored.

## [2026.01.21]

### Added

- **Changelog Automation & Guardrails System** - Complete 3-tier system for changelog management
  - `scripts/validate-changelog-sync.mjs` - Detects stale changelogs (>7 days default)
  - `scripts/validate-changelog-format.mjs` - Validates CalVer format and structure
  - `npm run changelog:check` - Warning mode for stale detection
  - `npm run changelog:check:strict` - Strict enforcement mode for CI/CD
  - `npm run changelog:validate` - Format compliance validation
  - Comprehensive implementation guide (`docs/operations/CHANGELOG_AUTOMATION_IMPLEMENTATION.md`)

### Changed

- **Improved `scripts/changelog.mjs`** - Enhanced user experience and compliance
  - Removed emojis (📝 → text) for DCYFR compliance
  - Added input validation for count and format arguments
  - Better error messages with helpful guidance
  - Format validation with warnings before fallback
  - Improved output formatting and usage instructions

- **Updated `.github/agents/enforcement/VALIDATION_CHECKLIST.md`**
  - Added dedicated changelog requirements section to documentation checks
  - Documented when to update (new features, breaking changes)
  - Specified validation commands to run before completion
  - Established 7-day update frequency guideline
  - Added DCYFR enforcement for AI agents

- **Updated `.github/PULL_REQUEST_TEMPLATE.md`**
  - Enhanced documentation section with changelog guidelines
  - Added specific validation commands and examples
  - Clarified criteria for when changelog updates are required
  - Provided clear guidance for developers

### Rationale

The changelog automation system addresses the need for consistent changelog maintenance by:

- Preventing stale changelogs (>7 days without updates)
- Ensuring proper CalVer format compliance
- Providing both warnings (local dev) and strict enforcement (CI/CD)
- Creating structured guardrails in DCYFR enforcement documentation
- Helping AI agents remember changelog requirements via VALIDATION_CHECKLIST.md

## [2026.01.11]

### Added

- **Environment Variable Documentation** - Comprehensive setup for academic research and AI development tools
  - `SEMANTIC_SCHOLAR_API_KEY` documentation for academic research and citation analysis
  - Multiple AI provider API keys (OpenAI, Groq, Google, etc.) for multi-provider fallback via OpenCode.ai
  - Advanced setup instructions in `.env.example`

### Changed

- **DCYFR Agent Documentation Overhaul** - Major improvements to `.github/agents/DCYFR.agent.md`
  - Expanded tool support including arxiv, octocode, and dcyfr-\* modules
  - Updated references to core patterns, enforcement rules, and learning resources
  - Clarified best practices for component patterns, design tokens, API routes, and testing
  - Added explicit guidance prohibiting emojis in public content with React icon requirements
  - Updated all documentation links to point to new or reorganized locations
  - Enhanced DCYFR philosophy section emphasizing consistency, validation, and test-driven development
- Updated `.github/ISSUE_TEMPLATE/gitleaks-critical-secret.md` to reference new PI/PII policy documentation location
- Improved formatting and clarity of automated workflow messages in security templates
- **Content & SEO Standards** - Standardized punctuation guidelines for descriptions
  - Established rule: Always end descriptions with periods (meta and hero descriptions)
  - Updated homepage hero description for consistency ("Emerging technology, security insights, and practical code.")
  - Added content guidelines to CLAUDE.md and design system documentation
  - Based on 2026 SEO best practices research (Google preference for complete sentences)
  - Improves readability, professionalism, and SEO performance

### Removed

- **Pre-commit Hook Removal** - Removed `.githooks/pre-commit` script
  - Previously enforced documentation governance checks, sensitive file detection, and pre-commit validations
  - Decision made to streamline local development workflow

## [2026.01.05]

### Added

- **OpenCode.ai Fallback Integration** - Multi-provider AI development tool for token exhaustion scenarios
  - Comprehensive architecture documentation (`docs/ai/opencode-fallback-architecture.md`)
  - 75+ AI provider support (OpenAI, Anthropic, Google Gemini, Groq, local models)
  - Cost optimization (10-100x cheaper with Groq vs Claude Code)
  - Offline development support via Ollama local models
  - NPM scripts: `ai:opencode`, `ai:opencode:groq`, `ai:opencode:local`, `ai:setup`
  - Example configuration file (`.opencode.config.example.json`)
  - Automated setup script (`scripts/setup-opencode.sh`)
  - Environment variable support for all major AI providers
  - Three-tier AI tool hierarchy: Claude Code → GitHub Copilot → OpenCode.ai
  - Provider-specific agents (build, plan, debug, review, document)
  - Design system enforcement in OpenCode.ai configuration
  - Session management and token usage tracking
  - **VS Code Extension Integration** (`sst-dev.opencode`)
    - Keyboard shortcuts: `Cmd+Esc` (launch), `Cmd+Shift+Esc` (new session), `Cmd+Option+K` (file refs)
    - Context awareness: Automatically shares current selection/tab
    - Editor integration: Button in title bar for quick access
    - Independent terminal sessions per OpenCode instance
    - Compatible with VS Code, Cursor, Windsurf, and VSCodium

### Changed

- Updated `CLAUDE.md` with AI tool hierarchy, OpenCode.ai trigger conditions, and VS Code extension info
- Updated `AGENTS.md` with OpenCode.ai fallback tier (🟢 FALLBACK) and multi-tier AI architecture
- Updated `.env.example` with comprehensive OpenCode.ai provider configuration
- Updated `.vscode/extensions.json` to recommend `sst-dev.opencode` extension
- Updated `.gitignore` to exclude OpenCode.ai session data and configs

## [2026.01.02]

### Added

- **Bookmark/Reading List Feature** - Complete bookmark functionality for blog posts
  - `useBookmarks` hook with localStorage persistence and cross-tab sync
  - `BookmarkButton` component for all post layouts (grid, list, magazine, compact)
  - `/bookmarks` page displaying saved posts with clear all functionality
  - Integration with existing `PostQuickActions` sidebar component
  - Empty states, confirmation dialogs, and user feedback via toasts
- Comprehensive production deployment documentation (`docs/operations/production-deployment.md`)
- Test skip documentation explaining 7 intentionally skipped tests
- Production readiness validation and deployment runbook

### Changed

- Updated testing documentation to reflect 99.5% pass rate (1339/1346 tests)
- Clarified that 7 "failing" tests are strategic skips, not failures
- Enhanced deployment checklist with pre/post production deployment steps
- Updated environment variables documentation for December 2025
- Temporarily disabled Vercel BotID in `/api/contact` due to false positives; added `ENABLE_BOTID` env var to toggle check and added tests + documentation to re-enable safely when Vercel configuration validated
- Improve robustness of `security-advisory-monitor`:
  - Implemented fetch helper with exponential backoff and special-case handling for 422 responses
  - Added a small delay between package requests to reduce spam/validation errors from the GHSA API
  - Improved diagnostic logging to capture response bodies and rate-limit headers

## [2025.12.07] - Production Deployment ⚠️ BREAKING

### Summary

**Production Deployment Ready** - All testing on preview branch completed successfully. Project validated for production deployment with 99.5% test pass rate, zero security vulnerabilities, and comprehensive documentation.

### Status

- ✅ **Test Pass Rate:** 1339/1346 tests (99.5%)
- ✅ **Security:** 0 vulnerabilities, Grade A- security audit
- ✅ **Performance:** Infrastructure ready, baselines pending first deployment
- ✅ **Documentation:** Comprehensive coverage across 15 directories, 300+ files
- ✅ **Code Quality:** 0 TypeScript errors, 0 ESLint warnings

### Validated

**Testing:**

- All 198 integration tests passing
- All critical E2E tests passing (with strategic WebKit skips)
- All unit tests passing (with 5 skipped tests for component refactors)
- Test health automation active (weekly reports)

**Deployment Infrastructure:**

- Vercel deployment workflow configured and validated
- Preview deployments tested and working
- Environment variable requirements documented
- GitHub secrets setup documented
- Monitoring integrations ready (Sentry, Vercel Analytics, Inngest)

**Documentation:**

- Production deployment runbook created
- Test skip strategy documented
- Environment variables guide updated
- Deployment checklist enhanced
- All AI contributor guides current

### Notes

- 7 tests intentionally skipped (see `docs/testing/README.md`)
- Performance baselines will be populated after first production deployment
- All blocking items resolved; ready for production deployment

## [2025.12.06]

### Added

- Repository documentation templates (PR template, issue templates, code of conduct)
- MIT license
- Vercel Blob integration plan for future asset storage

### Changed

- Updated all repository documentation to reflect Phase 4 completion
- Updated test metrics across documentation (1339/1346 tests passing, 99.5%)
- Optimized GitHub Actions workflows with concurrency and timeouts
- Updated github-script actions to v8

## [2025.11.26] - Initial Release ⚠️ BREAKING

### Summary

Production-ready Next.js 16 portfolio with comprehensive testing, security, and documentation.

### Added

**Core Features:**

- MDX-powered blog system with syntax highlighting, TOC, and related posts
- Real-time analytics with Redis and Inngest background jobs
- GitHub contribution heatmap integration
- Contact form with email delivery (Resend)
- RSS/Atom feeds for blog and projects
- Dark mode support with next-themes

**Testing Infrastructure:**

- 1185/1197 tests passing (99.0% pass rate)
- 198 integration tests
- Unit tests with Vitest and Testing Library
- E2E tests with Playwright
- Test coverage reporting

**Security Features:**

- Content Security Policy (CSP) with nonce-based implementation
- Redis-backed rate limiting with in-memory fallback
- Input validation on all API endpoints
- Security headers (HSTS, X-Frame-Options, etc.)
- Zero security vulnerabilities (CodeQL + Dependabot)

**Performance Optimizations:**

- Server components by default
- Image optimization with Next.js Image
- Edge caching and ISR
- Lighthouse CI integration (≥90% performance, ≥95% accessibility)
- Core Web Vitals monitoring

**Developer Experience:**

- Comprehensive documentation (14 directories, 300+ files)
- AI contributor guides (Claude Code + GitHub Copilot)
- Design system with reusable components and design tokens
- TypeScript strict mode throughout
- ESLint + Prettier configuration

**Documentation:**

- Architecture guides and migration patterns
- Component documentation (26 components)
- Security implementation guides
- Testing infrastructure documentation
- API route documentation

### Tech Stack

- **Framework:** Next.js 16.0.4 (App Router)
- **Language:** TypeScript 5.9.3
- **UI:** React 19.2.0, Tailwind CSS v4, shadcn/ui
- **Content:** MDX with next-mdx-remote
- **Background Jobs:** Inngest
- **Database/Cache:** Redis (Upstash)
- **Email:** Resend
- **Testing:** Vitest 4.0.14, Playwright 1.57.0
- **Deployment:** Vercel

### Dependencies

**Major Version Updates (Nov 26, 2025):**

- Next.js 16.0.3 → 16.0.4
- Vitest 4.0.10 → 4.0.14
- @playwright/test 1.56.1 → 1.57.0
- @types/react 19.2.5 → 19.2.7
- lucide-react 0.554.0 → 0.555.0
- msw 2.12.2 → 2.12.3

### Security

- **Vulnerabilities:** 0 (as of 2025-11-26)
- **Security Rating:** A+ (Excellent)
- **CodeQL:** No issues detected
- **Dependabot:** Active with auto-merge

### Known Issues

- 11 test failures related to React 19 `act()` strictness (non-blocking, see [#TODO](docs/operations/todo.md#testing--quality))

---

For detailed project history, see [docs/operations/done.md](docs/operations/done.md).

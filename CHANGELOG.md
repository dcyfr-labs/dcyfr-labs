# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Repository documentation templates (PR template, issue templates, code of conduct)
- MIT license

### Changed
- Updated all repository documentation to reflect Phase 4 completion
- Updated test metrics across documentation (1185/1197 tests passing, 99.0%)

## [1.0.0] - 2025-11-26

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

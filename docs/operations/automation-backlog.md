# Automation & CI Status

**Status:** ✅ Complete (December 2, 2025)

This file tracks CI/CD automation. All core items are now implemented.

## ✅ Completed Automation

- [x] **GitHub Actions CI** — Multiple workflows handle lint, typecheck, build, and tests
  - `test.yml` — Runs test suite on PR and push
  - `deploy.yml` — Vercel deployment
  - `validate-content.yml` — Content validation
  - `design-system.yml` — Design token validation

- [x] **Dependency Security** — Dependabot configured for automated updates
  - Daily security vulnerability scans
  - Weekly dependency update PRs
  - Auto-merge for patch updates via `dependabot-auto-merge.yml`
  - See [`dependabot-setup.md`](./dependabot-setup.md) for full configuration

- [x] **Code Security Scanning** — GitHub CodeQL
  - Automated SAST on push, PR, and daily schedule
  - See `.github/workflows/codeql.yml`

- [x] **Lighthouse CI** — Performance monitoring
  - Runs on PRs to track regressions
  - See `.github/workflows/lighthouse-ci.yml`

- [x] **Cache build artifacts** — `.next/cache` preserved in CI workflows

## 🔧 Optional Enhancements (Backlog)

- [ ] Husky + lint-staged — Auto-format staged files (low priority, manual workflow works)

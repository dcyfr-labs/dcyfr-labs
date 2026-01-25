{/_ TLP:CLEAR _/}

# 📊 Reports Directory

This directory contains **temporary generated reports and test artifacts** that are **not committed to git**.

**Historical Note:** Audit reports previously stored here have been relocated to appropriate `docs/*/private/` folders per governance policy (January 2026).

## Structure

```
reports/
├── .gitignore                  # Ignore all files in this directory
├── predeployment/              # Pre-deployment validation reports
│   └── PREDEPLOYMENT_REPORT_*.md
├── performance/                # Performance analysis & profiling
│   ├── bundle-analysis/
│   └── lighthouse-reports/
└── e2e-results/                # End-to-end test artifacts (when needed)
    ├── screenshots/
    └── videos/
```

## Relocated Audit Reports (January 2026)

Historical audit reports have been moved to documentation:

- **Accessibility audits** → `docs/accessibility/private/`
- **Security audits** → `docs/security/private/`
- **Privacy audits** → `docs/operations/private/reports/`
- **Industry status** → `docs/operations/private/reports/`
- **Design system reports** → `docs/design/private/`

## Purpose

- **Predeployment Reports:** Full validation suite results before merging to main
- **Performance Reports:** Bundle size analysis, Lighthouse audits
- **E2E Results:** Screenshots, videos, and failure traces from Playwright tests

**Note:** This directory is for temporary runtime-generated reports only. All historical/archival audit reports belong in `docs/*/private/` folders per governance policy.

## Usage

**Generating Reports:**

```bash
# Full predeployment check
npm run check && npm run test && npm run build && npm run perf:check && npm run test:e2e

# Individual reports
npm run perf:check      # Bundle size analysis
npm run lighthouse:ci   # Lighthouse performance report
npm run test:e2e        # E2E test results
```

**Viewing Latest Report:**

```bash
# Most recent predeployment report
ls -t reports/predeployment/ | head -1
```

## Information Classification

**TLP:CLEAR** - All reports generated in this directory are temporary, local-only artifacts not committed to git. For permanent audit/compliance documentation, see `docs/*/private/` folders.

## Notes

- All files in this directory are ignored by git (see `.gitignore`)
- **Historical audit reports:** Relocated to `docs/*/private/` (see above)
- Reports are named with timestamps for historical tracking
- Safe to delete old reports to manage disk space
- CI/CD pipelines can generate reports here without polluting the codebase

---

**Last Updated:** January 24, 2026
**Information Classification:** TLP:CLEAR (Public)

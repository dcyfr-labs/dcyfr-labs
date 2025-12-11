# 📊 Reports Directory

This directory contains generated reports and test artifacts that are **not committed to git**.

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

## Purpose

- **Predeployment Reports:** Full validation suite results before merging to main
- **Performance Reports:** Bundle size analysis, Lighthouse audits
- **E2E Results:** Screenshots, videos, and failure traces from Playwright tests

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

## Notes

- All files in this directory are ignored by git (see `.gitignore`)
- Reports are named with timestamps for historical tracking
- Safe to delete old reports to manage disk space
- CI/CD pipelines can generate reports here without polluting the codebase

---

**Last Updated:** December 11, 2025

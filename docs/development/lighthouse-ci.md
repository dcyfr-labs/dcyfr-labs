# Lighthouse CI Integration

This document covers the Lighthouse CI setup, configuration, budgets, and maintenance procedures.

## Overview

Lighthouse CI is integrated into the project to ensure performance and accessibility standards are met on every pull request. The setup uses `@lhci/cli` with GitHub Actions for automated quality gates.

### Key Benefits

- **Automated Quality Gates**: Performance and accessibility checks on every PR
- **Prevents Regressions**: Catches performance drops and accessibility violations before merge
- **Data-Driven Decisions**: Historical audit data for performance optimization
- **Cost-Effective**: No infrastructure costs (runs in GitHub Actions)
- **Easy to Configure**: JSON-based budgets and thresholds

## Architecture

```
┌─────────────┐
│  Developer  │
│   Creates   │
│     PR      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│ GitHub Actions: lighthouse-ci   │
│ (.github/workflows/lighthouse-  │
│        ci.yml)                  │
└──────┬──────────────────────────┘
       │
       ├─ Checkout code
       ├─ Install dependencies
       ├─ Build Next.js (npm run build)
       ├─ Start production server
       ├─ Run Lighthouse CI
       ├─ Comment results on PR
       └─ Upload artifacts
```

## Configuration Files

### 1. `lighthouserc.json` (Root)

Main Lighthouse CI configuration with collections, uploads, and assertions:

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./.next",
      "numberOfRuns": 3,
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/blog",
        "http://localhost:3000/projects",
        "http://localhost:3000/about",
        "http://localhost:3000/contact"
      ]
    },
    "upload": {
      "target": "filesystem",
      "outputDir": "./lighthouse"
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.90 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["warn", { "minScore": 0.85 }],
        "categories:seo": ["warn", { "minScore": 0.90 }]
      }
    }
  }
}
```

**Key Settings**:
- **`numberOfRuns`**: 3 audits per URL (takes average for stability)
- **`url`**: Key pages to audit (homepage, blog, projects, about, contact)
- **`target`**: Stores results locally (filesystem) for GitHub Actions artifacts
- **`assertions`**: Budget thresholds for each category

### 2. `lighthouse-config.json` (Root)

Extended Lighthouse configuration for audit settings:

```json
{
  "extends": "lighthouse:default",
  "settings": {
    "emulatedFormFactor": "desktop",
    "onlyCategories": ["performance", "accessibility", "best-practices", "seo"]
  }
}
```

**Key Settings**:
- **`emulatedFormFactor`**: Desktop audits (can add mobile separately)
- **`onlyCategories`**: Focus on key metrics, skip PWA audit

## Budget Thresholds

| Category | Threshold | Severity | Why |
|----------|-----------|----------|-----|
| **Performance** | ≥ 90 | Error | Core metric: LCP, FID, CLS impact SEO and UX |
| **Accessibility** | ≥ 95 | Error | Priority: WCAG compliance and inclusive access |
| **Best Practices** | ≥ 85 | Warning | Security and standards compliance |
| **SEO** | ≥ 90 | Warning | Organic traffic impact |

**When Thresholds Trigger**:
- **Error**: PR fails validation, must be fixed before merge
- **Warning**: Noted in PR comment but doesn't block merge

## GitHub Actions Workflow

### File: `.github/workflows/lighthouse-ci.yml`

**Triggers**:
- Pull requests to `main` or `preview` branches
- Manual trigger via workflow dispatch

**Steps**:
1. **Checkout**: Clone repo with full history (for baseline comparison)
2. **Setup Node.js**: Install Node 20 with npm cache
3. **Install Dependencies**: `npm ci` (clean install)
4. **Build**: `npm run build` (production build)
5. **Start Server**: `npm start &` (background process)
6. **Wait for Server**: `npx wait-on http://localhost:3000`
7. **Run Lighthouse CI**: `npm run lhci:autorun`
8. **Upload Artifacts**: Results stored in `.lighthouseci/`
9. **Comment PR**: Formatted table with scores
10. **Validate**: Fails if thresholds not met

### PR Comment Example

```
## 📊 Lighthouse CI Results

| Category | Score | Budget |
|----------|-------|--------|
| Performance | 95 | 90 ✅ |
| Accessibility | 98 | 95 ✅ |
| Best Practices | 88 | 85 ✅ |
| SEO | 92 | 90 ✅ |
```

## npm Scripts

```bash
# Collect Lighthouse metrics for current page
npm run lhci:collect

# Validate against configured budgets
npm run lhci:validate

# Upload results (filesystem target)
npm run lhci:upload

# Autorun: collect → validate → upload
npm run lhci:autorun

# Full pipeline: build + CI check (for local testing)
npm run lighthouse:ci
```

## Local Testing

### 1. Build and Test Locally

```bash
# Build the production bundle
npm run build

# Run full Lighthouse CI pipeline
npm run lighthouse:ci
```

### 2. View Results

Results are stored in `.lighthouseci/lighthouse-results.json`:

```bash
# Pretty-print the results
cat .lighthouseci/lighthouse-results.json | jq .
```

### 3. Debug Specific Page

```bash
# Collect metrics for a specific URL
LHCI_BUILD_CONTEXT__CURRENT_BRANCH=debug npm run lhci:collect
```

## Updating Baselines

When legitimate performance changes require new baselines:

### Option 1: Update via GitHub Actions

1. Push changes to a branch
2. Let workflow run and collect new baseline
3. Upload results manually or accept new baseline in PR

### Option 2: Local Update

```bash
# Remove old baseline
rm -rf .lighthouseci/

# Collect new baseline
npm run lhci:collect

# Validate against new baseline
npm run lhci:validate

# Commit new baseline
git add .lighthouseci/
git commit -m "chore: update lighthouse baselines"
```

## Troubleshooting

### "Port 3000 Already in Use"

```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Or change port in workflow
PORT=3001 npm start &
```

### "Lighthouse CI: Collection Failed"

**Common Causes**:
1. Server didn't start (check `npm run build`)
2. Port not ready (increase wait timeout)
3. URL not accessible

**Solution**:
```bash
# Test server manually
npm run build
npm start
# In another terminal
curl http://localhost:3000
```

### "Assertion Failed: Performance < 90"

Indicates performance regression. Debug with:

```bash
# Run Lighthouse on Chrome DevTools
# Open DevTools → Lighthouse tab
# Run audit on specific pages

# Or use Lighthouse CLI directly
npx lighthouse http://localhost:3000 --output-path=./report.html
```

**Common Performance Issues**:
- Large image bundles (optimize with Next.js Image)
- Unminified JavaScript (check build output)
- Render-blocking CSS (move non-critical styles)
- Excessive network requests (consider caching)

### "Accessibility Score Dropped"

Review the detailed audit results:

```bash
# Extract accessibility issues
jq '.runs[0].lhr.audits | to_entries[] | select(.key | contains("aria") or contains("color") or contains("button"))' \
  .lighthouseci/lighthouse-results.json
```

**Common Accessibility Issues**:
- Missing alt text on images
- Insufficient color contrast
- Non-semantic HTML (not using buttons/links)
- Missing ARIA labels on interactive elements

## Next Steps

1. **Monitor Results**: Watch PR comments for trends
2. **Set Performance Goals**: Establish monthly improvement targets
3. **Optimize Regularly**: Address low-scoring categories
4. **Mobile Audits**: Add mobile-specific audits (coming soon)
5. **Budget Adjustment**: Fine-tune thresholds based on benchmarks

## Related Documentation

- [Performance Monitoring with Budgets](./performance-budgets) (future)
- Core Web Vitals Guide (future)
- Image Optimization Best Practices
- [Next.js Performance Guide](https://nextjs.org/docs/app/building-your-application/optimizing)

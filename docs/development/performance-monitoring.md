# Performance Monitoring & Budgets

**Last Updated:** November 19, 2025  
**Status:** ✅ Active  
**Owner:** Development Team

## Overview

This document outlines the comprehensive performance monitoring strategy for www.dcyfr.ai, including Core Web Vitals tracking, bundle size monitoring, and performance budgets. The system provides real-time insights and automated alerts to maintain optimal performance.

## Table of Contents

- [Core Web Vitals Monitoring](#core-web-vitals-monitoring)
- [Bundle Size Monitoring](#bundle-size-monitoring)
- [Performance Budgets](#performance-budgets)
- [Monitoring Tools](#monitoring-tools)
- [Review Process](#review-process)
- [Optimization Workflow](#optimization-workflow)
- [Alert Configuration](#alert-configuration)

## Core Web Vitals Monitoring

### What Are Core Web Vitals?

Core Web Vitals are a set of metrics that measure real-world user experience for loading performance, interactivity, and visual stability.

### Tracked Metrics

| Metric | Target | Warning | Error | Description |
|--------|--------|---------|-------|-------------|
| **LCP** | < 2.5s | < 3.0s | < 4.0s | Largest Contentful Paint - Main content load time |
| **INP** | < 200ms | < 300ms | < 500ms | Interaction to Next Paint - Response to user interactions |
| **CLS** | < 0.1 | < 0.15 | < 0.25 | Cumulative Layout Shift - Visual stability |
| **FCP** | < 1.8s | < 2.4s | < 3.0s | First Contentful Paint - Initial render time |
| **TTFB** | < 800ms | < 1.2s | < 1.8s | Time to First Byte - Server response time |

### Implementation

**Location:** `src/lib/web-vitals.ts` + `src/components/web-vitals-reporter.tsx`

The Web Vitals tracking system:

1. **Automatic Tracking**: Initialized on page load via root layout
2. **Real-time Reporting**: Sends metrics to Vercel Speed Insights
3. **Development Logging**: Console logs with ratings in dev mode
4. **Production Optimization**: Lightweight, non-blocking implementation

**Usage:**

```typescript
// Already integrated in src/app/layout.tsx
import { WebVitalsReporter } from "@/components/web-vitals-reporter";

// In your root layout
<WebVitalsReporter />
```

### Viewing Web Vitals Data

1. **Vercel Dashboard**: Navigate to your project → Speed Insights
2. **Console (Dev)**: Check browser console for real-time metrics with ratings
3. **Lighthouse CI**: View historical trends in GitHub Actions artifacts

### Interpreting Ratings

- ✅ **Good**: Metric within target threshold - optimal performance
- ⚠️ **Needs Improvement**: Between target and error - consider optimization
- ❌ **Poor**: Exceeds error threshold - requires immediate attention

## Bundle Size Monitoring

### Bundle Size Budgets

| Bundle Type | Target | Warning | Error | Description |
|-------------|--------|---------|-------|-------------|
| **First Load JS** | 150 kB | 200 kB | 250 kB | Total JS for initial page load |
| **Main Bundle** | 100 kB | 130 kB | 170 kB | Core application bundle |
| **Page Bundle** | 50 kB | 70 kB | 100 kB | Individual page bundle |

### Asset Budgets

| Asset Type | Target | Warning | Error | Description |
|------------|--------|---------|-------|-------------|
| **Images** | 200 kB | 300 kB | 500 kB | Max image size (before optimization) |
| **Fonts** | 100 kB | 150 kB | 200 kB | Total font file sizes |

### Monitoring Script

**Location:** `scripts/check-bundle-size.mjs`

Run bundle size analysis after build:

```bash
# Build and check bundle sizes
npm run build && node scripts/check-bundle-size.mjs

# Output includes:
# - Total first load JS size
# - Individual page bundle sizes
# - Pass/warning/error status for each
# - Exit code 0 (pass) or 1 (fail)
```

**Example Output:**

```
📦 Bundle Size Monitor

============================================================

📊 Total First Load JS
✅ 145.32 kB / 150 kB (target)
   Target: 150 kB | Warning: 200 kB | Error: 250 kB

📄 Page Bundles (Top 10)
------------------------------------------------------------
✅ /                              42.18 kB
✅ /blog                          38.92 kB
⚠️  /blog/[slug]                  68.45 kB
✅ /projects                      35.67 kB

============================================================

✅ Bundle size check PASSED
   All bundles within target thresholds
```

### Bundle Analysis

For detailed bundle analysis, use the built-in Next.js analyzer:

```bash
# Generate interactive bundle visualization
ANALYZE=true npm run build

# Opens browser with:
# - Client bundle visualization
# - Server bundle visualization
# - Dependency tree analysis
```

## Performance Budgets

### Configuration File

**Location:** `performance-budgets.json`

This file defines all performance budgets and monitoring configuration:

```json
{
  "budgets": {
    "webVitals": { /* Core Web Vitals thresholds */ },
    "bundles": { /* Bundle size limits */ },
    "assets": { /* Asset size limits */ }
  },
  "monitoring": {
    "sampleRate": 1.0,
    "enabledEnvironments": ["production", "preview"],
    "alertThresholds": {
      "consecutiveFailures": 3,
      "percentileThreshold": 75
    }
  }
}
```

### Budget Adjustment Process

Review and adjust budgets **monthly** based on:

1. **Performance Trends**: 30-day rolling averages from Vercel Analytics
2. **User Feedback**: Complaints about slow load times
3. **Lighthouse CI Scores**: Trends in automated testing
4. **Industry Standards**: Keep pace with web performance best practices

**When to Adjust:**

- ✅ **Tighten**: Consistent performance 20% better than target for 3+ months
- ⚠️ **Loosen**: Legitimate need (new features, dependencies) with trade-off analysis
- ❌ **Never**: Don't loosen to accommodate poor optimization

## Monitoring Tools

### 1. Vercel Speed Insights

**Access:** Vercel Dashboard → Your Project → Speed Insights

**Features:**

- Real-user monitoring (RUM) data
- Core Web Vitals for all pages
- Geographic distribution
- Device and browser breakdown
- Historical trends (30, 60, 90 days)

**Review Frequency:** Weekly

### 2. Lighthouse CI

**Access:** GitHub Actions → Lighthouse CI workflow → Artifacts

**Features:**

- Automated audits on every PR
- Performance, accessibility, SEO, best practices scores
- Fails PR if thresholds not met (Performance ≥ 90%, Accessibility ≥ 95%)
- Historical comparison

**Review Frequency:** Every PR

### 3. Next.js Build Output

**Access:** Terminal output during `npm run build`

**Features:**

- Bundle size for each route
- First Load JS size
- Shared chunk analysis
- Static/dynamic route identification

**Review Frequency:** Every build

### 4. Bundle Analyzer

**Access:** `ANALYZE=true npm run build`

**Features:**

- Interactive treemap visualization
- Dependency size breakdown
- Duplicate module detection
- Lazy loading opportunities

**Review Frequency:** Monthly, or when bundles exceed warning threshold

## Review Process

### Weekly Performance Review

**Schedule:** Every Monday, 10:30 AM PST (after Sentry review)

**Checklist:**

1. **Open Vercel Speed Insights**
   - Check Core Web Vitals trends (7-day view)
   - Identify pages with poor performance
   - Note any regressions from previous week

2. **Review Bundle Sizes**
   - Run `npm run build && node scripts/check-bundle-size.mjs`
   - Check for any warnings or errors
   - Compare to previous week's sizes

3. **Check Lighthouse CI**
   - Review recent PR performance scores
   - Note any failed checks or regressions
   - Verify accessibility compliance

4. **Triage Issues**
   - Create GitHub issues for performance problems
   - Assign priority: Critical (> error threshold), High (> warning), Medium (trends)
   - Link to relevant data/screenshots

5. **Update Documentation**
   - Log findings in `docs/operations/performance-review-log.md`
   - Note optimization opportunities
   - Document any budget adjustments

### Monthly Deep Dive

**Schedule:** First Monday of each month

**Extended Review:**

1. Run full bundle analysis (`ANALYZE=true npm run build`)
2. Identify largest dependencies and opportunities
3. Review performance budgets for adjustment
4. Analyze geographic performance patterns
5. Check mobile vs. desktop performance gaps
6. Review and update optimization roadmap

## Optimization Workflow

### When Performance Degrades

**Immediate Actions (< error threshold):**

1. **Identify Culprit**: Use bundle analyzer and Vercel insights
2. **Quick Wins**:
   - Enable lazy loading for below-fold components
   - Optimize images (compression, format, sizing)
   - Remove unused dependencies
   - Enable code splitting
3. **Test**: Verify improvements in local build
4. **Deploy**: Push to preview branch and verify with Lighthouse CI

**Strategic Optimizations (> warning threshold):**

1. **Analyze Dependencies**:
   ```bash
   npm ls --depth=0          # List direct dependencies
   ANALYZE=true npm run build  # Visualize bundle
   ```

2. **Optimization Strategies**:
   - **Large Dependencies**: Consider lighter alternatives or lazy loading
   - **Duplicate Modules**: Deduplicate with webpack/rspack config
   - **Unused Code**: Tree-shake with proper imports
   - **Images**: Convert to WebP, use blur placeholders, lazy load
   - **Fonts**: Subset fonts, preload critical fonts

3. **Implement & Measure**:
   - Make one optimization at a time
   - Measure impact with before/after metrics
   - Document in performance review log

### Optimization Priority Matrix

| Issue | Impact | Effort | Priority |
|-------|--------|--------|----------|
| Image not optimized | High | Low | 🔴 Immediate |
| Large unused dependency | High | Medium | 🔴 Immediate |
| Bundle size exceeds error | Critical | Varies | 🔴 Immediate |
| CLS > 0.25 | High | Medium | 🟠 High |
| LCP > 4.0s | High | Medium | 🟠 High |
| Bundle size exceeds warning | Medium | Varies | 🟡 Medium |
| INP > 500ms | Medium | High | 🟡 Medium |

## Alert Configuration

### CI/CD Integration

**Lighthouse CI** (`lighthouserc.json`):

```json
{
  "assert": {
    "assertions": {
      "categories:performance": ["error", { "minScore": 0.9 }],
      "categories:accessibility": ["error", { "minScore": 0.95 }]
    }
  }
}
```

**Bundle Size Check** (add to `package.json`):

```json
{
  "scripts": {
    "check:bundle": "npm run build && node scripts/check-bundle-size.mjs",
    "pretest:ci": "npm run check:bundle"
  }
}
```

### GitHub Actions Integration

Add to `.github/workflows/test.yml`:

```yaml
- name: Check Bundle Sizes
  run: |
    npm run build
    node scripts/check-bundle-size.mjs
```

### Vercel Deployment Checks

Vercel automatically tracks bundle sizes and Speed Insights. Configure alerts in:

**Vercel Dashboard → Settings → Notifications**

- Enable: Speed Insights alerts
- Threshold: When 75th percentile exceeds error threshold
- Recipients: dev-team@example.com

## Metrics & KPIs

### Performance Targets

| Metric | Target | Current | Trend |
|--------|--------|---------|-------|
| LCP (75th percentile) | < 2.5s | TBD | → |
| INP (75th percentile) | < 200ms | TBD | → |
| CLS (75th percentile) | < 0.1 | TBD | → |
| Lighthouse Performance | ≥ 90 | TBD | → |
| First Load JS | < 150 kB | TBD | → |

### Success Criteria

- **All pages**: Pass Core Web Vitals (LCP, INP, CLS)
- **Lighthouse CI**: 100% pass rate on PRs
- **Bundle sizes**: 90%+ pages within target thresholds
- **User experience**: No performance complaints
- **Trend**: Stable or improving month-over-month

## Troubleshooting

### Common Performance Issues

#### Large LCP (> 4.0s)

**Causes:**
- Large unoptimized images
- Slow server response (TTFB)
- Render-blocking resources

**Solutions:**
- Optimize hero images (WebP, blur placeholder, priority loading)
- Enable ISR or SSG for static pages
- Preload critical resources

#### High INP (> 500ms)

**Causes:**
- Heavy JavaScript execution
- Long tasks blocking main thread
- Excessive event handlers

**Solutions:**
- Code split large components
- Debounce/throttle event handlers
- Use Web Workers for heavy computation

#### High CLS (> 0.25)

**Causes:**
- Images without dimensions
- Dynamic content injection
- Web fonts loading

**Solutions:**
- Always set image width/height
- Reserve space for dynamic content
- Use font-display: swap with fallback

#### Bundle Size Bloat

**Causes:**
- Large dependencies (e.g., moment.js, lodash)
- Importing entire libraries
- Duplicate dependencies

**Solutions:**
- Use lighter alternatives (date-fns vs moment)
- Import only needed functions
- Deduplicate with package manager

## Related Documentation

- [Lighthouse CI Integration](./lighthouse-ci.md)
- [Error Monitoring Strategy](../operations/error-monitoring-strategy.md)
- [Uptime Monitoring](../operations/uptime-monitoring-sentry.md)
- [Next.js Performance Optimization](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals](https://web.dev/vitals/)

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-19 | 1.0 | Initial performance monitoring strategy |

## Contact & Support

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Speed Insights:** Vercel Dashboard → Speed Insights
- **Internal Support:** `#engineering` Slack channel
- **Documentation:** This file

# Core Web Vitals Baseline Report

**Generated:** 2025-12-25
**Lighthouse Version:** 12.6.1

## Summary

This baseline establishes Core Web Vitals targets for dcyfr-labs. All measurements are median values from 3 Lighthouse runs per page.

### Core Web Vitals Targets (2025)

- **LCP (Largest Contentful Paint)**: <2.5s (good), 2.5-4s (needs improvement), >4s (poor)
- **INP (Interaction to Next Paint)**: <200ms (good), 200-500ms (needs improvement), >500ms (poor)
- **CLS (Cumulative Layout Shift)**: <0.1 (good), 0.1-0.25 (needs improvement), >0.25 (poor)

---

## Page: Homepage

### Core Web Vitals

| Metric | Value | Rating | Target |
|--------|-------|--------|--------|
| **LCP** | 3.79s | needs-improvement | <2.5s |
| **TTI** | 6.79s | needs-improvement | <3.8s |

### Additional Performance Metrics

| Metric | Value | Target |
|--------|-------|--------|
| FCP (First Contentful Paint) | 1.66s | <1.8s |
| TBT (Total Blocking Time) | 64ms | <200ms |
| Speed Index | 3.26s | <3.4s |

### Lighthouse Category Scores

| Category | Score | Target |
|----------|-------|--------|
| Performance | 86% | ≥90% |
| Accessibility | 100% | ≥95% |
| Best Practices | 96% | ≥85% |
| SEO | 92% | ≥90% |

---

## Page: /blog

### Core Web Vitals

| Metric | Value | Rating | Target |
|--------|-------|--------|--------|
| **LCP** | 7.44s | poor | <2.5s |
| **CLS** | 0.009 | good | <0.1 |
| **TTI** | 7.65s | poor | <3.8s |

### Additional Performance Metrics

| Metric | Value | Target |
|--------|-------|--------|
| FCP (First Contentful Paint) | 1.66s | <1.8s |
| TBT (Total Blocking Time) | 79ms | <200ms |
| Speed Index | 2.75s | <3.4s |

### Lighthouse Category Scores

| Category | Score | Target |
|----------|-------|--------|
| Performance | 75% | ≥90% |
| Accessibility | 100% | ≥95% |
| Best Practices | 96% | ≥85% |
| SEO | 100% | ≥90% |

---

## Page: /work

### Core Web Vitals

| Metric | Value | Rating | Target |
|--------|-------|--------|--------|
| **LCP** | 6.32s | poor | <2.5s |
| **CLS** | 0.003 | good | <0.1 |
| **TTI** | 6.32s | needs-improvement | <3.8s |

### Additional Performance Metrics

| Metric | Value | Target |
|--------|-------|--------|
| FCP (First Contentful Paint) | 1.52s | <1.8s |
| TBT (Total Blocking Time) | 179ms | <200ms |
| Speed Index | 1.98s | <3.4s |

### Lighthouse Category Scores

| Category | Score | Target |
|----------|-------|--------|
| Performance | 74% | ≥90% |
| Accessibility | 100% | ≥95% |
| Best Practices | 96% | ≥85% |
| SEO | 100% | ≥90% |

---

## Page: /about

### Core Web Vitals

| Metric | Value | Rating | Target |
|--------|-------|--------|--------|
| **LCP** | 3.64s | needs-improvement | <2.5s |
| **TTI** | 6.46s | needs-improvement | <3.8s |

### Additional Performance Metrics

| Metric | Value | Target |
|--------|-------|--------|
| FCP (First Contentful Paint) | 1.52s | <1.8s |
| TBT (Total Blocking Time) | 92ms | <200ms |
| Speed Index | 1.97s | <3.4s |

### Lighthouse Category Scores

| Category | Score | Target |
|----------|-------|--------|
| Performance | 89% | ≥90% |
| Accessibility | 98% | ≥95% |
| Best Practices | 96% | ≥85% |
| SEO | 100% | ≥90% |

---

## Page: /contact

### Core Web Vitals

| Metric | Value | Rating | Target |
|--------|-------|--------|--------|
| **LCP** | 3.78s | needs-improvement | <2.5s |
| **TTI** | 5.96s | needs-improvement | <3.8s |

### Additional Performance Metrics

| Metric | Value | Target |
|--------|-------|--------|
| FCP (First Contentful Paint) | 1.52s | <1.8s |
| TBT (Total Blocking Time) | 178ms | <200ms |
| Speed Index | 1.83s | <3.4s |

### Lighthouse Category Scores

| Category | Score | Target |
|----------|-------|--------|
| Performance | 86% | ≥90% |
| Accessibility | 100% | ≥95% |
| Best Practices | 96% | ≥85% |
| SEO | 100% | ≥90% |

---

## Page: /activity

### Core Web Vitals

| Metric | Value | Rating | Target |
|--------|-------|--------|--------|
| **LCP** | 6.61s | poor | <2.5s |
| **TTI** | 7.11s | needs-improvement | <3.8s |

### Additional Performance Metrics

| Metric | Value | Target |
|--------|-------|--------|
| FCP (First Contentful Paint) | 1.52s | <1.8s |
| TBT (Total Blocking Time) | 159ms | <200ms |
| Speed Index | 2.92s | <3.4s |

### Lighthouse Category Scores

| Category | Score | Target |
|----------|-------|--------|
| Performance | 74% | ≥90% |
| Accessibility | 98% | ≥95% |
| Best Practices | 96% | ≥85% |
| SEO | 100% | ≥90% |

---

## Recommendations

Based on the baseline measurements, focus on:

1. **LCP Optimization**: Reduce to <2.5s on all pages
   - Optimize image delivery (use WebP/AVIF)
   - Reduce render-blocking resources
   - Implement proper image lazy loading

2. **JavaScript Optimization**:
   - Reduce unused JavaScript
   - Code splitting for route-based chunks
   - Remove legacy JavaScript polyfills

3. **Accessibility Improvements**:
   - Fix heading order violations
   - Ensure label-content name matching
   - Add descriptive link text

4. **Performance Enhancements**:
   - Enable back/forward cache
   - Fix console errors
   - Add source maps for production

## Monitoring

Run Lighthouse CI on every deployment:

```bash
npm run lighthouse:ci
```

**Automated monitoring**: GitHub Actions runs Lighthouse CI on every PR and push to main/preview branches.

---

*Generated by Core Web Vitals analysis script*

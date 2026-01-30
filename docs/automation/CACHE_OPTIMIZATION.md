<!-- TLP:CLEAR -->

# CI/CD Cache Optimization & Performance Monitoring

**Status:** In Progress  
**Goal:** 30% CI pipeline reduction through build cache optimization  
**Baseline:** 52.3s build duration (Dec 14, 2025)  
**Target:** ~36.6s build duration

---

## Overview

This document tracks the CI/CD cache optimization initiative to reduce GitHub Actions pipeline execution time by leveraging efficient build caching strategies.

### Current Progress

- ✅ **Phase 1 Complete:** Parallel builds enabled in `next.config.ts`
- 🔄 **Phase 2 In Progress:** Bundle analysis & cache optimization
  - ✅ Basic build cache implementation
  - ✅ Enhanced perf-monitor workflow
  - ✅ Performance metrics tracking
  - 📌 Next: Cross-branch cache strategy refinement

---

## Architecture

### Build Cache Strategy

We use a **multi-layer caching approach** to maximize cache hits across different scenarios:

```yaml
Layers (in order of restoration):
1. Exact match: OS + package hash + version suffix
   → Most recent build with exact dependencies
2. Branch-specific fallback: OS + package hash
   → Any recent build with same dependencies
3. Cross-branch fallback: OS + version suffix
   → Useful for common dependency revisions
4. Generic fallback: OS + cache type
   → Worst case, at least OS-specific cache
```

### Implementation Details

**Next.js Build Cache** (`.next/cache` + `.next`):
```yaml
Primary Key:
  ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-build-v1

Restore Keys (fallback order):
  1. ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-build-v1-
  2. ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-
  3. ${{ runner.os }}-nextjs-build-v1-
  4. ${{ runner.os }}-nextjs-
```

**Node Modules Cache** (consistency across jobs):
```yaml
Primary Key:
  ${{ runner.os }}-node_modules-${{ hashFiles('package-lock.json') }}

Restore Keys:
  ${{ runner.os }}-node_modules-
```

---

## Monitoring & Metrics

### Performance Metrics Workflow

The `perf-monitor.yml` workflow collects comprehensive metrics:

**When:** 
- Manually via `workflow_dispatch`
- Daily at 06:00 UTC (when enabled)

**What It Measures:**
- Build duration (seconds)
- Next.js cache hit rate
- Node modules cache hit rate
- Commit SHA and branch
- Timestamps for correlation

**Output:** JSON artifact with historical data for trend analysis

### Analyzing Metrics

View performance trends:

```bash
# Last 7 days (default)
npm run perf:metrics

# Last 30 days
npm run perf:metrics:30d

# Custom period
npm run perf:metrics -- --days=14
```

**Output Example:**
```
============================================================
📊 Performance Metrics Analysis
============================================================

📈 Period: Last 7 days (5 runs)

⏱️  Build Duration:
  Average:  50.2s (baseline: 52.3s)
  Min:      48.1s
  Max:      52.8s
  Target:   36.6s (30% reduction)

🎯 Progress to Target:
  Improvement: +3.8%
  Progress:    18.5% toward goal

💾 Cache Hit Rates:
  Next.js Cache:    60.0% (3/5)
  Node Modules:     80.0% (4/5)
  Combined Average: 70.0%
  Target:           80.0%
```

---

## Optimization Strategies

### 1. Cache Key Strategy

**Problem:** Dependency changes invalidate entire cache  
**Solution:** Multi-tier fallback keys

Implementation in `test.yml`:
```yaml
restore-keys: |
  ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-build-v1-
  ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-
  ${{ runner.os }}-nextjs-build-v1-
  ${{ runner.os }}-nextjs-
```

**Expected Impact:** 80%+ cache hit rate after warmup

### 2. Cross-Branch Cache Reuse

**Problem:** PR branches can't reuse main branch cache  
**Solution:** Version suffix in key allows fallback

Current strategy:
- New branches inherit cache from any branch with same dependencies
- Primary key includes version (`-build-v1`) for invalidation control
- Restore keys enable progressive fallback

**Expected Impact:** Faster PR builds (~20-30% faster than cold start)

### 3. Parallel Build Processing

**Problem:** Single-core builds are slower  
**Solution:** Utilize all available CPU cores

Implemented in `next.config.ts`:
```typescript
experimental: {
  cpus: Math.max(1, require('os').cpus().length - 1),
}
```

**Expected Impact:** 25-35% faster builds on multi-core systems

### 4. Dependency Caching

**Problem:** npm install takes time even with cached node_modules  
**Solution:** Cache node_modules and reuse across jobs

Implementation in `test.yml`:
```yaml
- name: Cache node_modules
  uses: actions/cache/save@v4
  with:
    path: node_modules
    key: node-modules-${{ hashFiles('package-lock.json') }}-${{ github.run_id }}
```

**Expected Impact:** 5-10% time savings across jobs

---

## Known Issues & Limitations

### Issue 1: Cache Size Limits

**Problem:** GitHub has a 10GB cache size limit per repository  
**Status:** Monitor via `perf:metrics` output  
**Mitigation:** Implement cache retention policy

```yaml
retention-days: 7  # Keep only recent caches
```

### Issue 2: Cache Invalidation

**Problem:** Major dependencies changes might not benefit from cache  
**Status:** Expected behavior  
**Mitigation:** Use version suffixes (`-build-v1`) to manually invalidate

To force cache rebuild:
```bash
# Change version in workflows
-build-v1 → -build-v2
```

### Issue 3: Cross-Platform Differences

**Problem:** Linux cache not usable on macOS/Windows  
**Status:** Expected behavior  
**Mitigation:** Use `${{ runner.os }}` in key for OS-specific caching

---

## Performance Targets

| Metric | Baseline | Target | Status |
|--------|----------|--------|--------|
| Build Duration | 52.3s | ~36.6s | 🔄 In Progress |
| Next.js Cache Hit | N/A | 80%+ | 📊 Tracking |
| Node Cache Hit | N/A | 80%+ | 📊 Tracking |
| CI Pipeline Time | - | -30% | 🎯 Goal |

---

## Next Steps

### Phase 2.1: Cache Performance Analysis
- [ ] Enable `perf-monitor` daily schedule
- [ ] Collect 14 days of metrics
- [ ] Analyze cache hit patterns
- [ ] Identify bottlenecks

### Phase 2.2: Cache Strategy Refinement  
- [ ] Evaluate artifact-based caching for better control
- [ ] Consider Docker layer caching for containerized builds
- [ ] Test cross-branch cache reuse effectiveness

### Phase 3: Test Performance Optimization
- [ ] Configure Vitest parallel workers
- [ ] Add test-specific mocks
- [ ] Target &lt;2 min test suite execution

### Phase 4: Dependency Management
- [ ] Enable Dependabot auto-merge for patches
- [ ] Set up safe minor version updates
- [ ] Document dependency upgrade strategy

---

## Workflow Files

### perf-monitor.yml
- **Purpose:** Collect build performance metrics
- **Trigger:** Manual + Daily (06:00 UTC)
- **Outputs:** JSON metrics artifact
- **Status:** ✅ Enhanced (Dec 15, 2025)

### test.yml
- **Purpose:** Run unit, integration, E2E, and bundle tests
- **Cache Strategy:** Multi-tier fallback
- **Status:** ✅ Optimized (Dec 15, 2025)

### deploy.yml
- **Purpose:** Vercel deployment validation
- **Cache Strategy:** Inherited from build
- **Status:** ✅ Current

---

## Usage Guide

### Running Manual Performance Check

```bash
# Run perf-monitor workflow manually
gh workflow run perf-monitor.yml

# Check results
npm run perf:metrics
```

### Interpreting Metrics

**High next_cache_hit rate (>75%):**
- ✅ Build cache strategy working well
- ✅ Minimal unnecessary rebuilds
- Continue current strategy

**Low next_cache_hit rate (<50%):**
- ⚠️ Cache invalidation too aggressive
- ⚠️ Or restore-keys not working
- Check: package-lock.json changes, key strategy

**High node_cache_hit rate (>75%):**
- ✅ Dependency stability good
- ✅ Jobs reusing node_modules efficiently

**Low node_cache_hit rate (<50%):**
- ⚠️ Dependencies changing frequently
- ⚠️ Or npm ci clearing cache
- Review: dependency update frequency

### Forcing Cache Invalidation

To force a full rebuild (clear all caches):

1. Update cache version in workflow:
   ```yaml
   # Change from
   -build-v1
   # to
   -build-v2
   ```

2. Push and run workflow
3. This creates a new cache scope without fallback

---

## Monitoring Dashboard

Track performance over time:

```bash
# Generate performance report
npm run perf:metrics:30d

# View trend in REPORTS_DIR/performance/metrics-history.json
cat reports/performance/metrics-history.json
```

---

## References

- [Next.js Build Cache](https://nextjs.org/docs/app/api-reference/next-config-js/onDemandEntries)
- [GitHub Actions Caching](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- Parallel Processing

---

**Last Updated:** December 15, 2025  
**Maintainer:** DCYFR Labs  
**Related Issues:** Phase 1: Performance Optimization

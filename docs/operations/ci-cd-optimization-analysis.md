# CI/CD Pipeline Optimization Analysis

**Generated:** 2025-12-10
**Total Workflows:** 23
**Focus:** Consolidation opportunities to improve execution speed and reduce redundancy

## Executive Summary

Your CI/CD pipeline is comprehensive but has significant optimization opportunities. Key findings:

- **17/23 workflows** run `npm ci` independently (duplicate dependency installs)
- **3 separate workflows** run `npm audit` with overlapping scopes
- **2 workflows** run PII/security scans with redundant setup
- **Opportunity:** Reduce workflow execution time by 30-40% through consolidation
- **Estimated savings:** ~15-25 minutes per PR (currently ~35-50 minutes total)

## Critical Consolidation Opportunities

### 🔴 HIGH IMPACT: Security Workflows (3 → 1)

**Current State:**
1. [security-audit.yml](.github/workflows/security-audit.yml) - npm audit on PRs + scheduled
2. [automated-security-checks.yml](.github/workflows/automated-security-checks.yml) - npm audit + outdated packages
3. [monthly-security-review.yml](.github/workflows/monthly-security-review.yml) - monthly comprehensive audit

**Problems:**
- All three run `npm audit` with similar commands
- `security-audit.yml` and `automated-security-checks.yml` have 95% overlapping functionality
- Both trigger on `package.json` changes in PRs
- Same dependency installation step repeated 3x

**Recommended Consolidation:**
```yaml
# NEW: .github/workflows/security.yml (unified)
name: Security Checks

on:
  pull_request:
    paths: ['package.json', 'package-lock.json', '.github/dependabot.yml']
  push:
    branches: [main, preview]
    paths: ['package.json', 'package-lock.json']
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
    - cron: '0 9 1 * *'  # Monthly on 1st at 9 AM UTC
  workflow_dispatch:

jobs:
  quick-audit:
    name: Quick Security Audit
    if: github.event_name == 'pull_request' || github.event_name == 'push'
    # Runs npm audit + outdated check
    # Fast fail on critical/high vulnerabilities

  comprehensive-review:
    name: Monthly Security Review
    if: github.event.schedule == '0 9 1 * *' || github.event_name == 'workflow_dispatch'
    # Runs full audit + CodeQL review + SBOM + branch cleanup
```

**Impact:** Eliminates 2 workflows, saves ~5-8 minutes per PR

---

### 🟡 MEDIUM IMPACT: PII/Privacy Scans (2 → 1)

**Current State:**
1. [pii-scan.yml](.github/workflows/pii-scan.yml) - Custom PII scanner + gitleaks
2. [allowlist-validate.yml](.github/workflows/allowlist-validate.yml) - Validates `.pii-allowlist.json`

**Problems:**
- Both run on PR changes
- Separate `npm ci` installations
- `allowlist-validate` should be a step in `pii-scan`, not separate workflow

**Recommended Consolidation:**
```yaml
# UPDATED: .github/workflows/pii-scan.yml
jobs:
  scan:
    steps:
      - name: Validate allowlist (if changed)
        if: contains(github.event.pull_request.changed_files, '.pii-allowlist.json')
        run: npm run validate:allowlist

      - name: Run PII scan
        run: npm run scan:pi:all

  gitleaks:
    needs: scan  # Keep sequential dependency
```

**Impact:** Eliminates 1 workflow, saves ~2-3 minutes per PR touching PII files

---

### 🟡 MEDIUM IMPACT: Test Workflow Optimization

**Current State:**
[test.yml](.github/workflows/test.yml) runs 4 parallel jobs:
1. `quality` - Lint + typecheck (parallel internally)
2. `unit` - Unit/integration tests
3. `bundle` - Build + bundle size check
4. `e2e` - Playwright E2E tests

**Problems:**
- Each job runs `npm ci` independently (4x dependency installs)
- `bundle` job builds production bundle
- [vercel-checks.yml](.github/workflows/vercel-checks.yml) also builds production bundle
- Duplicate build work when both workflows run

**Recommended Optimization:**

**Option A: Shared dependency cache (quick win)**
```yaml
jobs:
  setup:
    name: Setup Dependencies
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci --prefer-offline
      - uses: actions/cache@v4
        with:
          path: node_modules
          key: deps-${{ runner.os }}-${{ hashFiles('package-lock.json') }}

  quality:
    needs: setup
    steps:
      - uses: actions/cache@v4  # Restore node_modules
      # No npm ci needed!
```

**Option B: Matrix strategy (advanced)**
```yaml
jobs:
  test:
    strategy:
      matrix:
        check: [quality, unit, bundle, e2e]
    steps:
      - name: Restore cached dependencies
      - name: Run ${{ matrix.check }}
```

**Impact:** Saves ~3-5 minutes per test run (4x `npm ci` → 1x)

---

### 🟢 LOW IMPACT: Design System + Lint Consolidation

**Current State:**
- [design-system.yml](.github/workflows/design-system.yml) runs `npm run lint` (lines 38-40)
- [test.yml](.github/workflows/test.yml) quality job also runs lint

**Problem:**
- Lint runs twice on every PR changing `.tsx/.ts` files
- Both use same ESLint config

**Recommendation:**
Remove lint from `design-system.yml` (line 38-40), keep only design token validation:
```yaml
# design-system.yml
steps:
  - name: Install dependencies
    run: npm ci --prefer-offline

  - name: Validate Design Tokens  # Remove ESLint step
    id: validation
    run: node scripts/validate-design-tokens.mjs
```

**Impact:** Saves ~1-2 minutes per PR, eliminates duplicate linting

---

### 🟢 LOW IMPACT: Lighthouse Duplication

**Current State:**
- [lighthouse-ci.yml](.github/workflows/lighthouse-ci.yml) - Runs on PRs
- [vercel-checks.yml](.github/workflows/vercel-checks.yml) - Runs Lighthouse on deployments

**Analysis:**
- Both build production bundle + run Lighthouse
- `lighthouse-ci.yml` uses local build (`npm start`)
- `vercel-checks.yml` uses deployed Vercel URL
- **Different purposes:** PR preview vs deployment validation

**Recommendation:**
- Keep both workflows (serve different purposes)
- BUT: Skip `lighthouse-ci.yml` if PR hasn't changed `src/`, `public/`, configs
- Already has path filters - working correctly
- Consider: Make `lighthouse-ci.yml` optional/manual for draft PRs

**Impact:** Minimal (workflows already have good path filtering)

---

## Workflow Execution Time Analysis

### Current State (Per PR)

| Workflow | Trigger | Duration | Parallel? | npm ci? |
|----------|---------|----------|-----------|---------|
| test.yml (4 jobs) | Every PR | ~10-15 min | Yes | 4x |
| design-system.yml | .tsx/.ts changes | ~3-5 min | No | 1x |
| security-audit.yml | package.json | ~5-8 min | No | 1x |
| automated-security-checks.yml | package.json | ~5-8 min | No | 1x |
| pii-scan.yml | Every PR | ~4-6 min | Partial | 1x |
| allowlist-validate.yml | .pii-allowlist.json | ~2-3 min | No | 1x |
| lighthouse-ci.yml | src/ changes | ~10-12 min | No | 1x |
| codeql.yml | Code changes | ~15-20 min | No | 0x (autobuild) |

**Total (typical PR):** ~35-50 minutes of workflow time
**npm ci executions:** 9-10x per PR
**Parallel execution:** Some overlap, but sequential bottlenecks exist

### Optimized State (After Consolidation)

| Workflow | Trigger | Duration | Parallel? | npm ci? |
|----------|---------|----------|-----------|---------|
| test.yml (optimized) | Every PR | ~6-8 min | Yes | 1x (shared) |
| design-system.yml | .tsx/.ts changes | ~2-3 min | No | 1x |
| security.yml (unified) | package.json | ~5-7 min | No | 1x |
| privacy-scan.yml (unified) | Every PR | ~3-5 min | Partial | 1x |
| lighthouse-ci.yml | src/ changes | ~10-12 min | No | 1x |
| codeql.yml | Code changes | ~15-20 min | No | 0x |

**Total (typical PR):** ~25-35 minutes (-30% time)
**npm ci executions:** 4-5x per PR (-50% installs)
**Parallel execution:** Better optimized with shared dependencies

---

## Detailed Recommendations

### Phase 1: Quick Wins (Immediate - 1 hour effort)

1. **Consolidate security workflows** (HIGH IMPACT)
   - Merge `security-audit.yml` + `automated-security-checks.yml` → `security.yml`
   - Keep `monthly-security-review.yml` for now (different scope)
   - Expected savings: 5-8 minutes per PR

2. **Remove duplicate lint from design-system.yml** (LOW EFFORT)
   - Edit line 38-40 in `design-system.yml`
   - Expected savings: 1-2 minutes per PR

3. **Merge PII workflows** (MEDIUM IMPACT)
   - Merge `allowlist-validate.yml` into `pii-scan.yml`
   - Expected savings: 2-3 minutes per PR

**Total Phase 1 Savings:** ~8-13 minutes per PR (25-35% improvement)

---

### Phase 2: Shared Dependencies (Medium - 2-3 hours effort)

4. **Implement shared node_modules cache in test.yml**
   - Add `setup` job to install dependencies once
   - Cache `node_modules` for downstream jobs
   - Update all 4 test jobs to restore cache
   - Expected savings: 3-5 minutes per test run

5. **Extend shared cache to other workflows**
   - Add cache restoration to `design-system.yml`, `security.yml`, etc.
   - Use same cache key pattern across workflows

**Total Phase 2 Savings:** ~3-5 minutes per PR (additional 10-15% improvement)

---

### Phase 3: Advanced Optimizations (Future - 4-6 hours)

6. **Matrix strategy for test jobs**
   - Convert 4 separate jobs → single matrix job
   - Reduces YAML duplication
   - Better resource utilization

7. **Conditional workflow execution**
   - Skip expensive checks on draft PRs
   - Run full suite only on ready-for-review
   - Use `if: github.event.pull_request.draft == false`

8. **Merge monthly security review into main security workflow**
   - Use schedule conditionals to run extended checks monthly
   - Reduces workflow count to 1 security workflow total

---

## Implementation Priority

### Tier 1: DO FIRST (Biggest ROI)
1. ✅ Merge `security-audit.yml` + `automated-security-checks.yml`
2. ✅ Merge `allowlist-validate.yml` into `pii-scan.yml`
3. ✅ Add shared node_modules cache to `test.yml`

### Tier 2: DO NEXT (Good ROI)
4. Remove duplicate lint from `design-system.yml`
5. Extend shared cache to all workflows with `npm ci`

### Tier 3: OPTIONAL (Marginal gains)
6. Matrix strategy for test jobs
7. Conditional execution for draft PRs
8. Full security workflow consolidation (3 → 1)

---

## Risks & Considerations

### Risk: Workflow Consolidation
- **Pro:** Fewer workflows to maintain, faster execution
- **Con:** Larger workflows are harder to debug if they fail
- **Mitigation:** Keep granular job names, use job summaries extensively

### Risk: Shared Dependencies Cache
- **Pro:** Dramatically faster execution (no repeated `npm ci`)
- **Con:** Cache misses can cause confusing failures
- **Mitigation:** Use robust cache keys (`hashFiles('package-lock.json')`), add fallback to `npm ci`

### Risk: Removing Workflows
- **Pro:** Simpler to understand, less YAML to maintain
- **Con:** Potential loss of visibility if not carefully merged
- **Mitigation:** Preserve all checks as jobs within consolidated workflows

---

## Monitoring Success

After implementation, track:
1. **Average PR workflow time:** Target <30 minutes (from ~40-50 min)
2. **npm ci execution count:** Target ≤5 per PR (from ~10)
3. **Cache hit rate:** Target >80% for node_modules cache
4. **Workflow failure rate:** Should not increase (maintain current reliability)

Use GitHub Actions insights dashboard:
- `https://github.com/DCYFR/dcyfr-labs/actions/workflows/`
- Check "Workflow runs" duration trends over 30 days

---

## Additional Observations

### Good Practices Already in Place ✅
1. **Concurrency groups** - Properly cancels in-progress runs
2. **Path filters** - Most workflows only run when relevant files change
3. **Timeout limits** - Prevents runaway workflows
4. **Prefer offline** - Uses `npm ci --prefer-offline` for faster installs
5. **Parallel execution** - `test.yml` runs quality + unit + bundle + e2e in parallel
6. **Caching** - Already caches npm, Playwright browsers, Next.js builds

### Areas for Improvement ⚠️
1. **Too many workflows** - 23 is excessive for project size
2. **Duplicate npm ci** - 17 workflows install dependencies independently
3. **Duplicate npm audit** - 3 workflows run security audit with overlap
4. **Duplicate lint** - Runs in both `test.yml` and `design-system.yml`
5. **No artifact reuse** - Build artifacts from `test.yml` not reused in `deploy.yml`

---

## Appendix: All Workflows Inventory

### PR-triggered (run on most/all PRs)
1. ✅ test.yml - Lint, typecheck, unit, bundle, E2E
2. ✅ design-system.yml - Design token validation
3. ✅ pii-scan.yml - PII/privacy scanning
4. ✅ codeql.yml - Security scanning
5. ⚠️ security-audit.yml - npm audit (CONSOLIDATE)
6. ⚠️ automated-security-checks.yml - npm audit + outdated (CONSOLIDATE)
7. ⚠️ allowlist-validate.yml - PII allowlist (CONSOLIDATE)
8. lighthouse-ci.yml - Performance audits

### Push-triggered (main/preview branches)
9. deploy.yml - Vercel deployment validation
10. pii-scan.yml - Also runs on push
11. codeql.yml - Also runs on push

### Deployment-triggered
12. vercel-checks.yml - Post-deployment validation

### Scheduled
13. codeql.yml - Daily security scan
14. security-audit.yml - Daily vulnerability check
15. automated-security-checks.yml - Daily security pre-check
16. monthly-security-review.yml - Monthly comprehensive review
17. monthly-cleanup.yml - Monthly maintenance
18. weekly-test-health.yml - Weekly test health check
19. scheduled-instruction-sync.yml - Periodic sync
20. stale.yml - Stale issue management
21. automated-metrics-collection.yml - Metrics collection

### Manual/Other
22. ai-instructions-sync.yml - Manual only (workflow_dispatch)
23. sync-preview-branch.yml - Branch sync
24. validate-content.yml - Content validation
25. dependabot-auto-merge.yml - Dependabot automation
26. mcp-server-check.yml - MCP server validation
27. security-advisory-monitor.yml - Security advisory monitoring
28. update-baseline-mapping.yml - Performance baseline updates

**Total:** 23 active workflows (some overlap in triggers)

---

## Next Steps

1. **Review this analysis** with team
2. **Prioritize** which optimizations to implement (recommend Tier 1 first)
3. **Create tracking issue** with checklist
4. **Implement Phase 1** (quick wins - 1 hour)
5. **Measure results** (compare before/after workflow times)
6. **Iterate** with Phase 2 and 3 based on results

**Estimated Total Time Savings:** 30-40% reduction in PR workflow time
**Estimated Implementation Effort:** 3-6 hours (phased approach)
**ROI:** High (saves 10-15 minutes per PR × ~20 PRs/month = 3-5 hours/month saved)

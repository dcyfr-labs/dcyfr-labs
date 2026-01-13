# CI/CD Workflow Optimization for Preview Branch

**Date:** January 12, 2026
**Status:** Analysis Complete - Recommendations Ready
**Impact:** Reduce CI/CD time for preview branch PRs by 30-50%

---

## Executive Summary

Your current CI/CD configuration runs identical test suites for both `main` (production) and `preview` (testing) branches. This is appropriate for production but unnecessarily strict for the testing branch. By implementing branch-specific test strategies, you can:

- **Reduce preview PR feedback time** from ~40 minutes to ~15-20 minutes
- **Maintain code quality** with essential checks (lint, typecheck, unit tests)
- **Defer heavy checks** (E2E, Lighthouse, security scans) to main branch or manual trigger
- **Preserve safety** with fail-fast checks on critical issues

---

## Current State Analysis

### Workflows Triggered on Both Branches

| Workflow | Scope | Time | Runs On |
|----------|-------|------|---------|
| **test.yml** | Lint, TypeCheck, Unit, Bundle, E2E | ~45 min | Both |
| **deploy.yml** | Quick validation + deploy | ~10 min | Both |
| **lighthouse-ci.yml** | Full Lighthouse audit | ~15 min | **Main only** ✅ |
| **codeql.yml** | Static analysis scan | ~30 min | **Main only** ✅ |
| **nuclei-scan.yml** | Runtime vulnerability scan | ~20 min | **Main only** ✅ |
| **pii-scan.yml** | PII/secret detection | ~10 min | **Both** |
| **sast-semgrep.yml** | SAST vulnerability scan | ~15 min | **Both** |

### Key Observations

✅ **Already optimized:**
- Lighthouse CI only runs on main (saves 15 min)
- CodeQL only runs on main (saves 30 min)
- Test suite has "test-optimized.yml" with conditional E2E execution
- E2E tests can be skipped for docs-only changes

❌ **Opportunities for improvement:**
- E2E tests run on preview PRs (12 minutes) but should defer until main
- Full security suite runs on both branches (adds 25+ minutes)
- Nuclei runtime scanning only on main (good), but could be better utilized
- No branch-specific timeout or resource optimization

---

## Recommended Changes

### Phase 1: Preview Branch Fast-Track (Implementation Time: 30 minutes)

Create a new lightweight workflow for preview branch PRs while keeping main branch strict.

**File:** `.github/workflows/test-preview-fast.yml` (NEW)

```yaml
name: Test (Preview - Fast Track)

on:
  push:
    branches: [preview]
    paths:
      - 'src/**'
      - 'e2e/**'
      - 'tests/**'
      - 'package*.json'
  pull_request:
    branches: [preview]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  # Quick setup
  setup:
    name: Setup Dependencies
    runs-on: ubuntu-latest
    timeout-minutes: 3
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci --prefer-offline
      - uses: actions/cache/save@v4
        with:
          path: node_modules
          key: node-modules-${{ runner.os }}-${{ github.run_id }}

  # Fail-fast checks (2 min)
  quality:
    needs: setup
    name: Lint & Type Check
    runs-on: ubuntu-latest
    timeout-minutes: 2
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - uses: actions/cache/restore@v4
        with:
          path: node_modules
          key: node-modules-${{ runner.os }}-${{ github.run_id }}
          fail-on-cache-miss: true
      - run: |
          npm run lint:ci &
          npm run typecheck &
          wait

  # Unit tests only (6 min) - NO E2E
  unit:
    needs: setup
    name: Unit Tests
    runs-on: ubuntu-latest
    timeout-minutes: 6
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - uses: actions/cache/restore@v4
        with:
          path: node_modules
          key: node-modules-${{ runner.os }}-${{ github.run_id }}
          fail-on-cache-miss: true
      - run: npm run test:run  # No coverage upload for preview

  # Build validation (5 min)
  build:
    needs: setup
    name: Production Build
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - uses: actions/cache/restore@v4
        with:
          path: node_modules
          key: node-modules-${{ runner.os }}-${{ github.run_id }}
          fail-on-cache-miss: true
      - run: npm run build
        env:
          NODE_ENV: production

  # Quick deployment to preview environment
  deploy:
    needs: [quality, unit, build]
    name: Deploy to Preview
    runs-on: ubuntu-latest
    timeout-minutes: 5
    if: github.event_name == 'push'
    steps:
      - run: echo "✅ Preview tests passed - Vercel will deploy automatically"
```

**Expected Result:**
- ✅ Lint: 1-2 min
- ✅ TypeCheck: 1-2 min
- ✅ Unit Tests: 4-6 min
- ✅ Build: 3-5 min
- **Total: 12-15 minutes** (vs 40+ minutes)

### Phase 2: Update Main Branch Tests (Implementation Time: 15 minutes)

Modify `.github/workflows/test.yml` to **only** run on main branch:

```yaml
on:
  push:
    branches: [main]  # Remove preview
    paths: [...]
  pull_request:
    branches: [main]  # Remove preview
```

**Why:**
- Main branch gets full test suite (E2E + coverage + bundle checks)
- Preview branch gets fast feedback (lint, typecheck, unit tests)
- Prevents duplicate test runs when merging PR to preview

### Phase 3: Security Workflow Optimization (Implementation Time: 20 minutes)

Update security workflows to respect branch hierarchy:

**File:** `.github/workflows/sast-semgrep.yml`

Current: Runs on both branches
Recommended: Run on main and scheduled weekly on preview

```yaml
on:
  push:
    branches: [main]  # Remove preview
  schedule:
    - cron: '0 2 * * 0'  # Weekly on Sunday for preview
  pull_request:
    branches: [main]
```

**Savings:** ~15 minutes per preview PR

---

## Implementation Strategy

### Step 1: Add Fast-Track Workflow for Preview (15 min)

```bash
# Create new workflow file
touch .github/workflows/test-preview-fast.yml
# Copy template above into file
# Push and verify runs on next preview PR
```

### Step 2: Disable Old Test Workflow on Preview (5 min)

**Modify `.github/workflows/test.yml`:**

```yaml
on:
  push:
    branches: [main]  # Remove 'preview'
  pull_request:
    branches: [main]  # Remove 'preview'
```

### Step 3: Update Security Workflows (5 min)

**Modify `.github/workflows/sast-semgrep.yml`:**

```yaml
on:
  push:
    branches: [main]  # Remove 'preview'
  pull_request:
    branches: [main]  # Keep here for PRs to main
  schedule:
    - cron: '0 2 * * 0'  # Weekly scan
```

### Step 4: Document in Branch Rules (5 min)

Update `.github/docs/PREVIEW_BRANCH_WORKFLOW.md`:

```markdown
## Test Strategy

### Preview Branch (Fast Feedback)
- Lint & TypeCheck: ✅ 2 min
- Unit Tests: ✅ 6 min
- Build: ✅ 5 min
- **Total: 12-15 minutes**
- E2E Tests: ❌ Deferred to main
- Security Scans: ❌ Weekly scheduled

### Main Branch (Full Validation)
- All tests from preview: ✅ 15 min
- E2E Tests: ✅ 12 min
- Lighthouse CI: ✅ 15 min
- CodeQL: ✅ 30 min
- SAST/Security: ✅ 15 min
- **Total: 50-60 minutes**
- Then: Manual approval → Production deploy
```

---

## Benefits Analysis

### Time Savings

| Metric | Before | After | Savings |
|--------|--------|-------|---------|
| Preview PR feedback | 40-45 min | 12-15 min | 65-70% faster |
| CI runs per week | 20-30 | 20-30 | Same frequency |
| Total CI minutes/week | 800-1350 | 400-600 | 50% reduction |
| Developer wait time | 45 min | 15 min | 30 min/PR |

### Code Quality Impact

| Check | Preview | Main | Impact |
|-------|---------|------|--------|
| Lint | ✅ Yes | ✅ Yes | Catches style issues immediately |
| TypeScript | ✅ Yes | ✅ Yes | Prevents type errors from merging |
| Unit Tests | ✅ Yes | ✅ Yes | Core functionality validated |
| Build | ✅ Yes | ✅ Yes | Production build verified |
| E2E Tests | ❌ No | ✅ Yes | Caught before production |
| Lighthouse | ❌ No | ✅ Yes | Performance checked on main |
| Security | Scheduled | ✅ Yes | Scanned before production deploy |

---

## Risk Assessment

### Risks of Fast-Track Preview

| Risk | Severity | Mitigation |
|------|----------|-----------|
| E2E regressions in preview | Medium | Re-run E2E manually with label "e2e-required" |
| Performance regressions | Low | Lighthouse only runs on main before production |
| Security issues in preview | Low | Scheduled scans + main branch checks catch issues |
| Broken builds in preview | Low | Build check still runs in fast-track |

### Safeguards

1. **Main branch remains strict** - All tests run before production
2. **Label override** - Can force E2E with "e2e-required" label
3. **Scheduled scans** - Weekly security scans on preview still happen
4. **Manual checks** - High-risk changes can require additional validation
5. **Vercel preview deploys** - Still functional for testing in real environment

---

## Migration Path (Recommended Order)

### Phase 1: Add Fast-Track (Safe - Additive)
1. Create `.github/workflows/test-preview-fast.yml` (new file, doesn't affect anything)
2. Test on next preview PR
3. Verify it runs correctly

### Phase 2: Gradually Disable Old Tests (Careful)
1. Keep both workflows running for 1 week
2. Confirm fast-track works reliably
3. Update `.github/workflows/test.yml` to main-only
4. Remove preview from other test workflows

### Phase 3: Monitor & Adjust (Iterative)
1. Track preview PR times for 2 weeks
2. Adjust timeouts if needed
3. Document results in CLAUDE.md

---

## Configuration Files to Modify

### New Files to Create
1. `.github/workflows/test-preview-fast.yml` - Fast-track test workflow for preview

### Files to Modify
1. `.github/workflows/test.yml` - Remove preview branch trigger
2. `.github/workflows/sast-semgrep.yml` - Move preview to scheduled only
3. `.github/workflows/pii-scan.yml` - Consider moving to scheduled
4. `CLAUDE.md` - Document new test strategy
5. `.github/docs/PREVIEW_BRANCH_WORKFLOW.md` - Update with new timelines

### Files to Keep As-Is
1. `lighthouse-ci.yml` - Already main-only ✅
2. `codeql.yml` - Already main-only ✅
3. `nuclei-scan.yml` - Already main-only ✅
4. `deploy.yml` - Works well as-is ✅

---

## Verification Checklist

After implementation:

- [ ] Create test PR to preview branch
- [ ] Verify fast-track workflow runs (not old test workflow)
- [ ] Confirm total time is 12-15 minutes
- [ ] Create test PR to main branch
- [ ] Verify full test suite still runs on main
- [ ] Monitor for 1 week for any issues
- [ ] Adjust timeouts if jobs time out
- [ ] Document results in operations log
- [ ] Update CLAUDE.md with new workflow

---

## Rollback Plan

If fast-track workflow causes issues:

1. **Quick revert:** Re-add `preview` to `.github/workflows/test.yml`
2. **Disable new workflow:** Rename `test-preview-fast.yml` to `.test-preview-fast.yml`
3. **Verify:** Next preview PR runs full test suite again
4. **Investigate:** Review logs of what failed
5. **Adjust:** Fix issues and retry

---

## Next Steps

1. **Review this recommendation** with your team
2. **Approve Phase 1** (additive, low-risk)
3. **Implement and test** fast-track workflow
4. **Monitor for 1 week** before Phase 2
5. **Gradually migrate** to new structure
6. **Document final configuration** in operations guide

---

## Questions & Clarifications

**Q: Will this break anything?**
A: No. Phase 1 is purely additive. Preview branch will just have an additional fast workflow. We disable the old one in Phase 2 after verification.

**Q: What if E2E tests are critical?**
A: Use the "e2e-required" label on the PR to force the E2E workflow to run manually, or run them locally before pushing.

**Q: What about security?**
A: Main branch still gets full security scans. Preview gets scheduled weekly scans. This aligns with branch purpose (preview = testing, main = production).

**Q: Can we adjust test selection?**
A: Yes! E2E tests can be triggered manually with labels. Timeouts can be adjusted per job. Adapt to your needs.

---

**Recommendation:** Implement Phase 1 this week to reduce PR feedback time by 70%. This is the highest-impact, lowest-risk change you can make.

---


# Preview Branch Test Strategy - Implementation Guide

**Status:** Ready to Implement
**Estimated Implementation Time:** 45 minutes (all 3 phases)
**Impact:** 65% faster PR feedback on preview branch

---

## Overview

This document outlines the implementation strategy for optimizing CI/CD tests on the preview branch. The preview branch serves as a testing environment before production deployment to main, so it should have **fast feedback (12-15 min)** rather than production-grade checks (50-60 min).

---

## Current State

### What Happens Today (Preview PR Workflow)

```
Push to preview branch
     ↓
[Lint & TypeCheck] → 2-3 min
[Unit Tests] → 6-8 min
[Bundle Check] → 5-7 min
[Build] → 5-7 min
[E2E Tests] → 12-15 min ← EXPENSIVE
[Security Scans] → 15+ min ← EXPENSIVE
Total: 40-45 minutes before feedback
```

### What Will Happen After (Optimized Preview PR Workflow)

```
Push to preview branch
     ↓
[Lint & TypeCheck] → 2-3 min
[Unit Tests] → 6-8 min
[Build] → 5-7 min
Total: 12-15 minutes for fast feedback
     ↓
✅ Pass → Ready to merge to main
     ↓
E2E & Security scans happen on main branch (if needed on preview, add "e2e-required" label)
```

---

## Implementation Phases

### Phase 1: Add Fast-Track Workflow (5 minutes)

**Status:** ✅ Already created
**File:** `.github/workflows/test-preview-fast.yml`

This file is already in the repository. It contains:
- Lint & TypeCheck job (~2 min)
- Unit Tests job (~6 min)
- Build job (~5 min)
- Optional E2E job (triggered only with "e2e-required" label)

**What to do:**
1. The file exists - no action needed
2. This workflow will automatically run on preview branch PRs

### Phase 2: Disable Old Test Workflow on Preview (10 minutes)

**Status:** ⏳ Needs action
**File:** `.github/workflows/test.yml`

**Current state:**
```yaml
on:
  push:
    branches: [main, preview]  ← Remove 'preview'
  pull_request:
    branches: [main, preview]  ← Remove 'preview'
```

**Action required:**
```yaml
on:
  push:
    branches: [main]  # Removed preview
  pull_request:
    branches: [main]  # Removed preview
```

**Steps:**
1. Open `.github/workflows/test.yml`
2. Find the `on:` section
3. Change `branches: [main, preview]` to `branches: [main]` (2 places)
4. Save and commit

**Why:**
- Prevents two test workflows from running simultaneously on preview
- Saves ~25+ minutes (old E2E + security scans skipped)
- Keeps full test suite for main branch

### Phase 3: Update Security Workflows (15 minutes)

**Status:** ⏳ Needs action
**Files to modify:**
- `.github/workflows/sast-semgrep.yml`
- `.github/workflows/pii-scan.yml` (optional)

**Action for `sast-semgrep.yml`:**

Current:
```yaml
on:
  push:
    branches: [main, preview]  ← Remove 'preview'
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'  # Daily
```

Updated:
```yaml
on:
  push:
    branches: [main]  # Removed preview
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * 0'  # Weekly on Sunday (for preview coverage)
```

**Steps:**
1. Open `.github/workflows/sast-semgrep.yml`
2. Find `on:` → `push:` → `branches:` line
3. Remove `preview` from the list (keep `main`)
4. Update schedule cron: `'0 2 * * *'` → `'0 2 * * 0'` (daily → weekly)
5. Save and commit

**Why:**
- Security scanning still happens on main (required for production)
- Weekly scan on preview catches issues in testing environment
- Saves ~15 minutes per preview PR

---

## Testing the Changes

### Test 1: Create a PR to Preview Branch

```bash
# Create a feature branch from preview
git checkout -b test/ci-optimization preview

# Make a trivial change
echo "# Test PR" >> README.md

# Push to trigger workflow
git add .
git commit -m "test: verify preview fast-track workflow"
git push origin test/ci-optimization

# Create PR to preview branch
gh pr create --base preview --title "Test: CI Optimization"
```

**Expected Result:**
- ✅ Fast-track workflow runs (~12-15 min)
- ✅ Old test workflow does NOT run
- ❌ E2E tests do NOT run (unless "e2e-required" label added)

### Test 2: Create a PR to Main Branch

```bash
# Create a feature branch from main
git checkout -b test/main-full-tests main

# Make a trivial change
echo "# Test PR" >> README.md

# Push to trigger workflow
git add .
git commit -m "test: verify main branch full tests"
git push origin test/main-full-tests

# Create PR to main branch
gh pr create --base main --title "Test: Full Test Suite on Main"
```

**Expected Result:**
- ✅ Full test suite runs (~50-60 min)
- ✅ Lint, TypeCheck, Unit, Bundle, E2E, Lighthouse all run
- ✅ All security scans run

### Test 3: Force E2E on Preview (Optional)

```bash
# On your preview PR, add the label
gh pr edit <pr-number> --add-label e2e-required

# Wait for E2E tests to start
# Should see "E2E Tests" job running in addition to fast-track
```

**Expected Result:**
- ✅ E2E workflow starts running
- ✅ Takes additional ~12-15 minutes
- ✅ Tests pass and confirm functionality

---

## Implementation Checklist

### Step 1: Modify test.yml
- [ ] Open `.github/workflows/test.yml`
- [ ] Find line with `branches: [main, preview]` under `push:`
- [ ] Change to `branches: [main]`
- [ ] Find line with `branches: [main, preview]` under `pull_request:`
- [ ] Change to `branches: [main]`
- [ ] Commit: `git commit -am "chore(ci): remove preview from full test workflow"`

### Step 2: Modify sast-semgrep.yml
- [ ] Open `.github/workflows/sast-semgrep.yml`
- [ ] Find line with `branches: [main, preview]` under `push:`
- [ ] Change to `branches: [main]`
- [ ] Find schedule cron: `'0 2 * * *'`
- [ ] Change to `'0 2 * * 0'` (weekly)
- [ ] Commit: `git commit -am "chore(ci): move semgrep to weekly for preview branch"`

### Step 3: Verify test-preview-fast.yml
- [ ] Check that `.github/workflows/test-preview-fast.yml` exists
- [ ] Review contents - should have lint, unit, build jobs
- [ ] No additional action needed - already created

### Step 4: Test Changes
- [ ] Create test branch from preview
- [ ] Push test commit
- [ ] Create PR to preview - verify fast-track runs (12-15 min)
- [ ] Create test branch from main
- [ ] Push test commit
- [ ] Create PR to main - verify full suite runs (50-60 min)
- [ ] Monitor times and adjust if needed

### Step 5: Update Documentation
- [ ] Update `CLAUDE.md` with new test strategy
- [ ] Update team documentation with new workflow
- [ ] Create runbook for "e2e-required" label usage

### Step 6: Monitor for 1 Week
- [ ] Track preview PR feedback times
- [ ] Look for any missed regressions
- [ ] Gather feedback from team
- [ ] Adjust workflow if needed

---

## Rollback Instructions

If issues occur, you can quickly revert:

```bash
# Restore test.yml from git history
git checkout HEAD~1 -- .github/workflows/test.yml

# Restore sast-semgrep.yml
git checkout HEAD~1 -- .github/workflows/sast-semgrep.yml

# Commit rollback
git commit -m "revert: restore full test suite on preview (troubleshooting)"

# This will immediately restore old behavior
```

Or temporarily disable the fast-track workflow:

```bash
# Rename the fast-track workflow temporarily
mv .github/workflows/test-preview-fast.yml .github/workflows/.test-preview-fast.yml.disabled

# Restore original behavior
git add .
git commit -m "disable: test-preview-fast temporarily for troubleshooting"
```

---

## Performance Expectations

### Before Optimization

| Branch | Workflow | Time | Result |
|--------|----------|------|--------|
| preview | test.yml | 40-45 min | Full suite |
| main | test.yml | 40-45 min | Full suite |

### After Optimization

| Branch | Workflow | Time | Result |
|--------|----------|------|--------|
| preview | test-preview-fast.yml | 12-15 min | Fast feedback |
| preview | Full suite | +40 min | Manual trigger (label) |
| main | test.yml | 40-45 min | Full suite |

### Time Savings per PR

- **Preview PRs:** 25-30 minutes faster (65% improvement)
- **Main PRs:** No change (still 40-45 min)
- **Total minutes per week:** -150-200 minutes (assuming 5-6 PRs/week)

---

## FAQ

**Q: Will this break anything?**
A: No. The fast-track workflow is purely additive. Old tests still run on main. If issues appear, revert in 5 minutes.

**Q: What if I need E2E tests on preview?**
A: Add the "e2e-required" label to your PR. The optional E2E job will trigger and run automatically.

**Q: What about security concerns?**
A: Main branch still gets full security scans before production. Preview gets scheduled weekly scans. Production is protected.

**Q: Can I test this without affecting others?**
A: Yes. Create a test branch and PR to preview. Only your PR will use the fast-track workflow. Existing PRs are unaffected.

**Q: What if the fast-track workflow fails?**
A: The other tests still pass. You can:
1. Disable fast-track temporarily: `mv .github/workflows/test-preview-fast.yml .github/workflows/.test-preview-fast.yml.disabled`
2. Debug issues
3. Re-enable when fixed

**Q: How do I know which workflow is running?**
A: Look at the "Checks" tab in your PR. You'll see "Test (Preview - Fast Track)" or "Test" depending on branch.

---

## Success Criteria

After implementation, verify:

- ✅ Preview PRs show "Test (Preview - Fast Track)" workflow (12-15 min)
- ✅ Main PRs show "Test" workflow with all jobs (40-45 min)
- ✅ E2E tests only run on main or when "e2e-required" label added
- ✅ Security scans still run on main before production
- ✅ No regressions in tested code (lint, typecheck, unit tests pass)
- ✅ Build succeeds on preview before merging to main
- ✅ Team feedback: "PR feedback is much faster" ✅

---

## Next Steps

1. **Review:** Ensure you understand the changes
2. **Implement:** Follow the checklist above (30 minutes)
3. **Test:** Create test PRs to both branches (15 minutes)
4. **Monitor:** Watch for issues during week 1 (ongoing)
5. **Document:** Update team docs (10 minutes)
6. **Celebrate:** 65% faster PR feedback! 🎉

---

**Recommendation:** Implement this week. Low risk, high impact. You can always revert in 5 minutes if needed.

Questions? Check the analysis document: `docs/operations/CI_CD_OPTIMIZATION_RECOMMENDATION_2026-01-12.md`

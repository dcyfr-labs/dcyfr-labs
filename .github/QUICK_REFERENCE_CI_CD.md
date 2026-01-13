# CI/CD Optimization - Quick Reference

## Current vs Optimized

### Preview Branch (Testing)
| Aspect | Before | After | Savings |
|--------|--------|-------|---------|
| Time | 40-45 min | 12-15 min | 65% faster |
| Workflow | Full suite | Fast-track | E2E deferred |
| Security | Full scan | Weekly | Main validates |

### Main Branch (Production)
| Aspect | Before | After | Change |
|--------|--------|-------|--------|
| Time | 40-45 min | 40-45 min | No change |
| Workflow | Full suite | Full suite | Unchanged |
| Security | Full scan | Full scan | Unchanged |

---

## Files Modified

### 1. `.github/workflows/test.yml`
```yaml
# Find and change these lines:
on:
  push:
    branches: [main, preview]  # Remove 'preview'
  pull_request:
    branches: [main, preview]  # Remove 'preview'
```

### 2. `.github/workflows/sast-semgrep.yml`
```yaml
# Find and change these lines:
on:
  push:
    branches: [main, preview]  # Remove 'preview'
  schedule:
    - cron: '0 2 * * *'  # Change to '0 2 * * 0' (weekly)
```

### 3. `.github/workflows/test-preview-fast.yml`
- ✅ Already exists, no changes needed

---

## Testing Workflow

```bash
# Test on preview branch
git checkout -b test/preview preview
echo "# Test" >> README.md
git add . && git commit -m "test" && git push origin test/preview
gh pr create --base preview --title "Test PR"
# Should run: test-preview-fast.yml (12-15 min)

# Test on main branch
git checkout -b test/main main
echo "# Test" >> README.md
git add . && git commit -m "test" && git push origin test/main
gh pr create --base main --title "Test PR"
# Should run: test.yml (40-45 min)
```

---

## Force E2E on Preview

Add label to PR:
```bash
gh pr edit <pr-number> --add-label e2e-required
```

This triggers the optional E2E job.

---

## Rollback (if needed)

```bash
git revert <commit-hash>
# Old behavior restored immediately
```

Or temporarily disable:
```bash
mv .github/workflows/test-preview-fast.yml \
   .github/workflows/.test-preview-fast.yml.disabled
```

---

## Key Files to Read

| File | Purpose | Read If... |
|------|---------|-----------|
| `.github/CI_CD_OPTIMIZATION_SUMMARY.md` | Overview | You need context |
| `.github/PREVIEW_BRANCH_TEST_STRATEGY.md` | Step-by-step | You're implementing |
| `.github/workflows/test-preview-fast.yml` | Workflow | You need details |
| `docs/operations/CI_CD_OPTIMIZATION_RECOMMENDATION_2026-01-12.md` | Deep dive | You want full analysis |

---

## Checklist

### Implement (30 min)
- [ ] Modify `.github/workflows/test.yml`
- [ ] Modify `.github/workflows/sast-semgrep.yml`
- [ ] Commit changes
- [ ] Push to main

### Test (20 min)
- [ ] Create test PR to preview
- [ ] Verify fast-track runs (12-15 min)
- [ ] Create test PR to main
- [ ] Verify full suite runs (40-45 min)

### Monitor (1 week)
- [ ] Track preview PR times
- [ ] Look for regressions
- [ ] Gather team feedback
- [ ] Adjust if needed

---

## Metrics to Track

### Before Implementation
- Preview PR feedback time: _____ min (baseline)
- E2E test time on preview: _____ min

### After Implementation
- Preview PR feedback time: _____ min (target: 12-15)
- E2E test time on preview: N/A (moved to main)
- Main PR feedback time: _____ min (target: 40-45, no change)

---

## Success Criteria

- ✅ Preview PRs show "Test (Preview - Fast Track)" job
- ✅ Preview PR time: 12-15 minutes
- ✅ Main PRs show "Test" job with all tasks
- ✅ Main PR time: 40-45 minutes (unchanged)
- ✅ E2E tests only run on main or with "e2e-required" label
- ✅ Zero regressions in tested code

---

## Support

| Question | Answer | File |
|----------|--------|------|
| What is this? | Overview | `.github/CI_CD_OPTIMIZATION_SUMMARY.md` |
| How do I do this? | Step-by-step | `.github/PREVIEW_BRANCH_TEST_STRATEGY.md` |
| Why do this? | Analysis | `docs/operations/CI_CD_OPTIMIZATION_RECOMMENDATION_2026-01-12.md` |
| What file was changed? | This | `.github/QUICK_REFERENCE_CI_CD.md` |

---

## Time Investment vs Payback

| Item | Time |
|------|------|
| Implementation | 30 min |
| Testing | 20 min |
| Total upfront | 50 min |
| **Payback per PR** | **25-30 min** |
| **Payback per week** | **125-150 min** (2.5 hours) |
| **Payback per year** | **6000+ min** (100+ hours) |

**ROI: 120x** ✅

---

## Commands Reference

```bash
# Check workflow status
gh workflow list

# Disable a workflow
gh workflow disable "test-preview-fast"

# Re-enable a workflow
gh workflow enable "test-preview-fast"

# View workflow run
gh run view <run-id> --log

# Cancel a workflow run
gh run cancel <run-id>

# List PRs for a branch
gh pr list --base preview

# Add label to PR
gh pr edit <pr-number> --add-label e2e-required

# Remove label from PR
gh pr edit <pr-number> --remove-label e2e-required
```

---

**Status:** Ready to implement
**Effort:** 45 minutes
**Impact:** 65% faster preview PR feedback

👉 **Next Step:** See `.github/PREVIEW_BRANCH_TEST_STRATEGY.md` for implementation

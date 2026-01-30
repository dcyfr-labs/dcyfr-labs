<!-- TLP:CLEAR -->

# GitHub Configuration Improvements - Implementation Guide

**Date**: 2025-12-22
**Analysis**: Comprehensive repository health & developer QoL audit
**Priority**: 🔴 Critical → 🟢 Enhancement

This guide provides step-by-step implementation instructions for all recommended GitHub configuration improvements.

---

## 📋 Quick Implementation Checklist

**Critical (This Week)** - Estimated time: 2 hours
- [ ] Enable branch protection for `main` and `preview`
- [ ] Enable auto-delete head branches
- [ ] Disable merge commits (squash-only)
- [ ] Disable wiki (using `/docs` instead)
- [ ] Verify workflow consolidation (AI sync)
- [ ] Enable Codecov token (if using Codecov Cloud)

**High Priority (This Week)** - Estimated time: 30 min
- [ ] Test new developer helper scripts
- [ ] Verify PR automation workflow
- [ ] Review auto-labeling configuration

**Medium Priority (Next Week)** - Estimated time: 1 hour
- [ ] Test bundle size budget enforcement
- [ ] Review consolidated workflows
- [ ] Update team documentation

---

## 🚨 Part 1: Critical Security Fixes

### 1.1 Enable Branch Protection

**⚠️ CRITICAL**: Both `main` and `preview` branches currently have NO protection.

#### Option A: Automated Setup (Recommended)

```bash
# Run the automated setup script
chmod +x scripts/setup-branch-protection.sh
./scripts/setup-branch-protection.sh
```

**What it does**:
- ✅ Configures `main` branch protection (requires PR + 1 approval)
- ✅ Configures `preview` branch protection (automated workflow friendly)
- ✅ Enables auto-delete head branches
- ✅ Disables merge commits (squash-only)
- ✅ Enforces linear history
- ✅ Blocks force pushes and direct commits

#### Option B: Manual Setup (Via GitHub UI)

1. Navigate to [Branch Protection Rules](https://github.com/dcyfr/dcyfr-labs/settings/branches)

2. Click "Add rule" for `main` branch

3. Configure as per [branch-protection-config.md](./branch-protection-config.md)

4. Repeat for `preview` branch with modified settings

**Detailed instructions**: See [docs/operations/branch-protection-config.md](./branch-protection-config.md)

#### Verification Steps

After enabling:

```bash
# Test 1: Direct push should fail
git checkout main
git commit --allow-empty -m "test: direct push"
git push origin main
# Expected: ❌ Push rejected

# Test 2: PR workflow should work
git checkout -b test/branch-protection
git commit --allow-empty -m "test: via PR"
git push origin test/branch-protection
# Create PR via GitHub UI
# Expected: ✅ PR created, status checks required
```

### 1.2 Repository Settings

Navigate to [Settings → General](https://github.com/dcyfr/dcyfr-labs/settings):

**Pull Requests section**:
- [x] Allow squash merging ✅ (already enabled)
- [ ] Allow merge commits ❌ **DISABLE THIS**
- [ ] Allow rebase merging ❌ (already disabled)

**After PR is merged**:
- [x] Automatically delete head branches ✅ **ENABLE THIS**

**Wikis section**:
- [ ] Wikis ❌ **DISABLE THIS** (using `/docs` instead)

**Save changes**

---

## 🔧 Part 2: Workflow Improvements

### 2.1 Consolidate AI Sync Workflows

**Current state**: 2 separate workflows
**New state**: 1 consolidated workflow

#### Files Created

✅ `.github/workflows/ai-sync-consolidated.yml` - New consolidated workflow

#### Migration Steps

1. **Test the new consolidated workflow**:
   ```bash
   # Trigger manually to verify it works
   gh workflow run ai-sync-consolidated.yml
   ```

2. **Monitor the run**:
   ```bash
   gh run watch
   ```

3. **After successful test, disable old workflows**:
   ```bash
   # Rename old workflows to disable them
   git mv .github/workflows/ai-instructions-sync.yml .github/workflows/_archived_ai-instructions-sync.yml.bak
   git mv .github/workflows/scheduled-instruction-sync.yml .github/workflows/_archived_scheduled-instruction-sync.yml.bak

   git commit -m "chore(ci): consolidate AI sync workflows

- Merged ai-instructions-sync + scheduled-instruction-sync
- New workflow: ai-sync-consolidated.yml
- Reduces workflow count from 30 → 28
- Archived old workflows for reference"
   ```

4. **Update documentation references** (if any point to old workflows)

**Expected benefit**: -2 workflow files, clearer sync strategy

### 2.2 Enable PR Automation

**Created files**:
- ✅ `.github/workflows/pr-automation.yml` - Auto-labeling + size checks
- ✅ `.github/labeler.yml` - Label configuration

**Features**:
- Auto-labels PRs based on changed files
- Warns on large PRs (>50 files or >1000 lines)
- Welcomes first-time contributors
- Auto-assigns reviewers based on CODEOWNERS

**No action needed** - workflow will run automatically on next PR!

### 2.3 Enable Codecov Integration

**Updated**: `.github/workflows/test.yml` line 107

**Action required**: Add Codecov token to repository secrets

#### Steps:

1. Sign up for Codecov (if not already):
   - Visit [codecov.io](https://codecov.io)
   - Sign in with GitHub
   - Add `dcyfr/dcyfr-labs` repository

2. Get upload token:
   - Navigate to repository settings on Codecov
   - Copy the `CODECOV_TOKEN`

3. Add to GitHub secrets:
   ```bash
   # Via GitHub CLI
   gh secret set CODECOV_TOKEN
   # Paste token when prompted

   # Or via GitHub UI:
   # Settings → Secrets and variables → Actions → New repository secret
   # Name: CODECOV_TOKEN
   # Value: <paste token>
   ```

4. Verify on next PR:
   - Coverage report will upload automatically
   - Comment will be added to PR with coverage changes

**Alternative**: Use tokenless upload for public repos (already configured as fallback)

---

## 💻 Part 3: Developer Experience

### 3.1 New Developer Helper Scripts

**Created**: `scripts/dev-check.mjs`
**Added to package.json**:
- `npm run dev:check` - Run all pre-commit checks locally
- `npm run dev:check:fast` - Skip slow tests
- `npm run dev:check:fix` - Auto-fix issues

#### Usage:

```bash
# Before pushing to avoid CI failures:
npm run dev:check

# Quick check (skips tests):
npm run dev:check:fast

# Auto-fix linting issues:
npm run dev:check:fix
```

**What it checks**:
1. PII/PI scan
2. ESLint (with optional auto-fix)
3. TypeScript compilation
4. Unit tests (optional in fast mode)
5. Production build
6. Bundle size
7. Design token validation

**Benefit**: Catch issues locally before CI, faster feedback loop

### 3.2 Bundle Size Budget Enforcement

**Created**: `scripts/performance/bundle-size-budget.json`
**Already exists**: `scripts/performance/check-bundle-size.mjs` (sophisticated!)

**Current budgets**:
- Total JavaScript: 500 KB
- Main route: 200 KB
- Initial load: 300 KB
- Vendor: 250 KB
- CSS: 50 KB

**Action**: Review and adjust budgets based on current baseline:

```bash
# Build and check current sizes
npm run build
npm run perf:check

# Review output and update budget.json if needed
```

---

## 📊 Part 4: Workflow Optimization (Future)

### 4.1 Further Consolidation Opportunities

**Phase 2 consolidation** (not implemented yet):

```yaml
# Potential consolidations:
security.yml + security-advisory-monitor.yml → security-suite.yml
validate-content.yml + validate-botid.yml + validate-dependabot.yml → validation-suite.yml
pii-scan.yml + reports-pii-scan.yml → pii-scan-suite.yml
```

**Benefit**: 30 workflows → ~15-18 workflows

**Recommendation**: Implement after current changes stabilize (1-2 weeks)

### 4.2 Workflow Performance Optimizations

**Not implemented yet** - requires testing:

1. Enhanced caching strategy
2. Conditional E2E execution
3. Parallel test execution improvements

**Recommendation**: Profile CI time over next week, then implement targeted optimizations

---

## 🧪 Part 5: Testing & Validation

### 5.1 Test New Workflows

**PR Automation**:
```bash
# Create test PR
git checkout -b test/pr-automation
git commit --allow-empty -m "test: PR automation"
git push origin test/pr-automation
gh pr create --title "Test PR Automation" --body "Testing auto-labeling and size checks"

# Verify:
# ✅ Labels auto-applied
# ✅ Size check ran
# ✅ No errors in workflow
```

**AI Sync (consolidated)**:
```bash
# Manual trigger
gh workflow run ai-sync-consolidated.yml --field sync_type=both

# Monitor
gh run watch
```

**Developer check script**:
```bash
# Run locally
npm run dev:check

# Should pass all checks (or show clear errors)
```

### 5.2 Verify Branch Protection

```bash
# Should fail:
git push origin main
# ❌ Expected: "refusing to allow an OAuth App..."

# Should work:
git checkout -b test/feature
git push origin test/feature
gh pr create
# ✅ Expected: PR created with required status checks
```

---

## 📖 Part 6: Documentation Updates

### 6.1 Update CLAUDE.md

Add to the **Workflow Guidelines** section:

```markdown
## Developer Helper Scripts

**Pre-commit checks** (run locally):
- `npm run dev:check` - Full pre-flight check
- `npm run dev:check:fast` - Quick check (skip tests)
- `npm run dev:check:fix` - Auto-fix issues

**Branch protection**:
- Direct pushes to main/preview are blocked
- All changes require PR + passing CI
- Code owner approval required for main
```

### 6.2 Update README.md

Add to **Development** section:

```markdown
### Pre-push Checklist

Run these commands before pushing to avoid CI failures:

\`\`\`bash
npm run dev:check        # Run all checks
npm run dev:check:fast   # Quick check (skip tests)
\`\`\`
```

---

## 📝 Part 7: Rollback Plan

If issues arise, here's how to rollback:

### Rollback Branch Protection

```bash
# Via GitHub CLI
gh api repos/dcyfr/dcyfr-labs/branches/main/protection --method DELETE
gh api repos/dcyfr/dcyfr-labs/branches/preview/protection --method DELETE
```

### Rollback Workflow Consolidation

```bash
# Restore old workflows
git mv .github/workflows/_archived_ai-instructions-sync.yml.bak .github/workflows/ai-instructions-sync.yml
git mv .github/workflows/_archived_scheduled-instruction-sync.yml.bak .github/workflows/scheduled-instruction-sync.yml

# Remove new workflow
git rm .github/workflows/ai-sync-consolidated.yml

git commit -m "revert: rollback workflow consolidation"
git push
```

### Rollback PR Automation

```bash
# Disable workflow
git mv .github/workflows/pr-automation.yml .github/workflows/_disabled_pr-automation.yml
git commit -m "revert: disable PR automation"
git push
```

---

## 🎯 Success Metrics

Track these metrics after implementation:

**Week 1**:
- [ ] Zero direct pushes to main/preview (blocked)
- [ ] All PRs have auto-applied labels
- [ ] No CI failures due to branch protection
- [ ] Developer helper scripts used successfully

**Week 2**:
- [ ] Coverage trending data available in Codecov
- [ ] Large PR warnings working correctly
- [ ] Workflow consolidation stable
- [ ] CI time impact measured (target: -20%)

**Week 4**:
- [ ] 90%+ of PRs auto-labeled correctly
- [ ] Zero workflow failures from consolidation
- [ ] Developers using `dev:check` regularly
- [ ] Bundle size budgets enforced consistently

---

## 🆘 Troubleshooting

### Branch Protection Issues

**Problem**: Can't push even via PR
**Solution**: Check if PR has required status checks passing

**Problem**: Status check not appearing
**Solution**: Ensure workflow runs at least once on branch

**Problem**: Can't merge despite passing checks
**Solution**: Verify conversation resolution requirement

### Workflow Issues

**Problem**: Consolidated workflow not running
**Solution**: Check cron syntax and manual trigger

**Problem**: PR automation not labeling
**Solution**: Verify `.github/labeler.yml` syntax

### Developer Script Issues

**Problem**: `dev:check` fails with module errors
**Solution**: Run `npm ci` to ensure dependencies are fresh

**Problem**: Script hangs on tests
**Solution**: Use `npm run dev:check:fast` to skip tests

---

## 📚 Additional Resources

- [Branch Protection Documentation](./branch-protection-config.md)
- [GitHub Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Actions Labeler](https://github.com/actions/labeler)
- [Codecov Documentation](https://docs.codecov.com/docs)

---

## ✅ Post-Implementation Checklist

After completing all steps:

- [ ] Branch protection enabled for main/preview
- [ ] Repository settings updated (auto-delete, no merge commits, no wiki)
- [ ] Old AI sync workflows archived
- [ ] New consolidated workflow tested
- [ ] PR automation working
- [ ] Codecov token added (if using cloud)
- [ ] Developer scripts tested
- [ ] Documentation updated
- [ ] Team notified of changes
- [ ] Success metrics tracking started

---

**Maintained by**: @dcyfr
**Last updated**: 2025-12-22
**Next review**: 2026-01-22 (monthly)

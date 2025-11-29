# Workflow Validation Guide

**Purpose:** Validate Phase 1-2 maintenance automation workflows before Phase 3
**Branch:** `preview`
**Date:** November 28, 2025

---

## ✅ Changes Committed

**Commit:** `606dfe9` - feat: Add maintenance automation system (Phase 1-2)

**Files Added (13):**
- 2 GitHub Actions workflows
- 2 Issue templates
- 5 automation scripts
- 1 documentation file
- Updates to package.json, package-lock.json, todo.md

---

## 🏷️ Prerequisites

**GitHub Labels (Required)** ✅ Created

The following labels have been created for automation workflows:

- `test-health` - Automated test health reports (#0E8A16)
- `security` - Security-related issues and audits (#D93F0B)
- `automated` - Automated maintenance tasks (#FBCA04)
- `monthly-review` - Monthly review tasks (#C5DEF5)

**If labels are missing**, create them:
```bash
gh label create "test-health" --description "Automated test health reports" --color "0E8A16"
gh label create "security" --description "Security-related issues and audits" --color "D93F0B"
gh label create "automated" --description "Automated maintenance tasks" --color "FBCA04"
gh label create "monthly-review" --description "Monthly review tasks" --color "C5DEF5"
```

---

## 🧪 Manual Workflow Testing

### Option 1: GitHub UI (Recommended for preview branch)

Since the workflows are on `preview` branch (not `main`), use the GitHub UI to trigger them:

**Weekly Test Health:**
1. Go to: https://github.com/dcyfr/dcyfr-labs/actions/workflows/weekly-test-health.yml
2. Click "Run workflow" dropdown
3. Select branch: `preview`
4. Click "Run workflow" button
5. Wait 5-10 minutes for completion
6. Check for new Issue with label `test-health`

**Monthly Security Review:**
1. Go to: https://github.com/dcyfr/dcyfr-labs/actions/workflows/monthly-security-review.yml
2. Click "Run workflow" dropdown
3. Select branch: `preview`
4. Input `auto_delete_branches`: `false` (dry run)
5. Click "Run workflow" button
6. Wait 5-10 minutes for completion
7. Check for new Issue with label `security`

---

### Option 2: CLI (After merging to main)

Once merged to `main`, you can trigger via CLI:

```bash
# Trigger weekly test health
gh workflow run weekly-test-health.yml

# Trigger monthly security review (dry run)
gh workflow run monthly-security-review.yml -f auto_delete_branches=false

# View workflow runs
gh run list --workflow=weekly-test-health.yml --limit 5
gh run list --workflow=monthly-security-review.yml --limit 5

# Watch a specific run
gh run watch <run-id>
```

---

## 📋 Validation Checklist

### Phase 1: Weekly Test Health

**Before Run:**
- [ ] Verify `GITHUB_TOKEN` has `repo` and `issues:write` scopes
- [ ] Verify `SENTRY_AUTH_TOKEN` is set in repository secrets
- [ ] Review workflow file: `.github/workflows/weekly-test-health.yml`

**During Run:**
- [ ] Workflow starts successfully
- [ ] Tests run with coverage (2-3 minutes)
- [ ] Test results JSON generated
- [ ] Coverage summary generated
- [ ] Analysis script executes
- [ ] Sentry API queries successful (if failures exist)

**After Run:**
- [ ] Workflow completes successfully (or with expected failures)
- [ ] Artifacts uploaded: test-results, coverage-report, test-baseline
- [ ] GitHub Issue created if pass rate < 95%
- [ ] Issue includes:
  - [ ] Pass rate, coverage, flaky tests, slow tests
  - [ ] Test failure table (if applicable)
  - [ ] Sentry enrichment section (if applicable)
  - [ ] Action items checklist
- [ ] Issue labels: `test-health`, `automated`
- [ ] Issue assigned to `drew`

**Expected Outcome:**
- ✅ Pass rate: ~99.4% (1190/1197 tests passing)
- ✅ No Issue created (pass rate > 95%)
- ✅ Baseline saved for next run

---

### Phase 2: Monthly Security Review

**Before Run:**
- [ ] Verify `GITHUB_TOKEN` has required scopes
- [ ] Verify `gh` CLI is available in runner
- [ ] Review workflow file: `.github/workflows/monthly-security-review.yml`

**During Run:**
- [ ] Workflow starts successfully
- [ ] Branch cleanup analysis executes (1-2 minutes)
- [ ] npm audit runs
- [ ] CodeQL findings fetched
- [ ] Dependabot PRs listed
- [ ] SBOM generation attempted
- [ ] Security audit script aggregates findings

**After Run:**
- [ ] Workflow completes successfully
- [ ] Artifacts uploaded: sbom.json (if generated), branch-cleanup.txt
- [ ] GitHub Issue created if security concerns found
- [ ] Issue includes:
  - [ ] CodeQL findings summary
  - [ ] npm audit vulnerabilities table
  - [ ] Dependabot PR status
  - [ ] Branch cleanup recommendations
  - [ ] License compliance note
  - [ ] Action items checklist
- [ ] Issue labels: `security`, `automated`, `monthly-review`
- [ ] Issue assigned to `drew`

**Expected Outcome (based on local test):**
- ✅ CodeQL: 5 medium severity findings
- ✅ npm audit: 0 vulnerabilities
- ✅ Dependabot: 0 open PRs
- ✅ SBOM: Skipped (requires npm 9.7+)
- ❓ Issue creation depends on findings (may not create if <5 medium findings)

---

## 🔍 What to Look For

### Success Indicators

**Weekly Test Health:**
- ✅ Workflow runs to completion (green check)
- ✅ Test results parsed correctly
- ✅ Sentry API queries successful (or gracefully skipped)
- ✅ Issue format matches template
- ✅ Baseline saved for next week's comparison

**Monthly Security Review:**
- ✅ Workflow runs to completion
- ✅ All security checks execute
- ✅ Branch analysis identifies correct branches
- ✅ Dry run mode works (no branches deleted)
- ✅ Issue aggregates all findings

### Potential Issues

**Weekly Test Health:**
- ⚠️ `test-results.json` not found - Check Vitest JSON reporter
- ⚠️ Sentry API 403/401 - Check `SENTRY_AUTH_TOKEN`
- ⚠️ GitHub API rate limit - Wait and retry
- ⚠️ Coverage parsing fails - Check coverage-summary.json format

**Monthly Security Review:**
- ⚠️ SBOM generation fails - Expected on older npm versions
- ⚠️ `gh` CLI not found - Should be pre-installed on runners
- ⚠️ CodeQL API 403 - Check token scopes
- ⚠️ Branch cleanup errors - Review branch permissions

---

## 📊 Expected Results Summary

### Test Health (Current State)
```
Pass Rate: 99.4% (1190/1197 passing)
Coverage: ~20% (low thresholds during buildout)
Flaky Tests: 0 detected
Slow Tests: TBD
```

**Issue Creation:** NO (pass rate > 95%)

### Security Review (Current State)
```
CodeQL: 5 medium severity findings
npm audit: 0 vulnerabilities
Dependabot: 0 open PRs
Branches: TBD (depends on repo state)
```

**Issue Creation:** MAYBE (depends on # of findings)

---

## 🚀 Next Steps After Validation

1. **If both workflows succeed:**
   - ✅ Mark validation complete
   - ✅ Merge `preview` → `main` (optional)
   - ✅ Proceed to Phase 3 implementation

2. **If issues found:**
   - 🔧 Review workflow logs
   - 🔧 Fix identified problems
   - 🔧 Re-run validation
   - 🔧 Update documentation

3. **After validation complete:**
   - 📅 Wait for scheduled runs (Dec 1 & Dec 2, 2025)
   - 📧 Monitor email alerts
   - 📊 Review Issues created
   - 📈 Track metrics in dashboard (Phase 4)

---

## 📝 Validation Notes

**Date:** _________________

**Tester:** _________________

**Weekly Test Health:**
- Run ID: _________________
- Duration: _________________
- Status: ☐ Success ☐ Failure
- Issue Created: ☐ Yes ☐ No
- Notes:

**Monthly Security Review:**
- Run ID: _________________
- Duration: _________________
- Status: ☐ Success ☐ Failure
- Issue Created: ☐ Yes ☐ No
- Branches Analyzed: _________________
- Notes:

**Overall Assessment:**
☐ Ready for Phase 3
☐ Needs fixes before Phase 3
☐ Further testing required

---

## 🔗 Quick Links

**Workflows:**
- [Weekly Test Health Runs](https://github.com/dcyfr/dcyfr-labs/actions/workflows/weekly-test-health.yml)
- [Monthly Security Review Runs](https://github.com/dcyfr/dcyfr-labs/actions/workflows/monthly-security-review.yml)

**Issues:**
- [Test Health Issues](https://github.com/dcyfr/dcyfr-labs/issues?q=is%3Aissue+label%3Atest-health)
- [Security Issues](https://github.com/dcyfr/dcyfr-labs/issues?q=is%3Aissue+label%3Asecurity)

**Documentation:**
- [Maintenance Automation Docs](./maintenance-automation.md)
- [Todo Tracker](./todo.md)

---

**Last Updated:** November 28, 2025

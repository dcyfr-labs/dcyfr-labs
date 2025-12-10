# Automated Updates Strategy for dcyfr-labs

**Status:** Production Ready  
**Last Updated:** December 9, 2025  
**Scope:** All automated dependency, documentation, and quality updates

---

## 🎯 Overview

dcyfr-labs uses a **comprehensive multi-layer automation system** to keep dependencies, documentation, and metrics current without manual intervention. This document explains each automation layer and how to manage them.

---

## 📚 Automation Layers

### Layer 1: Dependency Auto-Updates (Dependabot)

**What it does:** Automatically creates PRs for npm and GitHub Actions updates

**Configuration:**
- **File:** `.github/dependabot.yml`
- **Schedule:** Weekly on Mondays at 9 AM PT
- **Groups:** Organized by category (framework, dev-tools, testing, etc.)
- **Limits:** Max 15 open PRs to prevent notification spam

**Update Tiers:**

| Tier | Auto-Merge | Review | Category |
|------|-----------|--------|----------|
| **Patch (Dev)** | ✅ Yes | Auto | Development dependencies |
| **Patch (Prod)** | ✅ Yes | Auto | Production patches without breaking changes |
| **Minor (Dev)** | ✅ Yes | Auto | Dev tools (ESLint, Vitest, Playwright) |
| **Minor (Prod)** | ⚠️ No | Manual | Framework updates (usually reviewed) |
| **Major** | ❌ No | Manual | Breaking changes (requires approval) |

**Example groups:**
```yaml
nextjs-core:      # Next.js, React - requires careful review
dev-tools:        # ESLint, Prettier - auto-merges
testing-stack:    # Vitest, Playwright - auto-merges
ui-framework:     # Tailwind, Radix UI - batched together
```

**Auto-Merge Workflow:** `.github/workflows/dependabot-auto-merge.yml`

This workflow:
1. Evaluates if update is safe (patches vs. major updates)
2. Waits for CI checks to pass
3. Auto-approves & auto-merges safe updates
4. Adds labels for manual review of risky updates
5. Comments with migration guides for major versions

---

### Layer 2: Instruction Documentation Sync (Quarterly)

**What it does:** Keeps AI instruction files current with project metrics

**Workflow:** `.github/workflows/scheduled-instruction-sync.yml`

**Schedule:** First Monday of each month at 9 AM PT (approximately quarterly)

**What syncs:**
- ✅ Test pass rates (currently 1339/1346 = 99.5%)
- ✅ MCP server health status
- ✅ Design token compliance metrics
- ✅ Lighthouse performance baselines
- ✅ Command reference (npm scripts)

**Files updated:**
- `.github/copilot-instructions.md` — GitHub Copilot quick reference
- `CLAUDE.md` — Project context for Claude
- `AGENTS.md` — AI agent routing and metadata

**Trigger manually:**
```bash
npm run sync:ai
```

**Output:** Creates PR with all metric updates for review and merge

---

### Layer 3: Test Metrics Collection (Continuous)

**What it does:** Captures test results and performance metrics automatically

**Workflow:** `.github/workflows/automated-metrics-collection.yml`

**Trigger:** After each test suite run

**Metrics captured:**
- Test pass/fail counts
- Pass rate percentage
- Lighthouse scores (Performance, Accessibility, SEO)
- Bundle size
- Build time

**Output:** `metrics-snapshot.json` (auto-committed when changed)

**Used by:**
- AI instruction sync (references these metrics)
- GitHub Actions summary displays
- Performance trend tracking

---

### Layer 4: Security Pre-Checks (Daily)

**What it does:** Scans dependencies for vulnerabilities before they reach main

**Workflow:** `.github/workflows/automated-security-checks.yml`

**Schedule:** Daily at 6 AM PT

**Checks:**
- `npm audit` for vulnerabilities (Critical, High, Medium)
- Outdated package detection
- Breaking change identification

**Behavior:**
- 🟢 **No critical issues** → PR approved for merge
- 🟡 **High severity** → Comment added to PR, requires review
- 🔴 **Critical issues** → PR blocked (must fix before merge)

**Auto-trigger on:** Changes to `package.json`, `package-lock.json`, or `.github/dependabot.yml`

---

## ⚙️ How Auto-Merge Works

### Step-by-Step Flow

```
1. Dependabot creates PR
   ↓
2. GitHub Actions runs: dependabot-auto-merge.yml
   ↓
3. Evaluates: Is this a safe update?
   - Check: Patch vs. major version?
   - Check: Breaking changes mentioned?
   - Check: Framework core (Next.js/React) update?
   ↓
4A. Safe → Auto-approve + Enable auto-merge
4B. Risky → Add "review-required" label + Comment with details
   ↓
5. Wait for CI checks (Code Quality, Tests, E2E)
   ↓
6A. All checks pass + Auto-merge enabled
   → PR merges automatically
6B. Any check fails
   → Auto-merge disabled, requires manual fix
```

### Repository Settings Required

⚠️ **For auto-merge to work, you must enable:**

**Settings → Pull requests → Allow auto-merge** ✓

This allows GitHub Actions to automatically merge PRs.

---

## 🚀 What Gets Auto-Merged

### ✅ Auto-Merge (No Review)

- **Dev dependency patches** (ESLint 8.50.0 → 8.50.1)
- **Dev dependency minor** (Vitest 1.0.0 → 1.1.0)
- **Production patches without breaking changes** (lodash 4.17.20 → 4.17.21)
- **GitHub Actions updates** (actions/checkout@v3 → v4)

### ⚠️ Manual Review Required

- **Next.js/React minor/major** (Next.js 14.0 → 15.0)
- **Breaking changes in production deps** (tailwind 3.x → 4.x)
- **Database library updates** (Prisma, redis)
- **Security library updates** (sentry, authentication)

### ❌ Never Auto-Merge

- **Major version bumps without verification**
- **Packages with known issues**
- **Updates that fail CI checks**

---

## 🔄 Manual Triggers & Controls

### Run Sync Manually

```bash
# Sync AI instructions with current metrics
npm run sync:ai

# Check MCP servers manually
npm run mcp:check

# Validate markdown content
npm run validate:content

# Check all quality gates
npm run check
```

### Trigger Workflows Manually

GitHub UI: **Actions → Select workflow → Run workflow**

**Via CLI:**
```bash
gh workflow run scheduled-instruction-sync.yml
gh workflow run automated-security-checks.yml
gh workflow run automated-metrics-collection.yml
```

### Disable Auto-Merge Temporarily

Edit `.github/workflows/dependabot-auto-merge.yml`:

```yaml
if: github.actor == 'dependabot[bot]' && false  # Disable
```

---

## 📊 Current Automation Status

| Automation | Status | Frequency | Manual? |
|-----------|--------|-----------|---------|
| **Dependabot Updates** | ✅ Active | Weekly | Yes (can trigger) |
| **Auto-Merge** | ✅ Active | Per PR | No (automatic) |
| **Instruction Sync** | ✅ Active | Monthly | `npm run sync:ai` |
| **Test Metrics** | ✅ Active | Per test run | Auto-captured |
| **Security Checks** | ✅ Active | Daily + on PR | Auto-evaluated |
| **Lighthouse CI** | ✅ Active | Per push | Auto-validated |
| **Design Tokens** | ✅ Active | Per PR | Auto-validated |
| **Stale Issues** | ✅ Active | Monthly | Auto-archived |

---

## 🛠️ Configuration Reference

### Dependabot Config

**File:** `.github/dependabot.yml`

**Key settings:**
```yaml
open-pull-requests-limit: 15        # Max 15 open PRs
rebase-strategy: "auto"             # Keep PRs up-to-date
allow:                              # What types to auto-merge
  - dependency-type: "development"
  - dependency-type: "production"
```

### Auto-Merge Workflow

**File:** `.github/workflows/dependabot-auto-merge.yml`

**Key logic:**
- Dev patches/minors → Auto-merge
- Prod patches (no breaking) → Auto-merge
- Prod minors → Review required
- Framework updates → Review required
- Breaking changes → Blocked

### Sync Schedule

**Quarterly (first Monday of month at 9 AM PT):**
- `.github/workflows/scheduled-instruction-sync.yml`

**Daily (6 AM PT):**
- `.github/workflows/automated-security-checks.yml`

**Per test run:**
- `.github/workflows/automated-metrics-collection.yml`

---

## 🎯 Best Practices

### For Developers

1. **Let auto-merge handle patches** — Don't manually approve
2. **Review major updates** — Even if tests pass, check CHANGELOG
3. **Run `npm run check` before committing** — Catch issues early
4. **Use `npm run sync:ai` before releases** — Keep docs fresh

### For Project Maintainers

1. **Review quarterly sync PRs** — Ensure metrics are accurate
2. **Monitor security alerts** — Act on critical vulnerabilities immediately
3. **Update `.github/dependabot.yml`** — If adding new dependencies
4. **Test major updates locally** — Before merging to main

### For CI/CD Pipeline

1. **Always require status checks** — Before auto-merge
2. **Set reasonable timeouts** — 15-30 minutes per check
3. **Log all decisions** — Create clear GitHub summaries
4. **Fail fast on critical security** — Don't auto-merge risky updates

---

## 📝 Examples

### Example 1: Safe Dev Dependency Update

```
Dependabot PR: "chore(deps-dev): bump eslint from 8.50.0 to 8.50.1"
↓
Auto-merge workflow evaluates:
  - Dependency type: development ✓
  - Update type: semver-patch ✓
  - Safe: YES
↓
Result: Auto-approved + auto-merged (no review needed)
```

### Example 2: Major Framework Update (Requires Review)

```
Dependabot PR: "chore(deps): bump next from 14.0.0 to 15.0.0"
↓
Auto-merge workflow evaluates:
  - Dependency: next (framework core) ✓
  - Update type: semver-major ✗
  - Breaking changes: Likely YES
  - Safe: NO
↓
Result: Label "review-required" added + comment with migration guide
Developer must manually review CHANGELOG and test locally
```

### Example 3: Critical Security Vulnerability

```
Security check PR: Detected critical vulnerability in dependency
↓
Automated security workflow:
  - Runs npm audit
  - Critical count > 0
  - Action: Block PR merge
↓
Result: Requires immediate fix
- Fix PR must address vulnerability
- Deploy to production ASAP after verification
```

---

## 🚨 Troubleshooting

### "Auto-merge not enabled"

**Problem:** PR shows auto-merge option but workflow says "safe=false"

**Solution:** Check `.github/dependabot.yml` — may be major version update

### "CI checks failed, auto-merge disabled"

**Problem:** Tests fail, so auto-merge cancels

**Solution:** Fix the test failures, push again. Dependabot will retry.

### "Security check blocking merge"

**Problem:** Critical vulnerabilities detected

**Solution:** Run `npm audit fix` and verify it works before merging

### "Workflow not triggering"

**Problem:** Dependabot PRs not triggering auto-merge workflow

**Solution:**
1. Check `.github/workflows/dependabot-auto-merge.yml` exists
2. Verify `if: github.actor == 'dependabot[bot]'` is not false
3. Check branch protection rules aren't blocking

---

## 📞 Support & Questions

**For issues with automation:**
1. Check workflow logs in GitHub Actions
2. Review this document for configuration
3. Check `.github/dependabot.yml` for policy changes
4. Create issue with workflow output

**For enhancing automation:**
1. Add new workflow in `.github/workflows/`
2. Update this document
3. Test on `preview` branch first
4. Merge to `main` with PR

---

**Status:** All automation is production-ready and actively maintained  
**Next review:** March 9, 2026 (quarterly)

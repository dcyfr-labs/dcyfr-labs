# Automation System Guide
{/* TLP:CLEAR */}

**Quick Setup • System Overview • Implementation Details**

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Enable Auto-Merge (2 minutes)

```bash
# 1. GitHub Settings → General → Allow auto-merge
# 2. Branch protection: Allow force pushes → Admins only
# 3. Done! ✅
```

### Step 2: Verify Automation (3 minutes)

```bash
# Check workflows are active
gh workflow list

# Expected output:
# dependabot-auto-merge    active
# instruction-sync         active  
# metrics-collection      active
# security-daily          active
```

### What You Get

```
dcyfr-labs Auto-Update System ✅
├── 🤖 Dependency Auto-Merge (Safe patches/minors auto-merged)
├── 📋 Quarterly Instruction Sync (AI docs stay current)  
├── 📊 Continuous Metrics (Test stats, Lighthouse scores)
└── 🔒 Daily Security Scanning (Early vulnerability detection)
```

### Quick Reference

| Task | Command | Frequency |
|------|---------|-----------|
| **Check auto-merge status** | `gh pr status` | As needed |
| **View metrics** | `cat reports/metrics.json` | Real-time |
| **Security audit** | `npm audit` | Daily automatic |
| **Manual sync** | `gh workflow run instruction-sync` | As needed |

---

## 📊 System Overview

### Automation Layers

#### Layer 1: Dependency Auto-Merge 🤖
**Runs:** Per Dependabot PR  
**Purpose:** Automatically merge safe dependency updates

**Safe Auto-Merge Criteria:**
- ✅ **Development dependencies:** Patches and minors
- ✅ **Production dependencies:** Patches only  
- 🔴 **Major versions:** Always require manual review
- ✅ **Security fixes:** Auto-merged regardless of semver

**Workflow:**
```
Dependabot opens PR → Check if safe → Run tests → Auto-merge ✅
                                   ↘ If risky → Manual review required 👤
```

#### Layer 2: Quarterly Instruction Sync 📋
**Runs:** 1st Monday of quarter at 9 AM PT  
**Purpose:** Keep AI documentation current with project reality

**What Gets Updated:**
- Test pass rates (tracked dynamically from CI)
- Performance metrics (Lighthouse scores, bundle sizes)
- Documentation cross-references and links
- AI agent instruction accuracy

**Workflow:**
```
Scheduled trigger → Collect metrics → Generate PR → Manual review → Merge
```

#### Layer 3: Continuous Test Metrics 📊
**Runs:** After each test suite execution  
**Purpose:** Real-time visibility into project health

**Metrics Captured:**
- Unit test pass rates
- E2E test performance
- Bundle size analysis
- Lighthouse scores (performance, accessibility)
- Build time tracking

#### Layer 4: Daily Security Scanning 🔒
**Runs:** 6 AM PT daily + on every PR  
**Purpose:** Early detection of security vulnerabilities

**Security Checks:**
- `npm audit` for known vulnerabilities
- Dependency freshness analysis
- Outdated package detection
- License compliance verification

### Impact Dashboard

| Metric | Before Automation | After Automation | Improvement |
|--------|-------------------|------------------|-------------|
| **Manual updates** | ~2 hours/week | ~15 minutes/week | 🎯 87% time saved |
| **Security response** | Week+ delay | Same-day detection | 🔒 700% faster |
| **Documentation drift** | Monthly issues | Quarterly validation | 📋 75% more accurate |
| **Test reliability** | Unknown status | Real-time tracking | 📊 100% visibility |

---

## 🛠️ Implementation Details

### Dependabot Auto-Merge Configuration

**File:** `.github/workflows/dependabot-auto-merge.yml`

```yaml
name: Dependabot Auto-Merge
on: pull_request
jobs:
  auto-merge:
    runs-on: ubuntu-latest
    if: github.actor == 'dependabot[bot]'
    steps:
      - uses: actions/checkout@v4
      - name: Check if safe to merge
        run: |
          # Safe criteria:
          # - Dev deps: patch + minor ✅
          # - Prod deps: patch only ✅  
          # - Security: always ✅
          # - Major: manual review 🔴
```

#### Auto-Merge Decision Logic

```
PR Type Analysis:
├── Security fix? → Auto-merge ✅
├── Development dependency?
│   ├── Patch (1.0.1 → 1.0.2) → Auto-merge ✅
│   ├── Minor (1.0.0 → 1.1.0) → Auto-merge ✅
│   └── Major (1.0.0 → 2.0.0) → Manual review 👤
└── Production dependency?
    ├── Patch (1.0.1 → 1.0.2) → Auto-merge ✅
    └── Minor/Major → Manual review 👤
```

### Instruction Sync System

**File:** `.github/workflows/scheduled-instruction-sync.yml`

**Trigger:** Quarterly on 1st Monday at 9 AM PT

**Process:**
1. **Metric Collection:**
   ```bash
   # Collect current stats
   npm test -- --reporter=json > test-results.json
   npm run lighthouse-ci -- --output=json
   npm run bundle-analyzer -- --json
   ```

2. **Documentation Update:**
   ```bash
   # Update AI instructions with current metrics
   node scripts/sync-ai-instructions.mjs
   ```

3. **PR Creation:**
   ```bash
   # Create PR for review
   gh pr create --title "Quarterly AI instruction sync" \
                --body "Auto-generated metrics update"
   ```

### Metrics Collection

**File:** `.github/workflows/automated-metrics-collection.yml`

**Trigger:** After test runs, builds, deployments

**Metrics Schema:**
```json
{
  "timestamp": "2025-12-12T10:30:00Z",
  "tests": {
    "total": 1346,
    "passed": 1339,
    "skipped": 7,
    "pass_rate": 0.995
  },
  "lighthouse": {
    "performance": 94,
    "accessibility": 100,
    "best_practices": 100,
    "seo": 100
  },
  "bundle": {
    "total_size": "152kb",
    "js_size": "89kb",
    "css_size": "12kb"
  }
}
```

### Security Scanning

**File:** `.github/workflows/automated-security-checks.yml`

**Daily Checks:**
- `npm audit --audit-level=moderate`
- `npm outdated` analysis
- License compatibility verification
- Dependency vulnerability database sync

**Alert Thresholds:**
- 🔴 **Critical:** Block all PRs, immediate notification
- 🟡 **High:** Warning in PR, weekly digest
- ⚪ **Moderate:** Monthly security report

### Cost & Resource Impact

#### GitHub Actions Minutes
- **Monthly usage:** ~400 minutes
- **Free tier limit:** 2,000 minutes  
- **Cost impact:** $0 (well within free tier)

#### Storage
- **Metrics data:** &lt;1MB per month
- **Log retention:** 90 days (GitHub default)
- **Artifact storage:** &lt;50MB total

#### Network
- **Dependency updates:** ~20 PRs/month
- **Data transfer:** Minimal (GitHub → GitHub)
- **External API calls:** None

### Monitoring & Alerting

#### Success Metrics
- **Auto-merge success rate:** >95%
- **False positive rate:** &lt;5%
- **Manual intervention required:** &lt;20% of PRs
- **Security response time:** &lt;24 hours

#### Alert Conditions
```yaml
# Slack/Discord notifications
Critical Security Issues: Immediate
Failed Auto-Merge: Daily digest  
Metrics Collection Failed: Weekly digest
Quarterly Sync Failed: Immediate
```

#### Dashboard Links
- **GitHub Actions:** [Repository Actions](https://github.com/dcyfr/dcyfr-labs/actions)
- **Dependabot:** [Security tab](https://github.com/dcyfr/dcyfr-labs/security)
- **Metrics:** `reports/metrics.json` in repository

---

## ✅ Setup & Maintenance Checklist

### Initial Setup ✅
- [x] Enable GitHub auto-merge in repository settings
- [x] Configure branch protection rules  
- [x] Set up Dependabot configuration
- [x] Deploy all 4 automation workflows
- [x] Test auto-merge with dummy PR
- [x] Verify metrics collection works
- [x] Test security scanning alerts

### Weekly Maintenance
- [ ] Review auto-merged PRs for any issues
- [ ] Check metrics collection for anomalies
- [ ] Verify security scans are running
- [ ] Monitor GitHub Actions usage (stay within limits)

### Monthly Review
- [ ] Analyze auto-merge success rate
- [ ] Review false positive/negative rates
- [ ] Update auto-merge criteria if needed
- [ ] Clean up old metric data if storage grows

### Quarterly Tasks
- [ ] Review instruction sync accuracy
- [ ] Update automation documentation
- [ ] Assess new automation opportunities
- [ ] Security audit of automation workflows

### Troubleshooting Guide

#### Auto-Merge Not Working
1. **Check repository settings:** Auto-merge enabled?
2. **Verify branch protection:** Force pushes allowed for admins?
3. **Review workflow logs:** Any errors in auto-merge action?
4. **Test permissions:** Does bot have merge permissions?

#### Metrics Collection Failing
1. **Check test suite:** Are tests passing?
2. **Verify scripts:** Do metric collection scripts exist?
3. **Review JSON output:** Is format valid?
4. **Check storage:** Within GitHub storage limits?

#### Security Alerts Not Triggering
1. **Verify npm audit:** Run manually to test
2. **Check workflow schedule:** Is it running daily?
3. **Review alert configuration:** Correct notification channels?
4. **Test threshold settings:** Are they too restrictive?

### Emergency Procedures

#### Disable Auto-Merge
```bash
# Disable auto-merge globally
gh api repos/dcyfr/dcyfr-labs --method PATCH \
    --field allow_auto_merge=false
```

#### Manual Metric Collection
```bash
# Run metrics collection manually
npm test -- --reporter=json > reports/test-results.json
npm run lighthouse-ci
node scripts/collect-metrics.mjs
```

#### Force Instruction Sync
```bash
# Trigger instruction sync manually
gh workflow run scheduled-instruction-sync.yml
```

---

**Last Updated:** December 12, 2025  
**Owner:** DevOps Team  
**Review Schedule:** Monthly system review, quarterly optimization  
**Status:** ✅ Active and monitored
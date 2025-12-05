# Vercel Deployment Checks - Quick Setup

Follow these steps to enable automated quality gates on every Vercel deployment.

## Prerequisites

- ✅ Project deployed to Vercel
- ✅ Vercel connected to GitHub repository
- ✅ GitHub Actions enabled

## Setup Steps (5 minutes)

### 1. Create Vercel API Token

1. Go to [https://vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click **"Create Token"**
3. Name: `GitHub Actions - Deployment Checks`
4. Scope: Select **"Full Access"** or minimum:
   - ✅ Deployments (Read & Write)
5. Click **"Create"**
6. **Copy the token** (you won't see it again!)

### 2. Add Token to GitHub Secrets

**Option A: GitHub CLI**
```bash
gh secret set VERCEL_TOKEN --body "your-vercel-token-here"
```

**Option B: GitHub Web UI**
1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `VERCEL_TOKEN`
5. Value: Paste the token from step 1
6. Click **"Add secret"**

### 2b. Add Automation Bypass Secret (For Password-Protected Deployments)

If your Vercel deployments are password-protected, add the bypass secret:

**Option A: GitHub CLI**
```bash
gh secret set VERCEL_AUTOMATION_BYPASS_SECRET --body "your-bypass-secret"
```

**Option B: GitHub Web UI**
1. Same steps as above, but use:
   - Name: `VERCEL_AUTOMATION_BYPASS_SECRET`
   - Value: Get from Vercel → Project Settings → Deployment Protection → Automation Bypass Secret
2. Click **"Add secret"**

**Where to find it:**
1. Go to Vercel dashboard → Your project
2. Settings → Deployment Protection
3. Enable "Password Protection" if not already enabled
4. Copy the **"Automation Bypass Secret"**

### 3. Verify Workflow Exists

Check that `.github/workflows/vercel-checks.yml` exists in your repository.

If not, pull the latest changes:
```bash
git pull origin preview
```

### 4. Test the Integration

**Deploy to preview:**
```bash
git add .
git commit -m "Enable Vercel Deployment Checks"
git push origin preview
```

Vercel will deploy, and GitHub Actions will automatically:
1. Register 3 checks with Vercel
2. Run bundle size validation
3. Run Lighthouse audits
4. Compare against performance baselines
5. Block deployment if checks fail

### 5. View Results

**In Vercel Dashboard:**
1. Go to [vercel.com](https://vercel.com)
2. Select your project
3. Click on the latest deployment
4. Scroll to **"Checks"** section
5. See real-time status of all checks

**In GitHub Actions:**
1. Go to repository → **Actions** tab
2. Click on **"Vercel Deployment Checks"** workflow
3. View detailed logs and outputs

## What Gets Checked

### 1. Bundle Size Validation ✅
- Validates total bundle size < 250 kB (error threshold)
- Compares against baselines (if established)
- Reports top 10 largest bundles

### 2. Lighthouse Performance ✅
- Audits 5 key pages (/, /blog, /work, /about, /contact)
- Validates Performance ≥ 90%
- Validates Accessibility ≥ 95%
- Checks Core Web Vitals (LCP, INP, CLS)

### 3. Performance Baseline Validation ✅
- Aggregates bundle + Lighthouse results
- Blocks on regressions >25% (bundles) or >10 points (Lighthouse)
- Warns on moderate regressions

## Expected Behavior

### ✅ Checks Pass
- Deployment proceeds to production
- All metrics within thresholds
- Green checkmarks in Vercel dashboard

### ⚠️ Checks Warn
- Deployment proceeds with warnings
- Minor regressions detected (within warning thresholds)
- Yellow warnings in Vercel dashboard

### ❌ Checks Fail
- **Deployment blocked** (does not get production alias)
- Critical regressions detected
- Preview URL remains accessible for debugging
- Red errors in Vercel dashboard

## Troubleshooting

### "401 Unauthorized" Error
- **Fix:** Verify `VERCEL_TOKEN` is added to GitHub secrets
- **Check:** Token has correct scope (Deployments Read & Write)

### "Password Required" or "403 Forbidden" on Lighthouse Check
- **Fix:** Add `VERCEL_AUTOMATION_BYPASS_SECRET` to GitHub secrets
- **Get secret:** Vercel → Project Settings → Deployment Protection → Automation Bypass
- **Note:** Only needed if deployments are password-protected

### Checks Don't Run
- **Fix:** Verify Vercel is connected to GitHub
- **Check:** GitHub App integration is active in Vercel settings

### Workflow Not Triggering
- **Fix:** Ensure workflow file exists at `.github/workflows/vercel-checks.yml`
- **Check:** File is committed and pushed to your branch

### All Checks Fail Immediately
- **Fix:** Check GitHub Actions logs for error messages
- **Common issues:**
  - Missing dependencies (run `npm ci`)
  - Build failures (run `npm run build` locally)
  - Invalid Lighthouse config

## Adjusting Thresholds

Edit `performance-baselines.json`:

```json
{
  "regressionThresholds": {
    "bundles": {
      "warning": 10,  // 10% increase = warning
      "error": 25     // 25% increase = error (blocks)
    },
    "lighthouse": {
      "warning": 5,   // 5 point decrease = warning
      "error": 10     // 10 point decrease = error (blocks)
    }
  }
}
```

Commit and push changes - new thresholds apply immediately.

## Next Steps

1. ✅ **Wait for first deployment** to complete with checks
2. ✅ **Review check outputs** in Vercel dashboard
3. ✅ **Establish baselines** after collecting production metrics
4. ✅ **Configure Vercel Speed Insights alerts** for ongoing monitoring

## Documentation

- **Full Guide:** `docs/platform/vercel-deployment-checks.md`
- **Workflow File:** `.github/workflows/vercel-checks.yml`
- **Baselines Config:** `performance-baselines.json`

## Support

- **View workflow runs:** [GitHub Actions](https://github.com/dcyfr/dcyfr-labs/actions)
- **Check status:** [Vercel Dashboard](https://vercel.com)
- **Report issues:** [GitHub Issues](https://github.com/dcyfr/dcyfr-labs/issues)

---

**Setup Time:** 5 minutes  
**First Check Run:** Automatic on next deployment  
**Maintenance:** Zero (fully automated)

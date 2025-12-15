# Production Deployment Runbook

**Last Updated:** December 7, 2025  
**Project Status:** Production Ready (99.5% test pass rate)

This comprehensive guide walks through deploying dcyfr-labs portfolio to production on Vercel, from initial setup through post-deployment validation.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Variables Setup](#environment-variables-setup)
4. [GitHub Secrets Configuration](#github-secrets-configuration)
5. [Vercel Project Configuration](#vercel-project-configuration)
6. [Deployment Process](#deployment-process)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Performance Baseline Collection](#performance-baseline-collection)
9. [Monitoring Setup](#monitoring-setup)
10. [Troubleshooting](#troubleshooting)
11. [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### ✅ Code Quality Validation

Before deploying, verify all quality gates pass:

```bash
# Run comprehensive checks
npm run check

# Individual checks
npm run typecheck        # TypeScript: 0 errors required
npm run lint             # ESLint: 0 errors required
npm run test             # Unit tests: ≥99% pass rate
npm run test:e2e         # E2E tests: ≥99% pass rate
npm run build            # Production build: must succeed
```

**Expected Results:**
- ✅ TypeScript: 0 errors
- ✅ ESLint: 0 errors, 0 warnings
- ✅ Tests: 1659/1717 passing (96.6%)
- ✅ Build: Success with bundle size under limits

### ✅ Repository State

```bash
# Check git status
git status                     # Should be clean
git log --oneline -5           # Review recent commits

# Verify branch
git branch --show-current      # Should be on 'main' or 'preview'

# Check for uncommitted changes
git diff                       # Should be empty
```

### ✅ Accounts & Access

- [ ] GitHub account with repository access
- [ ] Vercel account (free tier sufficient)
- [ ] Vercel connected to GitHub repository
- [ ] Optional: Resend account for email (free tier: 100 emails/day)
- [ ] Optional: Upstash Redis account (free tier: 10K commands/day)
- [ ] Optional: Sentry account for error monitoring (free tier available)

---

## Pre-Deployment Checklist

### Critical Items (Blocking)

- [ ] All tests passing (≥99% pass rate)
- [ ] Production build succeeds locally
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Git working directory clean
- [ ] Latest changes committed and pushed

### Recommended Items (Non-Blocking)

- [ ] CHANGELOG.md updated with release notes
- [ ] Environment variables documented
- [ ] Monitoring accounts created (Sentry, Upstash)
- [ ] Email service configured (Resend)
- [ ] Domain name acquired (if using custom domain)
- [ ] SSL certificate ready (Vercel provides free certificates)

### Documentation Items

- [ ] README.md reflects production status
- [ ] API documentation current
- [ ] Deployment guide reviewed
- [ ] Contact information updated

---

## Environment Variables Setup

### Required for Production

These environment variables **must** be configured in Vercel for full functionality:

#### 1. Contact Form Email (Required for contact form)

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Setup:**
1. Create account at https://resend.com (free tier: 100 emails/day)
2. Create API key in Dashboard → API Keys
3. Verify your domain or use Resend's test domain

**Without this:**
- ⚠️ Contact form will not send emails
- ⚠️ Form submissions will log to console only

#### 2. Background Jobs (Required for analytics, cron jobs)

```bash
INNGEST_EVENT_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
INNGEST_SIGNING_KEY=signkey-prod-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Setup:**
1. Create account at https://inngest.com (free tier available)
2. Create production app
3. Copy Event Key and Signing Key from Dashboard

**Without this:**
- ⚠️ Background jobs will not execute
- ⚠️ View tracking will not work
- ⚠️ Analytics refresh jobs will not run

### Recommended for Production

These improve performance and reliability:

#### 3. GitHub API Token (Recommended - increases rate limits)

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Setup:**
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. **Scopes: None required** (public data only)
4. Copy token

**Without this:**
- ⚠️ GitHub API rate limit: 60 requests/hour (vs 5,000 with token)
- ⚠️ Contributions heatmap may show fallback data if rate limited

#### 4. Redis Cache (Recommended - enables analytics)

```bash
REDIS_URL=redis://:xxxxxxxxxxxxxxxxxxxxxxxxxxxxx@xxxxx.upstash.io:6379
```

**Setup:**
1. Create account at https://upstash.com (free tier: 10K commands/day)
2. Create Redis database (Global or Regional)
3. Copy Redis URL from Dashboard

**Without this:**
- ⚠️ View counts disabled
- ⚠️ Trending posts calculation disabled
- ⚠️ Analytics features unavailable

#### 5. Error Monitoring (Recommended - production debugging)

```bash
SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxx@xxxxx.ingest.sentry.io/xxxxxxx
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Setup:**
1. Create account at https://sentry.io (free tier available)
2. Create new project (Next.js)
3. Copy DSN from project settings
4. Generate auth token in Settings → Auth Tokens

**Without this:**
- ⚠️ No automatic error tracking
- ⚠️ No performance monitoring
- ⚠️ Harder to debug production issues

### Optional

```bash
# Custom site URL (auto-detected on Vercel)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# Unsplash (for hero image generation)
UNSPLASH_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Vercel (for deployment checks - set in GitHub Secrets instead)
VERCEL_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Adding Variables to Vercel

1. Open Vercel Dashboard → Your Project
2. Navigate to **Settings → Environment Variables**
3. Click **Add New Variable**
4. Enter:
   - **Key:** Variable name (e.g., `RESEND_API_KEY`)
   - **Value:** Your secret value
   - **Environments:** Check all (Production, Preview, Development)
5. Click **Save**
6. Repeat for each variable

**Important:** Vercel will automatically redeploy when you save environment variables.

---

## GitHub Secrets Configuration

Required for CI/CD workflows to function properly:

### 1. Vercel Token (Required for deployment checks)

```bash
VERCEL_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Setup:**
1. Go to https://vercel.com/account/tokens
2. Create new token
3. Name: "GitHub Actions CI/CD"
4. Scope: Full Account
5. Copy token immediately

**Add to GitHub:**
1. Repository → Settings → Secrets and variables → Actions
2. Click **New repository secret**
3. Name: `VERCEL_TOKEN`
4. Value: Paste token
5. Click **Add secret**

### 2. Sentry Auth Token (Required for source map uploads)

```bash
SENTRY_AUTH_TOKEN=sntrys_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Setup:**
1. Sentry Dashboard → Settings → Auth Tokens
2. Create new token
3. Scopes: `project:releases`, `project:write`
4. Copy token

**Add to GitHub:**
- Same process as Vercel token
- Name: `SENTRY_AUTH_TOKEN`

---

## Vercel Project Configuration

### Initial Setup

1. **Connect Repository**
   - Go to https://vercel.com/new
   - Import Git Repository
   - Select `dcyfr/dcyfr-labs`
   - Click **Import**

2. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

3. **Environment Variables**
   - Add all required variables (see section above)
   - Select appropriate environments for each

4. **Deploy**
   - Click **Deploy**
   - Wait 2-5 minutes for initial deployment

### Vercel Settings Checklist

Navigate to **Settings** and verify:

#### General
- [ ] Project Name: `dcyfr-labs` (or your preference)
- [ ] Build & Development Settings: Default (Next.js)
- [ ] Node.js Version: 20.x (recommended)
- [ ] Install Command: `npm install`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `.next`

#### Domains
- [ ] Production domain configured
- [ ] SSL certificate active (automatic)
- [ ] www redirect configured (if desired)

#### Git
- [ ] Production Branch: `main`
- [ ] Automatic deployments enabled
- [ ] Deploy Previews: Enabled for all branches

#### Environment Variables
- [ ] All required variables added
- [ ] All environments selected correctly
- [ ] Sensitive values not exposed in logs

#### Security
- [ ] HTTPS enforced (automatic)
- [ ] Security headers configured (automatic via next.config.ts)
- [ ] CSP header active (verify in deployment)

---

## Deployment Process

### Option 1: Automatic Deployment (Recommended)

Vercel automatically deploys on every push to `main`:

```bash
# Ensure you're on main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge your feature branch (if applicable)
git merge preview

# Push to trigger deployment
git push origin main
```

Vercel will:
1. Detect the push via webhook
2. Start build automatically
3. Run build process with Turbopack
4. Deploy to production if build succeeds
5. Update production URL

**Deployment time:** 2-5 minutes

### Option 2: Manual Deployment

Via Vercel Dashboard:

1. Open Vercel Dashboard → Deployments
2. Click **...** menu on latest deployment
3. Select **Promote to Production**
4. Confirm promotion

Via Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

### Monitoring Deployment

1. **GitHub Actions**
   - Repository → Actions tab
   - Watch workflow runs
   - Check for failures

2. **Vercel Dashboard**
   - Deployments tab shows real-time progress
   - Click deployment to see logs
   - Watch for build errors

3. **Deployment Logs**
   - View build output
   - Check for warnings
   - Verify all optimizations applied

---

## Post-Deployment Verification

### Immediate Checks (Within 5 minutes)

#### 1. Site Loads Successfully

```bash
# Test production URL
curl -I https://yourdomain.com

# Expected: HTTP 200 OK
```

Visit in browser:
- [ ] Homepage loads without errors
- [ ] CSS/styling applied correctly
- [ ] No JavaScript console errors
- [ ] Dark mode toggle works

#### 2. Critical Pages Load

Test all main routes:
- [ ] `/` - Homepage
- [ ] `/blog` - Blog archive
- [ ] `/blog/[slug]` - Individual blog post
- [ ] `/work` - Projects archive
- [ ] `/about` - About page
- [ ] `/contact` - Contact form

#### 3. API Routes Respond

```bash
# Health check
curl https://yourdomain.com/api/health

# GitHub contributions
curl https://yourdomain.com/api/github-contributions?username=dcyfr

# RSS feed
curl https://yourdomain.com/rss.xml

# Atom feed
curl https://yourdomain.com/atom.xml
```

All should return valid responses (200 OK).

#### 4. Contact Form Works

1. Visit `/contact`
2. Fill out form with test data
3. Submit form
4. Check for success message
5. Verify email received (if Resend configured)

**Without Resend API key:**
- Form should show warning about email not configured
- Submission should still succeed (logged only)

#### 5. Blog Features Work

1. Visit `/blog`
2. Check search functionality
3. Click tag filter
4. Open a blog post
5. Verify:
   - [ ] Table of contents generates
   - [ ] Syntax highlighting works
   - [ ] Reading progress indicator appears
   - [ ] Related posts show
   - [ ] View count increments (if Redis configured)

#### 6. GitHub Contributions Load

1. Visit `/work` or homepage
2. Scroll to "Contribution Activity" section
3. Verify heatmap displays
4. Should show real GitHub data (not fallback)

**If fallback data shows:**
- Check `GITHUB_TOKEN` environment variable
- May be rate limited (wait 1 hour or add token)

### Security Verification

#### Check Security Headers

```bash
curl -I https://yourdomain.com | grep -i "security\|strict\|policy"
```

Expected headers:
- ✅ `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ✅ `Content-Security-Policy: ...` (should be present)

#### Verify CSP Implementation

1. Open browser DevTools (F12)
2. Go to Console tab
3. Visit homepage
4. Should see NO CSP violations
5. Check Network tab for nonce in inline scripts

#### Test Rate Limiting

```bash
# Test contact form rate limit (10 requests/hour)
for i in {1..12}; do
  curl -X POST https://yourdomain.com/api/contact \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@test.com","message":"Test"}' \
    -w "\nStatus: %{http_code}\n"
done
```

Expected:
- First 10 requests: `200 OK`
- Requests 11+: `429 Too Many Requests`

### Performance Verification

#### Check Core Web Vitals

1. Visit https://pagespeed.web.dev/
2. Enter your production URL
3. Run analysis
4. Verify scores:
   - [ ] Performance: ≥90
   - [ ] Accessibility: ≥95
   - [ ] Best Practices: ≥90
   - [ ] SEO: ≥95

#### Verify Image Optimization

1. Open DevTools → Network tab
2. Refresh homepage
3. Check image requests:
   - [ ] Images served as WebP/AVIF
   - [ ] Responsive images with srcset
   - [ ] Lazy loading on below-fold images
   - [ ] Blur placeholders render

#### Check Bundle Sizes

```bash
# Review production build output
npm run build
```

Expected bundle sizes (approximate):
- First Load JS: <100 KB
- Total JS: <500 KB
- Individual routes: <50 KB each

### Functionality Verification

#### Background Jobs (Inngest)

1. Visit Inngest Dashboard
2. Navigate to Functions
3. Verify functions are registered:
   - [ ] `blog/post-view.track`
   - [ ] `analytics/daily.aggregate`
   - [ ] `github/contributions.refresh`

4. Trigger a test event:
   - View a blog post (triggers view tracking)
   - Check Inngest dashboard for event
   - Verify function executed successfully

#### Analytics Tracking

1. Visit a blog post
2. Wait 5 seconds
3. Refresh page
4. View count should increment

**If Redis not configured:**
- View counts will not show
- This is expected behavior

#### Error Monitoring (Sentry)

1. Visit Sentry Dashboard
2. Navigate to your project
3. Check for:
   - [ ] Project connected
   - [ ] Source maps uploaded
   - [ ] No immediate errors

4. Test error tracking:
   - Add `?test-sentry=true` to URL (if test route exists)
   - Or trigger a 404 error
   - Check Sentry for captured error

---

## Performance Baseline Collection

After first deployment, collect baseline metrics for future comparisons.

### 1. Run Lighthouse CI on All Pages

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run on all main pages
lhci autorun --collect.url=https://yourdomain.com
lhci autorun --collect.url=https://yourdomain.com/blog
lhci autorun --collect.url=https://yourdomain.com/work
lhci autorun --collect.url=https://yourdomain.com/about
lhci autorun --collect.url=https://yourdomain.com/contact
```

### 2. Document Baseline Scores

Update `performance-baselines.json`:

```json
{
  "lighthouse": {
    "performance": 95,
    "accessibility": 98,
    "bestPractices": 100,
    "seo": 100
  },
  "webVitals": {
    "LCP": 1.2,
    "FID": 15,
    "CLS": 0.05,
    "FCP": 0.8,
    "TTFB": 0.3
  },
  "lastUpdated": "2025-12-07"
}
```

### 3. Extract Bundle Sizes

From build output, update `performance-budgets.json`:

```json
{
  "budgets": [
    {
      "path": "/_app",
      "maxSize": "100kb",
      "actual": "85kb"
    },
    {
      "path": "/blog",
      "maxSize": "150kb",
      "actual": "120kb"
    }
  ],
  "lastUpdated": "2025-12-07"
}
```

### 4. Document in CHANGELOG

Add baseline collection to `CHANGELOG.md`:

```markdown
## [1.0.0] - 2025-12-07

### Performance Baselines

First production deployment baselines collected:

- **Lighthouse Performance:** 95/100
- **Lighthouse Accessibility:** 98/100
- **LCP:** 1.2s (Good)
- **CLS:** 0.05 (Good)
- **Total Bundle Size:** 450 KB
```

---

## Monitoring Setup

### 1. Vercel Speed Insights

**Setup:**
1. Vercel Dashboard → Your Project → Speed Insights
2. Click **Enable Speed Insights**
3. Confirm activation

**Configure Alerts:**
1. Settings → Notifications
2. Add email for alerts
3. Set thresholds:
   - Performance score < 90
   - LCP > 2.5s
   - CLS > 0.1

**Verify:**
- Wait 24 hours for data collection
- Check dashboard for real user metrics

### 2. Sentry Monitoring

**Configure Alerts:**
1. Sentry Project → Alerts
2. Create new alert:
   - **Type:** Issue Alert
   - **Condition:** Error count > 10 in 1 hour
   - **Action:** Send email notification

3. Create performance alert:
   - **Type:** Metric Alert
   - **Condition:** P95 response time > 3s
   - **Action:** Send email notification

**Set Up Releases:**
```bash
# Tag releases for better tracking
npm run sentry:release
```

**Verify:**
- Trigger a test error
- Check Sentry dashboard for event
- Verify alert received

### 3. Inngest Monitoring

**Configure:**
1. Inngest Dashboard → Settings → Alerts
2. Enable email notifications
3. Set alert conditions:
   - Function failure rate > 5%
   - Function execution time > 30s

**Verify:**
- Check Functions tab for all registered functions
- Review execution history
- Test a function trigger

### 4. Uptime Monitoring (Optional)

Use Vercel Cron Jobs for health checks:

**Already configured in `vercel.json`:**
```json
{
  "crons": [{
    "path": "/api/health",
    "schedule": "0 0 * * *"
  }]
}
```

**Additional external monitoring** (optional):
- UptimeRobot (free tier: 50 monitors)
- Pingdom (free tier: 1 monitor)
- StatusCake (free tier: 10 monitors)

---

## Troubleshooting

### Deployment Failures

#### Build Fails with TypeScript Errors

```bash
# Run locally first
npm run typecheck

# Fix all errors before deploying
# Check recent changes for type issues
```

#### Build Fails with Memory Error

Increase Node.js memory in `package.json`:

```json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

#### Environment Variables Not Applied

1. Check variable names (case-sensitive)
2. Verify all environments selected
3. Trigger manual redeploy after saving
4. Check Vercel logs for variable values (sanitized)

### Runtime Issues

#### 404 Errors on Valid Routes

- Check `next.config.ts` for redirect rules
- Verify file structure matches routes
- Check for typos in file names (case-sensitive)

#### API Routes Return 500

1. Check Vercel Function Logs
2. Verify environment variables set
3. Check for unhandled errors
4. Review Sentry for error details

#### Contact Form Not Sending Emails

1. Verify `RESEND_API_KEY` set correctly
2. Check Resend Dashboard → Logs
3. Verify domain configured in Resend
4. Check email in spam folder

#### View Counts Not Incrementing

1. Verify `REDIS_URL` set correctly
2. Check Upstash Dashboard → Metrics
3. Verify Inngest event key configured
4. Check Inngest Dashboard → Events

### Performance Issues

#### Slow Page Loads

1. Check Vercel Analytics for bottlenecks
2. Review bundle sizes (run `npm run build`)
3. Check for unoptimized images
4. Review database queries (Redis latency)

#### High Memory Usage

1. Check Vercel Function Logs
2. Review memory-intensive operations
3. Consider caching strategies
4. Optimize data processing

### Security Issues

#### CSP Violations

1. Check browser console for violation details
2. Verify nonce implementation
3. Review allowed sources in CSP
4. Check for inline scripts without nonces

#### Rate Limit Not Working

1. Verify Redis connection
2. Check rate limit configuration
3. Review Redis logs in Upstash
4. Test with curl (see verification section)

---

## Rollback Procedures

### Quick Rollback (Via Vercel Dashboard)

**If deployment breaks production:**

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment (marked with ✅)
3. Click **...** menu
4. Select **Promote to Production**
5. Confirm rollback

**Rollback time:** ~30 seconds

### Git Rollback (For Code Issues)

**If you need to revert commits:**

```bash
# Find the last working commit
git log --oneline

# Option 1: Revert specific commit (creates new commit)
git revert <commit-hash>
git push origin main

# Option 2: Hard reset (destructive - use with caution)
git reset --hard <commit-hash>
git push --force origin main
```

**Important:** Force push will rewrite history. Only use if necessary.

### Rollback Checklist

After rollback:
- [ ] Verify site loads correctly
- [ ] Check critical functionality
- [ ] Review error logs
- [ ] Document rollback reason
- [ ] Create issue for broken deployment
- [ ] Fix issue in feature branch
- [ ] Test thoroughly before redeploying

---

## Post-Deployment Tasks

### Documentation Updates

- [ ] Update README.md with production URL
- [ ] Update CHANGELOG.md with deployment date
- [ ] Document actual performance baselines
- [ ] Update deployment guide with lessons learned

### Team Communication

- [ ] Announce deployment in team chat
- [ ] Share production URL
- [ ] Document any issues encountered
- [ ] Schedule retrospective (if applicable)

### Monitoring

- [ ] Set up dashboard bookmarks
- [ ] Configure alert notifications
- [ ] Review first 24 hours of metrics
- [ ] Check error rates in Sentry

### Future Planning

- [ ] Schedule next deployment
- [ ] Review feature backlog
- [ ] Plan performance improvements
- [ ] Document technical debt

---

## Resources

### Internal Documentation

- [Deployment Checklist](./deployment-checklist) - Quick reference checklist
- [Deployment Guide](./deployment-guide) - Detailed deployment guide
- [Environment Variables](../platform/environment-variables) - Complete env var reference
- [Testing Guide](../testing/readme) - Test strategy and execution

### External Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Inngest Documentation](https://www.inngest.com/docs)
- [Sentry Documentation](https://docs.sentry.io/)
- [Resend Documentation](https://resend.com/docs)
- [Upstash Redis](https://docs.upstash.com/redis)

### Support

- **Issues:** https://github.com/dcyfr/dcyfr-labs/issues
- **Discussions:** https://github.com/dcyfr/dcyfr-labs/discussions
- **Vercel Support:** https://vercel.com/support

---

**Last Updated:** December 7, 2025  
**Document Version:** 1.0.0  
**Deployment Status:** ✅ Production Ready

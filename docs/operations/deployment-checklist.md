# Deployment Checklist

**Last Updated:** December 7, 2025  
**Status:** Production Ready (99.5% test pass rate)

Comprehensive checklist for deploying dcyfr-labs portfolio to production. For detailed step-by-step instructions, see [PRODUCTION_DEPLOYMENT.md](./production-deployment).

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Variables](#environment-variables)
3. [GitHub Secrets](#github-secrets)
4. [Vercel Configuration](#vercel-configuration)
5. [Deployment Verification](#deployment-verification)
6. [Post-Deployment Tasks](#post-deployment-tasks)
7. [GitHub Contributions Setup](#github-contributions-setup)

---

## Pre-Deployment Checklist

### Code Quality (Must Pass)

- [ ] **TypeScript**: Run `npm run typecheck` - 0 errors required
- [ ] **ESLint**: Run `npm run lint` - 0 errors required
- [ ] **Tests**: Run `npm run test` - ≥99% pass rate (1339/1346)
- [ ] **E2E Tests**: Run `npm run test:e2e` - All critical paths passing
- [ ] **Build**: Run `npm run build` - Success with no errors
- [ ] **Bundle Size**: Check build output - Within budget limits

### Repository State

- [ ] **Git Status**: Working directory clean (`git status`)
- [ ] **Branch**: On `main` or `preview` branch
- [ ] **Commits**: All changes committed
- [ ] **Push**: Latest code pushed to GitHub
- [ ] **Conflicts**: No merge conflicts with target branch

### Documentation

- [ ] **CHANGELOG.md**: Updated with release notes
- [ ] **README.md**: Reflects current production status
- [ ] **API Docs**: Current and accurate
- [ ] **Environment Variables**: Documented in platform docs

### Accounts & Access

- [ ] **GitHub**: Repository access confirmed
- [ ] **Vercel**: Account created and connected to GitHub
- [ ] **Resend**: API key obtained (optional for email)
- [ ] **Upstash**: Redis URL obtained (optional for analytics)
- [ ] **Sentry**: DSN obtained (optional for monitoring)
- [ ] **Inngest**: Event & signing keys obtained (required for jobs)

---

## Environment Variables

### Required Variables

Configure in **Vercel Dashboard** → **Settings** → **Environment Variables**

#### Contact Form Email

- [ ] **`RESEND_API_KEY`**: Resend API key for email delivery
  - Source: https://resend.com → API Keys
  - Environments: Production, Preview, Development
  - Required for: Contact form functionality

#### Background Jobs

- [ ] **`INNGEST_EVENT_KEY`**: Inngest event key
  - Source: https://inngest.com → Dashboard
  - Environments: Production, Preview, Development
  - Required for: Analytics, view tracking, cron jobs

- [ ] **`INNGEST_SIGNING_KEY`**: Inngest signing key
  - Source: https://inngest.com → Dashboard
  - Environments: Production, Preview, Development
  - Required for: Secure webhook verification

### Recommended Variables

- [ ] **`GITHUB_TOKEN`**: GitHub personal access token (no scopes needed)
  - Source: https://github.com/settings/tokens
  - Benefit: Increases API rate limit from 60 to 5,000 req/hr
  - Without: Contributions heatmap may show fallback data

- [ ] **`REDIS_URL`**: Upstash Redis connection URL
  - Source: https://upstash.com → Database → REST API
  - Benefit: Enables view counts and analytics features
  - Without: View counts and trending posts disabled

- [ ] **`SENTRY_DSN`**: Sentry error tracking DSN
  - Source: https://sentry.io → Project Settings
  - Benefit: Production error monitoring and debugging
  - Without: No automatic error tracking

- [ ] **`SENTRY_AUTH_TOKEN`**: Sentry auth token (for source maps)
  - Source: https://sentry.io → Settings → Auth Tokens
  - Benefit: Readable stack traces in production
  - Without: Minified stack traces only

### Optional Variables

- [ ] **`NEXT_PUBLIC_SITE_URL`**: Override site URL (auto-detected)
- [ ] **`UNSPLASH_ACCESS_KEY`**: For hero image generation
- [ ] **`VERCEL_TOKEN`**: For deployment checks (set in GitHub Secrets instead)

---

## GitHub Secrets

Configure in **Repository** → **Settings** → **Secrets and variables** → **Actions**

### Required Secrets

- [ ] **`VERCEL_TOKEN`**: Vercel API token
  - Source: https://vercel.com/account/tokens
  - Purpose: Deployment checks workflow
  - Scopes: Full Account access

- [ ] **`SENTRY_AUTH_TOKEN`**: Sentry auth token
  - Source: https://sentry.io → Settings → Auth Tokens
  - Purpose: Source map uploads during build
  - Scopes: `project:releases`, `project:write`

---

## Vercel Configuration

### Project Settings

- [ ] **Framework Preset**: Next.js (auto-detected)
- [ ] **Root Directory**: `./` (default)
- [ ] **Build Command**: `npm run build` (default)
- [ ] **Output Directory**: `.next` (default)
- [ ] **Install Command**: `npm install` (default)
- [ ] **Node.js Version**: 20.x (recommended)

### Git Integration

- [ ] **Production Branch**: `main` configured
- [ ] **Automatic Deployments**: Enabled
- [ ] **Deploy Previews**: Enabled for all branches
- [ ] **Comments on Pull Requests**: Enabled

### Domains

- [ ] **Production Domain**: Configured and verified
- [ ] **SSL Certificate**: Active (automatic)
- [ ] **HTTPS Redirect**: Enabled (automatic)
- [ ] **www Redirect**: Configured (if desired)

### Security

- [ ] **HTTPS Enforced**: Active (automatic)
- [ ] **Security Headers**: Verified in deployment
- [ ] **CSP Header**: Active with nonce implementation
- [ ] **Environment Variables**: Not exposed in logs

---

## Deployment Verification

### Immediate Checks (Within 5 minutes)

#### Site Loads

- [ ] **Homepage**: Visit `/` - loads without errors
- [ ] **CSS/JS**: Styling and scripts load correctly
- [ ] **Dark Mode**: Toggle works properly
- [ ] **Console**: No JavaScript errors in browser console

#### Critical Pages

- [ ] **`/`**: Homepage loads
- [ ] **`/blog`**: Blog archive loads with filtering
- [ ] **`/blog/[slug]`**: Blog post renders with TOC
- [ ] **`/work`**: Projects archive loads
- [ ] **`/about`**: About page loads
- [ ] **`/contact`**: Contact form displays

#### API Routes

- [ ] **`/api/health`**: Returns 200 OK
- [ ] **`/api/github-contributions`**: Returns JSON data
- [ ] **`/rss.xml`**: RSS feed validates
- [ ] **`/atom.xml`**: Atom feed validates

#### Features

- [ ] **Contact Form**: Submit test form successfully
- [ ] **Email Delivery**: Verify email received (if Resend configured)
- [ ] **Search**: Blog search returns results
- [ ] **Filtering**: Tag/category filters work
- [ ] **View Tracking**: View count increments (if Redis configured)

### Security Verification

- [ ] **HTTPS**: All pages served over HTTPS
- [ ] **Security Headers**: Check with `curl -I https://yourdomain.com`
  - `Strict-Transport-Security` present
  - `X-Frame-Options: DENY` present
  - `Content-Security-Policy` present
- [ ] **CSP**: No violations in browser console
- [ ] **Rate Limiting**: Test contact form (11th request returns 429)

### Performance Verification

- [ ] **PageSpeed Insights**: Run on https://pagespeed.web.dev/
  - Performance: ≥90
  - Accessibility: ≥95
  - Best Practices: ≥90
  - SEO: ≥95
- [ ] **Image Optimization**: WebP/AVIF images served
- [ ] **Lazy Loading**: Below-fold images load on scroll
- [ ] **Bundle Sizes**: Within configured budgets

### Monitoring Verification

- [ ] **Vercel Analytics**: Dashboard shows data collection
- [ ] **Sentry**: Project connected, no immediate errors
- [ ] **Inngest**: Functions registered and events processing
- [ ] **Upstash**: Redis commands executing (if configured)

---

## Post-Deployment Tasks

### Performance Baselines

- [ ] **Run Lighthouse CI**: On all 5 main pages
- [ ] **Update `performance-baselines.json`**: With actual scores
- [ ] **Update `performance-budgets.json`**: With actual bundle sizes
- [ ] **Document in CHANGELOG**: Record baseline metrics

### Monitoring Setup

- [ ] **Vercel Speed Insights**: Enable and configure alerts
- [ ] **Sentry Alerts**: Configure error and performance alerts
- [ ] **Inngest Monitoring**: Verify function execution
- [ ] **Uptime Monitoring**: Configure external checks (optional)

### Documentation Updates

- [ ] **README.md**: Update with production URL
- [ ] **CHANGELOG.md**: Add deployment date and notes
- [ ] **Deployment Guide**: Document lessons learned
- [ ] **Performance Docs**: Update with actual metrics

### Team Communication

- [ ] **Announce Deployment**: Share in team channels
- [ ] **Share Production URL**: Distribute to stakeholders
- [ ] **Document Issues**: Log any problems encountered
- [ ] **Schedule Review**: Plan retrospective if applicable

---

## GitHub Contributions Setup

This section ensures the GitHub contributions feature works correctly in production.

---

## GitHub Contributions Setup

This section ensures the GitHub contributions feature works correctly in production.

### Setup Steps

#### 1. Verify API Endpoint

- [ ] **API Route Deployed**: `https://yourdomain.com/api/github-contributions?username=dcyfr`
- [ ] **Returns JSON**: Not 404 error
- [ ] **Data Valid**: Contains contribution data

#### 2. Add GitHub Token (Optional but Recommended)

- [ ] **Generate Token**: https://github.com/settings/tokens
  - Type: Classic token
  - Scopes: None (public data only)
  - Expiration: Your preference
- [ ] **Add to Vercel**: Environment Variables → `GITHUB_TOKEN`
- [ ] **Redeploy**: Trigger automatic redeploy

#### 3. Verify Display

- [ ] **Heatmap Loads**: Visit `/work` or homepage
- [ ] **Real Data**: Shows actual GitHub contributions
- [ ] **No Warnings**: No rate limit warnings (with token)
- [ ] **Fallback Works**: Graceful degradation without token

### Troubleshooting

- [ ] **"Unable to load"**: Check Vercel Function Logs
- [ ] **Stale Data**: Clear browser cache (24h TTL)
- [ ] **Demo Data**: Add `GITHUB_TOKEN` or wait for rate limit reset
- [ ] **Token Invalid**: Regenerate at GitHub settings

### Expected Behavior

**With Token**:
- ✅ 5,000 requests/hour rate limit
- ✅ No warnings
- ✅ Reliable data

**Without Token**:
- ⚠️ 60 requests/hour limit
- ⚠️ May show fallback data if rate limited
- ✅ Feature doesn't break

---

## Quick Reference

### Essential Commands

```bash
# Run all quality checks
npm run check

# Individual checks
npm run typecheck    # TypeScript
npm run lint         # ESLint  
npm run test         # Unit tests
npm run test:e2e     # E2E tests
npm run build        # Production build
```

### Deployment

```bash
# Automatic (push to main)
git push origin main

# Manual (Vercel CLI)
vercel --prod
```

### Verification

```bash
# Check site status
curl -I https://yourdomain.com

# Check API endpoint
curl https://yourdomain.com/api/health

# Check security headers
curl -I https://yourdomain.com | grep -i "security\|strict"
```

### Rollback

```bash
# Via Vercel Dashboard
# Deployments → Last working deployment → Promote to Production

# Via Git
git revert <commit-hash>
git push origin main
```

---

## Resources

- **[Production Deployment Runbook](./production-deployment)** - Detailed step-by-step guide
- **[Deployment Guide](./deployment-guide)** - Comprehensive deployment documentation
- **[Environment Variables](../platform/environment-variables)** - Complete reference
- **[Testing Guide](../testing/readme)** - Test strategy and execution

---

**Last Updated:** December 7, 2025  
**Document Version:** 1.0.0  
**Status:** ✅ Production Ready

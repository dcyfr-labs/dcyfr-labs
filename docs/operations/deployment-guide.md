<!-- TLP:CLEAR -->

# Deployment Guide

**Last Updated:** October 24, 2025

This guide covers deploying the dcyfr-labs portfolio to production and managing different environments.

## Overview

- **Primary Hosting:** Vercel (optimized, zero-config)
- **Build System:** Next.js 16 with Turbopack
- **Environment Management:** Automatic (dev/preview/production)
- **Optional Services:** GitHub API (public data), Resend (email), Redis (view counts)

---

## Quick Start: Deploy to Vercel

### 1. Connect Repository

```bash
# If not already connected, authorize Vercel with your GitHub account
# https://vercel.com/new
```

### 2. Set Environment Variables

In **Vercel Dashboard** → **Project Settings** → **Environment Variables**, add:

| Variable               | Required        | Value                             |
| ---------------------- | --------------- | --------------------------------- |
| `RESEND_API_KEY`       | Production only | Your Resend API key               |
| `GITHUB_TOKEN`         | Recommended     | Your GitHub personal access token |
| `REDIS_URL`            | Optional        | Your Redis URL (for view counts)  |
| `NEXT_PUBLIC_SITE_URL` | Optional        | Override site URL if needed       |

See [Environment Variables Reference](#environment-variables-reference) below for details.

### 3. Deploy

Vercel auto-deploys on every push to main:

```bash
git add .
git commit -m "feat: deploy"
git push origin main
```

Vercel will:

- ✅ Detect Next.js project
- ✅ Build with Turbopack
- ✅ Apply security headers (CSP, HSTS, etc.)
- ✅ Serve from global CDN
- ✅ Generate OG images automatically
- ✅ Apply cache headers for static assets

**Deployment time:** ~2-5 minutes

---

## Environment Management

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/dcyfr/dcyfr-labs.git
cd dcyfr-labs

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Add credentials (optional for local testing)
# All features work without credentials - see fallback behavior below

# 5. Start development server
npm run dev
```

**Development URL:** http://localhost:3000

**With HTTPS (for testing certain features):**

```bash
npm run dev:https  # Uses local certs in /certs
```

**What works without credentials:**

- ✅ Full blog (search, TOC, related posts, reading progress)
- ✅ All portfolio pages
- ✅ GitHub heatmap (with lower rate limit: 60 req/hr)
- ✅ Contact form (logs to console, shows warning)
- ⚠️ View counts disabled
- ⚠️ Emails not sent

### Preview Deployments

Every pull request automatically gets a preview deployment:

1. **Create PR** against `main` branch
2. **Vercel builds preview** automatically
3. **Unique URL generated** (shown in PR)
4. **Preview has same env vars** as production (for testing)

Use preview deployments for:

- Testing changes before merging
- Sharing work-in-progress with others
- Performance/SEO validation

**Preview URL structure:** `https://dcyfr-<branch>.vercel.app`

### Production Deployment

**Branch:** `main` (Vercel's default)

**Auto-deployment triggers:**

- ✅ Push to `main`
- ✅ Merge PR to `main`
- ✅ Changes to environment variables (redeploy required)

**Production environment variables:**

- `RESEND_API_KEY` (required for contact form emails)
- `GITHUB_TOKEN` (optional, improves API rate limits)
- `REDIS_URL` (optional, for view count persistence)
- `NEXT_PUBLIC_SITE_URL` (optional, for custom domain)

**Monitoring:**

- Visit [vercel.com/dashboard](https://vercel.com/dashboard)
- View deployment status and logs
- Rollback to previous deployment if needed

---

## Build Process

### Local Build

```bash
# Test production build locally
npm run build

# Start production server locally
npm start

# Run with HTTPS (requires certs, see /certs/README.md)
npm run dev:https
```

### Build Steps

1. **Sync MCP Agents** (`npm run sync:agents`)
   - Updates copilot-instructions.md to agents.md

2. **Lint Code** (`npm run lint`)
   - ESLint Flat config (Next.js + TypeScript)
   - Checks formatting and types

3. **Compile TypeScript**
   - Strict mode (`tsconfig.json`)
   - No implicit any, strict nulls

4. **Build Next.js**
   - Compiles React components
   - Generates routes
   - Optimizes bundles
   - Generates static files

5. **Generate OG Images** (automatic on Vercel)
   - Dynamic social preview images
   - Cached at edge

### Build Optimizations

- **Turbopack:** Uses modern bundler (faster builds)
- **Static Generation:** Blog posts pre-rendered at build time
- **ISR:** Option to regenerate content without rebuilding
- **Image Optimization:** next/image for responsive images
- **Code Splitting:** Automatic route-based splitting

---

## Environment Variables Reference

### Quick Reference Table

| Variable                  | Required   | Environment  | Purpose                        |
| ------------------------- | ---------- | ------------ | ------------------------------ |
| `RESEND_API_KEY`          | Production | Prod/Preview | Email delivery                 |
| `GITHUB_TOKEN`            | No         | All          | GitHub API rate limit increase |
| `REDIS_URL`               | No         | All          | View count persistence         |
| `NEXT_PUBLIC_SITE_URL`    | No         | All          | Override site URL              |
| `NEXT_PUBLIC_SITE_DOMAIN` | No         | All          | Override domain only           |

### Site Configuration

#### `NEXT_PUBLIC_SITE_URL`

**Type:** URL string
**Required:** No
**Default:** Auto-detected per environment

- Local: `https://www.dcyfr.dev`
- Preview: `https://dcyfr-preview.vercel.app`
- Production: `https://www.dcyfr.ai`

**When to set:** Custom domain, testing, non-standard deployments

**Example:**

```
NEXT_PUBLIC_SITE_URL=https://mydomain.com
```

#### `NEXT_PUBLIC_SITE_DOMAIN`

**Type:** Domain string
**Required:** No
**Default:** Auto-detected per environment

**When to set:** Domain-only override (easier than full URL)

**Example:**

```
NEXT_PUBLIC_SITE_DOMAIN=mydomain.com
```

### Email Configuration

#### `RESEND_API_KEY`

**Type:** API key string
**Required:** Yes for production (optional for local)
**Service:** [Resend](https://resend.com)

**Setup steps:**

1. Sign up at [resend.com](https://resend.com)
2. Go to [resend.com/api-keys](https://resend.com/api-keys)
3. Create API key
4. Verify sending domain (for production)
5. Add to environment variables

**Behavior without key:**

- ✅ Contact form displays
- ✅ Validation works
- ⚠️ Submissions logged to console only
- ❌ No emails sent
- ℹ️ User sees warning message

**Implementation:** `src/app/api/contact/route.ts`

### GitHub Integration

#### `GITHUB_TOKEN`

**Type:** Personal access token
**Required:** No (optional for better rate limits)
**Service:** GitHub

**Benefits of setting:**

- ✅ Increases rate limit from 60 to 5,000 requests/hour
- ✅ GitHub heatmap loads faster
- ✅ Better reliability for API calls

**Setup steps:**

1. Visit [github.com/settings/tokens](https://github.com/settings/tokens)
2. Generate new token (classic)
3. Give it a descriptive name
4. **Leave all scopes unchecked** (public data only)
5. Choose expiration (90 days, 1 year, or no expiration)
6. Copy token (shown only once)
7. Add to environment variables

**Token scopes:** None required (public data only, no permissions needed)

**Implementation:** `src/app/api/github-contributions/route.ts`

### Redis Configuration

#### `REDIS_URL`

**Type:** Connection string
**Required:** No (optional for persistence)
**Service:** Redis (or Upstash Redis)

**Format:**

```
REDIS_URL=redis://default:PASSWORD@HOST:PORT
# or Upstash format:
REDIS_URL=redis://default:PASSWORD@HOST:PORT
```

**Purpose:** Store blog post view counts persistently

**Without Redis:**

- ℹ️ View counts tracked in memory only
- ℹ️ Counts reset on deployment
- ✅ All other features work normally

**Popular providers:**

- [Upstash Redis](https://upstash.com) (serverless, free tier)
- [Redis Cloud](https://redis.com/try-free/) (managed, free tier)
- Self-hosted Redis

**Implementation:** `src/lib/redis.ts`

---

## Deployment Checklist

Use this checklist before deploying to production:

### Pre-Deployment

- [ ] Run `npm run lint` - No errors
- [ ] Run `npm run build` - Build succeeds locally
- [ ] Test locally with `npm start` - All features work
- [ ] Check blog posts render correctly
- [ ] Test contact form (with/without email key)
- [ ] Verify GitHub heatmap loads
- [ ] Check mobile responsiveness

### Environment Variables

- [ ] `RESEND_API_KEY` added to Vercel (if using email)
- [ ] `GITHUB_TOKEN` added to Vercel (recommended)
- [ ] `REDIS_URL` added to Vercel (if using Redis)
- [ ] All vars set for correct environments (Production, Preview, Development)

### Deployment

- [ ] Push to `main` branch
- [ ] Monitor deployment on Vercel dashboard
- [ ] Deployment completes successfully
- [ ] Visit production URL and test key features
- [ ] Check Lighthouse scores in deployment

### Post-Deployment

- [ ] Blog loads and search works
- [ ] Contact form functions (check email if configured)
- [ ] GitHub heatmap displays
- [ ] Social share images display (OG images)
- [ ] Mobile menu works
- [ ] Dark/light theme toggle works

### Monitoring

- [ ] Set up error tracking (Sentry recommended)
- [ ] Check analytics in Vercel dashboard
- [ ] Monitor deployments for issues
- [ ] Test new content before publishing

---

## Security & Performance

### Security Headers (vercel.json)

All requests include security headers:

| Header                                             | Purpose                                 |
| -------------------------------------------------- | --------------------------------------- |
| `X-Content-Type-Options: nosniff`                  | Prevent MIME-sniffing attacks           |
| `X-Frame-Options: DENY`                            | Prevent clickjacking                    |
| `Strict-Transport-Security`                        | Force HTTPS for 2 years                 |
| `Referrer-Policy: strict-origin-when-cross-origin` | Control referrer information            |
| `Permissions-Policy`                               | Disable camera, microphone, geolocation |
| `Content-Security-Policy`                          | Control resource loading                |

### Caching Strategy

**Static assets** (1 year cache):

- JavaScript bundles (`/_next/static/*`)
- Images (`.svg`, `.png`, `.jpg`, `.webp`)
- Fonts (`.woff`, `.woff2`, `.ttf`)

**Dynamic content:**

- HTML pages: No cache (regenerated)
- API routes: Custom cache headers per route

**Blog posts:**

- Generated at build time (static)
- Regenerated on deployment

### Performance Tips

1. **Monitor bundle size:** `npm run build`
2. **Check Lighthouse scores:** Vercel dashboard
3. **Test with throttled connection:** Chrome DevTools
4. **Validate Core Web Vitals:** Vercel Analytics
5. **Review image optimization:** Use next/image

---

## Troubleshooting

### Deployment Fails

**Check the logs:**

1. Go to Vercel dashboard
2. Click on failed deployment
3. Click "Build Logs" tab
4. Look for error message
5. Common issues below:

**TypeScript errors:**

```bash
# Fix locally and test
npm run build

# Errors like "Property 'x' does not exist"
# Check types: tsconfig.json (strict mode enabled)
```

**Missing environment variables:**

- Add to Vercel: Settings → Environment Variables
- Redeploy after adding

**Node version mismatch:**

- Vercel uses Node 20 by default
- Check package.json engines field
- Add `vercel.json` if needed for specific version

### Features Not Working

**GitHub heatmap not loading:**

- Check GITHUB_TOKEN is set
- Verify GitHub API is not rate-limited (60 req/hr without token)
- Check browser console for errors

**Contact form not sending emails:**

- Verify RESEND_API_KEY is set
- Check Resend dashboard for errors
- Verify domain is authorized in Resend

**View counts not persisting:**

- Add REDIS_URL if you want persistence
- Without Redis, counts reset on deployment
- This is expected behavior

**Site URL incorrect:**

- Check NEXT_PUBLIC_SITE_URL in environment variables
- Used for sitemaps, OG images, absolute links
- Default is detected automatically

### Rollback

**To revert to previous deployment:**

1. Go to Vercel dashboard
2. Click "Deployments"
3. Find previous successful deployment
4. Click "..." menu → "Promote to Production"

---

## CI/CD Integration

### GitHub Actions

To add automated testing before deployment:

1. **Create workflow file:** `.github/workflows/deploy.yml`
2. **Run lint on PR:** `npm run lint`
3. **Run build on PR:** `npm run build`
4. **Deploy on merge:** Vercel (automatic)

### Manual Deployment

```bash
# Using Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## Environment-Specific Behavior

### Development (`localhost:3000`)

- Hot reload enabled
- Debug logging visible
- CSS live reload
- Skips some optimizations for speed

### Preview (PR deployments)

- Same as production (full optimization)
- Separate deployment per PR
- Auto-deleted after PR closes
- Good for testing real performance

### Production

- Full optimization
- All security headers applied
- Global CDN caching
- Performance monitoring enabled
- Error tracking enabled (if configured)

---

## Next Steps

After deploying, consider:

1. **Set up error tracking:** [Sentry](https://sentry.io) or similar
2. **Monitor performance:** Vercel Analytics (built-in)
3. **Set up uptime monitoring:** StatusPage or Uptime Robot
4. **Enable Web Analytics:** Vercel Web Analytics
5. **Configure domain:** Update DNS records if using custom domain

---

## Related Documentation

- **Environment Variables:** [/docs/platform/environment-variables.md](/docs/platform/environment-variables)
- **Deployment Checklist:** [/docs/operations/deployment-checklist.md](/docs/operations/deployment-checklist)
- **Security Implementation:** [/docs/security/](/docs/security/)
- **Architecture:** [/docs/blog/architecture.md](/docs/blog/architecture)

## Quick Reference Commands

```bash
# Development
npm run dev              # Local development server
npm run dev:https       # Development with HTTPS

# Building
npm run build           # Build for production
npm run lint            # Check code quality

# Testing
npm start               # Start production server locally
npm run test:siteurl    # Verify site URL configuration

# Deployment
git push origin main    # Push to main (Vercel auto-deploys)
```

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Resend Docs:** https://resend.com/docs
- **GitHub API Docs:** https://docs.github.com/en/graphql
- **Redis Docs:** https://redis.io/docs/

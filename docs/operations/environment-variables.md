# Environment Variables Guide

**Last Updated:** October 26, 2025

## Overview

This guide documents all environment variables used in the project, their purposes, and setup instructions. The project is designed to run gracefully even when environment variables are missing, with appropriate fallbacks and warnings.

## Quick Reference

| Variable                         | Required               | Purpose                                    | Default Behavior                            |
| -------------------------------- | ---------------------- | ------------------------------------------ | ------------------------------------------- |
| `INNGEST_EVENT_KEY`              | Production only        | Inngest event sending                      | Functions work in dev mode only             |
| `INNGEST_SIGNING_KEY`            | Production only        | Inngest webhook verification               | Functions work in dev mode only             |
| `INNGEST_ERROR_ALERTS_EMAIL`     | Recommended            | Email alerts for function failures         | Failures logged but no email alerts         |
| `RESEND_API_KEY`                 | Production only        | Email delivery (contact form, milestones)  | Logs submissions, shows warning             |
| `ADMIN_API_KEY`                  | Required for analytics | Secure analytics endpoint access           | Endpoint disabled without key               |
| `GITHUB_TOKEN`                   | Recommended            | GitHub API rate limits (60 → 5,000/hr)     | Uses unauthenticated API (60 req/hr)        |
| `REDIS_URL`                      | Recommended            | Blog analytics, view counts, rate limiting | Disables analytics, falls back to in-memory |
| `NEXT_PUBLIC_GISCUS_REPO`        | Optional               | Comments system - repository               | Comments section hidden                     |
| `NEXT_PUBLIC_GISCUS_REPO_ID`     | Optional               | Comments system - repo ID                  | Comments section hidden                     |
| `NEXT_PUBLIC_GISCUS_CATEGORY`    | Optional               | Comments system - category                 | Comments section hidden                     |
| `NEXT_PUBLIC_GISCUS_CATEGORY_ID` | Optional               | Comments system - category ID              | Comments section hidden                     |
| `NEXT_PUBLIC_SITE_URL`           | Optional               | Site URL override                          | Uses environment-based defaults             |
| `NEXT_PUBLIC_SITE_DOMAIN`        | Optional               | Domain override                            | Uses environment-based defaults             |

## Setup

### Local Development

1. **Copy the example file:**

   ```bash
   cp .env.example .env.local
   ```

2. **Start development (works immediately):**

   ```bash
   npm run dev
   ```

3. **Add credentials as needed** (all optional for local dev):
   - See individual sections below for each service

### Production Deployment (Vercel)

1. Go to your project settings: `Project Settings → Environment Variables`
2. Add required variables (see Production Requirements section)
3. Deploy or redeploy to apply changes

## Environment Variables

### Site Configuration

#### `NEXT_PUBLIC_SITE_URL`

- **Type:** String (URL)
- **Required:** No
- **Example:** `https://www.dcyfr.ai`
- **Purpose:** Override the full site URL for absolute links, sitemap, OpenGraph, etc.
- **Default:** Determined by `src/lib/site-config.ts` based on environment:
  - Development: `https://dcyfr.dev`
  - Preview (Vercel): `https://dcyfr-preview.vercel.app`
  - Production: `https://www.dcyfr.ai`
- **When to use:** Custom domain testing, non-standard deployments

#### `NEXT_PUBLIC_SITE_DOMAIN`

- **Type:** String (domain)
- **Required:** No
- **Example:** `www.dcyfr.ai`
- **Purpose:** Override just the domain (automatically prefixed with `https://`)
- **Default:** Same defaults as `NEXT_PUBLIC_SITE_URL`
- **When to use:** Domain-only overrides, easier than full URL
- **Priority:** Lower than `NEXT_PUBLIC_SITE_URL` if both are set

#### `NEXT_PUBLIC_VERCEL_ENV`

- **Type:** String (`production` | `preview` | `development`)
- **Required:** No
- **Managed by:** Vercel (automatically set)
- **Purpose:** Detect Vercel preview deployments
- **Default:** Not set in local development
- **When to use:** Never set manually - Vercel manages this

### Email Configuration

#### `RESEND_API_KEY`

- **Type:** String (API key)
- **Required:** Yes (for production)
- **Purpose:** Send emails via Resend API from contact form and milestone notifications
- **Get key at:** [resend.com/api-keys](https://resend.com/api-keys)
- **Setup:**
  1. Sign up at Resend
  2. Create API key
  3. Verify sending domain (optional for testing, required for production)
  4. Add key to environment variables

**Behavior without key:**

- ✅ Contact form still displays and queues events
- ✅ Form validation works
- ✅ Rate limiting applies
- ⚠️ Inngest functions run but skip email steps
- ⚠️ Logs indicate email not configured
- ❌ No actual emails sent

**Implementation:**

- File: `src/inngest/contact-functions.ts`
- Used by: Contact form submissions, milestone notifications

### Background Jobs (Inngest)

#### `INNGEST_EVENT_KEY`

- **Type:** String (API key)
- **Required:** Yes (for production event sending)
- **Purpose:** Authentication for sending events to Inngest Cloud
- **Get key at:** [app.inngest.com](https://app.inngest.com) → Your App → Keys
- **Setup:**
  1. Sign up for Inngest
  2. Create a new app
  3. Copy Event Key from dashboard
  4. Add to environment variables

**Behavior without key:**

- ✅ Dev mode works perfectly (local Inngest Dev Server)
- ✅ All functions testable locally
- ✅ View dev UI at http://localhost:3001/api/inngest
- ❌ Events can't be sent in production
- ⚠️ Functions won't trigger in production

#### `INNGEST_SIGNING_KEY`

- **Type:** String (signing key)
- **Required:** Yes (for production webhook verification)
- **Purpose:** Verify requests from Inngest Cloud to your function endpoint
- **Get key at:** [app.inngest.com](https://app.inngest.com) → Your App → Keys
- **Setup:**
  1. Copy Signing Key from Inngest dashboard (same page as Event Key)
  2. Add to environment variables
  3. Configure webhook URL in Inngest: `https://www.dcyfr.ai/api/inngest`

**Behavior without key:**

- ✅ Dev mode works (no verification needed locally)
- ❌ Production webhook requests rejected
- ⚠️ Functions registered but won't execute

**Current Inngest Functions:**

1. **Contact Form** (`contactFormSubmitted`) - Async email delivery
2. **GitHub Refresh** (`refreshGitHubData`) - Scheduled every 5 minutes
3. **Manual GitHub Refresh** (`manualRefreshGitHubData`) - On-demand
4. **Post View Tracking** (`trackPostView`) - Per-view analytics
5. **Milestone Handler** (`handleMilestone`) - Celebrates achievements
6. **Trending Calculator** (`calculateTrending`) - Hourly trending posts
7. **Analytics Summary** (`generateAnalyticsSummary`) - On-demand reports
8. **Daily Analytics** (`dailyAnalyticsSummary`) - Daily at midnight UTC

**Documentation:** See `/docs/features/inngest-integration.md`

#### `INNGEST_ERROR_ALERTS_EMAIL`

- **Type:** String (email address)
- **Required:** No (highly recommended for production)
- **Purpose:** Receive email alerts when Inngest functions fail after all retry attempts
- **Setup:**
  1. Set to your email address (e.g., `alerts@dcyfr.ai`)
  2. Also requires `RESEND_API_KEY` to send emails
  3. Automatic: no further configuration needed

**Behavior without key:**

- ✅ Function failures still logged in Inngest dashboard
- ✅ Errors still reported to Sentry
- ❌ No email alerts sent
- ⚠️ You won't be notified immediately of failures

**Alert Rules (Automatic):**

- **CRITICAL** (contact form, payments) → Immediate email
- **HIGH** (GitHub, security, analytics) → Email + Sentry
- **MEDIUM** (trending, milestones) → Sentry only
- **LOW** (logging, monitoring) → Console log only

**Email Alert Includes:**

- Function name, ID, and execution ID
- Full error message and stack trace
- Event data that triggered the error
- Attempt count and retry limit
- Links to Inngest and Sentry dashboards

**Documentation:** See `/docs/features/inngest-error-alerting.md`

### Email Configuration (Legacy - Now via Inngest)

- Check: `const isEmailConfigured = !!process.env.RESEND_API_KEY`
- Returns: 200 status with warning instead of 500 error

### GitHub Integration

#### `GITHUB_TOKEN`

- **Type:** String (Personal Access Token)
- **Required:** No (recommended for production)
- **Purpose:** Increase GitHub API rate limits for contributions heatmap
- **Get token at:** [github.com/settings/tokens](https://github.com/settings/tokens)
- **Scopes needed:**
  - `public_repo` (for public repositories)
  - OR `read:user` (for public profile only)
  - No write access needed
- **Setup:**
  1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
  2. Click "Generate new token (classic)"
  3. Name it (e.g., "Portfolio Site")
  4. Select scopes: `public_repo` OR `read:user`
  5. Generate and copy token
  6. Add to `.env.local` or Vercel environment variables

**Rate Limits:**

| Scenario      | Rate Limit          | Notes             |
| ------------- | ------------------- | ----------------- |
| Without token | 60 requests/hour    | Per IP address    |
| With token    | 5,000 requests/hour | Per token         |
| Server cache  | 5 minutes           | Reduces API calls |

**Behavior without token:**

- ✅ Heatmap still works
- ✅ Uses unauthenticated GitHub GraphQL API
- ⚠️ Lower rate limits (60/hour)
- ⚠️ May fail during heavy development
- ✅ Server-side cache helps (5-minute cache)

**Behavior with token:**

- ✅ Higher rate limits (5,000/hour)
- ✅ More reliable
- ✅ Better for production
- ✅ Required for high-traffic sites

**Security:**

- ⚠️ API route validates username (`dcyfr`) to prevent abuse
- ⚠️ Only allows fetching data for portfolio owner
- ⚠️ Rate limiting applied (10 requests/minute per IP)

**Implementation:**

- File: `src/app/api/github-contributions/route.ts`
- Conditional header: Only adds `Authorization` when token exists
- No empty header sent when missing

### Analytics Security

#### `ADMIN_API_KEY`

- **Type:** String (secure random key)
- **Required:** Yes (to enable `/api/analytics` endpoint)
- **Purpose:** Secure access to analytics dashboard data
- **Security:** 4-layer protection (API key, environment check, rate limiting, audit logging)
- **Setup:**
  1. Generate a secure random key:
     ```bash
     # Generate a strong 32-character random key
     openssl rand -base64 32
     ```
  2. Add to `.env.local`:
     ```bash
     ADMIN_API_KEY=your_generated_key_here
     ```
  3. Add to Vercel environment variables (preview/staging only)

**Usage:**

```bash
# Local development
curl http://localhost:3000/api/analytics \
  -H "Authorization: Bearer YOUR_KEY_HERE"

# Query specific date range
curl http://localhost:3000/api/analytics?days=7 \
  -H "Authorization: Bearer YOUR_KEY_HERE"
```

**Security Features:**

1. **API Key Authentication**: Bearer token required in Authorization header
2. **Environment Protection**: BLOCKED in production (Vercel production environment)
3. **Rate Limiting**: 5 requests/minute per IP (Redis-backed)
4. **Audit Logging**: All access attempts logged with IP, timestamp, user agent

**Allowed Environments:**

- ✅ Local development (`NODE_ENV=development`)
- ✅ Vercel preview deployments (`VERCEL_ENV=preview`)
- ✅ Test environment (`NODE_ENV=test`)
- ❌ Production deployment (`VERCEL_ENV=production`) - HARD BLOCKED

**Error Responses:**

| Status | Reason                  | Response                              |
| ------ | ----------------------- | ------------------------------------- |
| 403    | Production environment  | Analytics not available in production |
| 401    | Missing/invalid API key | Valid API key required                |
| 429    | Rate limit exceeded     | Maximum 5 requests per minute         |
| 500    | Server error            | Failed to fetch analytics             |

**Behavior without key:**

- ❌ Endpoint completely disabled
- ❌ Returns 401 Unauthorized for all requests
- ⚠️ Server logs error: "ADMIN_API_KEY not configured"
- ✅ Analytics data never exposed without authentication

**Best Practices:**

- 🔒 Never commit `ADMIN_API_KEY` to version control
- 🔒 Use different keys for preview vs local development
- 🔒 Rotate keys periodically
- 🔒 Monitor access logs for suspicious activity
- 🔒 Never enable in production environment

**Implementation:**

- File: `src/app/api/analytics/route.ts`
- Protection: 4-layer security (environment, API key, rate limit, audit)
- Documentation: `/docs/security/api-security-audit.md`

### Comments System (Giscus)

#### `NEXT_PUBLIC_GISCUS_REPO`

- **Type:** String (repository in "owner/repo" format)
- **Required:** No
- **Example:** `dcyfr/dcyfr-labs`
- **Purpose:** GitHub repository for Giscus comments

#### `NEXT_PUBLIC_GISCUS_REPO_ID`

- **Type:** String (repository ID)
- **Required:** No
- **Purpose:** GitHub repository ID (from Giscus setup)

#### `NEXT_PUBLIC_GISCUS_CATEGORY`

- **Type:** String (category name)
- **Required:** No
- **Example:** `Blog Comments`
- **Purpose:** Discussion category name for comments

#### `NEXT_PUBLIC_GISCUS_CATEGORY_ID`

- **Type:** String (category ID)
- **Required:** No
- **Purpose:** Discussion category ID (from Giscus setup)

**Setup Instructions:**

1. **Enable GitHub Discussions:**
   - Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings`
   - Under "Features", check "Discussions"
   - Click "Set up discussions"

2. **Create Discussion Category:**
   - Go to your repository's Discussions tab
   - Create a new category (recommended: "Blog Comments")
   - Use "Announcement" format (only maintainers can create discussions)

3. **Configure Giscus:**
   - Visit [giscus.app](https://giscus.app/)
   - Enter your repository name
   - Select Discussion category
   - Choose settings (we recommend):
     - Page ↔️ Discussions Mapping: `pathname`
     - Discussion Category: your created category
     - Features: Enable reactions
     - Theme: We handle this automatically (light/dark sync)
   - Copy the generated configuration values

4. **Add Environment Variables:**
   ```bash
   NEXT_PUBLIC_GISCUS_REPO=owner/repo
   NEXT_PUBLIC_GISCUS_REPO_ID=R_xxxxx
   NEXT_PUBLIC_GISCUS_CATEGORY=Blog Comments
   NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_xxxxx
   ```

**Behavior without Giscus:**

- ✅ Blog posts work normally
- ❌ Comments section not displayed
- ✅ No errors or broken UI
- ✅ Silent graceful degradation

**Behavior with Giscus:**

- ✅ Comments section appears on all blog posts
- ✅ Users can comment with GitHub account
- ✅ Comments sync with GitHub Discussions
- ✅ Automatic theme switching (light/dark)
- ✅ Reactions, replies, and moderation support
- ✅ Lazy loading for better performance

**Features:**

- Automatic theme synchronization with site theme
- Lazy loading (loads when scrolled into view)
- Pathname-based mapping (each blog post gets its own discussion)
- Top-level input for better UX
- Reactions enabled

**Implementation:**

- Component: `src/components/giscus-comments.tsx`
- Check: All four env vars must be present to render
- Integration: Appears after share buttons on blog posts
- Theme: Uses `next-themes` for automatic dark/light mode

### Redis (View Counts)

#### `REDIS_URL`

- **Type:** String (Redis connection URL)
- **Required:** No
- **Purpose:** Track and display view counts for blog posts
- **Format:** `redis://default:password@host:port`
- **Get Redis at:**
  - [Vercel KV](https://vercel.com/docs/storage/vercel-kv) (recommended for Vercel)
  - [Upstash](https://upstash.com/) (serverless-friendly)
  - Any Redis provider

**Setup (Vercel KV):**

1. Go to Vercel dashboard
2. Storage tab → Create Database → KV
3. Name it (e.g., "portfolio-views")
4. Link to project
5. Environment variables automatically added

**Setup (Upstash):**

1. Sign up at [console.upstash.com](https://console.upstash.com)
2. Create database
3. Copy Redis URL (REST API URL for serverless)
4. Add to environment variables

**Behavior without Redis:**

- ✅ Blog posts still load
- ❌ No view counts displayed
- ❌ No view tracking
- ✅ No errors or warnings
- ✅ Silent graceful degradation

**Behavior with Redis:**

- ✅ View counts tracked per post
- ✅ Displayed on blog list and post pages
- ✅ Atomic increments (concurrent-safe)
- ✅ Persisted across deploys

**Implementation:**

- File: `src/lib/views.ts`
- Check: `if (!redisUrl) return null`
- Graceful: Returns null if Redis unavailable
- Key format: `views:post:{slug}`

### Analytics (Auto-configured)

These are automatically configured by Vercel when you enable the respective features. No manual setup needed.

#### `NEXT_PUBLIC_VERCEL_ANALYTICS_ID`

- **Managed by:** Vercel
- **Purpose:** Vercel Analytics tracking
- **Setup:** Enable in Vercel project settings → Analytics
- **Docs:** [vercel.com/analytics](https://vercel.com/analytics)

#### `NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS_ID`

- **Managed by:** Vercel
- **Purpose:** Vercel Speed Insights
- **Setup:** Enable in Vercel project settings → Speed Insights
- **Docs:** [vercel.com/docs/speed-insights](https://vercel.com/docs/speed-insights)

### Development Variables

#### `NODE_ENV`

### Vercel Analytics Proxy & Token (Optional, recommended for dashboard)

#### `VERCEL_ANALYTICS_ENDPOINT`

- **Type:** String (API endpoint URL)
- **Required:** No (recommended for analytics dashboard)
- **Purpose:** A small proxy or Vercel API endpoint that returns a normalized JSON shape containing analytics metrics (top pages, referrers, devices). This is used by the `syncVercelAnalytics` Inngest job and the `/api/analytics` endpoint.
- **Example:** `https://api.my-internal-proxy.example/vercel-analytics`
- **Notes:** If not set, the dashboard gracefully falls back to the internal Redis analytics only (view counts and trending).

#### `VERCEL_TOKEN`

- **Type:** String (Vercel personal token)
- **Required:** No (recommended for enabling Vercel API calls)
- **Purpose:** Authenticate with Vercel API (or your proxy) to fetch analytics data.
- **Get token at:** https://vercel.com/account/tokens
- **Notes:** This token is used by the `syncVercelAnalytics` scheduled job and any scripts that call Vercel's APIs. Add to `VERCEL_TOKEN` (or `VERCEL_API_TOKEN`) as appropriate.
- **Type:** String (`development` | `production` | `test`)
- **Required:** No (automatically set)
- **Managed by:** Next.js
- **Values:**
  - `npm run dev` → `development`
  - `npm run build` → `production`
  - `npm start` → `production`
  - `npm test` → `test`
- **Purpose:** Controls development vs production behavior
- **Usage:**
  - Error boundary debug info
  - Redis error logging
  - Development-only features
- **Never set manually** in `.env.local`

## Production Requirements

### Minimum Required Configuration

For a production deployment, at minimum set:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
```

This enables actual email delivery from the contact form.

### Recommended Configuration

For full functionality:

```bash
# Required
RESEND_API_KEY=re_xxxxxxxxxxxx

# Recommended
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
REDIS_URL=redis://default:password@host:port

# Optional (only if custom domain)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Full Production Setup Checklist

- [ ] **RESEND_API_KEY** - Required for contact form emails
- [ ] **GITHUB_TOKEN** - Recommended for reliable heatmap
- [ ] **REDIS_URL** - Recommended for view counts
- [ ] **Verify sending domain** in Resend (if using custom email)
- [ ] **Test contact form** after deployment
- [ ] **Test GitHub heatmap** loads correctly
- [ ] **Verify view counts** increment on blog posts

## Environment-Specific Setup

### Development (.env.local)

Minimal setup for local development:

```bash
# Optional - only add if testing these features
# RESEND_API_KEY=re_xxxxxxxxxxxx
# GITHUB_TOKEN=ghp_xxxxxxxxxxxx
# REDIS_URL=redis://localhost:6379
```

**Most features work without any configuration!**

### Staging/Preview (Vercel)

Vercel automatically creates preview deployments for PRs. Use the same production configuration or create separate keys for testing:

```bash
# Use separate keys for preview environment
RESEND_API_KEY=re_preview_xxxxxxxxxxxx
GITHUB_TOKEN=ghp_preview_xxxxxxxxxxxx
REDIS_URL=redis://preview-instance
```

### Production (Vercel)

Full configuration with all features enabled:

```bash
RESEND_API_KEY=re_live_xxxxxxxxxxxx
GITHUB_TOKEN=ghp_live_xxxxxxxxxxxx
REDIS_URL=redis://production-instance
NEXT_PUBLIC_SITE_URL=https://www.dcyfr.ai
```

## Testing Environment Variables

### Verify Configuration

Check which environment variables are set:

```bash
# Check if variables are loaded (development)
npm run dev
# Visit http://localhost:3000/api/health (if you create one)

# Check Vercel deployment
# Visit project → Settings → Environment Variables
```

### Test Individual Features

**Contact Form:**

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
```

**GitHub Heatmap:**

```bash
curl http://localhost:3000/api/github-contributions?username=dcyfr
```

**Redis (if configured):**

```bash
# Visit any blog post and check console for view count increment
```

## Troubleshooting

### Contact Form Returns 500 Error

- **Problem:** Missing `RESEND_API_KEY`
- **Solution:** Should return 200 with warning (check implementation)
- **Fix:** Update to latest code with graceful fallback

### GitHub Heatmap Rate Limited

- **Problem:** Too many requests without token
- **Solution:** Add `GITHUB_TOKEN` for higher limits
- **Workaround:** Server-side cache helps (5-minute cache)

### View Counts Not Showing

- **Problem:** Missing `REDIS_URL`
- **Solution:** Add Redis configuration
- **Expected:** Should gracefully degrade (no errors)

### Wrong Domain in Links

- **Problem:** Incorrect site URL
- **Solution:** Set `NEXT_PUBLIC_SITE_URL` or `NEXT_PUBLIC_SITE_DOMAIN`
- **Check:** `src/lib/site-config.ts` for default logic

## Security Best Practices

### Never Commit Secrets

```bash
# ✅ Good - ignored by git
.env.local
.env.development.local
.env.production.local

# ❌ Bad - tracked by git
.env
.env.development
.env.production
```

### Use Environment-Specific Keys

- Development: Separate API keys for testing
- Staging: Separate keys from production
- Production: Production-only keys with restrictions

### Rotate Keys Regularly

- GitHub tokens: Rotate every 90 days
- API keys: Rotate on schedule
- Redis: Use strong passwords

### Principle of Least Privilege

- GitHub token: Read-only access only
- API keys: Minimum required permissions
- Redis: Connection-level auth only

## Related Documentation

- API Reference - API route documentation
- Deployment Checklist - Pre-deployment checks
- Site Configuration - Domain and URL configuration

## Change Log

- **2025-10-20:** Comprehensive `.env.example` created with all variables documented
- **2025-10-20:** Added graceful fallbacks for missing `RESEND_API_KEY` and `GITHUB_TOKEN`

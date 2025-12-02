# Environment Variables Guide

**Last Updated:** November 8, 2025  
**Status:** Consolidated from operations/  
**Location:** `docs/platform/` (project configuration)

---

## Quick Reference

| Variable | Required | Purpose | Default Behavior |
|----------|----------|---------|------------------|
| `INNGEST_EVENT_KEY` | Production only | Inngest event sending | Functions work in dev mode only |
| `INNGEST_SIGNING_KEY` | Production only | Inngest webhook verification | Functions work in dev mode only |
| `RESEND_API_KEY` | Production only | Email delivery (contact form, milestones) | Logs submissions, shows warning |
| `NEXT_PUBLIC_FROM_EMAIL` | Optional | Override sender email address | Uses `no-reply@www.dcyfr.ai` |
| `GITHUB_TOKEN` | Recommended | GitHub API rate limits (60 → 5,000/hr) | Uses unauthenticated API (60 req/hr) |
| `REDIS_URL` | Recommended | Blog analytics, view counts, rate limiting | Disables analytics, falls back to in-memory |
| `SENTRY_DSN` | Recommended | Error tracking and CSP monitoring | No error tracking (production ready) |
| `SENTRY_AUTH_TOKEN` | Build only | Source map uploads to Sentry | Source maps not uploaded |
| `NEXT_PUBLIC_GISCUS_REPO` | Optional | Comments system - repository | Comments section hidden |
| `NEXT_PUBLIC_GISCUS_REPO_ID` | Optional | Comments system - repo ID | Comments section hidden |
| `NEXT_PUBLIC_GISCUS_CATEGORY` | Optional | Comments system - category | Comments section hidden |
| `NEXT_PUBLIC_GISCUS_CATEGORY_ID` | Optional | Comments system - category ID | Comments section hidden |
| `NEXT_PUBLIC_SITE_URL` | Optional | Site URL override | Uses environment-based defaults |
| `NEXT_PUBLIC_SITE_DOMAIN` | Optional | Domain override | Uses environment-based defaults |
| `DISABLE_DEV_PAGES` | Optional | Hide dev pages in development | Dev pages visible in dev mode |

---

## Setup Commands

### Local Development

```bash
# 1. Copy example file
cp .env.example .env.local

# 2. Edit with your values
nano .env.local  # or your preferred editor

# 3. Start dev server
npm run dev
```

**Note:** Everything works immediately without environment variables! Add credentials as needed.

### Production (Vercel)

1. Go to: Project Settings → Environment Variables
2. Add required variables (see sections below)
3. Deploy or redeploy to apply changes

---

## Environment Variables

### Site Configuration

#### `NEXT_PUBLIC_SITE_URL`
- **Type:** String (URL)
- **Required:** No
- **Example:** `https://www.dcyfr.ai`
- **Purpose:** Override full site URL for absolute links, sitemap, OpenGraph
- **Default:** Based on environment:
  - Development: `https://dcyfr.net`
  - Vercel Preview: `https://dcyfr-preview.vercel.app`
  - Production: `https://www.dcyfr.ai`
- **When to use:** Custom domain testing, non-standard deployments

#### `NEXT_PUBLIC_SITE_DOMAIN`
- **Type:** String (domain)
- **Required:** No
- **Example:** `www.dcyfr.ai`
- **Purpose:** Override just the domain (auto-prefixes `https://`)
- **Default:** Same as `NEXT_PUBLIC_SITE_URL`
- **Priority:** Lower than `NEXT_PUBLIC_SITE_URL` if both set

#### `NEXT_PUBLIC_VERCEL_ENV` (Auto-managed)
- **Type:** String (`production` | `preview` | `development`)
- **Managed by:** Vercel (automatic)
- **Purpose:** Detect Vercel preview deployments
- **Do not set manually**

---

## Email Configuration

### `RESEND_API_KEY`

- **Type:** String (API key)
- **Required:** Yes (for production)
- **Purpose:** Send emails via Resend from contact form and notifications
- **Get key:** [resend.com/api-keys](https://resend.com/api-keys)
- **Setup:**
  1. Sign up at Resend
  2. Create API key
  3. Verify sending domain (optional for testing, required for production)
  4. Add to environment variables

**Behavior without key:**
- ✅ Contact form displays
- ✅ Form validation works
- ⚠️ Submissions logged, not sent
- ⚠️ User sees warning: "Email notifications not configured"
- ❌ No actual emails sent

**Implementation:**
- File: `src/inngest/contact-functions.ts`
- Used by: Contact form, milestone notifications
- Fallback: Graceful degradation with warning

### `NEXT_PUBLIC_FROM_EMAIL`

- **Type:** String (email address)
- **Required:** No
- **Default:** `no-reply@www.dcyfr.ai`
- **Purpose:** Override the "from" email address for outgoing emails
- **Example:** `NEXT_PUBLIC_FROM_EMAIL=contact@yourdomain.com`
- **When to use:** Custom domain, different sender branding

**Implementation:**
- File: `src/lib/site-config.ts`
- Used by: Contact form emails, milestone notifications

---

## Background Jobs (Inngest)

### `INNGEST_EVENT_KEY`

- **Type:** String (API key)
- **Required:** Yes (for production)
- **Purpose:** Authenticate sending events to Inngest Cloud
- **Get key:** [app.inngest.com](https://app.inngest.com) → Your App → Keys
- **Setup:**
  1. Sign up for Inngest
  2. Create new app
  3. Copy Event Key
  4. Add to environment variables

**Behavior without key:**
- ✅ Dev mode works perfectly (local Inngest Dev Server)
- ✅ All functions testable locally
- ✅ View UI at http://localhost:3001/api/inngest
- ❌ Events can't be sent in production

### `INNGEST_SIGNING_KEY`

- **Type:** String (signing key)
- **Required:** Yes (for production)
- **Purpose:** Verify webhook requests from Inngest Cloud
- **Get key:** [app.inngest.com](https://app.inngest.com) → Your App → Keys
- **Setup:**
  1. Copy Signing Key (same page as Event Key)
  2. Add to environment variables
  3. Configure webhook URL in Inngest: `https://www.dcyfr.ai/api/inngest`

**Behavior without key:**
- ✅ Dev mode works (no verification locally)
- ❌ Production webhooks rejected

**Inngest Functions:**
1. **contactFormSubmitted** - Async email delivery
2. **refreshGitHubData** - Scheduled every 5 minutes
3. **manualRefreshGitHubData** - On-demand
4. **trackPostView** - Per-view analytics
5. **handleMilestone** - Achievement notifications
6. **calculateTrending** - Hourly trending posts
7. **generateAnalyticsSummary** - On-demand reports
8. **dailyAnalyticsSummary** - Daily at midnight UTC

**Documentation:** See `/docs/features/inngest-integration.md`

---

## GitHub Integration

### `GITHUB_TOKEN`

- **Type:** String (Personal Access Token)
- **Required:** No (recommended for production)
- **Purpose:** Increase API rate limits for contributions heatmap
- **Get token:** [github.com/settings/tokens](https://github.com/settings/tokens)
- **Scopes needed:** `public_repo` OR `read:user` (read-only, no write access)
- **Setup:**
  1. Settings → Developer settings → Tokens (classic)
  2. Generate new token
  3. Name: "Portfolio Site"
  4. Select: `public_repo` OR `read:user`
  5. Copy token and add to environment variables

**Rate Limits:**

| Scenario | Limit | Notes |
|----------|-------|-------|
| Without token | 60/hour | Per IP |
| With token | 5,000/hour | Per token |
| Server cache | 5 minutes | Reduces calls |

**Behavior without token:**
- ✅ Heatmap works
- ⚠️ Lower rate limits (60/hour)
- ⚠️ May fail during heavy development
- ✅ Server cache helps (5-minute TTL)

**Behavior with token:**
- ✅ Higher limits (5,000/hour)
- ✅ More reliable
- ✅ Required for production

**Security:**
- ⚠️ API route validates username (`dcyfr`) to prevent abuse
- ⚠️ Rate limited (10 requests/minute per IP)
- Only adds header when token exists

**Implementation:**
- File: `src/app/api/github-contributions/route.ts`
- Conditional: Only sends Authorization header when token configured

---

## Comments System (Giscus)

### `NEXT_PUBLIC_GISCUS_REPO`
- **Type:** String ("owner/repo")
- **Example:** `dcyfr/dcyfr-labs`
- **Purpose:** GitHub repository for comments

### `NEXT_PUBLIC_GISCUS_REPO_ID`
- **Type:** String (repository ID)
- **Purpose:** GitHub repo ID from Giscus setup

### `NEXT_PUBLIC_GISCUS_CATEGORY`
- **Type:** String (category name)
- **Example:** `Blog Comments`
- **Purpose:** Discussion category name

### `NEXT_PUBLIC_GISCUS_CATEGORY_ID`
- **Type:** String (category ID)
- **Purpose:** Discussion category ID from Giscus setup

**Setup Instructions:**

1. **Enable GitHub Discussions:**
   - Settings → Features → Check "Discussions"
   - Click "Set up discussions"

2. **Create Discussion Category:**
   - Discussions tab → New category (e.g., "Blog Comments")
   - Use "Announcement" format (maintainers only)

3. **Configure Giscus:**
   - Visit [giscus.app](https://giscus.app/)
   - Enter repository name
   - Select Discussion category
   - Recommended settings:
     - Mapping: `pathname`
     - Features: Enable reactions
     - Theme: Automatic (we handle sync)
   - Copy generated configuration

4. **Add Environment Variables:**
   ```bash
   NEXT_PUBLIC_GISCUS_REPO=owner/repo
   NEXT_PUBLIC_GISCUS_REPO_ID=R_xxxxx
   NEXT_PUBLIC_GISCUS_CATEGORY=Blog Comments
   NEXT_PUBLIC_GISCUS_CATEGORY_ID=DIC_xxxxx
   ```

**Behavior without Giscus:**
- ✅ Blog posts work normally
- ❌ Comments section hidden
- ✅ No errors or broken UI

**Behavior with Giscus:**
- ✅ Comments section appears
- ✅ GitHub account authentication
- ✅ Synced with GitHub Discussions
- ✅ Automatic theme switching
- ✅ Reactions, replies, moderation

**Implementation:**
- Component: `src/components/giscus-comments.tsx`
- Check: All four env vars required
- Integration: After share buttons on posts
- Theme: Auto dark/light sync via `next-themes`

---

## Redis Configuration

### `REDIS_URL`

- **Type:** String (Redis connection URL)
- **Required:** No (recommended)
- **Purpose:** Track blog post view counts
- **Format:** `redis://default:password@host:port`
- **Get Redis at:**
  - [Vercel KV](https://vercel.com/docs/storage/vercel-kv) (recommended for Vercel)
  - [Upstash](https://upstash.com/) (serverless-friendly)
  - Any Redis provider

**Setup (Vercel KV):**
1. Vercel Dashboard → Storage → Create Database → KV
2. Name: "portfolio-views"
3. Link to project
4. Environment variables auto-added

**Setup (Upstash):**
1. Sign up at [console.upstash.com](https://console.upstash.com)
2. Create database
3. Copy Redis URL
4. Add to environment variables

**Behavior without Redis:**
- ✅ Blog posts load normally
- ❌ No view counts displayed
- ❌ No tracking
- ✅ Silent graceful degradation

**Behavior with Redis:**
- ✅ View counts tracked
- ✅ Displayed on blog list and posts
- ✅ Atomic concurrent increments
- ✅ Persisted across deploys

**Implementation:**
- File: `src/lib/views.ts`
- Key format: `views:post:{slug}`
- Fallback: Returns null if unavailable

---

## Analytics (Auto-configured)

### `NEXT_PUBLIC_VERCEL_ANALYTICS_ID`
- **Managed by:** Vercel
- **Setup:** Project settings → Analytics (enable)
- **Docs:** [vercel.com/analytics](https://vercel.com/analytics)

### `NEXT_PUBLIC_VERCEL_SPEED_INSIGHTS_ID`
- **Managed by:** Vercel
- **Setup:** Project settings → Speed Insights (enable)
- **Docs:** [vercel.com/docs/speed-insights](https://vercel.com/docs/speed-insights)

**Do not set manually** - Vercel configures automatically.

---

## Development Variables

### `NODE_ENV` (Auto-managed)

- **Type:** String (`development` | `production` | `test`)
- **Set by:** Next.js automatically
- **Values:**
  - `npm run dev` → `development`
  - `npm run build` → `production`
  - `npm start` → `production`
  - `npm test` → `test`
- **Do not set manually**

### `DISABLE_DEV_PAGES`

- **Type:** String (`"1"` to enable)
- **Required:** No
- **Default:** Dev pages visible in development mode
- **Purpose:** Hide development-only pages (e.g., `/dev/*`) even in development
- **Example:** `DISABLE_DEV_PAGES=1`
- **When to use:** Testing production-like behavior, demonstrations, screenshots

**Behavior:**
- Default: Dev pages visible in development (`NODE_ENV=development`)
- With `DISABLE_DEV_PAGES=1`: Dev pages hidden in all environments
- Production: Dev pages always hidden (regardless of this flag)

**Implementation:**
- File: `src/lib/dev-only.ts`
- Returns `false` for dev page visibility when flag is set

---

## Error Tracking & Monitoring (Sentry)

### `SENTRY_DSN`

- **Type:** String (Sentry Data Source Name)
- **Required:** No (Recommended for production)
- **Purpose:** Error tracking, performance monitoring, and CSP violation monitoring
- **Format:** `https://[key]@[orgid].ingest.sentry.io/[projectid]`
- **Get at:** [sentry.io](https://sentry.io)

**Setup (Sentry.io):**
1. Sign up at [sentry.io](https://sentry.io) (free tier available)
2. Create a new Next.js project
3. Copy the DSN from Project Settings → Client Keys (DSN)
4. Add to environment variables

**Behavior without Sentry:**
- ✅ App works normally
- ✅ Errors logged to console
- ❌ No centralized error tracking
- ❌ No CSP violation monitoring
- ❌ No performance insights

**Behavior with Sentry:**
- ✅ Real-time error tracking
- ✅ CSP violations centralized in Sentry dashboard
- ✅ Performance monitoring (traces)
- ✅ Session replay on errors (production only)
- ✅ Email/Slack alerts on critical issues

**Configuration:**
- Server config: `sentry.server.config.ts`
- Client config: `sentry.client.config.ts`
- Edge config: `sentry.edge.config.ts`
- CSP integration: `src/app/api/csp-report/route.ts`

**Privacy Settings:**
- `sendDefaultPii: false` - No PII sent to Sentry
- `tracesSampleRate: 0.1` - 10% performance sampling in production
- `replaysOnErrorSampleRate: 1.0` - Capture 100% of error sessions

### `SENTRY_AUTH_TOKEN`

- **Type:** String (Sentry auth token)
- **Required:** No (Build-time only)
- **Purpose:** Upload source maps to Sentry for better error debugging
- **Format:** `sntrys_[token]`
- **Get at:** Sentry → Settings → Account → Auth Tokens

**Setup:**
1. Go to Sentry → Settings → Auth Tokens
2. Create token with `project:releases` scope
3. Add to `.env.sentry-build-plugin` (auto-created by wizard)
4. Token is used during `npm run build` only

**Behavior without token:**
- ✅ Sentry still works
- ❌ Error stack traces show minified code
- ❌ Harder to debug production issues

**Behavior with token:**
- ✅ Full source code context in errors
- ✅ Original file names and line numbers
- ✅ Better debugging experience

**Security:**
- Token stored in `.env.sentry-build-plugin`
- Auto-added to `.gitignore`
- Only needed for builds (CI/CD, Vercel)
- For Vercel: Use [Sentry Vercel Integration](https://vercel.com/integrations/sentry)

**Vercel Setup (Recommended):**
1. Install [Sentry Vercel Integration](https://vercel.com/integrations/sentry)
2. Link your Sentry project
3. Auth token automatically managed
4. Source maps uploaded on every deployment

---

## Production Checklist

### Minimum Configuration

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
```

This enables contact form email delivery.

### Recommended Configuration

```bash
# Required
RESEND_API_KEY=re_xxxxxxxxxxxx

# Recommended
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
REDIS_URL=redis://default:password@host:port

# Optional (custom domain only)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Deployment Checklist

- [ ] **RESEND_API_KEY** - Set and verified
- [ ] **GITHUB_TOKEN** - Set for reliable heatmap
- [ ] **REDIS_URL** - Set for view counts
- [ ] **Verify sending domain** in Resend
- [ ] **Test contact form** after deployment
- [ ] **Test GitHub heatmap** loads
- [ ] **Verify view counts** increment

---

## Environment-Specific Setup

### Development (.env.local)

```bash
# Optional - most features work without these!
# RESEND_API_KEY=re_xxxxxxxxxxxx
# GITHUB_TOKEN=ghp_xxxxxxxxxxxx
# REDIS_URL=redis://localhost:6379
```

### Staging/Preview (Vercel)

Use separate keys for preview environment:

```bash
RESEND_API_KEY=re_preview_xxxxxxxxxxxx
GITHUB_TOKEN=ghp_preview_xxxxxxxxxxxx
REDIS_URL=redis://preview-instance
```

### Production (Vercel)

Full configuration:

```bash
RESEND_API_KEY=re_live_xxxxxxxxxxxx
GITHUB_TOKEN=ghp_live_xxxxxxxxxxxx
REDIS_URL=redis://production-instance
NEXT_PUBLIC_SITE_URL=https://www.dcyfr.ai
```

---

## Testing

### Verify Configuration

```bash
# Check variables loaded (development)
npm run dev

# Check Vercel deployment
# Visit: Project → Settings → Environment Variables
```

### Test Individual Features

**Contact Form:**
```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}'
```

**GitHub Heatmap:**
```bash
curl http://localhost:3000/api/github-contributions?username=dcyfr
```

**Redis (if configured):**
- Visit any blog post
- Check console for view count increment

---

## Troubleshooting

| Problem | Likely Cause | Solution |
|---------|--------------|----------|
| Contact form returns 500 | Missing `RESEND_API_KEY` | Should show warning (check implementation) |
| Heatmap rate limited | No `GITHUB_TOKEN` | Add token for 5,000 req/hr |
| No view counts | Missing `REDIS_URL` | Add Redis or accept graceful degradation |
| Wrong domain in links | Incorrect site config | Set `NEXT_PUBLIC_SITE_URL` |
| Comments section missing | Missing Giscus env vars | Check all 4 Giscus variables set |

---

## Security Best Practices

### Never Commit Secrets

```bash
# ✅ Correct - ignored by git
.env.local
.env.development.local
.env.production.local

# ❌ Incorrect - tracked by git
.env
.env.development
.env.production
```

### Use Environment-Specific Keys

- Development: Separate keys for testing
- Staging: Separate from production
- Production: Production-only with restrictions

### Rotate Keys Regularly

- GitHub tokens: Every 90 days
- API keys: On schedule
- Redis: Strong passwords

### Principle of Least Privilege

- GitHub: Read-only access
- API keys: Minimum permissions
- Redis: Connection-level auth

---

## Minimal .env.local for Development

Everything works! The app gracefully degrades:

```bash
# Leave these empty - development works without credentials
RESEND_API_KEY=
GITHUB_TOKEN=
REDIS_URL=
NEXT_PUBLIC_GISCUS_REPO=
NEXT_PUBLIC_GISCUS_REPO_ID=
NEXT_PUBLIC_GISCUS_CATEGORY=
NEXT_PUBLIC_GISCUS_CATEGORY_ID=
```

---

## Related Documentation

- [API Routes](../api/routes/overview.md) - API documentation
- [Site Configuration](./site-config.md) - Domain/URL config
- [Inngest Integration](../features/inngest-integration.md) - Background jobs
- [GitHub Integration](../features/github-integration.md) - Heatmap setup
- [Deployment Guide](../deployment-guide.md) - Pre-deployment checklist

---

## Changelog

- **2025-10-26:** Consolidated from operations/ to platform/
- **2025-10-20:** Comprehensive `.env.example` with all variables
- **2025-10-20:** Added graceful fallbacks for missing keys


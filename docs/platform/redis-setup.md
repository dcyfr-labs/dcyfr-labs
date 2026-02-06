<!-- TLP:CLEAR -->
# Redis Setup Guide

Multi-environment Redis configuration for dcyfr-labs using Upstash.

## Quick Start (Local Development)

### Option 1: No Redis (Recommended for beginners)

Development features gracefully degrade without Redis:

```bash
npm run dev  # Analytics disabled, rate limiting uses in-memory
```

Features that work without Redis:
- All pages and navigation
- Blog content (MDX rendering)
- Projects showcase
- Contact forms (in-memory rate limiting)

Features disabled without Redis:
- View count tracking
- Share count tracking
- Trending posts analytics
- Redis-based caching

### Option 2: Development Redis (For testing analytics)

1. Request dev credentials from team lead
2. Add to `.env.local`:
   ```bash
   UPSTASH_REDIS_REST_URL_PREVIEW=https://preview-dev-redis-xxxxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN_PREVIEW=Axxxxx...
   ```
3. Run `npm run dev`
4. Your data will be prefixed with `dev:{your-username}:` for isolation

## Environment Overview

| Environment | Database | Purpose | Tier | Key Prefix |
|-------------|----------|---------|------|------------|
| Production | upstash-prod | Real user data | Paid ($10-20/mo) | None (dedicated) |
| Preview | upstash-preview-dev | PR testing | Free (10K/day) | `preview:{PR}:` |
| Development | upstash-preview-dev | Local dev | Free (10K/day) | `dev:{username}:` |
| Test | In-memory | CI/CD testing | N/A | N/A |

**Note**: Preview and Development share the same database but use key namespacing for isolation.

## Environment Variables

### Production Environment (Vercel)

| Variable | Description | Scope |
|----------|-------------|-------|
| `UPSTASH_REDIS_REST_URL` | Production database URL | Production only |
| `UPSTASH_REDIS_REST_TOKEN` | Production database token | Production only |

### Preview Environment (Vercel)

| Variable | Description | Scope |
|----------|-------------|-------|
| `UPSTASH_REDIS_REST_URL_PREVIEW` | Shared preview/dev URL | Preview only |
| `UPSTASH_REDIS_REST_TOKEN_PREVIEW` | Shared preview/dev token | Preview only |

### Development Environment (Local)

Add to `.env.local`:

```bash
# Preview/Dev shared database (free tier)
UPSTASH_REDIS_REST_URL_PREVIEW=https://preview-dev-redis-xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN_PREVIEW=Axxxxx...
```

**Getting credentials**: Contact team lead or see internal documentation.

## Key Namespacing

To safely share the preview database between environments:

- **Production**: No prefix (dedicated database)
  - Example: `views:post:abc-123`
- **Preview (PR #42)**: `preview:42:*`
  - Example: `preview:42:views:post:abc-123`
- **Development (user: alice)**: `dev:alice:*`
  - Example: `dev:alice:views:post:abc-123`

This prevents conflicts when multiple developers or PRs use the same database.

## Health Check

Verify Redis connectivity:

```bash
# Local development
curl http://localhost:3000/api/health/redis

# Expected output:
{
  "status": "ok",
  "environment": "development",
  "timestamp": "2026-01-25T10:30:00.000Z",
  "test": "passed"
}

# Production
curl https://www.dcyfr.ai/api/health/redis

# Preview (replace with actual PR deployment URL)
curl https://dcyfr-labs-git-feature-123.vercel.app/api/health/redis
```

## Troubleshooting

### "Redis credentials not configured"

**Symptom**: Console log shows `ℹ️ Development Redis not configured, analytics/caching disabled`

**Solution**:
- Add `UPSTASH_REDIS_REST_URL_PREVIEW` and `UPSTASH_REDIS_REST_TOKEN_PREVIEW` to `.env.local`
- Request credentials from team lead if you don't have them

**Alternative**: Features will gracefully degrade (analytics disabled, no errors)

### "Using production Redis in preview"

**Symptom**: Warning `⚠️ Preview Redis not configured, using production (unsafe!)`

**Problem**: Preview environment is falling back to production database

**Solution**: Add `UPSTASH_REDIS_REST_URL_PREVIEW` and `UPSTASH_REDIS_REST_TOKEN_PREVIEW` to Vercel environment variables (Preview scope)

### Health check fails

**Symptom**: `/api/health/redis` returns 500 error

**Debug steps**:
1. Check environment variables are set
2. Verify credentials are correct (copy-paste errors)
3. Test production credentials in Upstash console
4. Check Upstash dashboard for database status

### Data not appearing

**Symptom**: Analytics data not showing in development

**Possible causes**:
- Redis not configured (check health endpoint)
- Wrong key prefix (development uses `dev:{username}:`)
- Data exists in production but not in dev database

**Solution**: Run data migration script:
```bash
node scripts/migrate-redis-data.mjs dev
```

## Data Migration

Copy anonymized production data to preview/dev for testing:

```bash
# Migrate to preview environment
UPSTASH_REDIS_REST_URL=<prod-url> \
UPSTASH_REDIS_REST_TOKEN=<prod-token> \
UPSTASH_REDIS_REST_URL_PREVIEW=<preview-url> \
UPSTASH_REDIS_REST_TOKEN_PREVIEW=<preview-token> \
node scripts/migrate-redis-data.mjs preview

# Migrate to development environment
node scripts/migrate-redis-data.mjs dev
```

**What gets migrated**:
- View counts (`views:*`)
- Share counts (`shares:*`)
- Trending posts (`blog:trending`)
- Milestones (`blog:milestone:*`)

**What gets skipped** (sensitive data):
- User sessions (`session:*`)
- Rate limit state (`ratelimit:*`)
- Security data (`security:*`)
- API usage tracking (`api:usage:*`)

## Cost Management

### Free Tier Limits (Upstash)

- 10,000 commands per day
- 256 MB storage
- 1 database per tenant

### Current Usage

- **Production**: Paid tier ($10-20/mo) - unlimited commands
- **Preview + Dev**: Shared free tier - combined <10K commands/day

### Monitoring

Check Upstash dashboard for:
- Daily command usage (stay under 10K for free tier)
- Storage usage (stay under 256MB)
- Request errors

**Alert thresholds**:
- Preview + Dev approaching 8,000 commands/day (80% of free tier)
- Storage approaching 200MB (78% of limit)

## Security Notes

- **Never commit** `.env.local` to git
- **Never log** Redis credentials in clear text
- **Rotate tokens** if leaked (Upstash dashboard → Settings → Reset Token)
- **Use different credentials** for production vs preview/dev
- **Monitor access** in Upstash dashboard (unusual traffic patterns)

## Additional Resources

- [Upstash Redis Documentation](https://upstash.com/docs/redis)
- [Environment Variables Guide](./environment-variables.md)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

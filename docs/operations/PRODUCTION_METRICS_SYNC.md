# Production Metrics Sync System

**Status:** ✅ Active
**Last Updated:** January 30, 2026
**Purpose:** Automatically sync production analytics metrics to preview/dev environments

---

## Overview

The production metrics sync system automatically copies analytics data from the production Redis database to the preview Redis database during the build process. This ensures that preview deployments and local development have access to real production analytics data for accurate testing and development.

### What Gets Synced

**Critical Analytics Keys (always synced):**

- `analytics:milestones` - Achievement milestones (monthly visitors, total views)
- `github:traffic:milestones` - GitHub traffic achievements
- `google:analytics:milestones` - Google Analytics milestones
- `blog:trending` - Trending blog posts data

**Pattern-Based Keys (full sync only):**

- `pageviews:*` - All page view counters
- `engagement:*` - All engagement metrics (likes, shares, clicks)
- `project:views:*` - Project view counters

### What NEVER Gets Synced

For security reasons, the following keys are **always excluded**:

- `session:*` - User sessions (environment-specific)
- `blocked:ips` - Blocked IP addresses (security-sensitive)
- `suspicious:ips` - Suspicious IP tracking
- `rate_limit:*` - Rate limiting data
- `ip:reputation:*` - IP reputation cache
- `nonce:*`, `csrf:*` - Security tokens
- `inoreader:tokens` - API tokens
- `*:api_key`, `*:token`, `*:secret` - Any credentials
- `mcp:health:*` - MCP health tracking (environment-specific)
- `cache:version:*` - Cache versioning (environment-specific)

---

## Usage

### Quick Reference

```bash
# Full sync (all keys, including patterns)
npm run sync:metrics

# Quick sync (critical keys only, used in build)
npm run sync:metrics:quick

# Dry run (preview what would be synced)
npm run sync:metrics:dry-run
```

### Automatic Build Integration

The sync runs automatically during the build process:

```bash
npm run build
# Runs: validate → search index → cache → sync:metrics:quick → next build
```

**Quick mode** is used in builds to keep build times fast while syncing the most important analytics data.

### Manual Sync

For development or testing purposes, you can manually trigger a full sync:

```bash
# Full sync with all patterns
npm run sync:metrics

# See what would be synced without making changes
npm run sync:metrics:dry-run
```

---

## How It Works

### Architecture

```
┌─────────────────────┐
│  Production Redis   │
│  (Upstash)          │
│                     │
│  No key prefix      │
│  analytics:*        │
│  pageviews:*        │
│  engagement:*       │
└──────────┬──────────┘
           │
           │ READ ONLY
           │ (one-way sync)
           ▼
    ┌──────────────┐
    │  Sync Script │
    │              │
    │  Filters     │
    │  Excludes    │
    │  Prefixes    │
    └──────┬───────┘
           │
           │ WRITE ONLY
           │ (with preview: prefix)
           ▼
┌─────────────────────┐
│   Preview Redis     │
│   (Upstash)         │
│                     │
│   With prefix:      │
│   preview:analytics │
│   preview:pageviews │
│   preview:engagement│
└─────────────────────┘
```

### Key Prefixing

All synced keys automatically receive the `preview:` prefix in the preview database:

- Production: `analytics:milestones`
- Preview: `preview:analytics:milestones`

This ensures preview data doesn't interfere with any production data if the same database is accidentally used.

### Environment Detection

The sync script automatically detects the correct Redis credentials based on environment variables:

**Production (source):**

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

**Preview (destination):**

- `UPSTASH_REDIS_REST_URL_PREVIEW`
- `UPSTASH_REDIS_REST_TOKEN_PREVIEW`

---

## Configuration

### Environment Variables

Required in `.env.local` or deployment environment:

```bash
# Production Redis (source - READ ONLY)
UPSTASH_REDIS_REST_URL=https://your-production-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-production-token

# Preview Redis (destination - WRITE)
UPSTASH_REDIS_REST_URL_PREVIEW=https://your-preview-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN_PREVIEW=your-preview-token
```

### Vercel Setup

In Vercel project settings, configure these environment variables:

1. **Production environment:**
   - `UPSTASH_REDIS_REST_URL` (production database)
   - `UPSTASH_REDIS_REST_TOKEN` (production database)

2. **Preview environment:**
   - `UPSTASH_REDIS_REST_URL` (production - for reading)
   - `UPSTASH_REDIS_REST_TOKEN` (production - for reading)
   - `UPSTASH_REDIS_REST_URL_PREVIEW` (preview database)
   - `UPSTASH_REDIS_REST_TOKEN_PREVIEW` (preview database)

3. **Development environment:**
   - Same as Preview

---

## Safety & Security

### One-Way Sync Only

The sync is **strictly one-way**:

- ✅ Reads from production
- ✅ Writes to preview
- ❌ Never writes to production
- ❌ Never reads sensitive keys

### Exclusion Patterns

The script includes comprehensive exclusion patterns to prevent syncing:

- Security tokens and credentials
- User sessions and authentication data
- IP blocking and rate limiting data
- Environment-specific cache data

### Dry Run Testing

Always test sync operations with dry run mode first:

```bash
npm run sync:metrics:dry-run
```

This shows exactly what would be synced without making any changes.

---

## Troubleshooting

### Error: Production credentials missing

**Problem:** `UPSTASH_REDIS_REST_URL` or `UPSTASH_REDIS_REST_TOKEN` not set

**Solution:**

1. Check `.env.local` has production credentials
2. Verify Vercel environment variables are set
3. Ensure you're running in an environment with access to production

### Error: Preview credentials missing

**Problem:** `UPSTASH_REDIS_REST_URL_PREVIEW` or `UPSTASH_REDIS_REST_TOKEN_PREVIEW` not set

**Solution:**

1. Add preview database credentials to `.env.local`
2. Set preview environment variables in Vercel
3. Create a separate preview database in Upstash

### No keys synced in quick mode

**Expected behavior:** Quick mode only syncs critical keys (milestones, trending)

**Solution:** Use full sync if you need all pattern-based keys:

```bash
npm run sync:metrics
```

### Build fails during sync

**Problem:** Sync script exits with error during `npm run build`

**Temporary workaround:** Skip sync in build (not recommended):

```bash
# Edit package.json temporarily
"build": "npm run validate:categories && ... && next build"
# (remove sync:metrics:quick)
```

**Permanent fix:**

1. Check Redis credentials are valid
2. Verify network connectivity to Upstash
3. Check Upstash dashboard for database status
4. Review sync script logs for specific error

---

## Performance

### Sync Times

- **Quick mode** (critical keys only): ~1-2 seconds
- **Full mode** (with patterns): ~5-15 seconds (depends on data volume)

### Build Impact

The quick sync adds minimal overhead to builds:

- ✅ Runs in parallel with other build steps where possible
- ✅ Only syncs ~4 critical keys by default
- ✅ Fails fast if credentials missing (no timeout delays)

### Data Volume

Typical sync volumes:

- Critical keys: 4 keys (~2-10 KB total)
- Full sync: 50-200 keys (~50-500 KB total)

---

## Monitoring

### Sync Logs

The sync script provides detailed logs:

```
🔄 Production Metrics Sync
============================================================
Mode: LIVE SYNC
Speed: QUICK (critical only)

📊 Syncing critical analytics keys...
   ✓ analytics:milestones → preview:analytics:milestones
   ✓ github:traffic:milestones → preview:github:traffic:milestones
   ✓ blog:trending → preview:blog:trending
   ⊘ google:analytics:milestones (not found in production)

============================================================
📈 Sync Summary
============================================================
Critical keys:    3 synced
Page views:       0 synced
Engagement:       0 synced
Project views:    0 synced
────────────────────────────────────────────────────────────
Total:            3 keys synced

✅ Sync complete! Preview database now has production metrics.
```

### Vercel Build Logs

Check Vercel build logs for sync status:

1. Go to deployment in Vercel dashboard
2. Navigate to "Build Logs"
3. Search for "Production Metrics Sync"
4. Review sync summary

---

## Future Enhancements

Potential improvements (not yet implemented):

- [ ] Incremental sync (only changed keys)
- [ ] Scheduled sync via GitHub Actions (daily/hourly)
- [ ] Bidirectional sync for specific keys (with conflict resolution)
- [ ] Sync verification (compare production vs preview)
- [ ] Metrics on sync performance and data staleness
- [ ] Rollback capability (restore previous preview state)

---

## Related Documentation

- Redis Client Configuration
- Analytics Integration
- Test Data Prevention
- Environment Configuration

---

**Questions or Issues?**

- Check Vercel build logs for sync errors
- Run `npm run sync:metrics:dry-run` to debug locally
- Review excluded patterns if keys aren't syncing
- Verify Redis credentials in Vercel dashboard

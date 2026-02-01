# Production Metrics Sync - Quick Reference

**Purpose:** Sync production analytics to preview/dev environments
**Status:** ✅ Active (automatic on build)
**Documentation:** [Full Guide](./PRODUCTION_METRICS_SYNC.md)

---

## Quick Commands

```bash
# Automatic (runs during build)
npm run build  # Includes sync:metrics:quick

# Manual sync
npm run sync:metrics              # Full sync (all keys)
npm run sync:metrics:quick        # Quick sync (critical keys only)
npm run sync:metrics:dry-run      # Preview without syncing
```

---

## What Gets Synced

### ✅ Always Synced (Quick Mode)

- `blog:trending` → `preview:blog:trending` (production data)

**Optional (future features - may not exist in production):**

- `analytics:milestones` → `preview:analytics:milestones` (Vercel Analytics)
- `github:traffic:milestones` → `preview:github:traffic:milestones` (GitHub traffic)

### ✅ Full Mode Only

- `pageviews:*` (all page view counters)
- `engagement:*` (likes, shares, clicks)
- `project:views:*` (project views)

### ❌ Never Synced (Security)

- `session:*` (user sessions)
- `blocked:ips` (IP blocking)
- `*:token`, `*:api_key`, `*:secret` (credentials)
- `rate_limit:*` (rate limiting)
- Environment-specific cache

---

## Environment Variables

**Required:**

```bash
# Production (source - READ ONLY)
UPSTASH_REDIS_REST_URL=https://prod.upstash.io
UPSTASH_REDIS_REST_TOKEN=prod-token

# Preview (destination - WRITE)
UPSTASH_REDIS_REST_URL_PREVIEW=https://preview.upstash.io
UPSTASH_REDIS_REST_TOKEN_PREVIEW=preview-token
```

**Where to set:**

- Local: `.env.local`
- Vercel: Project Settings → Environment Variables
- GitHub: Repository Secrets (for Actions)

---

## Safety Features

1. **One-Way Sync:** Production → Preview only (never reverse)
2. **Auto-Prefix:** All keys get `preview:` namespace
3. **Exclusions:** 10+ security-sensitive patterns blocked
4. **Dry Run:** Test with `--dry-run` flag first

---

## Performance

| Mode  | Keys   | Time  | Use Case          |
| ----- | ------ | ----- | ----------------- |
| Quick | 4      | 1-2s  | Build (automatic) |
| Full  | 50-200 | 5-15s | Manual sync       |

---

## Troubleshooting

**Build fails?**

```bash
# Check credentials locally
npm run sync:metrics:dry-run

# View what would sync
npm run sync:metrics:dry-run
```

**No keys synced?**

- Check `.env.local` has both production and preview credentials
- Verify credentials in Vercel dashboard
- Run dry-run to see detailed logs

**Keys not appearing in preview?**

- Remember the `preview:` prefix
- Access with: `redis.get('preview:analytics:milestones')`
- Check if key excluded by security patterns

---

## Files Reference

| File                                                | Purpose            |
| --------------------------------------------------- | ------------------ |
| `scripts/sync-production-metrics.mjs`               | Main sync script   |
| `docs/operations/PRODUCTION_METRICS_SYNC.md`        | Full documentation |
| `tests/integration/sync-production-metrics.test.ts` | Test suite         |
| `.github/workflows/sync-production-metrics.yml`     | Scheduled sync     |

---

## Next Steps

1. ✅ Verify `.env.local` has all credentials
2. ✅ Run dry-run: `npm run sync:metrics:dry-run`
3. ✅ Deploy and check Vercel build logs
4. ✅ Verify data appears in preview environment

---

**Full Documentation:** [PRODUCTION_METRICS_SYNC.md](./PRODUCTION_METRICS_SYNC.md)
**Implementation:** January 30, 2026

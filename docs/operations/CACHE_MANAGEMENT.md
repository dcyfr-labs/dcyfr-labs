<!-- TLP:CLEAR -->

# Cache Management Operations Guide

**Information Classification:** TLP:AMBER (Limited Distribution)
**Audience:** DevOps, Site Reliability Engineers
**Last Updated:** February 4, 2026

---

## 📋 Overview

The dcyfr-labs application uses Redis caching for external API data to prevent rate limiting and improve performance. This guide covers cache management operations, troubleshooting, and monitoring.

---

## 🗂️ Cache Architecture

### Data Sources

1. **Credly Badges** - Professional certifications and badges
   - Keys: `credly:badges:dcyfr:all`, `credly:badges:dcyfr:10`, `credly:badges:dcyfr:3`
   - TTL: 24 hours
   - Source: https://www.credly.com/users/dcyfr/badges.json

2. **GitHub Contributions** - Contribution graph data
   - Key: `github:contributions:dcyfr`
   - TTL: 24 hours
   - Source: GitHub GraphQL API

### Cache Refresh Strategy

**Primary:** GitHub Actions Cron (Daily at 6:00 AM UTC)

- Workflow: `.github/workflows/cache-refresh.yml`
- Trigger: Scheduled + manual dispatch
- Authentication: `CRON_SECRET` GitHub secret

**Fallback:** Manual trigger via API endpoint

- Endpoint: `POST https://www.dcyfr.ai/api/admin/populate-cache`
- Authentication: `Authorization: Bearer $CRON_SECRET`

**Build-Time:** Cache population during deployment

- Script: `scripts/populate-build-cache.mjs`
- Runs: During `npm run build`
- Only populates if Redis credentials available

---

## 🔍 Monitoring

### Cache Health Check

**Endpoint:** `GET https://www.dcyfr.ai/api/health/cache`

**Healthy Response:**

```json
{
  "healthy": true,
  "summary": "4/4 cache keys populated",
  "checks": {
    "credly_all": { "cached": true, "status": "OK" },
    "credly_limit10": { "cached": true, "status": "OK" },
    "credly_limit3": { "cached": true, "status": "OK" },
    "github": { "cached": true, "status": "OK" }
  }
}
```

**Unhealthy Response:**

```json
{
  "healthy": false,
  "summary": "1/4 cache keys populated",
  "checks": {
    "credly_all": { "cached": false, "status": "MISSING" }
    // ... other keys
  }
}
```

### Automated Monitoring

**GitHub Actions Workflow:**

- Daily health check after cache refresh
- Alerts on failure (configurable Slack/Discord webhook)
- Visible in Actions tab: https://github.com/dcyfr-labs/dcyfr-labs/actions

**Sentry Integration:**

- Cache miss warnings in production
- API fetch failures tracked
- Tagged with `cache:credly` or `cache:github`

---

## 🛠️ Operations

### Manual Cache Refresh

**When to use:**

- Cache health check shows unhealthy status
- After extended downtime
- After Redis maintenance
- To verify new deployment

**Method 1: GitHub Actions (Recommended)**

```bash
# Via GitHub CLI
gh workflow run cache-refresh.yml

# Via GitHub UI
# Go to: Actions → Cache Refresh → Run workflow
```

**Method 2: Direct API Call**

```bash
# Get CRON_SECRET from Vercel
cd dcyfr-labs
vercel env pull --environment production .env.prod.local
CRON_SECRET=$(grep "^CRON_SECRET=" .env.prod.local | cut -d'=' -f2-)

# Trigger cache population
curl -X POST https://www.dcyfr.ai/api/admin/populate-cache \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json"

# Verify health
curl -s https://www.dcyfr.ai/api/health/cache | jq '.healthy'
```

**Method 3: Local Development**

```bash
# Populate local/preview cache
npm run populate:cache

# Or via dev endpoint
curl http://localhost:3000/api/dev/populate-cache
```

### Cache Invalidation

**Clear specific cache:**

```bash
# Requires Redis CLI or Upstash console
# Production Redis: UPSTASH_REDIS_REST_URL
redis-cli DEL "credly:badges:dcyfr:all"
redis-cli DEL "github:contributions:dcyfr"
```

**Clear all cache:**

```bash
# Danger: This clears ALL keys in the database
redis-cli FLUSHDB
```

### Verify Cache Population

**Check key existence:**

```bash
# Via Upstash Console
# https://console.upstash.com/redis/<your-db-id>

# Via Redis CLI
redis-cli EXISTS "credly:badges:dcyfr:all"
# Returns: 1 (exists) or 0 (missing)

# Get value
redis-cli GET "credly:badges:dcyfr:all" | jq '.badges | length'
```

---

## 🚨 Troubleshooting

### Issue: Cache Keys Missing

**Symptoms:**

- `/api/health/cache` shows `healthy: false`
- Homepage shows "Cache key not found" errors
- Badge/Skills sections show error states

**Diagnosis:**

```bash
# Check cache health
curl -s https://www.dcyfr.ai/api/health/cache | jq '.'

# Check GitHub Actions runs
gh run list --workflow=cache-refresh.yml --limit 5

# Check Vercel logs
cd dcyfr-labs
vercel logs --prod --since 24h | grep "Admin Cache"
```

**Resolution:**

1. Manually trigger cache refresh (see Manual Cache Refresh above)
2. Check GitHub Actions logs for errors
3. Verify `CRON_SECRET` is set in GitHub Secrets
4. Check Credly API status: https://status.credly.com/

### Issue: Partial Cache Population

**Symptoms:**

- GitHub cache works, Credly cache doesn't (or vice versa)

**Possible Causes:**

1. External API rate limiting
2. Network timeout
3. API endpoint temporary downtime

**Resolution:**

```bash
# Test Credly API directly
curl -v https://www.credly.com/users/dcyfr/badges.json

# Test GitHub API (requires GITHUB_TOKEN)
curl -H "Authorization: bearer $GITHUB_TOKEN" \
  https://api.github.com/graphql \
  -d '{"query":"query { viewer { login } }"}'

# Re-trigger cache population
curl -X POST https://www.dcyfr.ai/api/admin/populate-cache \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Issue: Cache Refresh Failing

**Symptoms:**

- GitHub Actions workflow fails
- API endpoint returns 500 error
- Sentry shows repeated cache errors

**Check Logs:**

```bash
# GitHub Actions logs
gh run view --log-failed

# Vercel function logs
vercel logs --prod --since 1h | grep "populate-cache"

# Sentry errors
# https://dcyfr.sentry.io/issues/?query=cache
```

**Common Errors:**

| Error                     | Cause               | Fix                                      |
| ------------------------- | ------------------- | ---------------------------------------- |
| `401 Unauthorized`        | Invalid CRON_SECRET | Regenerate and update secret             |
| `Timeout`                 | External API slow   | Retry logic will handle (max 3 attempts) |
| `Rate limit exceeded`     | Too many API calls  | Wait for rate limit reset                |
| `Redis connection failed` | Redis downtime      | Check Upstash status                     |

### Issue: High Cache Miss Rate

**Symptoms:**

- Slow page loads
- External API errors
- Sentry warnings about cache misses

**Check:**

```bash
# View cache stats
curl -s https://www.dcyfr.ai/api/health/cache

# Check TTL of keys
redis-cli TTL "credly:badges:dcyfr:all"
# Returns seconds until expiration
```

**Resolution:**

- Ensure cron job running daily
- Consider increasing TTL if data changes infrequently
- Add monitoring for cache miss rate

---

## 🔧 Configuration

### Environment Variables

**Production (Vercel):**

```bash
CRON_SECRET=<secret-token>
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=<token>
GITHUB_TOKEN=<github-pat>
```

**Preview/Development:**

```bash
UPSTASH_REDIS_REST_URL_PREVIEW=https://...
UPSTASH_REDIS_REST_TOKEN_PREVIEW=<token>
# Uses 'preview:' key prefix
```

### GitHub Secrets

Required for GitHub Actions workflow:

```bash
# Add CRON_SECRET to GitHub repo secrets
gh secret set CRON_SECRET --body "$(vercel env pull --environment production .env.prod.local && grep CRON_SECRET .env.prod.local | cut -d'=' -f2-)"

# Verify secret exists
gh secret list | grep CRON
```

### Cron Schedule

**GitHub Actions:** `.github/workflows/cache-refresh.yml`

```yaml
on:
  schedule:
    - cron: '0 6 * * *' # Daily at 6:00 AM UTC
```

**Vercel Cron:** `vercel.json` (requires Pro plan)

```json
{
  "crons": [
    {
      "path": "/api/admin/populate-cache",
      "schedule": "0 6 * * *"
    }
  ]
}
```

---

## 📊 Metrics & SLOs

### Service Level Objectives

| Metric                     | Target | Current                |
| -------------------------- | ------ | ---------------------- |
| Cache Availability         | 99.5%  | Monitor in Sentry      |
| Cache Refresh Success Rate | 98%    | GitHub Actions history |
| Cache Miss Rate            | <5%    | Application logs       |
| Health Check Response Time | <500ms | Uptime monitoring      |

### Monitoring Dashboards

- **Cache Health:** https://www.dcyfr.ai/api/health/cache
- **GitHub Actions:** https://github.com/dcyfr-labs/dcyfr-labs/actions/workflows/cache-refresh.yml
- **Sentry Errors:** https://dcyfr.sentry.io/issues/?query=tag:cache
- **Upstash Console:** https://console.upstash.com/

---

## 🔐 Security

### Authentication

**API Endpoint:**

- Requires `CRON_SECRET` in Authorization header
- Secret rotation: Quarterly (recommended)
- Never log or expose secret in responses

**Rotate Secret:**

```bash
# Generate new secret
NEW_SECRET=$(openssl rand -base64 32)

# Update in Vercel
vercel env add CRON_SECRET production
# Paste new secret when prompted

# Update in GitHub
gh secret set CRON_SECRET --body "$NEW_SECRET"

# Test new secret works
curl -X POST https://www.dcyfr.ai/api/admin/populate-cache \
  -H "Authorization: Bearer $NEW_SECRET"
```

### Rate Limiting

**External APIs:**

- Credly: ~100 requests/hour (estimated)
- GitHub: 5,000 requests/hour (with token)

**Internal Endpoints:**

- `/api/admin/populate-cache`: No rate limit (authenticated only)
- `/api/health/cache`: 60 requests/minute (public)

---

## 📚 Related Documentation

- [Cache Fix Implementation Plan](../../docs/investigations/CACHE_FIX_IMPLEMENTATION_PLAN_2026-02-04.md)
- [Root Cause Analysis](../../docs/investigations/CACHE_KEY_MISSING_ROOT_CAUSE_2026-02-04.md)
- [API Documentation](../api/README.md)
- [Deployment Guide](DEPLOYMENT.md)

---

## 🆘 Escalation

**If cache issues persist after following this guide:**

1. Check [GitHub Discussions](https://github.com/dcyfr-labs/dcyfr-labs/discussions)
2. Create incident in [Issues](https://github.com/dcyfr-labs/dcyfr-labs/issues)
3. Contact: hello@dcyfr.ai

**Emergency Contacts:**

- On-call DevOps: [Contact Information]
- Upstash Support: https://upstash.com/support
- Vercel Support: https://vercel.com/support

---

**Last Updated:** 2026-02-04
**Maintained By:** DevOps Team
**Review Cycle:** Quarterly

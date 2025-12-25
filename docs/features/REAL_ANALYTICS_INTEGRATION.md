# Real Analytics Integration Guide

**Status:** Production Ready (Real Data)  
**Last Updated:** December 25, 2025

This document describes how to integrate real analytics data sources for the activity feed milestones.

---

## Overview

The application now supports **real analytics data** from multiple sources:

| Source | Status | Configuration Required |
|--------|--------|------------------------|
| **Vercel Analytics** | ✅ Implemented | VERCEL_TOKEN + VERCEL_ANALYTICS_ENDPOINT |
| **GitHub Traffic** | ✅ Implemented | GITHUB_TOKEN (with repo scope) |
| **Google Analytics** | 📝 Placeholder | OAuth 2.0 service account (future) |
| **Google Search Console** | 📝 Placeholder | OAuth 2.0 service account (future) |

---

## Setup Instructions

### 1. Vercel Analytics Integration

**Prerequisites:**
- Vercel account with analytics enabled
- Project deployed on Vercel

**Steps:**

1. **Get Vercel Access Token:**
   ```bash
   # Visit https://vercel.com/account/tokens
   # Create token with "Read" permission for analytics
   ```

2. **Set Environment Variables:**
   ```bash
   # In Vercel dashboard or .env.local:
   VERCEL_TOKEN=your_vercel_token_here
   VERCEL_ANALYTICS_ENDPOINT=https://vercel.com/api/web/insights
   ```

3. **Verify Integration:**
   ```bash
   npm run analytics:update
   ```

**What It Tracks:**
- Monthly visitors
- Total page views
- Unique visitors
- Top pages performance

---

### 2. GitHub Traffic Integration

**Prerequisites:**
- Repository exists on GitHub
- GitHub Personal Access Token with `repo` scope

**Steps:**

1. **Create GitHub Token:**
   ```bash
   # Visit https://github.com/settings/tokens/new
   # Select scopes: 'repo' (for traffic data, requires admin)
   # Generate token and save securely
   ```

2. **Set Environment Variable:**
   ```bash
   # In Vercel dashboard or .env.local:
   GITHUB_TOKEN=ghp_your_token_here
   ```

3. **Verify Integration:**
   ```bash
   npm run analytics:update
   ```

**What It Tracks:**
- Stars count
- Forks count
- Watchers count
- Contributors (future)

**Note:** Traffic data (views, clones) requires repository admin access. Public API only provides stars/forks/watchers.

---

### 3. Google Analytics (Placeholder)

**Status:** Not yet implemented (placeholder functions exist)

**Future Setup:**
1. Create Google Cloud project
2. Enable Google Analytics Data API
3. Create service account and download JSON key
4. Add service account email to GA property as viewer
5. Set `GOOGLE_ANALYTICS_CREDENTIALS` environment variable

**Implementation:** See `src/lib/analytics-integration.ts` (functions ready for OAuth integration)

---

### 4. Google Search Console (Placeholder)

**Status:** Not yet implemented (placeholder functions exist)

**Future Setup:**
1. Verify site ownership in Google Search Console
2. Enable Search Console API in Google Cloud
3. Create service account and download JSON key
4. Add service account email to Search Console as owner
5. Set `GOOGLE_SEARCH_CONSOLE_CREDENTIALS` environment variable

**Implementation:** See `src/lib/analytics-integration.ts` (functions ready for OAuth integration)

---

## Usage

### Automatic Updates (Scheduled)

Analytics data is automatically updated:
- **Frequency:** Daily at 2 AM UTC
- **Method:** Inngest scheduled function
- **Function:** `src/inngest/update-analytics-milestones.ts`

**Cron Schedule:**
```typescript
{ cron: "0 2 * * *" }  // Daily at 2 AM UTC
```

### Manual Updates

#### Development

```bash
# Trigger analytics update locally
npm run analytics:update

# This calls: POST http://localhost:3000/api/analytics/update-milestones
```

#### Production

```bash
# Requires CRON_SECRET environment variable
npm run analytics:update:prod

# Or manually:
curl -X POST https://dcyfr.dev/api/analytics/update-milestones \
  -H "Authorization: Bearer $CRON_SECRET"
```

### API Endpoint

**Endpoint:** `POST /api/analytics/update-milestones`

**Authentication:**
- **Development:** No authentication required
- **Production:** Requires `Authorization: Bearer $CRON_SECRET` header

**Response:**
```json
{
  "success": true,
  "message": "Analytics update queued",
  "queued_at": "2025-12-25T10:30:00.000Z"
}
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ANALYTICS INTEGRATION                     │
└─────────────────────────────────────────────────────────────┘

1. TRIGGER (Manual or Scheduled):
   ┌─────────────────┐        ┌──────────────────┐
   │   Cron Schedule  │   OR   │   Manual API Call │
   │  (Daily 2 AM)   │        │  /api/analytics/.. │
   └────────┬────────┘        └────────┬──────────┘
            │                          │
            └──────────┬───────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │   Inngest Function   │
            │  (Background Job)    │
            └──────────┬───────────┘
                       │
                       ▼

2. FETCH REAL DATA:
   ┌────────────────────────────────────────────┐
   │  src/lib/analytics-integration.ts          │
   │                                             │
   │  • fetchVercelAnalyticsMilestones()        │
   │    → Vercel Analytics API                  │
   │                                             │
   │  • fetchGitHubTrafficMilestones()          │
   │    → GitHub REST API                       │
   │                                             │
   │  • fetchGoogleAnalyticsMilestones()        │
   │    → (Placeholder - not implemented)       │
   │                                             │
   │  • fetchSearchConsoleMilestones()          │
   │    → (Placeholder - not implemented)       │
   └────────────────────┬───────────────────────┘
                        │
                        ▼

3. STORE IN REDIS:
   ┌────────────────────────────────────────────┐
   │  Redis Keys (JSON Arrays):                 │
   │                                             │
   │  • analytics:milestones                    │
   │    [{type, threshold, reached_at, value}] │
   │                                             │
   │  • github:traffic:milestones               │
   │    [{type, value, reached_at}]            │
   │                                             │
   │  • google:analytics:milestones             │
   │    (Placeholder - empty for now)           │
   │                                             │
   │  • search:console:milestones               │
   │    (Placeholder - empty for now)           │
   └────────────────────┬───────────────────────┘
                        │
                        ▼

4. CONSUMED BY ACTIVITY FEED:
   ┌────────────────────────────────────────────┐
   │  src/lib/activity/sources.server.ts        │
   │                                             │
   │  • transformVercelAnalytics()              │
   │  • transformGitHubTraffic()                │
   │  • transformGoogleAnalytics()              │
   │  • transformSearchConsole()                │
   └────────────────────┬───────────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │  Activity Feed   │
              │  /activity page  │
              └──────────────────┘
```

---

## Environment Variables

**Required for Real Data:**

```bash
# Vercel Analytics
VERCEL_TOKEN=your_vercel_token
VERCEL_ANALYTICS_ENDPOINT=https://vercel.com/api/web/insights

# GitHub Traffic
GITHUB_TOKEN=ghp_your_token

# Production API Authentication
CRON_SECRET=your_secret_for_api_auth

# Redis (for storing milestones)
REDIS_URL=redis://your_redis_url

# Future: Google Analytics
# GOOGLE_ANALYTICS_CREDENTIALS={"type":"service_account",...}

# Future: Google Search Console
# GOOGLE_SEARCH_CONSOLE_CREDENTIALS={"type":"service_account",...}
```

---

## Graceful Degradation

**What happens if analytics sources are not configured?**

1. **No Environment Variables:**
   - Functions log warnings in production
   - Functions log info messages in development
   - Return empty arrays (no data)
   - Activity feed continues working without milestones

2. **API Failures:**
   - Errors are caught and logged
   - Other sources continue processing
   - Partial data is returned (not all-or-nothing)

3. **Redis Unavailable:**
   - Milestones can't be stored
   - Error logged
   - Function completes gracefully

**Key Design Principle:** Never fail hard. Always degrade gracefully.

---

## Testing

### Test Analytics Update (Dev)

```bash
# Start dev server
npm run dev

# In another terminal, trigger update
npm run analytics:update

# Check logs for:
# ✅ Fetched Vercel Analytics: X views
# ✅ Fetched GitHub metrics: X stars
# ✅ Stored N milestones in Redis
```

### Verify Data in Redis

```bash
# Connect to Redis
redis-cli -u $REDIS_URL

# Check analytics milestones
GET analytics:milestones

# Check GitHub milestones
GET github:traffic:milestones

# Exit
quit
```

### Check Activity Feed

```bash
# Visit http://localhost:3000/activity
# Look for milestone items in the feed
```

---

## Migration from Test Data

**Before (Test Data):**
```bash
# Populated fake data
npm run analytics:populate

# Result: 13 fabricated items in Redis
```

**After (Real Data):**
```bash
# Fetch real data from configured APIs
npm run analytics:update

# Result: Real metrics from Vercel + GitHub
```

**Cleanup:**
```bash
# Remove old test data
npm run analytics:clear

# Update with real data
npm run analytics:update
```

---

## Troubleshooting

### Issue: "Vercel Analytics not configured"

**Solution:**
1. Check `VERCEL_TOKEN` is set
2. Check `VERCEL_ANALYTICS_ENDPOINT` is set
3. Verify token has correct permissions (Read for analytics)

### Issue: "GitHub API returned 401"

**Solution:**
1. Check `GITHUB_TOKEN` is set
2. Verify token has `repo` scope
3. Ensure token hasn't expired

### Issue: "No milestones showing in activity feed"

**Solution:**
1. Run `npm run analytics:update`
2. Check Redis for data: `redis-cli GET analytics:milestones`
3. Verify activity feed is calling `transformVercelAnalytics()` and `transformGitHubTraffic()`

### Issue: "Analytics update returns 401 in production"

**Solution:**
1. Check `CRON_SECRET` is set in Vercel environment variables
2. Ensure Authorization header includes correct secret
3. Format: `Authorization: Bearer your_secret_here`

---

## Production Deployment Checklist

- [ ] Set `VERCEL_TOKEN` in Vercel environment variables
- [ ] Set `VERCEL_ANALYTICS_ENDPOINT` in Vercel environment variables
- [ ] Set `GITHUB_TOKEN` in Vercel environment variables
- [ ] Set `CRON_SECRET` in Vercel environment variables
- [ ] Verify Inngest is deployed and connected
- [ ] Run `npm run analytics:clear` to remove test data
- [ ] Run `npm run analytics:update:prod` to populate real data
- [ ] Verify activity feed shows real milestones
- [ ] Monitor Inngest dashboard for scheduled function execution

---

## Future Enhancements

### Short Term
- [ ] Add retry logic for failed API calls
- [ ] Implement exponential backoff for rate limits
- [ ] Add Sentry monitoring for analytics errors
- [ ] Create dashboard for analytics health status

### Long Term
- [ ] Implement Google Analytics Data API integration
- [ ] Implement Google Search Console API integration
- [ ] Add historical data tracking (trend analysis)
- [ ] Create admin panel for manual data refresh
- [ ] Add email notifications for milestone achievements

---

## References

- [Vercel Analytics API](https://vercel.com/docs/analytics/api)
- [GitHub REST API - Traffic](https://docs.github.com/en/rest/metrics/traffic)
- [Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Google Search Console API](https://developers.google.com/webmaster-tools/v1/api_reference_index)
- [Inngest Documentation](https://www.inngest.com/docs)

---

**Status:** ✅ Ready for Production  
**Next Steps:** Configure environment variables → Deploy → Monitor  
**Support:** See troubleshooting section or check Inngest dashboard logs

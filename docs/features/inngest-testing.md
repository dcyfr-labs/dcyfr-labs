{/* TLP:CLEAR */}

# Inngest Testing Quick Reference

Quick guide for testing Inngest functions in development.

## Access the Dev UI

**URL**: http://localhost:3001/api/inngest

This shows all registered functions, recent runs, and testing tools.

## Test Contact Form

### Method 1: Use the Contact Form
1. Navigate to: http://localhost:3001/contact
2. Fill out the form
3. Submit
4. Check Inngest UI for execution
5. Check terminal for logs

### Method 2: Send Event Directly
```ts
// In a server component or API route
import { inngest } from "@/inngest/client";

await inngest.send({
  name: "contact/form.submitted",
  data: {
    name: "Test User",
    email: "test@example.com",
    message: "This is a test message",
    submittedAt: new Date().toISOString(),
    ip: "127.0.0.1",
  },
});
```

### Method 3: Use Inngest UI
1. Open http://localhost:3001/api/inngest
2. Find "contactFormSubmitted" function
3. Click "Test" or "Invoke"
4. Provide test payload
5. Click "Invoke Function"
6. Watch step-by-step execution

**Expected Behavior:**
- ✅ Function shows in UI
- ✅ Steps execute sequentially
- ✅ Email sending steps log warnings (if `RESEND_API_KEY` not set)
- ✅ No errors (graceful handling of missing config)

## Test GitHub Refresh

### Scheduled Function (Auto-runs every 5 min)
1. Wait for scheduled execution OR
2. Manually trigger from Inngest UI:
   - Find "refreshGitHubData"
   - Click "Test"
   - Click "Invoke" (no payload needed for cron)

### Manual Trigger (Event-driven)
```ts
await inngest.send({
  name: "github/data.refresh",
  data: { force: true },
});
```

**Expected Behavior:**
- ✅ Fetches GitHub contribution data
- ✅ Updates Redis cache (if `REDIS_URL` is set)
- ✅ Logs successful cache update
- ⚠️  Warning if Redis not configured (graceful fallback)

## Test Blog Analytics

### Track a Post View
```ts
await inngest.send({
  name: "blog/post.viewed",
  data: {
    slug: "test-post",
    title: "Test Post",
    viewedAt: new Date().toISOString(),
  },
});
```

**Expected Behavior:**
- ✅ Increments view count in Redis
- ✅ Tracks daily views
- ✅ Checks for milestones
- ✅ Sends milestone event if reached

### Trigger a Milestone (Testing)
```ts
// Manually send milestone event for testing
await inngest.send({
  name: "blog/milestone.reached",
  data: {
    slug: "test-post",
    title: "Test Post",
    milestone: 100,
    totalViews: 100,
    reachedAt: new Date().toISOString(),
  },
});
```

**Expected Behavior:**
- ✅ Logs celebration message
- ✅ Could send notification (if implemented)

### Test Trending Calculation
1. Open Inngest UI
2. Find "calculateTrending"
3. Manually invoke (normally runs hourly)

**Expected Behavior:**
- ✅ Fetches all post view data
- ✅ Calculates trending scores
- ✅ Stores top 10 in Redis
- ✅ Logs results

### Generate Analytics Summary
```ts
await inngest.send({
  name: "analytics/summary.generate",
  data: {
    period: "daily",
    startDate: "2025-10-25",
    endDate: "2025-10-25",
  },
});
```

**Expected Behavior:**
- ✅ Collects post data for date range
- ✅ Generates summary statistics
- ✅ Stores in Redis
- ✅ Returns summary object

## Common Test Scenarios

### Test Full Contact Form Flow
1. Submit contact form
2. Watch `contactFormSubmitted` execute in UI
3. See two steps complete:
   - send-notification-email
   - send-confirmation-email
4. Check logs for email delivery (or warnings)

### Test Scheduled Functions
1. All cron jobs show in Inngest UI with schedule
2. Manually trigger any scheduled function
3. View execution history
4. Check step-by-step logs

### Test Error Handling
1. Stop Redis (if running): `redis-cli shutdown`
2. Trigger any blog analytics function
3. Watch graceful degradation in logs
4. No crashes, clean error handling

### Test Retries
1. Temporarily break something (e.g., invalid Redis URL)
2. Trigger a function
3. Watch automatic retries in Inngest UI
4. See retry attempts with backoff

## Verification Checklist

After starting dev server, verify:

- [ ] Inngest UI accessible at http://localhost:3001/api/inngest
- [ ] All 9 functions registered:
  - [ ] helloWorld
  - [ ] contactFormSubmitted
  - [ ] refreshGitHubData
  - [ ] manualRefreshGitHubData
  - [ ] trackPostView
  - [ ] handleMilestone
  - [ ] calculateTrending
  - [ ] generateAnalyticsSummary
  - [ ] dailyAnalyticsSummary
- [ ] Scheduled functions show cron schedule
- [ ] Can manually invoke any function
- [ ] Step-by-step execution visible in UI
- [ ] Logs appear in terminal

## Monitoring in Dev

### Terminal Output
```bash
# Watch for these logs:
✓ Compiled /api/inngest in 871ms
GET /api/inngest 200 in 1253ms

# Function execution logs:
Post view tracked: my-post (42 total views)
GitHub data cached successfully: {...}
Contact form submission queued: {...}
```

### Inngest UI
- **Functions Tab**: All registered functions
- **Runs Tab**: Recent and running functions
- **Logs**: Step-by-step execution details
- **Test Button**: Manual invocation

### Redis (if configured)
```bash
# Check Redis keys
redis-cli keys "*"

# View post views
redis-cli get views:post:my-slug

# Check trending data
redis-cli get blog:trending

# View rate limits
redis-cli keys "ratelimit:*"
```

## Troubleshooting

### Functions Don't Appear in UI
```bash
# Restart dev server
npm run dev

# Check for TypeScript errors
npm run build

# Verify imports in /api/inngest/route.ts
```

### Events Not Triggering
- Check event name exactly matches function trigger
- Verify payload structure matches expected schema
- Look for errors in terminal output

### Redis Connection Errors
- Verify Redis is running: `redis-cli ping`
- Check `REDIS_URL` in `.env.local`
- Functions should work without Redis (with warnings)

### Email Not Sending
- Expected behavior without `RESEND_API_KEY`
- Functions log warnings but don't fail
- Add API key to `.env.local` to test actual emails

## Next Steps

1. ✅ Verify all functions show in UI
2. ✅ Test contact form submission
3. ✅ Manually trigger GitHub refresh
4. ✅ Send test blog view event
5. ✅ Check Redis for stored data
6. ✅ Review logs for any warnings
7. ✅ Test scheduled functions manually
8. ✅ Verify error handling (stop Redis, retry logic)

## Production Testing

When deployed to production:

1. **Inngest Dashboard**: https://app.inngest.com
   - View all production runs
   - Monitor scheduled jobs
   - Check error rates

2. **Vercel Logs**: Project → Logs
   - Function invocations
   - Event sending
   - Error tracking

3. **Redis**: Production data
   - View counts accumulate
   - Trending calculations run
   - Analytics stored

4. **Email**: Actual delivery
   - Contact form emails sent
   - Confirmation emails received
   - Milestone notifications (future)

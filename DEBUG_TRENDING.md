# Debugging Trending Posts Issue

## What I Fixed
- Updated `TrendingPosts` component to show recent posts as fallback when view counts are 0
- Added "Recent" badge for posts without view data
- Component will now always show content instead of placeholder

## What to Check if View Data Should Be Available

### 1. Check Redis Keys in Production
```bash
# Connect to production Redis
redis-cli -u $REDIS_URL

# Check if view data exists
KEYS views:post:*

# Check specific post view count
GET views:post:<post-id>

# Check trending data
GET blog:trending
```

### 2. Verify Inngest Cron is Running
- Go to Inngest dashboard: https://app.inngest.com
- Check if `calculate-trending` function has run
- Check if it ran successfully in the last hour
- Look for errors in execution logs

### 3. Check Homepage Data Flow
The homepage fetches view counts via:
```typescript
const viewCounts = await getMultiplePostViews(posts.map(p => p.id));
```

This returns a `Map<string, number>` where:
- Keys are post IDs (e.g., "building-modern-web-apps")
- Values are view counts (0 if no data in Redis)

### 4. Common Issues

**Issue**: Trending placeholder shows even though views exist
**Cause**: View data is in Redis but component filters out posts with 0 views
**Solution**: ✅ Fixed - component now shows recent posts as fallback

**Issue**: View data exists but trending section shows old posts
**Cause**: `blog:trending` cron hasn't run yet
**Solution**: Wait for hourly cron OR manually trigger via Inngest dashboard

**Issue**: No view data at all
**Cause**: Redis not configured or `/api/views` not being called
**Solution**: Check REDIS_URL env var and verify page views are being tracked

### 5. Quick Verification Commands
```bash
# Check if page views are being tracked
curl https://your-domain.com/api/views \
  -H "Content-Type: application/json" \
  -d '{"id": "test-post-id"}'

# Check Vercel logs for Redis connection
vercel logs --follow

# Check if Inngest is configured
vercel env ls | grep INNGEST
```

### 6. Expected Behavior After Fix
- **With view data**: Shows top 3 posts by view count with eye icon + count
- **Without view data**: Shows 3 most recent posts with clock icon + "Recent" badge
- **Never**: Shows empty placeholder (unless there are truly no posts)

## Next Steps
1. Deploy this fix to production
2. Check if trending section now shows recent posts
3. Verify view tracking is working (`/api/views` endpoint)
4. Confirm Inngest cron is running hourly

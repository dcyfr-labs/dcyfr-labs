# Activity Page 401 Error Fix

**Date:** December 7, 2025  
**Issue:** Production error on `/activity` page showing "Failed to fetch activities: 401"  
**Root Cause:** Page was making HTTP request to its own API endpoint during SSR, causing auth issues

---

## Problem

The `/activity` page was showing a 401 error in production because:

1. **Incorrect Architecture**: The page was making an HTTP `fetch()` call to `/api/activity` during server-side rendering
2. **SSR Self-Request Issue**: In Vercel's production environment, when a server component makes an HTTP request to its own deployment:
   - Internal auth headers may not be passed correctly
   - The `VERCEL_URL` environment variable can cause routing issues
   - Adds unnecessary network overhead
3. **GitHub Token**: Even with a valid `GITHUB_TOKEN`, the self-request pattern was failing with 401

---

## Solution: Direct Function Calls

Server components should directly import and call data transformation functions, not make HTTP requests.

**Before (❌ Incorrect):**
```typescript
// Making HTTP request to own API endpoint
const response = await fetch(`${baseUrl}/api/activity?limit=100`);
```

**After (✅ Correct):**
```typescript
// Direct function calls (same as homepage pattern)
const activities: ActivityItem[] = [];
await Promise.all([
  transformPostsWithViews(posts).then((items) => activities.push(...items)),
  transformGitHubActivity("dcyfr", ["dcyfr-labs"], 15).then((items) => activities.push(...items)),
]);
```

---

## Changes Made

### 1. Activity Page Refactor (`src/app/activity/page.tsx`)
- ✅ Removed HTTP fetch to `/api/activity`
- ✅ Added direct imports of transformation functions
- ✅ Calls functions in parallel (matches homepage pattern)
- ✅ Comprehensive error handling per source

### 2. Enhanced Error Handling (`src/lib/activity/sources.server.ts`)
- ✅ Specific 401 detection for GitHub API
- ✅ Clear error messages
- ✅ Graceful degradation

### 3. Resilient API Route (`src/app/api/activity/route.ts`)
- ✅ Error handling for all sources
- ✅ API remains available for external clients

---

## Why This Happened

### Server Component Best Practices

In Next.js App Router:
- ✅ Server components should call functions directly
- ❌ Don't make HTTP requests to own endpoints

The homepage was already following the correct pattern.

---

## Deployment

### No Environment Changes Needed!

The fix is architectural - no token passing issues.

```bash
# Deploy
git push origin preview  # or main

# Verify
open https://your-site.com/activity
```

**Expected:**
- ✅ Page loads without error
- ✅ All activities displayed
- ✅ No 401 error

---

## Benefits

1. **Eliminates 401 errors** - No HTTP auth issues
2. **Better performance** - No network overhead
3. **Simpler architecture** - Follows Next.js best practices
4. **More reliable** - Better error handling

---

## Key Takeaways

1. **Never let external API failures cascade** - Always catch and handle errors gracefully
2. **Check HTTP status codes explicitly** - 401 needs different handling than 500
3. **Log actionable error messages** - Help debug production issues
4. **Document optional dependencies** - Make degradation behavior clear
5. **Test failure scenarios** - Missing/invalid tokens, network errors, etc.

---

## Additional Resources

- [GitHub Token Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Error Handling Best Practices](../development/error-handling)

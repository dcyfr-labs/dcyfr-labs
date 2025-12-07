# Activity Page 401 Error Fix

**Date:** December 7, 2025  
**Issue:** Production error on `/activity` page showing "Failed to fetch activities: 401"  
**Root Cause:** GitHub API authentication failure cascading to entire activity feed

---

## Problem

The `/activity` page was showing a 401 error in production because:

1. **GitHub Token Issue**: The `GITHUB_TOKEN` environment variable was either:
   - Missing
   - Invalid
   - Expired

2. **Cascading Failure**: When GitHub API returned 401, the error wasn't caught properly, causing:
   - The entire `/api/activity` endpoint to fail
   - No activities displayed (even non-GitHub sources)
   - Poor user experience

3. **Missing Error Handling**: The `transformGitHubActivity` function didn't:
   - Check for 401 status codes specifically
   - Handle authentication failures gracefully
   - Allow other sources to continue working

---

## Solution

### 1. Enhanced GitHub Activity Error Handling

**File:** `src/lib/activity/sources.server.ts`

Added specific 401 error handling in `transformGitHubActivity`:

```typescript
if (commitsResponse.ok) {
  const commits: GitHubCommit[] = await commitsResponse.json();
  // ... process commits
} else if (commitsResponse.status === 401) {
  console.error("[Activity] GitHub API authentication failed (401) - check GITHUB_TOKEN validity");
  return []; // Stop processing if auth fails
} else {
  console.warn(`[Activity] Failed to fetch commits for ${repo}: ${commitsResponse.status}`);
}
```

**Benefits:**
- ✅ Detects invalid/expired tokens immediately
- ✅ Logs clear error messages
- ✅ Returns empty array instead of throwing
- ✅ Prevents cascade failures

### 2. Resilient API Route

**File:** `src/app/api/activity/route.ts`

Added `.catch()` handlers to all activity source fetches:

```typescript
// GitHub activity
if (!sources.length || sources.includes("github")) {
  fetchPromises.push(
    transformGitHubActivity("dcyfr", ["dcyfr-labs"], 15)
      .then((items) => {
        activities.push(...items);
      })
      .catch((error) => {
        console.error("[Activity API] GitHub activity fetch failed:", error);
        // Continue without GitHub activities
      })
  );
}
```

**Applied to all sources:**
- Blog posts
- Trending posts
- Milestones
- High engagement posts
- Comment milestones
- GitHub activity

**Benefits:**
- ✅ One source failure doesn't break entire feed
- ✅ Graceful degradation
- ✅ Activity page always loads (with available sources)

### 3. Improved Documentation

**File:** `.env.example`

Updated `GITHUB_TOKEN` documentation to:
- Mention Activity page dependency
- Explain impact of missing/invalid token
- Clarify graceful degradation behavior

---

## Testing

### Manual Testing

1. **No Token Scenario:**
   ```bash
   # Comment out GITHUB_TOKEN
   npm run build && npm start
   ```
   - Visit `/activity`
   - Should show activities from other sources
   - No error banner

2. **Invalid Token Scenario:**
   ```bash
   GITHUB_TOKEN=invalid_token npm run build && npm start
   ```
   - Visit `/activity`
   - Should show activities from other sources
   - Console logs: "GitHub API authentication failed (401)"

3. **Valid Token Scenario:**
   ```bash
   GITHUB_TOKEN=ghp_your_valid_token npm run build && npm start
   ```
   - Visit `/activity`
   - Should show all activities including GitHub commits/releases

### Check Server Logs

Look for these log messages:
- `[Activity] GITHUB_TOKEN not configured, GitHub activity unavailable` - Token missing
- `[Activity] GitHub API authentication failed (401) - check GITHUB_TOKEN validity` - Token invalid
- `[Activity API] GitHub activity fetch failed: ...` - Network/other errors

---

## Production Fix Steps

### Immediate Fix (Vercel)

1. **Verify Token:**
   - Go to: https://vercel.com/your-project/settings/environment-variables
   - Check if `GITHUB_TOKEN` exists
   - Check if it's assigned to production environment

2. **Regenerate Token (if needed):**
   - Visit: https://github.com/settings/tokens
   - Generate new token with `public_repo` scope
   - Copy token

3. **Update Environment Variable:**
   ```bash
   vercel env add GITHUB_TOKEN production
   # Paste the new token when prompted
   ```

4. **Redeploy:**
   ```bash
   vercel --prod
   ```

### Verification

Visit https://your-site.com/activity and confirm:
- ✅ Page loads without error
- ✅ Activities displayed
- ✅ GitHub activities present (if token valid)
- ✅ No 401 error banner

---

## Prevention

### Monitoring

1. **Add to health check:**
   ```typescript
   // Check GitHub token validity periodically
   const response = await fetch('https://api.github.com/user', {
     headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
   });
   if (response.status === 401) {
     // Alert: GitHub token invalid
   }
   ```

2. **Sentry monitoring:**
   - Already captures errors from activity sources
   - Look for `[Activity API]` prefixed errors

### Best Practices

1. **Token Rotation:**
   - Set expiration on GitHub tokens (recommended: 90 days)
   - Add calendar reminder to rotate before expiration
   - Keep backup token ready

2. **Development:**
   - Always test `/activity` page locally
   - Test both with and without GITHUB_TOKEN
   - Verify graceful degradation

3. **Documentation:**
   - Keep `.env.example` up to date
   - Document all optional vs required tokens
   - Explain degradation behavior

---

## Related Files

- `src/lib/activity/sources.server.ts` - GitHub activity transformer
- `src/app/api/activity/route.ts` - Activity API endpoint
- `src/app/activity/page.tsx` - Activity page component
- `.env.example` - Environment variable documentation
- `docs/api/github-api-header-hygiene.md` - GitHub API best practices

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
- [Error Handling Best Practices](../development/error-handling.md)

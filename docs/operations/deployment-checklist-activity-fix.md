# Production Deployment Checklist - Activity Page Fix

**Date:** December 7, 2025  
**Issue:** 401 error on `/activity` page  
**Status:** ✅ Fixed and ready for deployment

---

## Pre-Deployment Checklist

### ✅ Code Changes
- [x] Enhanced GitHub activity error handling (401 detection)
- [x] Added error handling to all activity sources
- [x] Updated environment documentation
- [x] Created fix documentation

### ✅ Testing
- [x] TypeScript compilation passes
- [x] ESLint passes (only design token warnings)
- [x] Production build succeeds
- [x] All activity sources handle failures gracefully

### ✅ Documentation
- [x] Updated `.env.example` with Activity page dependency
- [x] Created comprehensive fix documentation
- [x] Added deployment checklist

---

## Deployment Steps

### 1. Verify Current Environment Variables

**Check Vercel dashboard:**
```bash
# List all environment variables
vercel env ls
```

Look for `GITHUB_TOKEN`:
- ✅ Present → Verify it's valid (step 2)
- ❌ Missing → Add it (step 3)

### 2. Test Token Validity (if present)

```bash
# Test the token locally
curl -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  https://api.github.com/user
```

**Expected responses:**
- 200 OK → Token is valid ✅
- 401 Unauthorized → Token is invalid/expired ❌

### 3. Add/Update GitHub Token (if needed)

**Generate new token:**
1. Visit: https://github.com/settings/tokens/new
2. Set name: `dcyfr-labs-activity-feed`
3. Select scopes: `public_repo` (or `read:user`)
4. Generate token
5. Copy token (you won't see it again!)

**Add to Vercel:**
```bash
# Option 1: Using Vercel CLI
vercel env add GITHUB_TOKEN production

# Option 2: Using Vercel Dashboard
# Go to: Settings → Environment Variables → Add New
# Name: GITHUB_TOKEN
# Value: ghp_your_token_here
# Environments: Production, Preview, Development
```

### 4. Deploy Changes

```bash
# Push to main branch (triggers automatic deployment)
git push origin main

# OR manual deployment
vercel --prod
```

### 5. Post-Deployment Verification

**Test the Activity page:**
```bash
# Visit production URL
open https://your-site.com/activity
```

**Check for:**
- ✅ Page loads without error
- ✅ Activities are displayed
- ✅ No error banner
- ✅ GitHub activities present (if token is valid)

**Check server logs:**
```bash
# In Vercel dashboard: Deployments → [Latest] → Runtime Logs
# Look for:
# - No "[Activity API] GitHub activity fetch failed: 401" errors
# - Successful activity fetch logs
```

### 6. Monitor for Issues

**First 24 hours:**
- Check Sentry for new errors
- Monitor Vercel logs for activity API calls
- Verify `/activity` page loads correctly

---

## Rollback Plan (if needed)

### If errors persist:

1. **Check token again:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" https://api.github.com/user
   ```

2. **Regenerate token if needed:**
   - Delete old token from GitHub
   - Generate new token with `public_repo` scope
   - Update in Vercel environment variables

3. **Redeploy:**
   ```bash
   vercel --prod
   ```

### If still having issues:

1. **Disable GitHub activity temporarily:**
   ```bash
   # Remove GITHUB_TOKEN from Vercel
   vercel env rm GITHUB_TOKEN production
   
   # Redeploy
   vercel --prod
   ```
   
   Result: Activity page will work, but without GitHub commits/releases

2. **Report issue:**
   - Create GitHub issue with error logs
   - Include Sentry error details
   - Include Vercel runtime logs

---

## Expected Behavior After Fix

### With Valid GITHUB_TOKEN:
- ✅ Activity page loads successfully
- ✅ Shows activities from all sources:
  - Blog posts
  - Projects
  - Trending content
  - Milestones
  - GitHub commits
  - GitHub releases
- ✅ No error messages

### Without GITHUB_TOKEN (or invalid):
- ✅ Activity page loads successfully
- ✅ Shows activities from non-GitHub sources:
  - Blog posts
  - Projects
  - Trending content
  - Milestones
- ✅ No GitHub activities (gracefully excluded)
- ✅ No error banner (silent degradation)
- ⚠️ Console logs: "[Activity] GITHUB_TOKEN not configured" or "authentication failed (401)"

---

## Success Criteria

### Primary:
- [ ] `/activity` page loads without 401 error
- [ ] At least some activities are displayed
- [ ] No error banner visible to users

### Secondary:
- [ ] GitHub activities included (if token valid)
- [ ] All activity sources working
- [ ] No errors in Sentry
- [ ] Clean server logs

---

## Monitoring Commands

```bash
# Check Vercel logs
vercel logs --follow

# Check environment variables
vercel env ls

# Pull environment to local (for testing)
vercel env pull .env.local

# Test locally with production environment
npm run build && npm start
```

---

## Related Documentation

- [Fix Details](./activity-page-401-fix.md)
- [GitHub API Best Practices](../api/github-api-header-hygiene.md)
- [Environment Configuration](../../.env.example)
- [Activity API Documentation](../api/routes/overview.md)

---

## Questions?

Contact: System Administrator  
Docs: `/docs/debugging/activity-page-401-fix.md`  

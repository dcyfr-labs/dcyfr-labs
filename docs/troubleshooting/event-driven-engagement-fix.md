# Event-Driven Architecture Blog Post Engagement Fix

**Date:** January 19, 2026  
**Issue:** "Building Event-Driven Architecture with Inngest" blog post lost total like and bookmark counts due to duplicate Redis keys  
**Status:** ✅ RESOLVED

---

## Root Cause Analysis

The blog post "Building Event-Driven Architecture with Inngest" had engagement data split across multiple Redis key patterns due to inconsistent slug usage:

### Duplicate Keys Found

- `likes:activity:building-event-driven-architecture` = 1
- `likes:post:event-driven-architecture` = 1
- `bookmarks:activity:building-event-driven-architecture` = 1
- `bookmarks:post:event-driven-architecture` = 0

### Cause

1. **Directory structure**: `src/content/blog/building-event-driven-architecture/`
2. **Correct slug**: `building-event-driven-architecture` (from directory name)
3. **Incorrect shortened slug**: `event-driven-architecture` (used in some analytics)
4. **Key patterns**: Both `activity:` and `post:` prefixes were used

This created 4 separate Redis keys when there should have been only 2 consolidated keys.

---

## Solution Applied

**Script:** [`scripts/consolidate-event-driven-engagement.mjs`](scripts/consolidate-event-driven-engagement.mjs)  
**NPM Commands:**

- `npm run engagement:consolidate:dry-run` - Safe preview mode
- `npm run engagement:consolidate` - Apply changes

### Consolidation Results

- **Total Likes**: 2 (1 + 1 from duplicate keys)
- **Total Bookmarks**: 1 (1 + 0 from duplicate keys)
- **Keys Deleted**: 4 duplicate keys removed
- **Keys Created**: 2 consolidated keys
  - `likes:post:building-event-driven-architecture` = 2
  - `bookmarks:post:building-event-driven-architecture` = 1

---

## Verification

1. **Before Fix**:
   - Post appeared to have minimal engagement due to split data
   - Some interfaces showed 1 like, others showed different counts
   - Analytics were inaccurate

2. **After Fix**:
   - All engagement data unified under correct slug
   - Total engagement restored to true counts
   - Duplicate keys removed from Redis

3. **Verification Commands**:

   ```bash
   # Check current engagement keys
   npm run redis:keys
   node scripts/check-engagement-keys.mjs

   # Verify no duplicates remain
   npm run engagement:consolidate:dry-run
   ```

---

## Prevention Measures

### 1. Slug Consistency Rules

- ✅ Always use directory name as source of truth for slug
- ✅ Avoid manual slug overrides unless necessary
- ✅ Document any slug changes in frontmatter `previousSlugs` array

### 2. Redis Key Patterns

- ✅ Standardize on `post:` prefix for blog posts
- ✅ Use `activity:` only for non-post content (GitHub commits, etc.)
- ✅ Ensure engagement analytics use consistent slug resolution

### 3. Monitoring

- ✅ Add engagement key validation to health checks
- ✅ Monitor for duplicate patterns in Redis keys
- ✅ Include engagement totals in analytics dashboard

### 4. Future Blog Posts

- ✅ Use automated slug generation from directory name
- ✅ Validate engagement key creation on publish
- ✅ Test analytics tracking after post publication

---

## Script Usage

The consolidation script is designed to be reusable for similar issues:

```bash
# Safe mode - preview changes without applying
npm run engagement:consolidate:dry-run

# Apply changes (requires confirmation)
npm run engagement:consolidate

# In CI/automated environments
CI=true npm run engagement:consolidate
```

**Script Features:**

- ✅ Dry-run mode for safe testing
- ✅ Detailed before/after analysis
- ✅ Confirmation prompts (skipped in CI)
- ✅ Comprehensive logging
- ✅ Graceful error handling
- ✅ Rollback-safe (no data loss)

---

## Related Files

- **Blog Post**: [`src/content/blog/building-event-driven-architecture/index.mdx`](src/content/blog/building-event-driven-architecture/index.mdx)
- **Consolidation Script**: [`scripts/consolidate-event-driven-engagement.mjs`](scripts/consolidate-event-driven-engagement.mjs)
- **Engagement Analytics**: [`src/lib/engagement-analytics.ts`](src/lib/engagement-analytics.ts)
- **Package Scripts**: [`package.json`](package.json) (lines 83-84)

---

## Lessons Learned

1. **Consistent slug resolution** is critical for analytics integrity
2. **Redis key patterns** should be standardized and documented
3. **Engagement tracking** needs validation after content publication
4. **Duplicate detection** should be part of regular health checks
5. **Safe consolidation tools** prevent data loss during cleanup

---

**Fix Applied By:** GitHub Copilot  
**Reviewed By:** DCYFR Team  
**Next Review:** Monitor engagement data accuracy for 30 days

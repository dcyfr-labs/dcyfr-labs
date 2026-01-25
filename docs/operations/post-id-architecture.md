{/* TLP:CLEAR */}

# Post ID Architecture: Stable Identifiers for Blog Posts

**Date:** October 27, 2025  
**Status:** Design Document (Implementation Ready)  
**Problem:** Blog post renames require data migration; Redis keys should be immutable  
**Solution:** Stable, permanent post IDs independent of slugs

---

## Problem Statement

The current system uses slugs for both URLs and Redis keys:
```
URL: /blog/shipping-developer-portfolio
Redis key: views:post:shipping-developer-portfolio
```

When a post is renamed:
- ❌ URL changes (expected)
- ❌ Redis key changes (BAD - loses historical data)
- ❌ Requires manual migration script to recover views
- ❌ Couples data layer to URL structure

This is fragile and doesn't scale well.

---

## Solution: Stable Post IDs

Add a permanent `id` field to each post's frontmatter. This ID:
- ✅ Is assigned once when the post is created
- ✅ NEVER changes, even if slug/filename changes
- ✅ Is used for all data persistence (Redis, analytics, tracking)
- ✅ Is independent of the URL structure
- ✅ Enables guilt-free post renaming

### Key Principles

1. **Immutability**: Post IDs never change
2. **Slug Independence**: IDs are not derived from slugs
3. **Deterministic**: IDs can be auto-generated from `publishedAt` (so existing posts need no manual work)
4. **Portability**: Posts can be migrated between systems/blogs with full analytics history

---

## Implementation Strategy

### Phase 1: Add ID to Post Type (Non-Breaking)

**File:** `src/data/posts.ts`

```typescript
export type Post = {
  id: string; // NEW: Stable identifier (e.g., "post-2025-09-10-001" or UUID)
  slug: string; // URL segment (can change)
  title: string;
  // ... rest of fields
};
```

### Phase 2: Generate IDs for Existing Posts

For existing posts without explicit IDs, generate deterministically:

```typescript
// Format: `post-{YYYY-MM-DD}-{sequence}`
// Example: "post-2025-09-10-001"

const id = generatePostId(publishedAt);

// Implementation: Hash-based, reproducible
function generatePostId(publishedAt: string): string {
  const date = publishedAt.replace(/-/g, "");
  return `post-${publishedAt.substring(0, 10)}-001`;
}
```

Or use UUIDs for simplicity (one-time generation per post).

### Phase 3: Migrate Redis Keys

Migrate existing Redis data from slug-based keys to ID-based keys:

```bash
# Before
views:post:shipping-developer-portfolio → 158 views

# After
views:post:post-2025-09-10-001 → 158 views
```

### Phase 4: Update Code to Use IDs

**Files to Update:**
- `src/lib/views.ts` - Use `post.id` instead of `post.slug` for Redis keys
- `src/app/blog/[slug]/page.tsx` - Track views using post ID
- `src/app/api/analytics/route.ts` - Query by ID instead of slug
- Any analytics/tracking code

---

## Detailed Implementation

### Step 1: Update Post Type

```typescript
export type Post = {
  id: string; // NEW: Stable permanent identifier
  slug: string; // Current URL segment (can change)
  title: string;
  summary: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  featured?: boolean;
  archived?: boolean;
  draft?: boolean;
  body: string;
  sources?: PostSource[];
  previousSlugs?: string[];
  readingTime: {
    words: number;
    minutes: number;
    text: string;
  };
};
```

### Step 2: Generate IDs in blog.ts

```typescript
import crypto from "crypto";

function generatePostId(publishedAt: string, slug: string): string {
  // Deterministic hash-based ID
  // Format: "post-{base64-hash}"
  const input = `${publishedAt}:${slug}`;
  const hash = crypto
    .createHash("sha256")
    .update(input)
    .digest("base64")
    .substring(0, 12)
    .replace(/[+/=]/g, ""); // Make URL-safe
  return `post-${hash}`;
}

export function getAllPosts(): Post[] {
  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    // ... read file, parse frontmatter
    const publishedAt = data.publishedAt as string;
    
    // Generate ID from frontmatter (if provided) or auto-generate
    const id = data.id || generatePostId(publishedAt, slug);
    
    return {
      id, // NEW
      slug,
      // ... rest of fields
    } satisfies Post;
  });
}
```

### Step 3: Update Views to Use IDs

**File:** `src/lib/views.ts`

```typescript
const VIEW_KEY_PREFIX = "views:post:";

// Now called with post.id instead of post.slug
export async function incrementPostViews(postId: string): Promise<number | null> {
  const client = await getClient();
  if (!client) return null;
  try {
    return await client.incr(formatKey(postId));
  } catch {
    return null;
  }
}

export async function getPostViews(postId: string): Promise<number | null> {
  // ... same pattern
}

export async function getMultiplePostViews(
  postIds: string[]
): Promise<Map<string, number>> {
  // ... same pattern
}
```

### Step 4: Update Post Page

**File:** `src/app/blog/[slug]/page.tsx`

```typescript
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = getPostByAnySlug(slug, posts);
  
  if (!result) {
    notFound();
  }
  
  const { post, needsRedirect, canonicalSlug } = result;
  
  // Get nonce from middleware for CSP
  const nonce = (await headers()).get("x-nonce") || "";

  // CHANGED: Use post.id instead of post.slug
  const incrementedViews = await incrementPostViews(post.id);
  
  // If this is an old slug, redirect to the current one
  if (needsRedirect) {
    redirect(`/blog/${canonicalSlug}`);
  }
  
  const viewCount = incrementedViews ?? (await getPostViews(post.id));
  // ... rest of component
}
```

### Step 5: Update Analytics API

**File:** `src/app/api/analytics/route.ts`

```typescript
// Get view counts for all posts - NOW BY ID
const viewMap = await getMultiplePostViews(posts.map(p => p.id));

const postsWithViews = posts
  .filter((post) => !post.archived && !post.draft)
  .map((post) => ({
    slug: post.slug,
    title: post.title,
    views: viewMap.get(post.id) || 0, // CHANGED: use post.id
    // ... other fields
  }))
  .sort((a, b) => b.views - a.views);
```

---

## Benefits

✅ **No More Migrations**: Rename posts freely without data loss  
✅ **Portable Data**: Export posts with full analytics history  
✅ **Clean URLs**: Slugs can change without touching data layer  
✅ **Audit Trail**: Always know post's permanent identity  
✅ **Future-Proof**: Can integrate with external systems using post IDs  
✅ **Scalable**: IDs work across multiple blog instances/domains  

---

## Migration Path

### Immediate (Non-Breaking)
1. Add optional `id` field to Post type
2. Auto-generate IDs from publishedAt + slug hash (non-breaking)
3. No frontmatter changes required

### Short Term (Next Deployment)
1. Update `src/lib/views.ts` to accept both slug and ID (backwards compatible)
2. Start using ID in new code, keep slug as fallback
3. Run migration script to consolidate Redis keys

### Long Term
1. Make `id` required in Post type
2. Update all frontmatter to include explicit IDs
3. Remove slug-based view tracking code

---

## Implementation Timeline

- **Week 1**: Design review + implement ID generation
- **Week 2**: Update Post type and view tracking code
- **Week 3**: Migration script for existing Redis data
- **Week 4**: Update frontmatter with explicit IDs (optional, for documentation)
- **Week 5**: Testing and verification

---

## FAQ

**Q: Do I need to manually add IDs to existing posts?**  
A: No! They're auto-generated deterministically from `publishedAt + slug`. Existing posts work immediately.

**Q: Can I customize post IDs?**  
A: Yes! Add `id` to frontmatter to use a custom value. Otherwise auto-generated.

**Q: What if I rename a post?**  
A: Just change the slug/filename. The ID stays the same and Redis views are preserved. No migration needed.

**Q: What format should IDs use?**  
A: Suggested: `post-YYYYMMDD-XXX` or short UUIDs. Avoid spaces and special characters.

**Q: Do IDs appear in the UI or URLs?**  
A: No! URLs still use slugs. IDs are internal (Redis, analytics). Users never see them.

**Q: What about old analytics data?**  
A: The migration script consolidates all old slug-based keys into the new ID-based keys. No data loss.

---

## Example: Before and After

### Before (Current - Fragile)
```yaml
# hardening-developer-portfolio.mdx
---
title: "Hardening a Developer Portfolio..."
publishedAt: "2025-10-05"
previousSlugs:
  - "hardening-tiny-portfolio"
---

# When slug changes from "hardening-tiny-portfolio" to "hardening-developer-portfolio":
# Redis key changes too: views:post:hardening-tiny-portfolio → views:post:hardening-developer-portfolio
# Result: OLD DATA LOST, requires manual migration

# Rename again? Another migration needed!
```

### After (Proposed - Robust)
```yaml
# hardening-developer-portfolio.mdx
---
title: "Hardening a Developer Portfolio..."
publishedAt: "2025-10-05"
id: "post-2025-10-05-001"  # NEW: Permanent ID
previousSlugs:
  - "hardening-tiny-portfolio"
  - "hardening-portfolio"    # Could rename multiple times
---

# When slug changes from "hardening-tiny-portfolio" to "hardening-developer-portfolio":
# Redis key STAYS THE SAME: views:post:post-2025-10-05-001
# Result: NO DATA LOSS, no migration needed

# Can rename as many times as needed without concern!
```

---

## Rollout Checklist

- [ ] Design review and approval
- [ ] Update Post type definition
- [ ] Implement ID generation function
- [ ] Update views.ts to use IDs
- [ ] Update blog post page component
- [ ] Update analytics API
- [ ] Create migration script (Redis key consolidation)
- [ ] Add documentation to frontmatter schema
- [ ] Test with existing posts
- [ ] Run full build and verify no errors
- [ ] Test analytics dashboard
- [ ] Deploy to production
- [ ] Monitor for issues
- [ ] Update blog post frontmatter (optional, for clarity)
- [ ] Clean up migration scripts

---

## Related Files

- `src/data/posts.ts` - Post type definition
- `src/lib/blog.ts` - Post parsing and ID generation
- `src/lib/views.ts` - View tracking (Redis operations)
- `src/app/blog/[slug]/page.tsx` - View increment call site
- `src/app/api/analytics/route.ts` - Analytics aggregation
- `docs/blog/frontmatter-schema.md` - Update with ID field

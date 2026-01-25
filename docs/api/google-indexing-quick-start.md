{/* TLP:CLEAR */}

# Google Indexing API - Quick Start

**Status:** ✅ Refactored & Ready  
**Last Updated:** December 9, 2025

---

## What Changed?

Your Google Indexing API integration now includes:

- ✅ **Sitemap validation** - Checks which URLs are actually indexed in Google
- ✅ **Smart rate limiting** - Respects 200 submissions/day quota automatically
- ✅ **Missing page detection** - Identifies exactly which URLs need submission
- ✅ **Batch submission** - Submit missing pages efficiently
- ✅ **Verification** - Confirms successful indexing after submission

---

## Quickest Start (2 minutes)

### Trigger Everything from Inngest

```typescript
// In your route, cron job, or event handler:
import { inngest } from "@/inngest/client";

await inngest.send({
  name: "google/missing-pages.submit",
  data: {
    sitemapUrls: [
      "https://dcyfr.ai/",
      "https://dcyfr.ai/about",
      "https://dcyfr.ai/blog/post-1",
      // ... all your URLs
    ],
    maxSubmissions: 50, // Optional
  },
});
```

That's it! Inngest will:
1. Validate which URLs are already indexed
2. Find missing ones
3. Submit up to 50 missing URLs
4. Verify they got indexed
5. Send you a complete report

---

## For Scripts (Build/Deploy Time)

### Run During Build

```bash
# Create: scripts/validate-sitemap.mjs
#!/usr/bin/env node
import { validateAndSubmitMissingPages } from "@/lib/google-indexing-utils.js";
import { SITE_URL } from "@/lib/site-config.js";

const sitemapUrls = [
  `${SITE_URL}/`,
  `${SITE_URL}/about`,
  // ... all URLs
];

const result = await validateAndSubmitMissingPages(sitemapUrls, 100);

if (result.success) {
  console.log(`✅ Validated ${result.summary.total} URLs`);
  console.log(`📖 Already indexed: ${result.summary.indexed}`);
  console.log(`❌ Missing: ${result.summary.missing}`);
  console.log(`✓ Submitted: ${result.summary.submitted}`);
} else {
  console.error(`❌ Error: ${result.error}`);
  process.exit(1);
}
```

Then add to `package.json`:
```json
{
  "scripts": {
    "postbuild": "node scripts/validate-sitemap.mjs"
  }
}
```

---

## For API Routes (On-Demand)

```typescript
// POST /api/google-indexing
import { validateAndSubmitMissingPages } from "@/lib/google-indexing-utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { sitemapUrls, maxSubmissions } = await request.json();

  const result = await validateAndSubmitMissingPages(
    sitemapUrls,
    maxSubmissions
  );

  return NextResponse.json(result);
}
```

Call it:
```bash
curl -X POST http://localhost:3000/api/google-indexing \
  -H "Content-Type: application/json" \
  -d '{
    "sitemapUrls": ["https://example.com/", "https://example.com/blog/post"],
    "maxSubmissions": 50
  }'
```

---

## API at a Glance

### Inngest Events

```typescript
// Complete workflow (validate + submit + verify)
await inngest.send({
  name: "google/missing-pages.submit",
  data: {
    sitemapUrls: string[],      // All URLs from sitemap
    maxSubmissions?: number,    // Max to submit (default: all missing)
  },
});

// Just validate, don't submit
await inngest.send({
  name: "google/sitemap.validate",
  data: {
    sitemapUrls: string[],
  },
});
```

### Utility Functions

```typescript
// Quick validate + submit
import { validateAndSubmitMissingPages } from "@/lib/google-indexing-utils";
const result = await validateAndSubmitMissingPages(urls, maxSubmissions);

// Validate only
import { validateSitemapUrls, getAuthClient } from "@/lib/google-indexing-utils";
const auth = await getAuthClient();
const { indexed, missing, pending } = await validateSitemapUrls(urls, auth);

// Submit only
import { submitMissingPagesToGoogle, getAuthClient } from "@/lib/google-indexing-utils";
const auth = await getAuthClient();
const { submitted, failed, skipped } = await submitMissingPagesToGoogle(urls, auth, maxSubmissions);

// Single URL
import { submitUrlToGoogle, getAuthClient } from "@/lib/google-indexing-utils";
const auth = await getAuthClient();
const result = await submitUrlToGoogle("https://example.com/page", auth);
```

---

## Understanding the Response

```typescript
{
  success: true,
  submitted: ["https://example.com/page1", ...],     // URLs we submitted
  failed: [                                           // Submissions that failed
    { url: "https://example.com/error", error: "403" }
  ],
  skipped: ["https://example.com/page99", ...],      // Didn't submit (quota)
  verified: [                                         // Post-submission status
    { url: "https://example.com/page1", indexed: true, status: "MOBILE_FRIENDLY" }
  ],
  summary: {
    total: 100,                    // Total URLs checked
    indexed: 85,                   // Already indexed
    missing: 15,                   // Weren't indexed
    submitted: 10,                 // We submitted 10
    successfullyIndexed: 9,        // 9 got indexed
    failed: 1,                     // 1 failed
    skipped: 5,                    // 5 skipped (quota)
    quotaRemaining: 190,           // API quota left today
  }
}
```

---

## Common Questions

### Q: How many URLs can I submit per day?

**A:** 200 URLs maximum. The system tracks this automatically.

### Q: What if I need to submit more than 200?

**A:** Run again tomorrow. The quota resets every 24 hours. The system will tell you how many are left via `quotaRemaining`.

### Q: Do I need to set up anything new?

**A:** Only if you're using the utilities directly. The Inngest functions are already wired up.

### Q: What's the difference between the Inngest events?

| Event | What It Does |
|-------|------------|
| `google/url.submit` | Submit 1 URL (legacy, still works) |
| `google/sitemap.validate` | Check which URLs are indexed |
| `google/missing-pages.submit` | Do everything: validate + submit + verify |

**Use:** `google/missing-pages.submit` for new code.

### Q: My URLs aren't getting indexed. Why?

Check these things:
1. Service account is added as owner in Google Search Console
2. URL has no redirect loops
3. `robots.txt` doesn't block it
4. It's not marked as duplicate/canonical
5. Page is mobile-friendly

View details in Google Search Console → Coverage report.

---

## Rate Limit Behavior

The system automatically:

1. **Checks quota** before submitting
2. **Returns immediately** if quota exceeded
3. **Resets automatically** every 24 hours
4. **Respects timing** between requests (200ms minimum)

You'll see in responses:
```typescript
{
  success: false,
  reason: "rate-limit-exceeded",
  quotaRemaining: 0  // 0 left today, try tomorrow
}
```

---

## Files Changed

**New Files:**
- `src/lib/google-indexing-utils.ts` - Standalone utilities
- `docs/GOOGLE_INDEXING_REFACTOR.md` - Complete reference

**Updated Files:**
- `src/inngest/google-indexing-functions.ts` - New Inngest functions
- `src/app/api/inngest/route.ts` - Registered new functions

**Still Works:**
- `scripts/test-google-indexing.mjs`
- `scripts/backfill-google-indexing.mjs`

---

## Examples in Your Codebase

Once you've implemented:

```typescript
// In a cron job (using a library like next-cron)
export async function handleGoogleIndexing() {
  await inngest.send({
    name: "google/missing-pages.submit",
    data: { sitemapUrls: await getSitemapUrls() }
  });
}

// On new blog post publish
export async function onBlogPostPublished(slug: string) {
  const url = `${SITE_URL}/blog/${slug}`;
  await inngest.send({
    name: "google/url.submit",
    data: { url }
  });
}

// On post delete
export async function onBlogPostDeleted(slug: string) {
  const url = `${SITE_URL}/blog/${slug}`;
  await inngest.send({
    name: "google/url.delete",
    data: { url }
  });
}
```

---

## Next Steps

1. ✅ Integration is ready to use
2. ✅ Try the `google/missing-pages.submit` Inngest event
3. ✅ Monitor quota with `quotaRemaining` in responses
4. ✅ Check the docs at `docs/GOOGLE_INDEXING_REFACTOR.md` for details

---

**Questions?** See `docs/GOOGLE_INDEXING_REFACTOR.md` for complete documentation.

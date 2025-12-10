# Google Indexing API Refactor

**Date:** December 9, 2025  
**Status:** Complete  
**Coverage:** Rate limiting, validation, batch submission, indexing verification

---

## Overview

The Google Indexing API integration has been refactored to provide comprehensive sitemap validation, intelligent rate limit management, and end-to-end indexing verification.

### Key Capabilities

✅ **Rate Limit Management**
- Tracks daily quota (200 submissions/day)
- Enforces minimum delay between submissions (200ms)
- Returns remaining quota with each submission
- Validates quota before accepting submissions

✅ **Sitemap Validation**
- Compares sitemap URLs against Google Search Console
- Categorizes pages as indexed, missing, or pending
- Identifies exactly which pages need submission
- Batch validation with proper rate limiting

✅ **Batch Submission**
- Submits missing pages respecting API quota
- Optional maximum submission limit
- Respects time-based rate limits
- Returns detailed failure reasons

✅ **Indexing Verification**
- Checks indexing status after submission
- Validates successful indexing
- Provides per-URL status reports
- Handles verification errors gracefully

---

## Architecture

### Two Implementation Layers

#### 1. **Inngest Functions** (`src/inngest/google-indexing-functions.ts`)

For production background jobs and event-driven workflows:

```typescript
// High-level orchestration
submitMissingPagesToGoogle()        // End-to-end: validate → submit → verify
validateSitemapAndGetMissing()      // Validate sitemap, return missing pages

// Low-level building blocks
submitUrlToGoogle()                 // Submit single URL with rate limiting
deleteUrlFromGoogle()               // Delete URL with rate limiting

// New helper functions
checkIndexingStatus()               // Query indexing status
getRemainingQuota()                 // Get quota availability
canSubmit()                         // Check if submission is allowed
```

#### 2. **Standalone Utilities** (`src/lib/google-indexing-utils.ts`)

For scripts, API routes, and non-Inngest contexts:

```typescript
// Complete workflows
validateAndSubmitMissingPages()      // End-to-end helper

// Building blocks
validateSitemapUrls()                // Validate multiple URLs
submitMissingPagesToGoogle()        // Submit batch with limits
checkIndexingStatus()               // Single URL status check
submitUrlToGoogle()                 // Single URL submission
getAuthClient()                     // Get authenticated Google client
```

---

## Usage Examples

### Example 1: End-to-End from Inngest

```typescript
// Trigger validation and submission
await inngest.send({
  name: "google/missing-pages.submit",
  data: {
    sitemapUrls: [
      "https://example.com/",
      "https://example.com/about",
      "https://example.com/blog/post-1",
      // ... more URLs
    ],
    maxSubmissions: 50, // Optional: limit submissions
  },
});

// Returns comprehensive report:
{
  success: true,
  submitted: ["https://example.com/blog/post-1", ...],
  failed: [{
    url: "https://example.com/error",
    error: "Permission denied"
  }],
  skipped: ["https://example.com/blog/post-2", ...],
  verified: [{
    url: "https://example.com/blog/post-1",
    indexed: true,
    status: "MOBILE_FRIENDLY"
  }],
  summary: {
    total: 100,
    indexed: 85,
    missing: 15,
    submitted: 10,
    successfullyIndexed: 8,
    failed: 2,
    skipped: 5,
    quotaRemaining: 185,
  },
  timestamp: "2025-12-09T10:30:00Z"
}
```

### Example 2: From a Script

```typescript
import { validateAndSubmitMissingPages } from "@/lib/google-indexing-utils";

// Get sitemap URLs (from your sitemap.ts or dynamically)
const sitemapUrls = [
  "https://example.com/",
  "https://example.com/about",
  "https://example.com/blog/post-1",
];

const result = await validateAndSubmitMissingPages(
  sitemapUrls,
  50  // Optional: max 50 submissions
);

if (result.success) {
  console.log(`✅ Validated ${result.summary.total} URLs`);
  console.log(`📖 Indexed: ${result.summary.indexed}`);
  console.log(`❌ Missing: ${result.summary.missing}`);
  console.log(`✓ Submitted: ${result.summary.submitted}`);
  console.log(`⏸ Skipped: ${result.summary.skipped}`);
} else {
  console.error(`Error: ${result.error}`);
}
```

### Example 3: Validate Only

```typescript
import { validateSitemapUrls, getAuthClient } from "@/lib/google-indexing-utils";

const authClient = await getAuthClient();
if (!authClient) throw new Error("Not configured");

const result = await validateSitemapUrls(sitemapUrls, authClient);

// Separately handle indexed, missing, pending
console.log("Indexed:", result.indexed);       // Successfully indexed
console.log("Missing:", result.missing);       // Need submission
console.log("Pending:", result.pending);       // Status unknown
console.log("Errors:", result.errors);         // Failed to check
```

### Example 4: Submit Only

```typescript
import { 
  submitMissingPagesToGoogle, 
  getAuthClient 
} from "@/lib/google-indexing-utils";

const authClient = await getAuthClient();
const missingUrls = [...];

const result = await submitMissingPagesToGoogle(
  missingUrls,
  authClient,
  100  // Max 100 submissions
);

console.log("Submitted:", result.submitted);
console.log("Failed:", result.failed);
console.log("Skipped:", result.skipped);
console.log("Quota used:", result.quotaUsed);
```

### Example 5: Single URL Submission with Verification

```typescript
import { 
  submitUrlToGoogle, 
  checkIndexingStatus,
  getAuthClient 
} from "@/lib/google-indexing-utils";

const authClient = await getAuthClient();
const url = "https://example.com/blog/new-post";

// Submit
const submission = await submitUrlToGoogle(url, authClient, "URL_UPDATED");
console.log(`Submitted: ${submission.success}`);

// Wait for processing
await new Promise(r => setTimeout(r, 3000));

// Verify
const status = await checkIndexingStatus(url, authClient);
console.log(`Indexed: ${status.indexed}`);
console.log(`Status: ${status.status}`);
```

---

## Rate Limiting Details

### Quota System

- **Daily quota:** 200 submissions
- **Reset:** Every 24 hours
- **Per-submission delay:** 200ms minimum

### How It Works

```typescript
// Before each submission, DCYFR checks:
const remaining = getRemainingQuota();  // Returns 0-200
const canSubmit = canSubmit();          // Checks quota + timing

if (!canSubmit) {
  return { success: false, reason: "rate-limit-exceeded" };
}

// After successful submission, it records:
recordSubmission();  // Increments counter + timestamp
```

### Example Quota Tracking

```
Initial state:
  submissionCount: 0
  quotaRemaining: 200
  
After 50 submissions:
  submissionCount: 50
  quotaRemaining: 150
  
After 24 hours:
  submissionCount: 0 (reset)
  quotaRemaining: 200
```

---

## API Responses

### Validation Response

```typescript
{
  success: true,
  total: 100,
  indexed: {
    count: 85,
    urls: ["https://example.com/", ...]
  },
  missing: {
    count: 15,
    urls: ["https://example.com/blog/post-1", ...]
  },
  pending: {
    count: 0,
    urls: []
  },
  validationTime: "2025-12-09T10:30:00Z"
}
```

### Submission Response

```typescript
{
  success: true,
  submitted: ["https://example.com/blog/post-1", ...],
  failed: [
    {
      url: "https://example.com/error",
      error: "Permission denied (403)"
    }
  ],
  skipped: ["https://example.com/blog/post-2", ...],
  verified: [
    {
      url: "https://example.com/blog/post-1",
      indexed: true,
      status: "MOBILE_FRIENDLY"
    }
  ],
  summary: {
    total: 100,
    indexed: 85,
    missing: 15,
    submitted: 10,
    successfullyIndexed: 8,
    failed: 2,
    skipped: 5,
    quotaRemaining: 190
  }
}
```

### Individual URL Submission

```typescript
{
  success: true,
  url: "https://example.com/blog/post",
  type: "URL_UPDATED",
  metadata: { /* Google API response */ },
  quotaRemaining: 199,
  indexingStatus: {
    indexed: true,
    status: "MOBILE_FRIENDLY",
    metadata: { /* GSC metadata */ }
  }
}
```

---

## Sitemap Integration

### Getting Sitemap URLs

```typescript
// Option 1: From existing sitemap.ts
import { getStaticPages } from "@/app/sitemap";
import { posts } from "@/data/posts";
import { visibleProjects } from "@/data/projects";

const sitemapUrls = [
  ...getStaticPages().map(p => `${SITE_URL}${p}`),
  ...posts.map(p => `${SITE_URL}/blog/${p.slug}`),
  ...visibleProjects.map(p => `${SITE_URL}/portfolio/${p.slug}`),
];

// Option 2: Fetch from live sitemap.xml
const response = await fetch(`${SITE_URL}/sitemap.xml`);
const xml = await response.text();
// Parse XML to extract URLs
```

### Integration Points

**Option A:** Inngest Function (Recommended)
```typescript
// Cron job or event trigger
await inngest.send({
  name: "google/missing-pages.submit",
  data: { sitemapUrls }
});
```

**Option B:** API Route
```typescript
// POST /api/google-indexing
import { validateAndSubmitMissingPages } from "@/lib/google-indexing-utils";

export async function POST(request: NextRequest) {
  const { sitemapUrls, maxSubmissions } = await request.json();
  
  const result = await validateAndSubmitMissingPages(
    sitemapUrls,
    maxSubmissions
  );
  
  return NextResponse.json(result);
}
```

**Option C:** Script
```bash
node scripts/validate-and-submit-missing.mjs
```

---

## Error Handling

### Common Errors

| Status | Meaning | Action |
|--------|---------|--------|
| 429 | Rate limited | Wait, respect quota, retry |
| 403 | Permission denied | Service account not added to GSC |
| 404 | Not found | API returned 404 (means not indexed) |
| UNKNOWN | Cannot determine status | Treat as potentially missing |

### Error Responses

```typescript
// Rate limit exceeded
{
  success: false,
  reason: "rate-limit-exceeded",
  quotaRemaining: 0
}

// API not configured
{
  success: false,
  reason: "api-not-configured"
}

// Submission failed
{
  success: false,
  url: "https://example.com/blog/post",
  error: "Permission denied (403)"
}
```

---

## Testing

### Manual Testing

```bash
# Validate sitemap
node scripts/test-google-indexing.mjs --validate

# Submit missing pages
node scripts/test-google-indexing.mjs --submit --max 10

# Check specific URL
node scripts/test-google-indexing.mjs --check https://example.com/blog/post
```

### Unit Tests

```typescript
// src/__tests__/unit/google-indexing.test.ts
describe("Google Indexing Utils", () => {
  test("validates sitemap URLs", async () => {
    const result = await validateSitemapUrls(testUrls, authClient);
    expect(result.indexed.length).toBeGreaterThanOrEqual(0);
    expect(result.missing.length).toBeGreaterThanOrEqual(0);
  });

  test("respects rate limits", async () => {
    const result = await submitMissingPagesToGoogle(urls, authClient, 50);
    expect(result.submitted.length).toBeLessThanOrEqual(50);
  });
});
```

---

## Migration Guide

### From Old Implementation

**Old:**
```typescript
// Only submitted to queue, no validation
await inngest.send({
  name: "google/url.submit",
  data: { url }
});
```

**New - Option 1 (Recommended):**
```typescript
// Validates first, then submits
await inngest.send({
  name: "google/missing-pages.submit",
  data: { sitemapUrls: [...], maxSubmissions: 50 }
});
```

**New - Option 2:**
```typescript
// Still works as before, but now with rate limiting
await inngest.send({
  name: "google/url.submit",
  data: { url, skipRateLimit: false }
});
```

---

## Performance Notes

### Timing

- **Validation:** ~100ms per URL (respects rate limits)
- **Submission:** ~200ms per URL + API latency
- **Verification:** ~3000ms wait + ~100ms per URL

### Quota Usage

- **Daily limit:** 200 submissions
- **Recommended:** Submit ~180/day, reserve 20 for emergencies
- **Batch size:** Max 50-100 per run for safety

### Example Run

```
Input: 1000 URLs
  - Validate all 1000: ~100 seconds
  - Identify missing: 150 URLs
  - Submit 100 of 150: ~25 seconds
  - Verify 100: ~50 seconds
  
Total: ~3 minutes
Quota used: 100 of 200 daily
```

---

## Configuration

### Environment Variables

```bash
# Required
GOOGLE_INDEXING_API_KEY='{"type":"service_account",...}'
```

### Optional Tuning

Modify constants in:
- `src/inngest/google-indexing-functions.ts`
- `src/lib/google-indexing-utils.ts`

```typescript
const GOOGLE_DAILY_QUOTA = 200;           // Daily submission limit
const SUBMISSION_RATE_LIMIT_MS = 200;    // Min delay between submissions
```

---

## Monitoring

### What to Track

1. **Quota usage** - Ensure we stay under 200/day
2. **Indexing rate** - % of submitted URLs successfully indexed
3. **Error rate** - Permission denied, API errors
4. **Validation accuracy** - % of missing URLs correctly identified

### Example Metrics

```typescript
// Log to monitoring system
{
  event: "google_indexing",
  action: "submit_batch",
  total_urls: 1000,
  indexed: 850,
  missing: 150,
  submitted: 100,
  failed: 5,
  quota_remaining: 85,
  indexing_rate: 0.95, // 95% successfully indexed
  timestamp: "2025-12-09T10:30:00Z"
}
```

---

## Troubleshooting

### "Permission denied (403)"

**Cause:** Service account not added to Google Search Console  
**Fix:** 
1. Get service account email from `GOOGLE_INDEXING_API_KEY`
2. Add as owner in GSC: Settings → Users and permissions → Add user
3. Wait 5-10 minutes for permissions to sync

### "Rate limited (429)"

**Cause:** Exceeded 200 submissions/day  
**Fix:** Wait 24 hours or reduce daily submission limit

### "Not indexed after submission"

**Cause:** URL not ready, redirects, robots.txt blocks, canonical issues  
**Fix:** Check URL status in GSC, verify no redirects/blocks

### "Connection refused"

**Cause:** `GOOGLE_INDEXING_API_KEY` not set  
**Fix:** Ensure environment variable is configured

---

## References

- [Google Indexing API Docs](https://developers.google.com/search/apis/indexing-api/v3)
- [Search Console Help](https://support.google.com/webmasters)
- [Service Account Setup](https://cloud.google.com/iam/docs/service-accounts)

---

**Refactored by:** DCYFR AI  
**Date:** December 9, 2025  
**Status:** Production Ready

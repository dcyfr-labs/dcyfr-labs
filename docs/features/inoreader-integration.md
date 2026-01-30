<!-- TLP:CLEAR -->

# Inoreader Integration

**Comprehensive RSS feed aggregation for developer content curation.**

> ⚠️ **BETA FEATURE**: This integration is currently in development under `/dev/news`. Expect changes and improvements as we refine the experience.

## Overview

The Inoreader integration provides a powerful developer feed aggregator that curates content from tech blogs, GitHub releases, npm packages, and security advisories. Built on OAuth 2.0 authentication with automatic token refresh, Redis caching, and Inngest background syncing.

## Features

### ✅ Implemented (P0 - Quick Wins)

1. **Developer News Aggregator** (`/dev/news`)
   - OAuth 2.0 authentication with Inoreader
   - Displays latest unread articles from subscribed feeds
   - Search and filter by tags/topics
   - Card-based layout with design tokens
   - Cached in Redis (5-minute TTL)

2. **Background Sync (Inngest)**
   - Runs every 6 hours
   - Fetches up to 100 latest unread articles
   - Updates Redis cache automatically
   - Calculates feed statistics
   - Analyzes trending topics for blog content ideas

3. **TypeScript API Client**
   - Full OAuth 2.0 flow implementation
   - Automatic token refresh
   - Type-safe stream and article fetching
   - Pagination support with continuation tokens
   - Error handling and retry logic

### 🔄 Planned (P1 - High Value)

- **Bookmark Syncing**: Two-way sync between Inoreader starred articles and dcyfr-labs bookmarks
- **Automated Content Discovery**: AI-powered blog topic suggestions from trending feeds
- **Newsletter Archive**: Forward newsletters to Inoreader, display in searchable archive

### 💡 Future Enhancements (P2)

- **Homepage Widget**: Display 3-5 latest tech news on homepage
- **Learning Tracker**: Reading statistics and "What I'm Learning" section
- **Content Research Assistant**: Multi-source article summarization with citations

## Architecture

```
User Flow:
1. Visit /dev/news → OAuth consent page (if not authenticated)
2. Authorize on Inoreader → Callback to /api/inoreader/callback
3. Store tokens in Redis → Redirect to /dev/news with articles

Background Sync:
Inngest (every 6 hours) → Fetch articles → Cache in Redis → Update stats

Components:
- /dev/news page (Server Component)
  ├─ FeedsAuthWrapper (checks auth)
  ├─ FeedsAuth (client - OAuth button)
  └─ FeedsContent (server - fetches cached data)
      └─ FeedsList (client - search/filter UI)
```

## Setup Instructions

### 1. Register Inoreader App

1. Go to: https://www.inoreader.com/developers/register-app
2. Create new application:
   - **Name**: dcyfr-labs
   - **Description**: Developer feed aggregator for portfolio
   - **Redirect URI**: `http://localhost:3000/api/inoreader/callback` (dev)
   - **Scope**: Read only (or Read/Write if you plan to add bookmarking features)
3. Copy Client ID and Client Secret

### 2. Configure Environment Variables

Add to `.env.local`:

```bash
# Inoreader API Credentials
INOREADER_CLIENT_ID=your_client_id_here
INOREADER_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_INOREADER_CLIENT_ID=your_client_id_here # Same as above
INOREADER_REDIRECT_URI=http://localhost:3000/api/inoreader/callback

# Required Dependencies
REDIS_URL=your_redis_url_here # For token storage and caching
INNGEST_EVENT_KEY=your_inngest_key_here # For background sync
INNGEST_SIGNING_KEY=your_inngest_signing_key_here
```

### 3. Subscribe to Feeds in Inoreader

Before using the integration:

1. Sign up at: https://www.inoreader.com/signup
2. Subscribe to tech feeds (recommended):
   - **Next.js**: https://nextjs.org/feed.xml
   - **React**: https://react.dev/rss.xml
   - **Vercel**: https://vercel.com/blog/rss.xml
   - **GitHub Security**: https://github.blog/category/security/feed/
   - **npm Blog**: https://blog.npmjs.org/rss.xml
   - **Tailwind CSS**: https://tailwindcss.com/blog/feed.xml
3. Organize feeds into folders (tags) like "Next.js", "Security", "Design", etc.

### 4. Test OAuth Flow

```bash
npm run dev

# 1. Visit http://localhost:3000/dev/news
# 2. Click "Connect to Inoreader"
# 3. Authorize on Inoreader consent page
# 4. Redirected back to /dev/news with articles
```

## API Client Usage

### Basic Usage

```typescript
import { InoreaderClient } from "@/lib/inoreader-client";

const client = new InoreaderClient(
  process.env.INOREADER_CLIENT_ID!,
  process.env.INOREADER_CLIENT_SECRET!,
);

// 1. Get OAuth consent URL
const consentUrl = InoreaderClient.getConsentUrl(
  process.env.INOREADER_CLIENT_ID!,
  "http://localhost:3000/api/inoreader/callback",
  "read",
  "csrf_state_token",
);

// 2. Exchange authorization code for tokens
const tokenData = await client.exchangeCodeForTokens(
  "authorization_code_from_callback",
  "http://localhost:3000/api/inoreader/callback",
);

// 3. Fetch articles
const articles = await client.getAllUnread(50);
```

### Advanced Usage

```typescript
// Get starred articles with annotations
const starred = await client.getStarredArticles(20);

// Get articles from specific folder
const nextjsArticles = await client.getFolderArticles("Next.js", 30, true);

// Paginate through large feeds
for await (const batch of client.paginateStream("user/-/state/com.google/reading-list")) {
  console.log(`Batch of ${batch.length} articles`);
  // Process batch...
}

// Restore client from stored tokens
const client = InoreaderClient.fromTokens(clientId, clientSecret, {
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
  expiresAt: tokens.expiresAt,
});
```

## Redis Storage Schema

```
Keys:
- inoreader:tokens → OAuth tokens (30-day TTL)
- inoreader:feeds:latest → Cached articles (6-hour TTL)
- inoreader:stats → Feed statistics (24-hour TTL)
- inoreader:trending_topics → Trending topics for blog ideas (24-hour TTL)

Format:
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiresAt": 1234567890,
  "scope": "read",
  "updatedAt": 1234567890
}
```

## Inngest Functions

### `sync-inoreader-feeds`

**Schedule**: Every 6 hours  
**Purpose**: Sync latest articles to Redis cache

**Steps**:
1. Validate configuration (credentials, Redis)
2. Fetch stored OAuth tokens from Redis
3. Create Inoreader client and fetch articles
4. Cache articles in Redis (6-hour TTL)
5. Update feed statistics
6. Analyze trending topics for content ideas

**Manual Trigger** (for testing):

```bash
curl http://localhost:3000/api/inngest \
  -H "Content-Type: application/json" \
  -d '{"name": "sync-inoreader-feeds", "data": {}}'
```

## Rate Limiting

**Inoreader API Limits** (as of 2026):
- **Free Tier**: 60 requests/hour
- **Pro Tier**: Higher limits (check documentation)

**Mitigation Strategies**:
1. Redis caching (5-minute TTL for page loads)
2. Background sync every 6 hours (not on every page visit)
3. Pagination limits (max 100 articles per request)
4. Automatic token refresh (avoid re-auth on every request)

## Security Considerations

### OAuth CSRF Protection

Currently basic (state parameter logged but not validated). For production:

```typescript
// 1. Generate and store state in session
const state = generateRandomString();
await saveToSession("oauth_state", state);

// 2. Verify state in callback
const storedState = await getFromSession("oauth_state");
if (state !== storedState) {
  throw new Error("CSRF attack detected");
}
```

### Token Storage

- ✅ Tokens stored in Redis (encrypted connection)
- ✅ 30-day expiration with automatic refresh
- ❌ Consider encrypting tokens at rest (future enhancement)

### Rate Limiting

- ✅ Background sync limits API calls
- ✅ Redis caching reduces redundant requests
- ❌ Consider per-user rate limiting (future)

## Troubleshooting

### "Missing authorization code"

**Cause**: OAuth callback didn't receive `code` parameter  
**Fix**: Check redirect URI matches registration settings exactly

### "No Inoreader tokens found"

**Cause**: Tokens expired or Redis cleared  
**Fix**: Re-authenticate at `/dev/news`

### "Failed to refresh token"

**Cause**: Refresh token expired or invalid  
**Fix**: User needs to re-authorize (tokens expire after 30 days)

### Empty feeds on /dev/news page

**Cause**: No feeds subscribed in Inoreader  
**Fix**: Subscribe to feeds in Inoreader web app first

## Testing

### Unit Tests (TODO)

```typescript
// src/__tests__/lib/inoreader-client.test.ts
describe("InoreaderClient", () => {
  it("should exchange code for tokens", async () => {
    // Mock fetch responses
    // Test OAuth flow
  });

  it("should refresh expired tokens", async () => {
    // Test automatic token refresh
  });

  it("should fetch articles with pagination", async () => {
    // Test pagination logic
  });
});
```

### Integration Tests (TODO)

```typescript
// e2e/inoreader-integration.spec.ts
test("should authenticate and display feeds", async ({ page }) => {
  // 1. Mock OAuth flow
  // 2. Visit /dev/news
  // 3. Verify articles displayed
  // 4. Test search and filtering
});
```

## Performance Metrics

- **Page Load**: ~200ms (with Redis cache hit)
- **Background Sync**: ~5-10s (for 100 articles)
- **Cache Hit Rate**: Target 95%+ (5-minute TTL)
- **API Calls**: ~4 per day (6-hour sync schedule)

## Future Enhancements

1. **AI Content Summarization**: Use OpenAI to summarize long articles
2. **Topic Clustering**: Group articles by semantic similarity
3. **Read Later Queue**: Save articles for offline reading
4. **Email Digests**: Weekly email with top articles
5. **Mobile App Integration**: React Native app with Inoreader sync

## References

- **Inoreader API Docs**: https://www.inoreader.com/developers/
- **OAuth 2.0 Spec**: https://oauth.net/2/
- **Inngest Docs**: https://www.inngest.com/docs

## Support

For issues or questions:
1. Check Inoreader API status: https://status.inoreader.com/
2. Review console logs for detailed error messages
3. Verify environment variables are set correctly
4. Check Redis connectivity and token storage

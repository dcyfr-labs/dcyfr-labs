{/* TLP:CLEAR */}

# Trending Projects: GitHub API Integration

**Status:** ✅ Implemented (Real API)
**Last Updated:** December 27, 2025

---

## Overview

The Trending Projects feature fetches **real GitHub repository statistics** to display trending projects based on:

- ⭐ Total star count
- 📈 Recent star growth (accurate via Stargazers API)
- 🍴 Fork count
- 📅 Repository recency

**Previous:** Mock data (`getMockTrendingProjects`)
**Current:** Real GitHub API (`getTrendingProjects`) with accurate recent stars tracking

---

## How It Works

### Data Flow

```
Project Data (data/projects.ts)
        ↓
Extract GitHub repo URLs (owner/repo)
        ↓
Fetch GitHub API (Octokit)
        ↓
Calculate Trending Score
        ↓
Display in TrendingProjectsPanel
```

### Trending Score Algorithm

```typescript
score = (
  recentStars × 5 +      // Recent activity (5x weight)
  totalStars × 1 +       // Total popularity (1x weight)
  forks × 2              // Usage indicator (2x weight)
) × recencyMultiplier    // 1.5x boost for projects < 6 months old
```

**Example:**
- Project A: 100 stars, +20 recent, 30 forks → Score: 260
- Project B: 50 stars, +5 recent, 10 forks → Score: 95

---

## GitHub API Setup

### 1. GitHub Token (Optional but Recommended)

Without a token:
- ❌ Rate limit: **60 requests/hour** (shared across all visitors)
- ⚠️ May hit rate limit on high-traffic sites

With a token:
- ✅ Rate limit: **5,000 requests/hour**
- ✅ Access to private repositories (if needed)
- ✅ More reliable for production

### 2. Create GitHub Token

**Steps:**
1. Go to [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Name: `DCYFR Labs - Trending Projects`
4. Scopes needed: **`public_repo`** (read-only access to public repos)
5. Expiration: **No expiration** or **1 year** (set calendar reminder)
6. Click **"Generate token"**
7. Copy the token (starts with `ghp_...`)

### 3. Add to Environment Variables

**Local Development (`.env.local`):**
```bash
GITHUB_TOKEN=ghp_your_token_here
```

**Vercel Production:**
```bash
vercel env add GITHUB_TOKEN
# Paste token when prompted
# Select: Production, Preview, Development (all environments)
```

**Environment Variables UI:**
- Go to Vercel Dashboard → Project → Settings → Environment Variables
- Add: `GITHUB_TOKEN` = `ghp_...`
- Environments: Production, Preview, Development

### 4. Verify It Works

**Check Server Logs:**
```bash
npm run dev
# Visit homepage
# Check terminal for:
# ✅ No errors from GitHub API
# ❌ "[TrendingProjects] Failed to fetch GitHub stats" = token issue
```

**Without Token:**
- Projects will still appear, but may hit rate limits
- Fallback to metadata-based scoring (featured, status, tech count)

---

## Configuration

### Adjust Trending Parameters

**File:** [`/src/lib/activity/trending-projects.ts`](../../src/lib/activity/trending-projects.ts)

```typescript
const DEFAULT_OPTIONS = {
  limit: 5,               // Top 5 projects
  recentStarsWeight: 5,   // Recent activity importance
  totalStarsWeight: 1,    // Total popularity importance
  forksWeight: 2,         // Usage indicator importance
  recencyWeight: 1.5,     // Boost for new projects
};
```

**To change weights:**
```typescript
const trendingProjects = await getTrendingProjects([...projects], {
  limit: 10,              // Show top 10 instead of 5
  recentStarsWeight: 10,  // Emphasize recent activity more
  totalStarsWeight: 0.5,  // De-emphasize total stars
});
```

---

## Recent Stars Calculation

### Current Approach: Accurate with Smart Fallback ✅

**Status:** Implemented (December 27, 2025)

The implementation uses the **Stargazers API with timestamps** for exact recent star counts, with intelligent fallbacks for edge cases:

```typescript
// Fetch stargazers with timestamps (newest first)
const { data: stargazers } = await octokit.activity.listStargazersForRepo({
  owner: repoOwner,
  repo: repoName,
  headers: { Accept: 'application/vnd.github.star+json' }, // Include starred_at timestamp
  per_page: 100,
  page: 1,
});

// Count stars from last 7 days
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

let recentStarCount = 0;
for (const stargazer of stargazers) {
  if (new Date(stargazer.starred_at) > sevenDaysAgo) {
    recentStarCount++;
  } else {
    break; // Stars ordered by date, can stop here
  }
}
```

### Smart Optimizations

**1. Pagination Limit** (Prevents Excessive API Calls):

- Maximum 10 pages fetched (1000 stars checked)
- Repos with >1000 stars fall back to approximation
- Configurable via `MAX_STARGAZER_PAGES` constant

**2. Early Termination**:

- Stops pagination when encountering stars older than 7 days
- Minimizes API calls for repos with recent activity

**3. Environment Control**:

```bash
# .env.local
USE_ACCURATE_RECENT_STARS=true   # Default: accurate tracking
USE_ACCURATE_RECENT_STARS=false  # Use 10% approximation (faster)
```

### Fallback to Approximation

The system automatically falls back to the 10% approximation method when:

- Repository has >1000 stars (prevents excessive API calls)
- Stargazers API returns an error (rate limit, permissions, etc.)
- Environment variable `USE_ACCURATE_RECENT_STARS=false`

**Approximation formula:**

```typescript
const isRecentlyUpdated = new Date(repo.updated_at) > sevenDaysAgo;
const estimatedRecentStars = isRecentlyUpdated
  ? Math.round(repo.stargazers_count * 0.1)  // 10% of total
  : 0;
```

### Performance Characteristics

| Repo Size       | API Calls | Method        | Notes                            |
|-----------------|-----------|---------------|----------------------------------|
| 1-100 stars     | 1         | Accurate      | Single page fetch                |
| 100-1000 stars  | 1-10      | Accurate      | Multi-page with early termination|
| >1000 stars     | 1         | Approximation | Automatic fallback               |
| API Error       | 1         | Approximation | Graceful degradation             |

---

## Fallback Behavior

### When GitHub API Fails

**Scenarios:**
- Rate limit exceeded
- Repository not found
- Network error
- Invalid token

**Fallback Scoring:**
```typescript
const baseScore = 50;                                    // Base score
const featuredBonus = project.featured ? 20 : 0;        // +20 if featured
const statusBonus = project.status === "active" ? 15 : 10; // +15 if active
const techBonus = (project.tech?.length || 0) * 2;      // +2 per tech

return baseScore + featuredBonus + statusBonus + techBonus;
```

**Example:**
- Featured, active project with 5 tech tags → Score: 95
- Still appears in trending, just without real GitHub stats

**User Experience:**
- Projects show status (Active/In Progress) instead of stars
- No "+20 recent stars" indicator
- Still sorted by calculated score

---

## Rate Limiting

### Without Token

**Limits:**
- 60 requests/hour per IP
- Shared across all API calls

**Best Practices:**
- Enable caching (ISR revalidate: 3600s = 1 hour)
- Limit to top 5 projects (reduces API calls)
- Use on low-traffic sites only

### With Token

**Limits:**
- 5,000 requests/hour
- Dedicated to your app

**Best Practices:**
- Still enable caching to reduce costs
- Monitor rate limit headers:
  ```typescript
  const rateLimit = response.headers['x-ratelimit-remaining'];
  console.log(`GitHub API calls remaining: ${rateLimit}`);
  ```

### Caching Strategy (Built-In)

**Next.js ISR (Incremental Static Regeneration):**
```typescript
export const revalidate = 3600; // 1 hour
```

- Homepage regenerates every 1 hour
- First visitor after 1 hour triggers rebuild
- All other visitors see cached version
- **API calls per day:** ~24 (once per hour)

**Manual Cache Control (Future):**
```typescript
// Add Redis caching layer
const cacheKey = `trending-projects:${limit}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const trending = await getTrendingProjects(...);
await redis.set(cacheKey, JSON.stringify(trending), 'EX', 3600);
```

---

## Monitoring & Debugging

### Check API Calls

**Server Logs:**
```bash
npm run dev
# Look for:
[TrendingProjects] Failed to fetch GitHub stats for owner/repo: ...
```

**GitHub API Rate Limit:**
```typescript
// Add to fetchGitHubStats function
const { data: rateLimit } = await octokit.rateLimit.get();
console.log(`Rate limit: ${rateLimit.resources.core.remaining}/${rateLimit.resources.core.limit}`);
console.log(`Resets at: ${new Date(rateLimit.resources.core.reset * 1000)}`);
```

### Common Issues

**Issue:** "Failed to fetch GitHub stats: 401 Unauthorized"
- **Cause:** Invalid or expired token
- **Fix:** Regenerate token, update environment variables

**Issue:** "Failed to fetch GitHub stats: 403 Forbidden (Rate limit exceeded)"
- **Cause:** Hit 60/hour limit (no token) or 5000/hour limit
- **Fix:** Add token or wait for reset

**Issue:** "Failed to fetch GitHub stats: 404 Not Found"
- **Cause:** Repository doesn't exist or is private
- **Fix:** Check project link in [`data/projects.ts`](../../src/data/projects.ts)

**Issue:** Projects show without star counts
- **Cause:** API call failed, using fallback scoring
- **Fix:** Check logs, verify token, check rate limits

---

## Testing

### Test with Real Repositories

**1. Check Current Projects:**
```typescript
// src/data/projects.ts
{
  id: "project-dcyfr-labs",
  links: [
    { label: "Code", href: "https://github.com/dcyfr/dcyfr-labs", type: "github" }
  ]
}
// Expected: Fetches stars/forks from dcyfr/dcyfr-labs
```

**2. Test Fallback Behavior:**
```typescript
// Temporarily add invalid repo to test fallback
{
  links: [
    { label: "Code", href: "https://github.com/invalid/nonexistent", type: "github" }
  ]
}
// Expected: Shows project with fallback score, no star counts
```

**3. Test Rate Limiting:**
```bash
# Make 61 requests within 1 hour (no token)
for i in {1..61}; do
  curl http://localhost:3000 > /dev/null
done
# Expected: 61st request should hit rate limit, use fallback
```

---

## Future Enhancements

### 1. Star History Tracking

Store historical star counts in database for perfect accuracy without API calls:

```typescript
interface StarHistory {
  repoId: string;
  date: Date;
  stars: number;
}
// Query: stars gained in last 7 days = current - 7 days ago
```

**Benefits:**

- Perfect accuracy (no approximation needed)
- Zero API calls for recent star calculation
- Historical trend analysis capabilities
- Supports arbitrary time windows (7 days, 30 days, 90 days)

**Requirements:**

- Database (Redis, PostgreSQL, or similar)
- Cron job to fetch and store daily star counts
- Backfill script for historical data

### 2. Trending Velocity Indicators

Add dynamic badges based on growth rate:

- 🔥 **Hot** - >50% growth in 7 days
- 📈 **Rising** - >20% growth in 30 days
- ⭐ **Top** - All-time highest stars
- 🚀 **Accelerating** - Growth rate increasing week-over-week

### 3. Multiple Time Windows

Add tabs for different trending periods:

- This Week (7 days) - Current implementation
- This Month (30 days) - Medium-term trends
- All Time - Historical popularity

### 4. Project Categories

Filter trending by category:
- Code projects (most stars)
- Community projects (most forks)
- Active projects (recent commits)

---

## Resources

**GitHub API Documentation:**
- [Repositories API](https://docs.github.com/en/rest/repos/repos)
- [Stargazers API](https://docs.github.com/en/rest/activity/starring)
- [Rate Limiting](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)

**Octokit Documentation:**
- [Octokit REST](https://octokit.github.io/rest.js/)
- [Authentication](https://github.com/octokit/rest.js#authentication)

**Related Files:**
- Implementation: [`/src/lib/activity/trending-projects.ts`](../../src/lib/activity/trending-projects.ts)
- UI Component: [`/src/components/home/trending-projects-panel.tsx`](../../src/components/home/trending-projects-panel.tsx)
- Homepage: [`/src/app/page.tsx`](../../src/app/page.tsx)
- Projects Data: [`/src/data/projects.ts`](../../src/data/projects.ts)

---

**Document Version:** 1.0
**Last Updated:** December 27, 2025
**Status:** Production-Ready

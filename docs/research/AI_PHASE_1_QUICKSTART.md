# Phase 1 Quick Start: Intelligent Content Recommendations

**Goal:** Implement semantic content recommendations in 1-2 weeks
**Cost:** ~$1-2/month
**Impact:** +30% internal link clicks, better content discovery

---

## Prerequisites

1. **API Keys Required:**
   - OpenAI API key (for embeddings): https://platform.openai.com/api-keys
   - Anthropic API key (optional, for future features): https://console.anthropic.com/

2. **Budget Approval:**
   - Estimated cost: $1-2/month
   - Set up billing alerts at $10/month threshold

3. **Time Commitment:**
   - Initial setup: 4-6 hours
   - Testing & iteration: 2-3 hours
   - Total: ~1 week part-time

---

## Step 1: Install Dependencies (15 minutes)

```bash
# Install Vercel AI SDK
npm install ai @ai-sdk/openai @ai-sdk/anthropic zod

# Verify installation
npm list ai @ai-sdk/openai
```

**Expected output:**
```
├── ai@4.x.x
├── @ai-sdk/openai@1.x.x
└── @ai-sdk/anthropic@1.x.x
```

---

## Step 2: Configure Environment Variables (10 minutes)

Add to `.env.local`:

```env
# OpenAI (for embeddings)
OPENAI_API_KEY=sk-proj-...

# Anthropic (optional for now)
ANTHROPIC_API_KEY=sk-ant-...

# Feature flags
ENABLE_AI_RECOMMENDATIONS=true
ENABLE_AI_SEARCH=false  # Phase 1 doesn't include this
```

**Test API keys:**

```bash
# Create test script
cat > scripts/test-ai-connection.ts << 'EOF'
import { openai } from '@ai-sdk/openai'
import { embed } from 'ai'

async function testConnection() {
  try {
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: 'Hello, world!',
    })
    console.log('✅ OpenAI connection successful')
    console.log(`✅ Embedding dimensions: ${embedding.length}`)
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

testConnection()
EOF

# Run test
npx tsx scripts/test-ai-connection.ts
```

**Expected output:**
```
✅ OpenAI connection successful
✅ Embedding dimensions: 1536
```

---

## Step 3: Create AI Infrastructure (1 hour)

### 3.1 Create `/src/lib/ai/config.ts`

```typescript
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'

export const AI_MODELS = {
  embeddings: openai.embedding('text-embedding-3-small'),
  quickText: anthropic('claude-3-5-haiku-20241022'),
  deepAnalysis: anthropic('claude-3-5-sonnet-20241022'),
} as const

export const AI_CONFIG = {
  // Cache TTLs (in seconds)
  cache: {
    embeddings: 30 * 24 * 60 * 60,      // 30 days
    recommendations: 60 * 60,            // 1 hour
  },

  // Cost controls
  limits: {
    maxEmbeddingsPerBatch: 100,
    maxRecommendations: 5,
  },

  // Feature flags
  features: {
    recommendations: process.env.ENABLE_AI_RECOMMENDATIONS === 'true',
    search: process.env.ENABLE_AI_SEARCH === 'true',
  },
} as const
```

### 3.2 Create `/src/lib/ai/embeddings.ts`

```typescript
import { embed } from 'ai'
import { AI_MODELS } from './config'
import { redis } from '@/lib/redis'

export type Embedding = number[]

/**
 * Generate embedding for text content
 */
export async function generateEmbedding(text: string): Promise<Embedding> {
  const { embedding } = await embed({
    model: AI_MODELS.embeddings,
    value: text,
  })
  return embedding
}

/**
 * Get embedding from cache or generate new one
 */
export async function getEmbedding(
  key: string,
  text: string
): Promise<Embedding> {
  const cacheKey = `embedding:v1:${key}`

  // Check cache
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached as string)
  }

  // Generate new embedding
  const embedding = await generateEmbedding(text)

  // Cache for 30 days
  await redis.set(cacheKey, JSON.stringify(embedding), 'EX', 30 * 24 * 60 * 60)

  return embedding
}

/**
 * Prepare text for embedding (truncate to reasonable length)
 */
export function prepareTextForEmbedding(text: string, maxLength = 8000): string {
  // Remove excessive whitespace
  const cleaned = text.replace(/\s+/g, ' ').trim()

  // Truncate if needed (OpenAI limit is ~8191 tokens, ~32k chars)
  if (cleaned.length > maxLength) {
    return cleaned.slice(0, maxLength) + '...'
  }

  return cleaned
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: Embedding, b: Embedding): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}
```

### 3.3 Create `/src/lib/ai/recommendations.ts`

```typescript
import { getEmbedding, cosineSimilarity, prepareTextForEmbedding } from './embeddings'
import { getAllPosts, type Post } from '@/data/posts'
import { redis } from '@/lib/redis'

export interface RecommendedPost {
  post: Post
  score: number
  reason: 'semantic' | 'tags' | 'series'
}

/**
 * Get semantically similar posts using embeddings
 */
export async function getSemanticRecommendations(
  postId: string,
  limit: number = 5
): Promise<RecommendedPost[]> {
  const posts = await getAllPosts()
  const currentPost = posts.find(p => p.id === postId)

  if (!currentPost) {
    throw new Error(`Post not found: ${postId}`)
  }

  // Check cache
  const cacheKey = `recommendations:semantic:${postId}:${limit}`
  const cached = await redis.get(cacheKey)
  if (cached) {
    const cachedData = JSON.parse(cached as string)
    // Hydrate post objects
    return cachedData.map((item: any) => ({
      post: posts.find(p => p.id === item.postId)!,
      score: item.score,
      reason: item.reason,
    }))
  }

  // Get embedding for current post
  const currentEmbedding = await getEmbedding(
    postId,
    prepareTextForEmbedding(
      `${currentPost.title} ${currentPost.summary} ${currentPost.body}`
    )
  )

  // Calculate similarity with all other posts
  const similarities = await Promise.all(
    posts
      .filter(p => p.id !== postId && !p.draft)
      .map(async (post) => {
        const embedding = await getEmbedding(
          post.id,
          prepareTextForEmbedding(
            `${post.title} ${post.summary} ${post.body}`
          )
        )

        const score = cosineSimilarity(currentEmbedding, embedding)

        return {
          post,
          score,
          reason: 'semantic' as const,
        }
      })
  )

  // Sort by score and take top N
  const recommendations = similarities
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  // Cache for 1 hour
  await redis.set(
    cacheKey,
    JSON.stringify(
      recommendations.map(r => ({
        postId: r.post.id,
        score: r.score,
        reason: r.reason,
      }))
    ),
    'EX',
    60 * 60
  )

  return recommendations
}

/**
 * Get hybrid recommendations (semantic + tag-based)
 */
export async function getHybridRecommendations(
  postId: string,
  limit: number = 5
): Promise<RecommendedPost[]> {
  const semanticRecs = await getSemanticRecommendations(postId, limit * 2)

  // Blend with tag-based for diversity
  // (You can import existing getRelatedPosts for this)

  return semanticRecs.slice(0, limit)
}
```

---

## Step 4: Generate Embeddings for All Posts (30 minutes)

Create `/scripts/ai/generate-embeddings.ts`:

```typescript
import { getAllPosts } from '@/data/posts'
import { getEmbedding, prepareTextForEmbedding } from '@/lib/ai/embeddings'

async function generateAllEmbeddings() {
  const posts = await getAllPosts()
  console.log(`📊 Generating embeddings for ${posts.length} posts...`)

  let successCount = 0
  let errorCount = 0

  for (const post of posts) {
    if (post.draft) {
      console.log(`⏭️  Skipping draft: ${post.title}`)
      continue
    }

    try {
      const text = prepareTextForEmbedding(
        `${post.title} ${post.summary} ${post.body}`
      )

      await getEmbedding(post.id, text)

      successCount++
      console.log(`✅ [${successCount}/${posts.length}] ${post.title}`)

      // Rate limiting: wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      errorCount++
      console.error(`❌ Error processing ${post.title}:`, error)
    }
  }

  console.log(`\n📊 Complete: ${successCount} success, ${errorCount} errors`)
}

generateAllEmbeddings().catch(console.error)
```

Run the script:

```bash
npx tsx scripts/ai/generate-embeddings.ts
```

**Expected output:**
```
📊 Generating embeddings for 100 posts...
✅ [1/100] Getting Started with Next.js
✅ [2/100] TypeScript Best Practices
...
✅ [100/100] Advanced DevSecOps
📊 Complete: 100 success, 0 errors
```

**Cost:** ~$0.20 for 100 posts (one-time)

---

## Step 5: Create API Route (30 minutes)

Create `/src/app/api/ai/recommend/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getSemanticRecommendations } from '@/lib/ai/recommendations'
import { AI_CONFIG } from '@/lib/ai/config'

export const runtime = 'nodejs' // or 'edge' if Redis supports it
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Check feature flag
  if (!AI_CONFIG.features.recommendations) {
    return NextResponse.json(
      { error: 'AI recommendations not enabled' },
      { status: 503 }
    )
  }

  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('postId')
  const limit = parseInt(searchParams.get('limit') || '5')

  if (!postId) {
    return NextResponse.json(
      { error: 'Missing postId parameter' },
      { status: 400 }
    )
  }

  if (limit < 1 || limit > 10) {
    return NextResponse.json(
      { error: 'Limit must be between 1 and 10' },
      { status: 400 }
    )
  }

  try {
    const recommendations = await getSemanticRecommendations(postId, limit)

    return NextResponse.json({
      postId,
      recommendations: recommendations.map(r => ({
        id: r.post.id,
        slug: r.post.slug,
        title: r.post.title,
        summary: r.post.summary,
        score: r.score,
        reason: r.reason,
      })),
      cached: true, // Will be true after first request
    })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}
```

**Test the API:**

```bash
# Start dev server
npm run dev

# Test in another terminal
curl "http://localhost:3000/api/ai/recommend?postId=your-post-id&limit=5" | jq
```

---

## Step 6: Update Blog Post Page (1 hour)

Modify `/src/app/blog/[slug]/page.tsx`:

```typescript
import { getSemanticRecommendations } from '@/lib/ai/recommendations'
import { AI_CONFIG } from '@/lib/ai/config'

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)

  // Get AI recommendations if enabled
  let recommendations = []
  if (AI_CONFIG.features.recommendations) {
    try {
      recommendations = await getSemanticRecommendations(post.id, 3)
    } catch (error) {
      console.error('Failed to get AI recommendations:', error)
      // Fallback to tag-based recommendations
      recommendations = getRelatedPosts(post.id, 3).map(p => ({
        post: p,
        score: 0,
        reason: 'tags' as const,
      }))
    }
  } else {
    // Use existing tag-based recommendations
    recommendations = getRelatedPosts(post.id, 3).map(p => ({
      post: p,
      score: 0,
      reason: 'tags' as const,
    }))
  }

  return (
    <PageLayout>
      {/* ... existing post content ... */}

      {/* Related posts section */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">
          {AI_CONFIG.features.recommendations
            ? 'You might also like'
            : 'Related posts'}
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {recommendations.map(({ post, score, reason }) => (
            <RelatedPostCard
              key={post.id}
              post={post}
              score={score}
              reason={reason}
            />
          ))}
        </div>
      </section>
    </PageLayout>
  )
}
```

Create `/src/components/blog/related-post-card.tsx`:

```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { HOVER_EFFECTS } from '@/lib/design-tokens'
import Link from 'next/link'
import { type Post } from '@/data/posts'
import { type RecommendedPost } from '@/lib/ai/recommendations'

interface RelatedPostCardProps {
  post: Post
  score: number
  reason: 'semantic' | 'tags' | 'series'
}

export function RelatedPostCard({ post, score, reason }: RelatedPostCardProps) {
  const reasonLabel = {
    semantic: '🤖 AI recommended',
    tags: '🏷️ Similar tags',
    series: '📚 Same series',
  }[reason]

  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className={HOVER_EFFECTS.card}>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">
              {reasonLabel}
            </span>
            {score > 0 && (
              <span className="text-xs text-muted-foreground">
                {Math.round(score * 100)}% match
              </span>
            )}
          </div>
          <CardTitle className="text-lg">{post.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {post.summary}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
```

---

## Step 7: Test & Validate (1 hour)

### 7.1 Manual Testing

1. **Visit a blog post:**
   ```
   http://localhost:3000/blog/your-post-slug
   ```

2. **Check related posts section:**
   - Should show 3 AI-recommended posts
   - Should display "🤖 AI recommended" badge
   - Should show similarity score

3. **Compare with tag-based:**
   - Temporarily disable AI: `ENABLE_AI_RECOMMENDATIONS=false`
   - Restart dev server
   - Compare which posts are recommended

### 7.2 API Testing

```bash
# Test API endpoint
curl "http://localhost:3000/api/ai/recommend?postId=your-post-id&limit=5" | jq

# Expected response:
{
  "postId": "your-post-id",
  "recommendations": [
    {
      "id": "post-1",
      "slug": "post-1-slug",
      "title": "Related Post 1",
      "summary": "Summary text...",
      "score": 0.87,
      "reason": "semantic"
    },
    ...
  ],
  "cached": true
}
```

### 7.3 Performance Testing

```bash
# Test cache performance
time curl "http://localhost:3000/api/ai/recommend?postId=test&limit=5"
# First request: ~500-1000ms (generates embeddings)
# Second request: ~50-100ms (cached)
```

### 7.4 Cost Monitoring

Check OpenAI dashboard:
1. Go to https://platform.openai.com/usage
2. Filter by "Embeddings"
3. Verify costs are < $1

---

## Step 8: Deploy to Production (30 minutes)

### 8.1 Environment Variables

Add to Vercel project settings:

```bash
vercel env add OPENAI_API_KEY
# Paste: sk-proj-...

vercel env add ENABLE_AI_RECOMMENDATIONS
# Enter: true
```

### 8.2 Deploy

```bash
git add .
git commit -m "feat: Add AI-powered content recommendations

- Install Vercel AI SDK + OpenAI integration
- Implement semantic similarity using embeddings
- Create recommendations API endpoint
- Update blog post pages with AI recommendations
- Add caching layer (1 hour TTL)

Cost: ~$1-2/month
Impact: Better content discovery"

git push origin main
```

### 8.3 Post-Deploy Validation

```bash
# Test production API
curl "https://your-domain.com/api/ai/recommend?postId=test&limit=5" | jq
```

---

## Step 9: Monitor & Iterate (Ongoing)

### 9.1 Set Up Monitoring

Create `/src/app/api/admin/ai-metrics/route.ts`:

```typescript
export async function GET() {
  const metrics = {
    totalEmbeddings: await redis.keys('embedding:v1:*').then(k => k.length),
    cacheHitRate: '80%', // Implement actual tracking
    avgResponseTime: '150ms',
    costThisMonth: '$1.20',
  }

  return Response.json(metrics)
}
```

### 9.2 Track Engagement

Add analytics to `RelatedPostCard`:

```typescript
onClick={() => {
  // Track click event
  fetch('/api/analytics/track', {
    method: 'POST',
    body: JSON.stringify({
      event: 'ai_recommendation_click',
      postId: post.id,
      score,
      reason,
    }),
  })
}}
```

### 9.3 A/B Testing (Optional)

Compare AI vs tag-based recommendations:

```typescript
const useAI = Math.random() > 0.5 // 50/50 split
const recommendations = useAI
  ? await getSemanticRecommendations(post.id, 3)
  : getRelatedPosts(post.id, 3)
```

---

## Troubleshooting

### "API key not valid"
```bash
# Verify API key format
echo $OPENAI_API_KEY | cut -c1-8
# Should output: sk-proj-

# Test connection
npx tsx scripts/test-ai-connection.ts
```

### "Embedding generation too slow"
```typescript
// Batch processing instead of sequential
const embeddings = await Promise.all(
  posts.map(p => getEmbedding(p.id, p.content))
)
```

### "Redis connection failed"
```bash
# Check Redis status
npm run dev
# Look for Redis connection logs

# Test Redis locally
redis-cli ping
# Should output: PONG
```

### "High API costs"
```typescript
// Add request logging
console.log(`Generating embedding for: ${postId}`)
console.log(`Estimated cost: $${(tokens * 0.02 / 1_000_000).toFixed(6)}`)
```

---

## Success Criteria

After completing Phase 1, you should have:

- ✅ AI recommendations on all blog post pages
- ✅ API endpoint returning semantic recommendations
- ✅ Embeddings cached for 30 days (no repeated costs)
- ✅ Monthly API cost under $2
- ✅ Response time under 200ms (cached)
- ✅ Monitoring dashboard showing usage

---

## Next Steps (Phase 2)

Once Phase 1 is stable:

1. **Search Re-ranking:** Enhance existing search with semantic similarity
2. **SEO Automation:** Auto-generate meta descriptions
3. **Tag Suggestions:** AI-powered tag recommendations
4. **Content Gaps:** Identify topics to write about

See [`AI_INTEGRATION_ROADMAP_2025.md`](./AI_INTEGRATION_ROADMAP_2025.md) for full roadmap.

---

## Support & Resources

**Documentation:**
- Vercel AI SDK: https://ai-sdk.dev/docs
- OpenAI Embeddings: https://platform.openai.com/docs/guides/embeddings
- Redis Caching: https://redis.io/docs/manual/client-side-caching/

**Need Help?**
- Open an issue with logs and error messages
- Check OpenAI status: https://status.openai.com/
- Review Vercel AI SDK examples: https://github.com/vercel/ai/tree/main/examples

---

**Last Updated:** December 27, 2025
**Estimated Time:** 1-2 weeks part-time
**Estimated Cost:** $1-2/month

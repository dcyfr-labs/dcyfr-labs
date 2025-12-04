# Third-Party APIs & MCPs Analysis

**Generated:** 2025-12-04
**Purpose:** Identify actively used services and consolidation opportunities

---

## Executive Summary

**Current Status:**
- **10 Third-Party Services** configured
- **7 MCP Servers** configured
- **4 Services** heavily used in production
- **3 Services** lightly used or optional
- **3 Services** just added (Perplexity)

**Key Findings:**
- ✅ Core services are essential and well-integrated
- ⚠️ 3 MCP servers have unclear/minimal usage
- 💡 Opportunity to consolidate Giscus (comments feature not actively used)
- 💡 Context7 MCP duplicates some Vercel functionality

---

## Third-Party Services Analysis

### 1. **Sentry** (Error Tracking & Monitoring)
**Status:** 🟢 ACTIVELY USED - CRITICAL

**Usage:**
- 95+ references across codebase
- Client-side error tracking (`instrumentation-client.ts`)
- Server-side error tracking (`sentry.server.config.ts`, `sentry.edge.config.ts`)
- Performance monitoring (10% sample rate)
- Session replay (5% sample rate)
- Uptime monitoring (`/api/health`)
- MCP server configured for issue management

**Dependencies:**
```json
"@sentry/nextjs": "^10.28.0"
```

**Cost:** Paid service (performance/error tracking)

**Recommendation:** ✅ **KEEP** - Essential for production monitoring

---

### 2. **Inngest** (Background Jobs)
**Status:** 🟢 ACTIVELY USED - CRITICAL

**Usage:**
- 29+ inngest.send/createFunction calls
- 7 function files in `src/inngest/`
- Contact form processing (instant response)
- GitHub data refresh (scheduled)
- Blog milestone notifications
- Security monitoring
- Workflow automation

**Functions:**
```
├── contact-functions.ts     [Resend email integration]
├── github-functions.ts      [GitHub API caching]
├── blog-functions.ts        [Milestone notifications]
├── security-functions.ts    [Security monitoring]
└── functions.ts             [Hello world demo]
```

**Dependencies:**
```json
"inngest": "^3.45.1"
```

**Cost:** Free tier available, scales with usage

**Recommendation:** ✅ **KEEP** - Core infrastructure for async processing

---

### 3. **Resend** (Email Delivery)
**Status:** 🟢 ACTIVELY USED - PRODUCTION READY

**Usage:**
- 11 references across codebase
- Contact form submissions (via Inngest)
- Blog milestone notifications
- Confirmation emails to users
- Configured in `contact-functions.ts`

**Dependencies:**
```json
"resend": "^6.5.2"
```

**Integration:**
```typescript
// src/inngest/contact-functions.ts
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({
  from: FROM_EMAIL,
  to: AUTHOR_EMAIL,
  subject: `Contact form: ${name}`,
  replyTo: email,
  text: message
});
```

**Cost:** Free tier: 3,000 emails/month, then $20/month

**Recommendation:** ✅ **KEEP** - Essential for contact form functionality

---

### 4. **GitHub API** (Contributions & Data)
**Status:** 🟢 ACTIVELY USED

**Usage:**
- Contributions heatmap (`/projects` page)
- Repository data fetching
- Sponsors integration
- Workflow status monitoring
- GraphQL API for efficiency

**Files:**
```
├── src/lib/activity/github.ts
├── src/lib/github-workflows.ts
├── src/lib/sponsors/github-sponsors.ts
├── src/app/api/github-contributions/route.ts
└── src/components/features/github/github-heatmap.tsx
```

**Dependencies:**
```json
"@octokit/rest": "^22.0.1"
```

**Cost:** Free (with rate limits)

**Recommendation:** ✅ **KEEP** - Core portfolio feature

---

### 5. **Redis (Upstash)** (Caching & Rate Limiting)
**Status:** 🟢 ACTIVELY USED

**Usage:**
- Blog post view counts
- Share counts
- Distributed rate limiting
- Analytics data caching
- In-memory fallback when not configured

**Files:**
```
├── src/lib/views.ts
├── src/lib/shares.ts
├── src/lib/rate-limit.ts
├── src/lib/redis-health.ts
└── src/lib/project-views.ts
```

**Dependencies:**
```json
"redis": "^4.7.0" (via package.json)
```

**Cost:** Free tier: 10,000 commands/day

**Recommendation:** ✅ **KEEP** - Critical for production scalability

---

### 6. **Giscus** (Comments System)
**Status:** 🟡 CONFIGURED BUT OPTIONAL

**Usage:**
- 3 references in codebase
- GitHub Discussions-powered comments
- Only loads when configured
- Graceful degradation when disabled
- Theme-aware (light/dark mode)

**Files:**
```
├── src/components/features/comments/giscus-comments.tsx
├── src/components/features/comments/lazy-giscus-comments.tsx
└── src/lib/comments.ts
```

**Dependencies:**
```json
"@giscus/react": "^3.1.0"
```

**Configuration Required:**
```
NEXT_PUBLIC_GISCUS_REPO=
NEXT_PUBLIC_GISCUS_REPO_ID=
NEXT_PUBLIC_GISCUS_CATEGORY=
NEXT_PUBLIC_GISCUS_CATEGORY_ID=
```

**Cost:** Free (GitHub Discussions)

**Questions:**
- Are comments actively used on blog posts?
- Is there moderation overhead?
- Do you want to encourage community discussion?

**Recommendation:** 🤔 **EVALUATE**
- If not actively used: **REMOVE** to reduce complexity
- If desired for future: **KEEP** but ensure it's configured
- Current state: Appears configured but usage unclear

---

### 7. **Perplexity AI** (Research API)
**Status:** 🟢 JUST ADDED - READY TO USE

**Usage:**
- Just integrated today
- AI-powered research with citations
- `/api/research` endpoint
- 43 tests (100% passing)
- Rate limited (5 req/min)

**Files:**
```
├── src/lib/perplexity.ts                              [Client library]
├── src/app/api/research/route.ts                      [API endpoint]
├── src/__tests__/lib/perplexity.test.ts              [Unit tests]
└── src/__tests__/integration/api-research.test.ts    [Integration tests]
```

**Cost:** Paid API service (usage-based pricing)

**Questions:**
- What's the intended use case?
- Expected usage volume?
- Budget for API costs?

**Recommendation:** 🤔 **MONITOR**
- Track actual usage patterns
- Monitor API costs
- Consider usage limits if needed
- Well-implemented, ready for production

---

### 8. **Vercel** (Platform & Analytics)
**Status:** 🟢 BUILT-IN - PLATFORM

**Usage:**
- Hosting platform
- Analytics (auto-configured)
- Speed Insights (auto-configured)
- BotID for bot detection
- Environment variables
- Deployment infrastructure

**Dependencies:**
```json
"@vercel/analytics": "^1.5.3",
"@vercel/speed-insights": "^1.1.1",
"botid": "^1.0.2"
```

**Cost:** Included with Vercel hosting

**Recommendation:** ✅ **KEEP** - Platform dependency

---

### 9. **Vercel KV / Upstash** (Redis Backend)
**Status:** 🟢 ACTIVELY USED

**Note:** This is the backend for Redis (item #5 above)

**Cost:** Same as Redis analysis

**Recommendation:** ✅ **KEEP** - Same as Redis

---

### 10. **OpenTelemetry** (Observability)
**Status:** 🟡 CONFIGURED VIA SENTRY

**Usage:**
- Integrated via Sentry SDK
- Automatic tracing
- Performance monitoring
- Not directly used in codebase

**Recommendation:** ✅ **KEEP** - Part of Sentry integration

---

## MCP Servers Analysis

### 1. **Memory MCP**
**Status:** 🤔 UNCLEAR USAGE

**Purpose:** Store and retrieve context across sessions

**Config:**
```json
"Memory": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-memory"]
}
```

**Questions:**
- Is this actively used by Claude Code?
- What context is being stored?
- Is it necessary for development workflow?

**Recommendation:** 🧪 **EVALUATE**
- Test if removing impacts workflow
- Check Claude Code logs for usage
- Consider removing if not actively used

---

### 2. **Sequential Thinking MCP**
**Status:** 🤔 UNCLEAR USAGE

**Purpose:** Enable step-by-step reasoning

**Config:**
```json
"Thinking": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"]
}
```

**Questions:**
- How frequently is this invoked?
- Does it improve coding assistance?
- Is it worth the overhead?

**Recommendation:** 🧪 **EVALUATE**
- Claude Code has built-in reasoning
- May be redundant
- Test impact of removal

---

### 3. **Context7 MCP (Upstash)**
**Status:** ⚠️ POTENTIALLY REDUNDANT

**Purpose:** Long-term context storage

**Config:**
```json
"Context": {
  "command": "npx",
  "args": ["-y", "@upstash/context7-mcp@latest"]
}
```

**Analysis:**
- Uses Upstash (same as Redis)
- Provides long-term memory
- **OVERLAP:** Vercel MCP likely provides similar functionality
- May duplicate Vercel's context capabilities

**Recommendation:** ⚠️ **CONSIDER REMOVING**
- Vercel MCP already provides context management
- Reduces dependency on Upstash for MCP-specific features
- May simplify architecture

---

### 4. **Filesystem MCP**
**Status:** 🟢 ACTIVELY USED

**Purpose:** Read/write project files

**Config:**
```json
"Filesystem": {
  "command": "npx",
  "args": [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    "src/content/blog",
    "public/blog/images",
    "docs",
    "src/data"
  ]
}
```

**Analysis:**
- Essential for Claude Code to access files
- Scoped to specific directories (security)
- Used for blog content, docs, data files

**Recommendation:** ✅ **KEEP** - Essential for development

---

### 5. **GitHub MCP**
**Status:** 🟢 ACTIVELY USED

**Purpose:** GitHub API access for Claude Code

**Config:**
```json
"GitHub": {
  "type": "http",
  "url": "https://api.githubcopilot.com/mcp/"
}
```

**Analysis:**
- Official GitHub Copilot MCP
- Used for PR management, issue tracking
- Enhances development workflow

**Recommendation:** ✅ **KEEP** - Valuable for development

---

### 6. **Vercel MCP**
**Status:** 🟢 ASSUMED ACTIVE

**Purpose:** Vercel deployment and project management

**Config:**
```json
"Vercel": {
  "url": "https://mcp.vercel.com",
  "type": "http"
}
```

**Analysis:**
- Official Vercel MCP
- Deployment management
- Environment variables
- Build logs

**Recommendation:** ✅ **KEEP** - Essential for Vercel workflow

---

### 7. **Sentry MCP**
**Status:** 🟢 ACTIVELY USED

**Purpose:** Sentry issue management

**Config:**
```json
"Sentry": {
  "url": "https://mcp.sentry.dev/mcp/dcyfr-labs/cyberdrew-dev",
  "type": "http"
}
```

**Analysis:**
- Direct integration with Sentry project
- Issue tracking and debugging
- Error analysis

**Note:** URL appears to reference `cyberdrew-dev` project - verify this is correct

**Recommendation:** ✅ **KEEP** - Valuable for debugging

---

## Consolidation Opportunities

### High Priority

1. **Context7 MCP vs Vercel MCP**
   - **Issue:** Potential functional overlap
   - **Action:** Test if Vercel MCP provides sufficient context
   - **Benefit:** Reduce Upstash dependency for MCP
   - **Risk:** Low (can easily re-add)

2. **Giscus Comments System**
   - **Issue:** Configured but unclear if actively used
   - **Action:** Check if comments are enabled on blog posts
   - **Options:**
     - Remove if not used (saves dependency)
     - Keep if desired for community engagement
   - **Benefit:** Reduce bundle size if removed

### Medium Priority

3. **Memory & Sequential Thinking MCPs**
   - **Issue:** Unclear usage, may be redundant
   - **Action:** Monitor Claude Code logs for usage
   - **Benefit:** Cleaner MCP configuration
   - **Risk:** Low (can re-enable if needed)

### Low Priority

4. **Vercel Analytics vs Custom Analytics**
   - **Current:** Both Vercel Analytics AND custom Redis analytics
   - **Note:** Serving different purposes
   - **Action:** No change needed (complementary systems)

---

## Cost Analysis

### Monthly Recurring

| Service | Tier | Cost | Usage |
|---------|------|------|-------|
| Sentry | Team | ~$26/month | Error tracking, 50K events |
| Inngest | Free/Hobby | $0-20/month | Background jobs |
| Resend | Free/Pro | $0-20/month | 3K+ emails/month |
| Upstash Redis | Free | $0 | 10K commands/day |
| Perplexity AI | Pay-as-go | Variable | NEW - Monitor usage |
| Vercel | Hobby/Pro | $0-20/month | Hosting |
| **TOTAL** | | **~$50-100/month** | |

### Free Services

- GitHub API (with rate limits)
- Giscus (GitHub Discussions)
- Vercel Analytics (included)
- All MCP servers (open source)

---

## Recommendations Summary

### ✅ Keep (Essential)

1. **Sentry** - Error tracking is critical
2. **Inngest** - Core async infrastructure
3. **Resend** - Contact form functionality
4. **GitHub API** - Portfolio feature
5. **Redis/Upstash** - Scalability & performance
6. **Vercel Platform** - Hosting dependency
7. **Filesystem MCP** - Development essential
8. **GitHub MCP** - Development workflow
9. **Vercel MCP** - Deployment management
10. **Sentry MCP** - Debugging workflow

### 🤔 Evaluate & Test

1. **Giscus Comments** (3 refs)
   - Check if actively used
   - Consider removing if not needed
   - Saves ~50KB in bundle

2. **Context7 MCP**
   - Test overlap with Vercel MCP
   - Consider consolidating

3. **Memory MCP**
   - Monitor usage
   - May be redundant

4. **Sequential Thinking MCP**
   - Monitor usage
   - Claude has built-in reasoning

### 🆕 Monitor

1. **Perplexity AI**
   - Track API usage and costs
   - Evaluate ROI after 30 days
   - Consider usage caps

---

## Action Items

### Immediate (This Week)

- [ ] Check Sentry MCP URL (references `cyberdrew-dev` - should be `dcyfr-labs`?)
- [ ] Verify Giscus configuration status
- [ ] Review Giscus usage in analytics (are people commenting?)
- [ ] Document Perplexity AI use case and expected volume

### Short Term (2-4 Weeks)

- [ ] Monitor Perplexity API costs
- [ ] Test Context7 MCP removal (compare with Vercel MCP)
- [ ] Review Memory & Thinking MCP logs for usage
- [ ] Consider Giscus removal if not actively used

### Long Term (1-3 Months)

- [ ] Evaluate Perplexity ROI
- [ ] Review Inngest usage and tier
- [ ] Optimize Sentry sampling rates if needed
- [ ] Consider Redis upgrade if hitting limits

---

## Integration Map

```
┌─────────────────────────────────────────────────────┐
│                   Production App                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐        │
│  │ Next.js  │  │  Vercel  │  │   Sentry  │        │
│  │  App     │──┤ Platform │──┤   Error   │        │
│  │          │  │          │  │ Tracking  │        │
│  └────┬─────┘  └──────────┘  └───────────┘        │
│       │                                             │
│       ├─────┬──────────┬──────────┬──────────┐    │
│       │     │          │          │          │     │
│       │     │          │          │          │     │
│   ┌───▼─┐ ┌─▼──┐  ┌───▼───┐  ┌──▼───┐  ┌──▼──┐  │
│   │Redis│ │Inn-│  │GitHub│  │Resend│  │Perp-│  │
│   │/KV  │ │gest│  │ API  │  │Email │  │lexity│ │
│   └─────┘ └────┘  └──────┘  └──────┘  └─────┘  │
│   Views   Async   Heatmap   Contact   Research  │
│   Counts  Jobs    Data      Form                 │
│                                                   │
└───────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              Development (MCP Servers)              │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  GitHub  │  │  Vercel  │  │  Sentry  │         │
│  │   MCP    │  │   MCP    │  │   MCP    │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │Filesystem│  │ Context7 │  │  Memory  │         │
│  │   MCP    │  │   MCP    │  │   MCP    │         │
│  └──────────┘  └──────────┘  └──────────┘         │
│                   ↑ Evaluate      ↑ Evaluate       │
│                                                      │
│  ┌──────────┐                                       │
│  │Sequential│                                       │
│  │ Thinking │                                       │
│  └──────────┘                                       │
│      ↑ Evaluate                                     │
└─────────────────────────────────────────────────────┘
```

---

## Conclusion

Your third-party integrations are generally well-chosen and serve clear purposes. The main opportunities for consolidation are:

1. **Giscus** - Low usage, consider removing if comments aren't active
2. **Context7 MCP** - Potential overlap with Vercel MCP
3. **Memory/Thinking MCPs** - Usage unclear, may be redundant

The new **Perplexity AI** integration is well-implemented and ready for production, but monitor costs carefully.

Overall, your stack is lean and purposeful. Focus on the evaluation items above rather than major changes.

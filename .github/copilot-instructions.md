# AI Contributor Guide

Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui + MDX portfolio. 
**Status:** Maintenance mode (1339/1346 tests passing, 99.5%)

## Quick Reference

| Task | Command |
|------|---------|
| Develop | `npm run dev` |
| Build | `npm run build` |
| Test | `npm run test` (unit) / `npm run test:e2e` (E2E) |
| Lint | `npm run lint` / `npm run lint:fix` |
| Typecheck | `npm run typecheck` |
| Check All | `npm run check` |

**Import alias:** Always use `@/*` (never relative paths)

## Architecture & Data Flow

```
src/
├── app/                   # App Router (server-first)
├── components/            # Organized by domain + barrel exports
│   ├── layouts/           # PageLayout, ArchiveLayout, ArticleLayout
│   ├── blog/              # Blog-specific (barrel: index.ts)
│   ├── common/            # Shared (barrel: index.ts)
│   ├── navigation/        # Headers/footers (barrel: index.ts)
│   └── ui/                # shadcn/ui primitives
├── data/                  # Typed content (posts.ts, projects.ts, resume.ts)
├── lib/                   # Utilities + metadata.ts + design-tokens.ts
├── content/blog/          # MDX posts (auto-published)
└── inngest/               # Background jobs (view tracking, analytics)
```

### Key Data Flows

**Blog System:**
- MDX posts in `src/content/blog/` → parsed via `next-mdx-remote`
- Metadata from `src/data/posts.ts` (title, date, tags, image)
- Rendered via `ArticleLayout` + `createArticlePageMetadata()`
- View tracking: API call → `inngest.send()` → `trackPostView` job → Redis

**Metadata Generation:**
- Standard pages: `createPageMetadata({ title, description, path })`
- List pages: `createArchivePageMetadata({ title, itemCount })`
- Article pages: `createArticlePageMetadata({ title, tags, publishedAt, image })`
- All export OpenGraph, Twitter, and structured data

**Background Jobs (Inngest):**
- `trackPostView` - Records analytics when post viewed
- `handleMilestone` - Milestone detection (1K, 10K views)
- `calculateTrending` - Daily trending posts calculation
- `dailyAnalyticsSummary` - Scheduled daily summary job

## Component Patterns (MANDATORY)

### Imports: Barrel Files Only

```typescript
// ✅ CORRECT
import { PostList, BlogFilters } from "@/components/blog";
import { SiteHeader, SiteFooter } from "@/components/navigation";
import { PageLayout, ArticleLayout } from "@/components/layouts";

// ❌ WRONG - never import from root or specific files
import PostList from "@/components/blog/post-list";
```

### Layout Usage (PageLayout dominates 90% of pages)

**PageLayout** - Use for 90% of pages (all main routes)
- Standard pages (homepage, about, work, resume, contact)
- Default choice unless you have a specific reason not to

```typescript
export const metadata = createPageMetadata({...});

export default function HomePage() {
  return (
    <PageLayout>
      {/* content */}
    </PageLayout>
  );
}
```

**ArticleLayout** - ONLY for blog posts (`src/app/blog/[slug]/page.tsx`)
- Includes: reading time, table of contents, related posts, metadata
- Used in exactly 1 page; highly specialized

```typescript
export const metadata = createArticlePageMetadata({...});

export default function BlogPost({ post }) {
  return (
    <ArticleLayout post={post}>
      {/* blog content */}
    </ArticleLayout>
  );
}
```

**ArchiveLayout** - ONLY for filterable list pages
- Includes: filters, pagination, sorting, item count
- Use for blog archive, project listing, or similar filtered lists

```typescript
export const metadata = createArchivePageMetadata({...});

export default function BlogArchive() {
  return (
    <ArchiveLayout posts={posts}>
      {/* archive content */}
    </ArchiveLayout>
  );
}
```

**Rule: If unsure, use PageLayout. It's the default choice for 80% of pages.**

## Design Tokens (MANDATORY)

**Current compliance: 92% across all components** ✅

Never hardcode spacing, typography, or colors:

```typescript
import { SPACING, TYPOGRAPHY, HOVER_EFFECTS } from "@/lib/design-tokens";

// ✅ Use tokens
<div className={`gap-${SPACING.content}`}>
  <h1 className={TYPOGRAPHY.h1.standard}>Title</h1>
</div>

// ❌ Never hardcode
<div className="gap-8 p-6">
  <h1 className="text-3xl font-semibold">Title</h1>
</div>
```

**Enforcement:**
- ESLint warnings (real-time)
- Pre-commit hooks prevent commits
- CI validation + PR reports
- Run: `node scripts/validate-design-tokens.mjs`

**Why strict?** Design tokens are the source of truth for spacing consistency, typography hierarchy, color theming (light/dark modes), and responsive breakpoints.

## API Route Patterns

All POST routes follow this standard pattern to maintain consistency:

```typescript
// 1. Validate input
// 2. Process request  
// 3. Trigger async job with inngest.send()
// 4. Return response immediately

export async function POST(request: NextRequest) {
  const { data } = await request.json();
  
  // Validate
  if (!data) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }
  
  // Process
  const result = await processRequest(data);
  
  // Queue async work (don't wait for it)
  await inngest.send({
    name: "event-name",
    data: result,
  });
  
  // Respond immediately (<100ms)
  return NextResponse.json({ success: true });
}
```

**Most common POST endpoints:**
- `/api/contact` - Form submissions (triggers email + analytics)
- `/api/views` - Track blog post views (triggers Inngest job for trending)
- `/api/shares` - Track social shares (triggers analytics)

**Why this pattern?** Fire-and-forget responses are fast (<100ms) while background jobs handle side effects asynchronously via Inngest.

## Background Job Patterns (Inngest)

**Most common pattern: inngest.send() from API routes**

```typescript
// In src/app/api/views/route.ts
await inngest.send({
  name: "blog/post.viewed",  // Event name convention
  data: { slug, title },
});
```

This triggers the `trackPostView` function in `src/inngest/blog-functions.ts`, which:
1. Increments view count in Redis
2. Triggers `handleMilestone` if views hit 1K/10K
3. Updates trending calculations

**When to use inngest.send():**
- Any async side effect that shouldn't block the response
- Analytics, notifications, email sending
- Third-party API calls
- Data processing or transformations

**Inside functions, use step.run() for multi-step workflows:**

```typescript
export const trackPostView = inngest.createFunction(
  { id: "track-post-view" },
  { event: "blog/post.viewed" },
  async ({ event, step }) => {
    // Step 1: Increment views
    const views = await step.run("increment-views", async () => {
      return await redis.incr(`views:post:${event.data.slug}`);
    });
    
    // Step 2: Trigger cascade if milestone reached
    if (views === 1000) {
      await step.send({
        name: "blog/post.milestone",
        data: { slug: event.data.slug, milestone: "1000" },
      });
    }
  }
);
```

**Common job types found in codebase:**
- `trackPostView` - API-triggered (most common: view tracking)
- `handleMilestone` - Event-triggered cascade (milestone detection)
- `calculateTrending` - Scheduled daily (trending posts)
- `dailyAnalyticsSummary` - Scheduled daily (email summary)

## Error Handling

**Rule: Only wrap high-risk components, not everything.**

Use custom ErrorBoundary ONLY for:
- External API calls (GitHub API, external data sources)
- Form submissions (user input, validation)
- Expensive computations

**Examples in codebase:**

```typescript
// In src/app/about/page.tsx
<GitHubHeatmapErrorBoundary>
  <GitHubHeatmap userId="dcyfr" />
</GitHubHeatmapErrorBoundary>

// In src/app/contact/page.tsx
<ContactFormErrorBoundary>
  <ContactForm />
</ContactFormErrorBoundary>
```

**Don't wrap:**
- Standard text content
- Static layouts
- List pages
- Components without external dependencies

Default error handling (root layout) covers most cases. Only add boundaries when there's real risk of runtime failure.

## Testing Strategy

**Test Structure:**
- `src/__tests__/` - Unit tests (component logic, utilities)
- `tests/integration/` - Integration tests (API, data flow)
- `e2e/` - E2E tests (Playwright, critical user paths)

**Commands:**
- `npm run test` - Watch mode
- `npm run test:unit` - Unit tests only
- `npm run test:coverage` - Coverage report
- `npm run test:e2e` - Playwright (production build)
- `npm run test:e2e:dev` - Playwright (dev server)

**Minimum Coverage:** ≥94% (currently 99.5%)

## CI/CD Requirements

**All PRs must pass:**
- ESLint (0 errors, --fix if needed)
- TypeScript (strict mode)
- Tests ≥99% pass rate
- Lighthouse: ≥90% perf, ≥95% a11y

## Constraints (Do NOT change without discussion)

- Import alias (`@/*`)
- Tailwind + shadcn/ui
- Server-first architecture (React Server Components default)
- Design token system
- MDX pipeline (rehype/remark plugins)
- Background job architecture (Inngest)

## Detailed Documentation

| Topic | File |
|-------|------|
| Design system validation | `docs/ai/DESIGN_SYSTEM.md` |
| Best practices & workflows | `docs/ai/BEST_PRACTICES.md` |
| Token optimization | `docs/ai/OPTIMIZATION_STRATEGY.md` |
| Operations & priorities | `docs/operations/todo.md` |
| Architecture decisions | `docs/architecture/` |

## Quick Fixes

**For immediate productivity:**
1. Check priorities: `cat docs/operations/todo.md`
2. Verify tests pass: `npm run test`
3. Review recent commits: `git log --oneline -5`
4. Search patterns before implementing: Use grep/glob
5. Use barrel imports from `components/` subdirectories

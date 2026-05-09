<!-- TLP:CLEAR -->

# Operations TODO

**Last Updated:** February 5, 2026
**Status:** Maintenance Mode - Incremental Feature Development
**Health:** Tests 3014/3087 passing (97.6%), 0 TypeScript errors, 0 ESLint errors
**Versioning:** Calendar Versioning (YYYY.MM.DD)
**Archive:** Full history at `docs/operations/private/todo-archive-2026-02-02.md`

---

## Current Priorities

| #   | Task                               | Priority | Effort    | Status                    |
| --- | ---------------------------------- | -------- | --------- | ------------------------- |
| 1   | RIVET Blog Post Rollout (Tier 2)   | High     | 4-6h      | ✅ Complete (Feb 5, 2026) |
| 2   | GitHub Webhook Deployment          | High     | 1h        | ✅ Complete (Feb 5, 2026) |
| 3   | Stage 7: Trending Technologies tab | Medium   | 4-6h      | ✅ Complete (Feb 5, 2026) |
| 4   | Social Media Phase 2 Dashboard     | Medium   | 2-3 weeks | Q2 2026                   |
| 5   | SOC2 Commercial Platform           | Medium   | 2-4 weeks | Q2 2026                   |
| 6   | API Documentation (Swagger)        | Medium   | 2-3 weeks | Q2 2026                   |
| 7   | Web Link Library                   | Medium   | 2-3 weeks | Q2 2026                   |

---

## Active Work

### RIVET Blog Post Rollout

Apply P0/P1/P2 RIVET components to existing blog posts. Components are built and tested (462 tests passing).

**Tier 1 (Full RIVET - 4 posts): ✅ COMPLETE (Jan 18, 2026)**

- [x] OWASP Top 10 for Agentic AI (36 components)
- [x] CVE-2025-55182 React2Shell (31 components)
- [x] Node.js January 2026 Security Release (26 components)
- [x] Hardening a Developer Portfolio (22 components)

**Tier 2 (Core RIVET - 5 posts):** Missing TLDRSummary, KeyTakeaway, RoleBasedCTA

- [x] Building Event-Driven Architecture (575 lines) - Full P0+P1 (20 components)
- [x] Passing CompTIA Security+ (233 lines) - Full P0+P1 (17 components)
- [x] Building with AI (390 lines) - Full P0+P1 (19 components)
- [x] Demo: UI Elements (596 lines) - Full P0+P1 (TLDRSummary, RoleBasedCTA×2, KeyTakeaway×3, SectionShare×2, CollapsibleSection, GlossaryTooltip×2)
- [x] Demo: Code Syntax (880 lines) - Full P0+P1 (TLDRSummary, RoleBasedCTA×2, KeyTakeaway×2, SectionShare×4, CollapsibleSection, GlossaryTooltip×3)

**Tier 3 (Light RIVET - 4 posts):** Shipping Portfolio, Demo Diagrams, Demo LaTeX Math, Demo Markdown

### GitHub Webhook Deployment

✅ **Complete** (February 5, 2026) - Webhook configured and verified.

- [x] `GITHUB_WEBHOOK_SECRET` set in Vercel production (Jan 28)
- [x] Webhook configured in dcyfr/dcyfr-labs repository (hook ID: 587941184)
  - Payload URL: `https://www.dcyfr.ai/api/github/webhook`
  - Content type: `application/json`, Events: `push` only
- [x] Ping test: 200 OK
- [x] Push test: 200 OK (6 commits processed via Inngest)
- [x] Duplicate webhook removed (hook 594963680)

### Stage 7: Unified Trending Section (Remaining)

Phase 1 (Consolidation) and Phase 2 (Projects) complete. Remaining:

- [ ] **Trending Technologies tab** - Aggregate tech stack mentions, calculate scores, new panel
- [ ] **Trending Series tab** (low priority) - Series engagement scores, completion rates
- [ ] **Time Period Selector** (low priority) - Week/Month/All Time toggle
- [ ] **Trending Indicators** (low priority) - Visual badges for trending velocity

---

## Code-Level TODOs (Technical Debt)

### High Priority

- [x] `src/lib/storage-adapter.ts:142` - ✅ OAuth integration complete (Feb 5, 2026)
  - Created `/api/user/engagement/[key]` endpoints (GET, POST, DELETE, HEAD)
  - Implemented ApiStorageAdapter with Bearer token authentication
  - Server-backed persistence using Redis (90-day expiration)
  - Tests: 11/11 passing for bookmark sync functionality
- [x] `src/lib/activity/bookmarks.ts:510` - ✅ Server-side bookmark sync complete (Feb 5, 2026)
  - Implemented `syncBookmarksWithServer()` with auth support
  - Implemented `loadBookmarksFromServer()` for cross-device sync
  - Implemented `mergeBookmarkCollections()` for conflict resolution
  - Uses storage adapter pattern for authenticated users
- [ ] ~`src/components/layouts/article-header.tsx:190` - Re-enable holo effects~ (Won't fix - Feb 5, 2026)

### Medium Priority

- [ ] `src/components/analytics/social-metrics.tsx:65` - Fetch actual referral counts per post
- [ ] `src/lib/analytics-integration.ts:377` - Google Analytics Data API
- [ ] `src/lib/analytics-integration.ts:423` - Google Search Console API
- [ ] `src/lib/activity/sources.server.ts:128` - Reading completion tracking
- [ ] `src/lib/activity/sources.server.ts:564` - Shares tracking
- [ ] `src/lib/activity/trending.ts:174` - Real metric aggregation
- [ ] `src/components/projects/layouts/default-project-layout.tsx:167` - Tech Stack Badges
- [ ] `src/components/projects/layouts/default-project-layout.tsx:169` - Tag Badges

### Low Priority

- [ ] `src/inngest/session-management.ts:114` - Monitoring/alerting integration
- [ ] `src/inngest/session-management.ts:152` - Production audit trail logging

---

## Test Improvements

### Tests Needing Updates (Refactored Code)

All 8 test files updated and passing (February 5, 2026):

- [x] `github-data.test.ts` - Already passing (mocks current)
- [x] `post-badges.test.ts` - Already passing (mocks current)
- [x] `error-handler.test.ts` - Already passing (mocks current)
- [x] `error-scenarios.test.ts` - Fixed: mock path `@/lib/views` → `@/lib/views.server`, removed `describe.skip`
- [x] `api-analytics.test.ts` - Fixed: mock path `@/lib/views` → `@/lib/views.server`, updated redis mock to Upstash singleton, removed `describe.skip`
- [x] `api-views.test.ts` - Already passing (mocks current)
- [x] `feeds.test.tsx` - Already passing (mocks current)
- [x] `activity-threading.test.ts` - Fixed: deterministic test data to avoid `MAX_DAYS_APART` boundary flakiness

### Deferred E2E Tests

Low priority - unit/integration tests provide sufficient coverage:

- Heatmap export interactions
- Virtual scrolling performance (5000+ items)
- Bookmark management flow
- Embed iframe cross-site testing

---

## Manual Validation Pending

- [ ] RSS feed: W3C Feed Validator + feed reader testing (Feedly, Inoreader)
- [ ] Activity embeds: Test on Medium, Notion, WordPress
- [ ] Lighthouse CI on RIVET components (target: perf >= 90, a11y >= 95)

---

## Ongoing Maintenance

### Weekly

- [ ] Review Dependabot PRs (auto-merge enabled)
- [ ] Monitor Lighthouse CI reports
- [ ] Check CodeQL security alerts

### Monthly

- [ ] Review and archive completed features
- [ ] Analyze activity feed engagement metrics

### Quarterly

- [ ] Comprehensive performance audit
- [ ] Update documentation
- [ ] Review filter presets

---

## Backlog (Q2+ 2026)

### SOC2 Commercial Platform

- Current: Phase 3 complete (automated audits, 15 controls)
- Target: Vanta or Secureframe (50+ controls, full audit support)

### Social Media Phase 2

- Content management dashboard at `/dev/social-media`
- Multi-platform composer, scheduling, analytics

### API Documentation (Swagger/OpenAPI)

- Interactive docs at `/dev/api-docs`
- Auto-generated from TypeScript types

### Web Link Library

- Curated link collection at `/links`
- Categories, submission, curation, discovery

### Invite Claim Tracking

- Add click tracking to `/invites` page
- Capture which invite links are claimed
- Store claim metadata (timestamp, source, user agent)
- Dashboard metrics for invite redemption rates

### Randomize Recommended Blog Posts

- Randomize blog post recommendations at bottom of like/bookmark pages
- Improve discovery and engagement by varying recommendations
- Update recommendation algorithm to include randomization factor
- Track which posts are shown to measure engagement impact

### Mobile Experience

- Consolidate FAB icons into mobile footer menu

### Other

- Design system component library
- Blog comment system
- Project case study templates
- Interactive portfolio timeline
- Framer Motion to CSS conversion (bundle optimization)

---

**Full backlog history and completed work:** `docs/operations/private/todo-archive-2026-02-02.md`

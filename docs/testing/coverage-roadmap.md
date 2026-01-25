{/* TLP:CLEAR */}

# Test Coverage Roadmap

**Goal**: Achieve 80% test coverage incrementally through strategic, high-ROI testing

**Current Status**: 0.63% coverage (19 tests passing)  
**Target**: 80% lines/functions/statements, 75% branches  
**Timeline**: 3 phases over 6-8 weeks

---

## Current State Analysis (Nov 15, 2025)

### ✅ Tested (100% coverage)

- `lib/utils.ts` - Class name utilities (7 tests)

### 🟡 Partially Tested (33% coverage)

- `lib/blog.ts` - Post processing (12 tests, pure functions only)

### ❌ Untested (0% coverage)

**High-Priority Lib Files** (infrastructure, business logic):

- `lib/metadata.ts` - SEO/Open Graph generation
- `lib/rate-limit.ts` - Rate limiting logic
- `lib/analytics.ts` - Analytics tracking
- `lib/feeds.ts` - RSS/Atom feed generation
- `lib/json-ld.ts` - Structured data
- `lib/related-posts.ts` - Post recommendation
- `lib/anti-spam.ts` - Spam detection
- `lib/shares.ts` - Share count tracking
- `lib/views.ts` - View count tracking
- `lib/toc.ts` - Table of contents generation
- `lib/post-badges.ts` - Badge generation
- `lib/design-tokens.ts` - Design system constants

**API Routes** (excluded from coverage but need integration tests):

- Contact form, analytics, GitHub contributions
- Rate limiting middleware

**Components** (UI testing, lower priority):

- Filters, navigation, interactive elements

---

## Phase 1: Foundation (Weeks 1-2) - Target 25% Coverage

**Focus**: Critical business logic, infrastructure, highest ROI

### Week 1: Core Utilities (8-10 hours)

#### 1. `lib/metadata.ts` Testing (2-3 hours)

**Priority**: 🚨 CRITICAL - Powers all SEO  
**Lines of Code**: ~400  
**Coverage Impact**: +5-7%

**Test Cases**:
- `createPageMetadata()` - Standard page meta tags
  - Basic metadata (title, description, og tags)
  - URL canonicalization
  - Twitter card generation
  - Image fallbacks
- `createArchivePageMetadata()` - List pages
  - Pagination URLs
  - Collection-specific meta
- `createArticlePageMetadata()` - Blog posts
  - Article schema
  - Author/publish date
  - Image handling
- `createCollectionSchema()` - JSON-LD structured data
  - Schema.org markup
  - Breadcrumbs
  - Sitelinks search box

**Validation**: Run against 10 sample pages, verify schema in Google Rich Results Test

---

#### 2. `lib/rate-limit.ts` Testing (2 hours)
**Priority**: 🔴 HIGH - Security/reliability  
**Lines of Code**: ~250  
**Coverage Impact**: +3-4%

**Test Cases**:
- Redis rate limiter with mock Redis client
  - Token bucket algorithm
  - Per-IP limiting
  - Window expiration
  - Success/failure responses
- In-memory fallback when Redis unavailable
  - LRU cache behavior
  - TTL expiration
  - Concurrent request handling
- Edge cases:
  - Redis connection failure
  - Invalid IP addresses
  - Clock drift

**Validation**: Load test with 100 concurrent requests, verify rate limits enforced

---

#### 3. `lib/feeds.ts` Testing (2-3 hours)
**Priority**: 🟡 MEDIUM - Content distribution  
**Lines of Code**: ~360  
**Coverage Impact**: +4-6%

**Test Cases**:
- `generateRSSFeed()` - RSS 2.0 XML generation
  - Valid RSS structure
  - Post metadata (author, date, categories)
  - Content sanitization
  - Image handling
- `generateAtomFeed()` - Atom 1.0 XML generation
  - Valid Atom structure
  - Self/alternate links
  - Updated timestamps
- `generateJSONFeed()` - JSON Feed 1.1
  - Valid JSON structure
  - Attachment handling
- XML validation and escaping

**Validation**: Validate feeds with w3c feed validator, test in RSS readers

---

#### 4. `lib/json-ld.ts` Testing (1-2 hours)
**Priority**: 🟡 MEDIUM - SEO enhancement  
**Lines of Code**: ~220  
**Coverage Impact**: +2-3%

**Test Cases**:
- `generateWebsiteSchema()` - Organization/website schema
- `generateBlogPostSchema()` - Article schema
  - Author information
  - Publish/modified dates
  - Image/headline
- `generateBreadcrumbSchema()` - Navigation breadcrumbs
- Schema validation against Schema.org spec

**Validation**: Test in Google Rich Results Test, verify structured data dashboard

---

### Week 2: Content & Analytics (6-8 hours)

#### 5. `lib/blog.ts` - Complete Coverage (2 hours)
**Priority**: 🔴 HIGH - Core feature  
**Current Coverage**: 33%  
**Target Coverage**: 90%+  
**Coverage Impact**: +3-4%

**Additional Test Cases** (beyond existing 12 tests):
- `getAllPosts()` - File system integration
  - Mock fs.readdirSync/readFileSync
  - Draft filtering in production
  - Sorting by date
  - Empty directory handling
- `getPostBySlug()` - Individual post loading
  - Valid/invalid slugs
  - File reading errors
- `generatePostId()` - ID generation
  - Deterministic output
  - Collision resistance
- `calculateReadingTime()` - Word count
  - Code block exclusion
  - HTML tag stripping
  - Edge cases (empty content, very long posts)

**Validation**: Test against 20+ real blog posts

---

#### 6. `lib/related-posts.ts` Testing (1-2 hours)
**Priority**: 🟢 LOW - Content discovery  
**Lines of Code**: ~40  
**Coverage Impact**: +1%

**Test Cases**:
- Tag-based similarity scoring
- Excluding current post
- Sorting by relevance
- Maximum results limiting
- Empty/no-match cases

---

#### 7. `lib/toc.ts` Testing (1 hour)
**Priority**: 🟢 LOW - UX enhancement  
**Lines of Code**: ~50  
**Coverage Impact**: +1%

**Test Cases**:
- Heading extraction from MDX
- Nested heading hierarchy
- Slug generation for anchors
- Empty content handling

---

#### 8. `lib/post-badges.ts` Testing (1 hour)
**Priority**: 🟢 LOW - Visual polish  
**Lines of Code**: ~20  
**Coverage Impact**: +0.5%

**Test Cases**:
- Badge generation based on post metadata
- Featured/draft/archived badges
- Reading time badges
- Conditional rendering

---

**Phase 1 Deliverables**:
- ✅ 8 new test files created
- ✅ ~50-80 new test cases
- ✅ Coverage increased from 0.63% → 25%
- ✅ All critical business logic tested
- ✅ CI/CD gates enabled

---

## Phase 2: Depth (Weeks 3-4) - Target 50% Coverage

**Focus**: Component logic, hooks, remaining lib files

### Week 3: Component Logic (8-10 hours)

#### 9. Component Utilities Testing (3-4 hours)
**Files**:
- `components/mdx.tsx` - MDX component mapping
- `components/mermaid.tsx` - Diagram rendering
- Filter/search components (blog-filters, archive-filters)

**Test Cases**:
- MDX component registration
- Syntax highlighting theme switching
- Mermaid diagram parsing
- Filter state management
- Search query handling
- URL param synchronization

---

#### 10. Layout Components Testing (2-3 hours)
**Files**:
- `components/layouts/page-layout.tsx`
- `components/layouts/archive-layout.tsx`
- `components/layouts/article-layout.tsx`

**Test Cases**:
- Layout composition
- Responsive breakpoints
- Design token application
- Conditional rendering
- Error boundaries

---

#### 11. Analytics Components Testing (2-3 hours)
**Files**:
- `lib/analytics.ts` - Core analytics logic
- `components/blog-analytics.tsx`
- `components/view-tracker.tsx`

**Test Cases** (with MSW for API mocking):
- View tracking (debouncing, error handling)
- Share tracking
- Analytics aggregation
- Redis integration (mocked)
- Fallback to in-memory storage

---

### Week 4: Hooks & Data Layer (6-8 hours)

#### 12. Custom Hooks Testing (3-4 hours)
**Files**:
- `hooks/use-view-tracking.ts`
- `hooks/use-analytics.ts`
- `hooks/use-fab-animation.ts`
- `hooks/use-reduced-motion.ts`

**Test Cases** (with @testing-library/react-hooks):
- Hook state management
- Effect cleanup
- Debouncing/throttling
- Local storage integration
- Event listeners

---

#### 13. Data Layer Testing (2-3 hours)
**Files**:
- `data/projects.ts`
- `data/resume.ts`
- `data/socials.ts`

**Test Cases**:
- Data structure validation
- Type safety
- Computed properties
- Data transformations

---

#### 14. Remaining Lib Files (1-2 hours)
**Files**:
- `lib/anti-spam.ts` - Spam detection
- `lib/shares.ts` - Share tracking
- `lib/views.ts` - View tracking
- `lib/design-tokens.ts` - Token exports

**Test Cases**:
- Spam detection patterns
- Rate limiting integration
- Redis operations (mocked)
- Token value exports

---

**Phase 2 Deliverables**:
- ✅ 15+ additional test files
- ✅ ~80-120 new test cases
- ✅ Coverage increased from 25% → 50%
- ✅ Component logic validated
- ✅ Hook behavior verified

---

## Phase 3: Excellence (Weeks 5-8) - Target 80% Coverage

**Focus**: Integration tests, edge cases, API routes

### Week 5-6: Integration Tests (10-12 hours)

#### 15. API Route Integration Tests (4-5 hours)
**Routes** (not in coverage, but need testing):
- `/api/contact` - Form submission + Inngest
- `/api/analytics` - Analytics endpoints
- `/api/views` - View counting
- `/api/shares` - Share counting
- `/api/github-contributions` - GitHub API integration
- `/api/health` - Health check

**Test Strategy**:
- Mock Inngest client
- Mock Redis client
- Mock GitHub API
- Test rate limiting
- Test error handling
- Test validation

---

#### 16. Blog System Integration (3-4 hours)
**Scenarios**:
- Full post lifecycle (create → publish → update → archive)
- Search and filtering
- Pagination
- Related posts
- View counting
- RSS feed generation
- Sitemap generation

**Test Data**: 50+ mock blog posts with varied metadata

---

#### 17. Authentication & Security (2-3 hours)
**Tests**:
- CSP nonce generation (in proxy.ts)
- Rate limiting across routes
- Input validation
- XSS prevention
- Error boundary behavior

---

### Week 7-8: Edge Cases & Polish (8-10 hours)

#### 18. Error Scenarios (3-4 hours)
**Test Cases**:
- Network failures
- Redis unavailable
- GitHub API rate limits
- Malformed MDX files
- Missing images
- Invalid frontmatter
- Concurrent request handling

---

#### 19. Performance Tests (2-3 hours)
**Benchmarks**:
- Blog post parsing (< 100ms per post)
- RSS feed generation (< 500ms for 100 posts)
- Related posts algorithm (< 50ms)
- Metadata generation (< 10ms)

---

#### 20. Accessibility Tests (2-3 hours)
**Component Testing**:
- Keyboard navigation
- ARIA attributes
- Focus management
- Screen reader announcements
- Skip links
- Form validation messages

---

**Phase 3 Deliverables**:
- ✅ 20+ integration test scenarios
- ✅ ~100+ additional test cases
- ✅ Coverage increased from 50% → 80%
- ✅ All edge cases covered
- ✅ Performance benchmarks established

---

## Testing Best Practices

### Test Organization
```
src/__tests__/
├── lib/                    # Unit tests for lib files
│   ├── blog.test.ts
│   ├── metadata.test.ts
│   └── rate-limit.test.ts
├── components/             # Component tests
│   ├── blog-filters.test.tsx
│   └── mdx.test.tsx
├── hooks/                  # Hook tests
│   └── use-view-tracking.test.ts
└── integration/            # Integration tests
    ├── blog-system.test.ts
    └── api-routes.test.ts

tests/                      # Shared test utilities
├── setup/
│   ├── vitest.setup.ts
│   └── test-utils.tsx
└── mocks/
    ├── redis.ts
    ├── inngest.ts
    └── github.ts

e2e/                        # Playwright E2E tests
├── blog.spec.ts
└── homepage.spec.ts
```

### Mocking Strategy
```typescript
// Mock Redis
vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
  }
}))

// Mock Inngest
vi.mock('@/inngest/client', () => ({
  inngest: {
    send: vi.fn(() => Promise.resolve({ ids: ['test-id'] }))
  }
}))

// Mock file system
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(() => true),
    readdirSync: vi.fn(() => ['post1.mdx', 'post2.mdx']),
    readFileSync: vi.fn(() => 'mock content')
  }
}))
```

### Test Data Management
- **Fixtures**: Store in `tests/fixtures/` for reusable test data
- **Factories**: Create helper functions for generating mock data
- **Snapshots**: Use for complex output validation (feeds, schemas)

### CI/CD Integration
```yaml
# .github/workflows/test.yml
- name: Run unit tests
  run: npm run test

- name: Run coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3

- name: Run E2E tests
  run: npm run test:e2e
```

---

## Coverage Milestones

| Phase | Week | Target | Focus | Est. Hours |
|-------|------|--------|-------|------------|
| Setup | 0 | 0.63% | Infrastructure | ✅ Complete |
| Phase 1 | 1-2 | 25% | Critical business logic | 14-18h |
| Phase 2 | 3-4 | 50% | Components & hooks | 14-18h |
| Phase 3 | 5-8 | 80% | Integration & edge cases | 18-22h |
| **Total** | **8 weeks** | **80%** | **Production-ready** | **46-58h** |

---

## Success Metrics

### Quantitative
- ✅ Coverage: 80% lines, 80% functions, 75% branches, 80% statements
- ✅ Test count: 200+ tests passing
- ✅ Performance: All tests run in < 30 seconds
- ✅ CI/CD: Tests pass on every commit

### Qualitative
- ✅ Confidence in refactoring
- ✅ Regression prevention
- ✅ Documentation through tests
- ✅ Faster debugging
- ✅ Code quality enforcement

---

## Maintenance Strategy

### Weekly
- Run `npm run test:coverage` before each PR
- Review failing tests immediately
- Add tests for new features

### Monthly
- Review coverage trends
- Identify untested code paths
- Update test data fixtures

### Quarterly
- Refactor test suite for speed
- Update mocking strategies
- Review flaky tests

---

## Tools & Resources

### Testing Libraries
- **Vitest**: Unit test runner (Jest-compatible, faster)
- **Testing Library**: React component testing
- **Playwright**: E2E testing
- **MSW**: API mocking
- **happy-dom**: Lightweight DOM for tests

### Coverage Tools
- **v8**: Built-in coverage provider
- **Codecov**: Coverage reporting (optional)
- **Coverage gutters**: VS Code extension for inline coverage

### Documentation
- [Vitest Docs](https://vitest.dev)
- [Testing Library](https://testing-library.com)
- [Playwright](https://playwright.dev)
- [MSW](https://mswjs.io)

---

## Next Steps

1. **Immediate** (This week):
   - Lower coverage thresholds to 10% to unblock CI
   - Start Phase 1 testing (`lib/metadata.ts`)

2. **Short-term** (Next 2 weeks):
   - Complete Phase 1 (25% coverage)
   - Set up test data fixtures
   - Configure coverage reporting

3. **Medium-term** (Next 4 weeks):
   - Complete Phase 2 (50% coverage)
   - Add integration tests
   - Raise coverage thresholds to 50%

4. **Long-term** (Next 8 weeks):
   - Complete Phase 3 (80% coverage)
   - Enable strict coverage gates in CI
   - Document testing patterns for contributors

**Last Updated**: November 15, 2025


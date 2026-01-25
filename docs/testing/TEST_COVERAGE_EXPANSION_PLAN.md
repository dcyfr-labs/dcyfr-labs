{/* TLP:CLEAR */}

# Test Coverage Expansion Plan
**Target: 23% → 50% Coverage**

## Current State Analysis (Dec 14, 2025)

### Coverage Metrics
```
Total Files: 1565 passed | 58 skipped (1623)
Overall Coverage: 23.03% statements | 22.83% branches | 20.77% functions | 23.44% lines
```

### High Coverage Areas (Maintain)
- **Utilities & Helpers**: `lib/blog.ts` (69%), `lib/feeds.ts` (73%), `lib/metadata.ts` (100%)
- **Core Components**: `components/common/filters` (96%), `components/layouts` (28%)
- **API Routes**: `app/api/analytics` (87%), `app/api/views` (95%), `app/api/contact` (79%)

### Critical Gaps (Priority Targets)

#### 1. Zero Coverage Files (0%)
**Pages & Routes:**
- `app/robots.ts` - Simple, easy wins
- `app/sitemap.ts` - SEO critical
- `app/activity/feed/route.ts` - RSS functionality
- `app/rss.xml/route.ts` - Feed generation
- `app/api/health/route.ts` - System monitoring

**Components:**
- All blog layout components (`components/blog/post/`)
- Navigation components (`components/navigation/`)
- Project components (`components/projects/`)
- Resume components (`components/resume/`)

#### 2. Low Coverage Areas (<25%)
**Hooks:** 
- `hooks/use-bookmarks.ts` (3.92%)
- `hooks/use-blog-analytics.ts` (0%)
- `hooks/use-dashboard-*.ts` (0%)

**Utilities:**
- `lib/analytics.ts` (0%) - Critical for business logic
- `lib/comments.ts` (2.56%)
- `lib/github-workflows.ts` (0%)

## Phase 2 Test Expansion Strategy

### Week 1: Quick Wins (Easy Coverage Gains)

#### Target Files (30 min each):
1. **Simple Routes** (Expected gain: +3%)
   ```bash
   src/app/robots.ts
   src/app/sitemap.ts  
   src/app/rss.xml/route.ts
   src/app/activity/feed/route.ts
   ```

2. **UI Components** (Expected gain: +5%)
   ```bash
   src/components/ui/badge.tsx (improve from 100% to cover edge cases)
   src/components/ui/card.tsx (improve from 71%)
   src/components/ui/select.tsx (improve from 70%)
   ```

3. **Simple Utilities** (Expected gain: +4%)
   ```bash
   src/lib/default-images.ts (improve from 20%)
   src/lib/site-config.ts (improve from 64%)
   src/lib/utils.ts (improve from 80%)
   ```

**Week 1 Target: 23% → 35% (+12%)**

### Week 2: Component Coverage

#### Navigation Components (Expected gain: +6%)
```bash
src/components/navigation/mobile-nav.tsx (100% → maintain)
src/components/navigation/site-header.tsx (44% → 80%)
src/components/navigation/back-to-top.tsx (0% → 60%)
```

#### Blog Components (Expected gain: +8%)
```bash
src/components/blog/filters/ (86% → 95%)
src/components/blog/post/post-badges.tsx (92% → 95%)
src/components/blog/dynamic-blog-content.tsx (6% → 70%)
src/components/blog/post/post-list.tsx (1% → 40%)
```

**Week 2 Target: 35% → 49% (+14%)**

### Week 3: Integration & API Coverage

#### API Route Tests (Expected gain: +3%)
```bash
src/app/api/health/route.ts (0% → 80%)
src/app/api/csp-report/route.ts (0% → 60%)
src/app/api/maintenance/*/route.ts (0% → 70%)
```

#### Integration Tests (Expected gain: +2%)
```bash
tests/integration/feed-generation.test.ts (NEW)
tests/integration/sitemap-generation.test.ts (NEW)
tests/integration/metadata-generation.test.ts (NEW)
```

**Week 3 Target: 49% → 54% (+5%)**

## Implementation Strategy

### Phase 2A: Test Template System (Day 1)

Create standardized test templates for common patterns:

1. **Route Handler Template**
```typescript
// tests/templates/route-handler.test.ts
describe('Route Handler: [ROUTE_NAME]', () => {
  test('returns expected response format', async () => {})
  test('handles errors gracefully', async () => {})
  test('validates input parameters', async () => {})
})
```

2. **Component Template**  
```typescript
// tests/templates/component.test.tsx
describe('[ComponentName]', () => {
  test('renders with default props', () => {})
  test('handles prop variations', () => {})
  test('manages state correctly', () => {})
  test('fires event handlers', () => {})
})
```

3. **Utility Template**
```typescript
// tests/templates/utility.test.ts
describe('[utilityName]', () => {
  test('handles valid inputs', () => {})
  test('throws on invalid inputs', () => {})
  test('returns expected output format', () => {})
})
```

### Phase 2B: Automation Scripts

Create automated test generation for simple patterns:

```bash
# scripts/testing/generate-route-tests.mjs
# Auto-generates basic route tests for GET/POST handlers

# scripts/testing/generate-component-tests.mjs  
# Auto-generates component render tests

# scripts/testing/analyze-coverage-gaps.mjs
# Identifies highest-impact files for coverage
```

### Phase 2C: Strategic Focus Areas

#### Highest Impact Files (Business Logic):
1. `lib/analytics.ts` - Business metrics (0% → 60%)
2. `lib/comments.ts` - User interaction (2.56% → 50%)  
3. `hooks/use-blog-analytics.ts` - User behavior (0% → 70%)
4. `app/api/health/route.ts` - System monitoring (0% → 80%)

#### Easiest Wins (Low Complexity):
1. `app/robots.ts` - Static response (0% → 100%)
2. `app/sitemap.ts` - Data transformation (0% → 80%)
3. `lib/default-images.ts` - Configuration (20% → 90%)
4. UI components - Props & rendering (Various → +20%)

## Test Quality Standards

### Coverage Requirements by File Type:

**Route Handlers:** 80%+ (GET, POST, error handling, validation)
**Utilities:** 90%+ (All branches, edge cases, error conditions)  
**Components:** 60%+ (Render, props, user interaction, state)
**Hooks:** 70%+ (State changes, side effects, cleanup)

### Testing Patterns:

1. **Mock External Dependencies**: Redis, APIs, file system
2. **Test Error Boundaries**: Network failures, invalid data
3. **Validate Outputs**: Response formats, data shapes, side effects
4. **Performance**: Avoid slow tests, use fakes/stubs

## Monitoring & Validation

### Daily Checks:
```bash
npm run test:coverage  # Check current coverage
npm run dev:health     # Validate dev environment  
npm run analyze:coverage  # Identify gaps
```

### Weekly Reports:
- Coverage trend analysis
- Test performance metrics
- Failed test analysis
- Coverage gap identification

### Success Metrics:
- **Primary**: 50% overall coverage by Week 3
- **Secondary**: 0 flaky tests, &lt;5s test runtime  
- **Tertiary**: 80%+ coverage for business-critical files

## Risk Mitigation

### Common Testing Pitfalls:
1. **Over-testing static content** - Focus on dynamic logic
2. **Testing implementation details** - Test behavior, not internals
3. **Slow integration tests** - Use unit tests for speed
4. **Brittle assertions** - Test outcomes, not specific DOM

### Quality Gates:
- All new tests must pass in CI
- Coverage cannot decrease between commits  
- Test runtime must stay under target thresholds
- No flaky tests in main branch

---

**Status:** Phase 2 Test Coverage Plan  
**Timeline:** 3 weeks  
**Expected Outcome:** 23% → 50%+ coverage  
**Owner:** DCYFR Development Team  

Next: Implement Week 1 quick wins and test template system.
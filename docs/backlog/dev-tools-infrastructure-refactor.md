<!-- TLP:CLEAR -->
# Dev Tools Infrastructure Refactor

**Status:** 📋 Backlog
**Priority:** P2 - High
**Complexity:** 🔴 Large (Multi-Phase)
**Created:** January 31, 2026
**Target:** Q1 2026

---

## Context

Recent infrastructure overhauls have fundamentally changed how dcyfr-labs handles:

- **Databases:** Redis segmentation (production vs preview vs local)
- **APIs:** Environment-aware routing and authentication
- **Metrics:** Production metrics sync system
- **Environment Segmentation:** Enhanced dev/preview/production isolation

These changes affect all dev tools (`/dev/**` routes and `/api/dev/**` endpoints), but each tool has unique requirements and data flows that need careful, **white glove treatment**.

---

## Problem Statement

Each dev tool currently operates under pre-overhaul assumptions about:

- Redis connection strings and key prefixes
- API endpoints and authentication flows
- Metrics data sources and sync strategies
- Environment detection and guards

The tools work in local development but may:

- ❌ Use incorrect Redis databases in different environments
- ❌ Display stale/incorrect metrics data
- ❌ Have inadequate environment guards
- ❌ Miss opportunities for new production metrics sync integration

---

## Affected Dev Tools

### UI Routes (`/dev/**/page.tsx`)

| Tool                      | Path                    | Purpose                          | Refactor Complexity               |
| ------------------------- | ----------------------- | -------------------------------- | --------------------------------- |
| **Analytics Dashboard**   | `/dev/analytics`        | Redis analytics metrics viewer   | 🔴 High - Needs env-aware Redis   |
| **Maintenance Dashboard** | `/dev/maintenance`      | Health monitoring, reports       | 🟡 Medium - Multiple data sources |
| **Unified AI Costs**      | `/dev/unified-ai-costs` | AI spending tracking (streaming) | 🔴 High - SSE + Redis             |
| **API Costs**             | `/dev/api-costs`        | API usage tracking               | 🟡 Medium - Redis + environment   |
| **MCP Health**            | `/dev/mcp-health`       | MCP server status monitoring     | 🟢 Low - Mostly client-side       |
| **Agents Dashboard**      | `/dev/agents`           | AI agent monitoring              | 🟡 Medium - Session state files   |
| **Docs Viewer**           | `/dev/docs`             | Interactive documentation        | 🟢 Low - File-based, no DB        |
| **Rivet Demo**            | `/dev/rivet-demo`       | Component library showcase       | 🟢 Low - Static demo              |

### API Routes (`/api/dev/**/*.ts`)

| Endpoint                           | Purpose                        | Refactor Complexity                 |
| ---------------------------------- | ------------------------------ | ----------------------------------- |
| `/api/dev/populate-cache`          | Cache warming utility          | 🔴 High - Multi-source data         |
| `/api/dev/refresh-github`          | GitHub data sync               | 🟡 Medium - External API + Redis    |
| `/api/dev/refresh-credly`          | Credly data sync               | 🟡 Medium - External API + Redis    |
| `/api/dev/verify-redis-env`        | Redis connection testing       | 🔴 High - Env segmentation critical |
| `/api/dev/ai-costs/unified`        | AI cost aggregation            | 🟡 Medium - Redis metrics           |
| `/api/dev/ai-costs/unified/stream` | Real-time cost streaming (SSE) | 🔴 High - SSE + Redis               |

### Supporting Files

- `/dev/api/reports/[name]/route.ts` - Static report serving
- `/dev/api/test-redis-storage/route.ts` - Redis storage testing
- `/dev/layout.tsx` - Shared dev layout (force-dynamic)

---

## Refactor Requirements by Tool

### 🔴 High Priority: Analytics Dashboard

**Current Issues:**

- May read from wrong Redis database in preview
- Doesn't leverage production metrics sync
- Hardcoded Redis key assumptions

**Required Changes:**

1. Environment-aware Redis client selection
2. Integration with `scripts/sync-production-metrics.mjs` patterns
3. Display environment indicator (production vs preview vs local)
4. Graceful fallback when metrics unavailable
5. Update tests to cover all environments

**Acceptance Criteria:**

- [ ] Uses correct Redis DB per environment
- [ ] Shows production metrics in preview (via sync)
- [ ] Clear UI indication of data source
- [ ] Zero errors in production logs
- [ ] Tests cover all environments

---

### 🔴 High Priority: Unified AI Costs (SSE)

**Current Issues:**

- SSE stream may not handle environment segmentation
- Redis key prefixes not environment-aware
- No clear indication of data source

**Required Changes:**

1. Environment-aware Redis client in SSE handler
2. Proper stream cleanup on environment mismatch
3. Client-side environment indicator
4. Rate limiting per environment
5. Connection pooling optimization

**Acceptance Criteria:**

- [ ] SSE streams from correct Redis DB
- [ ] No memory leaks in long-running streams
- [ ] Environment displayed in UI
- [ ] Rate limits applied per environment
- [ ] Performance tests for stream duration

---

### 🔴 High Priority: Redis Verification Tool

**Current Issues:**

- Critical for debugging environment issues
- Needs to test ALL environment scenarios
- May have stale connection string logic

**Required Changes:**

1. Test production, preview, local Redis separately
2. Verify key prefix isolation
3. Report metrics sync status
4. Test read/write permissions per environment
5. Add diagnostic for common misconfigurations

**Acceptance Criteria:**

- [ ] Tests all three environments
- [ ] Reports key prefix usage
- [ ] Checks metrics sync integration
- [ ] Provides actionable diagnostics
- [ ] Documentation updated

---

### 🔴 High Priority: Populate Cache Utility

**Current Issues:**

- Multi-source data fetching (GitHub, Credly, etc.)
- Needs environment-aware caching strategy
- May populate wrong Redis DB

**Required Changes:**

1. Environment detection at entry point
2. Per-environment cache key prefixes
3. Skip production data fetch in local/preview
4. Integration with production metrics sync
5. Progress reporting per environment

**Acceptance Criteria:**

- [ ] Only populates correct environment's cache
- [ ] Respects production data boundaries
- [ ] Clear progress indicators
- [ ] Error handling per data source
- [ ] Tests for each environment

---

### 🟡 Medium Priority: Maintenance Dashboard

**Current Issues:**

- Fetches from multiple sources (reports, Redis, health checks)
- Some reports may be stale/incorrect

**Required Changes:**

1. Environment-aware data source selection
2. Display data freshness timestamps
3. Integration with new health check patterns
4. Clear indication when using fallback data

**Acceptance Criteria:**

- [ ] All data sources environment-aware
- [ ] Timestamps shown for all metrics
- [ ] Fallback indicators visible
- [ ] Tests cover multi-source scenarios

---

### 🟡 Medium Priority: API Costs Dashboard

**Current Issues:**

- Redis-backed metrics may use wrong DB
- No clear environment indicator

**Required Changes:**

1. Environment-aware Redis client
2. Display environment and data source
3. Historical data handling per environment

**Acceptance Criteria:**

- [ ] Correct Redis DB per environment
- [ ] UI shows data source clearly
- [ ] Historical metrics isolated per environment

---

### 🟡 Medium Priority: Agents Dashboard

**Current Issues:**

- Reads session state files
- May not handle multi-environment properly

**Required Changes:**

1. Session state file path per environment
2. Display active environment
3. Cleanup logic for stale sessions

**Acceptance Criteria:**

- [ ] Session files isolated per environment
- [ ] Clear environment indicator
- [ ] Stale session cleanup works

---

### 🟡 Medium Priority: GitHub/Credly Refresh

**Current Issues:**

- May cache to wrong Redis DB
- No rate limiting per environment

**Required Changes:**

1. Environment-aware caching
2. Rate limiting per environment
3. Error handling for production guards

**Acceptance Criteria:**

- [ ] Correct Redis DB per environment
- [ ] Rate limits enforced
- [ ] Production guards working

---

### 🟢 Low Priority: MCP Health, Docs Viewer, Rivet Demo

**Current Issues:**

- Minimal or no database interaction
- Already environment-isolated

**Required Changes:**

1. Verify environment guards in place
2. Add environment indicator to UI
3. Update documentation

**Acceptance Criteria:**

- [ ] Environment guards verified
- [ ] UI shows environment (optional)
- [ ] Documentation current

---

## Cross-Cutting Concerns

### 1. Environment Detection Standard

Create a shared utility for consistent environment detection:

```typescript
// src/lib/dev-tools/environment.ts
export function getDevToolEnvironment() {
  const isProduction =
    process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  const isPreview = process.env.VERCEL_ENV === 'preview';
  const isLocal = !isProduction && !isPreview;

  return {
    isProduction,
    isPreview,
    isLocal,
    label: isProduction ? 'production' : isPreview ? 'preview' : 'local',
  };
}
```

### 2. Redis Client Selection

Standardize Redis client creation per environment:

```typescript
// src/lib/dev-tools/redis.ts
export function getDevToolRedis() {
  const { isProduction, isPreview } = getDevToolEnvironment();

  if (isProduction) {
    return getRedisClient(); // Production Redis
  } else if (isPreview) {
    return getRedisClient(); // Preview Redis (with production sync)
  } else {
    return getRedisClient(); // Local Redis
  }
}
```

### 3. UI Environment Indicator Component

Create a reusable environment badge:

```typescript
// src/components/dev/EnvironmentBadge.tsx
export function EnvironmentBadge({ source }: { source?: string }) {
  const env = getDevToolEnvironment();
  return (
    <div className="flex items-center gap-2">
      <Badge variant={env.isProduction ? 'destructive' : env.isPreview ? 'secondary' : 'default'}>
        {env.label}
      </Badge>
      {source && <span className="text-sm text-muted-foreground">({source})</span>}
    </div>
  );
}
```

### 4. Production Metrics Sync Integration

Each tool should document whether it uses:

- **Live production data** (direct connection)
- **Synced production data** (via `sync-production-metrics.mjs`)
- **Environment-specific data** (isolated per env)
- **Hybrid approach** (mix of above)

---

## Implementation Strategy

### Phase 1: Foundation (Week 1)

**Goal:** Establish shared utilities and patterns

- [ ] Create `src/lib/dev-tools/` directory
- [ ] Implement `environment.ts` utility
- [ ] Implement `redis.ts` client selector
- [ ] Create `EnvironmentBadge` component
- [ ] Document usage patterns

**Deliverables:**

- Shared utilities package
- Usage documentation
- Example implementations

---

### Phase 2: High-Priority Tools (Week 2-3)

**Goal:** Refactor critical tools with database dependencies

**Order of execution (dependencies matter):**

1. **Redis Verification Tool** (foundational debugging)
   - Establishes environment testing patterns
   - Validates Redis segmentation
   - Provides diagnostics for other tools

2. **Populate Cache Utility** (data loading)
   - Uses Redis verification patterns
   - Establishes multi-source fetching standards
   - Critical for other tools' data

3. **Analytics Dashboard** (primary metrics viewer)
   - Uses populate cache data
   - Demonstrates production sync integration
   - High user visibility

4. **Unified AI Costs (SSE)** (complex streaming)
   - Most complex technical challenge
   - Requires solid Redis foundations
   - High performance requirements

**Approach per tool:**

1. Review current implementation
2. Identify environment-specific code paths
3. Implement shared utilities
4. Add environment indicators to UI
5. Write environment-specific tests
6. Update documentation
7. Deploy and monitor

---

### Phase 3: Medium-Priority Tools (Week 4)

**Goal:** Refactor tools with moderate database usage

**Tools:**

- Maintenance Dashboard
- API Costs Dashboard
- Agents Dashboard
- GitHub/Credly Refresh endpoints

**Approach:**

- Apply patterns from Phase 2
- Focus on consistency
- Batch similar changes

---

### Phase 4: Low-Priority Tools & Polish (Week 5)

**Goal:** Complete coverage and polish

**Tasks:**

- Verify low-priority tools
- Add environment indicators where missing
- Comprehensive documentation update
- End-to-end testing across environments
- Performance optimization

---

## Testing Strategy

### Per-Tool Testing

Each refactored tool must have:

1. **Unit Tests**
   - Environment detection logic
   - Redis client selection
   - Key prefix isolation

2. **Integration Tests**
   - Full request/response cycle
   - All three environments (mocked)
   - Error scenarios

3. **E2E Tests** (where applicable)
   - UI displays correct environment
   - Data matches expected source
   - Error states handled gracefully

### Cross-Tool Testing

1. **Environment Isolation**
   - Verify no data leakage between environments
   - Confirm key prefix isolation
   - Test environment switching

2. **Production Metrics Sync**
   - Verify preview environment shows synced data
   - Confirm sync script integration
   - Test fallback scenarios

3. **Performance**
   - Redis connection pooling
   - SSE stream resource usage
   - Cache hit rates per environment

---

## Documentation Updates

### Required Updates

- [ ] Update `docs/dev-routes-optimization.md` with new patterns
- [ ] Create `docs/dev-tools/ENVIRONMENT_GUIDE.md`
- [ ] Update each tool's inline documentation
- [ ] Add troubleshooting guide for common issues
- [ ] Update README with dev tools overview

### New Documentation

- [ ] `docs/dev-tools/ARCHITECTURE.md` - Overall architecture
- [ ] `docs/dev-tools/REDIS_PATTERNS.md` - Redis usage patterns
- [ ] `docs/dev-tools/TESTING.md` - Testing strategies
- [ ] `docs/dev-tools/TROUBLESHOOTING.md` - Common issues

---

## Success Criteria

### Functional Requirements

- [ ] All dev tools use correct Redis DB per environment
- [ ] UI clearly indicates current environment and data source
- [ ] No cross-environment data contamination
- [ ] Production metrics sync properly integrated where applicable
- [ ] All environment guards working correctly

### Quality Requirements

- [ ] ≥99% test pass rate maintained
- [ ] 0 ESLint errors
- [ ] Design token compliance ≥90%
- [ ] All tools documented
- [ ] Troubleshooting guide complete

### Performance Requirements

- [ ] Page load times <2s in all environments
- [ ] SSE streams handle 1000+ events without memory leaks
- [ ] Redis connection pooling optimized
- [ ] No N+1 query patterns

### Developer Experience

- [ ] Clear environment detection utilities
- [ ] Reusable UI components
- [ ] Consistent patterns across tools
- [ ] Comprehensive documentation
- [ ] Easy to add new dev tools

---

## Risks & Mitigations

### Risk: Breaking Production Metrics Sync

**Impact:** High
**Likelihood:** Medium

**Mitigation:**

- Test sync script extensively
- Implement rollback plan
- Monitor sync job health
- Add alerting for sync failures

### Risk: Cross-Environment Data Contamination

**Impact:** Critical
**Likelihood:** Low

**Mitigation:**

- Strict key prefix isolation
- Environment-specific Redis clients
- Comprehensive integration tests
- Manual verification before deploy

### Risk: SSE Memory Leaks

**Impact:** High
**Likelihood:** Medium

**Mitigation:**

- Stream timeout enforcement
- Connection cleanup on error
- Load testing before deploy
- Memory profiling in staging

### Risk: Breaking Local Development

**Impact:** High
**Likelihood:** Low

**Mitigation:**

- Test local environment thoroughly
- Maintain fallback logic
- Clear error messages
- Quick rollback capability

---

## Dependencies

### Technical Dependencies

- ✅ Production metrics sync system (`scripts/sync-production-metrics.mjs`)
- ✅ Redis segmentation (production/preview/local)
- ✅ Environment detection patterns
- ⏳ Shared dev tools utilities (to be created)

### Process Dependencies

- Need approval for production Redis schema changes
- Coordinate with DevOps for deployment strategy
- User testing for UI changes

---

## Timeline & Effort Estimate

| Phase                    | Duration    | Effort (hours) | Team      |
| ------------------------ | ----------- | -------------- | --------- |
| Phase 1: Foundation      | 1 week      | 16             | 1 dev     |
| Phase 2: High-Priority   | 2 weeks     | 40             | 1 dev     |
| Phase 3: Medium-Priority | 1 week      | 20             | 1 dev     |
| Phase 4: Polish          | 1 week      | 16             | 1 dev     |
| **Total**                | **5 weeks** | **92 hours**   | **1 dev** |

**Recommended approach:** Full-time focus for one developer to maintain consistency and avoid context switching.

---

## Out of Scope

- Complete rewrite of dev tools (refactor only)
- New dev tool features (focus on infrastructure only)
- Production-facing changes (dev tools only)
- Major UI redesigns (functional updates only)

---

## Follow-Up Tasks

After completion:

- [ ] Monitor tool usage and error rates
- [ ] Gather developer feedback
- [ ] Document lessons learned
- [ ] Plan Phase 2 enhancements (new features)
- [ ] Consider consolidation opportunities

---

## References

- [Production Metrics Sync](../operations/PRODUCTION_METRICS_SYNC.md)
- [Dev Routes Optimization](../dev-routes-optimization.md)
- Environment Segmentation
- Redis Architecture
- [Testing Strategy](../testing/README.md)

---

**Next Steps:**

1. Review and approve this plan
2. Assign to developer
3. Create Phase 1 tasks
4. Schedule kickoff meeting
5. Begin implementation

---

**Status Updates:**

- 2026-01-31: Initial backlog item created

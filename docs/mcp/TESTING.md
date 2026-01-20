# MCP Testing Guide

This guide covers testing strategies for dcyfr-labs custom MCP servers.

## Test Layers

### 1. Unit Tests (`src/mcp/__tests__/*.test.ts`)

Test individual utilities and helper functions without Redis connections.

**Current Coverage:**
- ✅ Production data filtering
- ✅ Cache functionality (TTL, expiration)
- ✅ Time range helpers (1h, 24h, 7d, 30d, all)
- ✅ Array utilities (sort, limit)

**Run unit tests:**
```bash
npm run test:run src/mcp/__tests__/*.test.ts
```

**Current Status:** 8/8 tests passing

### 2. Integration Tests (Manual)

Test the MCP server with actual Redis connections and AI assistants.

#### Test with MCP Inspector (Web UI)

```bash
npm run mcp:inspect:analytics
```

Opens web interface at `http://localhost:6274` with:
- Tool testing interface (test all 5 tools)
- Resource browser (view all 3 resources)
- Prompt testing (render 2 prompts)

**Test Checklist:**
- [ ] analytics:getPageViews - Query page views for specific paths
- [ ] analytics:getTrending - Get top N pages
- [ ] analytics:getEngagement - Get clicks/shares/interactions
- [ ] analytics:searchActivity - Search activity logs
- [ ] analytics:getMilestones - List milestones
- [ ] Resource: analytics://recent (24h summary)
- [ ] Resource: analytics://top-pages (top 20 pages)
- [ ] Resource: analytics://engagement/summary (stats)
- [ ] Prompt: analytics-summary (analysis guide)
- [ ] Prompt: content-performance (optimization guide)

#### Test with AI Assistants

**Prerequisites:**
1. Add Analytics MCP to `.vscode/mcp.json` (✅ Done)
2. Ensure Redis credentials in `.env.local`:
   ```
   REDIS_URL=redis://default:your-password@your-redis-host:6379
   ```
3. Reload VS Code window

**Test Prompts for AI Assistants:**

```
# Test basic tool access
What are the top 5 pages on dcyfr-labs in the last 7 days?

# Test engagement metrics
Show me engagement metrics for blog posts in the last 30 days

# Test activity search
Search for recent navigation activity from the last 24 hours

# Test prompts (AI should use analytics-summary prompt)
Analyze dcyfr-labs analytics for the past 7 days

# Test content performance (AI should use content-performance prompt)
Analyze blog content performance and suggest optimizations
```

**Expected Behavior:**
- AI assistant lists `analytics:*` tools in available tools
- AI calls appropriate analytics tools based on user query
- AI formats responses with insights from analytics data
- Response times <500ms for tool calls
- Resources are cached appropriately (1-5min TTL)

### 3. Performance Tests

**Response Time Targets:**
- Tools: <500ms per call
- Resources: <300ms (with caching)
- Cache hit ratio: >80%

**Monitor Performance:**
```bash
# Enable performance logging
DEBUG=mcp:* npm run mcp:analytics
```

**Check Cache Stats:**
All tools log cache performance. Look for:
- `[Cache HIT]` - Data served from cache
- `[Cache MISS]` - Data fetched from Redis
- Hit ratio should be >80% for frequently accessed data

### 4. Production Validation

**Before deploying:**
- [ ] All unit tests passing (8/8)
- [ ] Integration tests passing (10/10 checklist items)
- [ ] Response times <500ms
- [ ] Cache hit ratio >80%
- [ ] No test data in production (verify with `isProduction` checks)

**Production Monitoring:**
- Use `logToolExecution()` for observability
- Monitor Redis connection health
- Track cache performance metrics
- Alert on >500ms response times

## Common Issues

### Issue: "Missing Redis credentials"

**Solution:**
Add to `.env.local`:
```
REDIS_URL=redis://default:your-password@your-redis-host:6379
```

### Issue: "Server starts but tools don't work"

**Check:**
1. Redis credentials are valid
2. Redis has data (check keys: `analytics:pageViews`, `analytics:engagement`, etc.)
3. Environment variables loaded correctly

**Debug:**
```bash
# Test Redis connection
node -e "console.log(process.env.REDIS_URL)"
```

### Issue: "Slow response times (>500ms)"

**Check:**
1. Cache is working (look for `[Cache HIT]` logs)
2. Redis latency (should be <50ms)
3. Data size (limit results if large datasets)

**Optimize:**
- Increase cache TTL for stable data
- Use `limit` parameter to reduce result size
- Consider pagination for large datasets

## Test Data Management

**For unit tests:**
- Use mocked data (no Redis connection)
- Test with `vi.stubEnv("NODE_ENV", "production")` for production filtering

**For integration tests:**
- Use test Redis instance (separate from production)
- Populate with sample data using `scripts/populate-analytics-milestones.mjs`
- Clean up with `scripts/clear-test-data.mjs`

**Never:**
- Commit test data to production Redis
- Use fabricated data without environment checks
- Skip production filtering validation

## Next Steps

- [ ] Add E2E test suite for AI assistant integration
- [ ] Create automated performance benchmarks
- [ ] Set up CI/CD for MCP server testing
- [ ] Add Redis health checks to test suite

---

**Status:** Active Development  
**Last Updated:** December 28, 2025  
**Coverage:** Unit tests complete, integration testing in progress

<!-- TLP:CLEAR -->

# Cache Versioning & Migration Guide

**Status:** Production-Ready (2026-01-11)
**Last Updated:** 2026-01-11
**Related Files:**
- [src/lib/cache-versioning.ts](../../src/lib/cache-versioning.ts) - Core implementation
- [src/inngest/activity-cache-functions.ts](../../src/inngest/activity-cache-functions.ts) - Usage example
- [scripts/clear-activity-cache.mjs](../../scripts/clear-activity-cache.mjs) - Maintenance script

## Overview

The cache versioning system prevents cache drift when code structure changes by:

1. **Version tracking** - Each cache entry includes version metadata
2. **Automatic validation** - Schema validation ensures data integrity
3. **Graceful fallback** - Invalid/outdated caches are auto-deleted
4. **Type safety** - Full TypeScript support with validators

## Quick Start

### Using Pre-Configured Caches

```typescript
import { activityFeedCache } from '@/lib/cache-versioning';

// Get from cache (with validation)
const activities = await activityFeedCache.get('feed:all');
if (!activities) {
  // Cache miss or validation failed - fetch fresh data
  const fresh = await fetchActivities();
  await activityFeedCache.set('feed:all', fresh);
}
```

### Creating a New Versioned Cache

```typescript
import { VersionedCache, CACHE_VERSIONS } from '@/lib/cache-versioning';

// 1. Add version to registry
export const CACHE_VERSIONS = {
  MY_FEATURE: 1, // Increment when structure changes
} as const;

// 2. Create cache instance
export const myFeatureCache = new VersionedCache({
  namespace: 'my-feature',
  version: CACHE_VERSIONS.MY_FEATURE,
  ttl: 3600, // 1 hour
  description: 'My feature cache',
  validate: (data): data is MyType[] => {
    if (!Array.isArray(data)) return false;
    if (data.length === 0) return true; // Empty is valid

    // Validate first item has required fields
    const item = data[0];
    return (
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      'requiredField' in item
    );
  },
});
```

### Basic Operations

```typescript
// Set cache
await myFeatureCache.set('key', data);
await myFeatureCache.set('key', data, 7200); // Custom TTL

// Get cache (returns null if miss/invalid/expired)
const cached = await myFeatureCache.get('key');

// Delete specific key
await myFeatureCache.delete('key');

// Delete all versions of a key
await myFeatureCache.deleteAllVersions('key');

// Get cache statistics
const stats = await myFeatureCache.getStats();
console.log(stats); // { exists, version, age, ttl }
```

## Migration Guide

### Migrating Existing Caches

**Step 1: Identify existing cache keys**

```bash
# List all Redis keys
npm run redis:keys
```

**Step 2: Create versioned cache instance**

```typescript
// Before: Direct Redis access
const cached = await redis.get('my:cache:key');

// After: Versioned cache
import { VersionedCache } from '@/lib/cache-versioning';

const myCache = new VersionedCache({
  namespace: 'my',
  version: 1,
  ttl: 3600,
  description: 'My cache',
  validate: (data): data is MyType => {
    return typeof data === 'object' && 'id' in data;
  },
});

const cached = await myCache.get('cache:key');
```

**Step 3: Clear old cache format**

```bash
# Clear old non-versioned cache
redis-cli DEL my:cache:key

# Or use the clear script
npm run redis:clear
```

**Step 4: Update cache writes**

```typescript
// Before: Direct Redis write
await redis.setEx('my:cache:key', 3600, JSON.stringify(data));

// After: Versioned cache
await myCache.set('cache:key', data);
```

### Handling Schema Changes

When your data structure changes, increment the version:

```typescript
// Version 1: Initial structure
interface ActivityV1 {
  id: string;
  timestamp: Date;
}

// Version 2: Added new fields
interface ActivityV2 {
  id: string;
  timestamp: Date;
  source: string; // NEW
  metadata: object; // NEW
}

// Update version in registry
export const CACHE_VERSIONS = {
  ACTIVITY_FEED: 2, // Increment from 1 to 2
} as const;
```

**What happens automatically:**
1. Old v1 caches are detected as version mismatch
2. Versioned cache auto-deletes old entries
3. Next read triggers fresh data fetch
4. Fresh data is cached with v2 metadata

## Cache Key Format

Versioned cache keys follow this pattern:

```
{namespace}:v{version}:{key}
```

**Examples:**
- `activity:v2:feed:all` - Activity feed version 2
- `analytics:v1:trending:week` - Analytics trending data version 1
- `github:v1:traffic:repo123` - GitHub traffic data version 1

**Benefits:**
- Easy pattern matching: `activity:v*:*`
- Version isolation: v1 and v2 coexist
- Automatic cleanup: Old versions detected and removed

## Validation Best Practices

### Simple Validator (Fast)

```typescript
validate: (data): data is MyType[] => {
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return true;

  const item = data[0];
  return typeof item === 'object' && 'id' in item;
}
```

### Comprehensive Validator (Thorough)

```typescript
import { z } from 'zod';

const MySchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime(),
  value: z.number().positive(),
});

validate: (data): data is MyType[] => {
  try {
    if (!Array.isArray(data)) return false;
    data.forEach(item => MySchema.parse(item));
    return true;
  } catch {
    return false;
  }
}
```

## Deployment Cache Invalidation

### Automatic Invalidation

Caches are automatically invalidated on production deployments:

1. **GitHub Actions** triggers post-deploy workflow
2. **Inngest event** `activity/cache.invalidate` is sent
3. **Cache function** deletes all cache versions
4. **Fresh data** is fetched on next request

### Manual Invalidation

```bash
# Local environment
npm run redis:clear

# Force invalidation (any environment)
npm run deploy:invalidate:force

# Production (via Inngest)
curl -X POST https://inn.gs/e/dcyfr-labs \
  -H "Authorization: Bearer $INNGEST_EVENT_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"activity/cache.invalidate","data":{"reason":"manual"}}'
```

### Environment Variables

Required for deployment invalidation:

```bash
# Vercel environment variables
INNGEST_EVENT_KEY=your_event_key
VERCEL_ENV=production
VERCEL_GIT_COMMIT_SHA=abc123...
```

## Monitoring & Debugging

### Check Cache Health

```bash
# Redis connection and stats
npm run redis:health

# List all Redis keys
npm run redis:keys

# Clean expired/invalid entries
npm run redis:health:clean
```

### Debug Cache Operations

```typescript
// Enable detailed logging
const cache = new VersionedCache({
  namespace: 'debug',
  version: 1,
  ttl: 60,
  validate: (data) => {
    console.log('[Validator] Checking:', data);
    return true;
  },
});

// Check cache stats
const stats = await cache.getStats();
console.log('Cache stats:', stats);
// Output: { exists: true, version: 1, age: "5 minutes ago", ttl: 55 }
```

### Common Issues

**Issue: Cache always returns null**

```typescript
// Problem: Validator is too strict
validate: (data): data is MyType => {
  return data.every(item => item.strictField !== undefined);
  // If ANY item lacks strictField, entire cache is invalidated
}

// Solution: Validate required fields only
validate: (data): data is MyType => {
  if (!Array.isArray(data)) return false;
  return data.every(item => 'id' in item); // Essential field only
}
```

**Issue: Version mismatch warnings**

```bash
# Warning in logs
[Cache] Version mismatch: activity:v1:feed:all (cached: v1, expected: v2)

# Solution: Clear old versions
npm run redis:clear

# Or let auto-cleanup handle it (cache will delete on next read)
```

**Issue: Cache not invalidating on deploy**

```bash
# Check environment variables
vercel env ls

# Ensure INNGEST_EVENT_KEY is set
vercel env add INNGEST_EVENT_KEY

# Test manually
npm run deploy:invalidate:force
```

## Performance Considerations

### Cache Hit Rates

Monitor cache effectiveness:

```typescript
let hits = 0;
let misses = 0;

const cached = await myCache.get('key');
if (cached) {
  hits++;
  console.log(`Cache hit rate: ${(hits / (hits + misses)) * 100}%`);
} else {
  misses++;
  // Fetch fresh data
}
```

### TTL Selection

Choose appropriate TTLs based on data characteristics:

| Data Type | TTL | Reasoning |
|-----------|-----|-----------|
| Activity feed | 1 hour | Updates hourly via cron |
| Analytics | 5 minutes | Real-time tracking |
| Blog posts | 24 hours | Rarely changes |
| User sessions | 15 minutes | Balance freshness/load |
| API responses | 1 minute | High volatility |

### Redis Connection Pooling

Versioned cache auto-manages connections:

```typescript
// ✅ GOOD: Cache handles connection lifecycle
const cached = await myCache.get('key');
// Connection auto-closed after operation

// ❌ BAD: Manual connection management
const redis = await getRedisClient();
const cached = await redis.get('key');
await redis.quit(); // Manual cleanup required
```

## Advanced Patterns

### Multi-Key Batch Operations

```typescript
async function batchGet(keys: string[]): Promise<Map<string, MyType>> {
  const results = new Map();

  await Promise.all(
    keys.map(async (key) => {
      const cached = await myCache.get(key);
      if (cached) results.set(key, cached);
    })
  );

  return results;
}
```

### Conditional Caching

```typescript
async function smartCache(key: string, fetchFn: () => Promise<MyType>) {
  // Try cache first
  const cached = await myCache.get(key);
  if (cached) return cached;

  // Fetch fresh data
  const fresh = await fetchFn();

  // Only cache if data is valid and non-empty
  if (fresh && Object.keys(fresh).length > 0) {
    await myCache.set(key, fresh);
  }

  return fresh;
}
```

### Namespace Patterns

Organize caches by feature:

```typescript
// Feature-based namespaces
const activityCache = new VersionedCache({ namespace: 'activity', ... });
const analyticsCache = new VersionedCache({ namespace: 'analytics', ... });
const githubCache = new VersionedCache({ namespace: 'github', ... });

// Environment-based namespaces
const prodCache = new VersionedCache({ namespace: 'prod:activity', ... });
const devCache = new VersionedCache({ namespace: 'dev:activity', ... });
```

## Testing

### Unit Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { VersionedCache } from '@/lib/cache-versioning';

describe('VersionedCache', () => {
  it('should validate data correctly', async () => {
    const cache = new VersionedCache({
      namespace: 'test',
      version: 1,
      ttl: 60,
      validate: (data): data is any => Array.isArray(data),
    });

    await cache.set('key', [1, 2, 3]);
    const result = await cache.get('key');
    expect(result).toEqual([1, 2, 3]);
  });

  it('should return null for version mismatch', async () => {
    const cacheV1 = new VersionedCache({ namespace: 'test', version: 1, ttl: 60 });
    await cacheV1.set('key', { data: 'v1' });

    const cacheV2 = new VersionedCache({ namespace: 'test', version: 2, ttl: 60 });
    const result = await cacheV2.get('key');
    expect(result).toBeNull();
  });
});
```

### Integration Tests

```typescript
describe('Cache Invalidation', () => {
  it('should clear cache on deployment event', async () => {
    // Populate cache
    await activityFeedCache.set('feed:all', mockActivities);

    // Trigger invalidation event
    await inngest.send({
      name: 'activity/cache.invalidate',
      data: { reason: 'test' },
    });

    // Verify cache is cleared
    const result = await activityFeedCache.get('feed:all');
    expect(result).toBeNull();
  });
});
```

## Migration Checklist

- [ ] Identify all existing Redis cache keys
- [ ] Create versioned cache instances for each cache
- [ ] Add validators for each cache type
- [ ] Update all cache reads to use versioned cache
- [ ] Update all cache writes to use versioned cache
- [ ] Clear old non-versioned cache keys
- [ ] Test cache hit/miss scenarios
- [ ] Monitor cache performance in production
- [ ] Set up deployment invalidation (INNGEST_EVENT_KEY)
- [ ] Test manual cache clearing
- [ ] Document cache usage in team wiki
- [ ] Set up cache monitoring alerts

## Resources

### Files

- [src/lib/cache-versioning.ts](../../src/lib/cache-versioning.ts) - Core implementation
- [src/inngest/activity-cache-functions.ts](../../src/inngest/activity-cache-functions.ts) - Usage example
- [scripts/clear-activity-cache.mjs](../../scripts/clear-activity-cache.mjs) - Maintenance
- [scripts/invalidate-cache-on-deploy.mjs](../../scripts/invalidate-cache-on-deploy.mjs) - Deployment
- [.github/workflows/post-deploy.yml](../../.github/workflows/post-deploy.yml) - CI/CD

### Commands

```bash
# Cache management
npm run redis:clear          # Clear activity cache
npm run redis:keys           # List all cache keys
npm run redis:health         # Check Redis health

# Deployment
npm run deploy:invalidate    # Trigger cache invalidation
npm run deploy:invalidate:force  # Force invalidation (any env)

# Testing
npm test src/lib/__tests__/cache-versioning.test.ts
```

### External Resources

- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Inngest Documentation](https://www.inngest.com/docs)
- [Next.js Caching Guide](https://nextjs.org/docs/app/building-your-application/caching)

## Support

**Questions or Issues?**

1. Check [docs/operations/todo.md](../operations/todo.md) for related tasks
2. Review [Redis health check script](../../scripts/redis-health-check.mjs)
3. Enable debug logging in cache operations
4. Monitor Inngest dashboard for event execution

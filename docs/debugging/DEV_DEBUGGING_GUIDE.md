# Development Debugging Guide

**Last Updated:** 2025-12-05

Comprehensive guide for debugging async operations, Redis connections, and hanging processes in development.

## 🚨 Problem Context

After encountering issues that required reverting to the last known good production build, we've implemented extensive debugging tools to help troubleshoot:

- Async operations hanging
- Redis connection issues
- Slow API responses
- Memory leaks
- Process hangs during development

## 🛠️ Debugging Tools Overview

### 1. Dev Logger (`src/lib/dev-logger.ts`)

**Purpose:** Verbose, color-coded logging with timing information

**Features:**
- Color-coded log levels (DEBUG, INFO, WARN, ERROR, TIMING, REDIS, API, ASYNC)
- Operation timing and tracking
- Memory usage monitoring
- Hang detection
- Automatic stack traces for errors

**Usage:**

```typescript
import { devLogger } from '@/lib/dev-logger';

// Basic logging
devLogger.info('Server started');
devLogger.warn('Slow operation detected');
devLogger.error('Connection failed', { error: new Error('timeout') });

// Timing operations
devLogger.startTiming('fetch-data', 'Fetching user data');
// ... do work ...
devLogger.endTiming('fetch-data', 'Fetching user data');

// Track async operations automatically
const result = await devLogger.trackAsync(
  'api-call',
  async () => fetch('/api/data'),
  'API data fetch'
);

// Redis-specific logging
devLogger.redis('Connection established', {
  metadata: { host: 'localhost', port: 6379 }
});

// Check for hanging operations
devLogger.logPendingOperations();
```

**Output Example:**
```
[2025-12-05T10:30:15.123Z] [TIMING] Started: Fetching user data (fetch-data)
[2025-12-05T10:30:15.456Z] [TIMING] Completed: Fetching user data (fetch-data) [333ms] [45MB/128MB]
```

### 2. Redis Debug Manager (`src/lib/redis-debug.ts`)

**Purpose:** Enhanced Redis connection management with timeouts and monitoring

**Features:**
- Connection timeout enforcement (5s default)
- Operation timeout detection (3s default)
- Automatic retry with backoff
- Connection pool health monitoring
- Detailed connection statistics
- Graceful failure handling

**Usage:**

```typescript
import { redisManager, setupRedisMonitoring } from '@/lib/redis-debug';

// Get a client with automatic timeout and retry
const client = await redisManager.getClient('my-client');

// Execute operation with timeout
const result = await redisManager.withTimeout(
  'my-client',
  async (client) => client.get('key'),
  'get-operation',
  3000 // 3 second timeout
);

// Get connection statistics
const stats = redisManager.getStats('my-client');
console.log(stats);
// {
//   totalConnections: 5,
//   totalDisconnections: 2,
//   totalErrors: 1,
//   totalTimeouts: 0,
//   lastConnectedAt: Date,
//   lastError: 'Connection refused'
// }

// Setup automatic monitoring (logs every 30s)
setupRedisMonitoring(30000);

// Check status manually
redisManager.logStatus();
```

**Configuration:**
- `REDIS_CONNECT_TIMEOUT`: 5000ms (5 seconds)
- `REDIS_OPERATION_TIMEOUT`: 3000ms (3 seconds)
- `REDIS_MAX_RETRIES`: 3 attempts
- `REDIS_RETRY_DELAY`: 1000ms base delay (exponential backoff)

### 3. API Monitor (`src/lib/api-monitor.ts`)

**Purpose:** Comprehensive API route monitoring and performance tracking

**Features:**
- Request/response logging with timing
- Slow endpoint detection
- Error tracking
- Request/response body logging (optional)
- Automatic performance metrics

**Usage:**

```typescript
import { withApiMonitoring, monitorAsync } from '@/lib/api-monitor';

// Wrap your API handler
export const GET = withApiMonitoring(
  async (request: Request) => {
    // Your handler logic
    return NextResponse.json({ data: 'hello' });
  },
  'my-api-route',
  {
    logRequestBody: true,
    logResponseBody: false,
    slowThreshold: 1000, // Log warning if > 1s
  }
);

// Monitor any async operation
const data = await monitorAsync(
  async () => fetchDataFromDB(),
  'database-fetch',
  { table: 'users' }
);
```

**Output Example:**
```
[2025-12-05T10:30:15.123Z] [API] → Request: GET /api/analytics
[2025-12-05T10:30:16.456Z] [WARN] ← Response: GET /api/analytics - 200 (slow) [1333ms]
```

### 4. Diagnostics API (`/api/dev/diagnostics`)

**Purpose:** Real-time system health check endpoint

**Features:**
- Memory usage and uptime
- Redis connection status
- API performance metrics
- Environment variable validation
- Pending operation detection

**Usage:**

```bash
# Full diagnostics
curl http://localhost:3000/api/dev/diagnostics

# Skip specific checks
curl http://localhost:3000/api/dev/diagnostics?redis=false&api=false

# Only memory and environment
curl http://localhost:3000/api/dev/diagnostics?redis=false&api=false
```

**Response Example:**
```json
{
  "success": true,
  "diagnostics": {
    "timestamp": "2025-12-05T10:30:15.123Z",
    "environment": "development",
    "platform": "darwin",
    "nodeVersion": "v20.10.0",
    "memory": {
      "heapUsed": "45MB",
      "heapTotal": "128MB",
      "heapUsedPercent": 35,
      "rss": "256MB"
    },
    "uptime": {
      "seconds": 1234,
      "formatted": "20m 34s"
    },
    "redis": {
      "configured": true,
      "health": {
        "enabled": true,
        "connected": true,
        "message": "Redis connected successfully",
        "testResult": {
          "success": true,
          "latency": 12
        }
      },
      "connections": {
        "rate-limit-client": {
          "totalConnections": 1,
          "totalErrors": 0,
          "totalTimeouts": 0
        }
      }
    },
    "api": {
      "metrics": {
        "/api/analytics": {
          "count": 5,
          "avgDuration": 856,
          "errors": 0,
          "slowRequests": 2,
          "errorRate": 0,
          "slowRate": 40
        }
      }
    }
  }
}
```

### 5. Dev Initialization (`src/lib/dev-init.ts`)

**Purpose:** Automatic setup of all debugging tools during Next.js startup

**Features:**
- Automatic hang detection (10s interval)
- Redis monitoring (30s interval)
- Process event handlers (unhandled rejections, exceptions)
- Graceful shutdown handling
- Environment info logging

**Usage:**

Add to your `instrumentation.ts`:

```typescript
import { initializeDevTools } from '@/lib/dev-init';

export async function register() {
  // Existing Sentry setup...

  // Initialize dev tools in development
  if (process.env.NODE_ENV === 'development') {
    initializeDevTools();
  }
}
```

## 🔍 Common Debugging Scenarios

### Scenario 1: Dev Server Hangs on Startup

**Symptoms:**
- `npm run dev` starts but never becomes responsive
- No clear error message
- Process appears to be running but doesn't serve requests

**Debug Steps:**

1. **Check for pending operations:**
   ```bash
   # The dev logger will automatically log pending operations every 10s
   # Look for output like:
   # [WARN] Found 3 pending operations:
   #   redis:connect:views-client: 5234ms elapsed
   ```

2. **Check Redis connection:**
   ```bash
   # Run diagnostics after server starts (if it does)
   curl http://localhost:3000/api/dev/diagnostics?redis=true&memory=false&api=false

   # Check your Redis URL
   echo $REDIS_URL

   # Test Redis connectivity directly
   redis-cli -u $REDIS_URL ping
   ```

3. **Review startup logs:**
   - Look for color-coded logs showing what's initializing
   - Check for `[REDIS]` tagged logs showing connection attempts
   - Watch for `[TIMING]` logs that never complete

4. **Common Fixes:**
   - **Redis unreachable:** Temporarily unset `REDIS_URL` to use in-memory fallback
     ```bash
     unset REDIS_URL
     npm run dev
     ```
   - **Sentry initialization:** Check `SENTRY_DSN` is valid or disable Sentry in dev
   - **Axiom logging:** Check network connectivity to Axiom

### Scenario 2: API Routes Hanging

**Symptoms:**
- API endpoint starts responding but never completes
- Browser shows pending request indefinitely
- No error in console

**Debug Steps:**

1. **Check API logs:**
   ```
   # You'll see:
   [API] → Request: GET /api/analytics
   # But no corresponding ← Response log
   ```

2. **Check pending operations:**
   - Dev logger automatically logs pending operations
   - Look for operations related to your API route

3. **Add monitoring to specific routes:**
   ```typescript
   import { withApiMonitoring } from '@/lib/api-monitor';

   export const GET = withApiMonitoring(
     async (request) => {
       // Your existing handler
     },
     'analytics',
     { logRequestBody: true, logResponseBody: true }
   );
   ```

4. **Check Redis operations:**
   - If the API uses Redis, check Redis connection status
   - Look for `[REDIS]` logs showing timeouts
   - Check diagnostics endpoint for Redis health

5. **Common Fixes:**
   - **Redis timeout:** Operations are automatically timed out after 3s
   - **Missing await:** Check all async operations have `await`
   - **Connection pool exhaustion:** Redis clients are reused; check for leaks

### Scenario 3: Memory Leaks

**Symptoms:**
- Dev server gets slower over time
- Memory usage keeps increasing
- Eventually crashes with OOM error

**Debug Steps:**

1. **Monitor memory usage:**
   ```bash
   # Check diagnostics periodically
   while true; do
     curl -s http://localhost:3000/api/dev/diagnostics | \
       jq '.diagnostics.memory'
     sleep 5
   done
   ```

2. **Check operation counts:**
   ```typescript
   // In your code or console
   import { devLogger } from '@/lib/dev-logger';
   console.log(devLogger.getStats());
   ```

3. **Review Redis connections:**
   ```bash
   curl -s http://localhost:3000/api/dev/diagnostics | \
     jq '.diagnostics.redis.connections'
   ```

4. **Common Fixes:**
   - **Redis clients not reused:** Check global client pattern is used
   - **Event listeners accumulating:** Ensure cleanup in useEffect/component unmount
   - **Large data structures:** Check for caching that never expires

### Scenario 4: Slow API Responses

**Symptoms:**
- API works but takes too long
- User experience is degraded
- No clear bottleneck

**Debug Steps:**

1. **Check API metrics:**
   ```bash
   curl -s http://localhost:3000/api/dev/diagnostics | \
     jq '.diagnostics.api.metrics'
   ```

2. **Review timing logs:**
   - Look for `[TIMING]` logs with high durations
   - Color coding: green (<500ms), yellow (500-1000ms), red (>1000ms)

3. **Identify bottleneck:**
   ```typescript
   // Add fine-grained timing
   import { devLogger } from '@/lib/dev-logger';

   devLogger.startTiming('db-query', 'Database query');
   const data = await db.query();
   devLogger.endTiming('db-query', 'Database query');

   devLogger.startTiming('redis-fetch', 'Redis fetch');
   const cached = await redis.get('key');
   devLogger.endTiming('redis-fetch', 'Redis fetch');
   ```

4. **Common Issues:**
   - **N+1 queries:** Multiple sequential Redis/DB calls
   - **Missing indexes:** Database queries scanning full tables
   - **Large payloads:** Excessive data being transferred
   - **Synchronous blocking:** CPU-intensive operations blocking event loop

## 📊 Monitoring Dashboard

While running in development, you can monitor:

### Terminal Output
- Color-coded logs with timing information
- Automatic hang detection warnings
- Redis connection status updates

### Diagnostics Endpoint
```bash
# Watch live diagnostics
watch -n 2 'curl -s http://localhost:3000/api/dev/diagnostics | jq .'
```

### Manual Checks
```typescript
import { devLogger } from '@/lib/dev-logger';
import { redisManager } from '@/lib/redis-debug';
import { apiMetrics } from '@/lib/api-monitor';

// Check pending operations
devLogger.logPendingOperations();

// Check Redis status
redisManager.logStatus();

// Get operation stats
console.log(devLogger.getStats());

// Get API metrics
console.log(apiMetrics.getMetrics());
```

## 🎯 Best Practices

1. **Always check diagnostics endpoint first** when debugging issues
2. **Use `devLogger.trackAsync()`** for all new async operations during development
3. **Monitor memory usage** during long dev sessions
4. **Check for pending operations** if server becomes unresponsive
5. **Review timing logs** to identify slow operations early
6. **Test with Redis disabled** to isolate Redis-related issues
7. **Use API monitoring** for all new API routes during development

## 🔧 Configuration

All debugging tools are:
- ✅ **Automatically enabled** in `NODE_ENV=development`
- ❌ **Completely disabled** in production
- 🎨 **Color-coded** for easy visual parsing
- ⚡ **Zero-overhead** when disabled

### Environment Variables

```bash
# Required for Redis debugging
REDIS_URL=redis://localhost:6379

# Optional: Adjust timeouts (in dev-init.ts or redis-debug.ts)
# REDIS_CONNECT_TIMEOUT=5000
# REDIS_OPERATION_TIMEOUT=3000
```

## 🚀 Quick Start

1. **Enable in instrumentation:**
   ```typescript
   // src/instrumentation.ts
   import { initializeDevTools } from '@/lib/dev-init';

   export async function register() {
     if (process.env.NODE_ENV === 'development') {
       initializeDevTools();
     }
   }
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **Watch terminal output** for color-coded logs

4. **Check diagnostics:**
   ```bash
   curl http://localhost:3000/api/dev/diagnostics | jq .
   ```

5. **Debug specific issues** using the scenarios above

## 📝 Related Documentation

- [Redis Health Check](../platform/view-counts) - Production Redis monitoring
- [Error Monitoring](../operations/error-monitoring-strategy) - Sentry integration
- [API Security](../security/api-security-audit) - Rate limiting and security

## 🆘 Getting Help

If you encounter issues not covered by this guide:

1. Check diagnostics endpoint for current system state
2. Review recent git commits for breaking changes
3. Search for similar error patterns in logs
4. Check Redis and database connectivity independently
5. Try disabling external services one by one to isolate the issue

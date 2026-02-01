<!-- TLP:CLEAR -->

# Debugging Documentation

**Last Updated:** 2025-12-05

Comprehensive debugging tools and documentation for troubleshooting async operations, hanging processes, and performance issues in development.

## 📚 Documentation Index

### Quick Start
- **[Quick Reference](./quick-reference)** - One-page guide for common debugging tasks
  - Quick commands and code patterns
  - Debug checklist
  - Emergency procedures
  - Pro tips

### Comprehensive Guide
- **[Dev Debugging Guide](./dev-debugging-guide)** - Complete debugging documentation
  - Tool overview and API reference
  - Common debugging scenarios with solutions
  - Monitoring dashboard setup
  - Best practices and configuration

### Implementation Details
- **Implementation Summary** - Technical implementation details
  - Deliverables and integration points
  - Testing procedures
  - Performance impact
  - Maintenance guidelines

## 🛠️ Available Tools

### 1. Dev Logger
**File:** `src/lib/dev-logger.ts`

Color-coded verbose logging with timing information and hang detection.

```typescript
import { devLogger } from '@/lib/dev-logger';

devLogger.info('Server started');
await devLogger.trackAsync('op-id', async () => { ... }, 'Description');
```

### 2. Redis Debug Manager
**File:** `src/lib/redis-debug.ts`

Enhanced Redis connection management with timeouts and monitoring.

```typescript
import { redisManager } from '@/lib/redis-debug';

const client = await redisManager.getClient('client-id');
const result = await redisManager.withTimeout('client-id', ...);
```

### 3. API Monitor
**File:** `src/lib/api-monitor.ts`

API route performance monitoring and tracking.

```typescript
import { withApiMonitoring } from '@/lib/api-monitor';

export const GET = withApiMonitoring(handler, 'route-name');
```

### 4. Diagnostics Endpoint
**URL:** `/api/dev/diagnostics`

Real-time system health check endpoint.

```bash
curl http://localhost:3000/api/dev/diagnostics | jq .
```

### 5. Dev Initialization
**File:** `src/lib/dev-init.ts`

Automatic setup of all debugging tools (called via instrumentation.ts).

## 🚀 Getting Started

### Prerequisites
- Node.js development environment
- Optional: Redis instance for testing

### Setup

1. **Automatic Setup (Recommended)**
   ```bash
   # Tools initialize automatically when you start dev server
   npm run dev
   ```

2. **Verify Installation**
   ```bash
   # Check for initialization message in terminal
   # Should see: "🔧 Initializing development debugging tools..."

   # Test diagnostics endpoint
   curl http://localhost:3000/api/dev/diagnostics | jq .
   ```

3. **Start Debugging**
   - Watch terminal for color-coded logs
   - Check diagnostics for system health
   - Refer to Quick Reference for common tasks

## 🎯 Common Use Cases

### Debugging Hanging Dev Server
1. Check terminal for pending operations (logged every 10s)
2. Run diagnostics: `curl localhost:3000/api/dev/diagnostics`
3. Check Redis connectivity: `redis-cli -u $REDIS_URL ping`
4. Try disabling Redis: `unset REDIS_URL && npm run dev`

See: DEV_DEBUGGING_GUIDE.md - Scenario 1

### Debugging Slow API Routes
1. Add API monitoring: `withApiMonitoring(handler, 'route-name')`
2. Check API metrics: `curl localhost:3000/api/dev/diagnostics | jq .diagnostics.api`
3. Review timing logs in terminal
4. Add granular timing for bottlenecks

See: DEV_DEBUGGING_GUIDE.md - Scenario 4

### Debugging Redis Issues
1. Check Redis health in diagnostics
2. Review Redis connection stats
3. Monitor with: `redisManager.logStatus()`
4. Test with Redis disabled

See: DEV_DEBUGGING_GUIDE.md - Scenario 1

### Monitoring Memory Leaks
1. Watch memory in diagnostics
2. Check operation counts: `devLogger.getStats()`
3. Review Redis connection counts
4. Look for accumulating operations

See: DEV_DEBUGGING_GUIDE.md - Scenario 3

## 📊 Quick Commands

```bash
# System health check
curl http://localhost:3000/api/dev/diagnostics | jq .

# Monitor memory usage
watch -n 2 'curl -s localhost:3000/api/dev/diagnostics | jq .diagnostics.memory'

# Check API performance
curl -s http://localhost:3000/api/dev/diagnostics | jq .diagnostics.api.metrics

# Check Redis status
curl -s http://localhost:3000/api/dev/diagnostics | jq .diagnostics.redis

# Disable Redis for testing
unset REDIS_URL && npm run dev
```

## 🎨 Features

### Automatic (Zero Configuration)
- ✅ Color-coded terminal output
- ✅ Hang detection every 10 seconds
- ✅ Redis monitoring every 30 seconds
- ✅ Process event handlers
- ✅ Graceful shutdown cleanup
- ✅ Zero production overhead

### Manual (Opt-in)
- 📝 API route monitoring
- 📝 Redis operation timeouts
- 📝 Custom timing tracking
- 📝 Health check endpoint

## 🔒 Security

- **Development Only:** All tools automatically disabled in production
- **Zero Overhead:** No code execution or bundle impact in production
- **Safe Defaults:** Graceful failure handling, no crashes
- **No Sensitive Data:** Auth tokens and cookies excluded from logs

## 📖 Documentation Map

```
docs/debugging/
├── README.md                    # This file - overview and index
├── QUICK_REFERENCE.md          # One-page quick reference
├── DEV_DEBUGGING_GUIDE.md      # Comprehensive guide (400+ lines)
└── IMPLEMENTATION_SUMMARY.md   # Technical implementation details

src/lib/
├── dev-logger.ts               # Verbose logging utility
├── redis-debug.ts              # Redis connection manager
├── api-monitor.ts              # API monitoring wrapper
└── dev-init.ts                 # Automatic initialization

src/app/api/dev/
└── diagnostics/route.ts        # Health check endpoint

src/
└── instrumentation.ts          # Integration point
```

## 🆘 Getting Help

1. **Check Quick Reference** - [QUICK_REFERENCE.md](./quick-reference)
2. **Review Common Scenarios** - [DEV_DEBUGGING_GUIDE.md](./dev-debugging-guide)
3. **Run Diagnostics** - `curl localhost:3000/api/dev/diagnostics | jq .`
4. **Check Terminal Logs** - Look for color-coded errors/warnings
5. **Test with Minimal Config** - Disable external services one by one

## 🔗 Related Documentation

- [Redis Health Check](../platform/view-counts) - Production Redis monitoring
- [Error Monitoring](../operations/error-monitoring-strategy) - Sentry integration
- API Security - Rate limiting and security
- [Testing Guide](../testing/readme) - Test infrastructure

## 📝 Contributing

When adding new async operations or API routes:

1. Use `devLogger.trackAsync()` to track timing
2. Wrap API handlers with `withApiMonitoring()`
3. Use `redisManager` for Redis connections
4. Add scenarios to DEV_DEBUGGING_GUIDE.md if needed
5. Update QUICK_REFERENCE.md with new patterns

## ✅ Quick Health Check

Run this to verify everything is working:

```bash
# Start dev server
npm run dev

# In another terminal:
# 1. Check diagnostics endpoint
curl http://localhost:3000/api/dev/diagnostics | jq .success

# 2. Verify you see initialization message in first terminal
# Should see: "🔧 Initializing development debugging tools..."

# 3. Wait 10 seconds and check for hang detection
# Should see: "No pending operations" or list of pending operations

# All good if:
# - Diagnostics returns { "success": true }
# - Initialization message appeared
# - Hang detection is running
```

---

**Need Help?** Start with [QUICK_REFERENCE.md](./quick-reference) for common tasks or [DEV_DEBUGGING_GUIDE.md](./dev-debugging-guide) for comprehensive documentation.

{/* TLP:CLEAR */}

# Dev Debugging Quick Reference

**Last Updated:** 2025-12-05

One-page reference for common debugging tasks in development.

## 🚀 Quick Commands

```bash
# Check system health
curl http://localhost:3000/api/dev/diagnostics | jq .

# Check Redis only
curl http://localhost:3000/api/dev/diagnostics?memory=false&api=false | jq .redis

# Monitor memory usage
watch -n 2 'curl -s http://localhost:3000/api/dev/diagnostics | jq .diagnostics.memory'

# Check API performance
curl -s http://localhost:3000/api/dev/diagnostics | jq .diagnostics.api.metrics

# Disable Redis temporarily
unset REDIS_URL && npm run dev
```

## 📝 Common Code Patterns

### Track Async Operation
```typescript
import { devLogger } from '@/lib/dev-logger';

const result = await devLogger.trackAsync(
  'operation-id',
  async () => { /* your code */ },
  'Human readable description'
);
```

### Monitor API Route
```typescript
import { withApiMonitoring } from '@/lib/api-monitor';

export const GET = withApiMonitoring(
  async (request) => { /* handler */ },
  'route-name'
);
```

### Use Redis with Timeout
```typescript
import { redisManager } from '@/lib/redis-debug';

const result = await redisManager.withTimeout(
  'client-id',
  async (client) => client.get('key'),
  'operation-name',
  3000 // timeout in ms
);
```

### Manual Timing
```typescript
import { devLogger } from '@/lib/dev-logger';

devLogger.startTiming('op-id', 'Description');
// ... do work ...
devLogger.endTiming('op-id', 'Description');
```

## 🐛 Debug Checklist

When dev server hangs or fails:

- [ ] Check terminal for color-coded error logs
- [ ] Run diagnostics: `curl localhost:3000/api/dev/diagnostics | jq .`
- [ ] Check for pending operations in logs
- [ ] Verify Redis connection: `redis-cli -u $REDIS_URL ping`
- [ ] Check memory usage isn't at 100%
- [ ] Review recent git commits: `git log --oneline -5`
- [ ] Try disabling Redis: `unset REDIS_URL`
- [ ] Check for unhandled promise rejections in logs
- [ ] Verify all async operations have `await`

## 🎨 Log Level Colors

- 🔵 **BLUE** - INFO: General information
- 🟡 **YELLOW** - WARN: Warnings and slow operations
- 🔴 **RED** - ERROR: Errors and failures
- 🟢 **GREEN** - TIMING: Completed operations
- 🟣 **MAGENTA** - REDIS: Redis operations
- 🔷 **CYAN** - API: API requests/responses
- ⚪ **GRAY** - DEBUG: Verbose debugging info

## ⏱️ Performance Thresholds

- **< 500ms**: Good (green)
- **500-1000ms**: Slow (yellow)
- **> 1000ms**: Very slow (red)
- **> 3000ms**: Timeout (auto-fails)

## 🔧 Environment Setup

Add to `.env.local`:
```bash
# Development only
NODE_ENV=development

# Optional: Redis (comment out to test without Redis)
REDIS_URL=redis://localhost:6379

# Optional: Disable Sentry in dev
# SENTRY_DSN=
```

## 📊 Key Files

```
src/lib/
├── dev-logger.ts       # Verbose logging
├── redis-debug.ts      # Redis connection management
├── api-monitor.ts      # API route monitoring
└── dev-init.ts         # Automatic initialization

src/app/api/dev/
└── diagnostics/        # Health check endpoint
    └── route.ts

docs/debugging/
├── DEV_DEBUGGING_GUIDE.md    # Full guide
└── QUICK_REFERENCE.md        # This file
```

## 🆘 Emergency Procedures

### Server Won't Start
```bash
# 1. Kill any hanging processes
killall node

# 2. Clear Next.js cache
rm -rf .next

# 3. Start with minimal config
unset REDIS_URL
unset SENTRY_DSN
npm run dev
```

### Redis Connection Issues
```bash
# 1. Test Redis directly
redis-cli -u $REDIS_URL ping

# 2. Check Redis is running
redis-cli ping

# 3. Use in-memory fallback
unset REDIS_URL
npm run dev
```

### Memory Leak
```bash
# 1. Restart dev server
killall node && npm run dev

# 2. Monitor memory growth
watch -n 2 'curl -s localhost:3000/api/dev/diagnostics | jq .diagnostics.memory'

# 3. Check operation counts
# Look for operations that keep incrementing
```

## 💡 Pro Tips

1. **Keep diagnostics open** in a separate terminal tab during development
2. **Watch for red timing logs** - they indicate bottlenecks
3. **Check pending operations** if you see hangs (logged every 10s)
4. **Use `trackAsync`** for any new async code while debugging
5. **Color codes are your friend** - scan for yellow/red in logs
6. **Redis is optional** in dev - disable if causing issues
7. **Diagnostics endpoint** shows real-time health - use it!

## 📖 Full Documentation

See [DEV_DEBUGGING_GUIDE.md](./dev-debugging-guide) for:
- Complete API reference
- Detailed troubleshooting scenarios
- Configuration options
- Best practices
- Examples and code patterns

{/* TLP:CLEAR */}

# Tracking Verification Quick Reference

## TL;DR: ✅ All Systems Working (Redis Verified)

Views and shares increment correctly. Anti-spam protection working. Rate limits enforced. Redis persistence confirmed.

## Quick Test

```bash
# Run automated test suite (with Redis)
node scripts/test-tracking.mjs

# Expected output:
# ✓ Redis: Connected
# ✓ Cleared X test-related keys from Redis
# ✓ All tracking tests pass
# ✓ Redis key exists with value: X
```

## What Gets Tested

### ✅ View Tracking
- Normal view (6s) → Recorded
- Duplicate (same session) → Rejected  
- Quick view (1s) → Rejected
- Multiple sessions → All recorded

### ✅ Share Tracking
- Normal share (3s) → Recorded
- Duplicate (same session) → Rejected
- Quick share (0.5s) → Rejected  
- Rate limit (3/min) → Enforced

## Expected Behavior

### Counters Increment
```json
// Success
{ "count": 1, "recorded": true }
```

### Duplicates Rejected
```json
// Duplicate
{ "recorded": false, "message": "Already recorded for this session" }
```

### Rate Limits Enforced
```json
// Rate limited
{ "error": "Rate limit exceeded", "recorded": false }
```

### Time Validation
```json
// Too fast
{ "error": "Insufficient time on page", "recorded": false }
```

## Protection Layers

1. **Session Deduplication** ✅
   - Views: 30 min window
   - Shares: 5 min window

2. **Time Validation** ✅
   - Views: ≥5s on page
   - Shares: ≥2s on page

3. **Rate Limiting** ✅
   - Views: 10/5min per IP
   - Shares: 3/60s per IP

4. **User-Agent Validation** ✅
5. **Abuse Pattern Detection** ✅

## Manual Verification

### Test View Tracking
```bash
curl -X POST http://localhost:3000/api/views \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0" \
  -d '{
    "postId": "test-post",
    "sessionId": "'"$(uuidgen)"'",
    "timeOnPage": 6000,
    "isVisible": true
  }'
```

### Test Share Tracking
```bash
curl -X POST http://localhost:3000/api/shares \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0" \
  -d '{
    "postId": "test-post",
    "sessionId": "'"$(uuidgen)"'",
    "timeOnPage": 3000
  }'
```

## Troubleshooting

### "Redis not configured"
- ⚠️ Check .env.local or .env.development.local for REDIS_URL
- Test script uses dotenv to load environment variables
- If URL is set but not loading, restart the test
- In-memory fallback works but no persistence

### "Rate limit exceeded"
- ✅ Expected behavior
- Wait for window to expire
- Different IPs not affected

### "Already recorded"
- ✅ Session deduplication working
- Use new sessionId to test
- Wait for window to expire

### "Insufficient time on page"
- ✅ Time validation working
- Increase timeOnPage value
- Views need ≥5s, shares ≥2s

## Files

- Test script: `scripts/test-tracking.mjs`
- Full report: `docs/operations/tracking-verification-2025-11-09.md`
- API docs: `docs/api/reference.md`
- Quick ref: `docs/security/anti-spam-quick-ref.md`

## Status

**Last verified:** November 9, 2025  
**Result:** ✅ All systems operational with Redis  
**Redis:** Connected and verified  
**Environment:** .env.local loaded automatically  
**Changes needed:** None

## Recent Updates

### November 9, 2025
- ✅ Fixed test script to load .env.local and .env.development.local
- ✅ Added automatic Redis test data cleanup
- ✅ Verified full Redis persistence (4 views, 2 shares stored)
- ✅ Added delays between test batches to avoid rate limits
- ✅ All tests passing with Redis connection

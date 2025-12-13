# BotID Implementation Guide

This document covers the implementation of Vercel BotID for bot protection across the application.

## Overview

BotID is Vercel's bot protection service that helps identify and block malicious bot traffic while allowing legitimate users and good bots (like search engine crawlers) through. It works by analyzing request patterns, device fingerprints, and behavioral signals.

**Documentation**: <https://vercel.com/docs/botid/get-started>

## Architecture

BotID operates in two layers:

1. **Client-side**: Initializes protection and collects device/browser signals
2. **Server-side**: Validates requests and makes the final bot/human determination

Both layers must be configured for protection to work.

## Implementation

### 1. Package Installation

BotID is already installed as a dependency:

```json
{
  "dependencies": {
    "botid": "^1.5.10"
  }
}
```

### 2. Next.js Configuration

The Next.js config is wrapped with `withBotId` to set up proxy rewrites that prevent ad-blockers from interfering with BotID:

**File**: `next.config.ts`

```typescript
import { withBotId } from "botid/next/config";

const nextConfig: NextConfig = {
  // ... your config
};

export default withSentryConfig(
  withBundleAnalyzer(withBotId(nextConfig)),
  // ... sentry config
);
```

### 3. Client-Side Initialization

Client-side BotID is initialized in the instrumentation file to protect specific API routes:

**File**: `src/instrumentation-client.ts`

```typescript
import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    {
      path: "/api/contact",
      method: "POST",
    },
    // Add more protected routes as needed
  ],
});
```

**Why instrumentation file?**
- For Next.js 15.3+, this is the recommended location for optimal performance
- Runs before any page loads, ensuring protection is active immediately
- Centralized configuration for all protected routes

**Alternative for Next.js < 15.3**:
You can use the `<BotIdClient />` component in `app/layout.tsx`:

```typescript
import { BotIdClient } from "botid/client";

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <BotIdClient protect={[{ path: "/api/contact", method: "POST" }]} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 4. Server-Side Verification

Each protected API route must call `checkBotId()` to verify the request:

**File**: `src/app/api/contact/route.ts`

```typescript
import { checkBotId } from "botid/server";

export async function POST(request: Request) {
  try {
    // Check for bot traffic using Vercel BotID
    const verification = await checkBotId();

    if (verification.isBot) {
      console.log("[Contact API] Bot detected by BotID - blocking request");
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Continue with normal request handling...
  } catch (error) {
    // Handle errors
  }
}
```

## Protected Routes

### Current Implementation

| Route | Method | Status | Notes |
|-------|--------|--------|-------|
| `/api/contact` | POST | ✅ Protected | Contact form submission |

### Potential Candidates for Protection

Consider adding BotID protection to these routes if they become targets for bot abuse:

| Route | Method | Use Case | Priority |
|-------|--------|----------|----------|
| `/api/views` | POST | Blog view tracking | Low (already has rate limiting) |
| `/api/shares` | POST | Social share tracking | Low (already has rate limiting) |
| `/api/analytics` | GET | Analytics dashboard | Low (requires API key) |

## Advanced Configuration

### Check Levels

BotID supports two check levels:

- **`basic`** (default): Fast, lightweight checks suitable for most use cases
- **`deepAnalysis`**: More thorough analysis for high-value endpoints

```typescript
// Client-side (instrumentation-client.ts)
initBotId({
  protect: [
    {
      path: "/api/checkout",
      method: "POST",
      advancedOptions: {
        checkLevel: "deepAnalysis",
      },
    },
  ],
});

// Server-side (route.ts)
const verification = await checkBotId({
  advancedOptions: {
    checkLevel: "deepAnalysis", // Must match client-side
  },
});
```

**Important**: The `checkLevel` must match on both client and server sides, or verification will fail.

### Cross-Domain Requests

If your frontend and backend are on different domains, add trusted domains to `extraAllowedHosts`:

```typescript
const verification = await checkBotId({
  advancedOptions: {
    extraAllowedHosts: ["app.example.com", "dashboard.example.com"],
  },
});
```

**Security Note**: Only add domains you control to this list.

## Local Development

### Development Behavior

In development (`NODE_ENV=development`), BotID allows all requests by default to avoid blocking during testing.

### Simulating Bot Detection

To test bot blocking behavior locally:

```typescript
const verification = await checkBotId({
  developmentOptions: {
    bypass: "BAD-BOT", // Default: "HUMAN"
  },
});
```

**Available values**:
- `"HUMAN"` - Simulates a legitimate user (default)
- `"BAD-BOT"` - Simulates a malicious bot
- `"GOOD-BOT"` - Simulates a search engine crawler

**Important**: `developmentOptions` are ignored in production.

## Multi-Layer Protection Strategy

BotID is part of a comprehensive security strategy:

```typescript
export async function POST(request: Request) {
  // Layer 1: BotID (blocks automated bots)
  // BotID check can be toggled via the `ENABLE_BOTID` environment variable
  // (set to '1' to enable in staging/prod). Default: disabled.
  if (process.env.ENABLE_BOTID === '1') {
    const verification = await checkBotId();
    if (verification.isBot) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
  }
  if (verification.isBot) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Layer 2: Rate limiting (prevents abuse)
  const rateLimitResult = await rateLimit(clientIp, RATE_LIMIT_CONFIG);
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Layer 3: Honeypot (catches simple bots)
  if (website && website.trim() !== "") {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  // Layer 4: Input validation (prevents injection attacks)
  if (!validateEmail(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Process legitimate request...
}
```

### When to Use Each Layer

| Layer | Purpose | Use Case |
|-------|---------|----------|
| BotID | Block automated bots | All public POST endpoints |
| Rate Limiting | Prevent abuse | All public endpoints |
| Honeypot | Catch simple bots | Forms only |
| Input Validation | Prevent injection | All endpoints receiving user input |

## Monitoring

### Success Indicators

- Reduced spam submissions in contact form
- Lower rate limit triggers from legitimate users
- Stable API response times (BotID adds ~10-50ms latency)

### Logging

BotID checks are logged for monitoring:

```typescript
if (verification.isBot) {
  console.log("[Contact API] Bot detected by BotID - blocking request");
  return NextResponse.json({ error: "Access denied" }, { status: 403 });
}
```

Check server logs for patterns:
- Sudden increase in bot detections → Potential attack
- False positives → Consider adjusting check level
- Zero detections after deployment → Verify configuration

### Vercel Dashboard

Monitor BotID effectiveness in the Vercel dashboard:
1. Navigate to your project
2. Go to **Security** tab
3. View **BotID** metrics

## Troubleshooting

### Issue: "Access denied" for legitimate users

**Causes**:
1. Ad-blocker interfering with BotID scripts
2. Privacy extensions blocking fingerprinting
3. Misconfigured check levels (client/server mismatch)

**Solutions**:
1. Verify `withBotId` is wrapping `next.config.ts`
2. Check that `checkLevel` matches on client and server
3. Consider fallback for users with strict privacy settings

### Issue: BotID not blocking known bots

**Causes**:
1. Client-side protection not initialized
2. Server-side check missing from route
3. Development mode enabled in production

**Solutions**:
1. Verify `initBotId()` is called in `instrumentation-client.ts`
2. Add `checkBotId()` call to API route
3. Check `NODE_ENV` environment variable

### Issue: CORS errors with BotID

**Cause**: Frontend and backend on different domains without `extraAllowedHosts`

**Solution**: Add trusted domains to server-side config:

```typescript
const verification = await checkBotId({
  advancedOptions: {
    extraAllowedHosts: ["your-frontend-domain.com"],
  },
});
```

## Migration Checklist

When adding BotID to a new route:

- [ ] Add route to `protect` array in `instrumentation-client.ts`
- [ ] Import `checkBotId` from `botid/server` in route file
- [ ] Add bot check at start of route handler
- [ ] Return 403 status if `verification.isBot` is true
- [ ] Add logging for bot detections
- [ ] Test locally with `developmentOptions.bypass = "BAD-BOT"`
- [ ] Deploy to preview environment
- [ ] Monitor logs for false positives
- [ ] Verify legitimate requests still work

## References

- [Vercel BotID Documentation](https://vercel.com/docs/botid/get-started)
- [Advanced Configuration](https://vercel.com/docs/botid/advanced-configuration)
- [Local Development Behavior](https://vercel.com/docs/botid/local-development-behavior)
- [Security Best Practices](/docs/security/security-best-practices)
- [Rate Limiting Implementation](/docs/security/rate-limiting)

## Changelog

### 2025-01-24
- **Added**: BotID implementation for `/api/contact` route
- **Added**: Server-side verification with `checkBotId()`
- **Added**: Comprehensive documentation

### Future Enhancements

- Consider adding BotID to `/api/views` and `/api/shares` if bot traffic increases
- Implement custom bot detection metrics dashboard
- Add Sentry integration for bot detection events


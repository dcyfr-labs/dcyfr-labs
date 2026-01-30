<!-- TLP:CLEAR -->

# Bot Detection with Vercel BotID

**Last Updated:** November 19, 2025  
**Status:** ✅ Active  
**Library:** `botid` v1.5.10

## Overview

This project uses Vercel BotID to detect and block automated bot traffic. BotID protects API routes and server actions from abuse while allowing legitimate users through.

## Architecture

Bot ID uses a three-part system:

1. **Client-side**: JavaScript challenge runs on pages to classify sessions
2. **Config**: Next.js rewrites route BotID requests to avoid ad-blockers
3. **Server-side**: `checkBotId()` function verifies if request is from a bot

### Flow Diagram

```text
Page Load → initBotId() runs challenge
              ↓
        Sets classification headers
              ↓
      User makes API request
              ↓
   API calls checkBotId()
              ↓
   Returns { isBot: boolean }
              ↓
   Allow or deny request
```

## Implementation

### 1. Client-Side Initialization (`src/instrumentation-client.ts`)

```typescript
import { initBotId } from "botid/client/core";

// Initialize BotID with protected routes
initBotId({
  protect: [
    {
      path: "/api/contact",
      method: "POST",
    },
    // Add more protected routes
  ],
});
```

**Protected Routes**: Only routes listed in `protect` will have BotID classification headers attached to requests.

### 2. Next.js Configuration (`next.config.ts`)

```typescript
import { withBotId } from "botid/next/config";

export default withBotId(nextConfig);
```

**Purpose**: Sets up proxy rewrites so ad-blockers don't block BotID requests.

### 3. Server-Side Verification (API Routes)

```typescript
import { checkBotId } from "botid/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Check if request is from a bot
  const verification = await checkBotId();
  
  if (verification.isBot) {
    return NextResponse.json(
      { error: "Bot detected" },
      { status: 403 }
    );
  }
  
  // Process legitimate request
  const data = await processRequest(request);
  return NextResponse.json({ data });
}
```

## Use Cases

### 1. Protect API Endpoints

Block bots from form submissions, checkouts, and sensitive operations:

```typescript
// src/app/api/contact/route.ts
import { checkBotId } from "@/lib/bot-detection";

export async function POST(request: NextRequest) {
  const verification = await checkBotId();
  
  if (verification.isBot) {
    return new Response("Access denied", { status: 403 });
  }
  
  // Process contact form
  const formData = await request.json();
  await sendEmail(formData);
  return new Response("Success", { status: 200 });
}
```

### 2. Conditional Rate Limiting

Apply stricter limits to suspicious traffic:

```typescript
import { checkBotId } from "@/lib/bot-detection";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const verification = await checkBotId();
  
  // Stricter limits for bots
  const limit = verification.isBot ? 5 : 10;
  const rateLimitResult = await rateLimit(ip, {
    limit,
    windowInSeconds: 60
  });
  
  if (!rateLimitResult.success) {
    return new Response("Too many requests", { status: 429 });
  }
  
  // Process request
}
```

### 3. Protect Server Actions

```typescript
'use server';

import { checkBotId } from "@/lib/bot-detection";

export async function createUser(formData: FormData) {
  const verification = await checkBotId();
  
  if (verification.isBot) {
    throw new Error('Bot detected');
  }
  
  // Create user
  const userData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
  };
  
  await saveUser(userData);
  return { success: true };
}
```

## API Reference

### `checkBotId()`

Check if the current request is from a bot.

**Returns:** `Promise<{ isBot: boolean }>`

**Requirements:**
- Route must be in `initBotId({ protect: [...] })` configuration
- Must be called from API route or Server Action (not Server Components)

**Example:**
```typescript
const verification = await checkBotId();
if (verification.isBot) {
  // Block or handle bot traffic
}
```

## Configuration

### Protected Routes

Configure in `src/instrumentation-client.ts`:

```typescript
initBotId({
  protect: [
    {
      path: "/api/contact",
      method: "POST",
    },
    {
      path: "/api/checkout",
      method: "POST",
    },
    {
      // Wildcard: /api/user/123, /api/user/456, etc.
      path: "/api/user/*",
      method: "POST",
    },
    {
      // Multi-segment wildcard: /team/a/activate, /team/a/b/activate, etc.
      path: "/team/*/activate",
      method: "POST",
    },
  ],
});
```

**Important:** Routes not in `protect` will fail `checkBotId()` checks.

## Testing

### Local Development

By default, BotID always returns `isBot: false` in development to avoid blocking developers.

### Test with curl

BotID requires client-side JavaScript, so `curl` requests will be blocked:

```bash
# This will be detected as a bot (no JavaScript)
curl -X POST https://your-app.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Test from Browser

Make requests from a page in your app using `fetch`:

```typescript
// app/test/page.tsx
'use client';

export default function TestPage() {
  async function testEndpoint() {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    });
    
    console.log('Status:', response.status);
    console.log('Data:', await response.json());
  }
  
  return <button onClick={testEndpoint}>Test BotID</button>;
}
```

## Performance

- **Client overhead**: ~5-10ms for challenge execution
- **Server overhead**: \<1ms for verification
- **Network**: No external API calls (runs locally)
- **Bundle size**: ~15KB gzipped

## Monitoring

### Check BotID Status

View BotID status in Vercel Firewall dashboard:

1. Navigate to your project in Vercel
2. Click "Firewall" tab
3. View bot detection analytics

### Enable Deep Analysis (Pro/Enterprise)

For enhanced bot detection with machine learning:

1. Go to Vercel dashboard → Project → Firewall → Configure
2. Enable "Vercel BotID Deep Analysis"
3. Deploy your app

## Troubleshooting

### `checkBotId()` fails with error

**Cause:** Route not in `protect` configuration

**Solution:** Add route to `initBotId({ protect: [...] })` in `instrumentation-client.ts`

### All requests blocked as bots

**Cause:** Client-side JavaScript not running

**Solution:** Ensure `initBotId()` is called in `instrumentation-client.ts` and page loads JavaScript

### BotID not working in development

**Expected:** BotID returns `isBot: false` in development by default

**Solution:** Use production deployment for testing, or configure `developmentOptions`

## Best Practices

### ✅ DO:
- Protect sensitive API routes (forms, checkout, user actions)
- Call `checkBotId()` early in API handlers
- Handle bot detection gracefully (403 with message)
- Test in production environment
- Monitor bot traffic via Vercel dashboard

### ❌ DON'T:
- Use BotID in Server Components (won't work)
- Forget to add routes to `protect` configuration
- Block all bots (search engines need access)
- Use `checkBotId()` on public read-only endpoints
- Rely solely on BotID (combine with rate limiting)

## Migration from Previous Implementation

This implementation is different from the initial attempt:

**Before (incorrect):**
- Used `botid()` in proxy middleware ❌
- Passed results via headers ❌
- Available in all routes ❌

**Now (correct):**
- Uses `initBotId()` client-side ✅
- Uses `checkBotId()` server-side ✅
- Only works on protected routes ✅

## Related Documentation

- [Rate Limiting Strategy](./rate-limiting)
- API Routes
- [Vercel BotID Docs](https://vercel.com/docs/botid/get-started)

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-19 | 2.0 | Corrected implementation - client + server approach |
| 2025-11-19 | 1.0 | Initial (incorrect) proxy-based implementation |

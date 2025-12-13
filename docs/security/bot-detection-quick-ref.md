# Bot Detection Quick Reference

**Last Updated:** November 19, 2025  
**Full Docs:** [bot-detection.md](./bot-detection)

## Quick Start

### 1. Configure Protected Routes

```typescript
// src/instrumentation-client.ts
import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    { path: "/api/contact", method: "POST" },
    { path: "/api/checkout", method: "POST" },
  ],
});
```

### 2. Verify in API Routes

```typescript
// src/app/api/contact/route.ts
import { checkBotId } from "@/lib/bot-detection";

export async function POST(request: NextRequest) {
  const verification = await checkBotId();
  
  if (verification.isBot) {
    return new Response("Bot detected", { status: 403 });
  }
  
  // Process request
}
```

## Common Patterns

### Block Bots

```typescript
const verification = await checkBotId();
if (verification.isBot) {
  return NextResponse.json({ error: "Access denied" }, { status: 403 });
}
```

### Conditional Rate Limiting

```typescript
const verification = await checkBotId();
const limit = verification.isBot ? 5 : 10;

await rateLimit(ip, { limit, windowInSeconds: 60 });
```

### Log Bot Activity

```typescript
const verification = await checkBotId();
if (verification.isBot) {
  console.log("[Bot] Request blocked from", ip);
}
```

## API

| Function | Location | Use Case |
|----------|----------|----------|
| `initBotId()` | `instrumentation-client.ts` | Initialize client-side protection |
| `checkBotId()` | API routes/Server Actions | Verify if request is from bot |

## Configuration Files

| File | Purpose |
|------|---------|
| `src/instrumentation-client.ts` | Client-side BotID initialization |
| `next.config.ts` | Wrapped with `withBotId()` |
| `src/lib/bot-detection.ts` | Re-export `checkBotId` for convenience |

## Testing

### In Browser (Works)

```typescript
'use client';

async function testAPI() {
  const res = await fetch('/api/contact', {
    method: 'POST',
    body: JSON.stringify({ email: 'test@example.com' }),
  });
  console.log(res.status); // 200 (allowed)
}
```

### With curl (Blocked)

```bash
curl -X POST https://app.vercel.app/api/contact
# Returns 403 - Bot detected (no JavaScript)
```

## Performance

- **Client**: ~5-10ms challenge execution
- **Server**: \<1ms verification
- **Bundle**: ~15KB gzipped

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `checkBotId()` fails | Add route to `initBotId({ protect: [...] })` |
| All requests blocked | Ensure client-side JavaScript runs |
| Not working in dev | Expected - BotID returns `isBot: false` in development |

## Best Practices

✅ **DO:**
- Protect sensitive endpoints (forms, checkout)
- Test in production environment
- Handle gracefully (return 403 with message)
- Combine with rate limiting

❌ **DON'T:**
- Use in Server Components (API routes only)
- Forget to configure protected routes
- Block search engines (if you need SEO)
- Use for public read-only endpoints

## Important Notes

⚠️ **Protected Routes Required**: Routes MUST be in `initBotId({ protect: [...] })` or `checkBotId()` will fail

⚠️ **API Routes Only**: `checkBotId()` works in API routes and Server Actions, NOT Server Components

⚠️ **Development Behavior**: Returns `isBot: false` in development by default

---

**Need Help?** See [bot-detection.md](./bot-detection) for detailed examples and architecture.

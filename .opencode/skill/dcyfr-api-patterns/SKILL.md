---
name: dcyfr-api-patterns
description: Guide API routes with Validate→Queue→Respond pattern and Inngest integration
compatibility: opencode
metadata:
  audience: developers
  workflow: api-implementation
  category: backend
---

## What I do

I ensure DCYFR API routes follow the **Validate → Queue → Respond** pattern with Inngest integration:

- **Validate** - Input validation and error handling
- **Queue** - Offload processing to Inngest background jobs
- **Respond** - Immediate user feedback (non-blocking)
- **Error handling** - Consistent error responses
- **Rate limiting** - Protect against abuse

## When to use me

✅ **Use this skill when:**
- Creating new API routes
- Integrating Inngest background jobs
- Implementing form submissions or webhooks
- Setting up async processing workflows

❌ **Don't use this skill for:**
- Server-side data fetching (use Next.js data fetching patterns)
- Client-side API calls (use SWR or React Query)
- Real-time features (use WebSockets/Server-Sent Events)

## Core Pattern: Validate → Queue → Respond

### Standard API Route

```typescript
// src/app/api/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest';

export async function POST(request: NextRequest) {
  // STEP 1: VALIDATE
  const data = await request.json();

  if (!data.email || !data.message) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // STEP 2: QUEUE
  await inngest.send({
    name: 'form/submission',
    data: {
      email: data.email,
      message: data.message,
      timestamp: new Date().toISOString(),
    },
  });

  // STEP 3: RESPOND
  return NextResponse.json(
    { success: true, message: 'Submission received' },
    { status: 202 } // 202 Accepted - processing async
  );
}
```

## Inngest Event Naming

**Convention:** `domain/action`

**Examples:**
- `form/submission` - Form submitted
- `post/published` - Blog post published
- `user/signup` - User created
- `analytics/track` - Analytics event

## Error Handling

### Standard Error Responses

```typescript
// 400 Bad Request - Validation failure
return NextResponse.json(
  { error: 'Invalid input', details: validationErrors },
  { status: 400 }
);

// 401 Unauthorized - Missing auth
return NextResponse.json(
  { error: 'Unauthorized' },
  { status: 401 }
);

// 429 Too Many Requests - Rate limit
return NextResponse.json(
  { error: 'Rate limit exceeded', retryAfter: 60 },
  { status: 429 }
);

// 500 Internal Server Error - Unexpected failure
return NextResponse.json(
  { error: 'Internal server error' },
  { status: 500 }
);
```

## Rate Limiting

```typescript
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  // Check rate limit
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitResult = await rateLimit(ip, {
    limit: 5,
    window: 60, // 5 requests per minute
  });

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  // Continue processing...
}
```

## Common Patterns

### Form Submission

```typescript
export async function POST(request: NextRequest) {
  const data = await request.json();

  // Validate
  if (!data.email || !data.message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Queue
  await inngest.send({
    name: 'form/submission',
    data: { email: data.email, message: data.message },
  });

  // Respond
  return NextResponse.json({ success: true }, { status: 202 });
}
```

### Webhook Handler

```typescript
export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-webhook-signature');

  // Validate signature
  if (!verifyWebhookSignature(signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = await request.json();

  // Queue
  await inngest.send({
    name: 'webhook/received',
    data: payload,
  });

  // Respond
  return NextResponse.json({ received: true }, { status: 200 });
}
```

## Validation

```bash
# Check API patterns
npm run lint

# Test API routes
npm run test:run src/app/api/

# Full quality check
npm run check
```

## Related Documentation

- **Full API patterns**: `.github/agents/patterns/API_PATTERNS.md`
- **Inngest documentation**: `docs/features/inngest-integration.md`
- **Rate limiting**: `src/lib/rate-limit.ts`

## Approval Gates

API pattern compliance is **FLEXIBLE** (warning only):

- ⚠️ Reviewed during PR
- ⚠️ 80% of POST routes should use Inngest
- ✅ Must have validation and error handling

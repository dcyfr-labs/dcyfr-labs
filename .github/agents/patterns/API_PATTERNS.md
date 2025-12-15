# API & Route Patterns

**File:** `.github/agents/patterns/API_PATTERNS.md`  
**Last Updated:** December 9, 2025  
**Scope:** API routes, Inngest integration, route structure

---

## API Route Pattern: Validate → Queue → Respond

All API routes follow a consistent three-step pattern:

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

### Why This Pattern?

| Step | Benefit |
|------|---------|
| **Validate** | Fail fast, catch bad data early |
| **Queue** | Offload processing to background jobs |
| **Respond** | Give user immediate feedback (non-blocking) |

---

## Inngest Integration

### Sending Events

**From API routes:**
```typescript
await inngest.send({
  name: 'domain/event.name',
  data: {
    userId: user.id,
    action: 'submit',
  },
});
```

**Multiple events:**
```typescript
await inngest.send([
  { name: 'user/signup', data: { email } },
  { name: 'analytics/track', data: { event: 'signup' } },
]);
```

### Naming Convention

Event names follow a two-part structure:

```
domain/action
```

**Examples:**
- `form/submission` - Form submitted
- `post/published` - Blog post published
- `user/signup` - User account created
- `analytics/track` - Analytics event
- `error/reported` - Error reported

### No Return Value Expected

The API route returns **immediately** after queueing:

```typescript
// ✅ CORRECT - Returns before processing completes
await inngest.send({ name: 'form/submission', data });
return NextResponse.json({ success: true }, { status: 202 });

// ❌ WRONG - Waiting for processing (blocks user)
const result = await inngest.send({ ... });
// Processing may take seconds - user has to wait!
```

---

## Error Handling

### Validation Errors

```typescript
if (!isValid(data)) {
  return NextResponse.json(
    { error: 'Invalid input', details: errors },
    { status: 400 }
  );
}
```

### Inngest Send Failures

```typescript
try {
  await inngest.send({
    name: 'form/submission',
    data,
  });
} catch (error) {
  // Log but don't expose
  console.error('Failed to queue submission:', error);
  
  // Return success anyway (graceful degradation)
  // Or return 503 if critical
  return NextResponse.json(
    { success: false, error: 'Service temporarily unavailable' },
    { status: 503 }
  );
}
```

### 202 vs 200 Response Codes

```typescript
// ✅ 202 Accepted - Async processing
return NextResponse.json(
  { success: true },
  { status: 202 } // Request accepted, processing in background
);

// ✅ 200 OK - Synchronous processing
const result = await processImmediate(data);
return NextResponse.json({ success: true, result });

// ❌ 200 OK - Async processing (misleading)
// Don't use 200 if processing is async
```

---

## Rate Limiting & Safety

### Built-in Rate Limiting

```typescript
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.ip || 'unknown';
  
  const { success } = await rateLimit(ip, {
    limit: 10,
    window: '1h',
  });

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // ... rest of handler
}
```

### Preventing Abuse

```typescript
// Validate origin
if (request.headers.get('origin') !== process.env.SITE_URL) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 403 }
  );
}

// Sanitize input
const sanitized = data.email.toLowerCase().trim();

// Check for suspicious patterns
if (data.message.length > 10000) {
  return NextResponse.json(
    { error: 'Message too long' },
    { status: 413 }
  );
}
```

---

## Complete Example: Contact Form

```typescript
// src/app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/lib/inngest';
import { validateEmail } from '@/lib/validate';
import { rateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = request.ip || 'unknown';
    const { success: rateLimited } = await rateLimit(ip);
    
    if (!rateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request
    const body = await request.json();
    
    // Validate
    if (!body.email || !validateEmail(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    if (!body.message || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    // Queue for processing
    await inngest.send({
      name: 'contact/submission',
      data: {
        email: body.email.toLowerCase().trim(),
        message: body.message.trim(),
        subject: body.subject?.trim() || 'No subject',
        timestamp: new Date().toISOString(),
        ip,
      },
    });

    // Respond immediately (202 Accepted)
    return NextResponse.json(
      {
        success: true,
        message: 'Your message has been received. We will respond shortly.',
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
```

---

## Testing API Routes

### Unit Test Example

```typescript
// src/app/api/contact/route.test.ts
import { POST } from './route';

describe('POST /api/contact', () => {
  it('validates email', async () => {
    const request = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid',
        message: 'test',
      }),
    });

    const response = await POST(request);
    
    expect(response.status).toBe(400);
  });

  it('queues submission on valid input', async () => {
    const request = new Request('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        message: 'Hello',
      }),
    });

    const response = await POST(request);
    
    expect(response.status).toBe(202);
  });
});
```

---

## Quick Reference

| Aspect | Pattern |
|--------|---------|
| **Request Flow** | Validate → Queue → Respond |
| **Response Code** | 202 Accepted (async) or 200 OK (sync) |
| **Event Naming** | `domain/action` |
| **Queue Service** | Inngest |
| **Return Timing** | Immediately (don't wait for processing) |
| **Error Handling** | Catch, log, return 4xx/5xx |
| **Rate Limiting** | Check before processing |

---

## Related Documentation

- **Component Patterns:** `.github/agents/patterns/COMPONENT_PATTERNS.md`
- **Testing Patterns:** `.github/agents/patterns/TESTING_PATTERNS.md`
- **Design Tokens:** `.github/agents/enforcement/DESIGN_TOKENS.md`
- **Quick Reference:** `docs/ai/QUICK_REFERENCE.md`

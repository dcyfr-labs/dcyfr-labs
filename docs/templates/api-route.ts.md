# API_ROUTE.ts Template

Copy-paste template for creating a new API route with standard POST pattern and Inngest integration.

**Use this for:** Contact forms, analytics tracking, webhooks, data mutations.

**Pattern:** Validate → Process → Queue async job → Respond immediately (<100ms)

---

## Template Code

```typescript
import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/inngest/client";
import { z } from "zod";

/**
 * Input validation schema
 * REPLACE with your actual fields
 */
const requestSchema = z.object({
  field1: z.string().min(1, "Field 1 is required"),
  field2: z.string().email("Invalid email"),
  field3: z.number().optional(),
});

/**
 * POST /api/your-endpoint
 * 
 * REPLACE THIS DOCBLOCK:
 * Brief description of what this endpoint does.
 * 
 * @param request - Next.js request object
 * @returns JSON response with success status
 * 
 * @example
 * ```typescript
 * fetch("/api/your-endpoint", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ field1: "value", field2: "email@example.com" }),
 * });
 * ```
 */
export async function POST(request: NextRequest) {
  try {
    // Step 1: Parse request body
    const body = await request.json();

    // Step 2: Validate input
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validation.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Step 3: Optional - Quick synchronous processing
    // Only do lightweight operations here (<50ms)
    // Examples: rate limiting check, basic data transformation
    const processedData = {
      ...data,
      timestamp: new Date().toISOString(),
      // Add any quick transformations
    };

    // Step 4: Queue async work (don't wait for it!)
    // This is the Inngest pattern - fire and forget
    await inngest.send({
      name: "your-app/event.name",  // REPLACE: Event name (domain/action format)
      data: processedData,
    });

    // Step 5: Respond immediately
    // Don't wait for Inngest job to complete
    return NextResponse.json(
      { 
        success: true,
        message: "Request processed successfully",
        // Optionally include non-sensitive data
        id: crypto.randomUUID(),
      },
      { status: 200 }
    );

  } catch (error) {
    // Log error for debugging (appears in Vercel logs)
    console.error("API route error:", error);

    // Return generic error to client
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: "An unexpected error occurred"
      },
      { status: 500 }
    );
  }
}

/**
 * Optional: GET endpoint for read operations
 * Only include if your API needs to return data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing required parameter: id" },
        { status: 400 }
      );
    }

    // Fetch data from database/cache
    const data = await fetchData(id);

    if (!data) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// REMOVE if not needed
async function fetchData(id: string) {
  // Replace with your data fetching logic
  return null;
}
```

---

## Common Modifications

### Add Rate Limiting

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
});

export async function POST(request: NextRequest) {
  // Get client IP
  const ip = request.ip ?? "127.0.0.1";
  
  // Check rate limit
  const { success, remaining } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests", remaining },
      { status: 429 }
    );
  }

  // Continue with normal flow...
}
```

### Add Authentication

```typescript
import { auth } from "@/lib/auth"; // Your auth library

export async function POST(request: NextRequest) {
  // Check authentication
  const session = await auth.getSession(request);
  
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Continue with normal flow...
}
```

### Add CORS Headers

```typescript
export async function POST(request: NextRequest) {
  // Your logic...

  const response = NextResponse.json({ success: true });
  
  // Add CORS headers
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  
  return response;
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
```

### Skip Inngest (Synchronous Response)

```typescript
// Only if you need immediate result and can't wait for async job
export async function POST(request: NextRequest) {
  const validation = requestSchema.safeParse(await request.json());
  
  if (!validation.success) {
    return NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  // Do synchronous work (keep under 5 seconds for Vercel Functions)
  const result = await processDataSynchronously(validation.data);

  return NextResponse.json({ success: true, result });
}
```

---

## Validation Schemas

### Common Patterns

```typescript
import { z } from "zod";

// Contact form
const contactSchema = z.object({
  name: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  message: z.string().min(10, "Message too short"),
  subject: z.string().optional(),
});

// Analytics event
const analyticsSchema = z.object({
  event: z.enum(["view", "click", "share", "download"]),
  page: z.string().url(),
  metadata: z.record(z.unknown()).optional(),
});

// Webhook payload
const webhookSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  data: z.unknown(),
  timestamp: z.string().datetime(),
});
```

---

## Inngest Event Names

**Convention:** `domain/action.status`

```typescript
// Good examples
"blog/post.viewed"
"contact/form.submitted"
"analytics/event.tracked"
"email/newsletter.subscribed"

// Bad examples
"viewPost"           // No domain
"blog-post-viewed"   // Wrong separator
"BLOG/POST/VIEWED"   // Wrong case
```

---

## Checklist

Before committing your new API route:

- [ ] Updated validation schema with actual fields
- [ ] Replaced placeholder event name in `inngest.send()`
- [ ] Added proper error handling
- [ ] Updated docblock with endpoint description
- [ ] Added example usage in docblock
- [ ] Tested with sample request (`curl` or Postman)
- [ ] Verified Inngest function exists (or created it)
- [ ] Response time under 100ms (async work queued)
- [ ] Added rate limiting if needed
- [ ] Ran linter (`npm run lint`)

---

## Related Templates

- INNGEST_FUNCTION.ts - Background job handler
- TEST_SUITE.test.tsx - API route tests

## Related Docs

- API Routes Guide
- Inngest Functions
- Background Job Patterns

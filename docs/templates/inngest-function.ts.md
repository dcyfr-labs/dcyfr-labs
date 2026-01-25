{/* TLP:CLEAR */}

# INNGEST_FUNCTION.ts Template

Copy-paste template for creating an Inngest background job function.

**Use this for:** Analytics, notifications, email sending, third-party API calls, data processing.

**Pattern:** Event-driven → Multi-step with `step.run()` → Error handling → Retries

---

## Template Code

```typescript
import { inngest } from "./client";

/**
 * REPLACE: Function name and description
 * 
 * Background job that handles [describe what it does].
 * Triggered by: [list events that trigger this]
 * 
 * @example
 * ```typescript
 * // Trigger from API route
 * await inngest.send({
 *   name: "your-app/event.name",
 *   data: { ... },
 * });
 * ```
 */
export const yourFunctionName = inngest.createFunction(
  {
    id: "your-function-id",              // REPLACE: Unique ID (kebab-case)
    name: "Your Function Name",          // REPLACE: Human-readable name
    retries: 3,                          // Retry failed steps 3 times
    // Optional: throttle: { limit: 10, period: "1m" },
  },
  { event: "your-app/event.name" },      // REPLACE: Event name to listen for
  async ({ event, step }) => {
    // Step 1: Validate event data
    const { data } = event;
    
    if (!data) {
      throw new Error("Missing event data");
    }

    // Step 2: First async operation
    // Each step is retryable independently
    const result1 = await step.run("step-1-id", async () => {
      // REPLACE: Your first operation
      // Examples: Database write, API call, data transformation
      console.log("Executing step 1");
      return { success: true };
    });

    // Step 3: Conditional logic
    if (result1.success) {
      await step.run("step-2-conditional", async () => {
        // REPLACE: Conditional operation
        console.log("Executing conditional step");
      });
    }

    // Step 4: Trigger another event (cascade)
    // Use for multi-function workflows
    if (shouldTriggerNext) {
      await step.sendEvent("trigger-next-function", {
        name: "your-app/another.event",
        data: {
          // Pass data to next function
          id: result1.id,
        },
      });
    }

    // Step 5: Final operation
    await step.run("final-step", async () => {
      // REPLACE: Final cleanup or notification
      console.log("Function complete");
    });

    // Return value (optional, for debugging)
    return {
      success: true,
      processedAt: new Date().toISOString(),
    };
  }
);
```

---

## Common Patterns

### Database Write

```typescript
await step.run("save-to-database", async () => {
  const { prisma } = await import("@/lib/prisma");
  
  return await prisma.model.create({
    data: {
      field1: event.data.field1,
      field2: event.data.field2,
    },
  });
});
```

### Redis Increment (Analytics)

```typescript
await step.run("increment-view-count", async () => {
  const { redis } = await import("@/lib/redis");
  
  const count = await redis.incr(`views:${event.data.slug}`);
  
  // Check milestone
  if (count === 1000 || count === 10000) {
    await step.sendEvent("milestone-reached", {
      name: "analytics/milestone.reached",
      data: { slug: event.data.slug, count },
    });
  }
  
  return count;
});
```

### Send Email

```typescript
await step.run("send-email", async () => {
  const { sendEmail } = await import("@/lib/email");
  
  return await sendEmail({
    to: event.data.email,
    subject: "Your Subject",
    html: `<p>Your message</p>`,
  });
});
```

### External API Call

```typescript
await step.run("call-external-api", async () => {
  const response = await fetch("https://api.example.com/endpoint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event.data),
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }
  
  return await response.json();
});
```

### Sleep/Delay

```typescript
// Wait before executing next step
await step.sleep("wait-5-minutes", "5m");

// Then continue
await step.run("delayed-action", async () => {
  // This runs 5 minutes after function triggered
  console.log("Delayed action");
});
```

### Parallel Steps

```typescript
// Run multiple steps in parallel (not dependent on each other)
const [result1, result2, result3] = await Promise.all([
  step.run("parallel-step-1", async () => {
    return await operation1();
  }),
  step.run("parallel-step-2", async () => {
    return await operation2();
  }),
  step.run("parallel-step-3", async () => {
    return await operation3();
  }),
]);
```

---

## Event Patterns

### Single Event

```typescript
{ event: "your-app/event.name" }
```

### Multiple Events (OR)

```typescript
{ event: ["your-app/event1", "your-app/event2"] }
```

### Event with Filter

```typescript
{
  event: "your-app/event.name",
  if: "event.data.type == 'premium'",  // Only process premium events
}
```

### Scheduled (Cron)

```typescript
{
  cron: "0 0 * * *",  // Daily at midnight
}

// OR

{
  cron: "TZ=America/New_York 0 9 * * MON",  // Every Monday 9am EST
}
```

---

## Error Handling

### Throw Error to Retry

```typescript
await step.run("step-with-retry", async () => {
  const result = await riskyOperation();
  
  if (!result.success) {
    // This will trigger a retry (up to retries: 3)
    throw new Error("Operation failed, will retry");
  }
  
  return result;
});
```

### Non-Retryable Error

```typescript
import { NonRetriableError } from "inngest";

await step.run("step-no-retry", async () => {
  const result = await operation();
  
  if (result.error === "INVALID_DATA") {
    // Don't retry - data is fundamentally wrong
    throw new NonRetriableError("Invalid data format");
  }
  
  return result;
});
```

### Conditional Error Handling

```typescript
await step.run("safe-operation", async () => {
  try {
    return await riskyOperation();
  } catch (error) {
    // Log but don't fail the step
    console.error("Operation failed:", error);
    return { success: false, error: error.message };
  }
});
```

---

## Testing

### Trigger Manually (Development)

```bash
# Start Inngest dev server
npm run inngest:dev

# Trigger via API call
curl -X POST http://localhost:3000/api/inngest \
  -H "Content-Type: application/json" \
  -d '{
    "name": "your-app/event.name",
    "data": { "test": true }
  }'
```

### Test Function

```typescript
// src/__tests__/inngest/your-function.test.ts
import { describe, it, expect, vi } from "vitest";
import { yourFunctionName } from "@/inngest/your-function";

describe("yourFunctionName", () => {
  it("should process event successfully", async () => {
    const mockStep = {
      run: vi.fn((id, fn) => fn()),
      sendEvent: vi.fn(),
    };

    const result = await yourFunctionName.handler({
      event: {
        name: "your-app/event.name",
        data: { test: true },
      },
      step: mockStep,
    });

    expect(result.success).toBe(true);
  });
});
```

---

## Checklist

Before committing your Inngest function:

- [ ] Updated function ID (unique, kebab-case)
- [ ] Updated function name (human-readable)
- [ ] Replaced event name with actual event
- [ ] Each `step.run()` has unique ID
- [ ] Added error handling where needed
- [ ] Tested locally with `inngest:dev`
- [ ] Documented trigger events in docblock
- [ ] Set appropriate retry count
- [ ] Added to `src/inngest/index.ts` export
- [ ] Ran linter (`npm run lint`)

---

## Related Templates

- API_ROUTE.ts - Trigger Inngest from API
- TEST_SUITE.test.tsx - Test your function

## Related Docs

- Inngest Guide
- Background Job Patterns
- API Route Integration

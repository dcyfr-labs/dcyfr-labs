{/* TLP:CLEAR */}

# Inngest Integration Guide

**Last Updated:** January 21, 2026
**Status:** Production-ready

---

## Overview

Inngest is a durable workflow engine that enables event-driven background jobs, scheduled tasks, and complex multi-step workflows. DCYFR Labs uses Inngest to handle asynchronous operations, improve API response times, and build reliable background processing.

**Key Benefits:**

- **Durable execution** - Functions automatically retry on failure
- **Event-driven** - Trigger workflows from anywhere in your application
- **Observability** - Built-in monitoring and debugging via Inngest Dev Server
- **Type-safe** - Full TypeScript support with type inference

---

## Quick Links

### Core Documentation

- [Main Integration Guide](../inngest-integration.md) - Complete Inngest setup and patterns
- [Getting Started](./INDEX.md) - Quick start guide and basic patterns

### Error Handling & Alerting

- [Error Alerting System](../inngest-error-alerting.md) - Overview of error handling and alerting
- [Debugging Guide](../inngest-error-alerting-implementation.md) - Troubleshooting and debugging patterns
- [Implementation Guide](../inngest-error-alerting-implementation.md) - Detailed implementation examples

### Advanced Topics

- [Event Patterns](../inngest-integration.md#event-patterns) - Common event naming and payload patterns
- [Testing Strategy](../inngest-testing.md) - Testing Inngest functions and workflows

---

## Quick Start

### 1. Start Development Server

```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: Inngest dev server (http://localhost:8288)
npm run inngest:dev
```

### 2. Basic Pattern: Validate → Queue → Respond

**API Route:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { inngest } from '@/inngest/client';

export async function POST(request: NextRequest) {
  // 1. VALIDATE
  const data = await request.json();
  // Add validation logic here

  // 2. QUEUE (background processing)
  await inngest.send({
    name: 'app/user.created',
    data: {
      userId: data.userId,
      email: data.email,
    },
  });

  // 3. RESPOND (immediate response)
  return NextResponse.json({
    success: true,
    message: 'User creation queued',
  });
}
```

**Inngest Function:**

```typescript
import { inngest } from '@/inngest/client';

export const userCreatedFunction = inngest.createFunction(
  { id: 'user-created', name: 'Handle User Creation' },
  { event: 'app/user.created' },
  async ({ event, step }) => {
    // Step 1: Send welcome email
    await step.run('send-welcome-email', async () => {
      return sendEmail(event.data.email);
    });

    // Step 2: Create user profile
    await step.run('create-profile', async () => {
      return createUserProfile(event.data.userId);
    });

    return { success: true };
  }
);
```

### 3. View Function Execution

Open http://localhost:8288 to:

- View all function runs
- Inspect event payloads
- Debug failures and retries
- Monitor execution timeline

---

## Core Patterns

### Event-Driven Architecture

**Event Naming Convention:**

```
<namespace>/<entity>.<action>

Examples:
- app/user.created
- app/post.published
- app/analytics.tracked
- blog/comment.moderated
```

### Error Handling

**Automatic Retries:**

```typescript
export const resilientFunction = inngest.createFunction(
  {
    id: 'resilient-task',
    retries: 3, // Retry up to 3 times
  },
  { event: 'app/task.created' },
  async ({ event, step }) => {
    await step.run('process-task', async () => {
      // This will automatically retry on failure
      return processTask(event.data.taskId);
    });
  }
);
```

**Error Alerting:**

- Failed functions trigger alerts via Inngest dashboard
- Configure webhooks for critical failures
- See [Error Alerting System](../inngest-error-alerting.md) for complete setup

### Scheduled Functions

**Cron Patterns:**

```typescript
export const dailyDigest = inngest.createFunction(
  { id: 'daily-digest', name: 'Send Daily Digest' },
  { cron: '0 9 * * *' }, // Every day at 9 AM
  async ({ step }) => {
    await step.run('generate-digest', async () => {
      return generateDigest();
    });

    await step.run('send-email', async () => {
      return sendDigestEmail();
    });
  }
);
```

### Multi-Step Workflows

**Complex Workflows:**

```typescript
export const contentPublishingWorkflow = inngest.createFunction(
  { id: 'content-publishing', name: 'Content Publishing Workflow' },
  { event: 'blog/post.created' },
  async ({ event, step }) => {
    // Step 1: Generate OG image
    const ogImage = await step.run('generate-og-image', async () => {
      return generateOGImage(event.data.postId);
    });

    // Step 2: Optimize images
    await step.run('optimize-images', async () => {
      return optimizeImages(event.data.postId);
    });

    // Step 3: Update search index
    await step.run('update-search-index', async () => {
      return updateSearchIndex(event.data.postId);
    });

    // Step 4: Notify subscribers
    await step.run('notify-subscribers', async () => {
      return notifySubscribers(event.data.postId);
    });

    return { success: true, ogImage };
  }
);
```

---

## API Integration Patterns

### Pattern 1: Immediate Response + Background Work

**Use when:** User should not wait for background processing

```typescript
// API Route
export async function POST(request: NextRequest) {
  const data = await request.json();

  await inngest.send({
    name: 'app/data.process',
    data,
  });

  return NextResponse.json({
    message: 'Processing started',
    status: 'queued',
  });
}
```

### Pattern 2: Wait for Result

**Use when:** Client needs the result before proceeding

```typescript
// API Route (not recommended for slow operations)
export async function POST(request: NextRequest) {
  const data = await request.json();

  // Process synchronously (blocks request)
  const result = await processData(data);

  return NextResponse.json({ result });
}
```

**Better:** Use polling or webhooks for long-running tasks

### Pattern 3: Fan-Out / Fan-In

**Use when:** Processing multiple items in parallel

```typescript
export const batchProcessor = inngest.createFunction(
  { id: 'batch-processor' },
  { event: 'app/batch.process' },
  async ({ event, step }) => {
    const items = event.data.items;

    // Fan-out: Process items in parallel
    const results = await Promise.all(
      items.map((item) =>
        step.run(`process-${item.id}`, async () => {
          return processItem(item);
        })
      )
    );

    // Fan-in: Aggregate results
    await step.run('aggregate-results', async () => {
      return aggregateResults(results);
    });

    return { processed: results.length };
  }
);
```

---

## Testing

### Unit Testing Inngest Functions

```typescript
import { describe, it, expect } from 'vitest';
import { userCreatedFunction } from '@/inngest/functions/user-created';

describe('User Created Function', () => {
  it('should send welcome email', async () => {
    const mockEvent = {
      name: 'app/user.created',
      data: {
        userId: '123',
        email: 'user@example.com',
      },
    };

    const result = await userCreatedFunction.handler({
      event: mockEvent,
      step: mockStepImplementation,
    });

    expect(result.success).toBe(true);
  });
});
```

**Learn more:** [Inngest Testing Guide](../inngest-testing.md)

---

## Monitoring & Debugging

### Development

**Inngest Dev Server (http://localhost:8288):**

- View all function runs in real-time
- Inspect event payloads and step outputs
- Debug failures with full stack traces
- Replay failed functions manually

### Production

**Inngest Cloud Dashboard:**

- Monitor function execution metrics
- Set up alerts for failures
- View historical data and trends
- Configure retries and rate limits

**Error Alerting:**

- Email notifications for critical failures
- Slack/Discord webhooks
- Custom webhook integrations

**Learn more:** [Error Alerting System](../inngest-error-alerting.md)

---

## Common Use Cases

### Background Jobs

- Image processing and optimization
- Email sending and notifications
- Data synchronization
- Report generation

### Scheduled Tasks

- Daily digest emails
- Cache warming
- Analytics aggregation
- Cleanup tasks

### Event-Driven Workflows

- User onboarding flows
- Content publishing pipelines
- Order processing
- Subscription management

### Data Processing

- Batch imports
- ETL pipelines
- Data validation
- Archive generation

---

## Troubleshooting

### Function Not Triggering

**Symptoms:** Event sent but function doesn't execute

**Solutions:**

1. Verify Inngest dev server is running (`npm run inngest:dev`)
2. Check event name matches exactly (case-sensitive)
3. Review Inngest dev server logs for errors
4. Ensure function is registered in `src/inngest/functions/index.ts`

### Function Failing

**Symptoms:** Function executes but fails with error

**Solutions:**

1. Check Inngest dev server for error details
2. Verify event payload structure matches function expectations
3. Add error handling and logging to function steps
4. Test function in isolation with mock data

### Rate Limiting

**Symptoms:** "Too many requests" errors

**Solutions:**

- Add `concurrency` limits to function config
- Use `step.sleep()` to add delays between steps
- Batch requests where possible

### Memory Issues

**Symptoms:** Function times out or runs out of memory

**Solutions:**

- Process data in smaller chunks
- Use streaming for large files
- Implement pagination for database queries
- Consider splitting into multiple functions

---

## Best Practices

### 1. Event Design

- Use consistent naming conventions (`<namespace>/<entity>.<action>`)
- Include all necessary data in event payload
- Keep payloads under 512KB (Inngest limit)
- Version event schemas for breaking changes

### 2. Function Design

- Keep functions focused (single responsibility)
- Use `step.run()` for retry-able operations
- Avoid side effects outside of steps
- Return meaningful results for debugging

### 3. Error Handling

- Handle expected errors gracefully
- Use retries for transient failures
- Log errors with context for debugging
- Set up alerts for critical failures

### 4. Performance

- Use `step.sleep()` instead of `setTimeout()`
- Batch operations when possible
- Consider function concurrency limits
- Monitor execution time and optimize slow steps

### 5. Security

- Validate all event payloads
- Use environment variables for secrets
- Don't log sensitive data
- Implement rate limiting for public endpoints

---

## Additional Resources

### Documentation Files

- [Inngest Integration](../inngest-integration.md) - Complete setup guide
- [Error Alerting](../inngest-error-alerting.md) - Error handling system
- [Error Alerting Checklist](../inngest-error-alerting-checklist.md) - Implementation checklist
- [Error Alerting Examples](../inngest-error-alerting-examples.md) - Code examples
- [Error Alerting Quick Ref](../inngest-error-alerting-quick-ref.md) - Quick reference
- [Error Alerting Summary](../inngest-error-alerting-summary.md) - Feature summary
- [Testing Guide](../inngest-testing.md) - Testing patterns

### Code Examples

- **Inngest Client:** `src/inngest/client.ts`
- **Function Registration:** `src/inngest/functions/index.ts`
- **API Endpoint:** `src/app/api/inngest/route.ts`

### External Resources

- [Inngest Documentation](https://www.inngest.com/docs)
- [Inngest TypeScript SDK](https://www.inngest.com/docs/sdk/typescript)
- [Inngest Community Discord](https://www.inngest.com/discord)

---

## Support

**Issues with Inngest?**

1. Check [Troubleshooting](#troubleshooting) section
2. Review Inngest dev server logs
3. Consult [Error Alerting Guide](../inngest-error-alerting.md)
4. Ask in #inngest channel (if applicable)

**Contributing:**

- Inngest integration improvements welcome!
- See [CONTRIBUTING.md](../../../CONTRIBUTING.md) for guidelines

---

**Last Updated:** January 21, 2026
**Maintainers:** DCYFR Labs Team

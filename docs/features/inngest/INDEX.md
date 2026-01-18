# Inngest Integration Documentation

**Complete guide to Inngest integration in dcyfr-labs**

---

## Quick Start

### What is Inngest?

Inngest is a durable execution engine for TypeScript that enables reliable background jobs, scheduled tasks, and event-driven workflows without managing infrastructure.

### Why We Use Inngest

- **Validate → Queue → Respond** pattern for API routes
- **Durable execution** with automatic retries
- **Built-in observability** with detailed execution logs
- **Type-safe** event schemas
- **Local development** with Inngest Dev Server

### Getting Started (5 minutes)

1. **Start Inngest Dev Server**
   ```bash
   npm run inngest:dev
   ```

2. **Create a Function**
   ```typescript
   import { inngest } from '@/inngest/client';
   
   export const myFunction = inngest.createFunction(
     { id: 'my-function' },
     { event: 'app/my.event' },
     async ({ event, step }) => {
       // Your logic here
       return { success: true };
     }
   );
   ```

3. **Trigger the Function**
   ```typescript
   await inngest.send({ name: 'app/my.event', data: { ... } });
   ```

4. **View in Inngest UI**
   - Open: http://localhost:8288
   - See execution logs, retries, and performance

---

## Documentation Structure

### 📘 [INTEGRATION.md](./INTEGRATION.md)
**Setup, configuration, and function patterns**

- Installation and setup
- Environment configuration
- Function templates and patterns
- Testing and validation
- Production deployment

**When to read:** Setting up Inngest for the first time, creating new functions

---

### 🚨 [ERROR_HANDLING.md](./ERROR_HANDLING.md)
**Error alerting, retries, and failure recovery**

- Error alerting strategy
- Retry configuration
- Error tracking and monitoring
- Implementation examples
- Validation checklist

**When to read:** Implementing error handling, debugging failed runs

---

### 🧪 [TESTING.md](./TESTING.md)
**Testing patterns and best practices**

- Unit testing Inngest functions
- Integration testing with mocks
- E2E testing with Inngest Dev Server
- Testing error scenarios
- Performance testing

**When to read:** Writing tests for Inngest functions

---

### ⚙️ [OPERATIONS.md](./OPERATIONS.md)
**Monitoring, performance, and troubleshooting**

- Execution tracking and monitoring
- Performance optimization
- Troubleshooting guide
- Production best practices
- Debugging techniques

**When to read:** Optimizing performance, debugging production issues

---

## Common Workflows

### Creating a New Background Job

1. Read: [INTEGRATION.md](./INTEGRATION.md) - Function patterns
2. Implement: Use function template
3. Test: [TESTING.md](./TESTING.md) - Unit and integration tests
4. Deploy: Production checklist in [INTEGRATION.md](./INTEGRATION.md)

### Debugging Failed Runs

1. Check: Inngest UI at http://localhost:8288 (dev) or https://app.inngest.com (prod)
2. Review: [ERROR_HANDLING.md](./ERROR_HANDLING.md) - Common error patterns
3. Troubleshoot: [OPERATIONS.md](./OPERATIONS.md) - Debugging guide

### Optimizing Performance

1. Measure: [OPERATIONS.md](./OPERATIONS.md) - Execution tracking
2. Optimize: [OPERATIONS.md](./OPERATIONS.md) - Performance tuning
3. Validate: [TESTING.md](./TESTING.md) - Performance tests

---

## Key Concepts

### Validate → Queue → Respond Pattern

```typescript
// API Route (src/app/api/contact/route.ts)
export async function POST(request: Request) {
  // 1. VALIDATE: Validate input
  const body = await request.json();
  const validated = contactSchema.parse(body);
  
  // 2. QUEUE: Send to Inngest (immediate return)
  await inngest.send({
    name: 'contact/form.submitted',
    data: validated,
  });
  
  // 3. RESPOND: Return success immediately
  return NextResponse.json({ success: true });
}

// Inngest Function (inngest/contact-form.ts)
export const processContactForm = inngest.createFunction(
  { id: 'process-contact-form' },
  { event: 'contact/form.submitted' },
  async ({ event }) => {
    // Heavy processing happens here (email, CRM, analytics)
    await sendEmail(event.data);
    await updateCRM(event.data);
    return { processed: true };
  }
);
```

**Benefits:**
- ✅ Fast API responses (<100ms)
- ✅ Reliable processing (automatic retries)
- ✅ Better UX (no waiting for background work)
- ✅ Easier debugging (execution logs in Inngest UI)

### Durable Execution

Inngest automatically handles:
- **Retries**: Exponential backoff on failures
- **Idempotency**: Replay-safe execution
- **Observability**: Detailed execution logs
- **Rate limiting**: Automatic throttling

---

## Project-Specific Patterns

### Contact Form Processing
- **File:** `inngest/contact-form.ts`
- **Pattern:** Validate → Queue → Respond
- **Integrations:** Email (Resend), CRM, Analytics

### Session Management
- **File:** `inngest/session-management.ts`
- **Pattern:** Scheduled cleanup jobs
- **Features:** Session cleanup, emergency session clearing

### Analytics Aggregation
- **File:** `inngest/analytics-aggregation.ts`
- **Pattern:** Scheduled data processing
- **Features:** Daily/weekly/monthly rollups

---

## Migration Notes

**This documentation replaces:**
- `docs/features/inngest-integration.md`
- `docs/features/inngest-error-alerting*.md` (6 files)
- `docs/features/inngest-testing.md`
- `docs/operations/inngest-*.md` (4 files)
- `docs/templates/inngest-function.ts.md`

**Private documentation** (incident reports, fixes) remains in:
- `docs/operations/private/inngest-*.md`
- `docs/security/private/inngest-*.md`

---

## External Resources

- **Official Docs**: https://inngest.com/docs
- **TypeScript SDK**: https://inngest.com/docs/reference/typescript
- **Dashboard**: https://app.inngest.com
- **Dev Server**: http://localhost:8288 (when running `npm run inngest:dev`)
- **GitHub**: https://github.com/inngest/inngest

---

## Support

**Internal:**
- Ask in #engineering (Slack/Discord)
- Review private incident docs: `docs/operations/private/inngest-*.md`

**External:**
- Inngest Discord: https://inngest.com/discord
- Support: support@inngest.com

---

**Last Updated:** January 17, 2026  
**Version:** 2.0.0 (Consolidated from 13 files)

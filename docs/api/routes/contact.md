<!-- TLP:CLEAR -->

# Contact Form API Endpoint

**Location:** `src/app/api/contact/route.ts`

**Method:** `POST`

**Rate Limit:** 3 requests per 60 seconds per IP

## Overview

The `/api/contact` endpoint processes contact form submissions from the contact page. It validates input, sends emails via Resend, and includes comprehensive error handling with graceful fallbacks.

## Endpoint

```
POST /api/contact
Content-Type: application/json
```

## Request

### Body Schema

```tsx
interface ContactFormRequest {
  name: string;      // Sender's name (2-1000 chars)
  email: string;     // Sender's email (valid format)
  message: string;   // Message content (10-1000 chars)
}
```

### Example Request

```bash
curl -X POST https://your-domain.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "I would like to discuss a potential project collaboration."
  }'
```

### Request Headers

| Header | Required | Default |
|--------|----------|---------|
| Content-Type | Yes | - |
| User-Agent | No | Browser user agent |

## Response

### Success Response (200)

```json
{
  "success": true,
  "message": "Message received successfully"
}
```

**With Email Configured:**
- Email sent to portfolio owner
- Reply-To set to sender's email
- Status: 200 OK

**Without Email Configured:**
```json
{
  "success": true,
  "message": "Message received. However, email service is not configured. Please contact me directly via social media or GitHub.",
  "warning": "Email delivery unavailable"
}
```

### Error Responses

#### 400 Bad Request

Missing or invalid fields:

```json
{
  "error": "All fields are required"
}
```

Other 400 errors:
- `"Invalid email address"` - Email format invalid
- `"Name must be at least 2 characters"` - Name too short
- `"Message must be at least 10 characters"` - Message too short

#### 429 Too Many Requests

Rate limit exceeded:

```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 45
}
```

**Headers:**
```
X-RateLimit-Limit: 3
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1729720945000
Retry-After: 45
```

#### 500 Internal Server Error

Email sending failed:

```json
{
  "error": "Failed to send email. Please try again later."
}
```

## Validation

### Input Validation Rules

| Field | Rules |
|-------|-------|
| name | Min 2 chars, Max 1000 chars, Trimmed |
| email | Valid RFC 5322 format, Max 1000 chars |
| message | Min 10 chars, Max 1000 chars, Trimmed |

### Validation Order

```
1. Check rate limit
   ↓ (if exceeded, return 429)
2. Parse JSON request body
   ↓ (if invalid, return 500)
3. Check required fields
   ↓ (if missing, return 400)
4. Validate email format
   ↓ (if invalid, return 400)
5. Sanitize inputs
   ↓ (trim, length check)
6. Validate field lengths
   ↓ (if too short, return 400)
7. Check email config
   ↓ (skip if not configured)
8. Send email
   ↓ (if fails, return 500)
9. Log submission
   ↓ (anonymized data only)
10. Return success
```

### Example Validation Errors

```bash
# Missing field
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John"
    # "email" missing
  }'
# Response: 400 - "All fields are required"

# Invalid email
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "not-an-email",
    "message": "Hello there"
  }'
# Response: 400 - "Invalid email address"

# Message too short
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "email": "john@example.com",
    "message": "Hi"
  }'
# Response: 400 - "Message must be at least 10 characters"
```

## Rate Limiting

### Configuration

```tsx
const RATE_LIMIT_CONFIG = {
  limit: 3,              // 3 requests
  windowInSeconds: 60,   // per 60 seconds
};
```

### Behavior

- **First request**: 200 OK, remaining: 2
- **Second request**: 200 OK, remaining: 1
- **Third request**: 200 OK, remaining: 0
- **Fourth request**: 429 Too Many Requests
- After 60 seconds: Counter resets

### Rate Limit Reset

The `X-RateLimit-Reset` header provides the reset timestamp in milliseconds:

```tsx
const resetDate = new Date(parseInt(header));
const secondsUntilReset = Math.ceil((resetDate - Date.now()) / 1000);
```

### Client Implementation

```tsx
// Implement exponential backoff
async function submitWithRetry(data, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.status === 429) {
      const retryAfter = parseInt(
        response.headers.get('retry-after') || '60'
      );
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => 
          setTimeout(resolve, retryAfter * 1000)
        );
        continue;
      }
    }
    
    return response;
  }
}
```

## Email Configuration

### With Email Service (RESEND_API_KEY set)

When `RESEND_API_KEY` environment variable is configured:

1. **Email Service:** Resend (resend.com)
2. **Recipient:** Portfolio owner (from `AUTHOR_EMAIL`)
3. **From Address:** Configured domain (from `FROM_EMAIL`)
4. **Reply-To:** Sender's email address
5. **Subject:** `Contact form: {name}`
6. **Body:** Plain text format

**Email Headers**

```
From: noreply@your-domain.com
To: author@example.com
Reply-To: sender@example.com
Subject: Contact form: John Doe
```

**Email Body**

```
From: John Doe <john@example.com>

I would like to discuss a potential project collaboration.
```

### Without Email Service (RESEND_API_KEY not set)

When email service is not configured:

1. **Status:** 200 OK (success)
2. **Message:** Friendly notice explaining email is not configured
3. **Logging:** Submission logged with metadata only
4. **Fallback:** User directed to contact via social media

**Response:**
```json
{
  "success": true,
  "message": "Message received. However, email service is not configured. Please contact me directly via social media or GitHub.",
  "warning": "Email delivery unavailable"
}
```

## Logging & Privacy

### What Gets Logged (Safe)

```
Contact form submission sent: {
  nameLength: 8,           // Only the length
  emailDomain: "example.com",  // Only the domain
  messageLength: 56,       // Only the length
  timestamp: "2025-10-24T12:00:00.000Z"
}
```

### What Does NOT Get Logged (Private)

- ❌ Full name
- ❌ Full email address
- ❌ Message content
- ❌ IP address (used for rate limiting only)

### Privacy Compliance

- **GDPR Compliant**: No PII stored or logged
- **CCPA Compliant**: User data not collected/shared
- **Privacy-First**: Minimal data collection
- **No Tracking**: No user profiling

## Security

### Input Sanitization

```tsx
function sanitizeInput(input: string): string {
  // 1. Trim whitespace
  // 2. Truncate to 1000 characters
  return input.trim().slice(0, 1000);
}
```

### Email Validation

```tsx
function validateEmail(email: string): boolean {
  // RFC 5322 simplified validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
```

### CSRF Protection

- No explicit CSRF token needed (POST-only endpoint)
- Rate limiting prevents abuse
- Same-site cookie policy (default)

### DoS Prevention

- Rate limiting (3 req/min per IP)
- Input length limits (1000 chars max)
- Request timeout (default Next.js timeout)

## Error Handling

### Email Sending Failures

If email fails to send:

```json
{
  "error": "Failed to send email. Please try again later."
}
```

**Causes:**
- Resend API unreachable
- Invalid Resend API key
- Network timeout
- Recipient email rejected

**Recovery:**
- Retry after a few seconds
- Check email configuration
- Contact support

### JSON Parse Error

If request body is invalid JSON:

```json
{
  "error": "Internal server error"
}
```

**Causes:**
- Malformed JSON
- Missing Content-Type header
- Encoding issues

**Recovery:**
- Validate JSON before sending
- Ensure Content-Type is application/json

## Usage Examples

### JavaScript/TypeScript

```tsx
// Basic usage
async function submitContactForm(data) {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get('retry-after');
    throw new Error(`Rate limited. Retry after ${retryAfter}s`);
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}

// With error handling
try {
  const result = await submitContactForm({
    name: "Jane Smith",
    email: "jane@example.com",
    message: "I'm interested in your services.",
  });
  console.log("Success:", result.message);
} catch (error) {
  console.error("Error:", error.message);
}
```

### React Component

```tsx
'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export function ContactForm() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          message: formData.get('message'),
        }),
      });

      if (response.status === 429) {
        toast.error('Too many requests. Please wait a moment.');
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || 'Failed to send message');
        return;
      }

      const result = await response.json();
      toast.success(result.message);
      e.currentTarget.reset();
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}
```

## Testing

### Manual Testing

```bash
# Success case
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test message for the contact form API."
  }'

# Invalid email
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "invalid",
    "message": "Test message"
  }'

# Rate limit test
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/contact \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
  echo "Request $i"
done
```

### Unit Test Example (Playwright)

```tsx
import { test, expect } from '@playwright/test';

test.describe('POST /api/contact', () => {
  test('should send contact form successfully', async ({ page }) => {
    const response = await page.request.post('/api/contact', {
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Test message for contact form',
      },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
  });

  test('should reject invalid email', async ({ page }) => {
    const response = await page.request.post('/api/contact', {
      data: {
        name: 'John',
        email: 'invalid-email',
        message: 'Test message',
      },
    });

    expect(response.status()).toBe(400);
  });

  test('should rate limit after 3 requests', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.request.post('/api/contact', {
        data: {
          name: `Test ${i}`,
          email: `test${i}@example.com`,
          message: 'Test message for contact form submission',
        },
      });
    }

    const response = await page.request.post('/api/contact', {
      data: {
        name: 'Test 4',
        email: 'test4@example.com',
        message: 'This should be rate limited',
      },
    });

    expect(response.status()).toBe(429);
  });
});
```

## Related Documentation

- **API Overview:** `overview.md`
- **GitHub Contributions:** `github-contributions.md`
- **Rate Limiting:** `src/lib/rate-limit.ts`
- **Client Implementation:** `src/app/contact/page.tsx`
- **Environment Variables:** `docs/platform/environment-variables.md`

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| 429 Too Many Requests | Exceeded rate limit | Wait 60 seconds before retrying |
| 400 Invalid Email | Email format wrong | Check email format: user@domain.com |
| No email received | RESEND_API_KEY not set | Set env var or check Resend dashboard |
| 500 Server Error | Unexpected error | Check server logs, retry |
| CORS error | Browser blocking request | Request is same-origin, should not happen |

## Performance

- **Average response time**: 100ms (cached), 500ms (with email)
- **Email delivery**: 1-2 seconds (Resend)
- **Rate limit check**: \<1ms

## Changelog

- **2025-10-24** - Initial contact API documentation

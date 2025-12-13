# CAPTCHA Evaluation for Contact Form

**Date:** October 24, 2025  
**Status:** 📋 Evaluation Complete  
**Recommendation:** Optional - Cloudflare Turnstile if needed

---

## Current Protection Status

The contact form already has **strong protection** without CAPTCHA:

### Existing Security Measures
- ✅ **Rate Limiting:** 3 requests per 60 seconds per IP (Redis-backed, distributed)
- ✅ **Input Validation:** Email format, length checks, field requirements
- ✅ **Sanitization:** Trim and limit all inputs to prevent injection
- ✅ **PII Anonymization:** No user data in logs
- ✅ **Error Handling:** Graceful failures, no information leakage

### Current Risk Assessment
**Risk Level:** 🟢 Low

The combination of rate limiting and validation is sufficient for a personal portfolio site:
- Rate limit prevents bulk spam attacks
- Input validation prevents malicious payloads
- Low traffic volume makes targeted spam unlikely
- Email service (Resend) provides additional spam filtering

---

## CAPTCHA Options Comparison

### 1. Cloudflare Turnstile (⭐ Recommended)

**Pros:**
- ✅ **Privacy-first:** No tracking, no cookies, no consent banner needed
- ✅ **Best UX:** Invisible mode - often zero user interaction required
- ✅ **Free tier:** Unlimited requests on free plan
- ✅ **Easy integration:** Simple JavaScript + API verification
- ✅ **Vercel-friendly:** Works seamlessly with Edge/Serverless
- ✅ **No Google dependency:** Independent solution

**Cons:**
- ⚠️ Requires Cloudflare account
- ⚠️ Additional API call for verification

**Implementation Effort:** Low (~1-2 hours)

**Documentation:** https://developers.cloudflare.com/turnstile/

---

### 2. hCaptcha

**Pros:**
- ✅ Privacy-focused option available
- ✅ Free tier available
- ✅ Revenue sharing model (can earn from CAPTCHAs)
- ✅ GDPR/CCPA compliant

**Cons:**
- ⚠️ More visible/intrusive than Turnstile
- ⚠️ Worse UX - users often need to solve challenges
- ⚠️ Revenue model may show ads

**Implementation Effort:** Low (~1-2 hours)

**Documentation:** https://docs.hcaptcha.com/

---

### 3. Google reCAPTCHA v3

**Pros:**
- ✅ Invisible - score-based detection
- ✅ Free and reliable
- ✅ Good bot detection
- ✅ Widely used

**Cons:**
- ❌ **Privacy concerns:** Google tracking
- ❌ **Cookie banner:** May require user consent under GDPR
- ❌ **Data sharing:** Sends data to Google
- ❌ **Brand perception:** Some users distrust Google products

**Implementation Effort:** Low (~1-2 hours)

**Documentation:** https://developers.google.com/recaptcha/docs/v3

---

## Recommendation

### Current Status: CAPTCHA Not Required

The existing rate limiting and validation provide **adequate protection** for a personal portfolio site. CAPTCHA should be considered **optional** and implemented only if:

1. Spam submissions become a problem
2. Abuse is detected despite rate limiting
3. Email costs increase significantly

### If CAPTCHA is Needed: Use Cloudflare Turnstile

**Why Cloudflare Turnstile:**
1. **Aligns with privacy values** - Already removed PII logging, Turnstile continues this approach
2. **Best user experience** - Often completely invisible to legitimate users
3. **No compliance burden** - No cookies, no consent banner needed
4. **Free forever** - Unlimited requests on free tier
5. **Easy implementation** - Simple integration with Next.js

### Implementation Plan (Future)

If CAPTCHA becomes necessary, follow this approach:

#### Phase 1: Add Turnstile to Frontend
```tsx
// src/app/contact/page.tsx
import { Turnstile } from '@marsidev/react-turnstile'

<Turnstile
  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
  onSuccess={(token) => setTurnstileToken(token)}
/>
```

#### Phase 2: Verify on Backend
```typescript
// src/app/api/contact/route.ts
const turnstileToken = body.turnstileToken;

const verifyResponse = await fetch(
  'https://challenges.cloudflare.com/turnstile/v0/siteverify',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: turnstileToken,
    }),
  }
);

const verifyData = await verifyResponse.json();
if (!verifyData.success) {
  return NextResponse.json(
    { error: 'CAPTCHA verification failed' },
    { status: 400 }
  );
}
```

#### Phase 3: Environment Variables
```bash
# .env.local
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

---

## Decision Matrix

| Scenario | Recommendation | Rationale |
|----------|---------------|-----------|
| **Current state** (no spam) | ✅ **No CAPTCHA** | Rate limiting sufficient |
| **Minor spam** (1-5/day) | ⚠️ **Monitor** | Increase rate limit strictness |
| **Moderate spam** (5-20/day) | 🔄 **Add Turnstile** | Invisible, privacy-first |
| **Heavy spam** (20+/day) | 🔄 **Turnstile + honeypot** | Multi-layer defense |
| **Privacy-critical** | ✅ **Turnstile only** | Never use Google reCAPTCHA |

---

## Monitoring Strategy

Track spam indicators without CAPTCHA:

1. **Rate limit hits:** Monitor how often IPs hit the 3/60s limit
2. **Suspicious patterns:** Multiple submissions from same IP/domain
3. **Bounce rate:** Track email delivery failures (if using email service)
4. **Time-based patterns:** Bot submissions often happen at specific times

**Alert threshold:** If spam rate exceeds 5 submissions per day, consider implementing Turnstile.

---

## Additional Anti-Spam Measures (No CAPTCHA)

If spam increases but you want to avoid CAPTCHA:

### 1. Honeypot Field
```tsx
// Invisible field that bots will fill but humans won't
<input
  type="text"
  name="website"
  style={{ display: 'none' }}
  tabIndex={-1}
  autoComplete="off"
/>
```

Server-side: Reject if honeypot field is filled.

### 2. Timing Check
```typescript
// Track time between page load and form submission
const minSubmissionTime = 3000; // 3 seconds
if (Date.now() - formLoadTime < minSubmissionTime) {
  // Likely a bot
  return NextResponse.json({ error: 'Too fast' }, { status: 400 });
}
```

### 3. Stricter Rate Limiting
```typescript
// Reduce limits during high-spam periods
const STRICT_RATE_LIMIT = {
  limit: 1,  // 1 request per hour
  windowInSeconds: 3600,
};
```

---

## Conclusion

**Current Status:** ✅ No CAPTCHA needed

The contact form has sufficient protection through rate limiting and validation. CAPTCHA should remain **optional** and only be implemented if spam becomes a measurable problem.

**If CAPTCHA is added:** Use Cloudflare Turnstile for privacy, UX, and cost reasons.

**Next Steps:**
1. Monitor spam metrics for 30 days
2. Document baseline spam rate
3. Implement Turnstile only if spam exceeds 5/day threshold
4. Consider honeypot field as intermediate step before CAPTCHA

---

**Related Documentation:**
- [Rate Limiting Guide](./rate-limiting/quick-reference)
- [Security Hardening Summary](./hardening-summary-2025-10-24)
- [Contact API Documentation](../api/reference)

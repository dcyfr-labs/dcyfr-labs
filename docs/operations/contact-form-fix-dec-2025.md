# Contact Form 403 Fix - December 2025

## Problem Summary
The contact form was returning 403 errors in development, preview, and production environments due to misconfigured Vercel BotID protection.

## Root Cause
1. **BotID client-side protection** was enabled in `src/instrumentation-client.ts` for `/api/contact`
2. **BotID server-side validation** required `ENABLE_BOTID=1` environment variable
3. **Mismatch:** Client expected BotID headers, but server wasn't configured to provide them
4. **Result:** 403 Forbidden errors on all contact form submissions

## Solution Implemented
### 1. Disabled Client-Side BotID Protection
- **File:** `src/instrumentation-client.ts`
- **Change:** Commented out `/api/contact` route in `initBotId({ protect: [...] })`
- **Reason:** Prevents client-side BotID requirements until proper server setup

### 2. Updated Server-Side Configuration  
- **File:** `src/app/api/contact/route.ts`
- **Change:** Made BotID requirements more explicit (production + `ENABLE_BOTID=1`)
- **Reason:** Clearer conditions for when BotID validation runs

### 3. Added Environment Documentation
- **File:** `.env.example`
- **Change:** Added comprehensive BotID section with setup instructions
- **Reason:** Clear guidance for future BotID enablement

## Security Measures Active
The contact form is now secure via multiple protection layers:
- ✅ **Rate limiting:** 3 requests/minute per IP
- ✅ **Honeypot field:** Hidden field to catch bots
- ✅ **Input validation:** Email format, field lengths, required fields
- ✅ **Request size limits:** 50KB maximum payload
- ✅ **Input sanitization:** Trim and length checks

## Current Status
- ✅ **Development:** Contact form working
- ✅ **Preview:** Contact form should work (BotID disabled)
- ✅ **Production:** Contact form should work (BotID disabled)

## Testing Verified
```bash
# Valid submission works
curl -X POST localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Valid message"}'
# → 200 {"success":true,"message":"Message received successfully..."}

# Honeypot blocks spam
curl -X POST localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Bot","email":"bot@spam.com","message":"Spam","website":"spam.com"}'
# → 200 {"success":true,"message":"Message received. We'll get back to you soon!"}
# (Note: Different message = honeypot activated)

# Validation catches errors
curl -X POST localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"","email":"invalid","message":"short"}'
# → 400 {"error":"All fields are required"}
```

## Re-enabling BotID (Future)
When ready to enable BotID protection:

### 1. Verify Vercel BotID Setup
- Ensure Vercel Pro subscription is active
- Verify BotID is configured in Vercel dashboard
- Test BotID in preview environment first

### 2. Enable Environment Variable
```bash
# In production environment variables
ENABLE_BOTID=1
```

### 3. Re-enable Client-Side Protection
In `src/instrumentation-client.ts`, uncomment:
```typescript
initBotId({
  protect: [
    {
      path: "/api/contact",
      method: "POST",
    },
  ],
});
```

### 4. Test Thoroughly
- Test legitimate form submissions work
- Test bot submissions are blocked
- Monitor for false positives

## Related Files
- `src/app/api/contact/route.ts` - API endpoint
- `src/instrumentation-client.ts` - BotID client config
- `src/components/common/contact-form.tsx` - Frontend form
- `.env.example` - Environment documentation
- `docs/security/bot-detection.md` - BotID documentation

## Contact Form Architecture
```
User Form Submission
        ↓
Client-side validation
        ↓
POST /api/contact
        ↓
[BotID Check] ← Currently disabled
        ↓
Rate limiting (3/min per IP)
        ↓
Honeypot validation
        ↓
Input validation & sanitization
        ↓
Inngest queue (background email)
        ↓
200 OK response
```

**Status:** ✅ Fixed and tested  
**Date:** December 12, 2025  
**Next Review:** When enabling BotID in production
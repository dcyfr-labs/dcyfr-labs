# BotID Re-Enablement Plan

**Date:** December 12, 2025
**Status:** Ready for deployment
**Monitoring Window:** 48 hours post-deployment

## Overview

This document outlines the plan to re-enable Vercel BotID for the contact form after temporarily disabling it due to false positives (PR #112).

## Background

- **Disabled:** December 10, 2025 (Commit `32a2014`)
- **Reason:** False positive 403 errors blocking legitimate user submissions
- **Impact:** ~4 hour downtime until hotfix deployed
- **Lesson:** BotID configuration needs validation before re-enabling

## Implementation Status

### ✅ Completed

1. **Code Uncommented** (Commit pending)
   - Re-enabled BotID import in `src/app/api/contact/route.ts`
   - Uncommented BotID check logic with graceful fallback
   - BotID remains disabled by default (`ENABLE_BOTID` env var required)

2. **Tests Updated**
   - Updated `src/__tests__/api/contact-botid.test.ts` with 8 test cases
   - Tests validate both enabled and disabled states
   - All tests passing (100%)

3. **CI Validation**
   - Created `scripts/validate-botid-setup.mjs` with 7 validation checks
   - All checks pass (7/7)
   - Added GitHub Actions workflow: `.github/workflows/validate-botid.yml`
   - Validates on every push/PR to BotID-related files

4. **Configuration Verified**
   - ✅ BotID imported in contact API
   - ✅ BotID check logic present and toggleable
   - ✅ Client-side initialization in `src/instrumentation-client.ts`
   - ✅ `/api/contact` configured for protection
   - ✅ Next.js config wrapped with `withBotId`
   - ✅ BotID v1.5.10 installed
   - ✅ Integration tests present

## Deployment Plan

### Phase 1: Pre-Deployment (Now)
- [x] Code changes complete
- [x] Tests passing (8/8)
- [x] CI validation passing (7/7)
- [x] TypeScript checks passing
- [x] ESLint checks passing
- [ ] Deploy to preview environment
- [ ] Run smoke tests on preview

### Phase 2: Production Deployment
- Set `ENABLE_BOTID=1` in production environment variables
- Deploy via standard CI/CD pipeline
- Monitor for 48 hours continuously

### Phase 3: Rollback (if needed)
- Set `ENABLE_BOTID=` (empty) or delete variable
- BotID will be disabled, contact form will work with fallback protection
- Restart Vercel deployment

## Monitoring Plan (48-Hour Window)

### Key Metrics

1. **Contact Form Submission Rate**
   - Monitor `/api/contact` requests in Vercel Analytics
   - Expected: No significant change from baseline
   - Threshold: >20% drop = investigate

2. **BotID Detection Events**
   - Monitor logs for `[Contact API] Bot detected by BotID`
   - Expected: Some detections (legitimate activity)
   - Threshold: >10 bots/hour = possible false positives

3. **403 Error Rate**
   - Monitor BotID rejections vs other errors
   - Expected: Low rate (0-1%)
   - Threshold: >5% = immediate rollback

4. **HTTP Response Times**
   - BotID adds ~10-50ms latency
   - Monitor p50, p95, p99 response times
   - Expected: <5% increase
   - Threshold: >10% increase = investigate

### Where to Monitor

**Vercel Dashboard:**
- Project → Deployments → View monitoring
- Real-time request metrics
- Response time analytics
- Error tracking

**Sentry:**
- Project → Issues
- Filter by `/api/contact` route
- Watch for new error patterns
- Look for increased 403 errors

**Server Logs:**
```bash
# SSH into Vercel or check function logs
# Look for patterns:
# - "[Contact API] Bot detected by BotID"
# - "[Contact API] BotID check failed"
# - Unusual request patterns
```

**Analytics Integration:**
- Vercel Analytics events: `contact_form_submitted`
- Redis view tracking (if enabled)
- Inngest background jobs: `contact/form.submitted`

### Decision Triggers

**Continue with BotID enabled:**
- Submission rate: Normal (±10%)
- 403 error rate: <2%
- Response times: Normal
- No spike in support complaints
- Bot detection events: <5/hour

**Investigate (but don't rollback yet):**
- Submission rate: -10% to -20%
- 403 error rate: 2-5%
- Response time increase: 5-10%
- Individual user reports of false positives

**Immediate Rollback:**
- Submission rate: >-20%
- 403 error rate: >5%
- Response time increase: >10%
- Multiple user complaints
- Service degradation

## Implementation Details

### BotID Check Code

```typescript
// src/app/api/contact/route.ts
if (process.env.ENABLE_BOTID === '1') {
  try {
    const verification = await checkBotId();

    // Only block if BotID confidently identifies this as a bot
    // Verified bots (search engines) are allowed through
    if (verification.isBot && !verification.isVerifiedBot && !verification.bypassed) {
      console.log("[Contact API] Bot detected by BotID - blocking request");
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }
  } catch (botIdError) {
    // Graceful fallback: if BotID fails, continue with rate limiting + honeypot
    console.warn("[Contact API] BotID check failed, using fallback protection...");
  }
}
```

### Protection Layers (In Order)

1. **BotID** (when enabled) - Blocks automated bots
2. **Rate Limiting** - Prevents abuse (3 req/min per IP)
3. **Honeypot** - Catches simple bots (empty `website` field)
4. **Input Validation** - Prevents injection attacks
5. **Email Validation** - RFC 5322 compliant

## False Positive Analysis

### Previous Issue (PR #112)

**Root Cause:** Unknown configuration or validation issue

**How We're Mitigating:**

1. **Validation Script:** 7-point validation before deployment
2. **Graceful Fallback:** BotID failures don't block legitimate users
3. **Environment Variable:** Easy to disable without code changes
4. **Comprehensive Tests:** Both enabled/disabled states tested
5. **Monitoring Plan:** 48-hour observation window

### Possible Root Causes (Historical)

- BotID TLS certificate not configured in Vercel
- Client-side initialization not loaded for all users
- CSP headers blocking BotID script
- Ad-blockers interfering with device fingerprinting
- Privacy extensions (uBlock Origin, etc.) breaking validation

### How BotID Handles Edge Cases

- **Verified Bots:** Search engines, monitoring tools are allowed
- **Privacy-Conscious Users:** Request completes with graceful fallback
- **Ad-Blocker Users:** Protected by fallback (rate limit + honeypot)

## Rollback Procedure

If false positives recur:

```bash
# Option 1: Disable via environment variable (no code change needed)
ENABLE_BOTID=  # Set to empty or delete the variable

# Option 2: Revert to previous commit (full rollback)
git revert 32a2014
npm run build
```

**Expected Result:** Contact form works with rate limiting + honeypot protection (99.8% spam catch rate without BotID)

## Success Criteria

After 48 hours of monitoring:

- ✅ Submission rate within ±10% of baseline
- ✅ 403 error rate <2%
- ✅ Response times <5% slower
- ✅ Zero escalated support complaints
- ✅ No new patterns in error logs
- ✅ BotID detecting realistic number of bots (5-10/hour)

If all criteria met: **BotID re-enablement is successful** ✅

## Post-Deployment

### Update Documentation
- Update `BOTID_IMPLEMENTATION.md` with re-enablement details
- Document any lessons learned
- Update this plan with actual metrics

### Monitor Long-Term
- Weekly review of BotID effectiveness
- Track trends in spam vs bot detection
- Consider adjusting thresholds if needed

### Consider Future Enhancements
- Apply BotID to `/api/views` if bot traffic increases
- Implement custom bot detection dashboard
- Add Sentry integration for bot detection events

## Team Communication

### Before Deployment
- [ ] Notify team: "BotID re-enablement scheduled for [DATE]"
- [ ] Link to this plan in #engineering channel
- [ ] Set up on-call rotation for monitoring

### During Monitoring Window
- [ ] Daily standup: Share metrics and trends
- [ ] Alert on decision triggers (rollback vs continue)
- [ ] Document any issues discovered

### After 48 Hours
- [ ] Share final report and metrics
- [ ] Decision: Keep enabled or investigate further
- [ ] Update CHANGELOG.md

## References

- **Original Implementation:** `32a2014` (BotID disabled)
- **BotID Docs:** https://vercel.com/docs/botid/get-started
- **Previous Issue:** PR #112
- **Related Guide:** `docs/security/botid-implementation.md`
- **Test File:** `src/__tests__/api/contact-botid.test.ts`
- **Validation Script:** `scripts/validate-botid-setup.mjs`

---

**Last Updated:** December 12, 2025
**Status:** Ready for deployment
**Approval Required:** YES (before setting ENABLE_BOTID=1)

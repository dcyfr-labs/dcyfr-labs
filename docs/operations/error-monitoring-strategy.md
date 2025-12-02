# Error Monitoring Strategy

**Last Updated:** November 19, 2025  
**Status:** ✅ Active  
**Owner:** Development Team

## Overview

This document establishes the error monitoring strategy for www.dcyfr.ai using Sentry. It defines severity levels, response times (SLAs), review processes, and alert configurations to ensure proactive issue detection and resolution.

## Table of Contents

- [Error Severity Levels](#error-severity-levels)
- [Service Level Agreements SLAs](#service-level-agreements-slas)
- [Weekly Review Process](#weekly-review-process)
- [Alert Configuration](#alert-configuration)
- [Common Error Patterns](#common-error-patterns)
- [Escalation Procedures](#escalation-procedures)
- [Metrics and KPIs](#metrics--kpis)

## Error Severity Levels

### 🔴 Critical

**Definition:** Issues that prevent core functionality or affect all users

**Examples:**

- 500 Internal Server Error affecting all pages
- Database/Redis complete failure
- Authentication system down
- Build/deployment failures
- Data loss or corruption
- Security breaches

**Characteristics:**
- Affects >50% of users
- Core features completely unavailable
- Revenue impact or legal liability
- Data integrity at risk

**Response Time:** **Immediate** (within 1 hour)

**Actions:**
- Immediate investigation required
- Page on-call engineer if outside business hours
- Post incident report required
- Root cause analysis mandatory

### 🟠 High

**Definition:** Significant functionality degraded but workarounds exist

**Examples:**
- Blog post rendering failures
- Contact form submission errors
- RSS/Atom feed generation failures
- Search functionality broken
- Analytics not tracking
- GitHub API integration failing

**Characteristics:**
- Affects 10-50% of users or specific features
- Major feature degraded but site functional
- User experience significantly impacted
- No immediate workaround

**Response Time:** **24 hours** (business hours)

**Actions:**
- Investigate within 24 hours
- Implement fix within 72 hours
- Document resolution
- Consider hotfix deployment

### 🟡 Medium

**Definition:** Minor functionality issues with minimal user impact

**Examples:**
- Image loading failures (partial)
- CSS styling glitches
- Non-critical API timeouts
- Rate limiting edge cases
- View count tracking errors
- Non-fatal MDX parsing warnings

**Characteristics:**
- Affects <10% of users
- Workarounds available
- Cosmetic or convenience features
- Isolated to specific pages/features

**Response Time:** **1 week**

**Actions:**
- Include in next sprint planning
- Batch with similar fixes
- Low priority deployment
- Document for future reference

### 🟢 Low

**Definition:** Edge cases, informational errors, or false positives

**Examples:**
- Browser extension CSP violations (expected)
- Client-side network errors (EPIPE, ECONNRESET)
- User input validation (expected behavior)
- 404 errors from bots/scanners
- Deprecated API warnings (not blocking)

**Characteristics:**
- No user impact
- Expected behavior
- Environmental/external issues
- Low occurrence rate (<5 events/week)

**Response Time:** **As time permits** (backlog)

**Actions:**
- Monitor for pattern changes
- Document if recurring
- Consider noise reduction
- Review quarterly

## Service Level Agreements (SLAs)

| Severity | Initial Response | Resolution Target | Escalation |
|----------|-----------------|-------------------|------------|
| 🔴 Critical | 1 hour | 4 hours | Immediate page |
| 🟠 High | 24 hours | 72 hours | After 48 hours |
| 🟡 Medium | 1 week | 2 weeks | After 2 weeks |
| 🟢 Low | As time permits | N/A | N/A |

### SLA Definitions

- **Initial Response:** Time to acknowledge and begin investigation
- **Resolution Target:** Time to deploy fix or implement mitigation
- **Escalation:** When to escalate if SLA not met

### SLA Exceptions

SLAs may be extended for:
- External dependencies (third-party APIs down)
- Complex issues requiring architectural changes
- Waiting on vendor support
- Non-reproducible issues requiring more data

Document all exceptions with rationale in Sentry issue comments.

## Weekly Review Process

### Schedule

**Every Monday, 10:00 AM PST** (or next business day if holiday)

### Review Checklist

1. **Open Sentry Dashboard**
   - Navigate to [https://dcyfr-labs.sentry.io/](https://dcyfr-labs.sentry.io/)
   - Select `dcyfr-labs` project

2. **Review Issue Summary (Last 7 Days)**
   - Total issues opened vs. closed
   - New issue types not seen before
   - Issues exceeding occurrence threshold

3. **Triage New Issues**
   - Assign severity level (Critical/High/Medium/Low)
   - Assign to team member if Critical/High
   - Add labels (bug, enhancement, security, etc.)
   - Link to GitHub issue if action required

4. **Check SLA Compliance**
   - Critical issues resolved within 4 hours?
   - High issues acknowledged within 24 hours?
   - Medium issues addressed within 2 weeks?

5. **Review CSP Violations**
   - Follow process in `docs/security/csp-monitoring.md`
   - Update CSP policy if legitimate resources blocked
   - Document third-party extension violations

6. **Update Error Patterns**
   - Add new patterns to [Common Error Patterns](#common-error-patterns)
   - Update resolution guides
   - Share learnings with team

7. **Check Metrics & Trends**
   - Error rate trending up or down?
   - New error types appearing?
   - Specific pages/features problematic?

8. **Document Review**
   - Add weekly summary to `docs/operations/sentry-review-log.md`
   - Note any trends or concerns
   - Action items for next sprint

### Review Template

```markdown
## Sentry Review - [Date]

**Reviewer:** [Name]  
**Time:** [Duration]

### Summary
- **Total Issues:** [X new, Y resolved, Z open]
- **Critical Issues:** [Count]
- **High Issues:** [Count]
- **Trends:** [Up/Down/Stable]

### New Issues
1. [Issue ID] - [Description] - [Severity]
2. ...

### Resolved Issues
1. [Issue ID] - [Resolution Summary]
2. ...

### Action Items
- [ ] [Action 1]
- [ ] [Action 2]

### Notes
[Any observations, patterns, or concerns]
```

## Alert Configuration

### Sentry Alert Rules

Configure these alerts in Sentry dashboard:

#### 1. Critical Errors - Immediate Page

**Conditions:**
- Issue severity: Critical OR
- Error count > 10 in 5 minutes OR
- Affected users > 100 in 15 minutes OR
- Issue contains: `500`, `UnhandledRejection`, `SecurityError`

**Actions:**
- Send email to: `alerts@example.com`
- Send Slack message to: `#incidents` (if configured)
- Page on-call engineer (if configured)

**Frequency:** Immediate, no throttling

#### 2. High Priority Errors - Daily Digest

**Conditions:**
- Issue severity: High OR
- Error count > 5 in 1 hour OR
- New issue type not seen before

**Actions:**
- Send email to: `dev-team@example.com`
- Create GitHub issue automatically (optional)

**Frequency:** Once per issue, re-alert after 24 hours if unresolved

#### 3. Error Rate Spike - Weekly Summary

**Conditions:**
- Error rate increased > 50% compared to previous week OR
- New error pattern detected

**Actions:**
- Send email summary to: `dev-team@example.com`
- Include top 5 issues by occurrence

**Frequency:** Weekly on Monday morning

#### 4. Connection Errors - Noise Reduction

**Conditions:**
- Error message contains: `EPIPE`, `ECONNRESET`, `ECONNABORTED`, `Client closed request`

**Actions:**
- Log at debug level (not error)
- Do NOT send alerts
- Include in weekly summary if pattern changes

**Frequency:** No alerts (expected behavior)

### Email Alert Setup

1. Navigate to **Settings → Projects → dcyfr-labs → Alerts**
2. Click **Create Alert Rule**
3. Select trigger conditions (see above)
4. Configure notification channels:
   - Email: `alerts@example.com` (Critical), `dev-team@example.com` (High/Medium)
   - Slack: `#incidents` (Critical), `#engineering` (High)
5. Set alert frequency and throttling
6. Test alert with sample event

### Alert Testing

Test alerts quarterly to ensure they're working:

```bash
# Trigger test alert via Sentry CLI
sentry-cli send-event --level error \
  --message "Test alert: Critical error monitoring" \
  --tag severity:critical
```

## Common Error Patterns

### 1. Import/Export Errors (Resolved)

**Pattern:**
```
Error: Module not found
Error: Export 'Component' not found in '@/components/...'
```

**Causes:**
- Incorrect import paths
- Missing exports
- Circular dependencies

**Resolution:**
- Verify import path matches file location
- Check that component/function is exported
- Use VS Code auto-import to prevent typos

**Status:** ✅ All import errors resolved as of Nov 19, 2025

### 2. Connection Errors (Expected Behavior)

**Pattern:**
```
Error: write EPIPE
Error: ECONNRESET
Error: ECONNABORTED
Error: Client closed request
```

**Causes:**
- User closes browser before response completes
- Network interruption
- Timeout during slow connections

**Resolution:**
- ✅ Graceful handling implemented in `src/lib/error-handler.ts`
- Log at debug level (not error)
- Return 499 status code
- Do NOT report to Sentry as errors

**Status:** ✅ Handled gracefully as of Nov 19, 2025

### 3. CSP Violations - Browser Extensions (Expected)

**Pattern:**
```
Blocked URI: https://r2cdn.perplexity.ai/...
Blocked URI: chrome-extension://...
Violated Directive: font-src, script-src
```

**Causes:**
- Third-party browser extensions (Perplexity AI, ad blockers, etc.)
- Users' personal extensions

**Resolution:**
- ✅ No action required - CSP working as intended
- Document in `docs/security/csp-monitoring.md`
- Monitor for patterns that might indicate legitimate resources blocked

**Status:** ✅ Expected behavior, monitoring active

### 4. Rate Limiting Edge Cases

**Pattern:**
```
Error: Too many requests
Status: 429
```

**Causes:**
- Legitimate traffic spikes
- Potential abuse/bot traffic
- Rate limit thresholds too strict

**Resolution:**
- Review rate limit logs in Redis
- Adjust thresholds if legitimate traffic affected
- Implement IP allowlist for known good actors
- Consider adaptive rate limiting

**Status:** 🟡 Monitoring for patterns

### 5. MDX Parsing Errors

**Pattern:**
```
Error: Unexpected token in MDX
Error: Invalid frontmatter
```

**Causes:**
- Malformed markdown syntax
- Invalid frontmatter YAML
- Missing closing tags

**Resolution:**
- Validate MDX before publishing with `npm run build`
- Use MDX playground for testing
- Add pre-commit hooks for MDX validation

**Status:** 🟢 Low priority, rare occurrence

### 6. Redis Connection Failures

**Pattern:**
```
Error: ECONNREFUSED 127.0.0.1:6379
Error: Redis connection timeout
```

**Causes:**
- Redis server down
- Network connectivity issues
- Connection pool exhausted

**Resolution:**
- ✅ Automatic fallback to in-memory storage implemented
- Check Redis health endpoint
- Verify REDIS_URL environment variable
- Restart Redis service if needed

**Status:** ✅ Graceful degradation implemented

## Escalation Procedures

### When to Escalate

Escalate an issue if:
- SLA will be missed or has been missed
- Issue more complex than initially assessed
- Requires external vendor support
- Security implications identified
- Data loss risk identified

### Escalation Path

1. **Initial Owner** → Assigned developer
2. **Level 1** → Tech Lead (if SLA at risk)
3. **Level 2** → Engineering Manager (if Critical + unresolved after 2 hours)
4. **Level 3** → CTO/VP Engineering (if Critical + affecting revenue)

### Escalation Notification

Use this template when escalating:

```
Subject: [ESCALATION] [Severity] [Brief Description]

Issue: [Sentry Issue ID and Link]
Severity: [Critical/High/Medium]
SLA Status: [Time remaining or overdue]
Impact: [User count, features affected]
Current Status: [Investigation phase, attempted solutions]
Blocking Factors: [What's preventing resolution]
Request: [Specific help needed]
```

## Metrics & KPIs

### Error Rate Targets

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Overall Error Rate | <0.1% of requests | >0.5% |
| Critical Errors | 0 per week | >1 per week |
| High Errors | <5 per week | >10 per week |
| MTTR (Mean Time to Resolution) | <4 hours (Critical) | >8 hours |
| Error Recurrence Rate | <5% | >10% |

### Success Metrics

Track these monthly in Sentry:

- **Error Volume Trend:** Month-over-month change
- **New vs. Returning Issues:** Ratio of new issues to recurring ones
- **Resolution Rate:** % of issues resolved within SLA
- **User Impact:** Affected users per error
- **Detection Time:** Time from error occurrence to detection

### Dashboard Review

Include these in monthly engineering review:

1. Error rate trends (6-month view)
2. Top 10 errors by occurrence
3. Top 10 errors by affected users
4. SLA compliance rate
5. Time to resolution (average)
6. Recurring issues (>3 occurrences)

## Continuous Improvement

### Quarterly Review

Every quarter, review this strategy and:

- Update severity definitions based on actual impact
- Adjust SLAs based on team capacity
- Refine alert rules to reduce noise
- Add new error patterns to common issues
- Update escalation procedures if needed
- Review and optimize error handling code

### Feedback Loop

After each Critical or High severity incident:

1. Conduct blameless post-mortem
2. Document learnings in this file
3. Update error handling if needed
4. Improve monitoring/alerts if detection was delayed
5. Share findings with team

### Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-19 | 1.0 | Initial error monitoring strategy document |

## Related Documentation

- [CSP Monitoring Guide](../security/csp-monitoring.md)
- [Error Handler Implementation](../../src/lib/error-handler.ts)
- [Rate Limiting Strategy](../security/rate-limiting.md)
- [Uptime Monitoring Setup](./uptime-monitoring-sentry.md)
- [Sentry Configuration](../../sentry.server.config.ts)

## Contact & Support

- **Sentry Dashboard:** https://dcyfr-labs.sentry.io/
- **Documentation:** https://docs.sentry.io/
- **Internal Support:** `#engineering` Slack channel
- **On-Call:** [PagerDuty/rotation link]

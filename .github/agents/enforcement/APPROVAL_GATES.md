# Approval Gates & Policy Enforcement

**File:** `.github/agents/enforcement/APPROVAL_GATES.md`  
**Last Updated:** December 9, 2025  
**Scope:** Breaking changes, architecture decisions, security-sensitive updates

---

## Overview

DCYFR cannot proceed independently on certain changes. These require **explicit human approval** before implementation.

**Approval Process:**
1. DCYFR identifies the change type
2. DCYFR pauses and requests approval
3. You review and provide guidance
4. DCYFR proceeds with approved approach

---

## Breaking Changes

### Definition

A breaking change is any modification that affects the **public API** of a component, page, or system.

### Examples

**❌ Require Approval:**
- Removing a component's public prop
- Changing return type of utility function
- Removing exported function from barrel export
- Changing URL structure (`/blog` → `/articles`)
- Removing a publicly-used CSS class

**✅ Don't Require Approval:**
- Adding optional props
- Adding new exports
- Adding internal-only utilities (not exported)
- Refactoring internal implementation
- Renaming private variables

### Approval Checklist

**DCYFR pauses and asks:**
```
⚠️ Breaking Change Detected

This change affects the public API:
- Component prop removed: `showDate`
- 3 files import this component

Affected:
- src/components/post-card.tsx (prop removed)
- src/components/post-list.tsx (uses prop)
- src/app/blog/page.tsx (uses prop)

Approval needed before proceeding.

Options:
1. Keep backward compatibility (add deprecation warning)
2. Update all usages first, then remove prop
3. Cancel change
```

---

## Architecture Decisions

### Definition

An architecture decision is any change that affects the **system design**, not just one component.

### Examples

**❌ Require Approval:**
- Add new dependency (library, framework)
- Change database schema or API structure
- Introduce new design pattern (e.g., new state management)
- Modify build toolchain
- Change deployment strategy
- Add new environment variable requirements

**✅ Don't Require Approval:**
- Using existing patterns in new places
- Refactoring with same architecture
- Optimizing existing code
- Adding features within established patterns

### Approval Checklist

**DCYFR pauses and asks:**
```
⚠️ Architecture Decision Required

This requires a new architecture pattern:
- Adding form validation library (zod)
- Impacts: 5 API routes, 3 components

Justification provided:
- Type-safe form validation
- Reduce boilerplate in form handling
- 28KB gzipped (acceptable)

Questions:
1. Should we use Zod or alternative?
2. Should this be project-wide standard?
3. Approval to proceed?
```

---

## Security-Sensitive Changes

### Definition

Changes that affect **authentication, authorization, or data security**.

### Examples

**❌ Require Approval:**
- Changing how API keys/secrets are handled
- Modifying authentication flow
- Changing CORS or HTTP security headers
- Adding/removing rate limiting
- Modifying data sanitization
- Changing encryption strategy
- Adding third-party integrations with data access

**✅ Don't Require Approval:**
- Using existing auth methods
- Non-security bug fixes
- Performance improvements without security impact
- Documentation-only security updates

### Approval Checklist

**DCYFR pauses and asks:**
```
⚠️ Security Decision Required

This change affects security:
- Modifying rate limiting threshold
- From: 10 requests per hour
- To: 50 requests per hour

Justification:
- Some legit users hitting limit
- Need higher threshold for API usage

Risk Assessment:
- Potential for more abuse attempts
- Still has protection, just higher threshold

Questions:
1. Is this threshold appropriate?
2. Should we add additional security (IP blocking)?
3. Approval to proceed?
```

---

## Security Vulnerability Fixes

### Definition

Fixes for **CodeQL/security scanner findings** that involve code changes to remediate vulnerabilities.

### Approval Status

**Quick Answer:**
- ✅ **NO APPROVAL NEEDED** for fixes
- ✅ **Proceed immediately** upon discovery
- ✅ **Security > Breaking changes** (security fixes supersede approval gates)
- 📋 **Document thoroughly** (why vulnerable, how fixed, test coverage)

### Process for Security Fixes

1. **Discover vulnerability** (CodeQL, manual review, etc.)
2. **Root cause analysis** (understand the issue)
3. **Implement fix** (defense-in-depth approach)
4. **Add security tests** (prevent regression)
5. **Document in `/docs/private/`** (security findings stay private)
6. **Validate fully** (TypeScript, ESLint, tests, manual security review)
7. **Merge immediately** (don't wait for scheduled reviews)

### Example: SSRF Vulnerability (CWE-918)

```
🔴 CRITICAL: SSRF in /api/credly/badges

File: src/app/api/credly/badges/route.ts
Line: 47
Issue: User input directly in URL

Fix Applied:
1. Added input validation (whitelist regex)
2. Added length check (255 char limit)
3. Use URL constructor (structural guarantee)
4. Added 23 security tests (SSRF attack vectors)

Documentation:
- docs/private/SECURITY_FIX_CWE918_SSRF.md

Status: READY TO MERGE (no approval needed)
```

### Security-Specific Validation Checklist

Before merging a security fix:

- ✅ **Root cause** - Clearly documented why vulnerable
- ✅ **Defense-in-depth** - Multiple layers of protection
- ✅ **Test coverage** - Attack vectors tested, not just valid input
- ✅ **No regressions** - Original functionality still works
- ✅ **Documentation** - Stored in `/docs/private/` (not public)
- ✅ **CWE reference** - Links to specific weakness
- ✅ **Lessons learned** - How to prevent similar issues

### When to Document in Private

Store security findings in `/docs/private/` directory:
- ✅ Vulnerability details and analysis
- ✅ Root cause explanation
- ✅ Attack vectors demonstrated
- ✅ Fix implementation details
- ✅ Test coverage for regression prevention

❌ **Never** publicly document:
- Specific exploit details before patch available
- Undisclosed vulnerabilities
- Ways to bypass security controls

---

## Emergency Overrides


In rare cases, you can authorize DCYFR to proceed **without** pre-approval:

```
Override approval for this change:
- Reason: Production hotfix
- Scope: Change X only
- Approval expires: 2 hours
```

**Rules for overrides:**
- ✅ Use for production hotfixes only
- ✅ Time-limited (max 2 hours)
- ❌ Never override security changes long-term
- ❌ Don't override architecture without review

---

## Approval Format

### Yes, Proceed

```
Approved to proceed with breaking change.

Approach:
1. Add deprecation warning to old prop
2. Update all usages
3. Remove deprecated prop (next major version)

Approved by: You
Timestamp: December 9, 2025
```

### No, Alternative Approach

```
Don't proceed with current approach.

Reason: Need to maintain backward compatibility

Alternative approach:
1. Keep old prop, mark as deprecated
2. Add new prop with better name
3. Support both for one release cycle
4. Deprecate old prop with warnings
```

### Needs Clarification

```
Before I can approve, need clarification:

1. Which components will be affected?
2. What's the migration path for users?
3. Are there tests for the change?
4. Why is the breaking change necessary?
```

---

## Common Approval Patterns

### Pattern 1: New Dependency

**Requirement:**
- Functionality justification
- Size impact (gzipped)
- Maintenance status
- Alternative comparison

**Example Approval:**
```
Approved to add zod for form validation.

Justification: Type-safe validation, reduces boilerplate
Size: 28KB gzipped (acceptable)
Maintenance: Well-maintained, active community
Alternatives considered: yup, joi (heavier)

Will become project-wide standard for all forms.
```

### Pattern 2: Database Schema Change

**Requirement:**
- Migration plan
- Data compatibility
- Rollback strategy
- User impact

**Example Approval:**
```
Approved to add user.preferences column.

Migration: Add nullable column, backfill with defaults
Rollback: Drop column if needed (pre-data step)
Impact: No user-facing changes, feature-gated
Timeline: Safe to deploy immediately
```

### Pattern 3: Rate Limit Change

**Requirement:**
- Justification for change
- Safety thresholds
- Monitoring plan

**Example Approval:**
```
Approved to increase rate limit to 50/hour.

Monitoring: Watch for abuse patterns
Safety: Still lower than competitor (100/hour)
Fallback: Can revert if abuse detected
Timeline: Deploy and monitor for 1 week
```

---

## Approval Timeline

| Change Type | Approval Time | Emergency Override? |
|-------------|---------------|---------------------|
| **Breaking change** | Next available | Case-by-case |
| **Architecture** | Review meeting | No |
| **Security** | Immediate | Only for hotfixes |
| **New dependency** | 24 hours | No |

---

## Communication Protocol

**DCYFR identifies need for approval:**
```
Pauses work and states:

⚠️ APPROVAL REQUIRED

Type: [Breaking change | Architecture | Security]
Reason: [Specific reason]
Options: [A, B, C]
Recommendation: [DCYFR's suggestion]
Impact: [Who/what is affected]

Awaiting your approval to proceed.
```

**You respond with approval:**
```
Approved: [Option chosen]
Reasoning: [Why this option]
Any constraints: [Timeline, monitoring, etc.]
```

**DCYFR proceeds:**
```
✅ Approved. Proceeding with [option].

Next steps:
1. [Step 1]
2. [Step 2]
3. [Validation]
```

---

## Quick Reference

| Change Type | Needs Approval? | Typical Time |
|-------------|-----------------|--------------|
| Optional prop added | ❌ No | Immediate |
| Required prop removed | ✅ Yes | 24h |
| New dependency | ✅ Yes | 24h |
| New design pattern | ✅ Yes | 24h |
| Auth flow change | ✅ Yes | Immediate |
| Rate limit change | ✅ Yes | 24h |
| Using existing pattern | ❌ No | Immediate |
| Bug fix | ❌ No | Immediate |
| Refactor (same behavior) | ❌ No | Immediate |

---

## Related Documentation

- **Validation Checklist:** `.github/agents/enforcement/VALIDATION_CHECKLIST.md`
- **Design Tokens:** `.github/agents/enforcement/DESIGN_TOKENS.md`
- **Workflow Examples:** `.github/agents/DCYFR.agent.md`

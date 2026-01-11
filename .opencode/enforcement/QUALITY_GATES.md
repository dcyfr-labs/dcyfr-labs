# Quality Gates for OpenCode Development

**Status**: Production Ready  
**Last Updated**: January 5, 2026  
**Purpose**: Pre-completion validation checklists organized by provider tier to ensure consistent quality across all AI models

---

## Overview

Quality gates are **mandatory validation checkpoints** before committing code. The checklist varies by AI provider capability:

- **Premium providers** (Claude, GPT-4): Standard checklist
- **Free providers** (Groq): Enhanced checklist + manual review
- **Offline providers** (Ollama): Full manual review required

**Philosophy**: Quality should be consistent regardless of which AI model generated the code.

---

## Universal Quality Gates (All Providers)

These checks apply **regardless of which AI provider you used**.

### ✅ 1. TypeScript Compilation

**Command**:
```bash
npm run type-check
```

**Expected**: Zero errors, warnings allowed (document inline with `// @ts-expect-error: <reason>`)

**Common Failures**:
- Missing type imports
- Incorrect prop types
- Unused variables (change to `_variableName` if intentional)

**Fix Before Committing**: Yes (hard block)

---

### ✅ 2. ESLint Validation

**Command**:
```bash
npm run lint
```

**Expected**: Zero errors, warnings reviewed and documented

**Common Failures**:
- `@dcyfr/no-hardcoded-values` (design tokens)
- `@dcyfr/no-deep-imports` (barrel exports)
- `react-hooks/exhaustive-deps` (missing dependencies)

**Auto-fix**:
```bash
npm run lint -- --fix
git diff  # Review changes before committing
```

**Fix Before Committing**: Yes (hard block)

---

### ✅ 3. Test Execution

**Command**:
```bash
npm run test:run
```

**Expected**: 
- **Pass rate**: ≥99% (100% not required due to strategic `.skip`)
- **No new failures**: Pre-existing failures documented in `docs/testing/KNOWN_ISSUES.md`

**Common Failures**:
- Snapshot mismatches (update with `npm run test:run -- -u` if intentional)
- Missing test setup (check `vitest.config.ts`)
- Async timing issues (increase timeouts or use `waitFor`)

**Fix Before Committing**: Yes (hard block if pass rate <99%)

---

### ✅ 4. Build Verification

**Command**:
```bash
npm run build
```

**Expected**: Clean build with no errors

**Common Failures**:
- Missing environment variables (check `.env.example`)
- Import resolution errors (verify barrel exports)
- Type errors in production build (check `tsconfig.json`)

**Fix Before Committing**: Yes (hard block)

---

### ✅ 5. Git Status Clean

**Command**:
```bash
git status
```

**Expected**: 
- No untracked files (except intentional additions)
- No staged changes forgotten in previous commits
- `.session-state.json` files not committed (excluded in `.gitignore`)

**Common Issues**:
- Generated files (check `.gitignore`)
- IDE config files (add to `.gitignore` if personal)
- Session state files (should be git-ignored)

**Fix Before Committing**: Yes (review all changes)

---

## Provider-Specific Quality Gates

### Premium Providers (Claude Sonnet 3.5, GPT-4)

**Additional Checks**: None (high confidence in pattern adherence)

**Validation Script**:
```bash
npm run check  # Standard validation only
```

**Pre-Commit Checklist**:
- [x] Universal gates (1-5 above)
- [x] Code review self-check (read your own diff)
- [x] Commit message follows convention (`feat:`, `fix:`, etc.)

**Estimated Time**: 2-3 minutes

---

### Free Providers (Groq Llama 3.3 70B)

**Additional Checks**: Manual review of FLEXIBLE rules

**Validation Script**:
```bash
scripts/validate-after-fallback.sh
```

**Pre-Commit Checklist**:
- [x] Universal gates (1-5 above)
- [x] **Manual FLEXIBLE rules review** (see below)
- [x] Session state saved (if switching models)
- [x] Code review self-check

#### Manual FLEXIBLE Rules Review

##### ⚠️ API Pattern Validation

**Check**:
```bash
# List all POST routes
rg "export async function POST" app/api/ -l

# For each route, verify Inngest usage OR document why not needed
rg "inngest.send" <route-file>
```

**Decision Tree**:
1. Is this a simple operation (<100ms, <10 req/min)?
   - **YES** → Direct processing acceptable (add comment)
   - **NO** → Must use Inngest

2. Does it need retry logic or async processing?
   - **YES** → Must use Inngest
   - **NO** → Continue

**Example Comment**:
```ts
// FLEXIBLE EXCEPTION: Simple contact form (low volume, synchronous)
export async function POST(request: Request) {
  await sendEmail(data);
  return Response.json({ success: true });
}
```

##### ⚠️ Test Coverage Validation

**Check**:
```bash
npm run test:run -- --coverage

# Review pass rate (target: ≥99%)
# Review coverage (informational, no hard target)
```

**Decision Tree**:
1. Is pass rate ≥99%?
   - **YES** → Acceptable
   - **NO** → Review failures (strategic skips OK, document why)

2. Are there E2E tests for new features?
   - **YES** → Acceptable
   - **NO** → Add integration tests (or document why not needed)

**Estimated Time**: 5-7 minutes

---

### Offline Providers (Ollama CodeLlama 34B, Qwen2.5 Coder)

**Additional Checks**: Manual review of ALL rules (STRICT + FLEXIBLE)

**Validation Script** (when back online):
```bash
scripts/validate-after-fallback.sh --verbose
```

**Pre-Commit Checklist**:
- [x] Universal gates (1-5 above)
- [x] **Manual STRICT rules review** (see below)
- [x] **Manual FLEXIBLE rules review** (same as Groq above)
- [x] Session state saved
- [x] Code review self-check
- [x] **Consider re-implementing with premium model** if complex

#### Manual STRICT Rules Review

##### 🔴 Design Token Compliance

**Check**:
```bash
# Search for hardcoded values
rg "className=\".*(?:px-|py-|text-(?:xs|sm|base|lg|xl)|bg-|border-)" --type tsx

# Expected: 0 matches
```

**Manual Scan**:
1. Open each modified file
2. Search for `className=` strings
3. Verify all use design tokens (import from `@/design-system/tokens`)
4. Replace hardcoded values if found

**Auto-Fix**:
```bash
npm run lint -- --fix  # Fixes most violations
git diff  # Review before accepting
```

##### 🔴 PageLayout Usage

**Check**:
```bash
# List all pages
rg "export default function.*Page" app/ -l

# For each page, verify <PageLayout> wrapper
rg "<PageLayout" <page-file>
```

**Manual Scan**:
1. Open each new page file
2. Verify `<PageLayout>` wraps content
3. Check metadata props: `title`, `description`, `keywords`
4. Add if missing

##### 🔴 Barrel Export Imports

**Check**:
```bash
# Search for deep imports
rg 'from ["\'"]@/(components|lib|utils)/[^"\']+/[^"\']+["\']' --type tsx

# Expected: 0 matches
```

**Manual Fix**:
```tsx
// Before (deep import)
import { Button } from "@/components/ui/button/Button";

// After (barrel export)
import { Button } from "@/components/ui";
```

##### 🔴 Test Data Prevention

**Check**:
```bash
# Search for test data patterns
rg "FABRICATED|TEST_DATA|MOCK_" --type ts \
  --glob '!**/*.test.*'

# Check scripts for environment guards
rg "process.env.NODE_ENV.*production" scripts/
```

**Manual Scan**:
1. Open each script in `scripts/`
2. Verify environment guard at top:
```ts
if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
  console.error("❌ Blocked in production");
  process.exit(1);
}
```
3. Add if missing

##### 🔴 Emoji Usage

**Check**:
```bash
# Search for emoji unicode
rg "[\u{1F600}-\u{1F64F}]" --type tsx --type md \
  --glob '!**/*.test.*' \
  --glob '!**/private/**'

# Expected: 0 matches
```

**Manual Fix**:
```tsx
// Before (emoji)
<h1>Welcome! 🎉</h1>

// After (React icon)
import { PartyPopper } from "lucide-react";
<h1>Welcome! <PartyPopper className="inline h-6 w-6" /></h1>
```

**Estimated Time**: 10-15 minutes

---

## Security-Sensitive Quality Gates

**Trigger**: When changes involve authentication, API keys, user data, or external integrations.

**Additional Checks**:

### 🔒 1. Secret Detection

**Check**:
```bash
# Search for potential secrets
rg "(?i)(api[_-]?key|secret|password|token|bearer)" \
  --type ts --type tsx \
  --glob '!**/*.test.*'

# Verify matches are references, not actual secrets
```

**Manual Review**:
- Confirm no hardcoded secrets in code
- Verify all secrets use `process.env.SECRET_NAME`
- Check `.env.example` has placeholders (not real secrets)

### 🔒 2. SSRF Prevention

**Check**:
```bash
# Search for external HTTP requests
rg "fetch\(|axios\(|http\.get\(|https\.get\(" \
  --type ts --type tsx

# Verify all use validated URLs (no user input in URL)
```

**Manual Review**:
- Confirm no user input directly in `fetch()` URLs
- Verify URL allowlist for external requests
- Check for SSRF suppressions (should be documented)

### 🔒 3. Input Validation

**Check**:
```bash
# Search for API routes
rg "export async function (POST|PUT|PATCH)" app/api/ -l

# For each route, verify validation (Zod schema)
rg "z\.object|z\.string|z\.number" <route-file>
```

**Manual Review**:
- Confirm all POST/PUT/PATCH routes validate input
- Verify schema matches expected data structure
- Check error handling for invalid input

**Escalation**: If ANY security checks fail, **switch to premium model** (Claude/GPT-4) for review.

---

## Performance Quality Gates

**Trigger**: When changes involve data fetching, loops, or rendering large lists.

### ⚡ 1. Lighthouse CI

**Check** (automatic in CI):
```bash
# Run Lighthouse CI locally
npm run lighthouse

# Check thresholds (in lighthouserc.json)
# - Performance: ≥90
# - Accessibility: ≥95
# - Best Practices: ≥90
# - SEO: ≥90
```

**Manual Review** (if failing):
- Check bundle size: `npm run build -- --analyze`
- Review render performance: React DevTools Profiler
- Verify lazy loading for images/components

### ⚡ 2. Bundle Size

**Check**:
```bash
npm run build -- --analyze

# Review bundle size report
# Target: <500KB for main bundle
```

**Manual Review** (if >500KB):
- Check for duplicate dependencies
- Verify code splitting (`next/dynamic`)
- Review import patterns (tree-shaking)

---

## Approval Gates Integration

Some changes require **explicit approval** before merging (see [Approval Gates](../../.github/agents/enforcement/APPROVAL_GATES.md)).

### When Approval Required

**Trigger ANY**:
- [ ] Breaking changes (API contracts, component props)
- [ ] New architectural patterns (not in existing docs)
- [ ] Security-sensitive changes (auth, encryption, data handling)
- [ ] Performance regression (Lighthouse score drops >5 points)
- [ ] Dependency updates (major versions)

**Process**:
1. Complete all quality gates above
2. Document change in PR description
3. Tag `@architecture-team` for review
4. Wait for approval before merging

**Bypass**: Emergency production fixes only (must document and schedule proper fix).

---

## Pre-Commit Summary Script

**Create** `.git/hooks/pre-commit` (auto-runs before each commit):

```bash
#!/bin/bash
# Pre-commit quality gate

echo "🔍 Running quality gates..."

# Universal checks
npm run type-check || exit 1
npm run lint || exit 1
npm run test:run || exit 1

# Provider-specific validation
if command -v opencode &> /dev/null; then
  # OpenCode detected, run enhanced validation
  scripts/validate-after-fallback.sh || exit 1
fi

# Git status check
if git status --porcelain | grep -q "\.session-state\.json"; then
  echo "❌ Session state files should not be committed"
  exit 1
fi

echo "✅ All quality gates passed"
exit 0
```

**Install**:
```bash
chmod +x .git/hooks/pre-commit
```

**Bypass** (emergency only):
```bash
git commit --no-verify -m "emergency fix (bypass gates)"
# Must fix in follow-up commit within 24 hours
```

---

## Quality Metrics Dashboard

Track quality over time (updated by CI):

**Location**: `docs/metrics/quality-dashboard.json`

**Tracked Metrics**:
```json
{
  "timestamp": "2026-01-05T12:00:00Z",
  "provider": "groq_primary",
  "quality_gates": {
    "typescript": "pass",
    "eslint": "pass",
    "tests": { "pass_rate": 99.2, "status": "pass" },
    "build": "pass",
    "strict_rules": {
      "design_tokens": 0,
      "page_layout": 95.0,
      "barrel_exports": 0,
      "test_data": 0,
      "emoji": 0
    },
    "flexible_rules": {
      "api_patterns": 82.0,
      "test_coverage": 97.5
    }
  },
  "duration_seconds": 180
}
```

**View Dashboard**:
```bash
# Generate HTML report
npm run metrics:dashboard

# Open in browser
open docs/metrics/quality-dashboard.html
```

---

## Troubleshooting Quality Gate Failures

### TypeScript Errors

**Symptom**: `npm run type-check` fails

**Common Causes**:
- Missing type imports
- Incorrect generic types
- Strict mode violations

**Debugging**:
```bash
# Verbose output
npm run type-check -- --verbose

# Check specific file
npx tsc --noEmit path/to/file.ts
```

**Fix Strategy**: Read error message, fix imports/types, re-run.

---

### ESLint Failures

**Symptom**: `npm run lint` reports errors

**Common Causes**:
- Design token violations (`@dcyfr/no-hardcoded-values`)
- Deep imports (`@dcyfr/no-deep-imports`)
- React hooks dependencies

**Debugging**:
```bash
# Show rule details
npm run lint -- --format=verbose

# Auto-fix safe violations
npm run lint -- --fix

# Review changes
git diff
```

**Fix Strategy**: Apply auto-fix, manually fix remaining, review diff.

---

### Test Failures

**Symptom**: `npm run test:run` shows failures

**Common Causes**:
- Snapshot mismatches (component changed)
- Async timing issues (timeout)
- Missing mocks (external dependencies)

**Debugging**:
```bash
# Run in watch mode with verbose output
npm run test -- --reporter=verbose

# Update snapshots (if changes intentional)
npm run test:run -- -u

# Run specific test file
npm run test:run -- path/to/test.test.ts
```

**Fix Strategy**: 
1. Read failure message
2. Check if snapshot update needed
3. Fix test or implementation
4. Re-run

---

### Build Failures

**Symptom**: `npm run build` fails

**Common Causes**:
- Missing environment variables
- Import resolution errors
- Production-only type errors

**Debugging**:
```bash
# Build with verbose output
npm run build -- --debug

# Check environment variables
cat .env.example  # Compare with .env.local

# Test production build locally
npm run build && npm run start
```

**Fix Strategy**: 
1. Add missing env vars to `.env.local`
2. Fix import paths
3. Verify production build works

---

## Best Practices

### ✅ Do

- **Run quality gates before committing** (not after push)
- **Review your own diff** (self code review)
- **Document exceptions** in code comments
- **Use pre-commit hooks** (automated enforcement)
- **Track metrics over time** (quality dashboard)
- **Escalate to premium model** if stuck >30 minutes on quality issues

### ❌ Don't

- **Skip quality gates** (CI will fail anyway)
- **Commit without testing** (broken builds waste team time)
- **Ignore warnings** (they compound into errors)
- **Bypass without documentation** (emergency fixes only)
- **Assume offline = same quality** (require enhanced validation)

---

## Related Documentation

**Enforcement**:
- [Hybrid Enforcement](./HYBRID_ENFORCEMENT.md) - STRICT vs. FLEXIBLE rules
- [Enhanced Validation](./VALIDATION_ENHANCED.md) - Manual checklists
- [Approval Gates](../../.github/agents/enforcement/APPROVAL_GATES.md) - Breaking changes

**Patterns**:
- [Testing Patterns](../../.github/agents/patterns/TESTING_PATTERNS.md) - Test strategy
- [Component Patterns](../../.github/agents/patterns/COMPONENT_PATTERNS.md) - Layout/import rules
- [API Patterns](../../.github/agents/patterns/API_PATTERNS.md) - Inngest integration

**Workflows**:
- [Session Handoff](../workflows/SESSION_HANDOFF.md) - Model switching
- [Troubleshooting](../workflows/TROUBLESHOOTING.md) - Common issues

**Scripts**:
- `scripts/validate-after-fallback.sh` - Enhanced validation
- `npm run check:opencode` - Standard validation
- `npm run metrics:dashboard` - Quality tracking

---

**Status**: Production Ready  
**Maintenance**: Update metrics quarterly  
**Owner**: Quality Assurance Team

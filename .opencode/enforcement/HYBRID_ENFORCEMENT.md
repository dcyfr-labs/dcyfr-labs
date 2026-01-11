# Hybrid Enforcement Strategy

**Status**: Production Ready  
**Last Updated**: January 5, 2026  
**Purpose**: Balance strict pattern compliance with flexible development workflows using provider-aware enforcement

---

## Overview

DCYFR OpenCode uses a **hybrid enforcement model** that adapts to provider capabilities:

- **STRICT rules**: Hard block violations (exit 1) - Non-negotiable patterns
- **FLEXIBLE rules**: Warn only - Best practices with context-dependent exceptions

**Rationale**: Free/offline models have lower pattern recognition capabilities than premium models (Claude Sonnet 3.5). Hybrid enforcement prevents false positives while maintaining quality standards.

---

## Enforcement Tiers

### STRICT Rules (Hard Block)

**Enforcement**: Violations **MUST** be fixed before committing. Script exits with code 1.

**Why STRICT**: These patterns are:
- Objectively measurable (no interpretation needed)
- Critical to project integrity
- Easily detectable with automated tooling
- Non-negotiable across all contexts

#### 1. Design Token Compliance

**Rule**: All visual properties MUST use design tokens from `src/design-system/tokens/`

**Detection**:
```bash
# ESLint rule: @dcyfr/no-hardcoded-values
npm run lint

# Manual check: Search for hardcoded values
rg "className=\".*(?:px-|py-|text-|bg-|border-)" --type tsx
```

**Examples**:

❌ **VIOLATION (Hard Block)**:
```tsx
<div className="px-8 py-4 bg-blue-500">  {/* Hardcoded values */}
```

✅ **COMPLIANT**:
```tsx
<div className={`${SPACING.SECTION_X} ${SPACING.SECTION_Y} ${COLORS.PRIMARY.bg}`}>
```

**Fix Required**: Replace all hardcoded values with design tokens before commit.

**Related Documentation**: [Design Token Enforcement](../../.github/agents/enforcement/DESIGN_TOKENS.md)

---

#### 2. PageLayout Usage (90% Rule)

**Rule**: 90% of pages MUST use `<PageLayout>` component. Exceptions require approval.

**Detection**:
```bash
# Check for PageLayout usage
rg "export default function.*Page" app/ | wc -l  # Total pages
rg "<PageLayout" app/ | wc -l                    # Pages using PageLayout

# Calculate compliance
echo "scale=2; $(rg "<PageLayout" app/ | wc -l) / $(rg "export default function.*Page" app/ | wc -l) * 100" | bc
# Expected: ≥90.00
```

**Examples**:

❌ **VIOLATION (Hard Block)**:
```tsx
// app/new-feature/page.tsx
export default function NewFeaturePage() {
  return (
    <div className="container">  {/* Missing PageLayout */}
      <h1>New Feature</h1>
    </div>
  );
}
```

✅ **COMPLIANT**:
```tsx
// app/new-feature/page.tsx
import { PageLayout } from "@/components/layout/PageLayout";

export default function NewFeaturePage() {
  return (
    <PageLayout title="New Feature" description="...">
      <h1>New Feature</h1>
    </PageLayout>
  );
}
```

**Fix Required**: Wrap page content in `<PageLayout>` or document exception in approval gate.

**Related Documentation**: [Component Patterns - Layouts](../../.github/agents/patterns/COMPONENT_PATTERNS.md)

---

#### 3. Barrel Export Imports

**Rule**: All imports from `@/components`, `@/lib`, `@/utils` MUST use barrel exports.

**Detection**:
```bash
# ESLint rule: @dcyfr/no-deep-imports
npm run lint

# Manual check: Search for deep imports
rg 'from ["\'"]@/(components|lib|utils)/[^"\']+/[^"\']+["\']' --type tsx
```

**Examples**:

❌ **VIOLATION (Hard Block)**:
```tsx
import { Button } from "@/components/ui/button/Button";  // Deep import
```

✅ **COMPLIANT**:
```tsx
import { Button } from "@/components/ui";  // Barrel export
```

**Fix Required**: Update imports to use barrel exports from `index.ts` files.

**Related Documentation**: [Component Patterns - Imports](../../.github/agents/patterns/COMPONENT_PATTERNS.md)

---

#### 4. Test Data Prevention

**Rule**: Test/fabricated data MUST NOT exist in production environment.

**Detection**:
```bash
# Environment check
if [[ "$VERCEL_ENV" == "production" || "$NODE_ENV" == "production" ]]; then
  # Check for test data patterns
  rg "FABRICATED|TEST_DATA|MOCK_" --type ts --type tsx
  
  # Check Redis for test keys
  redis-cli KEYS "*:test:*" | wc -l  # Expected: 0
fi
```

**Examples**:

❌ **VIOLATION (Hard Block)**:
```ts
// scripts/seed-data.ts - NO ENVIRONMENT CHECK
await redis.set("analytics:views", "1000");  // Runs in production!
```

✅ **COMPLIANT**:
```ts
// scripts/seed-data.ts
if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
  console.error("❌ Test data script blocked in production");
  process.exit(1);
}

await redis.set("analytics:views", "1000");  // Safe: only runs in dev
```

**Fix Required**: Add environment checks to block test data scripts in production.

**Related Documentation**: [Test Data Prevention](../../.github/agents/enforcement/TEST_DATA_PREVENTION.md)

---

#### 5. Emoji Usage

**Rule**: Emojis MUST NOT be used in public-facing content (UI, docs, commit messages).

**Detection**:
```bash
# Check for emoji unicode ranges
rg "[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}]" \
  --type tsx --type md --type ts \
  --glob '!**/*.test.*' \
  --glob '!**/private/**'
```

**Examples**:

❌ **VIOLATION (Hard Block)**:
```tsx
<h1>Welcome to DCYFR! 🚀</h1>  {/* Emoji in UI */}
```

✅ **COMPLIANT**:
```tsx
import { Rocket } from "lucide-react";

<h1>Welcome to DCYFR! <Rocket className="inline h-6 w-6" /></h1>
```

**Fix Required**: Replace emojis with React icons (Lucide) or remove entirely.

**Allowed Locations**: Internal docs (`docs/private/`), comments, test files, logs.

**Related Documentation**: See AGENTS.md "Recent Updates" (December 28, 2025)

---

### FLEXIBLE Rules (Warn Only)

**Enforcement**: Violations generate warnings but **do not block commits**.

**Why FLEXIBLE**: These patterns:
- Require contextual judgment
- May have legitimate exceptions
- Harder for free/offline models to detect accurately
- Best validated during code review

#### 6. API Pattern Adherence

**Pattern**: APIs SHOULD follow Validate→Queue→Respond pattern with Inngest.

**Detection**:
```bash
# Check for Inngest integration in API routes
rg "inngest.send" app/api/ --count
rg "export async function POST" app/api/ --count

# Warn if ratio < 0.8 (80% of POSTs should use Inngest)
```

**Examples**:

⚠️ **WARNING (Flexible)**:
```ts
// app/api/contact/route.ts
export async function POST(request: Request) {
  const data = await request.json();
  // Direct processing (no queue) - acceptable for simple operations
  await sendEmail(data);
  return Response.json({ success: true });
}
```

✅ **PREFERRED**:
```ts
// app/api/contact/route.ts
import { inngest } from "@/lib/inngest";

export async function POST(request: Request) {
  const data = await request.json();
  
  await inngest.send({
    name: "contact/form.submitted",
    data: { ...data }
  });
  
  return Response.json({ success: true });
}
```

**When to Allow**: Simple operations, low-traffic endpoints, synchronous workflows.

**Related Documentation**: [API Patterns](../../.github/agents/patterns/API_PATTERNS.md)

---

#### 7. Test Coverage Quality

**Target**: 99% test pass rate (not 100% due to strategic skips).

**Detection**:
```bash
npm run test:run -- --reporter=json > test-results.json

# Calculate pass rate
jq '.numPassedTests / (.numPassedTests + .numFailedTests) * 100' test-results.json
# Expected: ≥99.0
```

**Examples**:

⚠️ **WARNING (Flexible)**:
```ts
// Missing E2E tests for new feature
describe("NewFeature", () => {
  it("renders correctly", () => {
    // Only unit tests, no integration/E2E
  });
});
```

✅ **PREFERRED**:
```ts
describe("NewFeature", () => {
  it("renders correctly", () => { /* unit test */ });
  
  it("integrates with API", async () => { /* integration test */ });
});

// tests/e2e/new-feature.spec.ts
test("user completes workflow", async ({ page }) => {
  // E2E coverage
});
```

**When to Allow**: Incomplete features, temporary skips (`.skip`), non-critical paths.

**Related Documentation**: [Testing Patterns](../../.github/agents/patterns/TESTING_PATTERNS.md)

---

## Provider Capability Matrix

Different AI providers have varying abilities to detect pattern violations:

| Rule                 | Claude Sonnet 3.5 | Groq Llama 3.3 70B | Ollama CodeLlama 34B | Auto-Detectable |
|----------------------|-------------------|--------------------|----------------------|-----------------|
| **Design Tokens**    | ✅ 95%           | ✅ 90%             | ⚠️ 60%              | ✅ ESLint       |
| **PageLayout 90%**   | ✅ 95%           | ✅ 85%             | ⚠️ 50%              | ✅ Script       |
| **Barrel Exports**   | ✅ 95%           | ✅ 90%             | ⚠️ 70%              | ✅ ESLint       |
| **Test Data**        | ✅ 90%           | ✅ 80%             | ⚠️ 60%              | ✅ Script       |
| **Emoji Usage**      | ✅ 99%           | ✅ 95%             | ⚠️ 80%              | ✅ Regex        |
| **API Patterns**     | ✅ 85%           | ⚠️ 70%            | ❌ 40%              | ⚠️ Manual       |
| **Test Coverage**    | ✅ 90%           | ⚠️ 75%            | ❌ 50%              | ✅ Vitest       |

**Legend**:
- ✅ High confidence (≥80% accuracy)
- ⚠️ Medium confidence (60-79% accuracy)
- ❌ Low confidence (<60% accuracy)

**Implication**: STRICT rules are auto-detectable, FLEXIBLE rules require human judgment.

---

## Validation Strategy by Provider

### Premium Providers (Claude Sonnet 3.5, GPT-4)

**Enforcement**: Standard validation (STRICT + FLEXIBLE)

```bash
# Run all checks
npm run check:opencode

# Expected: STRICT rules enforced, FLEXIBLE rules warned
```

**Workflow**:
1. Implement with premium model
2. Run `npm run check:opencode`
3. Fix STRICT violations (hard block)
4. Review FLEXIBLE warnings (optional fixes)
5. Commit when all STRICT rules pass

---

### Free Providers (Groq Llama 3.3 70B)

**Enforcement**: Enhanced validation (STRICT required, FLEXIBLE manual review)

```bash
# Run enhanced validation
scripts/validate-after-fallback.sh

# Expected: STRICT rules enforced, FLEXIBLE manual checklist
```

**Workflow**:
1. Implement with Groq
2. Run `scripts/validate-after-fallback.sh`
3. Fix STRICT violations (hard block)
4. **Manually review FLEXIBLE checklist** (see [VALIDATION_ENHANCED.md](./VALIDATION_ENHANCED.md))
5. Commit when all STRICT rules pass + manual review complete

---

### Offline Providers (Ollama CodeLlama 34B)

**Enforcement**: Manual validation (STRICT + FLEXIBLE both require review)

```bash
# Run local checks
npm run type-check
npm run lint
npm run test:run

# Manual validation checklist
cat .opencode/enforcement/VALIDATION_ENHANCED.md
```

**Workflow**:
1. Implement offline
2. Run local automated checks (TypeScript, ESLint, tests)
3. **When back online**: Run `scripts/validate-after-fallback.sh`
4. Fix ALL violations (STRICT + review FLEXIBLE)
5. **Optionally**: Re-implement with premium model for quality

**Recommendation**: Use offline for drafting only, validate online before committing.

---

## Escalation Workflow

When free/offline models struggle with pattern enforcement:

```
STRICT Rule Violation Detected
│
├─ Auto-fix attempted by current model
│  │
│  ├─ Fixed? → ✅ Continue
│  │
│  └─ Still failing after 2 attempts?
│     │
│     └─ ESCALATE to premium model
│        │
│        ├─ Switch to: opencode --preset groq_primary (if on Groq/Ollama)
│        │            opencode --preset claude (if budget allows)
│        │
│        └─ Premium model fixes violation
│           │
│           └─ Return to original model for remaining work
│
FLEXIBLE Rule Warning Detected
│
└─ Review during code review (no escalation needed)
```

**Example**:

```bash
# Scenario: Offline model creates design token violations

# Step 1: Detect violations
npm run lint
# Error: @dcyfr/no-hardcoded-values - found 5 violations

# Step 2: Attempt fix with offline model
opencode --preset offline_primary
# Prompt: "Fix the 5 design token violations detected by ESLint"

# Step 3: Re-check
npm run lint
# Error: Still 3 violations remaining

# Step 4: ESCALATE to premium model
opencode --preset groq_primary
# Prompt: "Fix remaining 3 design token violations"

# Step 5: Verify fix
npm run lint
# Success: All violations resolved

# Step 6: Return to offline model for other work
opencode --preset offline_primary
```

---

## Bypass Criteria

### When STRICT Rules Can Be Temporarily Bypassed

**Criteria** (ALL must be true):
1. Emergency production fix required
2. Violation is isolated to non-critical path
3. Fix is scheduled within 24 hours
4. Documented in commit message

**Process**:
```bash
# Add bypass comment to code
// BYPASS: Design token violation (emergency fix)
// TODO: Replace with COLORS.ERROR.text by 2026-01-06
<span className="text-red-500">Error</span>

# Commit with bypass flag
git commit -m "fix: emergency error display (BYPASS design tokens - fix scheduled)"

# Create follow-up issue
gh issue create --title "Fix design token bypass in error display" \
  --body "Emergency fix bypassed STRICT rule. Needs proper tokens by 2026-01-06."
```

**Review**: All bypasses reviewed in weekly architecture sync.

### When FLEXIBLE Rules Can Be Ignored

**Criteria** (ANY can be true):
1. Contextual exception (e.g., simple API doesn't need Inngest)
2. Temporary implementation (prototype, spike)
3. Performance optimization (validated with benchmarks)
4. Third-party integration constraints

**Process**:
```bash
# Add rationale comment to code
// FLEXIBLE EXCEPTION: Simple contact form doesn't need queue (low volume)
export async function POST(request: Request) {
  await sendEmail(data);
  return Response.json({ success: true });
}

# Document in PR description
# No special commit flag needed (warning only)
```

**Review**: Reviewed during standard PR process (not blocking).

---

## Related Documentation

**Pattern Enforcement**:
- [Design Token Enforcement](../../.github/agents/enforcement/DESIGN_TOKENS.md) - Token compliance details
- [Approval Gates](../../.github/agents/enforcement/APPROVAL_GATES.md) - Breaking changes process
- [Validation Checklist](../../.github/agents/enforcement/VALIDATION_CHECKLIST.md) - Pre-commit checks

**Provider-Specific**:
- [Provider Selection Guide](../patterns/PROVIDER_SELECTION.md) - When to use each provider
- [Offline Development](../patterns/OFFLINE_DEVELOPMENT.md) - Ollama workflow
- [Enhanced Validation](./VALIDATION_ENHANCED.md) - Free/offline model validation

**Quality Assurance**:
- [Quality Gates](./QUALITY_GATES.md) - Pre-completion checklists
- [Testing Patterns](../../.github/agents/patterns/TESTING_PATTERNS.md) - Test coverage strategy

**Scripts**:
- `scripts/validate-after-fallback.sh` - Enhanced validation script
- `npm run check:opencode` - Standard validation command

---

## FAQ

**Q: What happens if I commit with STRICT rule violations?**  
A: CI pipeline will fail. Pre-commit hooks run `scripts/validate-after-fallback.sh` which exits with code 1 on STRICT violations.

**Q: Can I disable STRICT enforcement for prototyping?**  
A: Yes, but only on feature branches. Use `git commit --no-verify` to skip hooks. MUST fix before merging to main.

**Q: Why are API patterns FLEXIBLE instead of STRICT?**  
A: Context matters. Simple endpoints may not need queuing. STRICT enforcement would create false positives.

**Q: How do I know if free model output needs manual review?**  
A: Always run `scripts/validate-after-fallback.sh` after using Groq/Ollama. Manual checklist appears if FLEXIBLE rules triggered.

**Q: Can FLEXIBLE rules become STRICT later?**  
A: Yes. As automation improves (better ESLint rules, scripts), we promote patterns from FLEXIBLE to STRICT.

---

**Status**: Production Ready  
**Maintenance**: Review quarterly (align with AGENTS.md sync)  
**Owner**: Architecture Team

# Enhanced Validation for GitHub Copilot Models

**Status**: Production Ready  
**Last Updated**: January 11, 2026  
**Version**: 2.0.0 (GitHub Copilot Migration)  
**Purpose**: Comprehensive validation checklists for GitHub Copilot implementations to compensate for lower pattern recognition

---

## Overview

GitHub Copilot models (GPT-5 Mini, Raptor Mini) have **70-85% pattern recognition accuracy** compared to Claude Sonnet's 95%. Enhanced validation bridges this gap through:

1. **Automated checks**: TypeScript, ESLint, tests (same for all providers)
2. **Manual review checklists**: Pattern-specific validation (unique to GitHub Copilot)
3. **Escalation triggers**: When to switch to premium model (Claude)

---

## Validation Workflow by Provider

### Premium Providers (Claude Sonnet)

**Accuracy**: 95%+ pattern adherence  
**Validation**: Standard automated checks only

```bash
# Run standard validation
npm run check

# Expected: All STRICT rules pass, FLEXIBLE rules reviewed in PR
```

**No manual checklist required** (high confidence in model output).

---

### GitHub Copilot (GPT-5 Mini, Raptor Mini, GPT-4o)

**Accuracy**: 70-85% pattern adherence  
**Validation**: Automated checks + **manual FLEXIBLE rule review**

```bash
# Run enhanced validation
npm run check:opencode

# Expected: 
# - STRICT rules: Hard block (exit 1) if violations
# - FLEXIBLE rules: Manual checklist printed to terminal
```

**Manual checklist required** for FLEXIBLE rules (API patterns, test coverage).

**Recommended Workflow**:
1. Draft with GitHub Copilot (fast, $0 additional cost)
2. Run `npm run check:opencode`
3. Review manual checklist
4. Escalate to Claude if >5 violations

---

## Manual Validation Checklists

### FLEXIBLE Rules Checklist (Required for GitHub Copilot)

Run this checklist **after GitHub Copilot implementation** to catch common pattern misses.

#### ✅ Design Token Compliance

**Automated Check**:
```bash
npm run lint | grep "@dcyfr/no-hardcoded-values"
# Expected: No violations
```

**Manual Review**:
- [ ] Search for hardcoded spacing: `rg "className=\".*(?:px-|py-|mx-|my-|gap-)" --type tsx`
- [ ] Search for hardcoded colors: `rg "className=\".*(?:bg-|text-|border-)(?!\\$)" --type tsx`
- [ ] Search for hardcoded typography: `rg "className=\".*(?:text-(?:xs|sm|base|lg|xl))" --type tsx`
- [ ] Verify token imports: `rg "from ['\"]@/design-system/tokens" --count` (should match file count)

**Common GitHub Copilot Mistakes**:
```tsx
// ❌ GitHub Copilot often generates:
<div className="px-8 py-4 text-gray-600">

// ✅ Should be:
<div className={`${SPACING.SECTION_X} ${SPACING.SECTION_Y} ${COLORS.TEXT.SECONDARY.text}`}>
```

**Fix Strategy**: Run ESLint autofix, then manual review:
```bash
npm run lint -- --fix
git diff  # Review changes before committing
```

---

#### ✅ PageLayout Usage (90% Rule)

**Automated Check**:
```bash
# Calculate compliance percentage
TOTAL_PAGES=$(rg "export default function.*Page" app/ --count-matches)
PAGELAYOUT_USAGE=$(rg "<PageLayout" app/ --count-matches)
COMPLIANCE=$(echo "scale=2; $PAGELAYOUT_USAGE / $TOTAL_PAGES * 100" | bc)

echo "PageLayout compliance: $COMPLIANCE% (target: ≥90%)"
```

**Manual Review**:
- [ ] List all pages: `rg "export default function.*Page" app/ --files-with-matches`
- [ ] Check each for `<PageLayout>` wrapper
- [ ] Verify exceptions are documented in `.github/agents/patterns/COMPONENT_PATTERNS.md`
- [ ] Confirm metadata props: `title`, `description`, `keywords`

**Common Offline Model Mistakes**:
```tsx
// ❌ Offline models often forget PageLayout:
export default function NewPage() {
  return <div className="container">...</div>;
}

// ✅ Should be:
export default function NewPage() {
  return (
    <PageLayout title="New Page" description="...">
      ...
    </PageLayout>
  );
}
```

**Fix Strategy**: Wrap page in `<PageLayout>`, add metadata props.

---

#### ✅ Barrel Export Imports

**Automated Check**:
```bash
npm run lint | grep "@dcyfr/no-deep-imports"
# Expected: No violations
```

**Manual Review**:
- [ ] Search for deep imports: `rg 'from ["\'"]@/(components|lib|utils)/[^"\']+/[^"\']+["\']' --type tsx`
- [ ] Verify barrel exports exist: Check for `index.ts` in each directory
- [ ] Confirm no circular dependencies: `npm run type-check`

**Common Offline Model Mistakes**:
```tsx
// ❌ Offline models use deep imports:
import { Button } from "@/components/ui/button/Button";
import { formatDate } from "@/lib/utils/date/formatDate";

// ✅ Should be:
import { Button } from "@/components/ui";
import { formatDate } from "@/lib/utils";
```

**Fix Strategy**: Update imports to use barrel exports:
```bash
# Find and replace pattern (manual review recommended)
rg 'from ["\'"]@/components/ui/[^/]+/[^"\']+["\']' -l | xargs sed -i '' 's|from "@/components/ui/[^/]*/\([^"]*\)"|from "@/components/ui"|g'
```

---

#### ✅ Test Data Prevention

**Automated Check**:
```bash
# Check for test data patterns in source code
rg "FABRICATED|TEST_DATA|MOCK_" --type ts --type tsx \
  --glob '!**/*.test.*' \
  --glob '!**/__tests__/**'

# Expected: No matches (test data only in test files)
```

**Manual Review**:
- [ ] Check scripts for environment guards: `rg "process.env.NODE_ENV.*production" scripts/`
- [ ] Verify no test data in Redis: `redis-cli KEYS "*test*" | wc -l` (expect 0 in production)
- [ ] Review `scripts/` for data population scripts with production blocks
- [ ] Check `.env.production` has no test data references

**Common Offline Model Mistakes**:
```ts
// ❌ Offline models forget environment checks:
async function seedData() {
  await redis.set("analytics:views", "1000");  // Runs in production!
}

// ✅ Should be:
async function seedData() {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    console.error("❌ Blocked in production");
    process.exit(1);
  }
  await redis.set("analytics:views", "1000");
}
```

**Fix Strategy**: Add environment guards to all data scripts:
```bash
# Prepend to all scripts in scripts/
for file in scripts/*.{ts,mjs,js}; do
  sed -i '1i\
if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {\
  console.error("❌ Test data script blocked in production");\
  process.exit(1);\
}' "$file"
done
```

---

#### ✅ Emoji Usage

**Automated Check**:
```bash
# Search for emoji unicode ranges
rg "[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}]" \
  --type tsx --type md --type ts \
  --glob '!**/*.test.*' \
  --glob '!**/private/**'

# Expected: No matches in public-facing content
```

**Manual Review**:
- [ ] Check UI components: `rg "[🎯🚀✨💡🔥]" src/components/`
- [ ] Check documentation: `rg "[🎯🚀✨💡🔥]" docs/ --glob '!**/private/**'`
- [ ] Check commit messages: `git log --oneline --all | grep -E "[🎯🚀✨💡🔥]"`
- [ ] Verify React icons used instead: `rg "from ['\"]lucide-react['\"]" --count`

**Common Offline Model Mistakes**:
```tsx
// ❌ Offline models use emojis:
<h1>Welcome! 🎉</h1>
<button>Deploy 🚀</button>

// ✅ Should be:
import { PartyPopper, Rocket } from "lucide-react";

<h1>Welcome! <PartyPopper className="inline h-6 w-6" /></h1>
<button>Deploy <Rocket className="inline h-4 w-4" /></button>
```

**Fix Strategy**: Replace emojis with Lucide icons:
```bash
# Generate replacement list
scripts/analyze-emoji-usage.mjs --suggest-replacements
# Follow suggestions to replace with React icons
```

---

### FLEXIBLE Rules Checklist (Required for Free + Offline Models)

#### ⚠️ API Pattern Adherence

**Automated Check**:
```bash
# Count POST routes using Inngest
TOTAL_POSTS=$(rg "export async function POST" app/api/ --count-matches)
INNGEST_USAGE=$(rg "inngest.send" app/api/ --count-matches)
RATIO=$(echo "scale=2; $INNGEST_USAGE / $TOTAL_POSTS * 100" | bc)

echo "Inngest usage: $RATIO% (target: ≥80%)"
```

**Manual Review**:
- [ ] List all POST routes: `rg "export async function POST" app/api/ --files-with-matches`
- [ ] For each route, check if it uses Inngest: `rg "inngest.send" <route-file>`
- [ ] If not using Inngest, verify it's a simple operation (low volume, synchronous)
- [ ] Document exceptions in code comments

**Common Free Model Mistakes**:
```ts
// ⚠️ Free models often skip Inngest:
export async function POST(request: Request) {
  const data = await request.json();
  await processData(data);  // Direct processing (may be acceptable)
  return Response.json({ success: true });
}

// ✅ Preferred (unless simple operation):
export async function POST(request: Request) {
  const data = await request.json();
  
  await inngest.send({
    name: "data/process.requested",
    data: { ...data }
  });
  
  return Response.json({ success: true });
}
```

**Decision Tree**:
- Simple operation (<100ms) + Low volume (<10 req/min)? → ✅ Direct processing OK
- Complex operation (>100ms) OR High volume (>10 req/min)? → ⚠️ Use Inngest
- Needs retry logic OR async processing? → ⚠️ **MUST** use Inngest

**Fix Strategy**: Evaluate each route individually during PR review (not blocking).

---

#### ⚠️ Test Coverage Quality

**Automated Check**:
```bash
npm run test:run -- --coverage --reporter=json > test-results.json

# Calculate pass rate
PASS_RATE=$(jq '.numPassedTests / (.numPassedTests + .numFailedTests) * 100' test-results.json)
echo "Test pass rate: $PASS_RATE% (target: ≥99%)"

# Calculate coverage
COVERAGE=$(jq '.coverageMap.total.statements.pct' test-results.json)
echo "Statement coverage: $COVERAGE% (informational)"
```

**Manual Review**:
- [ ] Review failed tests: `jq '.testResults[].assertionResults[] | select(.status == "failed")' test-results.json`
- [ ] Check for strategic skips: `rg "\.skip|\.todo" **/*.test.ts`
- [ ] Verify E2E coverage for critical paths: `ls tests/e2e/*.spec.ts`
- [ ] Confirm no placeholder tests: `rg "it\(.*TODO" **/*.test.ts`

**Common Free Model Mistakes**:
```ts
// ⚠️ Free models write minimal tests:
describe("NewFeature", () => {
  it("exists", () => {
    expect(NewFeature).toBeDefined();  // Placeholder test
  });
});

// ✅ Preferred:
describe("NewFeature", () => {
  it("renders with default props", () => {
    render(<NewFeature />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
  
  it("handles user interaction", async () => {
    const user = userEvent.setup();
    render(<NewFeature />);
    await user.click(screen.getByRole("button"));
    expect(mockCallback).toHaveBeenCalled();
  });
});
```

**Decision Tree**:
- Pass rate <99%? → ⚠️ Review failures (may be legitimate skips)
- No E2E tests for new feature? → ⚠️ Add integration tests
- Placeholder tests (`.toBeDefined()` only)? → ⚠️ Add meaningful assertions

**Fix Strategy**: Enhance tests incrementally (not blocking unless <90% pass rate).

---

## Escalation Triggers

When to switch from free/offline model to premium model:

### 🔴 IMMEDIATE ESCALATION (Switch Now)

Trigger when:
- [ ] **3+ STRICT rule violations** after auto-fix attempts
- [ ] **Security-sensitive changes** (auth, API keys, user data)
- [ ] **Breaking changes** requiring approval gates
- [ ] **Production incident** requiring emergency fix
- [ ] **Compliance failures** in pre-commit validation

**Action**:
```bash
# Save current state
npm run session:save opencode

# Switch to premium model
opencode --preset claude

# Restore state and continue
npm run session:restore opencode
```

---

### 🟡 RECOMMENDED ESCALATION (Consider Switching)

Trigger when:
- [ ] **2+ hours debugging** same issue
- [ ] **Complex refactoring** across multiple files
- [ ] **New architectural pattern** (no existing reference)
- [ ] **Performance optimization** requiring benchmarks
- [ ] **Third-party integration** with complex API

**Action**: Evaluate cost/benefit of switching to premium model.

---

### 🟢 NO ESCALATION NEEDED (Continue with Free/Offline)

Safe to continue when:
- [ ] **Simple bug fixes** with existing patterns
- [ ] **UI updates** following design system
- [ ] **Documentation updates** (no code changes)
- [ ] **Refactoring** within established patterns
- [ ] **Test additions** for existing features

**Action**: Continue with current model, run enhanced validation before committing.

---

## Validation Scripts

### `scripts/validate-after-fallback.sh`

**Purpose**: Run enhanced validation after using Groq/Ollama.

**Usage**:
```bash
# Standard validation
scripts/validate-after-fallback.sh

# Verbose mode (detailed output)
scripts/validate-after-fallback.sh --verbose

# Check specific rule category
scripts/validate-after-fallback.sh --strict-only  # STRICT rules only
scripts/validate-after-fallback.sh --flexible-only  # FLEXIBLE rules only
```

**Output**:
```
🔍 Enhanced Validation (Groq/Ollama)

STRICT RULES:
✅ Design tokens: 0 violations
✅ PageLayout usage: 95% (target: ≥90%)
✅ Barrel exports: 0 violations
✅ Test data prevention: 0 violations
✅ Emoji usage: 0 violations

FLEXIBLE RULES:
⚠️ API patterns: 75% Inngest usage (target: ≥80%)
   → Manual review required (see VALIDATION_ENHANCED.md)

⚠️ Test coverage: 97% pass rate (target: ≥99%)
   → Review failed tests (2 failures)

📋 MANUAL CHECKLIST:
- [ ] Review API routes without Inngest
- [ ] Investigate test failures (see test-results.json)

VALIDATION: ⚠️ WARNINGS (manual review required)
```

**Exit Codes**:
- `0`: All STRICT rules pass (warnings allowed)
- `1`: STRICT rule violations found (hard block)

---

### `npm run check:opencode`

**Purpose**: Standard validation command (wrapper for `validate-after-fallback.sh`).

**Usage**:
```bash
# Run all checks
npm run check:opencode

# Equivalent to:
npm run type-check && \
npm run lint && \
npm run test:run && \
scripts/validate-after-fallback.sh
```

**When to Use**:
- Before committing code
- After using Groq or Ollama
- Before pushing to remote
- In CI pipeline (pre-merge)

---

## Best Practices

### ✅ Do

- **Run enhanced validation** after every Groq/Ollama session
- **Review manual checklists** for FLEXIBLE rules
- **Save session state** before switching models
- **Document exceptions** in code comments
- **Escalate proactively** when stuck (don't waste 3+ hours)
- **Use offline for drafting** only (validate online before committing)

### ❌ Don't

- **Skip manual checklists** (free/offline models miss patterns)
- **Ignore FLEXIBLE warnings** (they compound over time)
- **Commit without validation** (CI will fail anyway)
- **Use offline for security work** (requires premium validation)
- **Assume free = same quality** (expect 80-90% accuracy)

---

## Related Documentation

**Enforcement**:
- [Hybrid Enforcement](./HYBRID_ENFORCEMENT.md) - STRICT vs. FLEXIBLE rule definitions
- [Quality Gates](./QUALITY_GATES.md) - Pre-completion checklists
- [Design Token Enforcement](../../.github/agents/enforcement/DESIGN_TOKENS.md) - Token compliance

**Patterns**:
- [Provider Selection](../patterns/PROVIDER_SELECTION.md) - When to use each provider
- [VS Code Integration](../patterns/VS_CODE_INTEGRATION.md) - Extension setup
- [Session Handoff](../workflows/SESSION_HANDOFF.md) - Model switching

**Scripts**:
- `scripts/validate-after-fallback.sh` - Enhanced validation
- `scripts/session-handoff.sh` - Model switching helper
- `scripts/check-provider-health.sh` - Provider status

---

**Status**: Production Ready  
**Maintenance**: Update checklists when new patterns added  
**Owner**: Quality Assurance Team

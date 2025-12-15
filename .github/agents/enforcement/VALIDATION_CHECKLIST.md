# Pre-Completion Validation Checklist

**File:** `.github/agents/enforcement/VALIDATION_CHECKLIST.md`  
**Last Updated:** December 9, 2025  
**Scope:** Automated validation gates, manual checks, completion criteria

---

## DCYFR Validation Checklist

Before marking a task complete, DCYFR validates against these gates:

## ✅ Automated Checks (Run Automatically)

### 1. TypeScript Compilation
```bash
npm run typecheck
```
**Validates:**
- ✅ No type errors (strict mode)
- ✅ All imports resolve
- ✅ No `any` types (unless necessary)

**Status:** ✅ **MUST PASS**

### 2. ESLint Compliance
```bash
npm run lint
```
**Validates:**
- ✅ No hardcoded Tailwind values (use design tokens)
- ✅ Barrel import usage
- ✅ Code style consistency
- ✅ No deprecated patterns

**Status:** ✅ **MUST PASS** (0 errors, warnings OK)

### 3. Unit Tests
```bash
npm run test
```
**Validates:**
- ✅ All existing tests pass
- ✅ New tests added for new code
- ✅ Pass rate ≥99% (1339/1346 tests)
- ✅ Affected tests updated

**Status:** ✅ **MUST PASS**

### 4. Design Token Compliance
```bash
npm run validate-design-tokens
```
**Validates:**
- ✅ All spacing uses SPACING tokens
- ✅ All typography uses TYPOGRAPHY tokens
- ✅ No hardcoded values in new code
- ✅ Compliance ≥90%

**Status:** ✅ **MUST PASS** for new code, ≥90% overall

### 5. E2E Tests (if applicable)
```bash
npm run test:e2e
```
**Validates:**
- ✅ Critical user flows still work
- ✅ No new WebKit timing issues
- ✅ Responsive design intact

**Status:** ✅ **MUST PASS** (or documented skip)

## 📋 Manual Validation (Human Review)

### 1. Code Review
**Checks:**
- ✅ Logic is clear and maintainable
- ✅ Comments explain why, not what
- ✅ No unnecessary complexity
- ✅ Follows project patterns

### 2. Design System Compliance
**Checks:**
- ✅ Uses PageLayout (unless justified)
- ✅ Uses barrel exports
- ✅ Follows naming conventions
- ✅ Design tokens applied correctly

### 3. Documentation
**Checks:**
- ✅ New components have JSDoc comments
- ✅ API routes documented
- ✅ Complex logic explained
- ✅ README updated (if needed)

### 4. Testing Completeness
**Checks:**
- ✅ Unit tests for logic
- ✅ Integration tests for flows
- ✅ Edge cases covered
- ✅ Error handling tested

## 🚀 Pre-Completion Validation Flow

### Stage 1: Automated Tests (Blocking)
```
✅ TypeScript compiles
✅ ESLint 0 errors
✅ Unit tests ≥99% pass
✅ Design tokens ≥90% compliance
✅ E2E tests pass (if applicable)
```

**If any fail:** DCYFR stops and reports issues.

### Stage 2: Code Review (Blocking)
```
✅ Logic reviewed
✅ Patterns followed
✅ No obvious bugs
✅ Performance acceptable
```

**If flagged:** DCYFR requests changes.

### Stage 3: Summary Report
```
✅ All validations passed
✅ Tests: 1339/1346 (99.48%)
✅ Design tokens: 92% compliance
✅ No TypeScript errors
✅ No ESLint errors
✅ Ready for deployment
```

---

## Common Validation Failures

### ❌ TypeScript Errors

**Example:**
```
error TS2322: Type 'string' is not assignable to type 'number'
  at src/components/PostCard.tsx:42
```

**Fix:**
```typescript
// Before
interface Props {
  count: number;
}
<PostCard count="5" />  // ❌ String, not number

// After
<PostCard count={5} />  // ✅ Correct type
```

### ❌ ESLint Errors

**Example:**
```
error: Hardcoded Tailwind value 'mt-8' found
  Use SPACING token instead
  at src/components/PostCard.tsx:15
```

**Fix:**
```typescript
// Before
<div className="mt-8">Content</div>

// After
import { SPACING } from "@/lib/design-tokens";
<div className={`mt-${SPACING.lg}`}>Content</div>
```

### ❌ Test Failures

**Example:**
```
● PostCard › renders with title

  Expected element not found: 'Post Title'
  at src/components/__tests__/post-card.test.tsx:42
```

**Fix:**
```typescript
// Update test or fix component
- expect(getByText('Post Title')).toBeInTheDocument();
+ expect(getByText('My Post Title')).toBeInTheDocument();
```

### ❌ Design Token Violations

**Example:**
```
⚠️ Hardcoded value 'text-gray-600' in src/components/Badge.tsx:12
  Use COLORS token instead
```

**Fix:**
```typescript
// Before
<span className="text-gray-600">Badge</span>

// After
import { COLORS } from "@/lib/design-tokens";
<span style={{ color: COLORS.text.secondary }}>Badge</span>
```

---

## Bypass Criteria (When to Skip)

### Skip Tests
✅ **Allowed for:**
- Static pages (no logic)
- Style-only changes
- Documentation updates

**Example:**
```typescript
// ✅ No test needed - just content
export default function About() {
  return <PageLayout><h1>About</h1></PageLayout>;
}
```

### Skip E2E Tests
✅ **Allowed for:**
- Non-critical pages
- Internal utility changes
- Known WebKit timing issues

**Document skip:**
```typescript
test.skip('webkit timeout issue', async ({ page }) => {
  // Known timing issue on webkit CI
  // Skipped until CI infrastructure upgrade
});
```

---

## Validation Commands Quick Ref

```bash
# All checks
npm run check

# Individual checks
npm run typecheck        # TypeScript
npm run lint            # ESLint
npm run test            # Unit tests
npm run test:e2e        # E2E tests
npm run validate-design-tokens  # Design tokens
```

---

## Pre-Deployment Checklist

Before DCYFR marks work complete:

- [ ] All automated tests pass
- [ ] No TypeScript errors
- [ ] No ESLint errors (0 errors)
- [ ] Unit test pass rate ≥99%
- [ ] Design token compliance ≥90%
- [ ] Breaking changes approved (if any)
- [ ] Architecture decisions approved (if any)
- [ ] Security changes approved (if any)
- [ ] Documentation updated
- [ ] Meaningful commit message
- [ ] Ready for PR review

---

## DCYFR Validation Report Example

```
✅ VALIDATION COMPLETE

Task: Create /bookmarks page
Status: ✅ Ready for merge

Automated Checks:
  ✅ TypeScript: 0 errors
  ✅ ESLint: 0 errors
  ✅ Unit tests: 1339/1346 (99.48%)
  ✅ Design tokens: 92% compliance
  ✅ E2E tests: All passed

Code Quality:
  ✅ Barrel exports used
  ✅ PageLayout pattern followed
  ✅ Design tokens applied
  ✅ Tests cover logic
  ✅ Error handling present

Changes:
  - Created src/app/bookmarks/page.tsx
  - Created src/components/bookmark-list.tsx
  - Added 12 unit tests
  - Updated navigation

Recommendations:
  - Consider caching bookmark list for performance
  - Monitor page load time in production

Ready for: PR review → Merge → Deploy
```

---

## Related Documentation

- **Approval Gates:** `.github/agents/enforcement/APPROVAL_GATES.md`
- **Design Tokens:** `.github/agents/enforcement/DESIGN_TOKENS.md`
- **Testing Patterns:** `.github/agents/patterns/TESTING_PATTERNS.md`
- **Quick Reference:** `docs/ai/QUICK_REFERENCE.md`

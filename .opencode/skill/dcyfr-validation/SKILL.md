---
name: dcyfr-validation
description: Pre-completion validation checklists and approval gates
license: MIT
compatibility: opencode
metadata:
  audience: developers
  workflow: quality-assurance
  category: validation
---

## What I do

I ensure code meets quality gates before completion:

- **Pre-completion checklist** validation
- **Approval gates** for breaking changes
- **Common failure patterns** and fixes
- **Escalation triggers** for manual review

## When to use me

✅ **Use this skill when:**
- Before marking work as complete
- Before creating pull requests
- Fixing validation failures
- Determining if manual review needed

❌ **Don't use this skill for:**
- Initial development (use during finalization)
- Exploratory work (validation comes later)

## Pre-Completion Checklist

### Standard Checklist (All Providers)

```bash
# 1. TypeScript compiles
npm run typecheck

# 2. ESLint passes
npm run lint

# 3. Tests pass (≥99% rate)
npm run test:run

# 4. Design tokens ≥90% compliance
npm run lint | grep "design-tokens"
```

### Enhanced Checklist (OpenCode/GitHub Copilot)

Additional manual review required:

```bash
# 5. OpenCode-specific validation
npm run check:opencode

# Manual checks:
- [ ] Design tokens used (no hardcoded gap-8, text-3xl)
- [ ] Barrel imports used (no direct file imports)
- [ ] PageLayout used (unless ArticleLayout/ArchiveLayout justified)
- [ ] Test data has environment checks
- [ ] No emojis in public content
```

## Approval Gates

### When Manual Approval Required

1. **Breaking changes** - API contracts, database schemas, public APIs
2. **Architecture decisions** - New patterns, major refactors
3. **Security-sensitive** - Auth, API keys, data access
4. **Performance impact** - Database queries, bundle size
5. **External dependencies** - New npm packages, third-party APIs

### Approval Process

```
1. Create GitHub issue documenting change
2. Tag relevant reviewers (@architecture-team, @security-team)
3. Wait for approval before proceeding
4. Reference issue in PR description
```

## Common Failure Patterns

### TypeScript Errors

```bash
# Error: Type 'string | undefined' is not assignable to type 'string'
# Fix: Add type guard
if (!value) return null;
const safeValue: string = value;
```

### ESLint Errors

```bash
# Error: @dcyfr/design-tokens/no-hardcoded-spacing
# Fix: Replace with design token
- className="gap-8"
+ className={`gap-${SPACING.content}`}
```

### Test Failures

```bash
# Error: Test suite failing
# Fix: Update test expectations or fix implementation
npm run test:run -- --reporter=verbose
```

## Escalation Triggers

Escalate to manual review if:

- ❌ Cannot fix validation errors
- ❌ Unsure if breaking change
- ❌ Security implications unclear
- ❌ Performance impact unknown

## Validation Commands

```bash
# Full validation suite
npm run check

# OpenCode-enhanced validation
npm run check:opencode

# Auto-fix what's possible
npm run lint -- --fix

# Verify all tests pass
npm run test:run
```

## Related Documentation

- **Validation checklist**: `.github/agents/enforcement/VALIDATION_CHECKLIST.md`
- **Approval gates**: `.github/agents/enforcement/APPROVAL_GATES.md`
- **Enhanced validation**: `.opencode/enforcement/VALIDATION_ENHANCED.md`

## Approval Gates

Validation compliance is **STRICT** (hard block):

- ❌ Cannot merge with validation failures
- ❌ Cannot skip approval gates
- ✅ Must pass all quality checks

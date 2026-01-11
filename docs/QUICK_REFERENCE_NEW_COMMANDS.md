# Quick Command Reference - Design Token Enforcement

**Added December 28, 2025 - Phase 1 Complete**

## Available Commands

### Design Token Validation

```bash
# Find all design token violations in codebase
npm run find:token-violations

# Check compliance status (exit 0 if compliant)
npm run validate:tokens

# Auto-fix violations (Phase 2 - not yet implemented)
npm run fix:tokens
```

### Test Data Detection

```bash
# Check for fabricated/test data in production code
npm run lint:test-data
```

### Existing Commands (Enhanced)

```bash
# Lint with new barrel export enforcement rules
npm run lint

# Type checking with stricter settings
npm run typecheck

# Full validation suite
npm run check
```

---

## Sample Output

### Find Token Violations
```bash
$ npm run find:token-violations
📄 components/blog/post-card.tsx
   L45:12 [Spacing violations] className="mb-4 text-lg gap-2"
   L67:8 [Typography violations] className="text-xl font-semibold"

📊 Summary: 1657 violations found in 217 files

💡 To fix violations, replace hardcoded values with design tokens:
   import { SPACING, TYPOGRAPHY } from "@/lib/design-tokens";
```

### Check Test Data
```bash
$ npm run lint:test-data
🚨 Checking for test data in production...

✅ No test data patterns detected in production code!
```

### Lint with New Rules
```bash
$ npm run lint
src/components/blog/post-card.tsx:45:12: error: Hardcoded 'mb-4'...
src/components/auth/index.ts:12:3: error: Don't import from explicit index...

❌ 2 errors found
```

---

## Common Issues & Solutions

### Issue: "find:token-violations not found"
**Solution:** Run `npm install` to update scripts from package.json

### Issue: "Check test data returned CRITICAL"
**Solution:** Ensure all demo data is environment-guarded:
```typescript
// ✅ CORRECT
if (process.env.NODE_ENV === 'production') {
  return null;  // Don't use test data in production
}
return mockData;
```

### Issue: Pre-commit hooks not running
**Solution:** Make sure git hooks are configured:
```bash
git config core.hooksPath .githooks
```

---

## Integration with Workflows

### Pre-Commit (Automatic)
Every git commit now runs:
1. Documentation governance check
2. Design token compliance check
3. Test data detection check

### CI/CD Pipeline
Recommended additions (coming in Phase 2):
- Fail on new token violations
- Report compliance metrics
- Enforce barrel export rules

### Development Workflow
Run before committing:
```bash
npm run check                  # Type + lint check
npm run validate:tokens        # Design token compliance
npm run lint:test-data         # Test data check
npm run test:run               # Unit tests
```

---

## Documentation

- **Full Strategy:** [docs/DESIGN_TOKEN_REMEDIATION_PLAN.md](docs/DESIGN_TOKEN_REMEDIATION_PLAN.md)
- **Technical Details:** [PHASE_1_COMPLETION_SUMMARY.md](PHASE_1_COMPLETION_SUMMARY.md)
- **Design Token Reference:** [docs/ai/design-system.md](docs/ai/design-system.md)
- **Enforcement Rules:** [.github/agents/enforcement/DESIGN_TOKENS.md](.github/agents/enforcement/DESIGN_TOKENS.md)

---

## Quick Links

- **Review violations:** `npm run find:token-violations`
- **Check test data:** `npm run lint:test-data`  
- **Full validation:** `npm run check`
- **Read strategy:** `docs/DESIGN_TOKEN_REMEDIATION_PLAN.md`

---

**Phase Status:** ✅ Phase 1 Complete  
**Next:** Await decision on remediation strategy (A, B, C, or D)

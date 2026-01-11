# Technical Implementation Guide: Fixing Alignment Issues

**Companion to:** [INSTRUCTION_ALIGNMENT_ANALYSIS.md](./INSTRUCTION_ALIGNMENT_ANALYSIS.md)  
**Purpose:** Exact code changes needed to fix discrepancies  
**Status:** Ready to implement  

---

## Quick Links

- [ESLint Config Fixes](#eslint-config-fixes)
- [TypeScript Config Fixes](#typescript-config-fixes)
- [Code Refactoring Changes](#code-refactoring-changes)
- [Pre-commit Hook Updates](#pre-commit-hook-updates)
- [Test Updates](#test-updates)

---

## ESLint Config Fixes

### FIX 1: Change "warn" to "error" for Design Tokens

**File:** `eslint.config.mjs`

**Current State (Lines 20-100):**
```javascript
{
  // Design System Enforcement Rules
  files: ["src/**/*.{ts,tsx,js,jsx}"],
  rules: {
    // ERROR on hardcoded design patterns - must use design tokens
    "no-restricted-syntax": [
      "error",  // ✅ Already error! Good
      { ... }
    ],
  },
}
```

**Status:** ✅ Already set to "error" - NO CHANGE NEEDED

**Issue:** Rule is set correctly but violations still exist in codebase. Need to fix actual violations (see [Code Refactoring](#code-refactoring-changes))

---

### FIX 2: Add Barrel Export Enforcement

**File:** `eslint.config.mjs`

**Add after line 100 (after design tokens rules):**

```javascript
{
  // Barrel Export Enforcement
  // Prevents direct imports from component directories
  files: ["src/**/*.{ts,tsx}"],
  rules: {
    "@typescript-eslint/no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            // Block: import X from '@/components/button/index'
            group: ["@/components/*/index.ts"],
            importNames: ["*"],
            message: "Use barrel export: import { X } from '@/components/button' (without /index)"
          },
          {
            // Block: import X from '@/components/button/button.tsx'
            group: ["@/components/**/*.tsx"],
            importNames: ["*"],
            message: "Use barrel export: import { X } from '@/components/button' instead of direct file import"
          },
          {
            // Same for lib utilities
            group: ["@/lib/*/index.ts"],
            importNames: ["*"],
            message: "Use barrel export: import { X } from '@/lib/utils' (without /index)"
          },
          {
            group: ["@/lib/**/*.ts", "@/lib/**/*.tsx"],
            importNames: ["*"],
            message: "Use barrel export: import { X } from '@/lib/utilities' instead of direct file import"
          }
        ]
      }
    ]
  }
}
```

**Test:** After adding this rule, try to import directly and verify it errors:
```bash
npm run lint src/  # Should show "Use barrel export" errors
```

---

### FIX 3: Add Emoji Prevention in MDX Files

**File:** `eslint.config.mjs`

**Add before the export statement:**

```javascript
{
  // Emoji Prevention in Public Content
  files: ["src/content/**/*.mdx", "src/content/**/*.md"],
  rules: {
    // Detect emoji in public content
    "no-restricted-syntax": [
      "warn",  // Start with warn, escalate to error after cleanup
      {
        selector: "Literal[value=/[😀-🙏🌀-🗿🚀-🛿]/]",
        message: "Emoji detected in public content. Use React icons from lucide-react instead. See DCYFR.agent.md rule #7 (Never Use Emojis in Public Content)"
      }
    ]
  }
}
```

**Test:** 
```bash
npm run lint src/content/  # Should warn about emoji
```

---

### FIX 4: Add Test Data Detection Rule

**File:** `eslint.config.mjs`

**Add:**

```javascript
{
  // Test Data Prevention
  files: ["src/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-syntax": [
      "warn",  // Warn in dev, review before merging
      {
        selector: "ObjectExpression[properties.0.key.name='stars'][properties.0.value.value=/^(0|1|5|10|15|100)$/]",
        message: "Suspicious hardcoded analytics value. Verify this isn't test/demo data. Production should fetch real data. See TEST_DATA_PREVENTION.md"
      },
      {
        selector: "ObjectExpression[properties.0.key.name='forks'][properties.0.value.value=0]",
        message: "Suspicious zero value for 'forks'. This may be test data. Verify with real GitHub data. See TEST_DATA_PREVENTION.md"
      },
      {
        selector: "Literal[value='test-data']",
        message: "Test data detected. Ensure this doesn't reach production. See TEST_DATA_PREVENTION.md"
      }
    ]
  }
}
```

---

### FIX 5: Add Accessibility Rules

**File:** `eslint.config.mjs`

**First, update package.json to include ESLint a11y plugin:**
```bash
npm install --save-dev eslint-plugin-jsx-a11y
```

**Then in eslint.config.mjs, add at top:**
```javascript
import jsxA11y from 'eslint-plugin-jsx-a11y';

// Then in the config array:
jsxA11y.flatConfigs.recommended,
{
  files: ["src/**/*.{ts,tsx}"],
  rules: {
    // Enforce accessibility requirements
    'jsx-a11y/alt-text': 'error',                          // Images need alt text
    'jsx-a11y/click-events-have-key-events': 'error',      // Click handlers need keyboard
    'jsx-a11y/role-has-required-aria-props': 'error',      // ARIA attributes required
    'jsx-a11y/no-static-element-interactions': 'warn',     // Warn on interactive divs
    'jsx-a11y/img-redundant-alt': 'error',                 // No "image" in alt text
  }
}
```

---

## TypeScript Config Fixes

### FIX 6: Update tsconfig.json Strictness

**File:** `tsconfig.json`

**Current (Lines 1-20):**
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "baseUrl": ".",
    "allowJs": true,              // ❌ REMOVE: Only TypeScript
    "skipLibCheck": true,         // ❌ CHANGE: false
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
```

**Change To:**
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "baseUrl": ".",
    "allowJs": false,             // ✅ Only TypeScript files
    "skipLibCheck": false,        // ✅ Check external types (industry standard)
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    // Add strict mode flags explicitly
    "noUnusedLocals": true,              // ✅ NEW: Error on unused variables
    "noUnusedParameters": true,          // ✅ NEW: Error on unused parameters
    "noFallthroughCasesInSwitch": true,  // ✅ NEW: Error on missing switch cases
    "noImplicitReturns": true,           // ✅ Already in "strict"
    "noImplicitAny": true,               // ✅ Already in "strict"
    "strictNullChecks": true,            // ✅ Already in "strict"
    "strictFunctionTypes": true,         // ✅ Already in "strict"
    "strictBindCallApply": true,         // ✅ Already in "strict"
    "strictPropertyInitialization": true, // ✅ Already in "strict"
    "noImplicitThis": true,              // ✅ Already in "strict"
```

**Migration Path (if refactoring is needed):**

1. **Run in dry-run mode first:**
```bash
tsc --noUnusedLocals --noUnusedParameters --noEmit  # Check impact
```

2. **Fix violations:**
```bash
# Refactor unused variables
# Remove unused parameters
# Add return statements to conditional functions
```

3. **Commit changes separately:**
```bash
git commit -m "refactor: remove unused variables and parameters"
git commit -m "refactor: improve TypeScript strict mode compliance"
```

4. **Update tsconfig.json:**
```bash
git commit -m "config: enable strict mode checks in tsconfig.json"
```

---

## Code Refactoring Changes

### FIX 7: Fix Design Token Violations in Company Resume Components

**File:** `src/components/company-resume/technical-capabilities.tsx`

**Current (Lines 10-25):**
```tsx
return (
  <section className={`${CONTAINER_PADDING}`}>
    <div className="text-center mb-12">              // ❌ Hardcoded
      <h2 className={TYPOGRAPHY.h2.standard}>
        Technical Capabilities
      </h2>
    </div>
    
    <div className="grid md:grid-cols-3 gap-4">      // ❌ Hardcoded
      {capabilities.map((cap, idx) => (
        <Card key={idx} className="p-4">              // ❌ Hardcoded
          <div className="flex items-center gap-3">  // ❌ Hardcoded
```

**Change To:**
```tsx
import { SPACING } from '@/lib/design-tokens';

return (
  <section className={`${CONTAINER_PADDING}`}>
    <div className={`text-center mb-${SPACING.xl}`}>  // ✅ Design token
      <h2 className={TYPOGRAPHY.h2.standard}>
        Technical Capabilities
      </h2>
    </div>
    
    <div className={`grid md:grid-cols-3 gap-${SPACING.sm}`}>  // ✅ Design token
      {capabilities.map((cap, idx) => (
        <Card key={idx} className={`p-${SPACING.content}`}>    // ✅ Design token
          <div className={`flex items-center gap-${SPACING.sm}`}> // ✅ Design token
```

**Pattern to apply everywhere:**
```
❌ "text-center" → "text-center" (structural, keep)
❌ "mb-12" → className={`mb-${SPACING.xl}`}
❌ "gap-4" → className={`gap-${SPACING.sm}`}
❌ "p-4" → className={`p-${SPACING.sm}`}
❌ "gap-3" → className={`gap-${SPACING.xs}`}
```

### Script to Find Violations

**Create:** `scripts/find-token-violations.mjs`

```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Patterns that should use design tokens
const patterns = [
  { regex: /mb-(\d+)/g, token: 'SPACING' },
  { regex: /mt-(\d+)/g, token: 'SPACING' },
  { regex: /gap-(\d+)/g, token: 'SPACING' },
  { regex: /p-(\d+)/g, token: 'SPACING' },
  { regex: /px-(\d+)/g, token: 'SPACING' },
  { regex: /py-(\d+)/g, token: 'SPACING' },
  { regex: /text-\d+xl/g, token: 'TYPOGRAPHY' },
];

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.')) {
      scanDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      patterns.forEach(({ regex, token }) => {
        let match;
        while ((match = regex.exec(content)) !== null) {
          console.log(`${fullPath}: ${match[0]} (use ${token})`);
        }
      });
    }
  });
}

scanDir(path.join(__dirname, '../src'));
```

**Run:**
```bash
node scripts/find-token-violations.mjs
```

---

## Pre-commit Hook Updates

### FIX 8: Add Pre-commit Validation

**File:** `.husky/pre-commit` (if exists) or create new

```bash
#!/bin/sh

echo "🔍 Running pre-commit validation..."

# 1. ESLint check (errors must pass)
echo "📝 Checking ESLint..."
npx eslint src/ --max-warnings 0
if [ $? -ne 0 ]; then
  echo "❌ ESLint errors found"
  exit 1
fi

# 2. TypeScript check
echo "📊 Checking TypeScript..."
npx tsc -p tsconfig.json --noEmit
if [ $? -ne 0 ]; then
  echo "❌ TypeScript errors found"
  exit 1
fi

# 3. Test data prevention check
echo "🚨 Checking for test data in production..."
npx node scripts/check-test-data.mjs
if [ $? -ne 0 ]; then
  echo "❌ Test data detected"
  exit 1
fi

# 4. Design token check
echo "🎨 Checking design token compliance..."
npx node scripts/find-token-violations.mjs
VIOLATION_COUNT=$(npx node scripts/find-token-violations.mjs | wc -l)
if [ $VIOLATION_COUNT -gt 0 ]; then
  echo "⚠️  Warning: $VIOLATION_COUNT design token violations found"
  # Currently a warning; escalate to error after cleanup
fi

echo "✅ Pre-commit checks passed"
exit 0
```

**Make executable:**
```bash
chmod +x .husky/pre-commit
```

---

### FIX 9: Create Test Data Checker Script

**File:** `scripts/check-test-data.mjs`

```javascript
import fs from 'fs';
import path from 'path';

const dangerousPatterns = [
  { pattern: /\btest\s*[=:]\s*true/i, file: /src\/.*\.(ts|tsx)$/ },
  { pattern: /\bdummy\s*data\b/i, file: /src\/lib\/.*\.(ts|tsx)$/ },
  { pattern: /fake.*analytics/i, file: /src\/.*\.(ts|tsx)$/ },
];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const hasEnvironmentGuard = /if\s*\(\s*process\.env\.(NODE_ENV|VERCEL_ENV).*production/i.test(content);
  
  if (!hasEnvironmentGuard && content.includes('test')) {
    console.warn(`⚠️  ${filePath}: Contains "test" without environment guard`);
    return false;
  }
  
  return true;
}

const srcDir = './src';
const files = fs.readdirSync(srcDir, { recursive: true });
let violations = 0;

files.forEach(file => {
  if (file.endsWith('.ts') || file.endsWith('.tsx')) {
    if (!checkFile(path.join(srcDir, file))) {
      violations++;
    }
  }
});

if (violations > 0) {
  console.error(`❌ Found ${violations} test data violations`);
  process.exit(1);
}

console.log('✅ No test data issues detected');
process.exit(0);
```

---

## Test Updates

### FIX 10: Update Stale Test Metrics

**File:** Update in `CLAUDE.md`, `package.json`, README

**Current:**
```markdown
**Status:** Production ready (1659/1717 tests passing, 96.6%)
```

**Change To:**
```markdown
**Status:** Production ready (2267/2297 tests passing, 98.7%)
**Last Updated:** [Auto-synced from CI on {date}]
```

**Create automation:** `scripts/update-metrics.mjs`

```javascript
import { execSync } from 'child_process';
import fs from 'fs';

// Run tests and capture metrics
const output = execSync('npm run test:run -- --reporter=verbose 2>&1', { encoding: 'utf8' });

// Parse results
const match = output.match(/Tests\s+(\d+)\s+failed\s+\|\s+(\d+)\s+passed/);
if (!match) {
  console.error('Could not parse test results');
  process.exit(1);
}

const [, failed, passed] = match;
const total = parseInt(failed) + parseInt(passed);
const passRate = ((parseInt(passed) / total) * 100).toFixed(1);

console.log(`✅ ${passed}/${total} tests passing (${passRate}%)`);

// Update README and docs
const date = new Date().toISOString().split('T')[0];
const claudeContent = fs.readFileSync('CLAUDE.md', 'utf8')
  .replace(
    /\*\*Status:\*\*.*\n/,
    `**Status:** Production ready (${passed}/${total} tests passing, ${passRate}%)\n`
  )
  .replace(
    /\*\*Last Updated:\*\*.*\n/,
    `**Last Updated:** ${date}\n`
  );

fs.writeFileSync('CLAUDE.md', claudeContent);
console.log('✅ Updated CLAUDE.md with current metrics');
```

**Add to package.json:**
```json
{
  "metrics:update": "node scripts/update-metrics.mjs"
}
```

**Run after tests pass:**
```bash
npm run test:run && npm run metrics:update
```

---

## Verification Checklist

After implementing all fixes:

```bash
# ✅ 1. ESLint passes with no warnings
npm run lint -- --max-warnings 0

# ✅ 2. TypeScript compiles
npm run typecheck

# ✅ 3. Tests pass
npm run test:run

# ✅ 4. No design token violations
node scripts/find-token-violations.mjs | wc -l  # Should be 0

# ✅ 5. No test data violations
node scripts/check-test-data.mjs

# ✅ 6. Pre-commit hooks work
git add .
npm run pre-commit  # Or: .husky/pre-commit

# ✅ 7. All instructions match config
grep -r "design tokens" docs/ | grep -i "must\|mandatory\|error"
grep -r "strict mode" CLAUDE.md | head -1
```

---

## Timeline

**Phase 1 (Day 1): Configuration** - 30 minutes
- Update tsconfig.json
- Update eslint.config.mjs

**Phase 2 (Day 2-3): Code Refactoring** - 4-6 hours
- Fix 40+ design token violations
- Verify all tests pass

**Phase 3 (Day 4): Automation** - 2-3 hours
- Create and test check scripts
- Set up pre-commit hooks
- Verify hooks work

**Phase 4 (Day 5): Documentation** - 1 hour
- Update metrics in CLAUDE.md
- Update copilot-instructions.md
- Create implementation summary

---

## Rollback Plan

If issues arise during implementation:

```bash
# Rollback ESLint changes
git checkout eslint.config.mjs

# Rollback TypeScript changes
git checkout tsconfig.json

# Rollback code changes
git reset HEAD~N
git checkout src/

# Remove pre-commit hooks
rm .husky/pre-commit
```

---

## Success Criteria

✅ **Implementation complete when:**

1. `npm run lint -- --max-warnings 0` passes
2. `npm run typecheck` shows 0 errors
3. `npm run test:run` shows ≥99% pass rate
4. `node scripts/find-token-violations.mjs` returns 0 violations
5. All metrics in docs are current (within 1 day)
6. Pre-commit hooks prevent violations
7. All instructions match actual configuration

---

**Status:** Ready for implementation  
**Owner:** Development team  
**Next:** Create tracking issue for each section above  


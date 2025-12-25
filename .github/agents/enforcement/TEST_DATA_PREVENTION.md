# Test Data Prevention & Best Practices

**File:** `.github/agents/enforcement/TEST_DATA_PREVENTION.md`  
**Last Updated:** December 25, 2025  
**Scope:** Preventing test/fabricated data in production, environment-aware code patterns

---

## 🚨 Core Rule: Test Data ≠ Production Data

**NON-NEGOTIABLE RULE:** Test data, sample data, or fabricated data must **NEVER** reach production.

**What This Means:**
- ❌ Mock data should never execute in production
- ❌ Sample datasets must be behind strict environment checks
- ❌ Fallback demo data requires warnings in production
- ✅ Real data sources are always preferred
- ✅ Graceful degradation (empty state) is better than fabricated data

---

## Best Practice 1: Environment-Aware Code

### Problem Example

```typescript
// ❌ BAD: No environment check, runs everywhere
function getGitHubData() {
  // If real API fails, silently use fabricated data
  return {
    stars: 15,        // Actual: 1
    forks: 0,         // Actual: 0
    views: 1150,      // Actual: Not available from public API
    clones: 67,       // Actual: Not available from public API
  };
}

// Usage runs in production undetected
const data = getGitHubData(); // Returns fake data silently
```

### Solution: Environment Check + Warning

```typescript
// ✅ GOOD: Explicit environment detection with warnings
function getGitHubData() {
  const isProduction = process.env.NODE_ENV === 'production' 
    || process.env.VERCEL_ENV === 'production';

  if (isProduction) {
    console.error(
      '❌ CRITICAL: Showing demo data in production. ' +
      'Real GitHub API data unavailable. ' +
      'Implement: https://docs.github.com/en/rest/repos/traffic#get-repository-clones'
    );
    // Return empty or real data only
    return null;
  }

  // Safe to return demo data in development
  return {
    stars: 15,
    forks: 0,
    views: 1150,
    clones: 67,
  };
}
```

**Key Points:**
- ✅ Check **both** NODE_ENV and VERCEL_ENV (Vercel may override)
- ✅ Log CRITICAL level errors when using demo data in production
- ✅ Explain what data is being used and why
- ✅ Provide guidance for real data implementation

---

## Best Practice 2: Blocking Scripts in Production

### Problem Example

```bash
#!/usr/bin/env node
// ❌ BAD: populate-test-data.mjs
// No environment check - can run in production!

const redis = new Redis(process.env.REDIS_URL);
redis.set('test:key', fabricatedData);
console.log('✅ Test data populated');
```

### Solution: Production Guard Clause

```bash
#!/usr/bin/env node
// ✅ GOOD: populate-test-data.mjs
// Production environment check at entry

const nodeEnv = process.env.NODE_ENV || 'development';
const vercelEnv = process.env.VERCEL_ENV;
const isProduction = nodeEnv === 'production' || vercelEnv === 'production';

if (isProduction) {
  console.error('❌ BLOCKED: This script is for development/testing only!');
  console.error('Production environment detected: NODE_ENV=' + nodeEnv + ', VERCEL_ENV=' + vercelEnv);
  console.error('');
  console.error('To implement real data:');
  console.error('1. Set up API credentials for each data source');
  console.error('2. Create production-safe data fetching functions');
  console.error('3. Store credentials in Vercel Environment Variables');
  process.exit(1);
}

// Safe to proceed in development
const redis = new Redis(process.env.REDIS_URL);
redis.set('test:key', fabricatedData);
console.log('✅ Test data populated (DEV MODE)');
```

**Key Points:**
- ✅ Check at **script entry point** before any operations
- ✅ Exit with code 1 (standard error exit)
- ✅ Provide clear guidance for real implementation
- ✅ Log both NODE_ENV and VERCEL_ENV for debugging

---

## Best Practice 3: Enforcement in Code Review

### Pre-Commit Validation

Add to `.husky/pre-commit` or CI/CD:

```bash
#!/bin/bash
# Detect fabricated data in staged changes

echo "🔍 Checking for test data in production code..."

# Flag any populate scripts being committed
if git diff --cached --name-only | grep -qE 'populate|seed|fixture'; then
  if git diff --cached | grep -qE 'fabricated|sample|demo|hardcoded'; then
    echo "⚠️  WARNING: Test data script detected in staging"
    echo "Run 'npm run analytics:clear' after development if needed"
  fi
fi

# Check for hardcoded test values
if git diff --cached | grep -qE '(stars:\s*15|clones:\s*67)'; then
  echo "❌ ERROR: Fabricated test data found in staged changes!"
  echo "Remove hardcoded test values before committing"
  exit 1
fi

exit 0
```

### CI/CD Validation

```yaml
# .github/workflows/test-data-check.yml
name: Test Data Prevention
on: [pull_request, push]

jobs:
  check-test-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Check for fabricated data in code
        run: |
          # Fail if any hardcoded test metrics found
          ! grep -r "stars.*:.*1[0-9]" src/ --include="*.ts" --include="*.tsx"
          ! grep -r "clones.*:.*[0-9][0-9]" src/ --include="*.ts" --include="*.tsx"
          ! grep -r "fabricated\|sample data\|demo" src/ --include="*.ts" --include="*.tsx"
```

---

## Best Practice 4: Data Cleanup Utilities

### Mandatory Cleanup Script

Every test data source should have a cleanup script:

```typescript
// ✅ GOOD: scripts/clear-test-data.mjs
#!/usr/bin/env node

import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.error('❌ REDIS_URL not set');
  process.exit(1);
}

const redis = createClient({ url: redisUrl });

const testKeys = [
  'analytics:milestones',
  'github:traffic:milestones',
  'google:analytics:milestones',
  'search:console:milestones',
];

async function cleanupTestData() {
  await redis.connect();
  
  for (const key of testKeys) {
    const deleted = await redis.del(key);
    if (deleted > 0) {
      console.log(`✅ ${key}: ${deleted} items deleted`);
    }
  }
  
  await redis.disconnect();
  console.log('\n✅ Test data cleanup complete');
}

cleanupTestData().catch(err => {
  console.error('❌ Cleanup failed:', err.message);
  process.exit(1);
});
```

### Add to package.json

```json
{
  "scripts": {
    "analytics:populate": "node scripts/populate-analytics-milestones.mjs",
    "analytics:clear": "node scripts/clear-test-data.mjs"
  }
}
```

---

## Best Practice 5: Documentation & Visibility

### Required Documentation

Every test data source needs:

1. **What is it?** - Purpose and scope
2. **Where is it?** - Files and Redis keys
3. **When is it used?** - Dev/test scenarios only
4. **How is it protected?** - Environment checks, warnings
5. **How to clean it?** - Clear data if leaked
6. **What's real?** - Compare to actual metrics

**Template:**

```markdown
## Test Data: [Name]

### Location
- Script: `scripts/populate-[feature].mjs`
- Redis Keys: `[namespace]:[*]`

### Protection
Environment check: ✅ YES / ❌ NO
Production warning: ✅ YES / ❌ NO

### Cleanup
\`\`\`bash
npm run [feature]:clear
\`\`\`

### Actual vs Sample
| Metric | Sample | Actual | Fabricated? |
```

**Reference:** See [TEST_DATA_USAGE.md](../../docs/features/TEST_DATA_USAGE.md)

---

## Best Practice 6: Deployment Safety Checklist

### Before Every Production Deployment

```bash
#!/bin/bash
# Pre-deployment validation

echo "🔍 Pre-deployment test data check..."

# 1. Verify populate script blocks in production
echo "Testing production guard..."
NODE_ENV=production timeout 2 node scripts/populate-analytics-milestones.mjs && {
  echo "❌ FAILED: Script did not block in production mode"
  exit 1
}

# 2. Verify no hardcoded test values in build output
echo "Checking build artifacts..."
if grep -r "15\|67" dist/ --include="*.js" | grep -i "star\|clone"; then
  echo "⚠️  WARNING: Potential test data in build output"
fi

# 3. Clear any test data from production Redis
echo "Clearing test data from production..."
REDIS_URL=$PRODUCTION_REDIS_URL npm run analytics:clear

# 4. Verify cleanup
echo "Verifying cleanup..."
REDIS_URL=$PRODUCTION_REDIS_URL node -e "
  const redis = require('redis').createClient({ url: process.env.REDIS_URL });
  redis.connect().then(async () => {
    const keys = await redis.keys('*:milestones');
    if (keys.length === 0) {
      console.log('✅ All test data cleared');
    } else {
      console.log('⚠️  Milestones still present:', keys);
    }
    await redis.disconnect();
  });
"

echo "✅ Pre-deployment check complete"
```

---

## Best Practice 7: Fallback vs Test Data

### Clear Distinction

```typescript
// ✅ GOOD: Fallback data is real or empty
function getMetrics() {
  const realData = fetchFromAPI();
  
  if (!realData) {
    // Fallback: show empty, not fake data
    return {
      available: false,
      data: null,
      message: 'Data unavailable - check back later',
    };
  }
  
  return realData;
}

// ❌ BAD: Fallback pretends to be real
function getMetrics() {
  try {
    return fetchFromAPI();
  } catch (e) {
    // This pretends to be real data
    return fabricatedMetrics;
  }
}
```

**Rule:** Fallback ≠ Test Data
- Fallback: Empty state, error message, or cached real data
- Test Data: Fabricated for development only

---

## Validation Checklist (DCYFR Must Verify)

Before marking work complete, verify:

- [ ] No hardcoded test values in source code
- [ ] All test data behind `isProduction` checks
- [ ] Production warnings logged for any fallback behavior
- [ ] Cleanup script exists and is documented
- [ ] Environment checks test both NODE_ENV and VERCEL_ENV
- [ ] Tests verify production behavior (blocks, warns, etc.)
- [ ] Documentation explains what is test vs real data
- [ ] Package.json has clear populate/clear scripts
- [ ] Pre-deployment checklist includes cleanup

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Silent Fallback

```typescript
// ❌ WRONG: User sees fabricated data, no warning
async function getGitHubMetrics() {
  const data = await fetch('https://api.github.com/...');
  if (!data) return { stars: 15, forks: 0 };  // Silent!
  return data;
}
```

### ✅ Fix: Explicit Warning

```typescript
// ✅ RIGHT: User knows it's demo data
async function getGitHubMetrics() {
  const data = await fetch('https://api.github.com/...');
  if (!data) {
    if (isProduction) {
      console.error('❌ GitHub API unavailable in production');
    } else {
      console.log('📊 Using demo data (development)');
      return demoData;
    }
  }
  return data;
}
```

### ❌ Mistake 2: No Cleanup Path

```typescript
// ❌ WRONG: Test data created, no cleanup available
redis.set('test:data', {...});  // How do you remove this?
```

### ✅ Fix: Cleanup Script

```typescript
// ✅ RIGHT: Clear script available
// In package.json: "analytics:clear": "node scripts/clear-test-data.mjs"
// In CI/CD: Run before deployment
```

### ❌ Mistake 3: Missing Environment Check

```typescript
// ❌ WRONG: No production detection
if (apiError) {
  return testData;  // Runs everywhere!
}
```

### ✅ Fix: Production Guard

```typescript
// ✅ RIGHT: Explicit production check
if (apiError) {
  if (isProduction) {
    throw new Error('API unavailable in production');
  }
  return testData;  // Dev only
}
```

---

## FAQ

**Q: Can we use test data in production for demos?**  
A: No. Use real data or graceful degradation (empty state). If needed, use a separate demo environment with clear labeling.

**Q: Should test data be in version control?**  
A: No. Scripts can be (with production guards), but data values should be in `.env.example` or docs only.

**Q: How do I know if I'm using test data?**  
A: Check for fabricated values (stars: 15), environment warnings, or empty state. See [TEST_DATA_USAGE.md](../../docs/features/TEST_DATA_USAGE.md).

**Q: What if API is temporarily down?**  
A: Show error to user or use cached real data. Never show fake data and pretend it's real.

**Q: Can cleanup script run in production?**  
A: Yes, cleanup scripts should always work in production. They remove test data, not all data. But populate scripts should always block.

---

## References

- [TEST_DATA_USAGE.md](../../docs/features/TEST_DATA_USAGE.md) - All test data sources documented
- [VALIDATION_CHECKLIST.md](VALIDATION_CHECKLIST.md) - Includes test data validation
- [APPROVAL_GATES.md](APPROVAL_GATES.md) - Breaking changes to test data require approval
- [scripts/clear-test-data.mjs](../../../scripts/clear-test-data.mjs) - Cleanup implementation

---

**Status:** Production Practice (December 25, 2025)  
**Maintained By:** DCYFR Labs Team  
**Last Audit:** December 25, 2025 - All safeguards verified after cleanup completion

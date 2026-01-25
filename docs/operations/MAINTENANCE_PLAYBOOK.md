{/* TLP:CLEAR */}

# Maintenance Playbook

**Purpose**: Repeatable processes for keeping the DCYFR Labs codebase healthy and organized.

**Frequency**: Monthly health checks, quarterly deep cleanups, annual audits

---

## Quick Reference

| Task | Frequency | Time | Priority |
|------|-----------|------|----------|
| Health Check | Monthly | 15 min | High |
| Dependency Audit | Monthly | 30 min | High |
| Unused Code Cleanup | Quarterly | 2-3 hours | Medium |
| Documentation Archiving | Quarterly | 1 hour | Medium |
| Script Organization | Quarterly | 45 min | Low |
| Full Health Audit | Annually | 1 day | High |

---

## Monthly Health Check (15 minutes)

Run this checklist on the 1st of each month:

### 1. Dependency Status

```bash
# Check for outdated packages
npm outdated

# Security audit
npm audit

# Check for unused dependencies (if needed)
npx depcheck --json > reports/depcheck-$(date +%Y-%m-%d).json
```

**Red Flags**:
- Critical security vulnerabilities
- Packages >2 major versions behind
- Unused dependencies accumulating

### 2. Test Health

```bash
# Run full test suite
npm run test:run

# Check coverage
npm run test:coverage
```

**Target Metrics**:
- ≥99% test pass rate
- ≥94% code coverage
- No flaky tests

### 3. Build Verification

```bash
# Clean build
npm run build

# Check bundle size
npm run perf:check
```

**Red Flags**:
- Build failures
- Bundle size increase >10%
- Build time increase >20%

### 4. Code Quality

```bash
# TypeScript errors
npm run typecheck

# Linting
npm run lint

# Design token validation
node scripts/validation/validate-design-tokens.mjs
```

**Target**: 0 errors across all checks

### 5. Documentation Quick Scan

```bash
# Check for time-bound docs in root
ls docs/*.md | grep -E "PHASE_|TEST_|week[0-9]|[0-9]{4}-[0-9]{2}"

# Check for log files
find . -name "*.log" -not -path "./node_modules/*" -not -path "./.next/*"
```

**Action**: Archive/remove any files found

---

## Quarterly Cleanup (2-3 hours)

Run this process every 3 months (January, April, July, October):

### Part 1: Dependency Deep Dive (30 min)

#### 1.1 Unused Dependencies

```bash
# Generate comprehensive dependency report
npx depcheck --json > reports/quarterly/depcheck-$(date +%Y-%m-%d).json

# Review the report
cat reports/quarterly/depcheck-$(date +%Y-%m-%d).json | jq '.dependencies, .devDependencies'
```

**Actions**:
1. Review each flagged dependency
2. Verify it's truly unused (check docs, scripts, configs)
3. Remove if confirmed unused:
   ```bash
   npm uninstall <package-name>
   ```
4. Run tests after each removal

#### 1.2 Missing Direct Dependencies

```bash
# Check for missing deps
cat reports/quarterly/depcheck-$(date +%Y-%m-%d).json | jq '.missing'
```

**Actions**:
1. Add any missing dependencies to package.json
2. Move from overrides if applicable
3. Run tests to verify

#### 1.3 Outdated Dependencies

```bash
# Check all outdated packages
npm outdated --long

# For each major version update:
npm info <package-name> versions
npm info <package-name>@latest
```

**Actions**:
1. Review breaking changes for major updates
2. Update one at a time
3. Test thoroughly after each update

### Part 2: Unused Code Audit (1-2 hours)

#### 2.1 Find Unused Exports

```bash
# Install ts-prune if needed
npm install -D ts-prune

# Run analysis
npx ts-prune > reports/quarterly/ts-prune-$(date +%Y-%m-%d).txt

# Review results
cat reports/quarterly/ts-prune-$(date +%Y-%m-%d).txt | grep -v "used in module"
```

#### 2.2 Component Usage Check

```bash
# For each component directory, check imports
for dir in src/components/*/; do
  echo "=== $(basename $dir) ==="
  find "$dir" -name "*.tsx" -not -path "*/__tests__/*" -not -path "*/index.ts" -exec basename {} \; | while read file; do
    comp="${file%.tsx}"
    count=$(grep -r "from.*/$comp['\"]" src/ --include="*.tsx" --include="*.ts" --exclude-dir=__tests__ | wc -l)
    if [ $count -eq 0 ]; then
      echo "  🔍 $file - possibly unused (0 imports)"
    fi
  done
done
```

#### 2.3 Hook Usage Check

```bash
# Check for unused hooks
for hook in src/hooks/*.ts; do
  name=$(basename "$hook" .ts)
  count=$(grep -r "from.*/$name['\"]" src/ --include="*.tsx" --include="*.ts" --exclude-dir=__tests__ | wc -l)
  if [ $count -eq 0 ]; then
    echo "🔍 $hook - possibly unused"
  fi
done
```

#### 2.4 Utility Usage Check

```bash
# Check for unused utilities in lib/
find src/lib -name "*.ts" -not -path "*/__tests__/*" | while read file; do
  name=$(basename "$file" .ts)
  count=$(grep -r "from.*/$name['\"]" src/ scripts/ --include="*.tsx" --include="*.ts" --include="*.mjs" --exclude-dir=__tests__ | wc -l)
  if [ $count -eq 0 ]; then
    echo "🔍 $file - possibly unused"
  fi
done
```

**Actions**:
1. Review each flagged file
2. Verify it's truly unused (check all imports, tests, configs)
3. Move to `archive/` or remove if confirmed unused
4. Run full test suite after removals

### Part 3: Documentation Archiving (1 hour)

#### 3.1 Identify Time-Bound Documentation

```bash
# Find phase documentation
find docs -maxdepth 1 -name "PHASE_*.md"

# Find test analysis docs
find docs -maxdepth 1 -name "TEST_*.md"

# Find weekly summaries
find docs -name "week*.md"

# Find dated documentation
find docs -maxdepth 1 -name "*[0-9][0-9][0-9][0-9]-[0-9][0-9]*"
```

#### 3.2 Archive Structure

```
docs/archive/
├── phases/           # PHASE_*.md files
├── sessions/         # week*.md files
├── testing/          # TEST_*.md files
└── features/         # One-off feature docs
```

#### 3.3 Archive Process

```bash
# Create archive directories if needed
mkdir -p docs/archive/{phases,sessions,testing,features}

# Move files (example)
mv docs/PHASE_*.md docs/archive/phases/
mv docs/week*.md docs/archive/sessions/
mv docs/TEST_*.md docs/archive/testing/

# Update INDEX.md to reference archive
```

#### 3.4 Remove Log Files

```bash
# Find log files not in .gitignore
find . -name "*.log" -not -path "./node_modules/*" -not -path "./.next/*"

# Remove from git
git rm test-output.log docs/e2e-test-results.log

# Update .gitignore
echo "test-output.log" >> .gitignore
echo "**/e2e-test-results.log" >> .gitignore
```

### Part 4: Script Organization (45 min)

#### 4.1 Audit Root Scripts

```bash
# List root-level scripts
ls -1 scripts/*.mjs

# Categorize by purpose:
# - validation/ (validate-*.mjs)
# - utilities/ (dev-*.mjs, health-*.mjs)
# - performance/ (analyze-*.mjs, collect-*.mjs)
# - content/ (generate-*.mjs)
# - testing/ (test-*.mjs)
```

#### 4.2 Move to Subdirectories

```bash
# Example moves
mv scripts/validate-*.mjs scripts/validation/
mv scripts/dev-*.mjs scripts/utilities/
mv scripts/analyze-*.mjs scripts/performance/
mv scripts/test-*.mjs scripts/testing/

# Update package.json script paths
# Update any documentation referencing old paths
```

#### 4.3 Remove Duplicates

```bash
# Find duplicate scripts (similar names/functionality)
find scripts -name "*.mjs" -exec basename {} \; | sort | uniq -d

# Review and remove duplicates
# Example: validate-contrast.mjs vs validate-color-contrast.mjs
```

#### 4.4 Consolidate package.json Scripts

**Before**: 106 individual scripts
**After**: ~50 scripts (30 primary + 20 composite)

**Example Composite Commands**:
```json
{
  "validate:all": "npm run validate:allowlist && npm run validate:contrast && npm run validate:botid && npm run validate:content",
  "mcp:dev:all": "concurrently 'npm:mcp:dev:*'",
  "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e",
  "perf:all": "npm run perf:check && npm run perf:metrics"
}
```

---

## Annual Deep Audit (1 day)

Run this comprehensive review once per year:

### Morning Session (4 hours)

#### 1. Full Dependency Analysis

- Review entire dependency tree
- Check for security vulnerabilities in all layers
- Identify opportunities for dependency consolidation
- Review licenses for compliance

#### 2. Component Architecture Review

- Analyze component reuse patterns
- Identify over-abstraction or under-abstraction
- Review component organization strategy
- Check for design pattern consistency

#### 3. Performance Budget Review

- Analyze bundle size trends
- Review Core Web Vitals over past year
- Identify performance bottlenecks
- Update performance targets if needed

### Afternoon Session (4 hours)

#### 4. Test Coverage Deep Dive

- Analyze coverage gaps
- Review test execution time trends
- Identify flaky tests
- Update testing strategy if needed

#### 5. Documentation Structure Review

- Audit all documentation for currency
- Review documentation organization
- Update architecture decision records
- Identify documentation gaps

#### 6. CI/CD Optimization

- Review GitHub Actions workflow efficiency
- Analyze build time trends
- Optimize caching strategies
- Update deployment processes

#### 7. Security Posture Assessment

- Review all security scanning results
- Audit authentication/authorization flows
- Check for exposed secrets or credentials
- Update security policies

---

## Automation Scripts

### monthly-health-check.sh

```bash
#!/bin/bash
# Monthly automated health check

echo "🏥 DCYFR Labs Monthly Health Check - $(date +%Y-%m-%d)"
echo "================================================"

# 1. Dependencies
echo "\n📦 Dependency Status:"
npm outdated
npm audit

# 2. Tests
echo "\n🧪 Test Status:"
npm run test:run

# 3. Build
echo "\n🏗️  Build Status:"
npm run build

# 4. Code Quality
echo "\n✨ Code Quality:"
npm run typecheck
npm run lint

# 5. Documentation
echo "\n📚 Documentation Check:"
echo "Time-bound docs in root:"
ls docs/*.md | grep -E "PHASE_|TEST_|week[0-9]"
echo "\nLog files:"
find . -name "*.log" -not -path "./node_modules/*" -not -path "./.next/*"

echo "\n✅ Health check complete!"
```

### quarterly-cleanup.sh

```bash
#!/bin/bash
# Quarterly automated cleanup

REPORT_DIR="reports/quarterly/$(date +%Y-%m)"
mkdir -p "$REPORT_DIR"

echo "🧹 DCYFR Labs Quarterly Cleanup - $(date +%Y-%m-%d)"
echo "================================================"

# 1. Dependency audit
echo "\n📦 Generating dependency report..."
npx depcheck --json > "$REPORT_DIR/depcheck.json"

# 2. Unused exports
echo "\n🔍 Finding unused exports..."
npx ts-prune > "$REPORT_DIR/ts-prune.txt"

# 3. Large files
echo "\n📊 Finding large files..."
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  awk '/^blob/ {print substr($0,6)}' | \
  sort --numeric-sort --key=2 | \
  tail -20 > "$REPORT_DIR/large-files.txt"

# 4. Documentation scan
echo "\n📚 Scanning documentation..."
find docs -maxdepth 1 -name "*.md" > "$REPORT_DIR/root-docs.txt"

echo "\n✅ Reports generated in $REPORT_DIR"
echo "📝 Review reports and run cleanup actions manually"
```

---

## GitHub Actions Integration

### .github/workflows/monthly-maintenance.yml

```yaml
name: Monthly Maintenance Check

on:
  schedule:
    - cron: '0 0 1 * *'  # First day of each month
  workflow_dispatch:  # Allow manual trigger

jobs:
  health-check:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Dependency audit
        run: |
          npm outdated --json > outdated.json || true
          npm audit --json > audit.json || true
          npx depcheck --json > depcheck.json || true

      - name: Test suite
        run: npm run test:run

      - name: Build check
        run: npm run build

      - name: Code quality
        run: |
          npm run typecheck
          npm run lint

      - name: Upload reports
        uses: actions/upload-artifact@v4
        with:
          name: maintenance-reports-${{ github.run_number }}
          path: |
            outdated.json
            audit.json
            depcheck.json

      - name: Create issue if failures
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: 'Monthly Maintenance Check Failed',
              body: 'Automated monthly maintenance check has failed. Please review the workflow run.',
              labels: ['maintenance', 'automated']
            })
```

---

## Checklist Templates

### Monthly Health Check Checklist

- [ ] Run `npm outdated` - all packages current?
- [ ] Run `npm audit` - no critical vulnerabilities?
- [ ] Run `npm run test:run` - ≥99% pass rate?
- [ ] Run `npm run build` - builds successfully?
- [ ] Run `npm run typecheck` - 0 errors?
- [ ] Run `npm run lint` - 0 errors?
- [ ] Check for time-bound docs in root - none found?
- [ ] Check for log files - none found?
- [ ] Review GitHub Actions - all workflows passing?
- [ ] Review Lighthouse CI - ≥90 scores?

### Quarterly Cleanup Checklist

**Dependencies:**
- [ ] Generate depcheck report
- [ ] Review unused dependencies
- [ ] Remove confirmed unused packages
- [ ] Add missing direct dependencies
- [ ] Update outdated packages (non-breaking)
- [ ] Run full test suite

**Code:**
- [ ] Generate ts-prune report
- [ ] Review unused components
- [ ] Remove confirmed unused components
- [ ] Review unused hooks
- [ ] Remove confirmed unused hooks
- [ ] Review unused utilities
- [ ] Remove confirmed unused utilities
- [ ] Run full test suite

**Documentation:**
- [ ] Archive PHASE_*.md files
- [ ] Archive TEST_*.md files
- [ ] Archive week*.md files
- [ ] Remove log files from git
- [ ] Update .gitignore
- [ ] Update INDEX.md

**Scripts:**
- [ ] Review root scripts for organization
- [ ] Move scripts to subdirectories
- [ ] Remove duplicate scripts
- [ ] Update package.json paths
- [ ] Create composite commands
- [ ] Test all affected scripts

### Annual Audit Checklist

- [ ] Full dependency tree analysis
- [ ] Security vulnerability assessment
- [ ] License compliance review
- [ ] Component architecture review
- [ ] Performance budget review
- [ ] Test coverage analysis
- [ ] Documentation structure review
- [ ] CI/CD optimization review
- [ ] Update maintenance playbook
- [ ] Update project health audit

---

## Metrics to Track

### Health Score Calculation

| Category | Weight | Target | Measurement |
|----------|--------|--------|-------------|
| Test Pass Rate | 25% | ≥99% | Tests passing / total tests |
| TypeScript | 15% | 0 errors | TS compilation |
| ESLint | 10% | 0 errors | Linting |
| Security | 20% | 0 vulns | npm audit |
| Dependencies | 10% | 0 unused | depcheck |
| Code Quality | 10% | <5% unused | ts-prune |
| Documentation | 5% | Current | Time-bound docs in root |
| Performance | 5% | ≥90 | Lighthouse CI |

**Overall Health Score** = Weighted average of all categories

### Trend Tracking

Create quarterly reports tracking:
- Total LOC (lines of code)
- Number of components
- Number of utilities
- Dependency count
- Test count
- Bundle size
- Build time
- Test execution time

---

## Emergency Procedures

### Critical Security Vulnerability

1. **Immediate**: Run `npm audit fix`
2. **Review**: Check what was updated
3. **Test**: Run full test suite
4. **Deploy**: If tests pass, deploy immediately
5. **Document**: Update SECURITY_FIX_*.md in docs/private/

### Build Failure in Production

1. **Revert**: Roll back to last known good version
2. **Diagnose**: Review error logs
3. **Fix**: Apply targeted fix
4. **Test**: Run full test suite locally
5. **Deploy**: Gradual rollout with monitoring

### Test Pass Rate Drop Below 95%

1. **Stop**: Halt all new feature work
2. **Triage**: Identify failing tests
3. **Fix**: Address root causes
4. **Verify**: Ensure pass rate ≥99%
5. **Resume**: Return to normal development

---

## Contact and Escalation

**Maintenance Owner**: Project Lead
**Quarterly Review**: Development Team
**Annual Audit**: Full Stakeholder Review

**Questions or Issues**: Open GitHub issue with `maintenance` label

---

**Last Updated**: January 2, 2026
**Next Review**: April 2, 2026
**Version**: 1.0.0

#!/usr/bin/env node

/**
 * Generate documentation governance compliance report
 * Creates quarterly report with metrics, trends, and recommendations
 *
 * Usage:
 *   node scripts/generate-compliance-report.mjs
 *   node scripts/generate-compliance-report.mjs --output reports/governance-YYYY-MM.md
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

// Parse arguments
const args = process.argv.slice(2);
const outputArg = args.find((arg) => arg.startsWith('--output='));
const outputPath = outputArg
  ? outputArg.split('=')[1]
  : path.join(
      ROOT_DIR,
      'docs/governance/private',
      `compliance-report-${new Date().toISOString().split('T')[0]}.md`
    );

/**
 * Run validation and capture results
 *
 * Security: Uses array form of execSync to prevent command injection (CWE-78)
 * Validates script name against allowlist before execution
 */
function runValidation(script) {
  // CWE-78 Prevention: Validate script name to prevent command injection
  const validScripts = [
    'scripts/validate-governance.mjs',
    'scripts/validate-doc-location.mjs',
    'scripts/validate-tlp-compliance.mjs',
    'scripts/validate-dcyfr-patterns.mjs',
  ];

  if (!validScripts.includes(script)) {
    throw new Error(`Invalid script: ${script} - not in allowlist`);
  }

  try {
    // Use array form of execSync to avoid shell interpolation (CWE-78)
    const output = execSync('node', [script], {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    return { success: true, output };
  } catch (error) {
    return { success: false, output: error.stdout || error.message };
  }
}

/**
 * Parse validation output for metrics
 */
function parseMetrics(output) {
  const passedMatch = output.match(/✅ Passed: (\d+)/);
  const warningsMatch = output.match(/⚠️\s+Warnings: (\d+)/);
  const errorsMatch = output.match(/❌ Errors: (\d+)/);

  return {
    passed: passedMatch ? parseInt(passedMatch[1]) : 0,
    warnings: warningsMatch ? parseInt(warningsMatch[1]) : 0,
    errors: errorsMatch ? parseInt(errorsMatch[1]) : 0,
  };
}

/**
 * Generate report
 */
function generateReport() {
  console.log('📊 Generating Documentation Governance Compliance Report...\n');

  // Run validations
  console.log('Running TLP compliance validation...');
  const tlpResult = runValidation(path.join(ROOT_DIR, 'scripts/validate-tlp-compliance.mjs'));
  const tlpMetrics = parseMetrics(tlpResult.output);

  console.log('Running documentation location validation...');
  const locationResult = runValidation(path.join(ROOT_DIR, 'scripts/validate-doc-location.mjs'));

  // Calculate statistics
  const totalFiles = tlpMetrics.passed + tlpMetrics.warnings + tlpMetrics.errors;
  const complianceRate = totalFiles > 0 ? ((tlpMetrics.passed / totalFiles) * 100).toFixed(1) : 0;
  const errorFreeRate =
    totalFiles > 0
      ? (((tlpMetrics.passed + tlpMetrics.warnings) / totalFiles) * 100).toFixed(1)
      : 0;

  // Generate report content
  const report = `{/* TLP:AMBER - Internal Use Only */}

# Documentation Governance Compliance Report

**Report Date:** ${new Date().toISOString().split('T')[0]}
**Report Type:** Quarterly Compliance Audit
**Status:** ${tlpMetrics.errors === 0 ? '✅ PASSING' : '❌ FAILING'}

---

## Executive Summary

This report provides a comprehensive overview of documentation governance compliance across the dcyfr-labs repository, including TLP classification adherence and documentation organization standards.

### Overall Status

- **TLP Compliance:** ${tlpMetrics.errors === 0 ? '✅ PASSING' : '❌ FAILING'} (${complianceRate}% classified)
- **Location Compliance:** ${locationResult.success ? '✅ PASSING' : '❌ FAILING'}
- **Error-Free Rate:** ${errorFreeRate}% (${tlpMetrics.passed + tlpMetrics.warnings}/${totalFiles} files)

---

## Compliance Metrics

### TLP Classification

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **Total Files** | ${totalFiles} | - | - |
| **Passed** | ${tlpMetrics.passed} | 100% | ${tlpMetrics.errors === 0 && tlpMetrics.warnings === 0 ? '✅' : '⚠️'} |
| **Warnings** | ${tlpMetrics.warnings} | 0 | ${tlpMetrics.warnings === 0 ? '✅' : '⚠️'} |
| **Errors** | ${tlpMetrics.errors} | 0 | ${tlpMetrics.errors === 0 ? '✅' : '❌'} |
| **Compliance Rate** | ${complianceRate}% | 100% | ${complianceRate === '100.0' ? '✅' : '⚠️'} |
| **Error-Free Rate** | ${errorFreeRate}% | 100% | ${errorFreeRate === '100.0' ? '✅' : '⚠️'} |

### Documentation Location

| Check | Status |
|-------|--------|
| **All docs in \`docs/\` directory** | ${locationResult.success ? '✅ PASS' : '❌ FAIL'} |
| **No docs in project root** | ${locationResult.success ? '✅ PASS' : '❌ FAIL'} |

---

## Validation Details

### TLP Compliance Validation

\`\`\`
${tlpResult.output.trim()}
\`\`\`

### Location Validation

\`\`\`
${locationResult.output.trim()}
\`\`\`

---

## Recommendations

${
  tlpMetrics.errors > 0
    ? `
### 🔴 Critical Actions Required

**Errors Detected:** ${tlpMetrics.errors} files with TLP violations

**Immediate Actions:**
1. Run \`npm run check:docs\` to identify specific files
2. Add TLP:CLEAR markers to public documentation files
3. Move operational files to \`docs/*/private/\` subdirectories
4. Re-run validation to confirm fixes
`
    : ''
}

${
  tlpMetrics.warnings > 0
    ? `
### ⚠️ Optional Improvements

**Warnings Detected:** ${tlpMetrics.warnings} files with classification warnings

**Recommended Actions:**
1. Review files in \`docs/*/private/\` subdirectories
2. Change TLP:CLEAR to TLP:AMBER for internal documentation
3. Run \`npm run docs:fix-private-markers\` for bulk updates
`
    : ''
}

${
  tlpMetrics.errors === 0 && tlpMetrics.warnings === 0
    ? `
### ✅ Perfect Compliance Achieved

**Status:** All ${totalFiles} documentation files are properly classified and located.

**Maintain Compliance:**
1. Continue using \`npm run check:docs\` before commits
2. Review quarterly compliance reports
3. Keep validation scripts updated
4. Document any policy changes in \`docs/governance/DOCS_GOVERNANCE.md\`
`
    : ''
}

---

## Compliance Tools

### NPM Commands

\`\`\`bash
npm run check:docs                    # Run all validation
npm run validate:tlp                  # TLP compliance only
npm run validate:doc-location         # Location only
npm run docs:add-tlp-markers          # Bulk add TLP markers
npm run docs:fix-private-markers      # Fix private file markers
\`\`\`

### Pre-Commit Validation

Pre-commit hooks automatically validate documentation changes:
- \`.git/hooks/pre-commit\` - Runs on every commit
- Blocks commits with TLP violations
- Provides fix instructions

### CI/CD Integration

GitHub Actions workflow validates on PRs and pushes:
- \`.github/workflows/governance-validation.yml\`
- Runs on changes to \`docs/**/*.md\`
- Hard-fails workflow if validation fails

---

## Historical Trends

*Note: Historical data will be populated after multiple quarterly reports*

### Compliance Trend

| Quarter | Files | Passed | Warnings | Errors | Rate |
|---------|-------|--------|----------|--------|------|
| Q1 2026 | ${totalFiles} | ${tlpMetrics.passed} | ${tlpMetrics.warnings} | ${tlpMetrics.errors} | ${complianceRate}% |

---

## Next Review

**Scheduled:** ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
**Type:** Quarterly Compliance Audit

---

**Report Generated:** ${new Date().toISOString()}
**Generated By:** scripts/generate-compliance-report.mjs
**Information Classification:** TLP:AMBER (Internal Use Only)
`;

  // Write report
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, report, 'utf-8');

  console.log(`\n✅ Report generated: ${outputPath}`);
  console.log(`\n📊 Summary:`);
  console.log(`   Total Files: ${totalFiles}`);
  console.log(`   Passed: ${tlpMetrics.passed}`);
  console.log(`   Warnings: ${tlpMetrics.warnings}`);
  console.log(`   Errors: ${tlpMetrics.errors}`);
  console.log(`   Compliance Rate: ${complianceRate}%`);

  return tlpMetrics.errors === 0;
}

// Run report generation
const success = generateReport();
process.exit(success ? 0 : 1);

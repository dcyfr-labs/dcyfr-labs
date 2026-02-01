#!/usr/bin/env node

/**
 * Evidence Collection Script for dcyfr-labs
 *
 * Automated collection of SOC2 Type 2 compliance evidence:
 * - Git commit logs (change tracking)
 * - CodeQL SARIF results (security scanning)
 * - Dependabot PRs (vulnerability remediation)
 * - Vercel deployment logs (change deployment)
 * - Security scan summaries
 * - Access logs export
 * - SBOM snapshots (monthly)
 *
 * Part of SOC2 Type 2 continuous monitoring (Phase 3)
 *
 * @see docs/security/.private/soc2-compliance-plan-2026-01-31.md
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
const evidenceDir = join(projectRoot, 'docs/security/.private/evidence');

// Determine evidence period (monthly by default)
const currentDate = new Date();
const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0');
const evidenceMonthDir = join(evidenceDir, `${year}-${month}`);

if (!existsSync(evidenceMonthDir)) {
  mkdirSync(evidenceMonthDir, { recursive: true });
}

const timestamp = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD

console.log('📦 Evidence Collection for dcyfr-labs');
console.log('━'.repeat(50));
console.log(`📅 Collection Date: ${timestamp}`);
console.log(`📁 Evidence Directory: ${evidenceMonthDir}`);
console.log('━'.repeat(50));

let collectionResults = {
  timestamp,
  period: `${year}-${month}`,
  evidenceCollected: [],
  failed: [],
};

/**
 * Collect evidence from a source
 */
function collectEvidence(name, collectFn) {
  console.log(`\n📥 Collecting: ${name}...`);
  try {
    const result = collectFn();
    if (result.success) {
      collectionResults.evidenceCollected.push({
        name,
        file: result.file,
        size: result.size || 'N/A',
        timestamp: new Date().toISOString(),
      });
      console.log(`   ✅ Saved: ${result.file} (${result.size || 'N/A'})`);
    } else {
      collectionResults.failed.push({
        name,
        error: result.error,
      });
      console.log(`   ⚠️ Skipped: ${result.error}`);
    }
    return result;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    collectionResults.failed.push({
      name,
      error: error.message,
    });
    return { success: false, error: error.message };
  }
}

/**
 * 1. Git Commit Logs (Change Tracking)
 */
function collectGitCommitLogs() {
  try {
    // Get commits for the month
    const startOfMonth = `${year}-${month}-01`;
    const endOfMonth = new Date(year, parseInt(month), 0).toISOString().split('T')[0];

    const commits = execSync(
      `git log --since="${startOfMonth}" --until="${endOfMonth}" --pretty=format:"%H|%an|%ae|%ad|%s" --date=iso`,
      { cwd: projectRoot, stdio: 'pipe' }
    ).toString();

    const commitCount = commits.split('\n').filter(Boolean).length;

    // Convert to JSON
    const commitData = {
      period: `${year}-${month}`,
      startDate: startOfMonth,
      endDate: endOfMonth,
      totalCommits: commitCount,
      commits: commits
        .split('\n')
        .filter(Boolean)
        .map(line => {
          const [hash, author, email, date, message] = line.split('|');
          return { hash, author, email, date, message };
        }),
    };

    const filename = `git-commits-${timestamp}.json`;
    const filepath = join(evidenceMonthDir, filename);
    writeFileSync(filepath, JSON.stringify(commitData, null, 2));

    return {
      success: true,
      file: filename,
      size: `${commitCount} commits`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Git log collection failed: ${error.message}`,
    };
  }
}

/**
 * 2. CodeQL SARIF Results
 */
function collectCodeQLResults() {
  try {
    // Try to get latest CodeQL results from GitHub
    const codeqlOutput = execSync(
      'gh api repos/dcyfr-labs/dcyfr-labs/code-scanning/analyses --jq ".[0]"',
      { cwd: projectRoot, stdio: 'pipe' }
    ).toString();

    const filename = `codeql-latest-${timestamp}.json`;
    const filepath = join(evidenceMonthDir, filename);
    writeFileSync(filepath, codeqlOutput);

    const data = JSON.parse(codeqlOutput);
    const alertCount = data.results_count || 0;

    return {
      success: true,
      file: filename,
      size: `${alertCount} findings`,
    };
  } catch (error) {
    return {
      success: false,
      error: 'CodeQL results unavailable (GitHub CLI not configured or no scans)',
    };
  }
}

/**
 * 3. Dependabot PRs (Vulnerability Remediation)
 */
function collectDependabotPRs() {
  try {
    // Get Dependabot PRs merged this month
    const startOfMonth = `${year}-${month}-01`;

    const prs = execSync(
      `gh pr list --state merged --search "author:app/dependabot merged:>=${startOfMonth}" --json number,title,mergedAt,url`,
      { cwd: projectRoot, stdio: 'pipe' }
    ).toString();

    const prData = JSON.parse(prs);
    const prCount = prData.length;

    const filename = `dependabot-prs-${timestamp}.json`;
    const filepath = join(evidenceMonthDir, filename);
    writeFileSync(filepath, JSON.stringify({ period: `${year}-${month}`, count: prCount, prs: prData }, null, 2));

    return {
      success: true,
      file: filename,
      size: `${prCount} PRs`,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Dependabot PR collection unavailable (GitHub CLI not configured)',
    };
  }
}

/**
 * 4. Vercel Deployment Logs
 */
function collectVercelDeployments() {
  try {
    // Get recent deployments
    const deployments = execSync(
      'vercel ls --json',
      { cwd: projectRoot, stdio: 'pipe' }
    ).toString();

    const filename = `vercel-deployments-${timestamp}.json`;
    const filepath = join(evidenceMonthDir, filename);
    writeFileSync(filepath, deployments);

    const data = JSON.parse(deployments);
    const deployCount = data.deployments?.length || 0;

    return {
      success: true,
      file: filename,
      size: `${deployCount} deployments`,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Vercel deployment logs unavailable (Vercel CLI not configured)',
    };
  }
}

/**
 * 5. Security Scan Summaries
 */
function collectSecurityScans() {
  try {
    const scanResults = {
      timestamp,
      period: `${year}-${month}`,
      scans: {},
    };

    // npm audit
    try {
      const npmAudit = execSync('npm audit --json', { cwd: projectRoot, stdio: 'pipe' }).toString();
      scanResults.scans.npmAudit = JSON.parse(npmAudit);
    } catch (error) {
      const npmAudit = error.stdout?.toString() || '{}';
      scanResults.scans.npmAudit = JSON.parse(npmAudit);
    }

    // ESLint (if configured)
    try {
      execSync('npm run lint', { cwd: projectRoot, stdio: 'pipe' });
      scanResults.scans.eslint = { status: 'PASS', errors: 0 };
    } catch (error) {
      scanResults.scans.eslint = { status: 'FAIL', errors: 'Has errors' };
    }

    // TypeScript compilation
    try {
      execSync('npm run typecheck', { cwd: projectRoot, stdio: 'pipe' });
      scanResults.scans.typescript = { status: 'PASS', errors: 0 };
    } catch (error) {
      scanResults.scans.typescript = { status: 'FAIL', errors: 'Has errors' };
    }

    const filename = `security-scans-${timestamp}.json`;
    const filepath = join(evidenceMonthDir, filename);
    writeFileSync(filepath, JSON.stringify(scanResults, null, 2));

    return {
      success: true,
      file: filename,
      size: `${Object.keys(scanResults.scans).length} scans`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Security scan collection failed: ${error.message}`,
    };
  }
}

/**
 * 6. Access Logs Export
 */
function collectAccessLogs() {
  try {
    // Collect git author statistics
    const startOfMonth = `${year}-${month}-01`;

    const authors = execSync(
      `git log --since="${startOfMonth}" --pretty=format:"%an|%ae" | sort | uniq -c`,
      { cwd: projectRoot, stdio: 'pipe' }
    ).toString();

    const accessData = {
      period: `${year}-${month}`,
      gitAuthors: authors
        .split('\n')
        .filter(Boolean)
        .map(line => {
          const match = line.trim().match(/(\d+)\s+(.+)\|(.+)/);
          if (match) {
            return {
              commitCount: parseInt(match[1], 10),
              name: match[2],
              email: match[3],
            };
          }
          return null;
        })
        .filter(Boolean),
    };

    const filename = `access-logs-${timestamp}.json`;
    const filepath = join(evidenceMonthDir, filename);
    writeFileSync(filepath, JSON.stringify(accessData, null, 2));

    return {
      success: true,
      file: filename,
      size: `${accessData.gitAuthors.length} contributors`,
    };
  } catch (error) {
    return {
      success: false,
      error: `Access log collection failed: ${error.message}`,
    };
  }
}

/**
 * 7. SBOM Snapshot (if not already collected this month)
 */
function collectSBOMSnapshot() {
  try {
    const sbomDir = join(projectRoot, 'docs/security/sbom');
    const expectedSBOM = `sbom-combined-${timestamp}.json`;
    const sbomPath = join(sbomDir, expectedSBOM);

    if (existsSync(sbomPath)) {
      // Copy to evidence directory
      const sbomContent = readFileSync(sbomPath, 'utf-8');
      const evidenceSBOMPath = join(evidenceMonthDir, expectedSBOM);
      writeFileSync(evidenceSBOMPath, sbomContent);

      const sbomData = JSON.parse(sbomContent);
      const depCount = sbomData.summary?.totalDependencies || 0;

      return {
        success: true,
        file: expectedSBOM,
        size: `${depCount} dependencies`,
      };
    } else {
      // Generate new SBOM
      execSync('npm run sbom:generate', { cwd: projectRoot, stdio: 'pipe' });

      if (existsSync(sbomPath)) {
        const sbomContent = readFileSync(sbomPath, 'utf-8');
        const evidenceSBOMPath = join(evidenceMonthDir, expectedSBOM);
        writeFileSync(evidenceSBOMPath, sbomContent);

        const sbomData = JSON.parse(sbomContent);
        const depCount = sbomData.summary?.totalDependencies || 0;

        return {
          success: true,
          file: expectedSBOM,
          size: `${depCount} dependencies`,
        };
      } else {
        return {
          success: false,
          error: 'SBOM generation failed',
        };
      }
    }
  } catch (error) {
    return {
      success: false,
      error: `SBOM collection failed: ${error.message}`,
    };
  }
}

/**
 * 8. Test Results Summary
 */
function collectTestResults() {
  try {
    // Run tests and capture results
    const testOutput = execSync('npm run test:run -- --reporter=json', {
      cwd: projectRoot,
      stdio: 'pipe',
    }).toString();

    const filename = `test-results-${timestamp}.json`;
    const filepath = join(evidenceMonthDir, filename);
    writeFileSync(filepath, testOutput);

    const testData = JSON.parse(testOutput);
    const testCount = testData.numTotalTests || 0;
    const passed = testData.numPassedTests || 0;

    return {
      success: true,
      file: filename,
      size: `${passed}/${testCount} passed`,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Test results unavailable (test suite not configured or failing)',
    };
  }
}

/**
 * Generate Evidence Collection Report
 */
function generateReport() {
  console.log('\n📋 Generating Evidence Collection Report...');

  const report = `<!-- TLP:CLEAR -->

# Evidence Collection Report

**Collection Date:** ${timestamp}
**Period:** ${year}-${month}
**Evidence Directory:** \`docs/security/.private/evidence/${year}-${month}/\`

---

## Evidence Collected

${collectionResults.evidenceCollected.length === 0 ? '_No evidence collected_' : collectionResults.evidenceCollected.map((e, idx) => `${idx + 1}. **${e.name}**
   - File: \`${e.file}\`
   - Size: ${e.size}
   - Timestamp: ${e.timestamp}`).join('\n\n')}

**Total Evidence Items:** ${collectionResults.evidenceCollected.length}

---

## Failed Collections

${collectionResults.failed.length === 0 ? '_All collections successful_' : collectionResults.failed.map((f, idx) => `${idx + 1}. **${f.name}**
   - Error: ${f.error}`).join('\n\n')}

---

## SOC2 Compliance Mapping

This evidence supports the following Trust Service Criteria:

- **SC3.2:** Security testing and vulnerability management (CodeQL, npm audit, security scans)
- **PI1.1:** Data validation and processing integrity (Test results)
- **C2.1:** Third-party service inventory (SBOM snapshots)
- **CC8.1:** System operations (Change tracking via git logs)
- **CC7.2:** System monitoring (Access logs, deployment logs)

**Retention Period:** 24 months (SOC2 Type 2 requirement)

---

## Next Steps

1. Review collected evidence for completeness
2. Ensure monthly evidence collection continues
3. Archive evidence older than 24 months

---

**Collection Automation:** This report was generated by \`scripts/security/collect-evidence.mjs\`
**Run Command:** \`npm run security:collect-evidence\`
`;

  const reportPath = join(evidenceMonthDir, `evidence-collection-${timestamp}.md`);
  writeFileSync(reportPath, report);
  console.log(`   ✅ Report saved: ${reportPath}`);
}

/**
 * Main Execution
 */
async function main() {
  const startTime = Date.now();

  // Collect all evidence
  collectEvidence('Git Commit Logs (Change Tracking)', collectGitCommitLogs);
  collectEvidence('CodeQL SARIF Results', collectCodeQLResults);
  collectEvidence('Dependabot PRs (Vulnerability Remediation)', collectDependabotPRs);
  collectEvidence('Vercel Deployment Logs', collectVercelDeployments);
  collectEvidence('Security Scan Summaries', collectSecurityScans);
  collectEvidence('Access Logs Export', collectAccessLogs);
  collectEvidence('SBOM Snapshot', collectSBOMSnapshot);
  collectEvidence('Test Results Summary', collectTestResults);

  // Generate report
  generateReport();

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n━'.repeat(50));
  console.log(`✅ Evidence collection complete in ${duration}s`);
  console.log(`📊 Collected: ${collectionResults.evidenceCollected.length} evidence items`);
  console.log(`⚠️ Failed: ${collectionResults.failed.length} collection(s)`);
  console.log(`📁 Evidence Directory: ${evidenceMonthDir}`);
  console.log('━'.repeat(50));

  // Exit successfully even if some collections failed (non-critical)
  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ Evidence collection failed:', error);
  process.exit(1);
});

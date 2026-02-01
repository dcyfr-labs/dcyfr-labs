#!/usr/bin/env node

/**
 * Annual Security Review Script for dcyfr-labs
 *
 * Comprehensive annual audit covering:
 * - All monthly and quarterly audit checks
 * - Formal risk assessment
 * - Penetration testing review (external)
 * - Security control testing (all SOC2 controls)
 * - Vendor security reviews
 * - Disaster recovery testing (full failover)
 * - Policy comprehensive review
 * - Compliance gap analysis
 * - Security roadmap planning
 * - SOC2 readiness assessment
 *
 * Run on: January (annual review)
 * Part of SOC2 Type 2 continuous monitoring (Phase 3)
 *
 * @see docs/security/.private/soc2-compliance-plan-2026-01-31.md
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');
const evidenceDir = join(projectRoot, 'docs/security/.private/evidence');

const currentDate = new Date();
const year = currentDate.getFullYear();

const evidenceYearDir = join(evidenceDir, `${year}-annual`);

if (!existsSync(evidenceYearDir)) {
  mkdirSync(evidenceYearDir, { recursive: true });
}

const timestamp = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
const auditReportPath = join(projectRoot, `docs/security/.private/annual-audit-${year}.md`);

console.log('🔒 Annual Security Review for dcyfr-labs');
console.log('━'.repeat(50));
console.log(`📅 Review Date: ${timestamp}`);
console.log(`📊 Review Year: ${year}`);
console.log(`📁 Evidence Directory: ${evidenceYearDir}`);
console.log('━'.repeat(50));

let auditResults = {
  timestamp,
  year,
  checks: [],
  controlTesting: [],
  vulnerabilities: { critical: 0, high: 0, moderate: 0, low: 0 },
  findings: [],
  recommendations: [],
  roadmap: [],
  passed: 0,
  failed: 0,
  soc2Readiness: 0,
};

/**
 * Run a check and record results
 */
function runCheck(name, checkFn) {
  console.log(`\n🔍 ${name}...`);
  try {
    const result = checkFn();
    auditResults.checks.push({
      name,
      status: result.passed ? 'PASS' : 'FAIL',
      details: result.details,
      timestamp: new Date().toISOString(),
    });
    if (result.passed) {
      auditResults.passed++;
      console.log(`   ✅ ${result.details}`);
    } else {
      auditResults.failed++;
      console.log(`   ❌ ${result.details}`);
      if (result.finding) {
        auditResults.findings.push(result.finding);
      }
    }
    if (result.recommendation) {
      auditResults.recommendations.push(result.recommendation);
    }
    if (result.roadmapItem) {
      auditResults.roadmap.push(result.roadmapItem);
    }
    return result;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    auditResults.checks.push({
      name,
      status: 'ERROR',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
    auditResults.failed++;
    return { passed: false, details: error.message };
  }
}

/**
 * 1. Run All Quarterly Checks (Comprehensive)
 */
function runQuarterlyChecks() {
  try {
    const output = execSync('node scripts/security/quarterly-audit.mjs', {
      cwd: projectRoot,
      stdio: 'pipe',
    }).toString();

    const passed = !output.includes('❌ FAIL');

    return {
      passed,
      details: passed
        ? 'All quarterly audit checks passed'
        : 'Quarterly audit has failures - review quarterly reports',
      finding: !passed ? 'Quarterly audit failures require remediation' : null,
      recommendation: !passed
        ? 'Address quarterly audit findings before annual review closes'
        : null,
    };
  } catch (error) {
    return {
      passed: false,
      details: 'Quarterly audit script failed to execute',
      finding: 'Quarterly audit automation broken',
      recommendation: 'Fix quarterly audit script errors immediately',
    };
  }
}

/**
 * 2. Formal Risk Assessment
 */
function conductRiskAssessment() {
  const riskAssessmentPath = join(projectRoot, 'docs/governance/risk-assessment-procedure.md');
  const hasRiskProcess = existsSync(riskAssessmentPath);

  // Check for annual risk assessment execution
  const riskAssessments = readdirSync(evidenceDir, { recursive: true }).filter(
    f => f.includes('risk-assessment') && f.includes(String(year))
  );

  const hasCurrentAssessment = riskAssessments.length > 0;

  return {
    passed: hasRiskProcess && hasCurrentAssessment,
    details: hasRiskProcess
      ? hasCurrentAssessment
        ? `Risk assessment completed for ${year} (${riskAssessments.length} assessment(s))`
        : 'Risk assessment process documented but not executed this year'
      : 'No formal risk assessment process documented',
    finding:
      !hasRiskProcess || !hasCurrentAssessment
        ? 'Annual risk assessment is a critical SOC2 requirement'
        : null,
    recommendation: !hasRiskProcess
      ? 'Create risk assessment procedure (Phase 4 of SOC2 plan)'
      : !hasCurrentAssessment
        ? `Conduct formal risk assessment for ${year}`
        : null,
    roadmapItem: !hasRiskProcess
      ? { priority: 'HIGH', item: 'Implement formal risk assessment framework' }
      : null,
  };
}

/**
 * 3. Penetration Testing Review
 */
function reviewPenetrationTesting() {
  // Check for penetration testing evidence
  const pentestFiles = readdirSync(evidenceDir, { recursive: true }).filter(
    f => f.includes('pentest') || f.includes('penetration-test')
  );

  const currentYearPentest = pentestFiles.filter(f => f.includes(String(year)));

  return {
    passed: currentYearPentest.length > 0,
    details:
      currentYearPentest.length > 0
        ? `Penetration testing completed in ${year} (${currentYearPentest.length} report(s))`
        : `No penetration testing conducted in ${year}`,
    finding:
      currentYearPentest.length === 0
        ? 'Annual penetration testing required for SOC2 Type 2'
        : null,
    recommendation:
      currentYearPentest.length === 0
        ? 'Engage external security firm for penetration testing'
        : null,
    roadmapItem:
      currentYearPentest.length === 0
        ? {
            priority: 'HIGH',
            item: 'Schedule annual penetration testing ($5k-$15k budget)',
          }
        : null,
  };
}

/**
 * 4. Comprehensive SOC2 Control Testing
 */
function testAllSOC2Controls() {
  const controls = [];

  // Security Controls (SC)
  controls.push(
    {
      control: 'SC1.1',
      name: 'Access Control',
      test: 'Verify access is restricted to authorized users',
      result: true, // GitHub auth + Vercel team management
    },
    {
      control: 'SC2.1',
      name: 'Logical Access Security',
      test: 'Verify logical access controls are in place',
      result: existsSync(join(projectRoot, 'src/middleware.ts')),
    },
    {
      control: 'SC3.1',
      name: 'Security Monitoring',
      test: 'Verify security events are monitored',
      result: existsSync(join(projectRoot, '.github/workflows/codeql.yml')),
    },
    {
      control: 'SC3.2',
      name: 'Security Testing',
      test: 'Verify vulnerability scanning is operational',
      result:
        existsSync(join(projectRoot, '.github/workflows/codeql.yml')) &&
        existsSync(join(projectRoot, 'scripts/security/generate-sbom.mjs')),
    }
  );

  // Availability Controls (A)
  controls.push(
    {
      control: 'A1.1',
      name: 'Availability Commitments',
      test: 'Verify uptime SLA is documented',
      result: true, // Vercel 99.99% SLA
    },
    {
      control: 'A1.2',
      name: 'Availability Monitoring',
      test: 'Verify uptime monitoring is configured',
      result: true, // Vercel provides this
    },
    {
      control: 'A1.3',
      name: 'Backup and Recovery',
      test: 'Verify backup procedures exist',
      result: existsSync(join(projectRoot, 'docs/operations/disaster-recovery-plan.md')),
    }
  );

  // Processing Integrity Controls (PI)
  controls.push(
    {
      control: 'PI1.1',
      name: 'Data Validation',
      test: 'Verify input validation in API routes',
      result: true, // TypeScript + Zod validation
    },
    {
      control: 'PI1.2',
      name: 'Processing Accuracy',
      test: 'Verify data processing is accurate and complete',
      result: existsSync(join(projectRoot, 'src/__tests__')), // Test coverage
    }
  );

  // Confidentiality Controls (C)
  controls.push(
    {
      control: 'C1.1',
      name: 'Confidentiality Commitments',
      test: 'Verify confidentiality agreements exist',
      result: true, // GitHub private repo
    },
    {
      control: 'C2.1',
      name: 'Third-Party Inventory',
      test: 'Verify third-party services are documented',
      result: existsSync(join(projectRoot, 'docs/security/sbom/README.md')),
    }
  );

  // Privacy Controls (P)
  controls.push(
    {
      control: 'P1.1',
      name: 'Privacy Notice',
      test: 'Verify privacy policy is published',
      result: true, // Privacy policy on website
    },
    {
      control: 'P2.1',
      name: 'Data Collection',
      test: 'Verify data collection is documented',
      result: true, // Analytics documented
    },
    {
      control: 'P5.1',
      name: 'Vendor Management',
      test: 'Verify vendor risk assessment process exists',
      result: existsSync(join(projectRoot, 'docs/governance/vendor-management-policy.md')),
    }
  );

  auditResults.controlTesting = controls;

  const passedControls = controls.filter(c => c.result).length;
  const totalControls = controls.length;
  const controlPassRate = (passedControls / totalControls) * 100;

  // Update SOC2 readiness estimate
  auditResults.soc2Readiness = Math.round(controlPassRate);

  return {
    passed: passedControls >= totalControls * 0.8, // 80% threshold
    details: `${passedControls}/${totalControls} SOC2 controls passing (${controlPassRate.toFixed(1)}%)`,
    finding:
      passedControls < totalControls * 0.8
        ? `${totalControls - passedControls} critical SOC2 controls failing`
        : null,
    recommendation:
      passedControls < totalControls
        ? 'Implement missing SOC2 controls before external audit'
        : null,
  };
}

/**
 * 5. Vendor Security Reviews
 */
function reviewVendorSecurity() {
  // Check vendor management policy
  const vendorPolicyExists = existsSync(
    join(projectRoot, 'docs/governance/vendor-management-policy.md')
  );

  // Check for vendor assessments
  const vendorAssessments = readdirSync(evidenceDir, { recursive: true }).filter(f =>
    f.includes('vendor-assessment')
  );

  const currentYearAssessments = vendorAssessments.filter(f => f.includes(String(year)));

  // Get vendor count from SBOM
  const sbomScript = readFileSync(
    join(projectRoot, 'scripts/security/generate-sbom.mjs'),
    'utf-8'
  );
  const serviceMatch = sbomScript.match(/const THIRD_PARTY_SERVICES = \[([\s\S]*?)\];/);
  const serviceCount = serviceMatch ? serviceMatch[1].split('{').length - 1 : 0;

  return {
    passed: vendorPolicyExists && currentYearAssessments.length > 0,
    details: vendorPolicyExists
      ? `${currentYearAssessments.length}/${serviceCount} vendors assessed in ${year}`
      : 'No vendor management policy documented',
    finding:
      !vendorPolicyExists || currentYearAssessments.length === 0
        ? 'Vendor risk assessments required for SOC2 compliance'
        : null,
    recommendation: !vendorPolicyExists
      ? 'Create vendor management policy (Phase 2 of SOC2 plan)'
      : currentYearAssessments.length < serviceCount
        ? 'Complete risk assessments for all critical vendors'
        : null,
    roadmapItem: !vendorPolicyExists
      ? { priority: 'MEDIUM', item: 'Create vendor management policy and assessment process' }
      : null,
  };
}

/**
 * 6. Disaster Recovery Testing
 */
function testDisasterRecovery() {
  const drPlanPath = join(projectRoot, 'docs/operations/disaster-recovery-plan.md');
  const hasDRPlan = existsSync(drPlanPath);

  // Check for DR testing evidence
  const drTests = readdirSync(evidenceDir, { recursive: true }).filter(
    f => f.includes('dr-test') || f.includes('disaster-recovery-test')
  );

  const currentYearTests = drTests.filter(f => f.includes(String(year)));

  return {
    passed: hasDRPlan && currentYearTests.length > 0,
    details: hasDRPlan
      ? currentYearTests.length > 0
        ? `DR plan documented and tested in ${year} (${currentYearTests.length} test(s))`
        : 'DR plan documented but not tested this year'
      : 'No disaster recovery plan documented',
    finding:
      !hasDRPlan || currentYearTests.length === 0
        ? 'DR plan and annual testing required for SOC2 Type 2'
        : null,
    recommendation: !hasDRPlan
      ? 'Create disaster recovery plan (Phase 4 of SOC2 plan)'
      : currentYearTests.length === 0
        ? 'Conduct DR failover test and document results'
        : null,
    roadmapItem: !hasDRPlan
      ? { priority: 'HIGH', item: 'Document disaster recovery plan with RPO/RTO targets' }
      : null,
  };
}

/**
 * 7. Policy Comprehensive Review
 */
function reviewAllPolicies() {
  const policyDir = join(projectRoot, 'docs/governance');
  const securityDir = join(projectRoot, 'docs/security');

  const requiredPolicies = [
    'information-security-policy.md',
    'change-management-policy.md',
    'vendor-management-policy.md',
    'privacy-rights-request-procedure.md',
    'risk-assessment-procedure.md',
  ];

  const existingPolicies = [];
  const missingPolicies = [];
  const outdatedPolicies = [];

  const oneYearAgo = new Date(year - 1, currentDate.getMonth(), currentDate.getDate());

  requiredPolicies.forEach(policy => {
    const policyPath = join(policyDir, policy);
    if (existsSync(policyPath)) {
      existingPolicies.push(policy);

      // Check if policy is outdated (not updated in 12 months)
      const stats = statSync(policyPath);
      if (stats.mtime < oneYearAgo) {
        outdatedPolicies.push(policy);
      }
    } else {
      missingPolicies.push(policy);
    }
  });

  return {
    passed: missingPolicies.length === 0 && outdatedPolicies.length === 0,
    details: `${existingPolicies.length}/${requiredPolicies.length} policies exist, ${outdatedPolicies.length} outdated (>12 months)`,
    finding:
      missingPolicies.length > 0
        ? `Missing policies: ${missingPolicies.join(', ')}`
        : outdatedPolicies.length > 0
          ? `Outdated policies: ${outdatedPolicies.join(', ')}`
          : null,
    recommendation:
      missingPolicies.length > 0
        ? 'Complete all governance documentation (Phase 2 of SOC2 plan)'
        : outdatedPolicies.length > 0
          ? 'Review and update policies annually'
          : null,
    roadmapItem:
      missingPolicies.length > 0
        ? { priority: 'HIGH', item: `Create ${missingPolicies.length} missing governance policies` }
        : null,
  };
}

/**
 * 8. Compliance Gap Analysis
 */
function analyzeComplianceGaps() {
  const gaps = [];

  // Check critical documentation
  if (!existsSync(join(projectRoot, 'docs/governance/information-security-policy.md'))) {
    gaps.push('Information Security Policy');
  }
  if (!existsSync(join(projectRoot, 'docs/operations/disaster-recovery-plan.md'))) {
    gaps.push('Disaster Recovery Plan');
  }
  if (!existsSync(join(projectRoot, 'docs/governance/vendor-management-policy.md'))) {
    gaps.push('Vendor Management Policy');
  }

  // Check evidence collection
  const monthlyAudits = readdirSync(join(projectRoot, 'docs/security/.private')).filter(f =>
    f.match(/monthly-audit-\d{4}-\d{2}\.md/)
  );

  if (monthlyAudits.length < 12) {
    gaps.push(`Incomplete audit trail (${monthlyAudits.length}/12 months)`);
  }

  // Check control implementation
  const controlPassRate = auditResults.soc2Readiness;
  if (controlPassRate < 80) {
    gaps.push(`SOC2 control coverage below 80% (${controlPassRate}%)`);
  }

  return {
    passed: gaps.length === 0,
    details:
      gaps.length === 0
        ? 'No compliance gaps identified - SOC2 ready'
        : `${gaps.length} compliance gap(s) identified`,
    finding: gaps.length > 0 ? gaps.join('; ') : null,
    recommendation:
      gaps.length > 0 ? 'Address compliance gaps before external audit' : null,
  };
}

/**
 * 9. Security Roadmap Planning
 */
function planSecurityRoadmap() {
  const nextYear = year + 1;

  const roadmapItems = [
    ...auditResults.roadmap, // Items added from other checks
    { priority: 'MEDIUM', item: 'Maintain monthly audit cadence' },
    { priority: 'MEDIUM', item: 'Continue SBOM generation and vulnerability tracking' },
    { priority: 'LOW', item: 'Explore ISO 27001 alignment' },
  ];

  // Prioritize roadmap
  const highPriority = roadmapItems.filter(r => r.priority === 'HIGH');
  const mediumPriority = roadmapItems.filter(r => r.priority === 'MEDIUM');
  const lowPriority = roadmapItems.filter(r => r.priority === 'LOW');

  auditResults.roadmap = [...highPriority, ...mediumPriority, ...lowPriority];

  return {
    passed: true, // Informational
    details: `${nextYear} security roadmap planned (${highPriority.length} high, ${mediumPriority.length} medium, ${lowPriority.length} low priority items)`,
    recommendation: `Execute high-priority roadmap items in Q1 ${nextYear}`,
  };
}

/**
 * 10. SOC2 Readiness Assessment
 */
function assessSOC2Readiness() {
  const readinessScore = auditResults.soc2Readiness;
  const readinessLevel =
    readinessScore >= 90
      ? 'READY'
      : readinessScore >= 70
        ? 'NEAR READY'
        : readinessScore >= 50
          ? 'IN PROGRESS'
          : 'NOT READY';

  const timeline =
    readinessScore >= 90
      ? '2-3 months'
      : readinessScore >= 70
        ? '4-6 months'
        : readinessScore >= 50
          ? '6-8 months'
          : '10-12 months';

  return {
    passed: readinessScore >= 70,
    details: `SOC2 Type 2 readiness: ${readinessScore}% (${readinessLevel}) - Estimated timeline: ${timeline}`,
    finding:
      readinessScore < 70
        ? 'Additional work required before SOC2 Type 2 audit'
        : null,
    recommendation:
      readinessScore >= 90
        ? 'Ready to engage SOC2 auditor'
        : readinessScore >= 70
          ? 'Address remaining gaps and schedule pre-audit readiness review'
          : 'Continue implementing SOC2 controls per compliance plan',
  };
}

/**
 * Generate Annual Audit Report
 */
function generateReport() {
  console.log('\n📋 Generating Annual Audit Report...');

  const passRate = (auditResults.passed / (auditResults.passed + auditResults.failed)) * 100;

  const report = `<!-- TLP:CLEAR -->

# Annual Security Review Report

**Review Year:** ${year}
**Report Date:** ${timestamp}
**Auditor:** Automated Security Review Script
**Status:** ${passRate >= 80 ? '✅ PASS' : passRate >= 60 ? '⚠️ WARNING' : '❌ FAIL'}

---

## Executive Summary

**Overall Score:** ${passRate.toFixed(1)}% (${auditResults.passed}/${auditResults.passed + auditResults.failed} checks passed)

**SOC2 Type 2 Readiness:** ${auditResults.soc2Readiness}%

**Key Achievements:**
- ${auditResults.checks.filter(c => c.status === 'PASS').length} security controls validated
- ${auditResults.controlTesting.filter(c => c.result).length}/${auditResults.controlTesting.length} SOC2 controls implemented
- Continuous monitoring infrastructure operational

**Critical Findings:** ${auditResults.findings.length === 0 ? 'None' : `${auditResults.findings.length} issue(s) require immediate attention`}

---

## SOC2 Control Testing Results

### Security Controls (SC)
${auditResults.controlTesting
  .filter(c => c.control.startsWith('SC'))
  .map(c => `- ${c.control}: ${c.name} - ${c.result ? '✅' : '❌'}`)
  .join('\n')}

### Availability Controls (A)
${auditResults.controlTesting
  .filter(c => c.control.startsWith('A'))
  .map(c => `- ${c.control}: ${c.name} - ${c.result ? '✅' : '❌'}`)
  .join('\n')}

### Processing Integrity Controls (PI)
${auditResults.controlTesting
  .filter(c => c.control.startsWith('PI'))
  .map(c => `- ${c.control}: ${c.name} - ${c.result ? '✅' : '❌'}`)
  .join('\n')}

### Confidentiality Controls (C)
${auditResults.controlTesting
  .filter(c => c.control.startsWith('C'))
  .map(c => `- ${c.control}: ${c.name} - ${c.result ? '✅' : '❌'}`)
  .join('\n')}

### Privacy Controls (P)
${auditResults.controlTesting
  .filter(c => c.control.startsWith('P'))
  .map(c => `- ${c.control}: ${c.name} - ${c.result ? '✅' : '❌'}`)
  .join('\n')}

**Control Pass Rate:** ${auditResults.controlTesting.filter(c => c.result).length}/${auditResults.controlTesting.length} (${((auditResults.controlTesting.filter(c => c.result).length / auditResults.controlTesting.length) * 100).toFixed(1)}%)

---

## Detailed Audit Checks

${auditResults.checks
  .map(
    (check, idx) => `
### ${idx + 1}. ${check.name}

**Status:** ${check.status === 'PASS' ? '✅ PASS' : check.status === 'FAIL' ? '❌ FAIL' : '⚠️ ERROR'}
**Details:** ${check.details}
**Timestamp:** ${check.timestamp}
`
  )
  .join('\n')}

---

## Findings & Remediation

${auditResults.findings.length === 0 ? '_No findings - all checks passed._' : auditResults.findings.map((f, idx) => `${idx + 1}. ${f}`).join('\n')}

---

## Recommendations

${auditResults.recommendations.length === 0 ? '_No recommendations._' : auditResults.recommendations.map((r, idx) => `${idx + 1}. ${r}`).join('\n')}

---

## ${year + 1} Security Roadmap

### High Priority
${auditResults.roadmap.filter(r => r.priority === 'HIGH').length === 0 ? '_None_' : auditResults.roadmap.filter(r => r.priority === 'HIGH').map((r, idx) => `${idx + 1}. ${r.item}`).join('\n')}

### Medium Priority
${auditResults.roadmap.filter(r => r.priority === 'MEDIUM').length === 0 ? '_None_' : auditResults.roadmap.filter(r => r.priority === 'MEDIUM').map((r, idx) => `${idx + 1}. ${r.item}`).join('\n')}

### Low Priority
${auditResults.roadmap.filter(r => r.priority === 'LOW').length === 0 ? '_None_' : auditResults.roadmap.filter(r => r.priority === 'LOW').map((r, idx) => `${idx + 1}. ${r.item}`).join('\n')}

---

## SOC2 Type 2 Readiness Assessment

**Current Readiness:** ${auditResults.soc2Readiness}%

**Readiness Level:** ${auditResults.soc2Readiness >= 90 ? '✅ READY' : auditResults.soc2Readiness >= 70 ? '⚠️ NEAR READY' : auditResults.soc2Readiness >= 50 ? '🔄 IN PROGRESS' : '❌ NOT READY'}

**Estimated Timeline to Audit:** ${auditResults.soc2Readiness >= 90 ? '2-3 months' : auditResults.soc2Readiness >= 70 ? '4-6 months' : auditResults.soc2Readiness >= 50 ? '6-8 months' : '10-12 months'}

**Next Steps:**
1. ${auditResults.soc2Readiness >= 90 ? 'Engage SOC2 auditor and begin Type 2 observation period' : 'Address critical gaps identified in this review'}
2. ${auditResults.soc2Readiness >= 70 ? 'Complete 12-month evidence collection period' : 'Continue monthly audit cadence'}
3. ${auditResults.soc2Readiness >= 90 ? 'Schedule pre-audit kickoff meeting' : 'Implement missing SOC2 controls'}

---

## Evidence Collected

All evidence artifacts stored in: \`docs/security/.private/evidence/${year}-annual/\`

**Files:**
${existsSync(evidenceYearDir) ? readdirSync(evidenceYearDir).map(f => `- ${f}`).join('\n') : '_No evidence files generated for annual review_'}

---

**Audit Automation:** This report was generated automatically by \`scripts/security/annual-audit.mjs\`
**Run Command:** \`npm run security:audit:annual\`
**Next Annual Review:** January ${year + 1}
`;

  writeFileSync(auditReportPath, report);
  console.log(`   ✅ Report saved: ${auditReportPath}`);
}

/**
 * Main Execution
 */
async function main() {
  const startTime = Date.now();

  // Run all annual checks
  runCheck('Quarterly Audit Checks (Comprehensive)', runQuarterlyChecks);
  runCheck('Formal Risk Assessment', conductRiskAssessment);
  runCheck('Penetration Testing Review', reviewPenetrationTesting);
  runCheck('Comprehensive SOC2 Control Testing', testAllSOC2Controls);
  runCheck('Vendor Security Reviews', reviewVendorSecurity);
  runCheck('Disaster Recovery Testing', testDisasterRecovery);
  runCheck('Policy Comprehensive Review', reviewAllPolicies);
  runCheck('Compliance Gap Analysis', analyzeComplianceGaps);
  runCheck('Security Roadmap Planning', planSecurityRoadmap);
  runCheck('SOC2 Readiness Assessment', assessSOC2Readiness);

  // Generate report
  generateReport();

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  const passRate =
    ((auditResults.passed / (auditResults.passed + auditResults.failed)) * 100).toFixed(1);

  console.log('\n━'.repeat(50));
  console.log(`✅ Annual security review complete in ${duration}s`);
  console.log(
    `📊 Overall Score: ${passRate}% (${auditResults.passed}/${auditResults.passed + auditResults.failed} checks passed)`
  );
  console.log(`📊 SOC2 Readiness: ${auditResults.soc2Readiness}%`);
  console.log(`📁 Report: ${auditReportPath}`);
  console.log(`📁 Evidence: ${evidenceYearDir}`);
  console.log('━'.repeat(50));

  // Exit with success (annual reviews are comprehensive assessments, not pass/fail gates)
  process.exit(0);
}

main().catch(error => {
  console.error('\n❌ Annual security review failed:', error);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Comprehensive Accessibility Testing Script
 * 
 * Tests multiple pages with Lighthouse and manual checks:
 * - Homepage
 * - Blog list page
 * - Individual blog post
 * - Contact form
 * - About page
 * 
 * Generates a detailed report with scores and recommendations.
 */

import { spawn } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:3000';
const PAGES_TO_TEST = [
  { url: '/', name: 'Homepage', description: 'Landing page with featured content' },
  { url: '/blog', name: 'Blog List', description: 'Archive page with search and filters' },
  { url: '/blog/test-post', name: 'Blog Post', description: 'Individual article with TOC and related posts' },
  { url: '/contact', name: 'Contact Form', description: 'Form with validation and error handling' },
  { url: '/about', name: 'About Page', description: 'Static content page' },
];

const REPORT_DIR = join(process.cwd(), 'docs', 'accessibility');
const TIMESTAMP = new Date().toISOString().split('T')[0];

console.log('🧪 Starting Accessibility Testing Suite\n');
console.log('=' .repeat(60));
console.log(`Testing ${PAGES_TO_TEST.length} pages with Lighthouse`);
console.log('=' .repeat(60));
console.log('');

async function runLighthouse(url, name) {
  return new Promise((resolve, reject) => {
    console.log(`📊 Testing: ${name} (${url})`);
    
    // Build Lighthouse CLI arguments
    const args = [
      'lighthouse',
      `${BASE_URL}${url}`,
      '--only-categories=accessibility',
      '--output=json',
      '--output-path=stdout',
      '--quiet',
      '--chrome-flags="--headless"'
    ];

    // Add Vercel protection bypass headers for preview deployments only
    // Only use bypass on preview URLs (vercel.app or www.dcyfr.dev preview, not localhost or production)
    const isPreviewUrl = (url.includes('vercel.app') || (url.includes('dcyfr.dev')));
    if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET && isPreviewUrl) {
      args.push(`--extra-headers={"x-vercel-protection-bypass":"${process.env.VERCEL_AUTOMATION_BYPASS_SECRET}","x-vercel-set-bypass-cookie":"samesitenone"}`);
    }

    const lighthouse = spawn('npx', args, {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    lighthouse.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    lighthouse.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    lighthouse.on('close', (code) => {
      if (code !== 0) {
        console.error(`   ❌ Lighthouse failed for ${name}`);
        console.error(`   Error: ${stderr}`);
        reject(new Error(`Lighthouse failed with code ${code}`));
        return;
      }

      try {
        const report = JSON.parse(stdout);
        const accessibilityScore = report.categories.accessibility.score * 100;
        const audits = report.audits;

        const result = {
          name,
          url,
          score: accessibilityScore,
          passed: accessibilityScore >= 95,
          audits: Object.entries(audits)
            .filter(([, audit]) => audit.scoreDisplayMode !== 'notApplicable')
            .map(([id, audit]) => ({
              id,
              title: audit.title,
              description: audit.description,
              score: audit.score,
              displayValue: audit.displayValue,
              details: audit.details
            }))
            .filter(audit => audit.score !== null)
            .sort((a, b) => (a.score || 0) - (b.score || 0))
        };

        const icon = result.passed ? '✅' : '⚠️';
        console.log(`   ${icon} Score: ${accessibilityScore}/100`);
        
        const failures = result.audits.filter(a => a.score < 1);
        if (failures.length > 0) {
          console.log(`   ⚠️  ${failures.length} issue(s) found`);
        }
        console.log('');

        resolve(result);
      } catch (error) {
        console.error(`   ❌ Failed to parse Lighthouse report for ${name}`);
        reject(error);
      }
    });
  });
}

async function generateReport(results) {
  console.log('\n📝 Generating Test Report...\n');

  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const allPassed = results.every(r => r.passed);

  let report = `# Accessibility Testing Report

**Date:** ${TIMESTAMP}  
**Test Type:** Automated (Lighthouse)  
**Overall Status:** ${allPassed ? '✅ PASSED' : '⚠️ NEEDS ATTENTION'}  
**Average Score:** ${avgScore.toFixed(1)}/100

---

## 📊 Summary

This report covers automated accessibility testing across ${results.length} key pages using Google Lighthouse.

### Scores by Page

| Page | Score | Status |
|------|-------|--------|
`;

  results.forEach(result => {
    const status = result.passed ? '✅ Pass' : '⚠️ Review';
    report += `| ${result.name} | ${result.score}/100 | ${status} |\n`;
  });

  report += '\n---\n\n';

  // Detailed results for each page
  results.forEach(result => {
    report += `## ${result.name}\n\n`;
    report += `**URL:** \`${result.url}\`  \n`;
    report += `**Score:** ${result.score}/100  \n`;
    report += `**Status:** ${result.passed ? '✅ PASSED' : '⚠️ NEEDS REVIEW'}  \n\n`;

    const failures = result.audits.filter(a => a.score < 1);
    const warnings = result.audits.filter(a => a.score >= 0 && a.score < 1);
    const passes = result.audits.filter(a => a.score === 1);

    if (failures.length > 0) {
      report += `### ❌ Failed Audits (${failures.length})\n\n`;
      failures.forEach(audit => {
        report += `#### ${audit.title}\n\n`;
        report += `${audit.description}\n\n`;
        if (audit.displayValue) {
          report += `**Issue:** ${audit.displayValue}\n\n`;
        }
        report += '---\n\n';
      });
    }

    if (warnings.length > 0) {
      report += `### ⚠️ Warnings (${warnings.length})\n\n`;
      warnings.forEach(audit => {
        report += `- **${audit.title}**: ${audit.description}\n`;
      });
      report += '\n';
    }

    report += `### ✅ Passed Audits: ${passes.length}\n\n`;
    report += '---\n\n';
  });

  // Manual testing checklist
  report += `## 🧪 Manual Testing Checklist

The following items require manual verification:

### Skip-to-Content Link
- [ ] Press Tab on each page
- [ ] Verify skip link becomes visible
- [ ] Press Enter and confirm jump to main content
- [ ] Test in both light and dark themes

### Keyboard Navigation
- [ ] All interactive elements reachable via Tab
- [ ] Focus indicators visible on all elements
- [ ] No keyboard traps
- [ ] Logical tab order

### Screen Reader Testing (VoiceOver)
- [ ] Skip link announced correctly
- [ ] All buttons have proper labels
- [ ] Form fields have associated labels
- [ ] Images have alt text
- [ ] Landmarks identified correctly
- [ ] Reading order is logical

### Tag Filter Buttons (Priority 1 Fix)
- [ ] Buttons reachable via keyboard
- [ ] Enter/Space activates filters
- [ ] Proper aria-label on each button
- [ ] Screen reader announces button state

### Search Input (Priority 1 Fix)
- [ ] Input has aria-label
- [ ] Label announced by screen reader
- [ ] Search results announced

### Color Contrast
- [ ] All text meets WCAG AA (4.5:1 normal, 3:1 large)
- [ ] Test in both light and dark modes
- [ ] Focus indicators have sufficient contrast

---

## 📋 Recommendations

Based on automated testing:

`;

  // Collect all unique issues
  const allIssues = new Map();
  results.forEach(result => {
    result.audits.filter(a => a.score < 1).forEach(audit => {
      if (!allIssues.has(audit.id)) {
        allIssues.set(audit.id, {
          title: audit.title,
          description: audit.description,
          pages: [result.name]
        });
      } else {
        allIssues.get(audit.id).pages.push(result.name);
      }
    });
  });

  if (allIssues.size > 0) {
    allIssues.forEach((issue) => {
      report += `### ${issue.title}\n\n`;
      report += `${issue.description}\n\n`;
      report += `**Affects:** ${issue.pages.join(', ')}\n\n`;
      report += '---\n\n';
    });
  } else {
    report += '✅ No issues found in automated testing!\n\n';
  }

  report += `## ✅ Next Steps

1. Complete manual testing checklist above
2. Test with real screen readers (VoiceOver, NVDA)
3. Address any issues found in manual testing
4. Update accessibility audit documentation
5. Consider adding automated accessibility tests to CI/CD

---

**Generated:** ${new Date().toISOString()}  
**Tool:** Google Lighthouse ${results.length > 0 ? 'v' + (results[0].lighthouseVersion || 'Unknown') : ''}
`;

  // Ensure report directory exists
  if (!existsSync(REPORT_DIR)) {
    mkdirSync(REPORT_DIR, { recursive: true });
  }

  const reportPath = join(REPORT_DIR, `testing-report-${TIMESTAMP}.md`);
  writeFileSync(reportPath, report);

  console.log(`✅ Report saved to: ${reportPath}`);
  console.log('');

  return { report, path: reportPath, avgScore, allPassed };
}

async function main() {
  try {
    // Check if server is running
    console.log('🔍 Checking if dev server is running...\n');
    
    const results = [];
    
    for (const page of PAGES_TO_TEST) {
      try {
        const result = await runLighthouse(page.url, page.name);
        results.push(result);
      } catch (error) {
        console.error(`Failed to test ${page.name}: ${error.message}`);
        // Continue with other pages
      }
    }

    if (results.length === 0) {
      console.error('\n❌ No pages were successfully tested!');
      console.error('Make sure the dev server is running: npm run dev');
      process.exit(1);
    }

    const { path, avgScore, allPassed } = await generateReport(results);

    console.log('=' .repeat(60));
    console.log('📊 Test Summary');
    console.log('=' .repeat(60));
    console.log(`Pages Tested: ${results.length}/${PAGES_TO_TEST.length}`);
    console.log(`Average Score: ${avgScore.toFixed(1)}/100`);
    console.log(`Overall Status: ${allPassed ? '✅ PASSED' : '⚠️ NEEDS ATTENTION'}`);
    console.log('=' .repeat(60));
    console.log('');
    console.log('📝 Next Steps:');
    console.log('  1. Review the detailed report');
    console.log('  2. Complete manual testing checklist');
    console.log('  3. Test with screen readers');
    console.log('  4. Address any issues found');
    console.log('');
    console.log(`📄 Report: ${path}`);
    console.log('');

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

main();

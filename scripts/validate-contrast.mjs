#!/usr/bin/env node

/**
 * Automated Color Contrast Validation
 *
 * Validates WCAG 2.1 color contrast requirements across the site.
 * Reports violations with specific recommendations.
 *
 * WCAG 2.1 Level AA Requirements (Baseline):
 * - Normal text: 4.5:1 contrast ratio minimum
 * - Large text (18pt/14pt bold+): 3:1 minimum
 * - UI components and graphics: 3:1 minimum
 *
 * WCAG 2.1 Level AAA Requirements (Enhanced):
 * - Normal text: 7:1 contrast ratio
 * - Large text: 4.5:1 minimum
 *
 * @see Modern UI/UX Design Standards Report (2025)
 * @see https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
 */

import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Pages to test (expand as needed)
 */
const pagesToTest = [
  { url: 'http://localhost:3000', name: 'Homepage' },
  { url: 'http://localhost:3000/about', name: 'About' },
  { url: 'http://localhost:3000/blog', name: 'Blog Archive' },
  { url: 'http://localhost:3000/activity', name: 'Activity Feed' },
  { url: 'http://localhost:3000/contact', name: 'Contact' },
];

/**
 * Formats axe violation for readable output
 */
function formatViolation(violation) {
  const { id, impact, description, nodes, helpUrl } = violation;

  return `
${colors.red}${colors.bright}⚠ ${id}${colors.reset} ${colors.yellow}[${impact}]${colors.reset}
  ${description}

  ${colors.cyan}Affected elements (${nodes.length}):${colors.reset}
${nodes
  .map(
    (node, idx) => `  ${idx + 1}. ${node.html.substring(0, 100)}${
      node.html.length > 100 ? '...' : ''
    }
     Target: ${node.target.join(' > ')}
     ${node.failureSummary}
  `
  )
  .join('\n')}

  ${colors.blue}Learn more: ${helpUrl}${colors.reset}
`;
}

/**
 * Main validation function
 */
async function validateContrast() {
  console.log(
    `${colors.bright}${colors.cyan}\n╔══════════════════════════════════════════════╗${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.cyan}║  WCAG 2.1 Color Contrast Validation         ║${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.cyan}╚══════════════════════════════════════════════╝${colors.reset}\n`
  );

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let totalViolations = 0;
  const results = [];

  for (const pageToTest of pagesToTest) {
    console.log(
      `${colors.bright}Testing: ${pageToTest.name} (${pageToTest.url})${colors.reset}`
    );

    try {
      await page.goto(pageToTest.url, { waitUntil: 'networkidle' });

      // Run axe accessibility tests with focus on color contrast
      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .include('body')
        .analyze();

      // Filter for color contrast violations
      const contrastViolations = axeResults.violations.filter(
        (v) =>
          v.id === 'color-contrast' ||
          v.id === 'color-contrast-enhanced' ||
          v.id === 'link-in-text-block'
      );

      if (contrastViolations.length === 0) {
        console.log(
          `  ${colors.green}✓ No contrast violations found${colors.reset}\n`
        );
      } else {
        console.log(
          `  ${colors.red}✗ Found ${contrastViolations.length} contrast violation(s)${colors.reset}`
        );
        contrastViolations.forEach((violation) => {
          console.log(formatViolation(violation));
        });

        totalViolations += contrastViolations.reduce(
          (sum, v) => sum + v.nodes.length,
          0
        );
      }

      results.push({
        page: pageToTest.name,
        url: pageToTest.url,
        violations: contrastViolations.length,
        nodes: contrastViolations.reduce((sum, v) => sum + v.nodes.length, 0),
      });
    } catch (error) {
      console.error(
        `  ${colors.red}✗ Error testing ${pageToTest.name}: ${error.message}${colors.reset}\n`
      );
      results.push({
        page: pageToTest.name,
        url: pageToTest.url,
        error: error.message,
      });
    }
  }

  await browser.close();

  // Summary report
  console.log(
    `${colors.bright}${colors.cyan}\n╔══════════════════════════════════════════════╗${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.cyan}║  Summary Report                              ║${colors.reset}`
  );
  console.log(
    `${colors.bright}${colors.cyan}╚══════════════════════════════════════════════╝${colors.reset}\n`
  );

  results.forEach((result) => {
    if (result.error) {
      console.log(
        `${colors.red}✗ ${result.page}: Error (${result.error})${colors.reset}`
      );
    } else if (result.nodes === 0) {
      console.log(
        `${colors.green}✓ ${result.page}: No violations${colors.reset}`
      );
    } else {
      console.log(
        `${colors.yellow}⚠ ${result.page}: ${result.violations} violation(s), ${result.nodes} affected element(s)${colors.reset}`
      );
    }
  });

  console.log();

  if (totalViolations > 0) {
    console.log(
      `${colors.red}${colors.bright}Total contrast violations: ${totalViolations}${colors.reset}`
    );
    console.log(
      `${colors.yellow}Please fix the violations above to meet WCAG 2.1 AA standards.${colors.reset}\n`
    );
    process.exit(1);
  } else {
    console.log(
      `${colors.green}${colors.bright}✓ All pages pass WCAG 2.1 AA contrast requirements!${colors.reset}\n`
    );
    process.exit(0);
  }
}

// Check if dev server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
}

// Main execution
(async () => {
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.error(
      `${colors.red}${colors.bright}Error: Development server not running${colors.reset}`
    );
    console.log(
      `${colors.yellow}Please start the dev server first:${colors.reset}`
    );
    console.log(`  ${colors.cyan}npm run dev${colors.reset}\n`);
    process.exit(1);
  }

  await validateContrast();
})();

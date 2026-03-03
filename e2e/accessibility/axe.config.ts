/**
 * Axe-core Accessibility Testing Configuration
 * WCAG 2.1 AA Standard (Target: 100% compliance)
 *
 * Phase 2 Task 2.1 - Design System Refactor
 */

import { AxeResults, RunOptions } from 'axe-core';

/**
 * Axe-core runner configuration
 * Standard: WCAG 2.1 Level AA
 */
export const axeConfig: RunOptions = {
  // WCAG 2.1 AA rules
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  },

  // Rules to enable
  rules: {
    // Color contrast (WCAG 2.1 AA requires 4.5:1 for normal text, 3:1 for large)
    'color-contrast': { enabled: true },

    // Keyboard accessibility
    'keyboard-accessible': { enabled: true },
    'focus-order-semantics': { enabled: true },

    // Screen reader support
    'aria-allowed-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'aria-valid-attr-value': { enabled: true },

    // Semantic HTML
    'button-name': { enabled: true },
    'link-name': { enabled: true },
    'image-alt': { enabled: true },
    label: { enabled: true },

    // Forms
    'form-field-multiple-labels': { enabled: true },
    'input-button-name': { enabled: true },

    // Navigation
    'landmark-one-main': { enabled: true },
    'page-has-heading-one': { enabled: true },
    bypass: { enabled: true },
  },

  // Reporter options
  reporter: 'v2',

  // Context options
  iframes: true, // Scan iframes
  ancestry: true, // Include ancestry in results
};

/**
 * Check if page passes accessibility audit
 * @param results - Axe scan results
 * @returns True if no violations found
 */
export function hasNoViolations(results: AxeResults): boolean {
  return results.violations.length === 0;
}

/**
 * Format violations for readable output
 * @param results - Axe scan results
 * @returns Formatted violation report
 */
export function formatViolations(results: AxeResults): string {
  if (results.violations.length === 0) {
    return '✅ No accessibility violations found';
  }

  let report = `❌ Found ${results.violations.length} accessibility violation(s):\n\n`;

  results.violations.forEach((violation, index) => {
    report += `${index + 1}. ${violation.id} [${violation.impact}]\n`;
    report += `   Description: ${violation.description}\n`;
    report += `   Help: ${violation.helpUrl}\n`;
    report += `   Affected elements: ${violation.nodes.length}\n`;

    violation.nodes.forEach((node, nodeIndex) => {
      report += `     ${nodeIndex + 1}. ${node.html}\n`;
      if (node.failureSummary) {
        report += `        ${node.failureSummary}\n`;
      }
    });

    report += '\n';
  });

  return report;
}

/**
 * Get critical violations only (critical + serious)
 * @param results - Axe scan results
 * @returns Filtered results with only critical/serious violations
 */
export function getCriticalViolations(results: AxeResults): AxeResults {
  return {
    ...results,
    violations: results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious'),
  };
}

/**
 * Axe-core tags for different WCAG levels
 */
export const WCAG_TAGS = {
  // WCAG 2.1 Level A (minimum)
  LEVEL_A: ['wcag2a', 'wcag21a'],

  // WCAG 2.1 Level AA (target)
  LEVEL_AA: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],

  // WCAG 2.1 Level AAA (aspirational)
  LEVEL_AAA: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa'],

  // Best practices (non-WCAG)
  BEST_PRACTICES: ['best-practice'],
} as const;

/**
 * Run axe scan with custom tags
 * @param page - Playwright page object
 * @param tags - WCAG tags to test
 * @returns Axe scan results
 */
export async function runAxeScan(
  page: any,
  tags: readonly string[] = WCAG_TAGS.LEVEL_AA
): Promise<AxeResults> {
  const { injectAxe, checkA11y } = await import('axe-playwright');

  // Inject axe-core into the page
  await injectAxe(page);

  // Run accessibility check with custom config
  const results = await checkA11y(page, undefined, {
    ...axeConfig,
    runOnly: {
      type: 'tag',
      values: [...tags],
    },
  });

  return results;
}

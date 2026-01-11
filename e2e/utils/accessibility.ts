import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Testing Utilities
 * 
 * Provides helpers for automated accessibility testing with axe-core.
 */

/**
 * Run comprehensive accessibility audit on current page
 * 
 * @param page - Playwright page instance
 * @param options - Configuration options
 * @returns Axe results with violations
 * 
 * @example
 * ```typescript
 * const violations = await runAccessibilityAudit(page);
 * expect(violations).toHaveLength(0);
 * ```
 */
export async function runAccessibilityAudit(
  page: Page,
  options?: {
    /** Include specific rules (default: all) */
    includedRules?: string[];
    /** Exclude specific rules */
    excludedRules?: string[];
    /** Only check specific elements */
    include?: string[];
    /** Exclude specific elements */
    exclude?: string[];
  }
) {
  let axeBuilder = new AxeBuilder({ page });
  
  // Apply rule filters
  if (options?.includedRules) {
    axeBuilder = axeBuilder.withRules(options.includedRules);
  }
  
  if (options?.excludedRules) {
    axeBuilder = axeBuilder.disableRules(options.excludedRules);
  }
  
  // Apply element filters
  if (options?.include) {
    axeBuilder = axeBuilder.include(options.include);
  }
  
  if (options?.exclude) {
    axeBuilder = axeBuilder.exclude(options.exclude);
  }
  
  const results = await axeBuilder.analyze();
  return results.violations;
}

/**
 * Check specific accessibility rule
 * 
 * @param page - Playwright page instance
 * @param rule - Axe rule ID to check
 * @returns Violations for that rule
 * 
 * @example
 * ```typescript
 * const violations = await checkAccessibilityRule(page, 'color-contrast');
 * expect(violations).toHaveLength(0);
 * ```
 */
export async function checkAccessibilityRule(
  page: Page,
  rule: string
) {
  return runAccessibilityAudit(page, { includedRules: [rule] });
}

/**
 * Common accessibility checks for all pages
 * 
 * @param page - Playwright page instance
 * @returns Object with violation counts by category
 */
export async function runCommonAccessibilityChecks(page: Page) {
  const violations = await runAccessibilityAudit(page);
  
  const categorized = {
    critical: violations.filter(v => v.impact === 'critical'),
    serious: violations.filter(v => v.impact === 'serious'),
    moderate: violations.filter(v => v.impact === 'moderate'),
    minor: violations.filter(v => v.impact === 'minor'),
  };
  
  return {
    violations,
    categorized,
    total: violations.length,
    hasCritical: categorized.critical.length > 0,
    hasSerious: categorized.serious.length > 0,
  };
}

/**
 * WCAG Level AA compliance check
 * 
 * @param page - Playwright page instance
 * @returns Violations that affect WCAG AA compliance
 */
export async function checkWCAGLevel(
  page: Page,
  level: 'A' | 'AA' | 'AAA' = 'AA'
) {
  const axeBuilder = new AxeBuilder({ page })
    .withTags([`wcag2${level.toLowerCase()}`]);
  
  const results = await axeBuilder.analyze();
  return results.violations;
}

/**
 * Format violations for readable error messages
 * 
 * @param violations - Axe violations array
 * @returns Formatted string for test output
 */
export function formatViolations(violations: any[]) {
  if (violations.length === 0) {
    return 'No accessibility violations found';
  }
  
  return violations.map(violation => {
    const nodes = violation.nodes
      .map((node: any) => `  - ${node.html}`)
      .join('\n');
    
    return `
${violation.id} (${violation.impact})
${violation.description}
Help: ${violation.helpUrl}
Elements:
${nodes}
`;
  }).join('\n---\n');
}

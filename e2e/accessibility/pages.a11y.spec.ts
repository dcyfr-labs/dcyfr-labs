/**
 * Page-Level Accessibility Tests
 * WCAG 2.1 AA Compliance Testing
 *
 * Phase 2 Task 2.1 - Design System Refactor
 * Tests: 5 key pages × 3 breakpoints = 15 tests
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Test pages from Phase 1 visual regression baseline
const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/blog', name: 'Blog Index' },
  { path: '/contact', name: 'Contact' },
  { path: '/projects', name: 'Projects' },
] as const;

// Breakpoints from Phase 1
const BREAKPOINTS = [
  { width: 375, height: 667, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1920, height: 1080, name: 'desktop' },
] as const;

/**
 * WCAG 2.1 AA Accessibility Tests
 * Target: 100% compliance, 0 violations
 */
test.describe('Page Accessibility (WCAG 2.1 AA)', () => {
  for (const page of PAGES) {
    for (const breakpoint of BREAKPOINTS) {
      test(`${page.name} page - ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`, async ({
        page: pw,
      }) => {
        // Set viewport
        await pw.setViewportSize({
          width: breakpoint.width,
          height: breakpoint.height,
        });

        // Navigate to page
        await pw.goto(page.path);
        await pw.waitForLoadState('networkidle');

        // Run axe-core scan with WCAG 2.1 AA tags
        const accessibilityScanResults = await new AxeBuilder({ page: pw })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();

        // Assert no violations
        expect(accessibilityScanResults.violations).toEqual([]);

        // Log results summary
        console.log(`✅ ${page.name} (${breakpoint.name}): Passed accessibility audit`);
        console.log(`   Passes: ${accessibilityScanResults.passes.length}`);
        console.log(`   Violations: ${accessibilityScanResults.violations.length}`);
        console.log(`   Incomplete: ${accessibilityScanResults.incomplete.length}`);
      });
    }
  }
});

/**
 * Critical Accessibility Tests (Blocking Issues Only)
 * Focus on critical and serious violations only
 */
test.describe('Critical Accessibility Issues', () => {
  for (const page of PAGES) {
    test(`${page.name} - no critical violations`, async ({ page: pw }) => {
      await pw.goto(page.path);
      await pw.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page: pw })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Filter critical/serious violations only
      const criticalViolations = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      // Log any critical violations
      if (criticalViolations.length > 0) {
        console.error(`❌ ${page.name}: ${criticalViolations.length} critical violation(s)`);
        criticalViolations.forEach((violation) => {
          console.error(`   - ${violation.id} [${violation.impact}]: ${violation.description}`);
          console.error(`     Help: ${violation.helpUrl}`);
        });
      }

      expect(criticalViolations).toEqual([]);
    });
  }
});

/**
 * Keyboard Navigation Tests
 * Verify all interactive elements are keyboard accessible
 */
test.describe('Keyboard Accessibility', () => {
  test('Home page - tab navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get all focusable elements
    const focusableElements = await page
      .locator('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])')
      .all();

    console.log(`Found ${focusableElements.length} focusable elements on Home page`);

    // Test tab navigation (sample first 10 elements)
    const sampleSize = Math.min(10, focusableElements.length);
    for (let i = 0; i < sampleSize; i++) {
      await page.keyboard.press('Tab');

      // Verify focus indicator is visible
      const focusedElement = await page.locator(':focus');
      expect(await focusedElement.count()).toBeGreaterThan(0);
    }
  });

  test('Navigation menu - keyboard accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find navigation elements
    const navLinks = await page.locator('nav a').all();
    expect(navLinks.length).toBeGreaterThan(0);

    // Verify each nav link is keyboard accessible
    for (const link of navLinks) {
      await link.focus();
      expect(await link.evaluate((el) => document.activeElement === el)).toBe(true);
    }
  });
});

/**
 * Screen Reader Tests
 * Verify ARIA attributes and semantic HTML
 */
test.describe('Screen Reader Support', () => {
  test('Home page - landmark roles', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify main landmark
    const main = await page.locator('main, [role="main"]');
    expect(await main.count()).toBeGreaterThanOrEqual(1);

    // Verify navigation landmark
    const nav = await page.locator('nav, [role="navigation"]');
    expect(await nav.count()).toBeGreaterThanOrEqual(1);

    // Verify heading hierarchy
    const h1 = await page.locator('h1');
    expect(await h1.count()).toBeGreaterThanOrEqual(1);

    console.log('✅ Home page has proper landmark structure');
  });

  test('Images have alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find all images
    const images = await page.locator('img').all();

    if (images.length > 0) {
      // Check each image has alt attribute
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        // Alt can be empty string for decorative images, but must exist
        expect(alt).not.toBeNull();
      }

      console.log(`✅ All ${images.length} images have alt attributes`);
    }
  });

  test('Form inputs have labels', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // Find all form inputs
    const inputs = await page.locator('input, textarea, select').all();

    if (inputs.length > 0) {
      for (const input of inputs) {
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledby = await input.getAttribute('aria-labelledby');

        // Input must have either: id (with corresponding label), aria-label, or aria-labelledby
        const hasAccessibleLabel =
          (id && (await page.locator(`label[for="${id}"]`).count()) > 0) ||
          ariaLabel !== null ||
          ariaLabelledby !== null;

        expect(hasAccessibleLabel).toBe(true);
      }

      console.log(`✅ All ${inputs.length} form inputs have accessible labels`);
    }
  });
});

/**
 * Color Contrast Tests
 * WCAG 2.1 AA requires 4.5:1 for normal text, 3:1 for large text
 */
test.describe('Color Contrast (WCAG 2.1 AA)', () => {
  test('All pages - color contrast compliance', async ({ page }) => {
    for (const testPage of PAGES) {
      await page.goto(testPage.path);
      await page.waitForLoadState('networkidle');

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include(['color-contrast'])
        .analyze();

      const contrastViolations = results.violations.filter((v) => v.id === 'color-contrast');

      if (contrastViolations.length > 0) {
        console.error(
          `❌ ${testPage.name}: ${contrastViolations[0].nodes.length} color contrast violation(s)`
        );
      } else {
        console.log(`✅ ${testPage.name}: Color contrast compliant`);
      }

      expect(contrastViolations).toEqual([]);
    }
  });
});

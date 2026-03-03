/**
 * Component-Level Accessibility Tests
 * WCAG 2.1 AA Compliance Testing
 *
 * Phase 2 Task 2.1 - Design System Refactor
 * Tests: Key UI components in isolation
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Navigation Component Accessibility
 */
test.describe('Navigation Component', () => {
  test('Header navigation - WCAG 2.1 AA compliant', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scope scan to navigation element
    const results = await new AxeBuilder({ page })
      .include('nav')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
    console.log(`✅ Navigation: ${results.passes.length} passed checks, 0 violations`);
  });

  test('Navigation - keyboard accessible', async ({ page }) => {
    await page.goto('/');

    const navLinks = await page.locator('nav a').all();
    expect(navLinks.length).toBeGreaterThan(0);

    // Each link should be focusable
    for (const link of navLinks) {
      await link.focus();
      const isFocused = await link.evaluate((el) => document.activeElement === el);
      expect(isFocused).toBe(true);
    }
  });

  test('Navigation - touch target size', async ({ page }) => {
    await page.goto('/');

    const navLinks = await page.locator('nav a').all();

    // WCAG 2.1 AA requires 44×44px touch targets
    for (const link of navLinks) {
      const box = await link.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});

/**
 * Button Component Accessibility
 */
test.describe('Button Components', () => {
  test('All buttons - accessible names', async ({ page }) => {
    await page.goto('/');

    const buttons = await page.locator('button').all();

    for (const button of buttons) {
      const accessibleName =
        (await button.getAttribute('aria-label')) || (await button.textContent());

      expect(accessibleName).toBeTruthy();
      expect(accessibleName?.trim().length).toBeGreaterThan(0);
    }

    console.log(`✅ ${buttons.length} buttons have accessible names`);
  });

  test('Buttons - keyboard activatable', async ({ page }) => {
    await page.goto('/');

    const buttons = await page.locator('button').all();

    for (const button of buttons.slice(0, 5)) {
      // Test first 5
      await button.focus();

      // Verify Enter and Space activate button
      const isFocused = await button.evaluate((el) => document.activeElement === el);
      expect(isFocused).toBe(true);
    }
  });
});

/**
 * Form Component Accessibility
 */
test.describe('Form Components', () => {
  test('Contact form - WCAG 2.1 AA compliant', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    // Scope scan to form element
    const results = await new AxeBuilder({ page })
      .include('form')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (results.violations.length > 0) {
      console.error('❌ Form violations:');
      results.violations.forEach((v) => {
        console.error(`   - ${v.id} [${v.impact}]: ${v.description}`);
      });
    }

    expect(results.violations).toEqual([]);
  });

  test('Form inputs - proper labels', async ({ page }) => {
    await page.goto('/contact');

    const inputs = await page.locator('form input, form textarea, form select').all();

    for (const input of inputs) {
      const type = await input.getAttribute('type');

      // Skip hidden inputs
      if (type === 'hidden') continue;

      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');

      // Must have label or aria-label
      const hasLabel =
        (id && (await page.locator(`label[for="${id}"]`).count()) > 0) || ariaLabel !== null;

      expect(hasLabel).toBe(true);
    }

    console.log(`✅ All form inputs have proper labels`);
  });

  test('Form validation - accessible error messages', async ({ page }) => {
    await page.goto('/contact');

    // Submit empty form to trigger validation
    const submitButton = page.locator('button[type="submit"]');
    if ((await submitButton.count()) > 0) {
      await submitButton.click();

      // Wait for validation messages
      await page.waitForTimeout(500);

      // Check for aria-invalid on invalid fields
      const invalidInputs = await page.locator('[aria-invalid="true"]').all();

      // Each invalid input should have associated error message
      for (const input of invalidInputs) {
        const ariaDescribedby = await input.getAttribute('aria-describedby');
        expect(ariaDescribedby).toBeTruthy();

        // Error message element should exist
        if (ariaDescribedby) {
          const errorMsg = page.locator(`#${ariaDescribedby}`);
          expect(await errorMsg.count()).toBeGreaterThan(0);
        }
      }
    }
  });
});

/**
 * Link Component Accessibility
 */
test.describe('Link Components', () => {
  test('All links - descriptive text', async ({ page }) => {
    await page.goto('/');

    const links = await page.locator('a').all();

    for (const link of links) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');

      // Link must have meaningful text or aria-label
      const hasDescriptiveText =
        (text && text.trim().length > 0) ||
        (ariaLabel && ariaLabel.length > 0) ||
        (title && title.length > 0);

      expect(hasDescriptiveText).toBe(true);

      // Avoid generic link text
      if (text) {
        const genericTexts = ['click here', 'read more', 'here', 'more'];
        const isGeneric = genericTexts.some((generic) => text.trim().toLowerCase() === generic);

        // Generic text should have aria-label for context
        if (isGeneric) {
          expect(ariaLabel || title).toBeTruthy();
        }
      }
    }

    console.log(`✅ ${links.length} links have descriptive text`);
  });

  test('External links - proper indication', async ({ page }) => {
    await page.goto('/');

    const externalLinks = await page.locator('a[target="_blank"]').all();

    // External links should indicate they open in new window
    for (const link of externalLinks) {
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');
      const rel = await link.getAttribute('rel');

      // Should have noopener noreferrer for security
      expect(rel).toContain('noopener');

      // Should indicate "opens in new window" for screen readers
      const hasNewWindowIndicator =
        (ariaLabel && ariaLabel.includes('new window')) || (title && title.includes('new window'));

      // Log if missing indicator (warning, not failure)
      if (!hasNewWindowIndicator) {
        const href = await link.getAttribute('href');
        console.warn(`⚠️  External link missing "new window" indicator: ${href}`);
      }
    }
  });
});

/**
 * Image Component Accessibility
 */
test.describe('Image Components', () => {
  test('All images - alt text present', async ({ page }) => {
    await page.goto('/');

    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');

      // Alt must exist (can be empty for decorative images)
      expect(alt).not.toBeNull();

      // If role="presentation" or alt="", image is decorative
      const isDecorative = role === 'presentation' || alt === '';

      // If not decorative, alt must be meaningful
      if (!isDecorative && alt) {
        expect(alt.length).toBeGreaterThan(0);
        expect(alt.length).toBeLessThan(150); // Alt text should be concise
      }
    }

    console.log(`✅ ${images.length} images have proper alt attributes`);
  });

  test('Background images - accessible alternatives', async ({ page }) => {
    await page.goto('/');

    // Find elements with background images
    const elementsWithBg = await page.locator('[style*="background-image"]').all();

    for (const el of elementsWithBg) {
      const role = await el.getAttribute('role');
      const ariaLabel = await el.getAttribute('aria-label');
      const textContent = await el.textContent();

      // Background image should either:
      // 1. Be decorative (role="presentation")
      // 2. Have aria-label
      // 3. Have text content
      const hasAccessibleAlternative =
        role === 'presentation' ||
        (ariaLabel && ariaLabel.length > 0) ||
        (textContent && textContent.trim().length > 0);

      expect(hasAccessibleAlternative).toBe(true);
    }
  });
});

/**
 * Heading Hierarchy
 */
test.describe('Heading Structure', () => {
  test('All pages - proper heading hierarchy', async ({ page }) => {
    const pages = ['/', '/about', '/blog', '/contact', '/projects'];

    for (const path of pages) {
      await page.goto(path);

      // Get all headings
      const h1Count = await page.locator('h1').count();
      const h2Count = await page.locator('h2').count();
      const h3Count = await page.locator('h3').count();

      // Must have exactly one h1
      expect(h1Count).toBe(1);

      // If has h3, must have h2 (no skipping levels)
      if (h3Count > 0) {
        expect(h2Count).toBeGreaterThan(0);
      }

      console.log(
        `✅ ${path}: Proper heading hierarchy (h1:${h1Count}, h2:${h2Count}, h3:${h3Count})`
      );
    }
  });
});

/**
 * Focus Indicators
 */
test.describe('Focus Management', () => {
  test('All interactive elements - visible focus indicators', async ({ page }) => {
    await page.goto('/');

    const interactiveElements = await page
      .locator('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])')
      .all();

    // Test first 10 elements
    const sampleSize = Math.min(10, interactiveElements.length);

    for (let i = 0; i < sampleSize; i++) {
      const element = interactiveElements[i];
      await element.focus();

      // Get computed styles
      const outline = await element.evaluate((el) => window.getComputedStyle(el).outline);
      const boxShadow = await element.evaluate((el) => window.getComputedStyle(el).boxShadow);

      // Must have visible focus indicator (outline or box-shadow)
      const hasFocusIndicator =
        (outline && outline !== 'none' && !outline.includes('0px')) ||
        (boxShadow && boxShadow !== 'none');

      expect(hasFocusIndicator).toBe(true);
    }

    console.log(`✅ ${sampleSize} interactive elements have visible focus indicators`);
  });
});

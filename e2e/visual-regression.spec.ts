import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests
 *
 * These tests capture full-page screenshots to detect unintended CSS changes.
 * Run with --update-snapshots to generate new baselines after intentional changes.
 *
 * Usage:
 *   npx playwright test e2e/visual-regression.spec.ts --update-snapshots  # Generate baselines
 *   npx playwright test e2e/visual-regression.spec.ts                      # Compare against baselines
 */

const VISUAL_TEST_PAGES = [
  { name: 'homepage', path: '/' },
  { name: 'blog-listing', path: '/blog' },
  { name: 'blog-post', path: '/blog/shipping-developer-portfolio' },
  { name: 'projects', path: '/projects' },
  { name: 'about', path: '/about' },
  { name: 'contact', path: '/contact' },
];

// Full page visual tests for core pages
for (const page of VISUAL_TEST_PAGES) {
  test(`visual: ${page.name}`, async ({ page: p }) => {
    await p.goto(page.path);
    await p.waitForLoadState('networkidle');

    // Wait for any animations to settle
    await p.waitForTimeout(500);

    await expect(p).toHaveScreenshot(`${page.name}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
      timeout: 15000, // Allow more time for large pages
    });
  });
}

// Component-specific tests for high-risk areas
test('visual: code-block', async ({ page }) => {
  await page.goto('/blog/cve-2025-55182-react2shell');
  await page.waitForLoadState('networkidle');

  const codeBlock = page.locator('pre').first();
  await codeBlock.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  await expect(codeBlock).toHaveScreenshot('code-block.png', {
    maxDiffPixelRatio: 0.01,
  });
});

// Dark mode visual test
test('visual: dark-mode-homepage', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Find the theme toggle button specifically by aria-label
  const themeToggle = page.getByRole('button', { name: 'Toggle theme' }).first();

  // Try to find a theme toggle, if not found skip this test
  const toggleExists = await themeToggle.count() > 0;
  if (!toggleExists) {
    test.skip();
    return;
  }

  await themeToggle.click();
  await page.waitForTimeout(500); // Wait for theme transition

  await expect(page).toHaveScreenshot('homepage-dark.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.01,
    timeout: 15000,
  });
});

// Mobile viewport test
test('visual: mobile-homepage', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

  await expect(page).toHaveScreenshot('homepage-mobile.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.02, // Slightly higher tolerance for mobile
  });
});

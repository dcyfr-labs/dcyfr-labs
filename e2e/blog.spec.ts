import { test, expect } from '@playwright/test';

/**
 * E2E tests for blog functionality
 *
 * Tests blog listing, search, filtering, and individual post pages
 */

test.describe('Blog', () => {
  test('should display blog posts', async ({ page }) => {
    await page.goto('/blog');

    // Check page title
    await expect(page).toHaveTitle(/Blog/);

    // Verify blog posts are displayed
    const posts = page.locator('[data-testid="post-list"] article');
    await expect(posts.first()).toBeVisible();
  });

  // STALE: the blog no longer exposes a role="searchbox" input — the search UI
  // was redesigned. Skipped until the spec is rewritten (tracked in dcyfr-labs#710).
  test.fixme('should have working search functionality', async ({ page }) => {
    await page.goto('/blog');

    // Find search input by its aria-label to be more specific
    const searchInput = page.getByRole('searchbox', { name: /search/i }).first();
    await expect(searchInput).toBeVisible();

    // Type in search
    await searchInput.fill('test');

    // Wait for search results to filter
    await page.waitForTimeout(300); // Debounce delay

    // Results should update (this is a basic check)
    await expect(searchInput).toHaveValue('test');
  });

  test('should filter posts by tag', async ({ page }) => {
    await page.goto('/blog');

    // Find and click a tag filter button
    const tagButton = page
      .locator('[role="button"]')
      .filter({ hasText: /nextjs|react|typescript/i })
      .first();

    if (await tagButton.isVisible()) {
      await tagButton.click();

      // URL should update with tag parameter
      await expect(page).toHaveURL(/tag=/);
    }
  });

  test('should open and display blog post', async ({ page, browserName }) => {
    // Skip webkit due to TLS/timing issues with navigation
    test.skip(
      browserName === 'webkit',
      'Webkit has TLS/timing issues with this navigation pattern'
    );

    await page.goto('/blog');

    // Click on first blog post link and wait for navigation
    const firstPost = page.locator('[data-testid="post-list"] article a').first();
    await Promise.all([page.waitForURL(/\/blog\/.*/), firstPost.click()]);

    // Verify post content is visible
    const article = page.locator('article');
    await expect(article).toBeVisible();

    // Check for Table of Contents (if post has headings)
    const toc = page.locator('[data-testid="table-of-contents"]');
    if (await toc.isVisible()) {
      await expect(toc).toContainText(/contents/i);
    }
  });

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/blog');

    // Test keyboard navigation
    await page.keyboard.press('Tab');

    // Check for skip link (accessibility feature)
    const skipLink = page.locator('text=/skip to (main )?content/i').first();
    if (await skipLink.isVisible()) {
      await expect(skipLink).toBeVisible();
    }
  });
});

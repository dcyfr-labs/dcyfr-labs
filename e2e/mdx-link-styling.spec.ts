import { test, expect } from '@playwright/test';

/**
 * E2E test for MDX link styling
 *
 * Requirements:
 * - Links in regular prose should be underlined
 * - Links in headers (h1-h6) should NOT be underlined
 */

test.describe('MDX Link Styling', () => {
  test('should not underline links in blog post headers', async ({ page }) => {
    // Navigate to a blog post that has links in headers
    // Using the "Why I Built..." post which has "App Router" link in h2
    await page.goto('/blog/why-i-built-this-with-nextjs-app-router');

    // Wait for the page to load
    await page.waitForSelector('article.prose', { timeout: 10000 });

    // Find the "Why App Router?" heading
    const heading = page.locator('h2:has-text("Why App Router?")').first();
    await expect(heading).toBeVisible();

    // Find the "App Router" link within the heading
    const headerLink = heading.locator('a:has-text("App Router")');
    await expect(headerLink).toBeVisible();

    // Check the computed styles for the link
    const textDecoration = await headerLink.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.textDecoration;
    });

    // The link should not have underline
    // Text decoration should be 'none' or should not contain 'underline'
    expect(textDecoration).not.toContain('underline');

    // Also verify the heading has the no-underline class
    const headingClasses = await heading.getAttribute('class');
    expect(headingClasses).toContain('[&_a]:no-underline');
  });

  test('should underline links in regular prose content', async ({ page }) => {
    await page.goto('/blog/why-i-built-this-with-nextjs-app-router');

    // Wait for the article to load
    await page.waitForSelector('article.prose', { timeout: 10000 });

    // Find a regular paragraph link (not in a header)
    // Look for the "production-ready platform" link in the update box
    const proseLink = page.locator('article.prose a:has-text("production-ready platform")').first();

    if ((await proseLink.count()) > 0) {
      await expect(proseLink).toBeVisible();

      // Check the computed styles for the link
      const textDecoration = await proseLink.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return styles.textDecoration;
      });

      // The link should have underline (CSS applies it)
      expect(textDecoration).toContain('underline');
    }
  });

  test('should apply no-underline class to all header levels with links', async ({ page }) => {
    await page.goto('/blog/why-i-built-this-with-nextjs-app-router');
    await page.waitForSelector('article.prose', { timeout: 10000 });

    // Check h2 elements that might have links
    const h2Elements = page.locator('article.prose h2');
    const h2Count = await h2Elements.count();

    for (let i = 0; i < h2Count; i++) {
      const h2 = h2Elements.nth(i);
      const classes = await h2.getAttribute('class');

      // All h2 elements should have the [&_a]:no-underline class
      expect(classes).toContain('[&_a]:no-underline');
    }

    // Check h3 elements
    const h3Elements = page.locator('article.prose h3');
    const h3Count = await h3Elements.count();

    for (let i = 0; i < h3Count; i++) {
      const h3 = h3Elements.nth(i);
      const classes = await h3.getAttribute('class');
      expect(classes).toContain('[&_a]:no-underline');
    }
  });

  test('should verify CSS specificity overrides inline underline', async ({ page }) => {
    await page.goto('/blog/why-i-built-this-with-nextjs-app-router');
    await page.waitForSelector('article.prose', { timeout: 10000 });

    // Find heading with link
    const heading = page.locator('h2:has-text("Why App Router?")').first();
    const headerLink = heading.locator('a:has-text("App Router")');

    // Get all computed style properties
    const linkStyles = await headerLink.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        textDecoration: styles.textDecoration,
        textDecorationLine: styles.textDecorationLine,
        textDecorationStyle: styles.textDecorationStyle,
      };
    });

    console.log('Header link styles:', linkStyles);

    // Verify no underline in any form
    expect(linkStyles.textDecorationLine).toBe('none');
  });
});

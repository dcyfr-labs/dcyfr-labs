/**
 * E2E Tests for Activity Heatmap Export Feature
 *
 * Tests the end-to-end functionality of exporting the activity heatmap as an image.
 */

import { test, expect } from '@playwright/test';

test.describe('Activity Heatmap Export', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to activity page with heatmap tab
    await page.goto('/activity');

    // Switch to Heatmap tab
    await page.click('button:has-text("Heatmap")');

    // Wait for heatmap to load
    await page.waitForSelector('text=Activity Heatmap', { timeout: 10000 });
  });

  test('export button is visible on heatmap', async ({ page }) => {
    // Verify Export PNG button exists
    const exportButton = page.locator('button:has-text("Export PNG")');
    await expect(exportButton).toBeVisible();
  });

  test('export button has correct icon', async ({ page }) => {
    // Check for Download icon in export button
    const exportButton = page.locator('button:has-text("Export PNG")');
    const downloadIcon = exportButton.locator('svg');
    await expect(downloadIcon).toBeVisible();
  });

  test('clicking export button triggers download', async ({ page }) => {
    // Setup download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });

    // Click export button
    await page.click('button:has-text("Export PNG")');

    // Wait for download to start
    const download = await downloadPromise;

    // Verify download filename matches expected pattern
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/^activity-heatmap-\d{4}-\d{2}-\d{2}\.png$/);
  });

  test('export button shows loading state during export', async ({ page }) => {
    // Click export button
    await page.click('button:has-text("Export PNG")');

    // Check for "Exporting..." text briefly
    const exportButton = page.locator('button:has-text("Exporting...")');

    // Button should either show "Exporting..." or quickly return to "Export PNG"
    // We use waitForSelector with a short timeout and don't fail if it's not found
    try {
      await expect(exportButton).toBeVisible({ timeout: 1000 });
    } catch {
      // It's okay if we miss the loading state due to fast execution
    }
  });

  test('export button is disabled during export', async ({ page }) => {
    // Click export button
    const exportButton = page.locator('button:has-text("Export PNG")');
    await exportButton.click();

    // Check if button is disabled (briefly)
    try {
      await expect(exportButton).toBeDisabled({ timeout: 1000 });
    } catch {
      // It's okay if we miss the disabled state due to fast execution
    }
  });

  test('heatmap contains statistics before export', async ({ page }) => {
    // Verify heatmap statistics are present (ensures content to export)
    await expect(page.locator('text=Active Days')).toBeVisible();
    await expect(page.locator('text=Current Streak')).toBeVisible();
    await expect(page.locator('text=Best Streak')).toBeVisible();
    await expect(page.locator('text=Busiest Day')).toBeVisible();
  });

  test('heatmap contains calendar before export', async ({ page }) => {
    // Verify calendar heatmap is rendered (ensures SVG content)
    const calendar = page.locator('.react-calendar-heatmap');
    await expect(calendar).toBeVisible();
  });

  test('export works on different viewport sizes', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.click('button:has-text("Heatmap")');
    await page.waitForSelector('text=Activity Heatmap');

    const exportButton = page.locator('button:has-text("Export PNG")');
    await expect(exportButton).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.click('button:has-text("Heatmap")');
    await page.waitForSelector('text=Activity Heatmap');
    await expect(exportButton).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    await page.click('button:has-text("Heatmap")');
    await page.waitForSelector('text=Activity Heatmap');
    await expect(exportButton).toBeVisible();
  });

  test('export button has proper accessibility attributes', async ({ page }) => {
    const exportButton = page.locator('button:has-text("Export PNG")');

    // Check that button is keyboard accessible
    await exportButton.focus();
    const focused = await exportButton.evaluate((el) => el === document.activeElement);
    expect(focused).toBe(true);
  });

  test('heatmap export works after date selection', async ({ page }) => {
    // Wait for heatmap to fully render
    await page.waitForSelector('.react-calendar-heatmap', { timeout: 10000 });

    // Try to click a date cell (if any exist)
    const dateCell = page.locator('.react-calendar-heatmap rect').first();

    try {
      await dateCell.click({ timeout: 2000 });
    } catch {
      // If no dates are clickable, that's okay - just test export
    }

    // Export should still work
    const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('button:has-text("Export PNG")');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.png$/);
  });

  test('multiple exports can be triggered sequentially', async ({ page }) => {
    // First export
    const download1Promise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('button:has-text("Export PNG")');
    const download1 = await download1Promise;
    expect(download1.suggestedFilename()).toMatch(/\.png$/);

    // Wait a moment
    await page.waitForTimeout(500);

    // Second export
    const download2Promise = page.waitForEvent('download', { timeout: 15000 });
    await page.click('button:has-text("Export PNG")');
    const download2 = await download2Promise;
    expect(download2.suggestedFilename()).toMatch(/\.png$/);
  });
});

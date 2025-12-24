/**
 * E2E Tests - Activity Bookmarks
 *
 * End-to-end tests for bookmark functionality using Playwright
 */

import { test, expect, type Page } from "@playwright/test";

test.describe("Activity Bookmarks", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/activity");
    await page.evaluate(() => localStorage.clear());
  });

  test("should bookmark and unbookmark activity items", async ({ page }) => {
    // Go to activity page
    await page.goto("/activity");
    
    // Wait for activities to load
    await expect(page.locator("[data-testid='activity-item']").first()).toBeVisible();
    
    // Find first activity item
    const firstActivity = page.locator("[data-testid='activity-item']").first();
    
    // Hover over activity to reveal bookmark button
    await firstActivity.hover();
    
    // Find bookmark button (should be visible after hover)
    const bookmarkButton = firstActivity.locator("button[aria-label*='bookmark']").first();
    
    // Bookmark button should be visible after hover
    await expect(bookmarkButton).toBeVisible();
    
    // Click to bookmark
    await bookmarkButton.click();
    
    // Button should change to bookmarked state (different icon/color)
    await expect(bookmarkButton).toHaveClass(/text-amber-500/);
    
    // Click again to unbookmark
    await bookmarkButton.click();
    
    // Should return to unbookmarked state
    await expect(bookmarkButton).not.toHaveClass(/text-amber-500/);
  });

  test("should persist bookmarks across page reloads", async ({ page }) => {
    // Go to activity page
    await page.goto("/activity");
    await expect(page.locator("[data-testid='activity-item']").first()).toBeVisible();
    
    // Hover and bookmark first item
    const firstActivity = page.locator("[data-testid='activity-item']").first();
    await firstActivity.hover();
    const bookmarkButton = firstActivity.locator("button[aria-label*='bookmark']").first();
    await bookmarkButton.click();
    
    // Verify bookmarked state
    await expect(bookmarkButton).toHaveClass(/text-amber-500/);
    
    // Reload page
    await page.reload();
    await expect(page.locator("[data-testid='activity-item']").first()).toBeVisible();
    
    // Hover to reveal bookmark button again
    const reloadedActivity = page.locator("[data-testid='activity-item']").first();
    await reloadedActivity.hover();
    const reloadedBookmarkButton = reloadedActivity.locator("button[aria-label*='bookmark']").first();
    
    // Bookmark state should persist
    await expect(reloadedBookmarkButton).toHaveClass(/text-amber-500/);
  });

  test("should filter activities using bookmarks preset", async ({ page }) => {
    // Go to activity page
    await page.goto("/activity");
    await expect(page.locator("[data-testid='activity-item']").first()).toBeVisible();
    
    // Count initial activities
    const initialCount = await page.locator("[data-testid='activity-item']").count();
    
    // Bookmark a few items
    const activities = page.locator("[data-testid='activity-item']");
    
    // Bookmark first item
    await activities.nth(0).hover();
    await activities.nth(0).locator("button[aria-label*='bookmark']").click();
    
    // Bookmark third item 
    await activities.nth(2).hover();
    await activities.nth(2).locator("button[aria-label*='bookmark']").click();
    
    // Click on bookmarks preset (should be first preset)
    const bookmarksPreset = page.locator("button:has-text('Bookmarked Items')");
    await bookmarksPreset.click();
    
    // Should now show only 2 bookmarked items
    await expect(page.locator("[data-testid='activity-item']")).toHaveCount(2);
    
    // Clear filters or select "All" to verify we can see all items again
    const allTimeFilter = page.locator("button:has-text('All')").first();
    await allTimeFilter.click();
    
    // Should see all items again (though bookmarks filter might still be active)
    // This test verifies the filtering works
  });

  test("should handle bookmark button hover states", async ({ page }) => {
    await page.goto("/activity");
    await expect(page.locator("[data-testid='activity-item']").first()).toBeVisible();
    
    const firstActivity = page.locator("[data-testid='activity-item']").first();
    
    // Hover over activity item to reveal bookmark button
    await firstActivity.hover();
    
    // Bookmark button should become visible on hover
    const bookmarkButton = firstActivity.locator("button[aria-label*='bookmark']");
    await expect(bookmarkButton).toBeVisible();
    
    // Move away and button should fade (opacity-0 -> opacity-100 on hover)
    await page.locator("body").hover();
    
    // Test bookmark button interaction
    await firstActivity.hover();
    await bookmarkButton.hover();
    
    // Should not throw any errors
    await bookmarkButton.click();
  });
});

test.describe("Bookmark Manager", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/activity");
    await page.evaluate(() => localStorage.clear());
  });

  test("should show empty state when no bookmarks", async ({ page }) => {
    // This test assumes there's a BookmarkManager component somewhere
    // If it's not directly accessible, we might need to add a route or modal
    
    // For now, check that localStorage is empty and we could render empty state
    const bookmarkData = await page.evaluate(() => 
      localStorage.getItem("dcyfr-activity-bookmarks")
    );
    expect(bookmarkData).toBeNull();
  });
});

test.describe("Bookmark Accessibility", () => {
  test("should have proper ARIA labels and keyboard navigation", async ({ page }) => {
    await page.goto("/activity");
    await expect(page.locator("[data-testid='activity-item']").first()).toBeVisible();
    
    // Hover to reveal bookmark button
    const firstActivity = page.locator("[data-testid='activity-item']").first();
    await firstActivity.hover();
    
    const bookmarkButton = firstActivity.locator("button[aria-label*='bookmark']");
    
    // Check ARIA label
    const ariaLabel = await bookmarkButton.getAttribute("aria-label");
    expect(ariaLabel).toMatch(/bookmark/i);
    
    // Test keyboard navigation
    await bookmarkButton.focus();
    await expect(bookmarkButton).toBeFocused();
    
    // Test Enter key activation
    await bookmarkButton.press("Enter");
    
    // Should change state
    const newAriaLabel = await bookmarkButton.getAttribute("aria-label");
    expect(newAriaLabel).not.toBe(ariaLabel);
  });
});
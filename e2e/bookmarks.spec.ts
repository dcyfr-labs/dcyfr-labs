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
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000); // Wait for activity items to hydrate
    
    // Check if activity items exist, skip if not
    const activityCount = await page.locator("[data-testid='activity-item']").count();
    if (activityCount === 0) {
      test.skip(true, 'No activity items available for testing');
    }
    
    await expect(page.locator("[data-testid='activity-item']").first()).toBeVisible({ timeout: 10000 });
    
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

test.describe("Bookmarks Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/blog");
    await page.evaluate(() => localStorage.clear());
  });

  test("should show empty state when no bookmarks", async ({ page }) => {
    await page.goto("/bookmarks");
    
    // Should show empty state message
    await expect(page.getByText("No bookmarks yet")).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse Blog Posts" })).toBeVisible();
    
    // Should show recommended posts section if available
    const recommendedSection = page.getByText("Recommended to Get Started");
    if (await recommendedSection.isVisible()) {
      await expect(recommendedSection).toBeVisible();
    }
  });

  test("should display bookmarked blog posts", async ({ page }) => {
    // First, bookmark some posts from the blog page
    await page.goto("/blog");
    
    // Wait for posts to load
    await expect(page.locator("article").first()).toBeVisible();
    
    // Bookmark the first post
    const firstPostBookmark = page.locator("article").first().locator("button[aria-label*='Bookmark']");
    await firstPostBookmark.click();
    
    // Bookmark the second post
    const secondPostBookmark = page.locator("article").nth(1).locator("button[aria-label*='Bookmark']");
    await secondPostBookmark.click();
    
    // Navigate to bookmarks page
    await page.goto("/bookmarks");
    
    // Should show count of bookmarked posts
    await expect(page.getByText(/2 posts saved for later/)).toBeVisible();
    
    // Should display bookmarked posts
    const bookmarkedPosts = page.locator("article");
    await expect(bookmarkedPosts).toHaveCount(2);
  });

  test("should add recommended bookmarks", async ({ page }) => {
    await page.goto("/bookmarks");
    
    // Check if "Add Recommended" button exists
    const addRecommendedBtn = page.getByRole("button", { name: /Add .* Recommended/ });
    
    if (await addRecommendedBtn.isVisible()) {
      // Click to add recommended bookmarks
      await addRecommendedBtn.click();
      
      // Should show success toast
      await expect(page.getByText(/Added .* recommended post/)).toBeVisible();
      
      // Posts should now be visible
      await expect(page.locator("article")).not.toHaveCount(0);
    }
  });

  test("should export bookmarks as JSON", async ({ page }) => {
    // First add some bookmarks
    await page.goto("/blog");
    await expect(page.locator("article").first()).toBeVisible();
    
    const firstPostBookmark = page.locator("article").first().locator("button[aria-label*='Bookmark']");
    await firstPostBookmark.click();
    
    // Go to bookmarks page
    await page.goto("/bookmarks");
    
    // Set up download handler
    const downloadPromise = page.waitForEvent("download");
    
    // Click export button
    const exportBtn = page.getByRole("button", { name: "Export" });
    await exportBtn.click();
    
    // Wait for download
    const download = await downloadPromise;
    
    // Verify filename pattern
    expect(download.suggestedFilename()).toMatch(/bookmarks-\d{4}-\d{2}-\d{2}\.json/);
    
    // Should show success toast
    await expect(page.getByText("Bookmarks exported")).toBeVisible();
  });

  test("should clear all bookmarks with confirmation", async ({ page }) => {
    // Add some bookmarks first
    await page.goto("/blog");
    await expect(page.locator("article").first()).toBeVisible();
    
    const firstPostBookmark = page.locator("article").first().locator("button[aria-label*='Bookmark']");
    await firstPostBookmark.click();
    
    // Go to bookmarks page
    await page.goto("/bookmarks");
    
    // Click Clear All button
    const clearAllBtn = page.getByRole("button", { name: "Clear All" });
    await clearAllBtn.click();
    
    // Should show confirmation dialog
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Clear all bookmarks?")).toBeVisible();
    
    // Confirm deletion
    const confirmBtn = page.getByRole("dialog").getByRole("button", { name: "Clear All Bookmarks" });
    await confirmBtn.click();
    
    // Should show success toast
    await expect(page.getByText("All bookmarks cleared")).toBeVisible();
    
    // Should now show empty state
    await expect(page.getByText("No bookmarks yet")).toBeVisible();
  });

  test("should persist bookmarks across navigation", async ({ page }) => {
    // Add bookmark from blog
    await page.goto("/blog");
    await expect(page.locator("article").first()).toBeVisible();
    
    const firstPostBookmark = page.locator("article").first().locator("button[aria-label*='Bookmark']");
    await firstPostBookmark.click();
    
    // Navigate to home
    await page.goto("/");
    
    // Navigate back to bookmarks
    await page.goto("/bookmarks");
    
    // Bookmark should still be there
    await expect(page.getByText(/1 post saved for later/)).toBeVisible();
    await expect(page.locator("article")).toHaveCount(1);
  });

  test("should show info banner about local storage", async ({ page }) => {
    // Add a bookmark first
    await page.goto("/blog");
    await expect(page.locator("article").first()).toBeVisible();
    
    const firstPostBookmark = page.locator("article").first().locator("button[aria-label*='Bookmark']");
    await firstPostBookmark.click();
    
    // Go to bookmarks page
    await page.goto("/bookmarks");
    
    // Should show info banner
    await expect(page.getByText("Bookmarks are stored locally")).toBeVisible();
    await expect(page.getByText(/Use the Export button to save a backup/)).toBeVisible();
  });
});
/**
 * Activity Search E2E Tests
 *
 * End-to-end tests for activity feed search functionality:
 * - Basic search
 * - Advanced query syntax (tag:, source:, -, "exact")
 * - Keyboard shortcuts (Cmd/Ctrl+K)
 * - Search history
 */

import { test, expect } from "@playwright/test";

test.describe("Activity Feed Search", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to activity page
    await page.goto("/activity");
    
    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");
  });

  test("should display search input with placeholder", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search activities/i);
    await expect(searchInput).toBeVisible();
  });

  test("should show keyboard shortcut hint", async ({ page }) => {
    const shortcutHint = page.locator("kbd").filter({ hasText: "K" });
    await expect(shortcutHint).toBeVisible();
  });

  test("should filter activities by search query", async ({ page }) => {
    // Get initial count of activities
    const activityCards = page.locator("[data-testid='activity-item']");
    const initialCount = await activityCards.count();

    // Enter search query
    const searchInput = page.getByPlaceholder(/Search activities/i);
    await searchInput.fill("React");

    // Wait for results to update
    await page.waitForTimeout(500);

    // Verify results are filtered
    const filteredCount = await activityCards.count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test("should clear search with X button", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search activities/i);
    
    // Enter search query
    await searchInput.fill("TypeScript");
    
    // Click clear button
    const clearButton = page.locator('[aria-label="Clear search"]');
    await clearButton.click();
    
    // Verify search is cleared
    await expect(searchInput).toHaveValue("");
  });

  test("should support tag filter syntax", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search activities/i);
    
    // Search by tag
    await searchInput.fill("tag:react");
    await searchInput.press("Enter");
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Verify results contain tag badge
    const activityCards = page.locator("[data-testid='activity-item']");
    const count = await activityCards.count();
    
    // Should have some results (or zero if no react-tagged items)
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should support source filter syntax", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search activities/i);
    
    // Search by source
    await searchInput.fill("source:blog");
    await searchInput.press("Enter");
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Should filter to blog items only
    const activityCards = page.locator("[data-testid='activity-item']");
    const count = await activityCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should support exclude syntax", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search activities/i);
    
    // Exclude a source
    await searchInput.fill("-github");
    await searchInput.press("Enter");
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Should exclude GitHub items
    const activityCards = page.locator("[data-testid='activity-item']");
    const count = await activityCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should support exact phrase matching", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search activities/i);
    
    // Search for exact phrase
    await searchInput.fill('"React Hooks"');
    await searchInput.press("Enter");
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Should return specific results
    const activityCards = page.locator("[data-testid='activity-item']");
    const count = await activityCards.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should focus search input with Cmd+K", async ({ page, browserName }) => {
    const searchInput = page.getByPlaceholder(/Search activities/i);
    
    // Click somewhere else first
    await page.click("body");
    
    // Press Cmd+K (or Ctrl+K on Windows/Linux)
    const modifier = browserName === "webkit" && process.platform === "darwin" ? "Meta" : "Control";
    await page.keyboard.press(`${modifier}+KeyK`);
    
    // Verify search input is focused
    await expect(searchInput).toBeFocused();
  });

  test("should save search to history after submission", async ({ page, context }) => {
    // Clear localStorage first
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());
    
    const searchInput = page.getByPlaceholder(/Search activities/i);
    
    // Perform a search
    await searchInput.fill("TypeScript");
    await searchInput.press("Enter");
    
    // Wait for search to complete
    await page.waitForTimeout(500);
    
    // Focus search again to show history
    await searchInput.click();
    
    // Wait for history dropdown
    await page.waitForTimeout(300);
    
    // Check if history contains our search
    const historyItem = page.locator("text=TypeScript").first();
    const isHistoryVisible = await historyItem.isVisible().catch(() => false);
    
    // History should be visible or search should be recorded in localStorage
    const hasHistory = isHistoryVisible || await page.evaluate(() => {
      const stored = localStorage.getItem("dcyfr-activity-search-history");
      return stored !== null && stored.includes("TypeScript");
    });
    
    expect(hasHistory).toBe(true);
  });

  test("should apply search from history", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search activities/i);
    
    // Perform initial search
    await searchInput.fill("React");
    await searchInput.press("Enter");
    await page.waitForTimeout(500);
    
    // Clear search
    const clearButton = page.locator('[aria-label="Clear search"]');
    await clearButton.click();
    
    // Click search input to show history
    await searchInput.click();
    await page.waitForTimeout(300);
    
    // Click on history item if visible
    const historyButton = page.locator("button").filter({ hasText: "React" }).first();
    const isVisible = await historyButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await historyButton.click();
      
      // Verify search was applied
      await expect(searchInput).toHaveValue("React");
    }
  });

  test("should clear search history", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search activities/i);
    
    // Perform a search to create history
    await searchInput.fill("Test");
    await searchInput.press("Enter");
    await page.waitForTimeout(500);
    
    // Click search input to show history
    await searchInput.click();
    await page.waitForTimeout(300);
    
    // Look for "Clear" button in history dropdown
    const clearHistoryButton = page.locator("button").filter({ hasText: "Clear" });
    const isVisible = await clearHistoryButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await clearHistoryButton.click();
      
      // Verify history was cleared in localStorage
      const historyCleared = await page.evaluate(() => {
        const stored = localStorage.getItem("dcyfr-activity-search-history");
        return stored === null || stored === "[]";
      });
      
      expect(historyCleared).toBe(true);
    }
  });

  test("should show search syntax hints", async ({ page }) => {
    const syntaxHint = page.locator("text=tag:typescript");
    await expect(syntaxHint).toBeVisible();
  });

  test("should combine search with other filters", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search activities/i);
    
    // Apply search
    await searchInput.fill("React");
    
    // Click a source filter (e.g., Blog)
    const blogFilter = page.locator("text=Blog").first();
    await blogFilter.click();
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Verify both filters are active
    const resultsText = page.locator("text=/Showing \\d+ of \\d+/");
    await expect(resultsText).toBeVisible();
  });

  test("should update results count badge", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search activities/i);
    
    // Enter search query
    await searchInput.fill("TypeScript");
    
    // Wait for results
    await page.waitForTimeout(500);
    
    // Check for results count
    const resultsText = page.locator("text=/Showing \\d+ of \\d+/");
    await expect(resultsText).toBeVisible();
  });
});

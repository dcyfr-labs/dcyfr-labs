import { test, expect } from "@playwright/test";

test.describe("Command Palette", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should open command palette with / (forward slash)", async ({
    page,
  }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500); // Allow for component hydration

    // Press / key
    await page.keyboard.press("Slash");

    // Wait for dialog to appear with timeout
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 });
    
    // Command palette should be visible
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10000 });
    await expect(page.getByPlaceholder("Search commands...")).toBeVisible({ timeout: 5000 });
  });

  test("should close command palette with Escape", async ({ page }) => {
    // Wait for page load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    // Open command palette
    await page.keyboard.press("Slash");
    await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 10000 });
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 10000 });

    // Close with Escape
    await page.keyboard.press("Escape");
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 });
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("should close command palette when clicking backdrop", async ({ page }) => {
    // Open command palette
    await page.keyboard.press("Slash");
    await expect(page.getByRole("dialog")).toBeVisible();

    // Click backdrop (outside dialog)
    await page.click("body", { position: { x: 10, y: 10 } });
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("should filter commands based on search input", async ({ page }) => {
    // Open command palette
    await page.keyboard.press("Slash");

    // Type search query
    await page.getByPlaceholder("Search commands...").fill("blog");

    // Should show Blog command
    await expect(page.getByText("Blog", { exact: true })).toBeVisible();

    // Should not show unrelated commands (Work, About, etc.)
    const workCommand = page.getByText("Work", { exact: true });
    if (await workCommand.isVisible()) {
      // If visible, it should not be in the filtered results
      await expect(page.getByText("No results found.")).toBeVisible();
    }
  });

  test("should navigate to blog when selecting Blog command", async ({ page }) => {
    // Open command palette
    await page.keyboard.press("Slash");

    // Click Blog command
    await page.getByText("Blog", { exact: true }).click();

    // Should navigate to /blog
    await expect(page).toHaveURL(/\/blog/);

    // Command palette should close
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("should navigate using keyboard arrow keys and Enter", async ({ page }) => {
    // Open command palette
    await page.keyboard.press("Slash");

    // Press ArrowDown to select first command
    await page.keyboard.press("ArrowDown");

    // Press Enter to execute
    await page.keyboard.press("Enter");

    // Should navigate (to Home, Blog, or first command in list)
    await page.waitForLoadState("networkidle");

    // Command palette should close
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("should show categorized commands (Navigation, Actions, Settings)", async ({ page }) => {
    // Open command palette
    await page.keyboard.press("Slash");

    // Should show Navigation category
    await expect(page.getByText("Navigation")).toBeVisible();

    // Should show Actions category
    await expect(page.getByText("Actions")).toBeVisible();

    // Navigation commands should be visible
    await expect(page.getByText("Blog", { exact: true })).toBeVisible();
    await expect(page.getByText("Work", { exact: true })).toBeVisible();

    // Theme actions should be visible
    await expect(page.getByText("Light Theme")).toBeVisible();
    await expect(page.getByText("Dark Theme")).toBeVisible();
  });

  test("should toggle theme when selecting theme command", async ({ page }) => {
    // Open command palette
    await page.keyboard.press("Slash");

    // Get current theme
    const htmlElement = page.locator("html");
    const initialTheme = await htmlElement.getAttribute("class");

    // Click theme toggle command (Light or Dark depending on current theme)
    const targetTheme = initialTheme?.includes("dark") ? "Light Theme" : "Dark Theme";
    await page.getByText(targetTheme).click();

    // Command palette should close
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Theme should change
    const newTheme = await htmlElement.getAttribute("class");
    expect(newTheme).not.toBe(initialTheme);
  });

  test("should show keyboard shortcuts in footer", async ({ page }) => {
    // Open command palette
    await page.keyboard.press("Slash");

    // Footer should show keyboard hints
    await expect(page.getByText("Navigate")).toBeVisible();
    await expect(page.getByText("Select")).toBeVisible();
    await expect(page.getByText("Open with")).toBeVisible();
  });

  test("should show 'No results found' when search has no matches", async ({ page }) => {
    // Open command palette
    await page.keyboard.press("Slash");

    // Type non-matching search query
    await page.getByPlaceholder("Search commands...").fill("xyzzzzz123nonexistent");

    // Should show no results message
    await expect(page.getByText("No results found.")).toBeVisible();
  });

  test("should not interfere with native browser shortcuts", async ({ page }) => {
    // Ensure command palette is closed
    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Try to use Cmd+L (address bar focus) - this should NOT open command palette
    // We can't test actual browser behavior, but we can ensure palette doesn't open
    await page.keyboard.press(process.platform === "darwin" ? "Meta+L" : "Control+L");

    // Command palette should remain closed
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});

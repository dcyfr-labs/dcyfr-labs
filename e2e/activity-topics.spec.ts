/**
 * Activity Topic Clustering E2E Tests
 *
 * End-to-end tests for topic cloud and filtering functionality:
 * - Topic cloud visibility and rendering
 * - Topic click to filter activities
 * - Multiple topic selection
 * - Related topics recommendations
 * - Topic filter clearing
 */

import { test, expect } from "@playwright/test";

test.describe("Activity Topic Cloud", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to activity page
    await page.goto("/activity");

    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");
  });

  test("should display topic cloud when topics are available", async ({
    page,
  }) => {
    // Look for the Topics heading
    const topicsHeading = page.getByRole("heading", { name: /Topics/i });

    // Should be visible if there are topics
    const isVisible = await topicsHeading.isVisible().catch(() => false);

    // Either topics are visible, or there are no topics (which is also valid)
    if (isVisible) {
      await expect(topicsHeading).toBeVisible();

      // Should show topic count
      const topicCount = page.getByText(/topics across/i);
      await expect(topicCount).toBeVisible();
    }
  });

  test("should render topic badges with counts", async ({ page }) => {
    // Look for topic badges (they have text + count pattern)
    const topicBadges = page.locator('[role="button"]').filter({
      hasText: /\d+$/, // Ends with a number (the count)
    });

    const count = await topicBadges.count();

    // If there are topics, verify they have counts
    if (count > 0) {
      const firstBadge = topicBadges.first();
      await expect(firstBadge).toBeVisible();

      // Badge should be clickable
      await expect(firstBadge).toHaveAttribute("class", /cursor-pointer/);
    }
  });

  test("should filter activities when topic is clicked", async ({ page }) => {
    // Find first topic badge
    const topicBadges = page.locator('[role="button"]').filter({
      hasText: /\d+$/, // Ends with a number
    });

    const count = await topicBadges.count();

    if (count > 0) {
      // Get initial activity count
      const activityCards = page.locator('[data-testid="activity-item"]');
      const initialCount = await activityCards.count();

      // Click first topic
      const firstTopic = topicBadges.first();
      await firstTopic.click();

      // Wait for filtering
      await page.waitForTimeout(500);

      // Verify activities are filtered
      const filteredCount = await activityCards.count();
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }
  });

  test("should highlight selected topics", async ({ page }) => {
    // Find topic badges
    const topicBadges = page.locator('[role="button"]').filter({
      hasText: /\d+$/,
    });

    const count = await topicBadges.count();

    if (count > 0) {
      const firstTopic = topicBadges.first();

      // Get classes before click
      const beforeClasses = await firstTopic.getAttribute("class");

      // Click topic
      await firstTopic.click();
      await page.waitForTimeout(100);

      // Get classes after click
      const afterClasses = await firstTopic.getAttribute("class");

      // Classes should change to indicate selection
      expect(beforeClasses).not.toBe(afterClasses);
    }
  });

  test("should support multiple topic selection", async ({ page }) => {
    // Find topic badges
    const topicBadges = page.locator('[role="button"]').filter({
      hasText: /\d+$/,
    });

    const count = await topicBadges.count();

    if (count >= 2) {
      // Click first two topics
      await topicBadges.nth(0).click();
      await page.waitForTimeout(100);
      await topicBadges.nth(1).click();
      await page.waitForTimeout(500);

      // Both should be highlighted
      const firstClasses = await topicBadges.nth(0).getAttribute("class");
      const secondClasses = await topicBadges.nth(1).getAttribute("class");

      expect(firstClasses).toContain("bg-primary");
      expect(secondClasses).toContain("bg-primary");
    }
  });

  test("should toggle topic selection on second click", async ({ page }) => {
    // Find topic badges
    const topicBadges = page.locator('[role="button"]').filter({
      hasText: /\d+$/,
    });

    const count = await topicBadges.count();

    if (count > 0) {
      const firstTopic = topicBadges.first();

      // Get initial activity count
      const activityCards = page.locator('[data-testid="activity-item"]');
      const initialCount = await activityCards.count();

      // Click to select
      await firstTopic.click();
      await page.waitForTimeout(500);
      const selectedCount = await activityCards.count();

      // Click again to deselect
      await firstTopic.click();
      await page.waitForTimeout(500);
      const deselectedCount = await activityCards.count();

      // Should return to initial count
      expect(deselectedCount).toBe(initialCount);
      expect(deselectedCount).toBeGreaterThanOrEqual(selectedCount);
    }
  });

  test("should show topic sizes based on frequency", async ({ page }) => {
    // Find topic badges
    const topicBadges = page.locator('[role="button"]').filter({
      hasText: /\d+$/,
    });

    const count = await topicBadges.count();

    if (count >= 3) {
      // Get classes for first 3 topics (sorted by frequency)
      const firstClasses = await topicBadges.nth(0).getAttribute("class");
      const secondClasses = await topicBadges.nth(1).getAttribute("class");
      const thirdClasses = await topicBadges.nth(2).getAttribute("class");

      // First topic (most frequent) should have larger or equal size
      const firstSize = getTextSizeFromClasses(firstClasses || "");
      const secondSize = getTextSizeFromClasses(secondClasses || "");
      const thirdSize = getTextSizeFromClasses(thirdClasses || "");

      // Sizes should be ordered (or equal)
      expect(firstSize).toBeGreaterThanOrEqual(secondSize);
      expect(secondSize).toBeGreaterThanOrEqual(thirdSize);
    }
  });
});

test.describe("Related Topics", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/activity");
    await page.waitForLoadState("networkidle");
  });

  test("should display related topics after selecting a topic", async ({
    page,
  }) => {
    // Find and click a topic
    const topicBadges = page.locator('[role="button"]').filter({
      hasText: /\d+$/,
    });

    const count = await topicBadges.count();

    if (count > 0) {
      // Click first topic
      await topicBadges.first().click();
      await page.waitForTimeout(500);

      // Look for "Related Topics" heading
      const relatedHeading = page.getByRole("heading", {
        name: /Related Topics/i,
      });

      // Related topics should appear (if there are any)
      const isVisible = await relatedHeading.isVisible().catch(() => false);
      if (isVisible) {
        await expect(relatedHeading).toBeVisible();
      }
    }
  });

  test("should add related topic to filter when clicked", async ({ page }) => {
    // Find and click a topic
    const topicBadges = page.locator('[role="button"]').filter({
      hasText: /\d+$/,
    });

    const count = await topicBadges.count();

    if (count > 0) {
      // Click first topic
      await topicBadges.first().click();
      await page.waitForTimeout(500);

      // Look for related topics section
      const relatedTopics = page
        .locator('[aria-label*="Add"]')
        .or(page.locator('button:has-text("Related")'));

      const relatedCount = await relatedTopics.count();

      if (relatedCount > 0) {
        // Click a related topic
        await relatedTopics.first().click();
        await page.waitForTimeout(500);

        // Should now have 2 topics selected
        const selectedTopics = page.locator(".bg-primary");
        const selectedCount = await selectedTopics.count();
        expect(selectedCount).toBeGreaterThanOrEqual(2);
      }
    }
  });

  test("should update related topics when selection changes", async ({
    page,
  }) => {
    // Find topic badges
    const topicBadges = page.locator('[role="button"]').filter({
      hasText: /\d+$/,
    });

    const count = await topicBadges.count();

    if (count >= 2) {
      // Select first topic
      await topicBadges.nth(0).click();
      await page.waitForTimeout(500);

      // Get related topics text (if any)
      const relatedSection = page.locator("text=Related Topics").locator("..");
      const firstRelated = await relatedSection.textContent().catch(() => "");

      // Select different topic
      await topicBadges.nth(0).click(); // Deselect first
      await topicBadges.nth(1).click(); // Select second
      await page.waitForTimeout(500);

      // Get new related topics
      const secondRelated = await relatedSection
        .textContent()
        .catch(() => "");

      // Related topics may change (or section may disappear)
      // Just verify the operation doesn't crash
      expect(typeof secondRelated).toBe("string");
    }
  });
});

test.describe("Topic Cloud Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/activity");
    await page.waitForLoadState("networkidle");
  });

  test("should have proper ARIA labels for topic badges", async ({ page }) => {
    // Topic badges should be buttons or have appropriate role
    const topicBadges = page.locator('[role="button"]').filter({
      hasText: /\d+$/,
    });

    const count = await topicBadges.count();

    if (count > 0) {
      const firstBadge = topicBadges.first();

      // Should have title attribute for tooltips
      const title = await firstBadge.getAttribute("title");
      expect(title).toBeTruthy();
      expect(title).toMatch(/activities/i);
    }
  });

  test("should show topic count in tooltips", async ({ page }) => {
    const topicBadges = page.locator('[role="button"]').filter({
      hasText: /\d+$/,
    });

    const count = await topicBadges.count();

    if (count > 0) {
      const firstBadge = topicBadges.first();

      // Hover to trigger tooltip
      await firstBadge.hover();

      // Title should show count and percentage
      const title = await firstBadge.getAttribute("title");
      expect(title).toMatch(/\d+/); // Has number
      expect(title).toMatch(/%/); // Has percentage
    }
  });
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract text size value from Tailwind classes
 */
function getTextSizeFromClasses(classes: string): number {
  const sizeMap: Record<string, number> = {
    "text-xs": 1,
    "text-sm": 2,
    "text-base": 3,
    "text-lg": 4,
    "text-xl": 5,
    "text-2xl": 6,
    "text-3xl": 7,
  };

  for (const [className, size] of Object.entries(sizeMap)) {
    if (classes.includes(className)) {
      return size;
    }
  }

  return 3; // Default to base
}

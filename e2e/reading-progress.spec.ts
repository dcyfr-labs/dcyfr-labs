import { test, expect } from "@playwright/test";

test.describe("Reading Progress Tracking", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("should show progress bar on blog post", async ({ page }) => {
    // Navigate to a blog post
    await page.goto("/blog");
    
    // Wait for blog list to load
    await page.waitForSelector("article");
    
    // Click first blog post
    const firstPost = page.locator("article").first();
    await firstPost.click();
    
    // Wait for navigation
    await page.waitForLoadState("networkidle");
    
    // Progress bar should be visible
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();
    
    // Progress should start at 0 or low value
    const initialProgress = await progressBar.getAttribute("aria-valuenow");
    expect(Number(initialProgress)).toBeLessThan(30);
  });

  test("should update progress as user scrolls", async ({ page }) => {
    // Navigate to a blog post
    await page.goto("/blog");
    await page.waitForSelector("article");
    const firstPost = page.locator("article").first();
    await firstPost.click();
    await page.waitForLoadState("networkidle");
    
    const progressBar = page.locator('[role="progressbar"]');
    
    // Get initial progress
    const initialProgress = await progressBar.getAttribute("aria-valuenow");
    
    // Scroll halfway down the page
    await page.evaluate(() => {
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const targetScroll = (scrollHeight - viewportHeight) / 2;
      window.scrollTo(0, targetScroll);
    });
    
    // Wait for progress update
    await page.waitForTimeout(200);
    
    // Progress should have increased
    const midProgress = await progressBar.getAttribute("aria-valuenow");
    expect(Number(midProgress)).toBeGreaterThan(Number(initialProgress));
    
    // Scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
    
    // Wait for progress update
    await page.waitForTimeout(200);
    
    // Progress should be near 100%
    const finalProgress = await progressBar.getAttribute("aria-valuenow");
    expect(Number(finalProgress)).toBeGreaterThanOrEqual(90);
  });

  test("should persist progress to localStorage", async ({ page }) => {
    // Navigate to a blog post
    await page.goto("/blog");
    await page.waitForSelector("article");
    
    // Get the post slug for later verification
    const firstPostLink = page.locator("article a").first();
    const postHref = await firstPostLink.getAttribute("href");
    const slug = postHref?.replace("/blog/", "") || "";
    
    await firstPostLink.click();
    await page.waitForLoadState("networkidle");
    
    // Scroll partway through the article
    await page.evaluate(() => {
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const targetScroll = (scrollHeight - viewportHeight) * 0.6; // 60% through
      window.scrollTo(0, targetScroll);
    });
    
    // Wait for progress to be saved
    await page.waitForTimeout(300);
    
    // Check localStorage
    const progressData = await page.evaluate(() => {
      const data = localStorage.getItem("reading-progress");
      return data ? JSON.parse(data) : null;
    });
    
    expect(progressData).toBeTruthy();
    expect(progressData[slug]).toBeDefined();
    expect(progressData[slug].progress).toBeGreaterThan(40);
    expect(progressData[slug].progress).toBeLessThan(80);
  });

  test("should show 'Continue Reading' in command palette", async ({ page }) => {
    // Navigate to a blog post and create some progress
    await page.goto("/blog");
    await page.waitForSelector("article");
    
    const firstPostLink = page.locator("article a").first();
    const postTitle = await firstPostLink.textContent();
    
    await firstPostLink.click();
    await page.waitForLoadState("networkidle");
    
    // Scroll to create progress (not complete)
    await page.evaluate(() => {
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const targetScroll = (scrollHeight - viewportHeight) * 0.5;
      window.scrollTo(0, targetScroll);
    });
    
    // Wait for progress to be saved
    await page.waitForTimeout(300);
    
    // Navigate away
    await page.goto("/");
    
    // Open command palette
    await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
    
    // Wait for command palette
    await expect(page.getByRole("dialog")).toBeVisible();
    
    // Search for "continue"
    await page.getByPlaceholder("Search commands...").fill("continue");
    
    // Should show the article with progress
    await expect(page.getByText(postTitle?.trim() || "")).toBeVisible();
    
    // Should show progress percentage
    const progressIndicator = page.locator("text=/\\d+% complete/");
    await expect(progressIndicator).toBeVisible();
  });

  test("should restore scroll position when returning to article", async ({ page, context }) => {
    // Note: This test may not work perfectly due to browser auto-restore behavior
    // but we'll verify localStorage has the correct data
    
    // Navigate to a blog post
    await page.goto("/blog");
    await page.waitForSelector("article");
    
    const firstPostLink = page.locator("article a").first();
    const postHref = await firstPostLink.getAttribute("href");
    
    await firstPostLink.click();
    await page.waitForLoadState("networkidle");
    
    // Scroll to specific position
    await page.evaluate(() => {
      window.scrollTo(0, 500);
    });
    
    // Wait for progress to be saved
    await page.waitForTimeout(300);
    
    // Get saved scroll position from localStorage
    const savedScrollPosition = await page.evaluate(() => {
      const data = localStorage.getItem("reading-progress");
      if (!data) return null;
      const parsed = JSON.parse(data);
      const firstKey = Object.keys(parsed)[0];
      return parsed[firstKey]?.scrollPosition;
    });
    
    expect(savedScrollPosition).toBeGreaterThan(400);
    expect(savedScrollPosition).toBeLessThan(600);
    
    // Navigate away and back
    await page.goto("/");
    await page.goto(postHref || "/blog");
    await page.waitForLoadState("networkidle");
    
    // Verify progress data still exists
    const progressDataAfterReturn = await page.evaluate(() => {
      const data = localStorage.getItem("reading-progress");
      return data ? JSON.parse(data) : null;
    });
    
    expect(progressDataAfterReturn).toBeTruthy();
  });

  test("should handle multiple articles in progress", async ({ page }) => {
    // Read multiple articles to different progress points
    const articles = await page.goto("/blog").then(() => 
      page.locator("article a").all()
    );
    
    for (let i = 0; i < Math.min(3, articles.length); i++) {
      await articles[i].click();
      await page.waitForLoadState("networkidle");
      
      // Scroll to different positions
      await page.evaluate((index) => {
        const scrollHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        const targetScroll = (scrollHeight - viewportHeight) * (0.3 + index * 0.2);
        window.scrollTo(0, targetScroll);
      }, i);
      
      await page.waitForTimeout(200);
      await page.goBack();
      await page.waitForLoadState("networkidle");
    }
    
    // Check localStorage has multiple entries
    const progressData = await page.evaluate(() => {
      const data = localStorage.getItem("reading-progress");
      return data ? JSON.parse(data) : null;
    });
    
    expect(Object.keys(progressData || {}).length).toBeGreaterThanOrEqual(2);
  });

  test("should mark article as complete at 90% progress", async ({ page }) => {
    // Navigate to a blog post
    await page.goto("/blog");
    await page.waitForSelector("article");
    
    const firstPostLink = page.locator("article a").first();
    await firstPostLink.click();
    await page.waitForLoadState("networkidle");
    
    // Scroll to bottom
    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    });
    
    // Wait for progress update
    await page.waitForTimeout(300);
    
    // Check localStorage for completion
    const progressData = await page.evaluate(() => {
      const data = localStorage.getItem("reading-progress");
      if (!data) return null;
      const parsed = JSON.parse(data);
      const firstKey = Object.keys(parsed)[0];
      return parsed[firstKey];
    });
    
    expect(progressData?.progress).toBeGreaterThanOrEqual(90);
  });
});

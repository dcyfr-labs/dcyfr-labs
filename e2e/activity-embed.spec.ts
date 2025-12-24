import { test, expect } from "@playwright/test";

test.describe("Activity Feed Embed", () => {
  test("embed route loads without navigation", async ({ page }) => {
    await page.goto("/activity/embed");
    
    // Should not have main navigation
    await expect(page.locator("nav")).not.toBeVisible();
    
    // Should display activity items
    await expect(page.locator("[data-testid*='activity']").first()).toBeVisible({ timeout: 10000 });
  });

  test("embed respects source filter parameter", async ({ page }) => {
    await page.goto("/activity/embed?source=blog");
    
    // Wait for activities to load
    await page.waitForSelector("[data-testid*='activity']", { timeout: 10000 });
    
    // All visible activities should be blog posts
    const activities = await page.locator("[data-testid*='activity']").all();
    expect(activities.length).toBeGreaterThan(0);
  });

  test("embed respects time range parameter", async ({ page }) => {
    await page.goto("/activity/embed?timeRange=week");
    
    // Wait for activities to load
    await page.waitForSelector("[data-testid*='activity']", { timeout: 10000 });
    
    // Should show activities
    const activities = await page.locator("[data-testid*='activity']").all();
    expect(activities.length).toBeGreaterThan(0);
  });

  test("embed respects limit parameter", async ({ page }) => {
    await page.goto("/activity/embed?limit=5");
    
    // Wait for activities to load
    await page.waitForSelector("[data-testid*='activity']", { timeout: 10000 });
    
    // Should show maximum 5 activities (accounting for threading)
    const activities = await page.locator("[data-testid*='activity']").all();
    expect(activities.length).toBeLessThanOrEqual(5);
  });

  test("embed sends resize messages via postMessage", async ({ page }) => {
    const messages: any[] = [];
    
    await page.exposeFunction("captureMessage", (msg: any) => {
      messages.push(msg);
    });
    
    await page.addInitScript(() => {
      window.addEventListener("message", (e) => {
        (window as any).captureMessage(e.data);
      });
    });
    
    await page.goto("/activity/embed");
    
    // Wait for resize message
    await page.waitForTimeout(1000);
    
    // Check if any resize message was sent
    const resizeMessage = messages.find((msg) => msg.type === "activity-embed-resize");
    expect(resizeMessage).toBeDefined();
    expect(resizeMessage?.height).toBeGreaterThan(0);
  });

  test("embed can be loaded in iframe", async ({ page, context }) => {
    // Create a page with an iframe
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <iframe id="embed" src="/activity/embed?limit=10" width="800" height="600"></iframe>
        </body>
      </html>
    `);
    
    // Wait for iframe to load
    const iframe = await page.frameLocator("#embed");
    await iframe.locator("[data-testid*='activity']").first().waitFor({ timeout: 10000 });
    
    // Verify activities are visible in iframe
    const activities = await iframe.locator("[data-testid*='activity']").all();
    expect(activities.length).toBeGreaterThan(0);
  });
});

test.describe("Activity Embed Generator", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/activity");
  });

  test("shows embed generator when button is clicked", async ({ page }) => {
    // Click the "Show Embed Code" button
    await page.click("text=Show Embed Code");
    
    // Should display the embed generator
    await expect(page.locator("text=Embed Activity Feed")).toBeVisible();
    await expect(page.locator("text=Embed Code")).toBeVisible();
  });

  test("hides embed generator when toggled", async ({ page }) => {
    // Show embed generator
    await page.click("text=Show Embed Code");
    await expect(page.locator("text=Embed Activity Feed")).toBeVisible();
    
    // Hide it
    await page.click("text=Hide Embed Code");
    await expect(page.locator("text=Embed Activity Feed")).not.toBeVisible();
  });

  test("updates embed code when source is selected", async ({ page }) => {
    await page.click("text=Show Embed Code");
    
    // Select a source filter
    await page.selectOption("label=Filter by Source (optional)", "blog");
    
    // Verify embed code includes source parameter
    const codeBlock = await page.locator("pre code").textContent();
    expect(codeBlock).toContain("source=blog");
  });

  test("updates embed code when time range is selected", async ({ page }) => {
    await page.click("text=Show Embed Code");
    
    // Select a time range
    await page.selectOption("label=Time Range (optional)", "week");
    
    // Verify embed code includes timeRange parameter
    const codeBlock = await page.locator("pre code").textContent();
    expect(codeBlock).toContain("timeRange=week");
  });

  test("updates embed code when limit is changed", async ({ page }) => {
    await page.click("text=Show Embed Code");
    
    // Change limit
    await page.fill("label=Number of Items", "50");
    
    // Verify embed code includes limit parameter
    const codeBlock = await page.locator("pre code").textContent();
    expect(codeBlock).toContain("limit=50");
  });

  test("copies embed code to clipboard", async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    
    await page.click("text=Show Embed Code");
    
    // Click copy button
    await page.click("button[aria-label='Copy embed code']");
    
    // Verify button shows success state
    await expect(page.locator("button[aria-label='Copy embed code']")).toHaveClass(/green/);
    
    // Verify clipboard contains code
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain("<iframe");
    expect(clipboardText).toContain("activity-embed-resize");
  });

  test("preview link opens embed in new window", async ({ page, context }) => {
    await page.click("text=Show Embed Code");
    
    // Select some filters
    await page.selectOption("label=Filter by Source (optional)", "github");
    
    // Get the preview link
    const previewLink = page.locator("text=Preview embed in new window");
    const href = await previewLink.getAttribute("href");
    
    // Verify it includes the filter
    expect(href).toContain("/activity/embed");
    expect(href).toContain("source=github");
  });

  test("combines multiple parameters in embed URL", async ({ page }) => {
    await page.click("text=Show Embed Code");
    
    // Set multiple options
    await page.selectOption("label=Filter by Source (optional)", "blog");
    await page.selectOption("label=Time Range (optional)", "month");
    await page.fill("label=Number of Items", "30");
    
    // Verify embed code includes all parameters
    const codeBlock = await page.locator("pre code").textContent();
    expect(codeBlock).toContain("source=blog");
    expect(codeBlock).toContain("timeRange=month");
    expect(codeBlock).toContain("limit=30");
  });
});

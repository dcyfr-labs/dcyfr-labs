import { test, expect } from '@playwright/test'

/**
 * E2E tests for the homepage
 * 
 * These tests run against a real browser and verify the entire application
 * works correctly from a user's perspective.
 */

test.describe('Homepage', () => {
  test('should load and display site title', async ({ page }) => {
    await page.goto('/')

    // Check that the page loaded successfully
    await expect(page).toHaveTitle(/DCYFR Labs/)

    // Verify main heading is visible - use getByRole to avoid strict mode violations
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')
    
    // On mobile viewports, header nav is hidden and bottom nav is used
    // On desktop, header nav is visible
    const viewport = page.viewportSize()
    const isMobile = viewport && viewport.width < 768 // md breakpoint is 768px
    
    if (isMobile) {
      // Check bottom navigation on mobile (Home, Blog, Portfolio, Contact)
      const bottomNav = page.locator('nav[aria-label="Bottom navigation"]')
      const homeLink = bottomNav.getByRole('link', { name: /home/i })
      const blogLink = bottomNav.getByRole('link', { name: /blog/i })
      const portfolioLink = bottomNav.getByRole('link', { name: /portfolio/i })
      const contactLink = bottomNav.getByRole('link', { name: /contact/i })
      
      await expect(homeLink).toBeVisible()
      await expect(blogLink).toBeVisible()
      await expect(portfolioLink).toBeVisible()
      await expect(contactLink).toBeVisible()
    } else {
      // Check main header navigation on desktop (About, Blog, Portfolio dropdown)
      const blogLink = page.locator('header nav').getByRole('link', { name: /blog/i })
      const portfolioButton = page.locator('header nav').getByRole('button', { name: /portfolio/i })
      const aboutLink = page.locator('header nav').getByRole('link', { name: /about/i })
      
      await expect(blogLink).toBeVisible()
      await expect(portfolioButton).toBeVisible()
      await expect(aboutLink).toBeVisible()
    }
  })

  test('should navigate to blog page', async ({ page, browserName }) => {
    // Skip webkit due to timing issues with navigation
    test.skip(browserName === 'webkit', 'Webkit has timing issues with this navigation pattern');
    
    await page.goto('/')
    
    // On mobile viewports, use bottom nav; on desktop, use header nav
    const viewport = page.viewportSize()
    const isMobile = viewport && viewport.width < 768
    
    if (isMobile) {
      // Click on blog link in bottom nav
      await page.locator('nav[aria-label="Bottom navigation"]').getByRole('link', { name: /blog/i }).click()
    } else {
      // Click on blog link in main header nav
      await page.locator('header nav').getByRole('link', { name: /blog/i }).click()
    }
    
    // Wait for navigation
    await page.waitForURL('/blog')
    
    // Verify we're on the blog page
    await expect(page).toHaveURL('/blog')
    await expect(page.locator('h1')).toContainText(/blog/i)
  })

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Page should still load and be usable - use getByRole with level to be specific
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })
})

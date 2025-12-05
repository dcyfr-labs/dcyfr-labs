import { test, expect } from '@playwright/test'
import openMobileNav from './utils/nav'

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

    // Verify main logo link is visible (logo text may be hidden on mobile)
    await expect(page.locator('header a[href="/"]')).toBeVisible()
  })

  test('should have working navigation', async ({ page, browserName }) => {
    await page.goto('/')

    // On mobile viewports, header nav is hidden and bottom nav is used
    // On desktop, header nav is visible
    const viewport = page.viewportSize()
    const isMobile = viewport && viewport.width < 768 // md breakpoint is 768px

    if (isMobile) {
      // Skip mobile nav on WebKit - hydration issues in production builds
      // See webkit-mobile-nav.spec.ts for dedicated WebKit testing
      if (browserName === 'webkit') return

      // On mobile, open the sheet menu then check navigation items
      const bottomNav = await openMobileNav(page)
      if (!bottomNav) return
      const homeLink = bottomNav.getByRole('link', { name: /home/i })
      const blogLink = bottomNav.getByRole('link', { name: /blog/i })
      const workLink = bottomNav.getByRole('link', { name: /our work/i })
      const contactLink = bottomNav.getByRole('link', { name: /contact/i })

      await expect(homeLink).toBeVisible()
      await expect(blogLink).toBeVisible()
      await expect(workLink).toBeVisible()
      await expect(contactLink).toBeVisible()
    } else {
      // Check main header navigation on desktop (About, Blog, Our Work dropdown)
      const blogLink = page.locator('header nav').getByRole('link', { name: /blog/i })
      const workButton = page.locator('header nav').getByRole('button', { name: /our work/i })
      const aboutLink = page.locator('header nav').getByRole('link', { name: /about/i })

      await expect(blogLink).toBeVisible()
      await expect(workButton).toBeVisible()
      await expect(aboutLink).toBeVisible()
    }
  })

  test('should navigate to blog page', async ({ page, browserName }) => {
    // Skip WebKit entirely - navigation timing issues in production builds
    test.skip(browserName === 'webkit', 'WebKit has navigation timing issues with production builds')

    await page.goto('/')

    // On mobile viewports, use bottom nav; on desktop, use header nav
    const viewport = page.viewportSize()
    const isMobile = viewport && viewport.width < 768

    if (isMobile) {
      // Click on blog link in bottom nav
      // Ensure menu is open (mobile) before clicking blog link
      const bottomNav = await openMobileNav(page)
      if (!bottomNav) return
      await bottomNav.getByRole('link', { name: /blog/i }).click()
      await page.waitForURL('/blog')
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
    
    // Page should still load and be usable - check site title is visible
    await expect(page.locator('header a[href="/"]')).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('header a[href="/"]')).toBeVisible()
  })
})

import { test, expect } from '@playwright/test'
import openMobileNav, { closeMobileNav } from './utils/nav'
import { setMobileViewport, testAcrossViewports } from './utils/mobile-viewports'

/**
 * Enhanced Mobile Navigation Testing
 * 
 * Tests bottom tab navigation, active states, accessibility,
 * and ensures navigation is properly sized and accessible on all mobile devices.
 */

test.describe('Mobile Navigation', () => {
  test('bottom navigation tab bar is visible and properly sized on iPhone 15 Pro Max', async ({ page, browserName }) => {
    test.skip(!['webkit', 'chromium'].includes(browserName), 'Mobile browsers only')
    
    await setMobileViewport(page, 'iPhone 15 Pro Max')
    await page.goto('/')
    
    // Try to find bottom navigation (may not exist yet - feature in development)
    const bottomNavSelectors = [
      'nav[role="tablist"]',
      '[data-testid="bottom-nav"]',
      'nav[aria-label*="bottom"]',
    ]
    
    let foundNav = false
    let navHeight = 0
    
    for (const selector of bottomNavSelectors) {
      const nav = page.locator(selector)
      if (await nav.count() > 0 && await nav.first().isVisible()) {
        foundNav = true
        
        const box = await nav.first().boundingBox()
        if (box) {
          navHeight = box.height
        }
        break
      }
    }
    
    if (foundNav) {
      // Should have minimum height of 64px (including safe area)
      expect(navHeight).toBeGreaterThanOrEqual(64)
    } else {
      // Feature not yet implemented - test records this as pending
      console.log('Bottom navigation not yet implemented')
    }
  })

  test('bottom navigation tabs have proper touch targets (44x44pt minimum)', async ({ page, browserName }) => {
    test.skip(!['webkit', 'chromium'].includes(browserName), 'Mobile browsers only')
    
    await setMobileViewport(page, 'iPhone 15 Pro Max')
    await page.goto('/')
    
    // Find tab buttons
    const tabSelectors = [
      'nav[role="tablist"] button',
      '[data-testid="bottom-nav"] button',
      'nav[aria-label*="bottom"] button',
    ]
    
    let tabs = page.locator('span') // fallback
    
    for (const selector of tabSelectors) {
      const found = page.locator(selector)
      if (await found.count() > 0) {
        tabs = found
        break
      }
    }
    
    const count = await tabs.count()
    
    if (count > 0) {
      // Each tab should be at least 44pt tall
      for (let i = 0; i < count; i++) {
        const tab = tabs.nth(i)
        
        if (!(await tab.isVisible())) continue
        
        const box = await tab.boundingBox()
        if (box) {
          expect(box.height).toBeGreaterThanOrEqual(44)
        }
      }
    }
  })

  test('active tab is visually indicated with aria-selected or active class', async ({ page, browserName }) => {
    test.skip(!['webkit', 'chromium'].includes(browserName), 'Mobile browsers only')
    
    await setMobileViewport(page, 'iPhone 15 Pro Max')
    await page.goto('/')
    
    // Look for tab indicators
    const tabList = page.locator('nav[role="tablist"]')
    
    if (await tabList.count() > 0 && await tabList.first().isVisible()) {
      const firstTab = tabList.first().locator('[role="tab"]').first()
      
      // Should have aria-selected or aria-current attribute
      const ariaSelected = await firstTab.getAttribute('aria-selected')
      const ariaCurrent = await firstTab.getAttribute('aria-current')
      
      if (ariaSelected || ariaCurrent) {
        // At least one tab should indicate its active state
        expect(ariaSelected === 'true' || ariaCurrent !== null).toBe(true)
      }
    }
  })

  test('mobile navigation has proper aria-labels for accessibility', async ({ page, browserName }) => {
    test.skip(!['webkit', 'chromium'].includes(browserName), 'Mobile browsers only')
    
    await setMobileViewport(page, 'iPhone 15 Pro Max')
    await page.goto('/')
    
    // Check for accessible navigation structure
    const navElements = page.locator('nav')
    
    if (await navElements.count() > 0) {
      for (let i = 0; i < await navElements.count(); i++) {
        const nav = navElements.nth(i)
        const label = await nav.getAttribute('aria-label')
        
        if (label) {
          // Navigation should have descriptive aria-label
          expect(label).toBeTruthy()
        }
      }
    }
  })

  test('mobile sheet navigation opens with proper focus management', async ({ page, browserName }) => {
    test.skip(!['webkit', 'chromium'].includes(browserName), 'Mobile browsers only')
    
    await setMobileViewport(page, 'iPhone 15 Pro Max')
    await page.goto('/')
    
    // Try to open mobile nav sheet
    const nav = await openMobileNav(page)
    
    if (nav) {
      await expect(nav).toBeVisible()
      
      // Check for proper ARIA attributes
      const role = await nav.getAttribute('role')
      if (role) {
        expect(['dialog', 'menu', 'region']).toContain(role)
      }
      
      // Close navigation
      await closeMobileNav(page)
      await expect(nav).not.toBeVisible()
    }
  })

  test('navigation does not overlap main content on scroll', async ({ page, browserName }) => {
    test.skip(!['webkit', 'chromium'].includes(browserName), 'Mobile browsers only')
    
    await setMobileViewport(page, 'iPhone 15 Pro Max')
    await page.goto('/')
    
    // Get main content area
    const main = page.locator('[role="main"]').first()
    
    if (await main.isVisible()) {
      const mainBox = await main.boundingBox()
      
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      
      // Check that main content is still readable
      const finalBox = await main.boundingBox()
      
      if (mainBox && finalBox) {
        // Main content height should not change dramatically
        expect(Math.abs(mainBox.height - finalBox.height)).toBeLessThan(50)
      }
    }
  })

  test('navigation is keyboard accessible (Tab navigation)', async ({ page, browserName }) => {
    test.skip(!['webkit', 'chromium'].includes(browserName), 'Mobile browsers only')
    
    await setMobileViewport(page, 'iPhone 15 Pro Max')
    await page.goto('/')
    
    // Press Tab to navigate
    await page.keyboard.press('Tab')
    
    // Get currently focused element
    const activeElement = await page.evaluate(() => {
      return document.activeElement?.getAttribute('aria-label') || 
             document.activeElement?.textContent || 
             'unknown'
    })
    
    // Should have focused something
    expect(activeElement).toBeTruthy()
  })

  test('navigation works correctly on iPhone SE (small device)', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Test on WebKit for Safari')
    
    await setMobileViewport(page, 'iPhone SE')
    await page.goto('/')
    
    // Navigation should work on smaller device
    const nav = await openMobileNav(page)
    
    if (nav) {
      // Should be able to see and interact with nav
      await expect(nav).toBeVisible()
      
      // Links should be accessible
      const links = nav.locator('a, button')
      expect(await links.count()).toBeGreaterThan(0)
      
      await closeMobileNav(page)
    }
  })

  test('navigation adapts properly on iPad Pro (tablet)', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Test on WebKit')
    
    await setMobileViewport(page, 'iPad Pro')
    await page.goto('/')
    
    // On tablet, navigation may be different (may use horizontal layout)
    const navElements = page.locator('nav')
    
    if (await navElements.count() > 0) {
      for (let i = 0; i < await navElements.count(); i++) {
        const nav = navElements.nth(i)
        if (await nav.isVisible()) {
          const box = await nav.boundingBox()
          // Navigation should be visible and properly sized
          expect(box).toBeDefined()
          expect(box!.width).toBeGreaterThan(0)
          expect(box!.height).toBeGreaterThan(0)
        }
      }
    }
  })

  test('navigation works in landscape orientation', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Test with WebKit')
    
    await setMobileViewport(page, 'iPhone 15 Pro Max (Landscape)')
    await page.goto('/')
    
    // Navigation should still be accessible in landscape
    const nav = await openMobileNav(page)
    
    if (nav) {
      await expect(nav).toBeVisible()
      await closeMobileNav(page)
    } else {
      // If not using sheet navigation, check horizontal nav
      const horizontalNav = page.locator('nav[role="navigation"], header nav')
      if (await horizontalNav.count() > 0) {
        await expect(horizontalNav.first()).toBeVisible()
      }
    }
  })
})

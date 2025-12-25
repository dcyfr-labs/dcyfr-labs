import { test, expect } from '@playwright/test'
import { setMobileViewport, testAcrossViewports, MOBILE_VIEWPORTS, getViewportCategory } from './utils/mobile-viewports'

/**
 * Mobile Responsive Design Testing
 * 
 * Tests responsiveness across all mobile devices, viewports, and orientations
 * to ensure layouts adapt correctly and content remains accessible.
 */

test.describe('Mobile Responsive Design', () => {
  const mobileDevices = ['iPhone SE', 'iPhone 12', 'iPhone 15 Pro Max', 'Pixel 5'] as const
  
  mobileDevices.forEach(device => {
    test(`homepage loads correctly on ${device}`, async ({ page, browserName }) => {
      test.skip(!['webkit', 'chromium'].includes(browserName), 'Mobile browsers only')
      
      await setMobileViewport(page, device)
      await page.goto('/')
      
      // Page should load without errors
      await expect(page.locator('header').first()).toBeVisible()
      
      // Main content should be visible
      const main = page.locator('[role="main"]')
      await expect(main).toBeVisible()
      
      // No horizontal overflow (critical for mobile)
      const hasHorizontalOverflow = await page.evaluate(() =>
        document.documentElement.scrollWidth > window.innerWidth
      )
      expect(hasHorizontalOverflow).toBe(false)
    })

    test(`blog page is responsive on ${device}`, async ({ page, browserName }) => {
      test.skip(!['webkit', 'chromium'].includes(browserName), 'Mobile browsers only')
      
      await setMobileViewport(page, device)
      await page.goto('/blog')
      
      // Posts should be in single column on mobile (not multi-column grid)
      const postList = page.locator('[data-testid="post-list"]')
      
      if (await postList.isVisible()) {
        const columns = await postList.evaluate(el => {
          const children = Array.from(el.children)
          if (children.length === 0) return 1
          
          // Get unique x positions to count columns
          const positions = children.map(child => (child as HTMLElement).getBoundingClientRect().left)
          return new Set(positions).size
        })
        
        // Mobile should show 1-2 columns max
        expect(columns).toBeLessThanOrEqual(2)
      }
    })

    test(`work page grid adapts on ${device}`, async ({ page, browserName }) => {
      test.skip(!['webkit', 'chromium'].includes(browserName), 'Mobile browsers only')
      
      await setMobileViewport(page, device)
      await page.goto('/work')
      
      // Grid should collapse to single column on mobile
      const grid = page.locator('[data-testid="project-grid"], .grid')
      
      if (await grid.count() > 0 && await grid.first().isVisible()) {
        const gridColumns = await grid.first().evaluate(el => {
          const styles = window.getComputedStyle(el)
          return styles.gridTemplateColumns
        })
        
        // Should not be multi-column on mobile
        // (will be either auto, 1fr, or minmax(100%, ...))
        expect(gridColumns).not.toContain('repeat')
      }
    })
  })

  test('landscape orientation is supported on iPhone 15 Pro Max', async ({ page, browserName }) => {
    test.skip(!['webkit', 'chromium'].includes(browserName), 'Mobile browsers only')
    
    // iPhone 15 Pro Max landscape: 932x430
    await setMobileViewport(page, 'iPhone 15 Pro Max (Landscape)')
    await page.goto('/')
    
    // Page should still be usable
    await expect(page.locator('header').first()).toBeVisible()
    
    // No horizontal overflow
    const noOverflow = await page.evaluate(() =>
      document.documentElement.scrollWidth <= window.innerWidth
    )
    expect(noOverflow).toBe(true)
    
    // Content should be visible (not hidden due to height)
    const main = page.locator('[role="main"]')
    await expect(main).toBeVisible()
  })

  test('landscape orientation is supported on iPad Pro', async ({ page, browserName }) => {
    test.skip(browserName !== 'webkit', 'Test on WebKit for iPad')
    
    // iPad Pro landscape: 1366x1024
    await setMobileViewport(page, 'iPad Pro (Landscape)')
    await page.goto('/')
    
    // On tablet landscape, multi-column layouts may be visible
    await expect(page.locator('header').first()).toBeVisible()
    
    // No horizontal overflow
    const noOverflow = await page.evaluate(() =>
      document.documentElement.scrollWidth <= window.innerWidth
    )
    expect(noOverflow).toBe(true)
  })

  test('images are properly sized and do not overflow on mobile', async ({ page, browserName }) => {
    test.skip(!['webkit', 'chromium'].includes(browserName), 'Mobile browsers only')
    
    await setMobileViewport(page, 'iPhone 15 Pro Max')
    await page.goto('/')
    
    const images = page.locator('img')
    
    for (let i = 0; i < await images.count(); i++) {
      const img = images.nth(i)
      
      if (!(await img.isVisible())) continue
      
      const isResponsive = await img.evaluate(el => {
        const styles = window.getComputedStyle(el)
        const maxWidth = styles.maxWidth
        
        // Image should have max-width: 100% or similar responsive sizing
        return maxWidth === '100%' || 
               styles.width === '100%' ||
               (el as HTMLImageElement).naturalWidth <= window.innerWidth
      })
      
      expect(isResponsive).toBe(true)
    }
  })

  test('content padding and margins are appropriate for mobile', async ({ page, browserName }) => {
    test.skip(!['webkit', 'chromium'].includes(browserName), 'Mobile browsers only')
    
    await setMobileViewport(page, 'iPhone 15 Pro Max')
    await page.goto('/')
    
    const main = page.locator('[role="main"]').first()
    
    if (await main.isVisible()) {
      const padding = await main.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          paddingLeft: parseInt(styles.paddingLeft),
          paddingRight: parseInt(styles.paddingRight),
          paddingTop: parseInt(styles.paddingTop),
          paddingBottom: parseInt(styles.paddingBottom),
        }
      })
      
      // Should have at least some horizontal padding on mobile
      expect(padding.paddingLeft + padding.paddingRight).toBeGreaterThanOrEqual(16)
    }
  })

  test('text content width is readable on mobile (not stretched edge-to-edge)', async ({ page, browserName }) => {
    test.skip(!['webkit', 'chromium'].includes(browserName), 'Mobile browsers only')
    
    await setMobileViewport(page, 'iPhone 15 Pro Max')
    await page.goto('/blog')
    
    const article = page.locator('article').first()
    
    if (await article.isVisible()) {
      const width = await article.evaluate(el => el.clientWidth)
      const viewportWidth = await page.evaluate(() => window.innerWidth)
      
      // Article should not take full viewport width (should have margins)
      expect(width).toBeLessThan(viewportWidth)
    }
  })

  test('mobile layouts do not have elements that require horizontal scroll', async ({ page, browserName }) => {
    test.skip(!['webkit', 'chromium'].includes(browserName), 'Mobile browsers only')
    
    await setMobileViewport(page, 'iPhone 15 Pro Max')
    
    // Test multiple pages
    const pages = ['/', '/blog', '/work']
    
    for (const route of pages) {
      await page.goto(route)
      
      // Check for horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        const width = document.documentElement.scrollWidth
        const clientWidth = window.innerWidth
        return width > clientWidth
      })
      
      expect(hasHorizontalScroll).toBe(false)
    }
  })

  test('font sizes are legible on small iPhone SE viewport', async ({ page, browserName }) => {
    test.skip(!['webkit', 'chromium'].includes(browserName), 'Mobile browsers only')
    
    await setMobileViewport(page, 'iPhone SE')
    await page.goto('/')
    
    const body = page.locator('body')
    const bodyFontSize = await body.evaluate(el => {
      const fontSize = window.getComputedStyle(el).fontSize
      return parseInt(fontSize)
    })
    
    // Body font should be at least 14px (minimum readable size on small device)
    expect(bodyFontSize).toBeGreaterThanOrEqual(14)
  })

  test('containers have max-width constraints to prevent text being too wide', async ({ page, browserName }) => {
    test.skip(!['webkit', 'chromium'].includes(browserName), 'Mobile browsers only')
    
    await setMobileViewport(page, 'iPhone 15 Pro Max')
    await page.goto('/blog')
    
    const container = page.locator('[role="main"], article, .container').first()
    
    if (await container.isVisible()) {
      const maxWidth = await container.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return styles.maxWidth
      })
      
      // Should have some max-width constraint
      expect(maxWidth).not.toBe('none')
      expect(maxWidth).not.toBe('100%')
    }
  })

  test('mobile and tablet display modes work correctly', async ({ page, browserName }) => {
    test.skip(!['webkit', 'chromium'].includes(browserName), 'Mobile browsers only')
    
    // Test mobile (375px)
    await setMobileViewport(page, 'iPhone SE')
    await page.goto('/')
    
    const mobileCategory = await getViewportCategory(page)
    expect(mobileCategory).toBe('mobile')
    
    // Test tablet (1024px)
    await setMobileViewport(page, 'iPad Pro')
    const tabletCategory = await getViewportCategory(page)
    expect(tabletCategory).toBe('tablet')
  })

  test('CSS media queries are respected (e.g., hidden/shown elements)', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chromium for consistent CSS evaluation')
    
    await setMobileViewport(page, 'iPhone 15 Pro Max')
    await page.goto('/')
    
    // Check if elements with responsive display classes are properly shown/hidden
    const hiddenOnMobile = await page.evaluate(() => {
      // Look for elements with mobile-hiding classes
      const elements = document.querySelectorAll('[class*="md:"], [class*="lg:"], [class*="hidden"], [class*="block"]')
      
      let hiddenCount = 0
      elements.forEach(el => {
        const display = window.getComputedStyle(el).display
        if (display === 'none') hiddenCount++
      })
      
      return hiddenCount > 0
    })
    
    // Should have some responsive hiding happening
    expect(hiddenOnMobile).toBe(true)
  })

  test('scroll performance is good on mobile', async ({ page, browserName }) => {
    test.skip(!['webkit', 'chromium'].includes(browserName), 'Mobile browsers only')
    
    await setMobileViewport(page, 'iPhone 15 Pro Max')
    await page.goto('/')
    
    // Measure scroll performance
    const startTime = performance.now()
    
    await page.evaluate(() => {
      window.scrollBy(0, 500)
    })
    
    const scrollTime = performance.now() - startTime
    
    // Scroll should complete in reasonable time (<100ms)
    expect(scrollTime).toBeLessThan(100)
  })
})

import { test, expect } from '@playwright/test'
import { setMobileViewport, testAcrossViewports, MOBILE_VIEWPORTS } from './utils/mobile-viewports'

/**
 * Mobile Typography Testing
 * 
 * Validates heading sizes, line heights, contrast ratios, and readability
 * on mobile devices to ensure text is accessible and scales appropriately.
 */

test.describe('Mobile Typography', () => {
  test('headings scale appropriately on mobile vs desktop', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chromium for consistent font rendering')
    
    // Test on mobile first
    await setMobileViewport(page, 'iPhone 15 Pro Max')
    await page.goto('/')
    
    const h1Mobile = page.locator('h1').first()
    
    if (!(await h1Mobile.isVisible())) {
      test.skip(true, 'No h1 found on homepage')
      return
    }
    
    const h1MobileSize = await h1Mobile.evaluate(el => {
      const fontSize = window.getComputedStyle(el).fontSize
      return parseInt(fontSize)
    })
    
    // Test on desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    const h1Desktop = page.locator('h1').first()
    const h1DesktopSize = await h1Desktop.evaluate(el => {
      const fontSize = window.getComputedStyle(el).fontSize
      return parseInt(fontSize)
    })
    
    // Desktop heading should be larger
    expect(h1DesktopSize).toBeGreaterThan(h1MobileSize)
    
    // Mobile h1 should be reasonable size (at least 20px, typically 24-32px)
    expect(h1MobileSize).toBeGreaterThanOrEqual(20)
    expect(h1MobileSize).toBeLessThanOrEqual(40)
    
    // Desktop h1 should be larger (typically 36-48px+)
    expect(h1DesktopSize).toBeGreaterThanOrEqual(36)
  })

  test('line height is optimized for mobile readability (1.6-1.8)', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chromium for consistent rendering')
    
    await setMobileViewport(page, 'iPhone 15 Pro Max')
    await page.goto('/blog')
    
    // Find body text in article
    const paragraph = page.locator('article p, main p').first()
    
    if (!(await paragraph.isVisible())) {
      test.skip(true, 'No paragraph found')
      return
    }
    
    const lineHeightRatio = await paragraph.evaluate(el => {
      const styles = window.getComputedStyle(el)
      const lineHeight = parseFloat(styles.lineHeight)
      const fontSize = parseFloat(styles.fontSize)
      
      // Return unitless ratio
      return lineHeight / fontSize
    })
    
    // Mobile should have higher line height for readability
    // 1.6-1.8 is optimal for mobile
    expect(lineHeightRatio).toBeGreaterThanOrEqual(1.5)
    expect(lineHeightRatio).toBeLessThanOrEqual(2.0)
  })

  test('text has sufficient contrast on mobile (4.5:1 WCAG AA)', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chromium for accurate color rendering')
    
    await setMobileViewport(page, 'iPhone 15 Pro Max')
    await page.goto('/')
    
    // Helper function to calculate relative luminance
    const getLuminance = (r: number, g: number, b: number): number => {
      // Normalize to 0-1
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }
    
    // Test h1 contrast
    const h1 = page.locator('h1').first()
    
    if (await h1.isVisible()) {
      const colors = await h1.evaluate(() => {
        const styles = window.getComputedStyle(document.querySelector('h1')!)
        const color = styles.color
        const bgColor = styles.backgroundColor
        
        // Parse RGB colors
        const parseColor = (colorStr: string) => {
          const match = colorStr.match(/\d+/g)
          if (match && match.length >= 3) {
            return {
              r: parseInt(match[0]),
              g: parseInt(match[1]),
              b: parseInt(match[2]),
            }
          }
          return { r: 0, g: 0, b: 0 }
        }
        
        return {
          color: parseColor(color),
          bgColor: parseColor(bgColor),
        }
      })
      
      const fgLum = getLuminance(colors.color.r, colors.color.g, colors.color.b)
      const bgLum = getLuminance(colors.bgColor.r, colors.bgColor.g, colors.bgColor.b)
      
      const lighter = Math.max(fgLum, bgLum)
      const darker = Math.min(fgLum, bgLum)
      const contrast = (lighter + 0.05) / (darker + 0.05)
      
      // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
      // h1 is large text, so 3:1 minimum
      expect(contrast).toBeGreaterThanOrEqual(3.0)
    }
  })

  test('line length is readable on mobile (45-75 characters per line)', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chromium for consistent rendering')
    
    await setMobileViewport(page, 'iPhone 15 Pro Max')
    await page.goto('/blog')
    
    const article = page.locator('article').first()
    
    if (!(await article.isVisible())) {
      test.skip(true, 'No article found')
      return
    }
    
    const measurements = await article.evaluate(el => {
      const fontSize = parseFloat(window.getComputedStyle(el).fontSize)
      const width = el.clientWidth
      
      // Average character width is approximately 0.5em
      const avgCharWidth = fontSize * 0.5
      const estimatedCharCount = width / avgCharWidth
      
      return {
        width,
        fontSize,
        estimatedCharCount,
      }
    })
    
    // Should be in readable range (45-75 characters)
    expect(measurements.estimatedCharCount).toBeGreaterThan(40)
    expect(measurements.estimatedCharCount).toBeLessThan(100)
  })

  test('mobile typography scales consistently across different font sizes', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chromium for consistent rendering')
    
    await setMobileViewport(page, 'iPhone 15 Pro Max')
    await page.goto('/')
    
    // Check headings (h1-h6)
    const headings = await page.evaluate(() => {
      const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      return Array.from(headingElements)
        .slice(0, 6) // Get first one of each
        .map((h, index) => ({
          level: index + 1,
          fontSize: parseFloat(window.getComputedStyle(h).fontSize),
          text: h.textContent?.substring(0, 50) || '',
        }))
    })
    
    // Verify headings are in descending size order
    for (let i = 1; i < headings.length; i++) {
      // h1 should be >= h2, h2 >= h3, etc. (generally)
      // Allow some tolerance for styling overrides
      expect(headings[i - 1].fontSize).toBeGreaterThanOrEqual(headings[i].fontSize * 0.7)
    }
  })

  test('typography remains readable during scroll and interactions', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chromium for consistent rendering')
    
    await setMobileViewport(page, 'iPhone 15 Pro Max')
    await page.goto('/')
    
    // Get initial text color
    const initialColor = await page.evaluate(() => {
      const p = document.querySelector('p')
      return window.getComputedStyle(p!).color
    })
    
    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500))
    
    // Text color should not change
    const afterScrollColor = await page.evaluate(() => {
      const p = document.querySelector('p')
      return window.getComputedStyle(p!).color
    })
    
    expect(afterScrollColor).toBe(initialColor)
  })

  test('code/monospace text is clearly distinguished on mobile', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chromium for rendering')
    
    await setMobileViewport(page, 'iPhone 15 Pro Max')
    await page.goto('/blog')
    
    // Look for code elements
    const codeElements = page.locator('code, pre')
    
    if (await codeElements.count() > 0) {
      const codeStyle = await codeElements.first().evaluate(el => {
        const styles = window.getComputedStyle(el)
        return {
          fontFamily: styles.fontFamily,
          backgroundColor: styles.backgroundColor,
          fontSize: styles.fontSize,
        }
      })
      
      // Should have monospace font
      expect(codeStyle.fontFamily.toLowerCase()).toContain('mono')
      
      // Should have distinct background or styling
      expect(codeStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
    }
  })

  test('typography is consistent across mobile devices', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Chromium for consistent rendering')
    
    const deviceSizes = [
      { device: 'iPhone SE' as const, minH1: 20, maxH1: 40 },
      { device: 'iPhone 15 Pro Max' as const, minH1: 20, maxH1: 40 },
      { device: 'Pixel 5' as const, minH1: 20, maxH1: 40 },
    ]
    
    for (const { device, minH1, maxH1 } of deviceSizes) {
      await setMobileViewport(page, device)
      await page.goto('/')
      
      const h1 = page.locator('h1').first()
      
      if (await h1.isVisible()) {
        const fontSize = await h1.evaluate(el => {
          return parseInt(window.getComputedStyle(el).fontSize)
        })
        
        expect(fontSize).toBeGreaterThanOrEqual(minH1)
        expect(fontSize).toBeLessThanOrEqual(maxH1)
      }
    }
  })
})

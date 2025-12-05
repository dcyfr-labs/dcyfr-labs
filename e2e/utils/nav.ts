import type { Page, Locator } from '@playwright/test'
import { expect } from '@playwright/test'

export type OpenMobileNavOptions = {
  timeout?: number
  force?: boolean
}

/**
 * Open the mobile navigation sheet reliably across platforms.
 *
 * Handles the MobileNav component's hydration pattern where a fallback button
 * is rendered before full mount, then replaced with the interactive Sheet.
 * The fallback button is clickable and will trigger mounting if clicked.
 *
 * Returns the mobile nav locator when visible, or null if the current
 * viewport is not mobile.
 */
export async function openMobileNav(page: Page, opts: OpenMobileNavOptions = {}): Promise<Locator | null> {
  const timeout = opts.timeout ?? 10_000
  const viewport = page.viewportSize()
  const isMobile = viewport != null && viewport.width < 768

  if (!isMobile) return null

  const openNavTrigger = page.getByRole('button', { name: /open navigation menu/i })

  try {
    // Wait for button to be attached and enabled
    await openNavTrigger.waitFor({ state: 'attached', timeout })
    await expect(openNavTrigger).toBeEnabled({ timeout })

    // Click the button (may trigger mounting if hydration hasn't completed)
    await openNavTrigger.click({ timeout })
  } catch (err) {
    // Force click as last resort fallback
    // This handles edge cases where the button might be present but Playwright
    // doesn't think it's enabled due to timing or rendering quirks
    if (opts.force !== false) {
      await openNavTrigger.click({ force: true, timeout: 5_000 }).catch(() => {
        throw new Error(`Failed to open mobile nav: ${err}`)
      })
    } else {
      throw err
    }
  }

  // Wait for the mobile nav to be visible
  // Give extra time since the first click might trigger mounting
  const mobileNavSelector = 'nav[aria-label="Mobile navigation"]'
  await page.waitForSelector(mobileNavSelector, { state: 'visible', timeout: Math.max(timeout, 15_000) })
  return page.locator(mobileNavSelector)
}

export async function closeMobileNav(page: Page, opts: OpenMobileNavOptions = {}): Promise<void> {
  const timeout = opts.timeout ?? 5000
  const mobileNav = page.locator('nav[aria-label="Mobile navigation"]')
  if (!(await mobileNav.isVisible())) return
  // Click outside or press Escape to close sheet (Radix Sheet should close on Escape)
  await page.keyboard.press('Escape')
  await expect(mobileNav).not.toBeVisible({ timeout })
}

export default openMobileNav

import type { Page, Locator } from '@playwright/test'
import { expect } from '@playwright/test'

export type OpenMobileNavOptions = {
  timeout?: number
  force?: boolean
}

/**
 * Open the mobile navigation sheet reliably across platforms.
 *
 * Tries a normal click after waiting for the trigger to be enabled, and if
 * that fails (some browsers keep a disabled placeholder during mount), it
 * force-clicks and waits for the navigation to appear.
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

  // Wait for either the actual button to appear or a server-side placeholder
  // element that indicates hydration hasn't happened yet.
  const placeholder = page.locator('[data-mount-fallback]')
  const waitForOne = async () => {
    const p = [openNavTrigger.waitFor({ state: 'attached', timeout }).then(() => 'button')]
    p.push(placeholder.waitFor({ state: 'attached', timeout }).then(() => 'placeholder'))
    try {
      return await Promise.race(p)
    } catch (err) {
      // If neither attached within timeout, rethrow to be handled by caller
      throw err
    }
  }

  try {
    const found = await waitForOne()
    if (found === 'button') {
      // Prefer to wait for it to be enabled and click normally
      await expect(openNavTrigger).toBeEnabled({ timeout })
      await openNavTrigger.click({ timeout })
    } else {
      // It was a placeholder; try to click the actual button (may not be present)
      // Wait extra time for the client to hydrate and replace the placeholder
      // with the interactive button; some WebKit environments may be slower.
      try {
        await openNavTrigger.waitFor({ state: 'attached', timeout: Math.max(timeout, 10000) })
        await expect(openNavTrigger).toBeEnabled({ timeout: Math.max(timeout, 10000) })
        await openNavTrigger.click({ timeout: Math.max(timeout, 10000) })
      } catch (_) {
        // As a fallback, click the placeholder to reproduce a real user
        await placeholder.click({ timeout: Math.max(timeout, 5000) })
      }
    }
  } catch (err) {
    // Force click as fallback for platforms that keep a disabled pre-mount button
    await openNavTrigger.click({ force: true, timeout })
  }

  // Wait for the mobile nav to be visible
  const mobileNavSelector = 'nav[aria-label="Mobile navigation"]'
  await page.waitForSelector(mobileNavSelector, { state: 'visible', timeout })
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

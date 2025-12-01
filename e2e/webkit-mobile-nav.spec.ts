import { test, expect } from '@playwright/test'
import openMobileNav, { closeMobileNav } from './utils/nav'

test.describe('WebKit Mobile Nav', () => {
  test('should open and close mobile nav reliably on iPhone 12 (WebKit)', async ({ page, browserName }) => {
    // Only run this test for WebKit to reproduce Safari timing issues
    test.skip(browserName !== 'webkit', 'This test targets Mobile Safari (WebKit) only')

    // Force mobile viewport to match project device
    await page.setViewportSize({ width: 390, height: 844 }) // iPhone 12 viewport
    await page.goto('/')
    // Capture console messages to help debug hydration/runtime issues in WebKit
    page.on('console', (msg) => console.log('[page-console] ' + msg.text()))
    page.on('pageerror', (err) => console.log('[page-error] ' + String(err)))

    // Attempt to open mobile nav with an extended timeout for slower environments
    // For debugging WebKit, inspect the open nav trigger and its attributes
    // There may be a server-side placeholder or a real button depending on
    // whether the page has hydrated yet. Try to find the button or fallback
    // placeholder and log its state for debugging.
    const buttonLocator = page.locator('[data-slot="button"][aria-label="Open navigation menu"], [data-mount-fallback], [data-slot="sheet-trigger"][aria-label="Open navigation menu"]')
    const buttonCount = await buttonLocator.count()
    console.log('[webkit-debug] buttonCount:', buttonCount)
    let openNavTrigger = page.getByRole('button', { name: /open navigation menu/i })
    // If there's no button yet, wait a little for the client to hydrate
    if (buttonCount === 0) {
      console.log('[webkit-debug] no button found initially - waiting for hydrate...')
      await openNavTrigger.waitFor({ state: 'attached', timeout: 5000 }).catch(() => console.log('[webkit-debug] button did not attach within 5s'))
    }
    // Now try to inspect its disabled state if it exists
    const disabled = await openNavTrigger.isDisabled().catch(() => null)
    console.log('[webkit-debug] openNavTrigger isDisabled:', disabled)
    const outerHtml = await openNavTrigger.evaluate((el) => (el as HTMLElement).outerHTML).catch(() => 'no button outerHTML')
    console.log('[webkit-debug] openNavTrigger outerHTML:', outerHtml)
    // Check whether the Sheet content is present before interaction
    const preContentExists = await page.evaluate(() => !!document.querySelector('[data-slot="sheet-content"]'))
    console.log('[webkit-debug] preContentExists:', preContentExists)
    const hasNextData = await page.evaluate(() => !!document.querySelector('#__NEXT_DATA__'))
    console.log('[webkit-debug] __NEXT_DATA__ present:', hasNextData)
    const scriptCount = await page.evaluate(() => document.querySelectorAll('script').length)
    console.log('[webkit-debug] scriptCount:', scriptCount)

    let nav
    try {
      nav = await openMobileNav(page, { timeout: 20000 })
    } catch (err) {
      console.log('[webkit-debug] openMobileNav threw:', String(err))
      // Also inspect if sheet content exists now
      const postContentExists = await page.evaluate(() => !!document.querySelector('[data-slot="sheet-content"]'))
      console.log('[webkit-debug] postContentExists:', postContentExists)

      // As a last-resort experiment: try removing the `disabled` attribute from the
      // trigger and click it to see whether the Sheet opens. This will help
      // determine whether the issue is that the `mounted` flag didn't flip.
      console.log('[webkit-debug] attempting forced DOM edit to remove `disabled` attr and click')
      await page.evaluate(() => {
        const btn = document.querySelector('button[aria-label="Open navigation menu"]') as HTMLButtonElement | null
        if (btn) btn.removeAttribute('disabled')
      })
      await openNavTrigger.click({ timeout: 5000 }).catch((e) => console.log('[webkit-debug] forced click failed:', String(e)))
      const forcedOpen = await page.evaluate(() => !!document.querySelector('[data-slot="sheet-content"]'))
      console.log('[webkit-debug] forcedOpen:', forcedOpen)
      throw err
    }
    await expect(nav).toBeTruthy()
    await expect(nav).toBeVisible()

    // Ensure main links are present
    await expect(nav!.getByRole('link', { name: /home/i })).toBeVisible()
    await expect(nav!.getByRole('link', { name: /blog/i })).toBeVisible()

    // Close and ensure nav disappears
    await closeMobileNav(page, { timeout: 5000 })
    await expect(page.locator('nav[aria-label="Mobile navigation"]')).not.toBeVisible()
  })
})

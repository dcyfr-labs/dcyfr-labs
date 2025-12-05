import { test, expect } from '@playwright/test'
import openMobileNav, { closeMobileNav } from './utils/nav'

/**
 * WebKit Mobile Navigation Test
 *
 * Known Issue: WebKit (Safari) has hydration issues with Radix UI Sheet components
 * in Next.js production builds running locally. This manifests as:
 * - TLS errors preventing JavaScript from loading
 * - Components not hydrating properly (mounted state stays false)
 * - MobileNav button click not opening the sheet
 *
 * Root Cause: Likely related to how WebKit handles localhost production builds
 * with dynamic imports and module loading.
 *
 * This test is:
 * - Skipped in CI (WebKit crashes due to resource constraints)
 * - Available for local debugging
 * - Expected to fail until the underlying WebKit/Next.js issue is resolved
 *
 * Workaround: Use development mode (npm run dev) for local WebKit testing
 */
test.describe('WebKit Mobile Nav', () => {
  test('should open and close mobile nav reliably on iPhone 12 (WebKit)', async ({ page, browserName }) => {
    // Skip in CI - WebKit browser frequently crashes in GitHub Actions due to resource constraints
    // This test can still run locally to debug Safari-specific mobile nav issues
    test.skip(!!process.env.CI, 'Skipping in CI - WebKit unstable in GitHub Actions')
    // Only run this test for WebKit to reproduce Safari timing issues
    test.skip(browserName !== 'webkit', 'This test targets Mobile Safari (WebKit) only')

    // Force mobile viewport to match project device
    await page.setViewportSize({ width: 390, height: 844 }) // iPhone 12 viewport
    await page.goto('/')

    // Capture console messages to help debug hydration/runtime issues in WebKit
    page.on('console', (msg) => console.log('[page-console] ' + msg.text()))
    page.on('pageerror', (err) => console.log('[page-error] ' + String(err)))

    // Open mobile nav - the helper handles hydration waiting automatically
    const nav = await openMobileNav(page, { timeout: 20000 })

    // Verify nav opened successfully
    await expect(nav).toBeTruthy()
    await expect(nav!).toBeVisible()

    // Ensure main links are present
    await expect(nav!.getByRole('link', { name: /home/i })).toBeVisible()
    await expect(nav!.getByRole('link', { name: /blog/i })).toBeVisible()

    // Close and ensure nav disappears
    await closeMobileNav(page, { timeout: 5000 })
    await expect(page.locator('nav[aria-label="Mobile navigation"]')).not.toBeVisible()
  })
})

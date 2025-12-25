import { Page } from '@playwright/test'

/**
 * Mobile Viewport Utilities
 * 
 * Predefined mobile device viewports and helper functions for
 * responsive testing across different device sizes.
 */

export const MOBILE_VIEWPORTS = {
  'iPhone SE': { width: 375, height: 667 },
  'iPhone 12': { width: 390, height: 844 },
  'iPhone 15 Pro Max': { width: 430, height: 932 },
  'iPhone 15 Pro Max (Landscape)': { width: 932, height: 430 },
  'Pixel 5': { width: 393, height: 851 },
  'iPad Pro': { width: 1024, height: 1366 },
  'iPad Pro (Landscape)': { width: 1366, height: 1024 },
} as const

export type MobileDevice = keyof typeof MOBILE_VIEWPORTS

/**
 * Set viewport to a predefined mobile device size
 * 
 * @param page - Playwright page
 * @param device - Device name from MOBILE_VIEWPORTS
 */
export async function setMobileViewport(
  page: Page,
  device: MobileDevice
): Promise<void> {
  const viewport = MOBILE_VIEWPORTS[device]
  if (!viewport) {
    throw new Error(`Unknown device: ${device}`)
  }
  await page.setViewportSize(viewport)
}

/**
 * Check if current viewport is mobile (<768px)
 * 
 * @param width - Viewport width in pixels
 * @returns True if mobile viewport
 */
export function isMobileViewport(width: number): boolean {
  return width < 768
}

/**
 * Check if current viewport is tablet (768px-1024px)
 * 
 * @param width - Viewport width in pixels
 * @returns True if tablet viewport
 */
export function isTabletViewport(width: number): boolean {
  return width >= 768 && width < 1024
}

/**
 * Check if current viewport is desktop (≥1024px)
 * 
 * @param width - Viewport width in pixels
 * @returns True if desktop viewport
 */
export function isDesktopViewport(width: number): boolean {
  return width >= 1024
}

/**
 * Get current viewport category for the page
 * 
 * @param page - Playwright page
 * @returns Viewport category string
 */
export async function getViewportCategory(
  page: Page
): Promise<'mobile' | 'tablet' | 'desktop'> {
  const viewport = page.viewportSize()
  if (!viewport) return 'desktop'
  
  const { width } = viewport
  
  if (isMobileViewport(width)) return 'mobile'
  if (isTabletViewport(width)) return 'tablet'
  return 'desktop'
}

/**
 * Test page across multiple viewports
 * 
 * @param page - Playwright page
 * @param devices - Array of device names to test
 * @param testFn - Test function to run for each device
 */
export async function testAcrossViewports(
  page: Page,
  devices: MobileDevice[],
  testFn: (device: MobileDevice, width: number, height: number) => Promise<void>
): Promise<void> {
  for (const device of devices) {
    const { width, height } = MOBILE_VIEWPORTS[device]
    await setMobileViewport(page, device)
    await testFn(device, width, height)
  }
}

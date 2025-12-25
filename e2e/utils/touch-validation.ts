import { Locator, Page } from '@playwright/test'

/**
 * Touch Validation Utilities
 * 
 * Helpers for validating touch target sizes and spacing according to
 * Apple HIG (44x44pt minimum) and Material Design (48x48pt recommended).
 */

export interface TouchTargetResult {
  passed: boolean
  width: number
  height: number
  selector?: string
}

export interface TouchTargetSummary {
  passed: number
  failed: number
  failures: Array<{
    selector: string
    width: number
    height: number
  }>
}

/**
 * Validate touch target size (44x44pt minimum)
 * 
 * @param locator - Playwright locator for element
 * @param minSize - Minimum size in pixels (default: 44)
 * @returns Promise resolving to validation result
 */
export async function validateTouchTarget(
  locator: Locator,
  minSize: number = 44
): Promise<TouchTargetResult> {
  const box = await locator.boundingBox()
  
  if (!box) {
    return {
      passed: false,
      width: 0,
      height: 0,
    }
  }
  
  const passed = box.width >= minSize && box.height >= minSize
  
  return {
    passed,
    width: box.width,
    height: box.height,
  }
}

/**
 * Check all elements matching selector have adequate touch targets
 * 
 * @param page - Playwright page
 * @param selector - CSS selector for elements to validate
 * @param minSize - Minimum size in pixels (default: 44)
 * @returns Promise resolving to validation summary
 */
export async function validateAllTouchTargets(
  page: Page,
  selector: string,
  minSize: number = 44
): Promise<TouchTargetSummary> {
  const locators = page.locator(selector)
  const count = await locators.count()
  
  const failures: TouchTargetSummary['failures'] = []
  let passed = 0
  let failed = 0
  
  for (let i = 0; i < count; i++) {
    const box = await locators.nth(i).boundingBox()
    
    if (!box || box.width < minSize || box.height < minSize) {
      failures.push({
        selector: `${selector}:nth(${i})`,
        width: box?.width || 0,
        height: box?.height || 0,
      })
      failed++
    } else {
      passed++
    }
  }
  
  return { passed, failed, failures }
}

/**
 * Get spacing between adjacent elements
 * 
 * @param element1 - First element locator
 * @param element2 - Second element locator
 * @returns Promise resolving to spacing in pixels (-1 if not adjacent)
 */
export async function getElementSpacing(
  element1: Locator,
  element2: Locator
): Promise<number> {
  const box1 = await element1.boundingBox()
  const box2 = await element2.boundingBox()
  
  if (!box1 || !box2) return -1
  
  // Horizontal spacing (right edge of box1 to left edge of box2)
  if (Math.abs(box1.y - box2.y) < 10) {
    return box2.x - (box1.x + box1.width)
  }
  
  // Vertical spacing (bottom of box1 to top of box2)
  return box2.y - (box1.y + box1.height)
}

/**
 * Validate minimum spacing between all elements in a container
 * 
 * @param page - Playwright page
 * @param containerSelector - Container selector
 * @param childSelector - Child element selector
 * @param minSpacing - Minimum spacing in pixels (default: 8)
 * @returns Promise resolving to validation result
 */
export async function validateElementSpacing(
  page: Page,
  containerSelector: string,
  childSelector: string,
  minSpacing: number = 8
): Promise<{
  passed: boolean
  violations: Array<{ index: number; spacing: number }>
}> {
  const container = page.locator(containerSelector)
  const children = container.locator(childSelector)
  const count = await children.count()
  
  const violations: Array<{ index: number; spacing: number }> = []
  
  for (let i = 0; i < count - 1; i++) {
    const spacing = await getElementSpacing(children.nth(i), children.nth(i + 1))
    
    if (spacing >= 0 && spacing < minSpacing) {
      violations.push({ index: i, spacing })
    }
  }
  
  return {
    passed: violations.length === 0,
    violations,
  }
}

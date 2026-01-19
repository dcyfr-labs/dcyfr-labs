import { describe, it, expect } from 'vitest'
import { spawnSync } from 'child_process'

/**
 * Validates that report files do not contain PII (emails, API keys, private keys)
 * Script exits 0 if no reports directory exists or no PII found
 * Allows dcyfr.dev domain emails
 */
describe('Reports safety', () => {
  it('scan reports for obvious PII', () => {
    const res = spawnSync('node', ['scripts/validation/check-reports-for-pii.mjs'], { encoding: 'utf8' })
    // script exits 0 if no reports or no PII found
    expect(res.status).toBe(0)
  })
})

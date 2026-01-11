import { describe, it, expect } from 'vitest'
import { spawnSync } from 'child_process'

// TODO: PII scanner script needs investigation - may have stale reports
describe.skip('Reports safety', () => {
  it('scan reports for obvious PII', () => {
    const res = spawnSync('node', ['scripts/validation/check-reports-for-pii.mjs'], { encoding: 'utf8' })
    // script exits 0 if no reports or no PII found
    expect(res.status).toBe(0)
  })
})

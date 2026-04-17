import { describe, it, expect } from 'vitest';
import { validateOrigin } from '@/lib/security/origin-validation';
import { ALLOWED_ORIGIN, ATTACKER_ORIGIN } from '../lib/red-team-client';

// NextRequest strips forbidden headers (origin, referer) per Fetch spec.
// validateOrigin() takes Request, so we use a plain mock with headers.get().
function mockReq(headers: Record<string, string>): Request {
  const h = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  return {
    headers: { get: (name: string) => h[name.toLowerCase()] ?? null },
  } as unknown as Request;
}

const ALLOWED_DOMAIN = ALLOWED_ORIGIN;

describe('Red Team: Origin Validation Bypass', () => {
  it('should reject cross-origin requests', () => {
    const result = validateOrigin(mockReq({ origin: ATTACKER_ORIGIN }), ALLOWED_DOMAIN);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/mismatch/i);
  });

  it('should accept same-origin requests', () => {
    const result = validateOrigin(mockReq({ origin: ALLOWED_ORIGIN }), ALLOWED_DOMAIN);
    expect(result.valid).toBe(true);
    expect(result.source).toBe('origin');
  });

  it('should fallback to Referer header if Origin missing', () => {
    const result = validateOrigin(
      mockReq({ referer: `${ALLOWED_ORIGIN}/some-page` }),
      ALLOWED_DOMAIN
    );
    expect(result.valid).toBe(true);
    expect(result.source).toBe('referer');
  });

  it('should reject when both Origin and Referer are missing', () => {
    const result = validateOrigin(mockReq({}), ALLOWED_DOMAIN);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/missing/i);
  });

  it('should be protocol-agnostic for hostname match', () => {
    const result = validateOrigin(mockReq({ origin: 'http://www.dcyfr.ai' }), ALLOWED_DOMAIN);
    expect(result.valid).toBe(true);
  });
});

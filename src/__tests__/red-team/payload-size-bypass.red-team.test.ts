import { describe, it, expect } from 'vitest';
import { validatePayloadSize } from '@/lib/security/payload-validation';

const MAX_BYTES = 102400; // 100KB

// content-length is a forbidden header in the Fetch spec — stripped by NextRequest.
// validatePayloadSize() takes Request, so we use a plain mock with headers.get().
function mockReq(headers: Record<string, string>): Request {
  const h = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  return {
    headers: { get: (name: string) => h[name.toLowerCase()] ?? null },
  } as unknown as Request;
}

describe('Red Team: Payload Size Bypass', () => {
  it('should accept payloads under limit', () => {
    const result = validatePayloadSize(mockReq({ 'content-length': '50000' }), MAX_BYTES);
    expect(result.valid).toBe(true);
    expect(result.size).toBe(50000);
  });

  it('should reject payloads over limit', () => {
    const result = validatePayloadSize(mockReq({ 'content-length': '150000' }), MAX_BYTES);
    expect(result.valid).toBe(false);
    expect(result.size).toBe(150000);
    expect(result.maxBytes).toBe(MAX_BYTES);
  });

  it('should treat missing Content-Length as valid', () => {
    const result = validatePayloadSize(mockReq({}), MAX_BYTES);
    expect(result.valid).toBe(true);
    expect(result.size).toBeNull();
  });

  it('should reject invalid Content-Length values', () => {
    const result = validatePayloadSize(mockReq({ 'content-length': 'abc' }), MAX_BYTES);
    expect(result.valid).toBe(false);
  });

  it('should accept exact boundary value', () => {
    const result = validatePayloadSize(mockReq({ 'content-length': String(MAX_BYTES) }), MAX_BYTES);
    expect(result.valid).toBe(true);
  });

  it('should reject one byte over limit', () => {
    const result = validatePayloadSize(
      mockReq({ 'content-length': String(MAX_BYTES + 1) }),
      MAX_BYTES
    );
    expect(result.valid).toBe(false);
  });
});

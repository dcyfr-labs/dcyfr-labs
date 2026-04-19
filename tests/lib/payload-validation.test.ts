import { describe, it, expect } from 'vitest';
import { validatePayloadSize } from '@/lib/security/payload-validation';

function makeRequest(headers: Record<string, string>): Request {
  const h = new Map(Object.entries(headers));
  return { headers: { get: (key: string) => h.get(key) ?? null } } as unknown as Request;
}

describe('validatePayloadSize', () => {
  it('accepts payload within limit', () => {
    const req = makeRequest({ 'content-length': '1000' });
    const result = validatePayloadSize(req, 5000);
    expect(result.valid).toBe(true);
    expect(result.size).toBe(1000);
    expect(result.maxBytes).toBe(5000);
  });

  it('rejects payload exceeding limit', () => {
    const req = makeRequest({ 'content-length': '10000' });
    const result = validatePayloadSize(req, 5000);
    expect(result.valid).toBe(false);
    expect(result.size).toBe(10000);
    expect(result.reason).toContain('exceeds');
  });

  it('accepts missing content-length', () => {
    const req = makeRequest({});
    const result = validatePayloadSize(req, 5000);
    expect(result.valid).toBe(true);
    expect(result.size).toBeNull();
    expect(result.reason).toContain('missing');
  });

  it('rejects invalid content-length', () => {
    const req = makeRequest({ 'content-length': 'abc' });
    const result = validatePayloadSize(req, 5000);
    expect(result.valid).toBe(false);
    expect(result.size).toBeNull();
    expect(result.reason).toContain('Invalid');
  });

  it('rejects negative content-length', () => {
    const req = makeRequest({ 'content-length': '-1' });
    const result = validatePayloadSize(req, 5000);
    expect(result.valid).toBe(false);
  });

  it('accepts exactly at limit', () => {
    const req = makeRequest({ 'content-length': '5000' });
    const result = validatePayloadSize(req, 5000);
    expect(result.valid).toBe(true);
    expect(result.size).toBe(5000);
  });

  it('accepts zero-length payload', () => {
    const req = makeRequest({ 'content-length': '0' });
    const result = validatePayloadSize(req, 5000);
    expect(result.valid).toBe(true);
    expect(result.size).toBe(0);
  });
});

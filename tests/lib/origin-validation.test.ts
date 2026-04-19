import { describe, it, expect } from 'vitest';
import { validateOrigin } from '@/lib/security/origin-validation';

function makeRequest(headers: Record<string, string>): Request {
  const h = new Map(Object.entries(headers));
  return { headers: { get: (key: string) => h.get(key) ?? null } } as unknown as Request;
}

describe('validateOrigin', () => {
  it('validates matching origin header', () => {
    const req = makeRequest({ origin: 'https://dcyfr.ai' });
    const result = validateOrigin(req, 'https://dcyfr.ai');
    expect(result.valid).toBe(true);
    expect(result.source).toBe('origin');
  });

  it('validates matching referer when no origin', () => {
    const req = makeRequest({ referer: 'https://dcyfr.ai/page' });
    const result = validateOrigin(req, 'https://dcyfr.ai');
    expect(result.valid).toBe(true);
    expect(result.source).toBe('referer');
  });

  it('rejects missing origin and referer', () => {
    const req = makeRequest({});
    const result = validateOrigin(req, 'https://dcyfr.ai');
    expect(result.valid).toBe(false);
    expect(result.source).toBe('none');
    expect(result.reason).toContain('Missing');
  });

  it('rejects mismatched origin', () => {
    const req = makeRequest({ origin: 'https://evil.com' });
    const result = validateOrigin(req, 'https://dcyfr.ai');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('mismatch');
  });

  it('is case-insensitive', () => {
    const req = makeRequest({ origin: 'https://DCYFR.AI' });
    const result = validateOrigin(req, 'https://dcyfr.ai');
    expect(result.valid).toBe(true);
  });

  it('prefers origin over referer', () => {
    const req = makeRequest({
      origin: 'https://dcyfr.ai',
      referer: 'https://evil.com',
    });
    const result = validateOrigin(req, 'https://dcyfr.ai');
    expect(result.valid).toBe(true);
    expect(result.source).toBe('origin');
  });

  it('allows localhost variants to match each other', () => {
    const req = makeRequest({ origin: 'http://127.0.0.1:3000' });
    const result = validateOrigin(req, 'http://localhost:3000');
    expect(result.valid).toBe(true);
  });

  it('handles invalid URL format', () => {
    const req = makeRequest({ origin: 'not-a-url' });
    const result = validateOrigin(req, 'https://dcyfr.ai');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Invalid');
  });

  it('is protocol-agnostic for hostname comparison', () => {
    const req = makeRequest({ origin: 'http://dcyfr.ai' });
    const result = validateOrigin(req, 'https://dcyfr.ai');
    expect(result.valid).toBe(true);
  });
});

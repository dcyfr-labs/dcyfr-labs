import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { getClientIp, validateRequest, validateTiming } from '@/lib/anti-spam';

describe('getClientIp', () => {
  it('extracts IP from x-forwarded-for', () => {
    const req = new NextRequest('https://test.com', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getClientIp(req)).toBe('1.2.3.4');
  });

  it('extracts IP from x-real-ip', () => {
    const req = new NextRequest('https://test.com', {
      headers: { 'x-real-ip': '10.0.0.1' },
    });
    expect(getClientIp(req)).toBe('10.0.0.1');
  });

  it('returns unknown when no IP headers', () => {
    const req = new NextRequest('https://test.com');
    expect(getClientIp(req)).toBe('unknown');
  });

  it('prefers x-forwarded-for over x-real-ip', () => {
    const req = new NextRequest('https://test.com', {
      headers: { 'x-forwarded-for': '1.1.1.1', 'x-real-ip': '2.2.2.2' },
    });
    expect(getClientIp(req)).toBe('1.1.1.1');
  });
});

describe('validateRequest', () => {
  it('returns valid for normal browser user-agent', () => {
    const req = new NextRequest('https://test.com', {
      headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
    });
    expect(validateRequest(req)).toEqual({ valid: true });
  });

  it('rejects missing user-agent', () => {
    const req = new NextRequest('https://test.com');
    expect(validateRequest(req)).toEqual({ valid: false, reason: 'missing_user_agent' });
  });

  it('rejects bot user-agents', () => {
    const botAgents = ['Googlebot/2.1', 'Baiduspider', 'curl/7.68', 'python-requests/2.25'];
    for (const ua of botAgents) {
      const req = new NextRequest('https://test.com', {
        headers: { 'user-agent': ua },
      });
      const result = validateRequest(req);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe('bot_detected');
    }
  });

  it('rejects short user-agents', () => {
    const req = new NextRequest('https://test.com', {
      headers: { 'user-agent': 'short' },
    });
    expect(validateRequest(req)).toEqual({ valid: false, reason: 'suspicious_user_agent' });
  });
});

describe('validateTiming', () => {
  it('rejects non-number timing data', () => {
    expect(validateTiming('view', undefined)).toEqual({
      valid: false,
      reason: 'invalid_timing_data',
    });
  });

  it('rejects negative timing', () => {
    expect(validateTiming('view', -100)).toEqual({
      valid: false,
      reason: 'invalid_timing_data',
    });
  });

  it('rejects views under 5 seconds', () => {
    expect(validateTiming('view', 3000)).toEqual({
      valid: false,
      reason: 'insufficient_time_on_page',
    });
  });

  it('accepts views at 5+ seconds', () => {
    expect(validateTiming('view', 5000)).toEqual({ valid: true });
    expect(validateTiming('view', 10000)).toEqual({ valid: true });
  });

  it('rejects shares under 2 seconds', () => {
    expect(validateTiming('share', 1000)).toEqual({
      valid: false,
      reason: 'share_too_fast',
    });
  });

  it('accepts shares at 2+ seconds', () => {
    expect(validateTiming('share', 2000)).toEqual({ valid: true });
  });
});

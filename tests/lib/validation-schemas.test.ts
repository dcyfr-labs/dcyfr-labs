import { describe, it, expect } from 'vitest';
import {
  emailSchema,
  slugSchema,
  urlSchema,
  safeStringSchema,
  positiveIntSchema,
  uuidSchema,
  contactFormSchema,
  engagementRequestSchema,
  viewRequestSchema,
  analyticsReferralSchema,
  devToAnalyticsSchema,
  axiomEventSchema,
  axiomBatchSchema,
  memoryAddSchema,
  memorySearchSchema,
  indexNowBulkSchema,
} from '@/lib/validation/schemas';

// ─── Primitive Schemas ───────────────────────────────────────────────────────

describe('emailSchema', () => {
  it('accepts valid emails', () => {
    expect(emailSchema.parse('test@example.com')).toBe('test@example.com');
    expect(emailSchema.parse('user+tag@domain.co')).toBe('user+tag@domain.co');
  });
  it('rejects invalid emails', () => {
    expect(() => emailSchema.parse('not-an-email')).toThrow();
    expect(() => emailSchema.parse('')).toThrow();
  });
  it('rejects emails longer than 254 chars', () => {
    const long = 'a'.repeat(250) + '@b.co';
    expect(() => emailSchema.parse(long)).toThrow('Email too long');
  });
});

describe('slugSchema', () => {
  it('accepts valid slugs', () => {
    expect(slugSchema.parse('my-post-123')).toBe('my-post-123');
    expect(slugSchema.parse('a')).toBe('a');
  });
  it('rejects uppercase', () => {
    expect(() => slugSchema.parse('My-Post')).toThrow();
  });
  it('rejects empty', () => {
    expect(() => slugSchema.parse('')).toThrow();
  });
  it('rejects slugs over 200 chars', () => {
    expect(() => slugSchema.parse('a'.repeat(201))).toThrow();
  });
});

describe('urlSchema', () => {
  it('accepts valid URLs', () => {
    expect(urlSchema.parse('https://example.com')).toBe('https://example.com');
  });
  it('rejects non-URLs', () => {
    expect(() => urlSchema.parse('not a url')).toThrow();
  });
  it('rejects URLs over 2048 chars', () => {
    expect(() => urlSchema.parse('https://x.co/' + 'a'.repeat(2040))).toThrow();
  });
});

describe('safeStringSchema', () => {
  it('accepts normal text', () => {
    expect(safeStringSchema.parse('Hello world')).toBe('Hello world');
  });
  it('rejects XSS patterns', () => {
    expect(() => safeStringSchema.parse('<script>alert(1)</script>')).toThrow();
    expect(() => safeStringSchema.parse('javascript:void(0)')).toThrow();
    expect(() => safeStringSchema.parse('img onerror=alert(1)')).toThrow();
    expect(() => safeStringSchema.parse('body onload=x')).toThrow();
  });
  it('rejects strings over 1000 chars', () => {
    expect(() => safeStringSchema.parse('a'.repeat(1001))).toThrow();
  });
});

describe('positiveIntSchema', () => {
  it('accepts positive integers', () => {
    expect(positiveIntSchema.parse(1)).toBe(1);
    expect(positiveIntSchema.parse(999)).toBe(999);
  });
  it('rejects zero, negative, and floats', () => {
    expect(() => positiveIntSchema.parse(0)).toThrow();
    expect(() => positiveIntSchema.parse(-1)).toThrow();
    expect(() => positiveIntSchema.parse(1.5)).toThrow();
  });
});

describe('uuidSchema', () => {
  it('accepts valid UUID v4', () => {
    expect(uuidSchema.parse('550e8400-e29b-41d4-a716-446655440000')).toBeTruthy();
  });
  it('rejects non-UUIDs', () => {
    expect(() => uuidSchema.parse('not-a-uuid')).toThrow();
  });
});

// ─── Domain-Specific Schemas ─────────────────────────────────────────────────

describe('contactFormSchema', () => {
  const valid = {
    name: 'Drew',
    email: 'drew@dcyfr.ai',
    message: 'Hello, this is a test message that is long enough.',
  };

  it('accepts valid contact form', () => {
    expect(contactFormSchema.parse(valid)).toMatchObject(valid);
  });
  it('accepts optional fields', () => {
    expect(contactFormSchema.parse({ ...valid, role: 'Engineer', website: '' })).toBeTruthy();
  });
  it('rejects short name', () => {
    expect(() => contactFormSchema.parse({ ...valid, name: 'X' })).toThrow();
  });
  it('rejects short message', () => {
    expect(() => contactFormSchema.parse({ ...valid, message: 'Hi' })).toThrow();
  });
  it('rejects XSS in name', () => {
    expect(() => contactFormSchema.parse({ ...valid, name: '<script>x</script>' })).toThrow();
  });
});

describe('engagementRequestSchema', () => {
  it('accepts valid engagement', () => {
    const data = { slug: 'my-post', contentType: 'post', action: 'like' };
    expect(engagementRequestSchema.parse(data)).toMatchObject(data);
  });
  it('rejects invalid contentType', () => {
    expect(() =>
      engagementRequestSchema.parse({ slug: 'x', contentType: 'video', action: 'like' })
    ).toThrow();
  });
  it('rejects invalid action', () => {
    expect(() =>
      engagementRequestSchema.parse({ slug: 'x', contentType: 'post', action: 'dislike' })
    ).toThrow();
  });
});

describe('viewRequestSchema', () => {
  const valid = {
    postId: 'my-post',
    sessionId: '550e8400-e29b-41d4-a716-446655440000',
    timeOnPage: 30,
    isVisible: true,
  };
  it('accepts valid view request', () => {
    expect(viewRequestSchema.parse(valid)).toMatchObject(valid);
  });
  it('rejects negative timeOnPage', () => {
    expect(() => viewRequestSchema.parse({ ...valid, timeOnPage: -1 })).toThrow();
  });
});

describe('analyticsReferralSchema', () => {
  it('accepts valid referral data', () => {
    const data = {
      postId: 'my-post',
      sessionId: 'abc-123',
      platform: 'twitter',
    };
    expect(analyticsReferralSchema.parse(data)).toBeTruthy();
  });
  it('provides defaults for optional fields', () => {
    const result = analyticsReferralSchema.parse({
      postId: 'post',
      sessionId: 'sess',
      platform: 'web',
    });
    expect(result.referrer).toBe('');
  });
});

describe('devToAnalyticsSchema', () => {
  it('accepts valid devTo analytics request', () => {
    const result = devToAnalyticsSchema.parse({
      postId: 'my-post',
      devSlug: 'my-dev-slug',
    });
    expect(result.username).toBe('dcyfr');
    expect(result.forceRefresh).toBe(false);
  });
  it('rejects invalid devSlug', () => {
    expect(() => devToAnalyticsSchema.parse({ postId: 'x', devSlug: 'INVALID SLUG!' })).toThrow();
  });
  it('rejects postId with HTML', () => {
    expect(() => devToAnalyticsSchema.parse({ postId: '<bad>', devSlug: 'ok' })).toThrow();
  });
});

describe('axiomEventSchema', () => {
  it('accepts event with extra fields (passthrough)', () => {
    const result = axiomEventSchema.parse({ level: 'info', custom: 'field' });
    expect(result.custom).toBe('field');
  });
});

describe('axiomBatchSchema', () => {
  it('accepts batch of events', () => {
    const batch = [{ level: 'info' }, { level: 'error' }];
    expect(axiomBatchSchema.parse(batch)).toHaveLength(2);
  });
  it('rejects batch over 100 events', () => {
    const batch = Array.from({ length: 101 }, () => ({}));
    expect(() => axiomBatchSchema.parse(batch)).toThrow();
  });
});

describe('memoryAddSchema', () => {
  it('accepts valid memory add', () => {
    expect(memoryAddSchema.parse({ userId: 'user-1', message: 'Remember this' })).toBeTruthy();
  });
  it('rejects missing userId', () => {
    expect(() => memoryAddSchema.parse({ userId: '', message: 'x' })).toThrow();
  });
  it('rejects overly long message', () => {
    expect(() => memoryAddSchema.parse({ userId: 'u', message: 'x'.repeat(10001) })).toThrow();
  });
});

describe('memorySearchSchema', () => {
  it('provides default limit', () => {
    const result = memorySearchSchema.parse({ userId: 'u', query: 'test' });
    expect(result.limit).toBe(3);
  });
  it('rejects limit over 10', () => {
    expect(() => memorySearchSchema.parse({ userId: 'u', query: 'q', limit: 11 })).toThrow();
  });
});

describe('indexNowBulkSchema', () => {
  it('accepts valid types', () => {
    expect(indexNowBulkSchema.parse({ types: ['posts', 'projects'] })).toBeTruthy();
  });
  it('rejects invalid type', () => {
    expect(() => indexNowBulkSchema.parse({ types: ['invalid'] })).toThrow();
  });
});

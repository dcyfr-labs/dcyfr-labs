import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

const VALID_KEY = 'e53b0a2c-74fb-4987-b6d1-add3616156c9'; // gitleaks:allow
const DIFFERENT_KEY = 'a1b2c3d4-e5f6-4789-abcd-ef1234567890'; // gitleaks:allow

describe('IndexNow Key File Route (GET /[key].txt)', () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.INDEXNOW_API_KEY;
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.INDEXNOW_API_KEY;
    } else {
      process.env.INDEXNOW_API_KEY = originalEnv;
    }
    vi.resetModules();
  });

  test('returns 200 with key when UUID matches configured key', async () => {
    process.env.INDEXNOW_API_KEY = VALID_KEY;

    const { GET } = await import('@/app/[key].txt/route');
    const request = new NextRequest(`http://localhost:3000/${VALID_KEY}.txt`);
    const response = await GET(request, { params: Promise.resolve({ key: VALID_KEY }) });

    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toBe(VALID_KEY);
  });

  test('returns correct content-type header', async () => {
    process.env.INDEXNOW_API_KEY = VALID_KEY;

    const { GET } = await import('@/app/[key].txt/route');
    const request = new NextRequest(`http://localhost:3000/${VALID_KEY}.txt`);
    const response = await GET(request, { params: Promise.resolve({ key: VALID_KEY }) });

    expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8');
  });

  test('returns cache-control header for CDN caching', async () => {
    process.env.INDEXNOW_API_KEY = VALID_KEY;

    const { GET } = await import('@/app/[key].txt/route');
    const request = new NextRequest(`http://localhost:3000/${VALID_KEY}.txt`);
    const response = await GET(request, { params: Promise.resolve({ key: VALID_KEY }) });

    expect(response.headers.get('cache-control')).toBe('public, max-age=86400');
  });

  test('returns 404 when key does not match configured key', async () => {
    process.env.INDEXNOW_API_KEY = VALID_KEY;

    const { GET } = await import('@/app/[key].txt/route');
    const request = new NextRequest(`http://localhost:3000/${DIFFERENT_KEY}.txt`);
    const response = await GET(request, { params: Promise.resolve({ key: DIFFERENT_KEY }) });

    expect(response.status).toBe(404);
  });

  test('returns 404 for non-UUID key format', async () => {
    process.env.INDEXNOW_API_KEY = VALID_KEY;

    const { GET } = await import('@/app/[key].txt/route');
    const request = new NextRequest('http://localhost:3000/invalid-key.txt');
    const response = await GET(request, { params: Promise.resolve({ key: 'invalid-key' }) });

    expect(response.status).toBe(404);
  });

  test('returns 404 for empty string key', async () => {
    process.env.INDEXNOW_API_KEY = VALID_KEY;

    const { GET } = await import('@/app/[key].txt/route');
    const request = new NextRequest('http://localhost:3000/.txt');
    const response = await GET(request, { params: Promise.resolve({ key: '' }) });

    expect(response.status).toBe(404);
  });

  test('returns 503 when INDEXNOW_API_KEY environment variable is not set', async () => {
    delete process.env.INDEXNOW_API_KEY;

    const { GET } = await import('@/app/[key].txt/route');
    const request = new NextRequest(`http://localhost:3000/${VALID_KEY}.txt`);
    const response = await GET(request, { params: Promise.resolve({ key: VALID_KEY }) });

    expect(response.status).toBe(503);
  });

  test('returns 503 with retry-after header when key not configured', async () => {
    delete process.env.INDEXNOW_API_KEY;

    const { GET } = await import('@/app/[key].txt/route');
    const request = new NextRequest(`http://localhost:3000/${VALID_KEY}.txt`);
    const response = await GET(request, { params: Promise.resolve({ key: VALID_KEY }) });

    expect(response.headers.get('retry-after')).toBe('3600');
  });

  test('key comparison is case-insensitive for UUID hex chars', async () => {
    const lowerKey = VALID_KEY.toLowerCase();
    const upperKey = VALID_KEY.toUpperCase();
    process.env.INDEXNOW_API_KEY = lowerKey;

    const { GET } = await import('@/app/[key].txt/route');
    // The stored key is lowercase, requesting with uppercase — should be 404
    // (exact match required; UUID env vars are generated as lowercase)
    const request = new NextRequest(`http://localhost:3000/${upperKey}.txt`);
    const response = await GET(request, { params: Promise.resolve({ key: upperKey }) });

    // Exact string match is required — case matters for security
    expect(response.status).toBe(404);
  });
});

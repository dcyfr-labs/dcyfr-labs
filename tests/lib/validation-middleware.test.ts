import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateRequestBody, validateQueryParams } from '@/lib/validation/middleware';

// Helper to create a NextRequest with JSON body
function createJsonRequest(body: unknown, url = 'https://test.com/api'): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function createGetRequest(params: Record<string, string>): NextRequest {
  const url = new URL('https://test.com/api');
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return new NextRequest(url.toString(), { method: 'GET' });
}

const testSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
});

describe('validateRequestBody', () => {
  it('returns data on valid JSON', async () => {
    const req = createJsonRequest({ name: 'Drew', age: 30 });
    const result = await validateRequestBody(req, testSchema);
    expect('data' in result).toBe(true);
    if ('data' in result) {
      expect(result.data).toEqual({ name: 'Drew', age: 30 });
    }
  });

  it('returns error on invalid JSON', async () => {
    const req = new NextRequest('https://test.com/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json{{{',
    });
    const result = await validateRequestBody(req, testSchema);
    expect('error' in result).toBe(true);
    if ('error' in result) {
      const body = await result.error.json();
      expect(body.error).toBe('Invalid JSON in request body');
      expect(result.error.status).toBe(400);
    }
  });

  it('returns error on validation failure', async () => {
    const req = createJsonRequest({ name: '', age: -5 });
    const result = await validateRequestBody(req, testSchema);
    expect('error' in result).toBe(true);
    if ('error' in result) {
      const body = await result.error.json();
      expect(body.error).toBe('Validation failed');
      expect(body.details).toBeInstanceOf(Array);
      expect(body.details.length).toBeGreaterThan(0);
      expect(body.details[0]).toHaveProperty('field');
      expect(body.details[0]).toHaveProperty('message');
    }
  });
});

describe('validateQueryParams', () => {
  const querySchema = z.object({
    page: z.string().min(1),
    limit: z.string().optional(),
  });

  it('returns data on valid params', () => {
    const req = createGetRequest({ page: '1', limit: '10' });
    const result = validateQueryParams(req, querySchema);
    expect('data' in result).toBe(true);
    if ('data' in result) {
      expect(result.data).toEqual({ page: '1', limit: '10' });
    }
  });

  it('returns error on invalid params', () => {
    const req = createGetRequest({});
    const result = validateQueryParams(req, querySchema);
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error.status).toBe(400);
    }
  });
});

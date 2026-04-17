import { NextRequest } from 'next/server';

export const ALLOWED_ORIGIN = 'https://www.dcyfr.ai';
export const ATTACKER_ORIGIN = 'https://attacker.example.com';

export interface MakeRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string | Record<string, unknown>;
  clientIp?: string;
}

export function makeRequest(path: string, options: MakeRequestOptions = {}): NextRequest {
  const { method = 'GET', headers = {}, body, clientIp } = options;

  const allHeaders: Record<string, string> = { ...headers };
  if (clientIp) allHeaders['x-forwarded-for'] = clientIp;

  const bodyStr =
    body != null ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined;

  if (bodyStr && !allHeaders['content-type']) {
    allHeaders['content-type'] = 'application/json';
  }

  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: allHeaders,
    body: bodyStr,
  });
}

export function makeBookmarkRequest(slug: string, clientIp?: string): NextRequest {
  return makeRequest('/api/engagement/bookmark', {
    method: 'POST',
    body: { slug, contentType: 'post', action: 'bookmark' },
    clientIp,
  });
}

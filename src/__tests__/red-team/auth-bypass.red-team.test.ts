import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth-middleware';

const mockGetAuthenticatedUser = vi.fn();
const mockValidateRequestCSRF = vi.fn();
const mockHasPermission = vi.fn();
const mockUpdateSessionActivity = vi.fn();

vi.mock('@/lib/auth-utils', () => ({
  getAuthenticatedUser: (...args: unknown[]) => mockGetAuthenticatedUser(...args),
  validateRequestCSRF: (...args: unknown[]) => mockValidateRequestCSRF(...args),
  hasPermission: (...args: unknown[]) => mockHasPermission(...args),
  updateSessionActivity: (...args: unknown[]) => mockUpdateSessionActivity(...args),
  createUnauthorizedResponse: (msg: string) =>
    NextResponse.json({ error: msg, code: 'UNAUTHORIZED' }, { status: 401 }),
  createForbiddenResponse: (msg: string) =>
    NextResponse.json({ error: msg, code: 'FORBIDDEN' }, { status: 403 }),
  createCSRFErrorResponse: () =>
    NextResponse.json({ error: 'Invalid CSRF token', code: 'CSRF_ERROR' }, { status: 403 }),
}));

const makeReq = (method = 'POST', headers: Record<string, string> = {}) =>
  new NextRequest('http://localhost/api/protected', { method, headers });

const successHandler = vi.fn(async () => NextResponse.json({ ok: true }, { status: 200 }));

describe('Red Team: Auth Bypass', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateSessionActivity.mockResolvedValue(undefined);
  });

  it('should return 401 for unauthenticated request', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ user: null, sessionToken: null, session: null });

    const handler = withAuth(successHandler);
    const res = await handler(makeReq(), {});

    expect(res.status).toBe(401);
    expect(successHandler).not.toHaveBeenCalled();
  });

  it('should call handler for authenticated request with valid CSRF', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({
      user: { id: 'u1', email: 'user@example.com', permissions: [] },
      sessionToken: 'tok',
      session: {},
    });
    mockValidateRequestCSRF.mockResolvedValue(true);

    const handler = withAuth(successHandler);
    const res = await handler(makeReq(), {});

    expect(res.status).toBe(200);
    expect(successHandler).toHaveBeenCalledOnce();
  });

  it('should return 403 for POST with invalid CSRF token', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({
      user: { id: 'u1', email: 'user@example.com', permissions: [] },
      sessionToken: 'tok',
      session: {},
    });
    mockValidateRequestCSRF.mockResolvedValue(false);

    const handler = withAuth(successHandler, { requireCSRF: true });
    const res = await handler(makeReq('POST'), {});

    expect(res.status).toBe(403);
    expect(successHandler).not.toHaveBeenCalled();
  });

  it('should return 403 when required permissions are missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({
      user: { id: 'u1', email: 'user@example.com', permissions: ['read'] },
      sessionToken: 'tok',
      session: {},
    });
    mockValidateRequestCSRF.mockResolvedValue(true);
    mockHasPermission.mockReturnValue(false);

    const handler = withAuth(successHandler, { requiredPermissions: ['admin'] });
    const res = await handler(makeReq(), {});

    expect(res.status).toBe(403);
    expect(successHandler).not.toHaveBeenCalled();
  });

  it('should return 401 for expired/invalid session token', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({
      user: null,
      sessionToken: 'bad-tok',
      session: null,
    });

    const handler = withAuth(successHandler);
    const res = await handler(makeReq(), {});

    expect(res.status).toBe(401);
    expect(successHandler).not.toHaveBeenCalled();
  });
});

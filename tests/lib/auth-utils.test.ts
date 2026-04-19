import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/secure-session-manager', () => ({
  SecureSessionManager: {
    createSession: vi.fn(),
    getSession: vi.fn(),
    destroySession: vi.fn(),
    validateCSRF: vi.fn(),
    updateSession: vi.fn(),
  },
}));

import {
  createAuthSession,
  getAuthenticatedUser,
  validateRequestCSRF,
  hasPermission,
  logoutUser,
  setAuthCookies,
  clearAuthCookies,
  createUnauthorizedResponse,
  createForbiddenResponse,
  createCSRFErrorResponse,
  updateSessionActivity,
  refreshSession,
} from '@/lib/auth-utils';
import { SecureSessionManager } from '@/lib/secure-session-manager';
import { NextRequest, NextResponse } from 'next/server';

const mocked = vi.mocked(SecureSessionManager);

describe('auth-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createAuthSession', () => {
    it('creates session with user data', async () => {
      mocked.createSession.mockResolvedValue({
        sessionToken: 'tok-123',
        csrfToken: 'csrf-456',
      });

      const result = await createAuthSession({
        id: 'u1',
        email: 'test@example.com',
        permissions: ['read'],
      });

      expect(result.sessionToken).toBe('tok-123');
      expect(result.csrfToken).toBe('csrf-456');
      expect(mocked.createSession).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'u1', email: 'test@example.com' }),
        86400
      );
    });

    it('uses custom expiry', async () => {
      mocked.createSession.mockResolvedValue({ sessionToken: 't', csrfToken: 'c' });

      await createAuthSession({ id: 'u1', email: 'a@b.com' }, 48);
      expect(mocked.createSession).toHaveBeenCalledWith(
        expect.anything(),
        172800 // 48 * 3600
      );
    });
  });

  describe('getAuthenticatedUser', () => {
    it('returns null user when no token', async () => {
      const req = new NextRequest('http://localhost/api/test');
      const result = await getAuthenticatedUser(req);
      expect(result.user).toBeNull();
      expect(result.sessionToken).toBeNull();
    });

    it('extracts token from Authorization header', async () => {
      mocked.getSession.mockResolvedValue({
        userId: 'u1',
        email: 'a@b.com',
        permissions: ['admin'],
      });

      const req = new NextRequest('http://localhost/api/test', {
        headers: { Authorization: 'Bearer my-token' },
      });
      const result = await getAuthenticatedUser(req);
      expect(result.user).not.toBeNull();
      expect(result.user!.id).toBe('u1');
      expect(result.sessionToken).toBe('my-token');
    });

    it('returns null user for invalid session', async () => {
      mocked.getSession.mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/test', {
        headers: { Authorization: 'Bearer bad-token' },
      });
      const result = await getAuthenticatedUser(req);
      expect(result.user).toBeNull();
    });

    it('handles session errors gracefully', async () => {
      mocked.getSession.mockRejectedValue(new Error('Redis down'));
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const req = new NextRequest('http://localhost/api/test', {
        headers: { Authorization: 'Bearer tok' },
      });
      const result = await getAuthenticatedUser(req);
      expect(result.user).toBeNull();
      spy.mockRestore();
    });
  });

  describe('validateRequestCSRF', () => {
    it('returns false when no CSRF token present', async () => {
      const req = new NextRequest('http://localhost/api/test');
      const result = await validateRequestCSRF(req, 'session-tok');
      expect(result).toBe(false);
    });

    it('validates CSRF from header', async () => {
      mocked.validateCSRF.mockResolvedValue(true);
      const req = new NextRequest('http://localhost/api/test', {
        headers: { 'x-csrf-token': 'csrf-tok' },
      });
      const result = await validateRequestCSRF(req, 'session-tok');
      expect(result).toBe(true);
      expect(mocked.validateCSRF).toHaveBeenCalledWith('session-tok', 'csrf-tok');
    });
  });

  describe('hasPermission', () => {
    it('returns true when user has the permission', () => {
      expect(
        hasPermission({ id: 'u', email: 'a@b.com', permissions: ['read', 'write'] }, 'write')
      ).toBe(true);
    });

    it('returns true for admin users regardless of permission', () => {
      expect(hasPermission({ id: 'u', email: 'a@b.com', permissions: ['admin'] }, 'anything')).toBe(
        true
      );
    });

    it('returns false when permission is missing', () => {
      expect(hasPermission({ id: 'u', email: 'a@b.com', permissions: ['read'] }, 'write')).toBe(
        false
      );
    });

    it('returns false when permissions array is undefined', () => {
      expect(hasPermission({ id: 'u', email: 'a@b.com' }, 'read')).toBe(false);
    });
  });

  describe('logoutUser', () => {
    it('destroys session', async () => {
      mocked.destroySession.mockResolvedValue(true);
      const result = await logoutUser('tok');
      expect(result).toBe(true);
      expect(mocked.destroySession).toHaveBeenCalledWith('tok');
    });

    it('returns false for empty token', async () => {
      const result = await logoutUser('');
      expect(result).toBe(false);
    });
  });

  describe('setAuthCookies', () => {
    it('sets session and CSRF cookies', () => {
      const response = NextResponse.json({ ok: true });
      const result = setAuthCookies(response, 'sess-tok', 'csrf-tok');
      const cookies = result.cookies.getAll();
      const sessionCookie = cookies.find((c) => c.name === 'session_token');
      const csrfCookie = cookies.find((c) => c.name === 'csrf_token');
      expect(sessionCookie?.value).toBe('sess-tok');
      expect(csrfCookie?.value).toBe('csrf-tok');
    });
  });

  describe('clearAuthCookies', () => {
    it('clears authentication cookies', () => {
      const response = NextResponse.json({ ok: true });
      const result = clearAuthCookies(response);
      const cookies = result.cookies.getAll();
      // Cookies should be set to empty/expired
      const sessionCookie = cookies.find((c) => c.name === 'session_token');
      expect(sessionCookie).toBeDefined();
    });
  });

  describe('createUnauthorizedResponse', () => {
    it('returns 401 response', async () => {
      const response = createUnauthorizedResponse();
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('Unauthorized');
      expect(body.code).toBe('UNAUTHORIZED');
    });

    it('accepts custom message', async () => {
      const response = createUnauthorizedResponse('Custom message');
      const body = await response.json();
      expect(body.error).toBe('Custom message');
    });
  });

  describe('createForbiddenResponse', () => {
    it('returns 403 response', async () => {
      const response = createForbiddenResponse();
      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.code).toBe('FORBIDDEN');
    });
  });

  describe('createCSRFErrorResponse', () => {
    it('returns 403 with CSRF error code', async () => {
      const response = createCSRFErrorResponse();
      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.code).toBe('CSRF_ERROR');
    });
  });

  describe('updateSessionActivity', () => {
    it('updates session with lastActivity', async () => {
      mocked.updateSession.mockResolvedValue(true);
      await updateSessionActivity('tok');
      expect(mocked.updateSession).toHaveBeenCalledWith(
        'tok',
        expect.objectContaining({ lastActivity: expect.any(Number) }),
        false
      );
    });

    it('silently handles errors', async () => {
      mocked.updateSession.mockRejectedValue(new Error('fail'));
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      await updateSessionActivity('tok');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('skips empty token', async () => {
      await updateSessionActivity('');
      expect(mocked.updateSession).not.toHaveBeenCalled();
    });
  });

  describe('refreshSession', () => {
    it('extends session expiry', async () => {
      mocked.updateSession.mockResolvedValue(true);
      const result = await refreshSession('tok', 48);
      expect(result).toBe(true);
      expect(mocked.updateSession).toHaveBeenCalledWith(
        'tok',
        expect.objectContaining({ expiresAt: expect.any(Number) }),
        true
      );
    });

    it('returns false for empty token', async () => {
      const result = await refreshSession('');
      expect(result).toBe(false);
    });

    it('returns false on error', async () => {
      mocked.updateSession.mockRejectedValue(new Error('fail'));
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await refreshSession('tok');
      expect(result).toBe(false);
      spy.mockRestore();
    });
  });
});

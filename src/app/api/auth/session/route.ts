import { NextRequest, NextResponse } from 'next/server';
import { createProtectedHandler } from '@/lib/auth-middleware';
import { validateRequestCSRF, getAuthenticatedUser } from '@/lib/auth-utils';
import { SecureSessionManager } from '@/lib/secure-session-manager';

/**
 * Session Management API Routes
 *
 * Provides secure session management endpoints that work across all environments.
 * Used for authentication status, session refresh, and logout.
 *
 * Security notes:
 * - GET /api/auth/session - Public endpoint that returns { authenticated: false } for unauthenticated users
 * - GET /api/auth/session with Authorization - Requires CSRF token for authenticated users accessing sensitive data
 * - POST/DELETE - Require CSRF tokens (state-changing operations)
 */

// GET: Check authentication status or retrieve authenticated session details
async function handleGet(request: NextRequest) {
  const { user, sessionToken, session } = await getAuthenticatedUser(request);

  // Public check: return only authentication status
  if (!user || !session) {
    return NextResponse.json({ authenticated: false });
  }

  // For authenticated users accessing sensitive session details, validate CSRF token
  // This prevents CSRF attacks that attempt to read session metadata
  if (sessionToken) {
    const csrfValid = await validateRequestCSRF(request, sessionToken);
    if (!csrfValid) {
      // Return generic 403 without exposing CSRF details
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
  }

  // Get session stats for admin users
  const sessionStats = user.permissions?.includes('admin')
    ? await SecureSessionManager.getSessionStats()
    : null;

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      permissions: user.permissions,
      profile: user.profile
    },
    session: {
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      expiresAt: session.expiresAt,
      csrfToken: session.csrfToken
    },
    sessionStats: sessionStats // Only for admin users
  });
}

// POST: Refresh session expiry
async function handlePost(request: NextRequest) {
  const { user, sessionToken } = await getAuthenticatedUser(request);
  
  if (!user || !sessionToken) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  const body = await request.json();
  const { expiryHours = 24 } = body;

  // Update session expiry
  const success = await SecureSessionManager.updateSession(sessionToken, {
    expiresAt: Date.now() + (expiryHours * 60 * 60 * 1000),
    lastActivity: Date.now()
  }, true);

  if (!success) {
    return NextResponse.json(
      { error: 'Failed to refresh session' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Session extended by ${expiryHours} hours`,
    newExpiry: new Date(Date.now() + (expiryHours * 60 * 60 * 1000)).toISOString()
  });
}

// DELETE: Logout and destroy session
async function handleDelete(request: NextRequest) {
  const { sessionToken } = await getAuthenticatedUser(request);
  
  if (sessionToken) {
    await SecureSessionManager.destroySession(sessionToken);
  }

  return NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });
}

// Export protected handlers
export const { GET, POST, DELETE } = createProtectedHandler(
  {
    GET: handleGet,
    POST: handlePost,
    DELETE: handleDelete
  },
  {
    requireAuth: false, // GET can be called without auth to check status
    requireCSRF: false, // CSRF not needed for read operations
    updateActivity: true
  }
);
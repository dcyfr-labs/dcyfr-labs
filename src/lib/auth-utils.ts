import { NextRequest, NextResponse } from 'next/server';
import { SecureSessionManager } from '@/lib/secure-session-manager';

/**
 * Authentication Utilities
 * 
 * Helper functions for authentication flows, session management,
 * and security middleware across all environments.
 */

interface AuthUser {
  id: string;
  email: string;
  profile?: any;
  permissions?: string[];
}

/**
 * Create authentication session after successful login
 */
export async function createAuthSession(
  user: AuthUser,
  expiryHours: number = 24
): Promise<{ sessionToken: string; csrfToken: string }> {
  const sessionData = {
    userId: user.id,
    email: user.email,
    linkedinProfile: user.profile,
    permissions: user.permissions || [],
  };

  const expirySeconds = expiryHours * 60 * 60;
  return await SecureSessionManager.createSession(sessionData, expirySeconds);
}

/**
 * Get authenticated user from request
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<{
  user: AuthUser | null;
  sessionToken: string | null;
  session: any;
}> {
  // Try session token from Authorization header first
  let sessionToken = request.headers.get('authorization')?.replace('Bearer ', '') || null;
  
  // Fallback to cookie
  if (!sessionToken) {
    sessionToken = request.cookies.get('session_token')?.value || null;
  }

  if (!sessionToken) {
    return { user: null, sessionToken: null, session: null };
  }

  try {
    const session = await SecureSessionManager.getSession(sessionToken);
    if (!session || !session.userId) {
      return { user: null, sessionToken, session: null };
    }

    const user: AuthUser = {
      id: session.userId,
      email: session.email || '',
      profile: session.linkedinProfile,
      permissions: session.permissions || []
    };

    return { user, sessionToken, session };
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return { user: null, sessionToken, session: null };
  }
}

/**
 * Validate CSRF token from request
 */
export async function validateRequestCSRF(
  request: NextRequest,
  sessionToken: string
): Promise<boolean> {
  const csrfToken = request.headers.get('x-csrf-token') || 
                   request.headers.get('csrf-token') ||
                   request.cookies.get('csrf_token')?.value;

  if (!csrfToken) {
    return false;
  }

  return await SecureSessionManager.validateCSRF(sessionToken, csrfToken);
}

/**
 * Check if user has required permissions
 */
export function hasPermission(user: AuthUser, permission: string): boolean {
  return user.permissions?.includes(permission) || 
         user.permissions?.includes('admin') || 
         false;
}

/**
 * Logout user and destroy session
 */
export async function logoutUser(sessionToken: string): Promise<boolean> {
  if (!sessionToken) return false;
  return await SecureSessionManager.destroySession(sessionToken);
}

/**
 * Set secure authentication cookies
 */
export function setAuthCookies(
  response: NextResponse,
  sessionToken: string,
  csrfToken: string,
  expiryHours: number = 24
): NextResponse {
  const isProduction = process.env.NODE_ENV === 'production';
  const domain = process.env.COOKIE_DOMAIN || undefined;
  const maxAge = expiryHours * 60 * 60; // Convert to seconds

  // Session token cookie (HttpOnly for security)
  response.cookies.set('session_token', sessionToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge,
    domain,
    path: '/'
  });

  // CSRF token cookie (accessible to JavaScript for API calls)
  response.cookies.set('csrf_token', csrfToken, {
    httpOnly: false, // JavaScript needs access
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge,
    domain,
    path: '/'
  });

  return response;
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies(response: NextResponse): NextResponse {
  const domain = process.env.COOKIE_DOMAIN || undefined;

  response.cookies.delete('session_token');
  response.cookies.delete('csrf_token');

  // Force-clear with explicit values for compatibility
  response.cookies.set('session_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    domain,
    path: '/'
  });

  response.cookies.set('csrf_token', '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    domain,
    path: '/'
  });

  return response;
}

/**
 * Create unauthorized response
 */
export function createUnauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { error: message, code: 'UNAUTHORIZED' },
    { status: 401 }
  );
}

/**
 * Create forbidden response
 */
export function createForbiddenResponse(message: string = 'Forbidden'): NextResponse {
  return NextResponse.json(
    { error: message, code: 'FORBIDDEN' },
    { status: 403 }
  );
}

/**
 * Create CSRF validation error response
 */
export function createCSRFErrorResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Invalid CSRF token', code: 'CSRF_ERROR' },
    { status: 403 }
  );
}

/**
 * Update user session activity
 */
export async function updateSessionActivity(sessionToken: string): Promise<void> {
  if (!sessionToken) return;
  
  try {
    await SecureSessionManager.updateSession(sessionToken, {
      lastActivity: Date.now()
    }, false); // Don't extend expiry, just update activity
  } catch (error) {
    console.error('Error updating session activity:', error);
  }
}

/**
 * Refresh session expiry (extend session)
 */
export async function refreshSession(
  sessionToken: string, 
  expiryHours: number = 24
): Promise<boolean> {
  if (!sessionToken) return false;
  
  try {
    return await SecureSessionManager.updateSession(sessionToken, {
      expiresAt: Date.now() + (expiryHours * 60 * 60 * 1000)
    }, true);
  } catch (error) {
    console.error('Error refreshing session:', error);
    return false;
  }
}
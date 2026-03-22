import { NextRequest, NextResponse } from 'next/server';
import {
  getAuthenticatedUser,
  validateRequestCSRF,
  hasPermission,
  createUnauthorizedResponse,
  createForbiddenResponse,
  createCSRFErrorResponse,
  updateSessionActivity,
} from '@/lib/auth-utils';

/**
 * Authentication Middleware
 *
 * Provides request-level authentication and authorization middleware
 * that works across Dev, Preview, and Production environments.
 */

interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  requireCSRF?: boolean;
  requiredPermissions?: string[];
  updateActivity?: boolean;
  allowedMethods?: string[];
}

type RequestContext = Record<string, unknown>;

type AuthEnvelope = {
  user: Awaited<ReturnType<typeof getAuthenticatedUser>>['user'];
  session: Awaited<ReturnType<typeof getAuthenticatedUser>>['session'];
  sessionToken: Awaited<ReturnType<typeof getAuthenticatedUser>>['sessionToken'];
};

export type AuthenticatedRequest = NextRequest & {
  auth?: AuthEnvelope;
};

type RouteHandler = (req: AuthenticatedRequest, context?: RequestContext) => Promise<NextResponse>;

type MethodHandlers = Partial<Record<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', RouteHandler>>;

/**
 * Middleware function for protecting API routes and pages
 */
export function withAuth(handler: RouteHandler, options: AuthMiddlewareOptions = {}) {
  const {
    requireAuth = true,
    requireCSRF = true,
    requiredPermissions = [],
    updateActivity = true,
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  } = options;

  return async (request: NextRequest, context?: RequestContext): Promise<NextResponse> => {
    try {
      // Check if method is allowed
      if (!allowedMethods.includes(request.method)) {
        return NextResponse.json(
          { error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' },
          { status: 405 }
        );
      }

      // Get authenticated user
      const { user, sessionToken, session } = await getAuthenticatedUser(request);

      // Check authentication requirement
      if (requireAuth && !user) {
        return createUnauthorizedResponse('Authentication required');
      }

      // Check CSRF for state-changing operations
      if (
        requireCSRF &&
        ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method) &&
        sessionToken
      ) {
        const csrfValid = await validateRequestCSRF(request, sessionToken);
        if (!csrfValid) {
          return createCSRFErrorResponse();
        }
      }

      // Check permissions
      if (user && requiredPermissions.length > 0) {
        const hasRequiredPermission = requiredPermissions.some((permission) =>
          hasPermission(user, permission)
        );

        if (!hasRequiredPermission) {
          return createForbiddenResponse(`Required permissions: ${requiredPermissions.join(', ')}`);
        }
      }

      // Update session activity
      if (updateActivity && sessionToken) {
        await updateSessionActivity(sessionToken);
      }

      // Add auth context to request
      const requestWithAuth = request as AuthenticatedRequest;

      if (user) {
        requestWithAuth.auth = { user, session, sessionToken };
      }

      // Call the protected handler
      return await handler(requestWithAuth, context);
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication error', code: 'AUTH_ERROR' },
        { status: 500 }
      );
    }
  };
}

/**
 * Middleware specifically for admin routes
 */
export function withAdminAuth(handler: RouteHandler) {
  return withAuth(handler, {
    requireAuth: true,
    requireCSRF: true,
    requiredPermissions: ['admin'],
    updateActivity: true,
  });
}

/**
 * Middleware for optional authentication (user may or may not be logged in)
 */
export function withOptionalAuth(handler: RouteHandler) {
  return withAuth(handler, {
    requireAuth: false,
    requireCSRF: false,
    requiredPermissions: [],
    updateActivity: true,
  });
}

/**
 * Middleware for read-only routes (no CSRF required)
 */
export function withReadOnlyAuth(handler: RouteHandler) {
  return withAuth(handler, {
    requireAuth: true,
    requireCSRF: false,
    requiredPermissions: [],
    updateActivity: true,
    allowedMethods: ['GET'],
  });
}

/**
 * Extract authenticated user from request (for use within protected handlers)
 */
export function getRequestUser(request: AuthenticatedRequest) {
  return request.auth?.user || null;
}

/**
 * Extract session data from request (for use within protected handlers)
 */
export function getRequestSession(request: AuthenticatedRequest) {
  return request.auth?.session || null;
}

/**
 * Extract session token from request (for use within protected handlers)
 */
export function getRequestSessionToken(request: AuthenticatedRequest) {
  return request.auth?.sessionToken || null;
}

/**
 * Create protected API handler helper
 */
export function createProtectedHandler(
  handlers: MethodHandlers,
  options: AuthMiddlewareOptions = {}
) {
  const protectedHandlers: MethodHandlers = {};

  Object.entries(handlers).forEach(([method, handler]) => {
    if (!handler) return;
    protectedHandlers[method as keyof MethodHandlers] = withAuth(handler, {
      ...options,
      allowedMethods: [method],
    });
  });

  return protectedHandlers;
}

/**
 * Create admin-only API handler helper
 */
export function createAdminHandler(handlers: MethodHandlers) {
  return createProtectedHandler(handlers, {
    requireAuth: true,
    requireCSRF: true,
    requiredPermissions: ['admin'],
  });
}

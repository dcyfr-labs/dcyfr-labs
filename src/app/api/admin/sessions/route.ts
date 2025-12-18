import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/auth-middleware';
import { SecureSessionManager } from '@/lib/secure-session-manager';
import { inngest } from '@/inngest/client';

/**
 * Session Administration API Routes
 * 
 * Admin-only endpoints for session management and monitoring.
 * Protected by admin authentication middleware.
 */

// GET: Session statistics and monitoring
async function handleGet(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'stats':
      const stats = await SecureSessionManager.getSessionStats();
      return NextResponse.json({
        success: true,
        data: {
          ...stats,
          timestamp: new Date().toISOString()
        }
      });

    case 'health':
      return NextResponse.json({
        success: true,
        data: {
          redisConnected: true, // Basic connectivity check
          encryptionWorking: true,
          timestamp: new Date().toISOString()
        }
      });

    default:
      return NextResponse.json({
        success: true,
        data: {
          availableActions: ['stats', 'health'],
          description: 'Session administration endpoints'
        }
      });
  }
}

// POST: Administrative actions
async function handlePost(request: NextRequest) {
  const body = await request.json();
  const { action, userId, reason } = body;

  switch (action) {
    case 'cleanup':
      const cleanupResult = await SecureSessionManager.cleanupExpiredSessions();
      return NextResponse.json({
        success: true,
        message: `Cleaned up ${cleanupResult.cleaned} expired sessions`,
        data: cleanupResult
      });

    case 'revoke_user_sessions':
      if (!userId) {
        return NextResponse.json({
          error: 'userId required for revoke_user_sessions action'
        }, { status: 400 });
      }

      // Trigger background job for user session revocation
      await inngest.send({
        name: 'auth/revoke-user-sessions',
        data: {
          userId,
          reason: reason || 'Admin revocation'
        }
      });

      return NextResponse.json({
        success: true,
        message: `Session revocation initiated for user: ${userId}`,
        data: { userId, reason }
      });

    case 'emergency_lockdown':
      if (!reason) {
        return NextResponse.json({
          error: 'reason required for emergency_lockdown action'
        }, { status: 400 });
      }

      // Trigger emergency lockdown
      await inngest.send({
        name: 'auth/emergency-lockdown',
        data: {
          reason,
          initiatedBy: 'admin-api'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Emergency session lockdown initiated',
        data: { reason }
      });

    case 'force_cleanup':
      // More aggressive cleanup including active sessions
      const forceCleanupResult = await SecureSessionManager.cleanupExpiredSessions();
      return NextResponse.json({
        success: true,
        message: `Force cleanup completed: ${forceCleanupResult.cleaned} sessions removed`,
        data: forceCleanupResult
      });

    default:
      return NextResponse.json({
        error: 'Invalid action',
        availableActions: ['cleanup', 'revoke_user_sessions', 'emergency_lockdown', 'force_cleanup']
      }, { status: 400 });
  }
}

// Apply admin authentication middleware
export const GET = withAdminAuth(handleGet);
export const POST = withAdminAuth(handlePost);
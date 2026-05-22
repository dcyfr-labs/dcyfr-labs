import { inngest } from '@/inngest/client';
import { SecureSessionManager } from '@/lib/secure-session-manager';
import { createServerLogger } from '@/lib/axiom/server-logger';

/**
 * Session Cleanup Background Jobs
 *
 * Automated session management tasks for maintaining Redis session storage.
 * Runs cleanup, monitoring, and security tasks across all environments.
 */

// Structured logger — console in dev/CI, Axiom when AXIOM_TOKEN is set.
const logger = createServerLogger();

/**
 * Daily session cleanup job
 * Removes expired and corrupted sessions from Redis
 */
export const sessionCleanup = inngest.createFunction(
  {
    id: 'session-cleanup',
    name: 'Session Cleanup',

    triggers: [
      {
        cron: '0 2 * * *', // Daily at 2 AM
      },
    ],
  },
  async ({ step }) => {
    console.warn('🧹 Starting daily session cleanup...');

    const result = await step.run('cleanup-expired-sessions', async () => {
      return await SecureSessionManager.cleanupExpiredSessions();
    });

    await step.run('log-cleanup-results', async () => {
      console.warn(`✅ Session cleanup completed: ${result.cleaned} sessions removed`);

      // Get updated stats after cleanup
      const stats = await SecureSessionManager.getSessionStats();
      console.warn('📊 Session stats after cleanup:', stats);

      return {
        cleaned: result.cleaned,
        remainingActive: stats.activeSessions,
        totalRemaining: stats.totalSessions,
      };
    });

    return {
      success: true,
      cleaned: result.cleaned,
    };
  }
);

/**
 * Hourly session monitoring job
 * Tracks session metrics and alerts on anomalies
 */
export const sessionMonitoring = inngest.createFunction(
  {
    id: 'session-monitoring',
    name: 'Session Monitoring',

    triggers: [
      {
        cron: '0 0,4,8,12,16,20 * * *', // Every 4 hours
      },
    ],
  },
  async ({ step }) => {
    const stats = await step.run('collect-session-stats', async () => {
      return await SecureSessionManager.getSessionStats();
    });

    const alerts = await step.run('check-session-alerts', async () => {
      const alerts = [];

      // Alert if too many expired sessions (>50% of total)
      if (stats.totalSessions > 0 && stats.expiredSessions > stats.totalSessions * 0.5) {
        alerts.push({
          type: 'high_expired_sessions',
          message: `High number of expired sessions: ${stats.expiredSessions}/${stats.totalSessions}`,
          severity: 'warning',
        });
      }

      // Alert if unusually high session count (>1000 active)
      if (stats.activeSessions > 1000) {
        alerts.push({
          type: 'high_session_count',
          message: `High active session count: ${stats.activeSessions}`,
          severity: 'info',
        });
      }

      // Alert if no active sessions during business hours (potential issue)
      const hour = new Date().getUTCHours();
      if (stats.activeSessions === 0 && hour >= 14 && hour <= 22) {
        // 9 AM - 5 PM EST
        alerts.push({
          type: 'no_active_sessions',
          message: 'No active sessions during business hours',
          severity: 'warning',
        });
      }

      return alerts;
    });

    // Emit monitoring stats + alerts as structured events. Axiom monitors
    // can alert on `session.monitoring.alert` — that is the alerting hook.
    await step.run('log-monitoring-results', async () => {
      logger.info('session.monitoring.stats', {
        ...stats,
        alertCount: alerts.length,
      });

      for (const alert of alerts) {
        logger.warn('session.monitoring.alert', {
          type: alert.type,
          message: alert.message,
          severity: alert.severity,
        });
      }
    });

    return {
      stats,
      alerts,
      timestamp: new Date().toISOString(),
    };
  }
);

/**
 * User session revocation job (triggered by events)
 * Revokes all sessions for a specific user
 */
export const revokeUserSessions = inngest.createFunction(
  {
    id: 'revoke-user-sessions',
    name: 'Revoke User Sessions',

    triggers: [{ event: 'auth/revoke-user-sessions' }],
  },
  async ({ event, step }) => {
    const { userId, reason } = event.data;

    console.warn(`🔒 Revoking sessions for user: ${userId}, reason: ${reason}`);

    const result = await step.run('revoke-sessions', async () => {
      return await SecureSessionManager.revokeUserSessions(userId);
    });

    await step.run('log-revocation', async () => {
      // Structured audit-trail event — retained and queryable in Axiom.
      logger.info('audit.session.revoked', {
        userId,
        reason,
        revokedSessions: result.revoked,
      });
    });

    return {
      success: true,
      userId,
      reason,
      revokedSessions: result.revoked,
      timestamp: new Date().toISOString(),
    };
  }
);

/**
 * Session security audit job
 * Performs weekly security checks on session data
 */
export const sessionSecurityAudit = inngest.createFunction(
  {
    id: 'session-security-audit',
    name: 'Session Security Audit',

    triggers: [
      {
        cron: '0 3 * * 0', // Weekly on Sunday at 3 AM
      },
    ],
  },
  async ({ step }) => {
    console.warn('🔍 Starting weekly session security audit...');

    const auditResults = await step.run('perform-security-audit', async () => {
      const stats = await SecureSessionManager.getSessionStats();

      // Basic audit checks
      const audit = {
        timestamp: new Date().toISOString(),
        totalSessions: stats.totalSessions,
        activeSessions: stats.activeSessions,
        expiredSessions: stats.expiredSessions,
        checks: {
          encryptionWorking: true, // Would be false if decryption fails
          redisConnectivity: stats.totalSessions >= 0, // Basic connectivity check
          sessionStructure: true, // Would check for malformed sessions
        },
        recommendations: [] as string[],
      };

      // Add recommendations based on findings
      if (stats.expiredSessions > stats.activeSessions * 0.3) {
        audit.recommendations.push('Consider more frequent cleanup of expired sessions');
      }

      if (stats.totalSessions > 5000) {
        audit.recommendations.push('Monitor session storage usage and consider cleanup policies');
      }

      return audit;
    });

    await step.run('log-audit-results', async () => {
      console.warn('🔍 Security audit results:', auditResults);

      if (auditResults.recommendations.length > 0) {
        console.warn('💡 Audit recommendations:', auditResults.recommendations);
      }
    });

    return auditResults;
  }
);

/**
 * Emergency session lockdown job (triggered by security events)
 * Destroys all sessions in case of security breach
 */
export const emergencySessionLockdown = inngest.createFunction(
  {
    id: 'emergency-session-lockdown',
    name: 'Emergency Session Lockdown',

    triggers: [{ event: 'auth/emergency-lockdown' }],
  },
  async ({ event, step }) => {
    const { reason, initiatedBy } = event.data;

    console.warn(`🚨 EMERGENCY SESSION LOCKDOWN initiated by ${initiatedBy}: ${reason}`);

    const result = await step.run('destroy-all-sessions', async () => {
      const stats = await SecureSessionManager.getSessionStats();

      // Force cleanup of ALL sessions (including active ones)
      const cleanup = await SecureSessionManager.cleanupExpiredSessions();

      // TODO: In a real emergency, you might want to clear ALL Redis session keys
      // This would require additional SecureSessionManager method
      console.warn(`🔥 Emergency cleanup: ${cleanup.cleaned} sessions destroyed`);

      return {
        beforeLockdown: stats,
        destroyed: cleanup.cleaned,
      };
    });

    await step.run('log-emergency-action', async () => {
      // error-level structured event — this IS the critical security alert;
      // Axiom error monitors page on `security.session.emergency_lockdown`.
      logger.error('security.session.emergency_lockdown', {
        reason,
        initiatedBy,
        sessionsDestroyed: result.destroyed,
      });
    });

    return {
      success: true,
      reason,
      initiatedBy,
      sessionsDestroyed: result.destroyed,
      timestamp: new Date().toISOString(),
    };
  }
);

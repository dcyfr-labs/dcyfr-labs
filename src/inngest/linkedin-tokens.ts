import { inngest } from '@/inngest/client';
import { LinkedInTokenManager } from '@/lib/linkedin-token-manager';
import { Redis } from '@upstash/redis';

/**
 * LinkedIn Token Refresh Background Job
 * 
 * Automatically checks and refreshes LinkedIn tokens before expiration.
 * Runs daily and sends alerts when manual intervention is needed.
 */
export const linkedinTokenRefreshJob = inngest.createFunction(
  { 
    id: 'linkedin-token-refresh',
    retries: 3
  },
  { cron: '0 9 * * *' }, // Daily at 9 AM UTC
  async ({ event, step }) => {
    // Step 1: Check token status
    const tokenStatus = await step.run('check-token-status', async () => {
      return await LinkedInTokenManager.getTokenStatus();
    });

    // Step 2: Attempt to refresh tokens if needed
    const refreshResults = await step.run('refresh-tokens', async () => {
      await LinkedInTokenManager.checkAllTokens();
      return await LinkedInTokenManager.getTokenStatus();
    });

    // Step 3: Send alerts for failed refreshes
    await step.run('send-alerts', async () => {
      const now = Date.now();
      const criticalThreshold = 3 * 24 * 60 * 60 * 1000; // 3 days
      const warningThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days

      for (const [tokenType, status] of Object.entries(refreshResults)) {
        if (!status.valid || !status.expiresAt) continue;

        const timeUntilExpiry = status.expiresAt - now;
        
        if (timeUntilExpiry <= criticalThreshold) {
          await inngest.send({
            name: 'linkedin/token.critical-expiry',
            data: {
              tokenType,
              daysUntilExpiry: Math.round(timeUntilExpiry / (24 * 60 * 60 * 1000)),
              severity: 'CRITICAL'
            }
          });
        } else if (timeUntilExpiry <= warningThreshold) {
          await inngest.send({
            name: 'linkedin/token.expiry-warning', 
            data: {
              tokenType,
              daysUntilExpiry: Math.round(timeUntilExpiry / (24 * 60 * 60 * 1000)),
              severity: 'HIGH'
            }
          });
        }
      }
    });

    return { 
      tokenStatus: refreshResults,
      message: 'Token refresh check completed'
    };
  }
);

/**
 * Schedule Token Refresh Job
 * 
 * Triggered when new tokens are stored to schedule proactive refresh.
 */
export const scheduleTokenRefresh = inngest.createFunction(
  { id: 'linkedin-schedule-token-refresh' },
  { event: 'linkedin/token.schedule-refresh' },
  async ({ event, step }) => {
    const { tokenType, expiresAt, hasRefreshToken } = event.data;

    // Schedule refresh attempt 1 week before expiration
    const refreshTime = expiresAt - (7 * 24 * 60 * 60 * 1000);
    
    if (refreshTime > Date.now()) {
      await step.sendEvent('schedule-refresh', {
        name: 'linkedin/token.refresh-attempt',
        data: { tokenType, hasRefreshToken },
        ts: refreshTime
      });
    }

    return { scheduled: true, refreshTime };
  }
);

/**
 * Handle Scheduled Token Refresh
 */
export const handleTokenRefresh = inngest.createFunction(
  { id: 'linkedin-handle-token-refresh' },
  { event: 'linkedin/token.refresh-attempt' },
  async ({ event, step }) => {
    const { tokenType } = event.data;

    const success = await step.run('attempt-refresh', async () => {
      return await LinkedInTokenManager.attemptTokenRefresh(tokenType);
    });

    if (!success) {
      await step.run('send-failure-alert', async () => {
        await inngest.send({
          name: 'linkedin/token.refresh-failed',
          data: {
            tokenType,
            message: `Failed to refresh ${tokenType} token. Manual re-authorization required.`,
            severity: 'HIGH'
          }
        });
      });
    }

    return { success, tokenType };
  }
);

/**
 * Handle Re-authorization Required
 */
export const handleReAuthRequired = inngest.createFunction(
  { id: 'linkedin-reauth-required' },
  { event: 'linkedin/token.reauth-required' },
  async ({ event, step }) => {
    const { tokenType, reAuthUrl, message, severity } = event.data;

    // Log to console
    console.error(`🚨 LinkedIn ${tokenType} re-authorization required: ${message}`);
    console.log(`🔗 Re-authorization URL: ${reAuthUrl}`);

    // Send email alert if configured
    if (process.env.INNGEST_ERROR_ALERTS_EMAIL && process.env.RESEND_API_KEY) {
      await step.run('send-email-alert', async () => {
        await inngest.send({
          name: 'notifications/send-alert-email',
          data: {
            subject: `LinkedIn Token Expiration - Action Required`,
            message: `
              LinkedIn ${tokenType} token has expired and requires manual re-authorization.
              
              Action Required:
              1. Visit: ${reAuthUrl}
              2. Complete LinkedIn authorization
              3. Tokens will be automatically stored
              
              This affects:
              ${tokenType === 'openid' ? '- User authentication\n- Profile access' : '- Content posting\n- Social media integration'}
            `,
            severity
          }
        });
      });
    }

    // Store re-auth requirement in Redis for dashboard display
    if (process.env.REDIS_URL) {
      await step.run('store-reauth-notice', async () => {
        // Parse Redis URL to extract credentials for Upstash REST API
        const parsed = new URL(process.env.REDIS_URL!);
        const token = parsed.password;
        const host = parsed.hostname;
        const port = parsed.port;
        const restUrl = `https://${host}:${port}`;
        
        const redis = new Redis({ url: restUrl, token });
        
        await redis.setex(
          `linkedin:reauth-required:${tokenType}`,
          30 * 24 * 60 * 60, // 30 days
          JSON.stringify({
            tokenType,
            reAuthUrl,
            message,
            timestamp: Date.now()
          })
        );
      });
    }

    return { alerted: true, tokenType };
  }
);

/**
 * Export all LinkedIn token management functions
 */
export const linkedinTokenFunctions = [
  linkedinTokenRefreshJob,
  scheduleTokenRefresh,
  handleTokenRefresh,
  handleReAuthRequired
];
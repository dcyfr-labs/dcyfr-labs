/**
 * Prompt Security Inngest Functions
 *
 * Background jobs for prompt threat intelligence:
 * - Threat detection event processing
 * - Daily threat reports
 * - IoPC database updates
 * - Security metrics aggregation
 */

import { inngest } from '@/inngest/client';
import { getPromptScanner } from '@/lib/security/prompt-scanner';
import { PromptIntelClient } from '@/mcp/shared/promptintel-client';

// ============================================================================
// Event Types
// ============================================================================

interface ThreatDetectedEvent {
  data: {
    timestamp: number;
    url: string;
    method: string;
    userAgent: string;
    ip: string;
    threats: Array<{
      pattern: string;
      category: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      confidence: number;
      source: string;
    }>;
    riskScore: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
    blocked: boolean;
  };
}

interface ScanErrorEvent {
  data: {
    timestamp: number;
    url: string;
    method: string;
    error: string;
  };
}

// ============================================================================
// Threat Detection Handler
// ============================================================================

/**
 * Process detected prompt threats
 * - Store in database
 * - Send alerts for critical threats
 * - Update metrics
 */
export const handlePromptThreatDetected = inngest.createFunction(
  {
    id: 'security-prompt-threat-detected',
    name: 'Handle Prompt Threat Detection',
  },
  { event: 'security/prompt.threat-detected' },
  async ({ event, step }) => {
    const { data } = event as ThreatDetectedEvent;

    // Step 1: Log threat details
    await step.run('log-threat', async () => {
      console.log('[PromptSecurity] Threat detected:', {
        url: data.url,
        severity: data.severity,
        riskScore: data.riskScore,
        blocked: data.blocked,
        threatCount: data.threats.length,
      });
    });

    // Step 2: Send alert for critical/high severity threats
    if (data.severity === 'critical' || data.severity === 'high') {
      await step.run('send-alert', async () => {
        // TODO: Implement alert logic (email, Slack, etc.)
        console.log('[PromptSecurity] ALERT: High severity threat detected', {
          severity: data.severity,
          url: data.url,
          ip: data.ip,
        });
      });
    }

    // Step 3: Update security metrics
    await step.run('update-metrics', async () => {
      // TODO: Implement metrics storage (Redis, database, etc.)
      const metrics = {
        timestamp: data.timestamp,
        severity: data.severity,
        riskScore: data.riskScore,
        blocked: data.blocked,
        threatTypes: [...new Set(data.threats.map(t => t.category))],
      };

      console.log('[PromptSecurity] Metrics updated:', metrics);
    });

    // Step 4: Submit to PromptIntel if high confidence
    const highConfidenceThreats = data.threats.filter(t => t.confidence > 0.8);

    if (highConfidenceThreats.length > 0) {
      await step.run('submit-to-promptintel', async () => {
        try {
          const client = new PromptIntelClient({
            apiKey: process.env.PROMPTINTEL_API_KEY || '',
          });

          // TODO: Implement report submission once API supports it
          console.log('[PromptSecurity] Would submit to PromptIntel:', {
            threatCount: highConfidenceThreats.length,
            categories: highConfidenceThreats.map(t => t.category),
          });
        } catch (error) {
          console.error('[PromptSecurity] Failed to submit to PromptIntel:', error);
        }
      });
    }

    return {
      success: true,
      threatsProcessed: data.threats.length,
      severity: data.severity,
    };
  }
);

// ============================================================================
// Daily Threat Report
// ============================================================================

/**
 * Generate and send daily threat intelligence report
 * Runs at 9 AM UTC daily
 */
export const generateDailyThreatReport = inngest.createFunction(
  {
    id: 'security-daily-threat-report',
    name: 'Generate Daily Threat Report',
  },
  { cron: '0 9 * * *' }, // 9 AM UTC daily
  async ({ step }) => {
    const reportDate = new Date();

    // Step 1: Fetch critical threats from PromptIntel
    const criticalThreats = await step.run('fetch-critical-threats', async () => {
      try {
        const client = new PromptIntelClient({
          apiKey: process.env.PROMPTINTEL_API_KEY || '',
        });

        const threats = await client.getPrompts({
          severity: 'critical',
          limit: 10,
        });

        return threats;
      } catch (error) {
        console.error('[PromptSecurity] Failed to fetch critical threats:', error);
        return [];
      }
    });

    // Step 2: Aggregate yesterday's metrics
    const yesterdayMetrics = await step.run('aggregate-metrics', async () => {
      // TODO: Fetch from metrics storage
      const metrics = {
        totalScans: 0,
        threatsDetected: 0,
        blockedRequests: 0,
        avgRiskScore: 0,
        topThreatCategories: [] as string[],
      };

      return metrics;
    });

    // Step 3: Generate report
    const report = await step.run('generate-report', async () => {
      return {
        date: reportDate.toISOString().split('T')[0],
        summary: {
          criticalThreats: criticalThreats.length,
          totalScans: yesterdayMetrics.totalScans,
          threatsDetected: yesterdayMetrics.threatsDetected,
          blockedRequests: yesterdayMetrics.blockedRequests,
          avgRiskScore: yesterdayMetrics.avgRiskScore,
        },
        topThreats: criticalThreats.slice(0, 5),
        topCategories: yesterdayMetrics.topThreatCategories,
      };
    });

    // Step 4: Send report
    await step.run('send-report', async () => {
      // TODO: Send via email or store in dashboard
      console.log('[PromptSecurity] Daily report generated:', report.summary);
    });

    return {
      success: true,
      reportDate: report.date,
      summary: report.summary,
    };
  }
);

// ============================================================================
// IoPC Database Sync
// ============================================================================

/**
 * Sync IoPC database every 6 hours
 * Keeps local threat cache fresh
 */
export const syncIoPCDatabase = inngest.createFunction(
  {
    id: 'security-sync-iopc',
    name: 'Sync IoPC Database',
  },
  { cron: '0 */6 * * *' }, // Every 6 hours
  async ({ step }) => {
    // Step 1: Clear scanner cache
    await step.run('clear-cache', async () => {
      const scanner = getPromptScanner();
      scanner.clearCache();
      console.log('[PromptSecurity] Scanner cache cleared');
    });

    // Step 2: Fetch latest threats
    const threats = await step.run('fetch-threats', async () => {
      try {
        const client = new PromptIntelClient({
          apiKey: process.env.PROMPTINTEL_API_KEY || '',
        });

        const [critical, high, medium] = await Promise.all([
          client.getPrompts({ severity: 'critical', limit: 50 }),
          client.getPrompts({ severity: 'high', limit: 50 }),
          client.getPrompts({ severity: 'medium', limit: 50 }),
        ]);

        return {
          critical: critical.length,
          high: high.length,
          medium: medium.length,
          total: critical.length + high.length + medium.length,
        };
      } catch (error) {
        console.error('[PromptSecurity] Failed to sync IoPC:', error);
        throw error;
      }
    });

    // Step 3: Update local database
    await step.run('update-database', async () => {
      // TODO: Store in database for faster querying
      console.log('[PromptSecurity] IoPC sync complete:', threats);
    });

    return {
      success: true,
      threatsSync: threats.total,
      timestamp: new Date().toISOString(),
    };
  }
);

// ============================================================================
// Scan Error Handler
// ============================================================================

/**
 * Handle prompt scanning errors
 * Track failure rates and alert on high error rates
 */
export const handlePromptScanError = inngest.createFunction(
  {
    id: 'security-prompt-scan-error',
    name: 'Handle Prompt Scan Error',
  },
  { event: 'security/prompt.scan-error' },
  async ({ event, step }) => {
    const { data } = event as ScanErrorEvent;

    await step.run('log-error', async () => {
      console.error('[PromptSecurity] Scan error:', {
        url: data.url,
        method: data.method,
        error: data.error,
        timestamp: data.timestamp,
      });
    });

    // TODO: Track error rate and alert if too high

    return {
      success: true,
      errorLogged: true,
    };
  }
);

// ============================================================================
// Export All Functions
// ============================================================================

export const promptSecurityFunctions = [
  handlePromptThreatDetected,
  generateDailyThreatReport,
  syncIoPCDatabase,
  handlePromptScanError,
];

/**
 * Inngest functions for automated IP reputation checking
 * 
 * Integrates with Axiom logs and GreyNoise API to automatically
 * identify and block malicious IPs from accessing the site.
 */

import { inngest } from "./client";
import { IPReputationService } from "@/lib/ip-reputation";
import * as Sentry from "@sentry/nextjs";
import {
  type IPReputationCheckTriggered,
  type IPReputationCheckCompleted,
  type MaliciousIPDetected,
  type IPReputationConfig,
  type IPReputationBulkResult,
} from "@/types/ip-reputation";

// Default configuration
const DEFAULT_CONFIG: IPReputationConfig = {
  check_interval_minutes: 60, // Check hourly
  axiom_dataset: "vercel",
  axiom_query: "['vercel'] | where isnotnull(['request.ip']) | summarize Value = count() by ['request.ip'] | order by Value desc",
  min_request_threshold: 10, // Only check IPs with 10+ requests
  cache_ttl_hours: 24,
  auto_block_malicious: true,
  auto_rate_limit_suspicious: true,
  rate_limits: {
    malicious: {
      limit: 1,
      window_seconds: 3600,
      block_immediately: true,
    },
    suspicious: {
      limit: 10,
      window_seconds: 3600,
      block_immediately: false,
    },
    unknown: {
      limit: 100,
      window_seconds: 3600,
      block_immediately: false,
    },
    benign: {
      limit: 1000,
      window_seconds: 3600,
      block_immediately: false,
    },
  },
  alert_thresholds: {
    new_malicious_ips_per_hour: 5,
    total_malicious_requests_per_hour: 100,
  },
};

/**
 * Scheduled function to automatically check IP reputation
 * Runs hourly to analyze recent traffic and identify threats
 */
export const scheduleIpReputationCheck = inngest.createFunction(
  {
    id: "schedule-ip-reputation-check",
    name: "Schedule IP Reputation Check",
  },
  { cron: "0 0,4,8,12,16,20 * * *" }, // Every 4 hours (0, 4, 8, 12, 16, 20 UTC)
  async ({ step, logger }) => {
    logger.info("Starting scheduled IP reputation check");

    await step.sendEvent("trigger-ip-reputation-check", {
      name: "security/ip-reputation.check-triggered",
      data: {
        trigger_source: "scheduled",
        check_config: DEFAULT_CONFIG,
      },
    });

    return { status: "scheduled" };
  }
);

/**
 * Main IP reputation checking function
 * Fetches IPs from Axiom, checks with GreyNoise, updates blocking rules
 */
export const checkIpReputation = inngest.createFunction(
  {
    id: "check-ip-reputation",
    name: "Check IP Reputation",
    retries: 2,
  },
  { event: "security/ip-reputation.check-triggered" },
  async ({ event, step, logger }) => {
    const { trigger_source, ip_list, check_config } = event.data;
    const config = { ...DEFAULT_CONFIG, ...check_config };
    
    logger.info(`IP reputation check triggered by: ${trigger_source}`);

    // Step 1: Get IPs to check
    const ipsToCheck = await step.run("get-ips-to-check", async () => {
      if (ip_list && ip_list.length > 0) {
        logger.info(`Using provided IP list: ${ip_list.length} IPs`);
        return ip_list;
      }

      // Fetch from Axiom
      return await fetchIpsFromAxiom(config);
    });

    if (ipsToCheck.length === 0) {
      logger.info("No IPs to check, exiting");
      return { status: "no-ips-to-check" };
    }

    logger.info(`Checking reputation for ${ipsToCheck.length} IPs`);

    // Step 2: Check IP reputations with GreyNoise
    const reputationResult = await step.run("check-ip-reputations", async () => {
      const service = new IPReputationService();
      await service.initialize();
      return await service.bulkCheckReputation(ipsToCheck);
    });

    // Step 3: Update blocking rules
    const blockingUpdate = await step.run("update-blocking-rules", async () => {
      const maliciousIps = reputationResult.results
        .filter(r => r.is_malicious && config.auto_block_malicious)
        .map(r => r.ip);

      const suspiciousIps = reputationResult.results
        .filter(r => r.is_suspicious && config.auto_rate_limit_suspicious)
        .map(r => r.ip);

      // Update Redis with new blocking/rate limiting rules
      if (maliciousIps.length > 0) {
        await updateBlockedIpsList(maliciousIps, "malicious");
      }

      if (suspiciousIps.length > 0) {
        await updateSuspiciousIpsList(suspiciousIps);
      }

      return {
        blocked_count: maliciousIps.length,
        rate_limited_count: suspiciousIps.length,
        blocked_ips: maliciousIps,
        rate_limited_ips: suspiciousIps,
      };
    });

    // Step 4: Generate alerts for high-risk findings
    const alerts = await step.run("generate-alerts", async () => {
      const alertsGenerated: string[] = [];

      // Alert on new malicious IPs
      if (reputationResult.malicious_count > config.alert_thresholds.new_malicious_ips_per_hour) {
        const alertMessage = `High number of malicious IPs detected: ${reputationResult.malicious_count}`;
        await sendSecurityAlert("high-malicious-ip-count", alertMessage, {
          malicious_count: reputationResult.malicious_count,
          threshold: config.alert_thresholds.new_malicious_ips_per_hour,
        });
        alertsGenerated.push("high-malicious-ip-count");
      }

      // Send individual alerts for each malicious IP
      const maliciousResults = reputationResult.results.filter(r => r.is_malicious);
      for (const maliciousIp of maliciousResults) {
        await step.sendEvent(`malicious-ip-detected-${maliciousIp.ip}`, {
          name: "security/malicious-ip.detected",
          data: {
            ip: maliciousIp.ip,
            reputation: maliciousIp.details!,
            request_count_24h: 0, // Could fetch from Axiom if needed
            detected_at: new Date().toISOString(),
            auto_blocked: config.auto_block_malicious,
          },
        });
      }

      return alertsGenerated;
    });

    // Step 5: Send completion event
    await step.sendEvent("ip-reputation-check-completed", {
      name: "security/ip-reputation.check-completed",
      data: {
        result: reputationResult,
        blocked_ips: blockingUpdate.blocked_ips,
        rate_limited_ips: blockingUpdate.rate_limited_ips,
        alerts_generated: alerts,
        execution_time_ms: Date.now() - (event.ts || Date.now()),
      },
    });

    logger.info(`IP reputation check completed: ${reputationResult.malicious_count} malicious, ${reputationResult.suspicious_count} suspicious`);

    return {
      status: "completed",
      statistics: {
        total_checked: reputationResult.total_checked,
        malicious: reputationResult.malicious_count,
        suspicious: reputationResult.suspicious_count,
        benign: reputationResult.benign_count,
        unknown: reputationResult.unknown_count,
        blocked: blockingUpdate.blocked_count,
        rate_limited: blockingUpdate.rate_limited_count,
      },
      processing_time_ms: reputationResult.processing_time_ms,
    };
  }
);

/**
 * Handle malicious IP detection events
 * Sends notifications and triggers additional security measures
 */
export const handleMaliciousIpDetected = inngest.createFunction(
  {
    id: "handle-malicious-ip-detected",
    name: "Handle Malicious IP Detection",
  },
  { event: "security/malicious-ip.detected" },
  async ({ event, step, logger }) => {
    const { ip, reputation, request_count_24h, auto_blocked } = event.data;
    
    logger.info(`Handling malicious IP detection: ${ip} (${reputation.classification})`);

    // Step 1: Log security event
    await step.run("log-security-event", async () => {
      Sentry.addBreadcrumb({
        category: "security",
        message: `Malicious IP detected: ${ip}`,
        level: "warning",
        data: {
          ip,
          classification: reputation.classification,
          confidence: reputation.confidence_score,
          tags: reputation.tags,
          auto_blocked,
        },
      });

      // Also capture as Sentry event for security monitoring
      Sentry.captureMessage(`Malicious IP detected: ${ip}`, {
        level: "warning",
        tags: {
          component: "ip-reputation",
          ip,
          classification: reputation.classification,
          auto_blocked: auto_blocked.toString(),
        },
        extra: {
          reputation,
          request_count_24h,
        },
      });
    });

    // Step 2: Send notification if high-confidence threat
    if (reputation.confidence_score >= 80) {
      await step.run("send-high-confidence-alert", async () => {
        await sendSecurityAlert("high-confidence-malicious-ip", 
          `High-confidence malicious IP detected: ${ip}`, {
          ip,
          confidence: reputation.confidence_score,
          classification: reputation.classification,
          tags: reputation.tags,
          country: reputation.metadata?.country,
          organization: reputation.metadata?.organization,
          auto_blocked,
        });
      });
    }

    // Step 3: Additional security measures for critical threats
    if (reputation.tags?.some((tag: string) => ["botnet", "malware", "ransomware"].includes(tag.toLowerCase()))) {
      await step.run("escalate-critical-threat", async () => {
        logger.warn(`Critical threat detected: ${ip} - ${reputation.tags?.join(", ")}`);
        
        // Could trigger additional measures like:
        // - Temporary WAF rule escalation
        // - Enhanced monitoring for similar IPs
        // - Notification to security team
        
        await sendSecurityAlert("critical-threat-detected",
          `Critical threat IP detected: ${ip} with tags: ${reputation.tags?.join(", ")}`, {
          ip,
          threat_level: "critical",
          tags: reputation.tags,
          immediate_action_required: true,
        });
      });
    }

    return { 
      status: "handled",
      alert_level: reputation.confidence_score >= 80 ? "high" : "standard"
    };
  }
);

/**
 * Fetch IPs from Axiom logs based on configuration
 */
async function fetchIpsFromAxiom(config: IPReputationConfig): Promise<string[]> {
  // This would integrate with Axiom API to fetch IPs
  // For now, returning empty array as placeholder
  // You would implement this based on your Axiom setup
  
  try {
    // Example implementation would query Axiom here
    // const axiomResult = await axiomClient.query(config.axiom_dataset, config.axiom_query);
    // return axiomResult.results.map(r => r.ip).filter(ip => r.count > config.min_request_threshold);
    
    console.log("Axiom integration not implemented yet - returning empty IP list");
    return [];
  } catch (error) {
    console.error("Failed to fetch IPs from Axiom:", error);
    Sentry.captureException(error, {
      tags: { component: "axiom-integration" },
    });
    return [];
  }
}

/**
 * Update Redis with list of blocked IPs
 */
async function updateBlockedIpsList(ips: string[], reason: string): Promise<void> {
  try {
    // This would update your Redis-based blocking system
    // Implementation depends on your current blocking mechanism
    console.log(`Would block ${ips.length} IPs for reason: ${reason}`);
    console.log("Blocked IPs:", ips);
  } catch (error) {
    console.error("Failed to update blocked IPs list:", error);
    Sentry.captureException(error, {
      tags: { component: "ip-blocking" },
    });
  }
}

/**
 * Update Redis with list of IPs for enhanced rate limiting
 */
async function updateSuspiciousIpsList(ips: string[]): Promise<void> {
  try {
    // This would update your rate limiting configuration
    console.log(`Would apply enhanced rate limiting to ${ips.length} IPs`);
    console.log("Rate limited IPs:", ips);
  } catch (error) {
    console.error("Failed to update suspicious IPs list:", error);
    Sentry.captureException(error, {
      tags: { component: "rate-limiting" },
    });
  }
}

/**
 * Send security alert (could integrate with Slack, email, etc.)
 */
async function sendSecurityAlert(
  alertType: string,
  message: string,
  metadata: Record<string, any>
): Promise<void> {
  try {
    // Log alert to console for now
    console.warn(`SECURITY ALERT [${alertType}]: ${message}`, metadata);
    
    // Could integrate with:
    // - Slack notifications
    // - Email alerts
    // - PagerDuty
    // - Discord webhook
    
    // Capture in Sentry for monitoring
    Sentry.captureMessage(`Security Alert: ${message}`, {
      level: "warning",
      tags: {
        component: "security-alerts",
        alert_type: alertType,
      },
      extra: metadata,
    });
  } catch (error) {
    console.error("Failed to send security alert:", error);
  }
}

// Export individual functions for testing
export {
  fetchIpsFromAxiom,
  updateBlockedIpsList,
  updateSuspiciousIpsList,
  sendSecurityAlert,
};
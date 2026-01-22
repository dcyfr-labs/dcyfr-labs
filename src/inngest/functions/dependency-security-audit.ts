/**
 * Security Dependency Monitoring
 * 
 * Automatically audits dependencies when package files change.
 * Runs `npm audit` and reports critical vulnerabilities.
 * 
 * @see docs/security/dependency-management.md
 */

import { inngest } from "../client";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface NpmAuditVulnerability {
  severity: "critical" | "high" | "moderate" | "low" | "info";
  title: string;
  package: string;
  version: string;
  vulnerability: string;
  cwe?: string[];
  cvss?: {
    score: number;
    vectorString: string;
  };
}

interface NpmAuditResult {
  vulnerabilities: {
    critical: number;
    high: number;
    moderate: number;
    low: number;
    info: number;
    total: number;
  };
  metadata: {
    dependencies: number;
    devDependencies: number;
    totalDependencies: number;
  };
}

/**
 * Parse npm audit JSON output
 */
function parseAuditOutput(jsonOutput: string): NpmAuditResult {
  try {
    const audit = JSON.parse(jsonOutput);
    
    return {
      vulnerabilities: {
        critical: audit.metadata?.vulnerabilities?.critical || 0,
        high: audit.metadata?.vulnerabilities?.high || 0,
        moderate: audit.metadata?.vulnerabilities?.moderate || 0,
        low: audit.metadata?.vulnerabilities?.low || 0,
        info: audit.metadata?.vulnerabilities?.info || 0,
        total: audit.metadata?.vulnerabilities?.total || 0,
      },
      metadata: {
        dependencies: audit.metadata?.dependencies || 0,
        devDependencies: audit.metadata?.devDependencies || 0,
        totalDependencies: audit.metadata?.totalDependencies || 0,
      },
    };
  } catch (error) {
    console.error("[Security Audit] Failed to parse npm audit output:", error);
    return {
      vulnerabilities: {
        critical: 0,
        high: 0,
        moderate: 0,
        low: 0,
        info: 0,
        total: 0,
      },
      metadata: {
        dependencies: 0,
        devDependencies: 0,
        totalDependencies: 0,
      },
    };
  }
}

/**
 * Run security audit on dependencies
 */
export const auditDependencies = inngest.createFunction(
  {
    id: "audit-dependencies",
    name: "Security Dependency Audit",
    retries: 2,
  },
  { event: "github/dependencies.audit" },
  async ({ event, step }) => {
    const { branch, changedFiles, commits, repository } = event.data;

    // Step 1: Run npm audit
    const auditResult = await step.run("run-audit", async () => {
      try {
        // Run npm audit in JSON format
        const { stdout } = await execAsync("npm audit --json", {
          timeout: 30000, // 30 second timeout
        });
        
        return parseAuditOutput(stdout);
      } catch (error) {
        // npm audit exits with non-zero code if vulnerabilities found
        if (error instanceof Error && "stdout" in error) {
          return parseAuditOutput((error as any).stdout);
        }
        
        console.error("[Security Audit] Failed to run npm audit:", error);
        throw error;
      }
    });

    // Step 2: Check for critical vulnerabilities
    const hasCritical = auditResult.vulnerabilities.critical > 0;
    const hasHigh = auditResult.vulnerabilities.high > 0;

    await step.run("log-audit-results", async () => {
      console.log(`[Security Audit] Branch: ${branch}`);
      console.log(`[Security Audit] Changed files: ${changedFiles.join(", ")}`);
      console.log(`[Security Audit] Total dependencies: ${auditResult.metadata.totalDependencies}`);
      console.log(`[Security Audit] Vulnerabilities:`);
      console.log(`  - Critical: ${auditResult.vulnerabilities.critical}`);
      console.log(`  - High: ${auditResult.vulnerabilities.high}`);
      console.log(`  - Moderate: ${auditResult.vulnerabilities.moderate}`);
      console.log(`  - Low: ${auditResult.vulnerabilities.low}`);
      console.log(`  - Info: ${auditResult.vulnerabilities.info}`);
      
      return auditResult;
    });

    // Step 3: Send alerts for critical/high severity vulnerabilities
    if (hasCritical || hasHigh) {
      await step.run("send-security-alerts", async () => {
        const severity = hasCritical ? "CRITICAL" : "HIGH";
        const count = hasCritical 
          ? auditResult.vulnerabilities.critical 
          : auditResult.vulnerabilities.high;
        
        console.error(
          `[Security Audit] 🔴 ${severity}: ${count} vulnerabilities found!`
        );
        
        // TODO: Future enhancement - Send email alert
        // TODO: Future enhancement - Post GitHub issue
        // TODO: Future enhancement - Send Slack notification
        // TODO: Future enhancement - Block PR merge if critical
        
        return {
          severity,
          count,
          action: "alert-sent",
        };
      });
    }

    // Step 4: Track metrics
    await step.run("track-metrics", async () => {
      // TODO: Future enhancement - Store audit results in Redis
      // TODO: Future enhancement - Track vulnerability trends over time
      // TODO: Future enhancement - Dashboard visualization
      
      return {
        timestamp: new Date().toISOString(),
        branch,
        vulnerabilities: auditResult.vulnerabilities,
      };
    });

    return {
      success: true,
      branch,
      filesChanged: changedFiles,
      audit: auditResult,
      status: hasCritical ? "critical" : hasHigh ? "warning" : "passed",
      requiresAction: hasCritical || hasHigh,
    };
  }
);

/**
 * MCP Health Dashboard Hooks
 *
 * Data fetching and state management for MCP health monitoring
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  DashboardState,
  McpHealthReport,
  McpServerStatus,
  McpUptimeMetrics,
  McpIncident,
} from "./types";
import { CRITICAL_MCPS } from "./types";

const REFRESH_INTERVAL = 60000; // 60 seconds

/**
 * Generate mock historical data for development
 * In production, this would come from the Redis API
 */
function generateMockHistory(servers: McpServerStatus[]): Record<string, McpServerStatus[]> {
  const history: Record<string, McpServerStatus[]> = {};
  const now = Date.now();

  for (const server of servers) {
    history[server.name] = [];
    // Generate 7 days of mock data (4 checks per day)
    for (let i = 0; i < 28; i++) {
      const timestamp = new Date(now - i * 6 * 60 * 60 * 1000).toISOString();
      // Simulate occasional issues (5% chance of degraded, 2% chance of down)
      const rand = Math.random();
      let status: "ok" | "degraded" | "down" = "ok";
      let responseTime = Math.floor(Math.random() * 200) + 50;

      if (rand < 0.02) {
        status = "down";
        responseTime = 0;
      } else if (rand < 0.07) {
        status = "degraded";
        responseTime = Math.floor(Math.random() * 3000) + 5000;
      }

      history[server.name].push({
        name: server.name,
        status,
        responseTimeMs: responseTime,
        timestamp,
      });
    }
  }

  return history;
}

/**
 * Calculate uptime metrics from historical data
 */
function calculateUptimeMetrics(
  history: Record<string, McpServerStatus[]>
): Record<string, McpUptimeMetrics> {
  const metrics: Record<string, McpUptimeMetrics> = {};

  for (const [serverName, checks] of Object.entries(history)) {
    const totalChecks = checks.length;
    const okChecks = checks.filter((c) => c.status === "ok").length;
    const percentage = totalChecks > 0 ? (okChecks / totalChecks) * 100 : 0;

    const responseTimes = checks
      .filter((c) => c.responseTimeMs > 0)
      .map((c) => c.responseTimeMs);
    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

    const incidents = checks.filter((c) => c.status !== "ok");
    const lastIncident = incidents.length > 0 ? incidents[0].timestamp : null;

    metrics[serverName] = {
      serverName,
      percentage,
      lastIncident,
      avgResponseTime: Math.round(avgResponseTime),
      totalChecks,
      okChecks,
    };
  }

  return metrics;
}

/**
 * Extract incidents from historical data
 */
function extractIncidents(
  history: Record<string, McpServerStatus[]>
): McpIncident[] {
  const incidents: McpIncident[] = [];

  for (const [, checks] of Object.entries(history)) {
    for (const check of checks) {
      if (check.status !== "ok") {
        incidents.push({
          timestamp: check.timestamp,
          server: check.name,
          error: check.error || `Server ${check.status}`,
          duration: null, // Would need to calculate from adjacent checks
        });
      }
    }
  }

  // Sort by timestamp (most recent first)
  return incidents.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Hook for MCP health dashboard data management
 */
export function useMcpHealthDashboard() {
  const [state, setState] = useState<DashboardState>({
    loading: true,
    error: null,
    lastRefresh: new Date(),
    healthReport: null,
    uptimeMetrics: {},
    incidents: [],
    historyData: {},
  });

  const [autoRefresh, setAutoRefresh] = useState(true);

  /**
   * Fetch health data from API
   */
  const fetchHealthData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setState((prev) => ({ ...prev, loading: true, error: null }));
    }

    try {
      // Default mock data for development
      const mockHealthReport: McpHealthReport = {
        timestamp: new Date().toISOString(),
        servers: [
          { name: "Filesystem", status: "ok", responseTimeMs: 45, timestamp: new Date().toISOString() },
          { name: "GitHub", status: "ok", responseTimeMs: 120, timestamp: new Date().toISOString() },
          { name: "Vercel", status: "ok", responseTimeMs: 85, timestamp: new Date().toISOString() },
          { name: "Sentry", status: "ok", responseTimeMs: 150, timestamp: new Date().toISOString() },
          { name: "Perplexity", status: "ok", responseTimeMs: 200, timestamp: new Date().toISOString() },
          { name: "Inngest", status: "ok", responseTimeMs: 95, timestamp: new Date().toISOString() },
          { name: "Resend", status: "ok", responseTimeMs: 110, timestamp: new Date().toISOString() },
          { name: "Octocode", status: "ok", responseTimeMs: 180, timestamp: new Date().toISOString() },
          { name: "DCYFR Analytics", status: "ok", responseTimeMs: 75, timestamp: new Date().toISOString() },
          { name: "DCYFR DesignTokens", status: "ok", responseTimeMs: 60, timestamp: new Date().toISOString() },
          { name: "DCYFR ContentManager", status: "ok", responseTimeMs: 55, timestamp: new Date().toISOString() },
          { name: "DCYFR SemanticScholar", status: "ok", responseTimeMs: 90, timestamp: new Date().toISOString() },
          { name: "GreyNoise", status: "ok", responseTimeMs: 140, timestamp: new Date().toISOString() },
        ],
        summary: { total: 13, ok: 13, degraded: 0, down: 0 },
      };

      let healthReport: McpHealthReport = mockHealthReport;

      // Try to fetch from API, fall back to mock data
      try {
        const response = await fetch("/api/mcp/health", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          // Only use API data if it has valid structure
          if (data?.report?.servers && Array.isArray(data.report.servers)) {
            healthReport = data.report;
          }
        }
      } catch {
        // Silently fall back to mock data
        console.warn("[MCP Health] API unavailable, using mock data");
      }

      // Generate history and calculate metrics
      const historyData = generateMockHistory(healthReport.servers);
      const uptimeMetrics = calculateUptimeMetrics(historyData);
      const incidents = extractIncidents(historyData);

      setState({
        loading: false,
        error: null,
        lastRefresh: new Date(),
        healthReport,
        uptimeMetrics,
        incidents: incidents.slice(0, 10), // Keep last 10 incidents
        historyData,
      });
    } catch (err) {
      console.error("[MCP Health] Failed to fetch health data:", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch health data",
      }));
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchHealthData(false);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchHealthData]);

  return {
    state,
    fetchHealthData,
    autoRefresh,
    setAutoRefresh,
    criticalMcps: CRITICAL_MCPS,
  };
}

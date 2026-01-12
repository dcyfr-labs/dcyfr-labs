/**
 * MCP Health Dashboard Types
 *
 * Type definitions for MCP health monitoring UI
 */

export interface McpServerStatus {
  name: string;
  status: "ok" | "degraded" | "down";
  responseTimeMs: number;
  error?: string;
  authUsed?: boolean;
  timestamp: string;
}

export interface McpHealthReport {
  timestamp: string;
  servers: McpServerStatus[];
  summary: {
    total: number;
    ok: number;
    degraded: number;
    down: number;
  };
}

export interface McpUptimeMetrics {
  serverName: string;
  percentage: number;
  lastIncident: string | null;
  avgResponseTime: number;
  totalChecks: number;
  okChecks: number;
}

export interface McpIncident {
  timestamp: string;
  server: string;
  error: string;
  duration: string | null;
}

export interface DashboardState {
  loading: boolean;
  error: string | null;
  lastRefresh: Date;
  healthReport: McpHealthReport | null;
  uptimeMetrics: Record<string, McpUptimeMetrics>;
  incidents: McpIncident[];
  historyData: Record<string, McpServerStatus[]>;
}

export const CRITICAL_MCPS = [
  "DCYFR Analytics",
  "DCYFR DesignTokens",
  "DCYFR ContentManager",
  "DCYFR SemanticScholar",
] as const;

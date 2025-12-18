/**
 * Maintenance Dashboard Types
 * 
 * Centralized type definitions for the maintenance dashboard
 */

/**
 * API Health Status
 */
export interface ApiHealth {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  services: {
    edge: boolean;
    vercel: boolean;
  };
  serverInfo: {
    runtime: string;
    region: string;
  };
}

/**
 * Design System Violation
 */
export interface DesignSystemViolation {
  file: string;
  line: number;
  column: number;
  type: string;
  violation: string;
  suggestion: string;
  description: string;
}

/**
 * Design System Report
 */
export interface DesignSystemReport {
  generatedAt: string;
  totalViolations: number;
  filesScanned: number;
  violations: DesignSystemViolation[];
  summary: {
    spacing: number;
    typography: number;
  };
}

/**
 * Redis Test Result
 */
export interface RedisTestResult {
  success: boolean;
  latency: number;
  error?: string;
}

/**
 * Redis Health Status
 */
export interface RedisHealthStatus {
  enabled: boolean;
  configured: boolean;
  connected: boolean;
  message: string;
  error?: string;
  url?: string;
  testResult?: RedisTestResult;
  timestamp?: string;
}

/**
 * Dashboard State
 */
export interface DashboardState {
  workflows: any[];
  apiHealth: ApiHealth | null;
  trends: any[] | null;
  designSystemReport: DesignSystemReport | null;
  redisHealth: RedisHealthStatus | null;
  loading: boolean;
  error: string | null;
  lastRefresh: Date;
  autoRefresh: boolean;
}

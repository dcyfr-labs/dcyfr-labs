/**
 * useMaintenanceDashboard Hook
 * 
 * Handles fetching and managing maintenance dashboard data
 * Includes auto-refresh logic and error handling
 */

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import type { DashboardState, ApiHealth, DesignSystemReport, RedisHealthStatus } from "./types";
import type { WorkflowSummary, WeeklyMetrics } from "@/types/maintenance";

export function useMaintenanceDashboard() {
  const [state, setState] = useState<DashboardState>({
    workflows: [],
    apiHealth: null,
    trends: null,
    designSystemReport: null,
    redisHealth: null,
    loading: true,
    error: null,
    lastRefresh: new Date(),
    autoRefresh: true,
  });

  /**
   * Fetch all dashboard data in parallel
   */
  const fetchDashboardData = useCallback(async (showToast = false) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const [workflowsRes, healthRes, trendsRes, designReportRes, redisHealthRes] =
        await Promise.all([
          fetch("/api/maintenance/workflows"),
          fetch("/api/health"),
          fetch("/api/maintenance/metrics?period=52weeks"),
          fetch("/dev/api/reports/design-system-report.json"),
          fetch("/dev/api/redis-health"),
        ]);

      if (!workflowsRes.ok) {
        throw new Error(`Failed to fetch workflows: ${workflowsRes.statusText}`);
      }

      const workflowsData = await workflowsRes.json();
      let healthData: ApiHealth | null = null;
      let trendsData: WeeklyMetrics[] | null = null;
      let designData: DesignSystemReport | null = null;
      let redisData: RedisHealthStatus | null = null;

      // Optional data sources - don't fail if unavailable
      if (healthRes.ok) {
        healthData = await healthRes.json();
      }

      if (trendsRes.ok) {
        const trendsResponse = await trendsRes.json();
        trendsData = trendsResponse.trends;
      }

      if (designReportRes.ok) {
        designData = await designReportRes.json();
      }

      if (redisHealthRes.ok) {
        redisData = await redisHealthRes.json();
      }

      setState((prev) => ({
        ...prev,
        workflows: workflowsData.workflows,
        apiHealth: healthData,
        trends: trendsData,
        designSystemReport: designData,
        redisHealth: redisData,
        lastRefresh: new Date(),
        loading: false,
      }));

      if (showToast) {
        toast.success("Dashboard refreshed successfully");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      toast.error(`Failed to fetch dashboard data: ${errorMessage}`);
    }
  }, []);


  /**
   * Initial data fetch
   */
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /**
   * Auto-refresh every 60 seconds
   */
  useEffect(() => {
    if (!state.autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [state.autoRefresh, fetchDashboardData]);

  return {
    state,
    fetchDashboardData,
    setAutoRefresh: (enabled: boolean) => {
      setState((prev) => ({ ...prev, autoRefresh: enabled }));
    },
  };
}

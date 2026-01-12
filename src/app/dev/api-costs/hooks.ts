/**
 * API Cost Dashboard Hooks
 *
 * Data fetching and state management for API cost monitoring
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  DashboardState,
  ServiceUsage,
  DailyUsagePoint,
  TopEndpoint,
  BudgetStatus,
} from "./types";
import { SERVICE_CONFIG, BUDGET } from "./types";

const REFRESH_INTERVAL = 60000; // 60 seconds

/**
 * Generate mock daily trend data
 */
function generateMockDailyTrend(): DailyUsagePoint[] {
  const data: DailyUsagePoint[] = [];
  const now = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Generate realistic usage patterns
    const baseRequests = Math.floor(Math.random() * 50) + 20;
    const perplexityRequests = Math.floor(Math.random() * 10) + 5;
    const perplexityCost = perplexityRequests * 0.005;

    data.push({
      date: dateStr,
      displayDate: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      totalCost: perplexityCost,
      totalRequests: baseRequests + perplexityRequests,
      byService: {
        perplexity: { requests: perplexityRequests, cost: perplexityCost },
        resend: { requests: Math.floor(Math.random() * 5), cost: 0 },
        greynoise: { requests: Math.floor(Math.random() * 20) + 10, cost: 0 },
        github: { requests: Math.floor(Math.random() * 100) + 50, cost: 0 },
        redis: { requests: Math.floor(Math.random() * 500) + 200, cost: 0 },
      },
    });
  }

  return data;
}

/**
 * Generate mock service usage data
 */
function generateMockServiceUsage(): ServiceUsage[] {
  const services = Object.entries(SERVICE_CONFIG);

  return services.map(([key, config]) => {
    // Generate realistic usage
    let requests: number;
    let cost: number;
    let limit: number;

    switch (key) {
      case "perplexity":
        requests = Math.floor(Math.random() * 200) + 100;
        cost = requests * 0.005;
        limit = 10000; // Cost-based limit
        break;
      case "resend":
        requests = Math.floor(Math.random() * 100) + 50;
        cost = 0;
        limit = 3000;
        break;
      case "greynoise":
        requests = Math.floor(Math.random() * 1000) + 500;
        cost = 0;
        limit = 50000;
        break;
      case "github":
        requests = Math.floor(Math.random() * 2000) + 1000;
        cost = 0;
        limit = 5000 * 24 * 30; // Per hour × 24 × 30
        break;
      case "redis":
        requests = Math.floor(Math.random() * 10000) + 5000;
        cost = 0;
        limit = 10000 * 30; // Per day × 30
        break;
      case "sentry":
        requests = Math.floor(Math.random() * 500) + 100;
        cost = 0;
        limit = 5000;
        break;
      case "inngest":
        requests = Math.floor(Math.random() * 100) + 50;
        cost = 0;
        limit = 25000;
        break;
      default:
        requests = Math.floor(Math.random() * 100) + 10;
        cost = 0;
        limit = 10000;
    }

    const percentUsed = (requests / limit) * 100;
    const trendPercent = Math.random() * 20 - 10; // -10% to +10%
    const trend = trendPercent > 2 ? "up" : trendPercent < -2 ? "down" : "stable";

    return {
      service: key,
      displayName: config.displayName,
      requests,
      cost,
      limit,
      percentUsed,
      trend,
      trendPercent: Math.abs(trendPercent),
    };
  });
}

/**
 * Generate mock top endpoints
 */
function generateMockTopEndpoints(): TopEndpoint[] {
  const endpoints: TopEndpoint[] = [
    {
      service: "perplexity",
      endpoint: "/search",
      requests: Math.floor(Math.random() * 100) + 50,
      cost: 0,
      avgDuration: Math.floor(Math.random() * 500) + 200,
    },
    {
      service: "greynoise",
      endpoint: "/v3/community/{ip}",
      requests: Math.floor(Math.random() * 500) + 200,
      cost: 0,
      avgDuration: Math.floor(Math.random() * 100) + 50,
    },
    {
      service: "github",
      endpoint: "/repos/dcyfr/dcyfr-labs",
      requests: Math.floor(Math.random() * 1000) + 500,
      cost: 0,
      avgDuration: Math.floor(Math.random() * 200) + 100,
    },
    {
      service: "resend",
      endpoint: "/emails",
      requests: Math.floor(Math.random() * 50) + 10,
      cost: 0,
      avgDuration: Math.floor(Math.random() * 300) + 100,
    },
    {
      service: "redis",
      endpoint: "GET/SET",
      requests: Math.floor(Math.random() * 5000) + 2000,
      cost: 0,
      avgDuration: Math.floor(Math.random() * 10) + 2,
    },
  ];

  // Calculate costs for Perplexity
  endpoints[0].cost = endpoints[0].requests * 0.005;

  return endpoints.sort((a, b) => b.requests - a.requests);
}

/**
 * Calculate budget status
 */
function calculateBudgetStatus(serviceUsage: ServiceUsage[]): BudgetStatus {
  const totalUsed = serviceUsage.reduce((sum, s) => sum + s.cost, 0);
  const percentUsed = (totalUsed / BUDGET.total) * 100;

  // Project based on days elapsed
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysRemaining = daysInMonth - dayOfMonth;

  const dailyAverage = totalUsed / dayOfMonth;
  const projected = dailyAverage * daysInMonth;
  const projectedPercent = (projected / BUDGET.total) * 100;

  let status: "ok" | "warning" | "critical" = "ok";
  if (percentUsed >= 90 || projectedPercent >= 100) {
    status = "critical";
  } else if (percentUsed >= 70 || projectedPercent >= 90) {
    status = "warning";
  }

  return {
    total: BUDGET.total,
    used: totalUsed,
    percentUsed,
    projected,
    projectedPercent,
    daysRemaining,
    status,
  };
}

/**
 * Hook for API cost dashboard data management
 */
export function useApiCostsDashboard() {
  const [state, setState] = useState<DashboardState>({
    loading: true,
    error: null,
    lastRefresh: new Date(),
    serviceUsage: [],
    dailyTrend: [],
    topEndpoints: [],
    budgetStatus: {
      total: BUDGET.total,
      used: 0,
      percentUsed: 0,
      projected: 0,
      projectedPercent: 0,
      daysRemaining: 0,
      status: "ok",
    },
  });

  const [autoRefresh, setAutoRefresh] = useState(true);

  /**
   * Fetch cost data
   */
  const fetchCostData = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setState((prev) => ({ ...prev, loading: true, error: null }));
    }

    try {
      // In development, generate mock data
      // In production, this would fetch from the API
      const serviceUsage = generateMockServiceUsage();
      const dailyTrend = generateMockDailyTrend();
      const topEndpoints = generateMockTopEndpoints();
      const budgetStatus = calculateBudgetStatus(serviceUsage);

      setState({
        loading: false,
        error: null,
        lastRefresh: new Date(),
        serviceUsage,
        dailyTrend,
        topEndpoints,
        budgetStatus,
      });
    } catch (err) {
      console.error("[API Costs] Failed to fetch cost data:", err);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to fetch cost data",
      }));
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCostData();
  }, [fetchCostData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchCostData(false);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchCostData]);

  return {
    state,
    fetchCostData,
    autoRefresh,
    setAutoRefresh,
  };
}

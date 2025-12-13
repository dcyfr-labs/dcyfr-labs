/**
 * Analytics Data Hook
 * 
 * Custom hook for fetching and managing analytics data with:
 * - Date range filtering
 * - Auto-refresh capability
 * - Loading and error states
 * - Manual refresh support
 * @module hooks/use-analytics-data
 */

import { useEffect, useState, useCallback } from "react";
import { AnalyticsData, DateRange, DailyData } from "@/types/analytics";

interface UseAnalyticsDataOptions {
  /** Date range for analytics data */
  dateRange: DateRange;
  /** Enable auto-refresh every 30 seconds */
  autoRefresh?: boolean;
  /** Type of analytics data to fetch (summary data or daily time-series) */
  dataType?: 'summary' | 'daily';
}

interface UseAnalyticsDataReturn {
  /** Analytics data */
  data: AnalyticsData | null;
  /** Daily analytics time series */
  daily: DailyData[];
  /** Loading state */
  loading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Whether a manual refresh is in progress */
  isRefreshing: boolean;
  /** Timestamp of last successful update */
  lastUpdated: Date | null;
  /** Manually trigger a data refresh */
  refresh: () => Promise<void>;
}

/**
 * Fetch and manage analytics data
 * 
 * @example
 * ```tsx
 * const { data, loading, error, refresh } = useAnalyticsData({
 *   dateRange: '7',
 *   autoRefresh: true
 * });
 * ```
 */
export function useAnalyticsData({
  dateRange,
  autoRefresh = false,
  dataType = 'summary',
}: UseAnalyticsDataOptions): UseAnalyticsDataReturn {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [daily, setDaily] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailyError, setDailyError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch analytics data
  const fetchAnalytics = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      }

      try {
        const apiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY;
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

        const daysParam = dateRange === "all" ? "all" : dateRange;
        const url = `/api/analytics?days=${daysParam}`;
        const response = await fetch(url, { headers });

        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const analyticsData: AnalyticsData = await response.json();
        setData(analyticsData);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (isManualRefresh) {
          setIsRefreshing(false);
        }
        setLoading(false);
      }
    },
    [dateRange]
  );

  const fetchDailyData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      }

      setDailyLoading(true);

      try {
        const apiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY;
        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

        const daysParam = dateRange === "all" ? "all" : dateRange;
        const url = `/api/analytics/daily?days=${daysParam}`;
        const response = await fetch(url, { headers });

        if (!response.ok) {
          // Try to parse server error
          let errorMessage = `HTTP ${response.status}`;
          try {
            const errJson = await response.json();
            errorMessage = errJson.message || errJson.error || errorMessage;
          } catch {
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || "Failed to load data");
        }

        if (!Array.isArray(result.data)) {
          throw new Error("Invalid response format: expected data array");
        }

        const transformed: DailyData[] = result.data.map((item: { date: string; views: number; shares?: number; comments?: number; engagement?: number }) => {
          const dateObj = new Date(item.date);
          return {
            date: dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            views: item.views || 0,
            shares: item.shares || 0,
            comments: item.comments || 0,
            engagement: item.engagement || 0,
          };
        });

        setDaily(transformed);
        setDailyError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        // Log with a stable, developer-friendly prefix and detailed info
        const details = err instanceof Error ? (err.stack || err.message) : (typeof err === 'object' ? JSON.stringify(err) : String(err));
        console.error("Failed to fetch daily analytics:", errorMessage, details);
        setDailyError(errorMessage);
      } finally {
        setDailyLoading(false);
        if (isManualRefresh) setIsRefreshing(false);
      }
    },
    [dateRange]
  );

  // Manual refresh function
  const refresh = useCallback(async () => {
    await fetchAnalytics(true);
    await fetchDailyData(true);
  }, [fetchAnalytics, fetchDailyData]);

  // Initial fetch and dateRange changes
  useEffect(() => {
    setLoading(true);
    if (dataType === "summary") {
      fetchAnalytics();
    } else {
      fetchDailyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, dataType]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (dataType === "summary") {
        fetchAnalytics();
      } else {
        fetchDailyData();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchAnalytics, fetchDailyData, dataType]);

  return {
    data,
    daily,
    loading: dataType === 'daily' ? dailyLoading : loading,
    error: dataType === 'daily' ? dailyError : error,
    isRefreshing,
    lastUpdated,
    refresh,
  };
}


/**
 * Analytics Charts Component
 * 
 * Time-series visualizations for views, shares, and comments over time.
 * Uses Recharts for responsive, interactive charts with real daily data.
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PostAnalytics, DateRange } from "@/types/analytics";

interface AnalyticsChartsProps {
  /** All posts with analytics data */
  posts: PostAnalytics[];
  /** Current date range */
  dateRange: DateRange;
}

interface DailyData {
  date: string;
  views: number;
  shares: number;
  comments: number;
  engagement: number;
}

/**
 * Time-series charts for analytics dashboard
 * 
 * Shows trends over time with multiple views:
 * - Views trend
 * - Engagement trend (shares + comments)
 * - Combined metrics
 */
export function AnalyticsCharts({ posts, dateRange }: AnalyticsChartsProps) {
  const [chartData, setChartData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDailyData() {
      setLoading(true);
      setError(null);

      try {
        const days = dateRange === "all" ? 30 : parseInt(dateRange);
        const response = await fetch(`/api/analytics/daily?days=${days}`);
        
        if (!response.ok) {
          // Try to get error details from response
          let errorMessage = `HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            // If response isn't JSON, use status text
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(`Failed to fetch daily analytics: ${errorMessage}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || "Failed to load data");
        }

        if (!Array.isArray(result.data)) {
          throw new Error("Invalid response format: expected data array");
        }

        // Transform API data to chart format
        const transformedData: DailyData[] = result.data.map((item: { date: string; views: number; shares?: number; comments?: number; engagement?: number }) => {
          const dateObj = new Date(item.date);
          return {
            date: dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            views: item.views || 0,
            shares: item.shares || 0,
            comments: item.comments || 0,
            engagement: item.engagement || 0,
          };
        });

        setChartData(transformedData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error";
        console.error("Failed to fetch daily analytics:", {
          error: errorMessage,
          details: err,
        });
        setError(errorMessage);
        // Set empty data on error
        setChartData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchDailyData();
  }, [dateRange]);

  if (posts.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader className="p-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-64 mt-2" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6">
        <CardHeader className="p-4">
          <CardTitle className="text-base">Performance Trends</CardTitle>
          <CardDescription className="text-xs text-destructive">
            {error}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Check if we have any actual data (non-zero views)
  const hasData = chartData.some(d => d.views > 0);

  if (!hasData) {
    return (
      <Card className="mb-6">
        <CardHeader className="p-4">
          <CardTitle className="text-base">Performance Trends</CardTitle>
          <CardDescription className="text-xs">
            Daily analytics over the selected time period
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center justify-center h-[300px] text-center">
            <div className="space-y-2">
              {/* eslint-disable-next-line no-restricted-syntax */}
              <p className="text-sm font-medium text-muted-foreground">
                No daily tracking data available yet
              </p>
              <p className="text-xs text-muted-foreground">
                Daily metrics will appear here as users view your posts. Visit a blog post to generate your first data point.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="p-4">
        <CardTitle className="text-base">Performance Trends</CardTitle>
        <CardDescription className="text-xs">
          Daily analytics over the selected time period
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Tabs defaultValue="views" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="views" className="text-xs">Views</TabsTrigger>
            <TabsTrigger value="engagement" className="text-xs">Engagement</TabsTrigger>
            <TabsTrigger value="combined" className="text-xs">Combined</TabsTrigger>
          </TabsList>

          {/* Views Chart */}
          <TabsContent value="views" className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#colorViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* Engagement Chart */}
          <TabsContent value="engagement" className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: "12px" }}
                />
                <Line
                  type="monotone"
                  dataKey="shares"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="comments"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          {/* Combined Chart */}
          <TabsContent value="combined" className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: "12px" }}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="engagement"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

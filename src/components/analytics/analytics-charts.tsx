/**
 * Analytics Charts Component
 *
 * Time-series visualizations for views, shares, and comments over time.
 * Uses Recharts for responsive, interactive charts with real daily data.
 */

"use client";

import { useAnalyticsData } from "@/hooks/use-analytics-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

import type { DailyData } from "@/types/analytics";

/**
 * Time-series charts for analytics dashboard
 *
 * Shows trends over time with multiple views:
 * - Views trend
 * - Engagement trend (shares + comments)
 * - Combined metrics
 */
export function AnalyticsCharts({ posts, dateRange }: AnalyticsChartsProps) {
  const {
    daily: dailyData,
    loading,
    error,
    refresh,
  } = useAnalyticsData({ dateRange, autoRefresh: false, dataType: "daily" });
  const chartData: DailyData[] = Array.isArray(dailyData) ? dailyData : [];

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
  const hasData = chartData.some((d) => d.views > 0);

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
              {}
              <p className="text-sm font-medium text-muted-foreground">
                No daily tracking data available yet
              </p>
              <p className="text-xs text-muted-foreground">
                Daily metrics will appear here as users view your posts. Visit a
                blog post to generate your first data point.
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
            <TabsTrigger value="views" className="text-xs">
              Views
            </TabsTrigger>
            <TabsTrigger value="engagement" className="text-xs">
              Engagement
            </TabsTrigger>
            <TabsTrigger value="combined" className="text-xs">
              Combined
            </TabsTrigger>
          </TabsList>

          {/* Views Chart */}
          <TabsContent value="views" className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.9)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#3b82f6"
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
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.9)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.7)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="shares"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="comments"
                  stroke="#8b5cf6"
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
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.5)"
                  tick={{ fontSize: 12, fill: "rgba(255,255,255,0.7)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.9)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.7)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="engagement"
                  stroke="#10b981"
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

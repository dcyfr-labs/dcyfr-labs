/**
 * Trend Chart Component
 * 
 * Displays 52-week trend data visualization
 */

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { WeeklyMetrics } from "@/types/maintenance";

// Dynamically import Recharts to avoid SSR issues
const LineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import("recharts").then((mod) => mod.Line),
  { ssr: false }
);
const XAxis = dynamic(
  () => import("recharts").then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import("recharts").then((mod) => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("recharts").then((mod) => mod.Tooltip),
  { ssr: false }
);
const Legend = dynamic(
  () => import("recharts").then((mod) => mod.Legend),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

interface TrendChartProps {
  trends: WeeklyMetrics[] | null;
}

/**
 * 52-Week trend visualization
 */
export function TrendChart({ trends }: TrendChartProps) {
  if (!trends || trends.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Show only every 4th week label to avoid crowding
  const chartData = trends.map((t, i) => ({
    ...t,
    weekLabel: i % 4 === 0 ? t.week.split("-W")[1] : "",
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="weekLabel"
          label={{ value: "Week", position: "insideBottom", offset: -5 }}
        />
        <YAxis label={{ value: "Percentage / Score", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="testPassRate"
          stroke="#10b981"
          name="Test Pass Rate %"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="coverage"
          stroke="#3b82f6"
          name="Coverage %"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="securityScore"
          stroke="#8b5cf6"
          name="Security Score"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/**
 * MCP Health Chart Component
 *
 * Response time trend visualization using Recharts
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from '@/components/charts';
import type { McpServerStatus } from '../types';
import { CRITICAL_MCPS } from '../types';

interface McpHealthChartProps {
  historyData: Record<string, McpServerStatus[]>;
  loading: boolean;
}

// Color palette for chart lines
const CHART_COLORS = [
  '#2563eb', // blue-600
  '#16a34a', // green-600
  '#dc2626', // red-600
  '#ca8a04', // yellow-600
  '#9333ea', // purple-600
  '#0891b2', // cyan-600
  '#ea580c', // orange-600
  '#4f46e5', // indigo-600
];

/**
 * Transform historical data into chart format
 */
function transformDataForChart(historyData: Record<string, McpServerStatus[]>) {
  const serverNames = Object.keys(historyData);
  if (serverNames.length === 0) return [];

  // Get all unique timestamps and sort them
  const allTimestamps = new Set<string>();
  for (const history of Object.values(historyData)) {
    for (const check of history) {
      allTimestamps.add(check.timestamp);
    }
  }

  const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a.localeCompare(b));

  // Create data points for each timestamp
  return sortedTimestamps.map((timestamp) => {
    const point: Record<string, number | string> = {
      timestamp,
      time: new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    for (const [serverName, history] of Object.entries(historyData)) {
      const check = history.find((h) => h.timestamp === timestamp);
      // Use shortName for chart display
      const shortName = serverName.replace('DCYFR ', '');
      point[shortName] = check?.responseTimeMs ?? 0;
    }

    return point;
  });
}

/**
 * Response time trend chart
 */
export function McpHealthChart({ historyData, loading }: McpHealthChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-75 w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = transformDataForChart(historyData);
  const serverNames = Object.keys(historyData).map((name) => name.replace('DCYFR ', ''));

  // Filter to show only critical MCPs and a few others for readability
  const criticalShortNames = CRITICAL_MCPS.map((name) => name.replace('DCYFR ', ''));
  const displayNames = serverNames.filter(
    (name) => criticalShortNames.includes(name) || ['GitHub', 'Vercel', 'Sentry'].includes(name)
  );

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Response Time Trends</CardTitle>
          <CardDescription className="text-xs">No historical data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-75 items-center justify-center text-muted-foreground">
            Health check data will appear after the first CI run
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Response Time Trends</CardTitle>
        <CardDescription className="text-xs">
          7-day response time history for key MCP servers (ms)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              domain={[0, 'auto']}
              label={{
                value: 'ms',
                angle: -90,
                position: 'insideLeft',
                fontSize: 10,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                fontSize: '12px',
              }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconSize={8} />
            {displayNames.map((name, index) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                strokeWidth={criticalShortNames.includes(name) ? 2 : 1}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Uptime percentage chart (bar format)
 */
export function McpUptimeChart({
  metrics,
  loading,
}: {
  metrics: Record<string, { percentage: number; serverName: string }>;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedMetrics = Object.values(metrics).sort((a, b) => b.percentage - a.percentage);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">7-Day Uptime</CardTitle>
        <CardDescription className="text-xs">
          Server availability over the past week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedMetrics.map((metric) => {
            const isCritical = CRITICAL_MCPS.includes(
              metric.serverName as (typeof CRITICAL_MCPS)[number]
            );
            const percentage = metric.percentage;
            const barColor =
              percentage >= 99.5
                ? 'bg-green-500'
                : percentage >= 95
                  ? 'bg-yellow-500'
                  : 'bg-red-500';

            return (
              <div key={metric.serverName} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={isCritical ? 'font-medium text-primary' : 'text-foreground'}>
                    {metric.serverName}
                  </span>
                  <span className="text-muted-foreground">{percentage.toFixed(2)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

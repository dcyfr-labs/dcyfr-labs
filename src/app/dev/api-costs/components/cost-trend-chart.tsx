/**
 * Cost Trend Chart Component
 *
 * 30-day cost trend visualization using Recharts
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from '@/components/charts';
import type { DailyUsagePoint } from '../types';
import { SERVICE_CONFIG } from '../types';

interface CostTrendChartProps {
  data: DailyUsagePoint[];
  loading: boolean;
}

/**
 * Daily cost trend area chart
 */
export function CostTrendChart({ data, loading }: CostTrendChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cost Trends</CardTitle>
          <CardDescription className="text-xs">No cost data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            Cost data will appear after API usage is recorded
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">30-Day Cost Trend</CardTitle>
        <CardDescription className="text-xs">Daily API costs over the past month</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                fontSize: '12px',
              }}
              labelStyle={{ fontWeight: 600 }}
              formatter={(value) =>
                value !== undefined ? [`$${Number(value).toFixed(3)}`, 'Cost'] : ['', '']
              }
            />
            <Area
              type="monotone"
              dataKey="totalCost"
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#costGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Daily requests bar chart by service
 */
export function RequestsTrendChart({ data, loading }: CostTrendChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return null;
  }

  // Transform data for stacked bar chart
  const chartData = data.map((point) => ({
    date: point.displayDate,
    ...Object.fromEntries(
      Object.entries(point.byService).map(([service, { requests }]) => [service, requests])
    ),
  }));

  // Get services with data
  const servicesWithData = Object.keys(data[0]?.byService ?? {});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Request Volume</CardTitle>
        <CardDescription className="text-xs">Daily API requests by service</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
                fontSize: '12px',
              }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} iconSize={8} />
            {servicesWithData.map((service) => {
              const config = SERVICE_CONFIG[service];
              return (
                <Bar
                  key={service}
                  dataKey={service}
                  name={config?.displayName ?? service}
                  fill={config?.color ?? '#666'}
                  stackId="requests"
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

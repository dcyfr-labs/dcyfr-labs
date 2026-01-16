'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from '@/components/charts';
import type { ComparisonStats } from '@/lib/agents';

interface CostTrackingChartProps {
  comparison: ComparisonStats;
}

export function CostTrackingChart({ comparison }: CostTrackingChartProps) {
  const data = Object.entries(comparison.agents)
    .map(([agent, stats]) => ({
      agent: agent.charAt(0).toUpperCase() + agent.slice(1),
      'Total Cost': stats.cost.totalCost,
      'Avg Cost/Session': stats.cost.averageCostPerSession,
    }))
    .filter((item) => item['Total Cost'] > 0 || item['Avg Cost/Session'] > 0);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No cost data available - all providers using free tier
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="agent" />
        <YAxis />
        <Tooltip
          formatter={(value) => (typeof value === 'number' ? `$${value.toFixed(2)}` : '$0.00')}
        />
        <Legend />
        <Bar dataKey="Total Cost" fill="hsl(var(--chart-3))" />
        <Bar dataKey="Avg Cost/Session" fill="hsl(var(--chart-4))" />
      </BarChart>
    </ResponsiveContainer>
  );
}

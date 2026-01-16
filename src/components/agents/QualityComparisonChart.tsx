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

interface QualityComparisonChartProps {
  comparison: ComparisonStats;
}

export function QualityComparisonChart({ comparison }: QualityComparisonChartProps) {
  const data = Object.entries(comparison.agents)
    .filter(([, stats]) => stats.totalSessions > 0)
    .map(([agent, stats]) => ({
      agent: agent.charAt(0).toUpperCase() + agent.slice(1),
      'Token Compliance': (stats.quality.averageTokenCompliance * 100).toFixed(1),
      'Test Pass Rate': (stats.quality.averageTestPassRate * 100).toFixed(1),
    }));

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No quality data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="agent" />
        <YAxis domain={[0, 100]} />
        <Tooltip
          formatter={(value) =>
            typeof value === 'number' || typeof value === 'string' ? `${value}%` : '0%'
          }
        />
        <Legend />
        <Bar dataKey="Token Compliance" fill="hsl(var(--chart-1))" />
        <Bar dataKey="Test Pass Rate" fill="hsl(var(--chart-2))" />
      </BarChart>
    </ResponsiveContainer>
  );
}

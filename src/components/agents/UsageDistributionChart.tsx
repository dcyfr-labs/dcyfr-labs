'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from '@/components/charts';
import type { ComparisonStats } from '@/lib/agents';

interface UsageDistributionChartProps {
  comparison: ComparisonStats;
}

const COLORS = {
  claude: 'hsl(var(--chart-1))',
  copilot: 'hsl(var(--chart-2))',
  groq: 'hsl(var(--chart-3))',
  ollama: 'hsl(var(--chart-4))',
};

export function UsageDistributionChart({ comparison }: UsageDistributionChartProps) {
  const data = Object.entries(comparison.agents)
    .map(([agent, stats]) => ({
      name: agent.charAt(0).toUpperCase() + agent.slice(1),
      value: stats.totalSessions,
      agent,
    }))
    .filter((item) => item.value > 0);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No usage data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name} (${percent !== undefined ? (percent * 100).toFixed(0) : 0}%)`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.agent as keyof typeof COLORS]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${typeof value === 'number' ? value : 0} sessions`, 'Sessions']}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

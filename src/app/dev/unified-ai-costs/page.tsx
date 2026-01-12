'use client';

import { useEffect, useState } from 'react';
import { UnifiedCostData, TimeRange } from '@/lib/unified-cost-aggregator';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardState {
  data: UnifiedCostData | null;
  loading: boolean;
  error: string | null;
  period: TimeRange;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

export function UnifiedCostDashboard() {
  const [state, setState] = useState<DashboardState>({
    data: null,
    loading: true,
    error: null,
    period: '30d',
  });

  // Fetch cost data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const response = await fetch(`/api/dev/ai-costs/unified?period=${state.period}`);

        if (!response.ok) throw new Error('Failed to fetch cost data');

        const data: UnifiedCostData = await response.json();
        setState((prev) => ({ ...prev, data, loading: false }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error',
          loading: false,
        }));
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [state.period]);

  if (state.loading) {
    return <div className="p-6">Loading cost dashboard...</div>;
  }

  if (state.error || !state.data) {
    return (
      <div className="p-6 text-red-600">
        Error: {state.error || 'No data available'}
      </div>
    );
  }

  const { sources, summary, recommendations } = state.data;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Unified AI Cost Dashboard</h1>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((period) => (
            <button
              key={period}
              onClick={() => setState((prev) => ({ ...prev, period }))}
              className={`px-4 py-2 rounded ${
                state.period === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard
          title="Total Cost"
          value={`$${summary.totalCost.toFixed(2)}`}
          subtitle={`${summary.monthlyBudgetUsed.toFixed(1)}% of budget`}
          color="blue"
        />
        <SummaryCard
          title="Total Sessions"
          value={summary.totalSessions.toString()}
          subtitle={`${summary.averageCostPerSession.toFixed(2)}/session`}
          color="green"
        />
        <SummaryCard
          title="Total Tokens"
          value={`${(summary.totalTokens / 1000).toFixed(0)}K`}
          subtitle={`${(summary.averageTokensPerSession / 1000).toFixed(1)}K/session`}
          color="amber"
        />
        <SummaryCard
          title="Most Used"
          value={summary.mostUsedTool}
          subtitle="Primary tool"
          color="purple"
        />
      </div>

      {/* Cost Breakdown */}
      <div className="grid grid-cols-2 gap-6">
        {/* Source Distribution Pie Chart */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Cost by Source</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Claude Code', value: sources.claudeCode.estimatedCost },
                  { name: 'GitHub Copilot', value: sources.copilotVSCode.costPerMonth },
                  { name: 'OpenCode', value: sources.opencode.estimatedCost },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) =>
                  value > 0 ? `${name}: $${value.toFixed(2)}` : ''
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number | undefined) => value ? `$${value.toFixed(2)}` : '$0.00'} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Session Distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Sessions by Source</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { name: 'Claude Code', sessions: sources.claudeCode.sessions },
                { name: 'GitHub Copilot', sessions: sources.copilotVSCode.sessions },
                { name: 'OpenCode', sessions: sources.opencode.sessions },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sessions" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-3 gap-6">
        {/* Claude Code */}
        <DetailCard
          title="Claude Code"
          metrics={[
            { label: 'Sessions', value: sources.claudeCode.sessions },
            { label: 'Success Rate', value: `${(sources.claudeCode.successRate * 100).toFixed(1)}%` },
            { label: 'Total Tokens', value: `${sources.claudeCode.totalTokens.toLocaleString()}` },
            { label: 'Est. Cost', value: `$${sources.claudeCode.estimatedCost.toFixed(2)}` },
            { label: 'Token Compliance', value: `${(sources.claudeCode.qualityMetrics.tokenCompliance * 100).toFixed(1)}%` },
            { label: 'Test Pass Rate', value: `${(sources.claudeCode.qualityMetrics.testPassRate * 100).toFixed(1)}%` },
          ]}
        />

        {/* GitHub Copilot */}
        <DetailCard
          title="GitHub Copilot"
          metrics={[
            { label: 'Sessions', value: sources.copilotVSCode.sessions },
            { label: 'Total Tokens', value: `${sources.copilotVSCode.totalTokens.toLocaleString()}` },
            { label: 'Monthly Cost', value: `$${sources.copilotVSCode.costPerMonth.toFixed(2)}` },
            { label: 'Cost/Session', value: `$${sources.copilotVSCode.costPerSession.toFixed(2)}` },
            { label: 'Avg Quality', value: `${sources.copilotVSCode.qualityRating.toFixed(1)}/5` },
            { label: 'Violation Rate', value: `${(sources.copilotVSCode.violationRate * 100).toFixed(1)}%` },
          ]}
        />

        {/* OpenCode */}
        <DetailCard
          title="OpenCode.ai"
          metrics={[
            { label: 'Sessions', value: sources.opencode.sessions },
            { label: 'Total Tokens', value: `${sources.opencode.totalTokens.toLocaleString()}` },
            { label: 'Est. Cost', value: `$${sources.opencode.estimatedCost.toFixed(2)}` },
            { label: 'Free Models', value: `$${(sources.opencode.costByModel['gpt-5-mini'] + sources.opencode.costByModel['raptor-mini']).toFixed(2)}` },
            { label: 'Premium Models', value: `$${sources.opencode.costByModel['claude-sonnet'].toFixed(2)}` },
            { label: 'Avg Quality', value: `${sources.opencode.qualityMetrics.averageQuality.toFixed(1)}/5` },
          ]}
        />
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Recommendations</h2>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENT HELPERS
// ============================================================================

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
  color: 'blue' | 'green' | 'amber' | 'purple';
}

function SummaryCard({ title, value, subtitle, color }: SummaryCardProps) {
  const colorMap = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    amber: 'bg-amber-50 border-amber-200',
    purple: 'bg-purple-50 border-purple-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorMap[color]}`}>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
}

interface DetailCardProps {
  title: string;
  metrics: Array<{ label: string; value: string | number }>;
}

function DetailCard({ title, metrics }: DetailCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-bold mb-3">{title}</h3>
      <dl className="space-y-2">
        {metrics.map((metric) => (
          <div key={metric.label} className="flex justify-between text-sm">
            <dt className="text-gray-600">{metric.label}</dt>
            <dd className="font-semibold">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

interface RecommendationCardProps {
  recommendation: {
    id: string;
    category: string;
    severity: 'info' | 'warning' | 'critical';
    title: string;
    description: string;
    estimatedSavings?: number;
    action: string;
  };
}

function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const severityColor = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    critical: 'bg-red-50 border-red-200 text-red-900',
  };

  return (
    <div className={`p-3 rounded-lg border ${severityColor[recommendation.severity]}`}>
      <p className="font-semibold">{recommendation.title}</p>
      <p className="text-sm mt-1">{recommendation.description}</p>
      {recommendation.estimatedSavings && (
        <p className="text-sm font-semibold mt-1">
          Potential savings: ${recommendation.estimatedSavings}
        </p>
      )}
      <p className="text-sm mt-2">→ {recommendation.action}</p>
    </div>
  );
}

export default function Page() {
  return <UnifiedCostDashboard />;
}

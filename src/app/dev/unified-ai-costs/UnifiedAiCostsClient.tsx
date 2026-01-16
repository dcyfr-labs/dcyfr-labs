'use client';

/**
 * Unified AI Cost Dashboard - Client Component
 *
 * Displays comprehensive cost and usage metrics from all AI sources:
 * - Claude Code (via telemetry)
 * - GitHub Copilot (flat $20/month)
 * - OpenCode.ai (free GitHub models)
 *
 * Features:
 * - Real-time cost visualization with charts
 * - Budget tracking against $520/month allocation
 * - Cost optimization recommendations
 * - Period selector (7d / 30d / 90d / all)
 * - Auto-refresh every 60 seconds
 */

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertCircle, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard';
import { TYPOGRAPHY, SPACING } from '@/lib/design-tokens';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from '@/components/charts';
import type { UnifiedCostData, TimeRange } from '@/lib/unified-cost-aggregator';

interface DashboardState {
  data: UnifiedCostData | null;
  loading: boolean;
  error: string | null;
  period: TimeRange;
  lastRefresh: Date;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

export default function UnifiedAiCostsClient() {
  const [state, setState] = useState<DashboardState>({
    data: null,
    loading: true,
    error: null,
    period: '30d',
    lastRefresh: new Date(),
  });

  // Fetch cost data (used for manual refresh)
  const fetchData = async (period: TimeRange) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const response = await fetch(`/api/dev/ai-costs/unified?period=${period}`);

      if (!response.ok) throw new Error('Failed to fetch cost data');

      const data: UnifiedCostData = await response.json();
      setState((prev) => ({
        ...prev,
        data,
        loading: false,
        lastRefresh: new Date(),
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false,
      }));
    }
  };

  // Real-time updates via Server-Sent Events
  useEffect(() => {
    // Create EventSource for real-time streaming
    const eventSource = new EventSource(`/api/dev/ai-costs/unified/stream?period=${state.period}`);

    eventSource.onmessage = (event) => {
      try {
        const data: UnifiedCostData = JSON.parse(event.data);
        setState((prev) => ({
          ...prev,
          data,
          loading: false,
          error: null,
          lastRefresh: new Date(),
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: 'Failed to parse update',
          loading: false,
        }));
      }
    };

    eventSource.onerror = () => {
      setState((prev) => ({
        ...prev,
        error: 'Connection lost. Reconnecting...',
        loading: false,
      }));
      eventSource.close();
    };

    // Cleanup on unmount or period change
    return () => {
      eventSource.close();
    };
  }, [state.period]);

  // Manual refresh handler
  const handleRefresh = () => {
    fetchData(state.period);
  };

  // Period change handler
  const handlePeriodChange = (period: TimeRange) => {
    setState((prev) => ({ ...prev, period }));
  };

  const { data, loading, error, period, lastRefresh } = state;

  return (
    <DashboardLayout
      title="Unified AI Cost Dashboard"
      description="Track spending and usage across Claude Code, GitHub Copilot, and OpenCode.ai"
      actions={
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Refresh
          </Button>
        </div>
      }
      filters={
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePeriodChange(p)}
            >
              {p === 'all' ? 'All Time' : `Last ${p.replace('d', ' Days')}`}
            </Button>
          ))}
        </div>
      }
    >
      <div className={SPACING.section}>
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Budget Warning Alert */}
        {data && data.summary.monthlyBudgetUsed > 70 && (
          <Alert variant={data.summary.monthlyBudgetUsed > 90 ? 'destructive' : 'default'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {data.summary.monthlyBudgetUsed > 90
                ? `Critical: Budget usage at ${data.summary.monthlyBudgetUsed.toFixed(1)}%. You are approaching your monthly limit.`
                : `Warning: Budget usage at ${data.summary.monthlyBudgetUsed.toFixed(1)}%. Monitor spending closely.`}
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        {data && (
          <section>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                title="Total Cost"
                value={`$${data.summary.totalCost.toFixed(2)}`}
                subtitle={`${data.summary.monthlyBudgetUsed.toFixed(1)}% of $520 budget`}
                icon={<DollarSign className="h-5 w-5" />}
                variant="blue"
              />
              <SummaryCard
                title="Total Sessions"
                value={data.summary.totalSessions.toString()}
                subtitle={`$${data.summary.averageCostPerSession.toFixed(2)}/session`}
                icon={<Activity className="h-5 w-5" />}
                variant="green"
              />
              <SummaryCard
                title="Total Tokens"
                value={`${(data.summary.totalTokens / 1000).toFixed(0)}K`}
                subtitle={`${(data.summary.averageTokensPerSession / 1000).toFixed(1)}K/session`}
                icon={<TrendingUp className="h-5 w-5" />}
                variant="amber"
              />
              <SummaryCard
                title="Most Used"
                value={formatToolName(data.summary.mostUsedTool)}
                subtitle="Primary tool"
                icon={<Activity className="h-5 w-5" />}
                variant="purple"
              />
            </div>
          </section>
        )}

        {/* Charts Section */}
        {data && (
          <section>
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Cost Distribution Pie Chart */}
              <div className="rounded-lg border bg-card p-6">
                <h2 className={TYPOGRAPHY.h3.standard}>Cost by Source</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Distribution of spending across AI tools
                </p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: 'Claude Code',
                          value: data.sources.claudeCode.estimatedCost,
                        },
                        {
                          name: 'GitHub Copilot',
                          value: data.sources.copilotVSCode.costPerMonth,
                        },
                        {
                          name: 'OpenCode',
                          value: data.sources.opencode.estimatedCost,
                        },
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
                    <Tooltip
                      formatter={(value) =>
                        typeof value === 'number' ? `$${value.toFixed(2)}` : '$0.00'
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Session Distribution Bar Chart */}
              <div className="rounded-lg border bg-card p-6">
                <h2 className={TYPOGRAPHY.h3.standard}>Sessions by Source</h2>
                <p className="text-sm text-muted-foreground mb-4">Usage frequency by AI tool</p>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        name: 'Claude',
                        sessions: data.sources.claudeCode.sessions,
                      },
                      {
                        name: 'Copilot',
                        sessions: data.sources.copilotVSCode.sessions,
                      },
                      {
                        name: 'OpenCode',
                        sessions: data.sources.opencode.sessions,
                      },
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
          </section>
        )}

        {/* Detailed Metrics Cards */}
        {data && (
          <section>
            <h2 className={TYPOGRAPHY.h2.standard}>Detailed Metrics</h2>
            <p className="text-sm text-muted-foreground mb-4">
              In-depth statistics for each AI tool
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Claude Code */}
              <DetailCard
                title="Claude Code"
                metrics={[
                  { label: 'Sessions', value: data.sources.claudeCode.sessions },
                  {
                    label: 'Success Rate',
                    value: `${((data.sources.claudeCode.successRate || 0) * 100).toFixed(1)}%`,
                  },
                  {
                    label: 'Total Tokens',
                    value: data.sources.claudeCode.totalTokens.toLocaleString(),
                  },
                  {
                    label: 'Est. Cost',
                    value: `$${data.sources.claudeCode.estimatedCost.toFixed(2)}`,
                  },
                  {
                    label: 'Token Compliance',
                    value: `${(data.sources.claudeCode.qualityMetrics.tokenCompliance * 100).toFixed(1)}%`,
                  },
                  {
                    label: 'Test Pass Rate',
                    value: `${(data.sources.claudeCode.qualityMetrics.testPassRate * 100).toFixed(1)}%`,
                  },
                ]}
              />

              {/* GitHub Copilot */}
              <DetailCard
                title="GitHub Copilot"
                metrics={[
                  { label: 'Sessions', value: data.sources.copilotVSCode.sessions },
                  {
                    label: 'Total Tokens',
                    value: data.sources.copilotVSCode.totalTokens.toLocaleString(),
                  },
                  {
                    label: 'Monthly Cost',
                    value: `$${data.sources.copilotVSCode.costPerMonth.toFixed(2)} (flat)`,
                  },
                  {
                    label: 'Cost/Session',
                    value: `$${data.sources.copilotVSCode.costPerSession.toFixed(2)}`,
                  },
                  {
                    label: 'Avg Quality',
                    value: `${data.sources.copilotVSCode.qualityRating.toFixed(1)}/5`,
                  },
                  {
                    label: 'Violation Rate',
                    value: `${(data.sources.copilotVSCode.violationRate * 100).toFixed(1)}%`,
                  },
                ]}
              />

              {/* OpenCode */}
              <DetailCard
                title="OpenCode.ai"
                metrics={[
                  { label: 'Sessions', value: data.sources.opencode.sessions },
                  {
                    label: 'Total Tokens',
                    value: data.sources.opencode.totalTokens.toLocaleString(),
                  },
                  {
                    label: 'Est. Cost',
                    value: `$${data.sources.opencode.estimatedCost.toFixed(2)}`,
                  },
                  {
                    label: 'Free Models',
                    value: `$${(
                      data.sources.opencode.costByModel['gpt-5-mini'] +
                      data.sources.opencode.costByModel['raptor-mini']
                    ).toFixed(2)}`,
                  },
                  {
                    label: 'Premium Models',
                    value: `$${data.sources.opencode.costByModel['claude-sonnet'].toFixed(2)}`,
                  },
                  {
                    label: 'Avg Quality',
                    value: `${data.sources.opencode.qualityMetrics.averageQuality.toFixed(1)}/5`,
                  },
                ]}
              />
            </div>
          </section>
        )}

        {/* Recommendations */}
        {data && data.recommendations.length > 0 && (
          <section>
            <h2 className={TYPOGRAPHY.h2.standard}>Cost Optimization</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Recommendations to improve efficiency and reduce spending
            </p>
            <div className={SPACING.compact}>
              {data.recommendations.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// COMPONENT HELPERS
// ============================================================================

interface SummaryCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  variant: 'blue' | 'green' | 'amber' | 'purple';
}

function SummaryCard({ title, value, subtitle, icon, variant }: SummaryCardProps) {
  const variantClasses = {
    blue: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
    amber: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800',
    purple: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800',
  };

  const iconClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    amber: 'text-amber-600 dark:text-amber-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };

  return (
    <div className={`rounded-lg border p-6 ${variantClasses[variant]}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={iconClasses[variant]}>{icon}</div>
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}

interface DetailCardProps {
  title: string;
  metrics: Array<{ label: string; value: string | number }>;
}

function DetailCard({ title, metrics }: DetailCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className={`${TYPOGRAPHY.h3.standard} mb-4`}>{title}</h3>
      <dl className={SPACING.compact}>
        {metrics.map((metric) => (
          <div key={metric.label} className="flex justify-between text-sm">
            <dt className="text-muted-foreground">{metric.label}</dt>
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
  const severityStyles = {
    info: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100',
    warning:
      'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100',
    critical:
      'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100',
  };

  return (
    <div className={`rounded-lg border p-4 ${severityStyles[recommendation.severity]}`}>
      <p className="font-semibold">{recommendation.title}</p>
      <p className="text-sm mt-1">{recommendation.description}</p>
      {recommendation.estimatedSavings && recommendation.estimatedSavings > 0 && (
        <p className="text-sm font-semibold mt-2">
          Potential savings: ${recommendation.estimatedSavings.toFixed(2)}
        </p>
      )}
      <p className="text-sm mt-2 font-medium">→ {recommendation.action}</p>
    </div>
  );
}

// Utility function to format tool names
function formatToolName(tool: string): string {
  const names: Record<string, string> = {
    'claude-code': 'Claude Code',
    'copilot-vscode': 'GitHub Copilot',
    opencode: 'OpenCode.ai',
    all: 'All Tools',
  };
  return names[tool] || tool;
}

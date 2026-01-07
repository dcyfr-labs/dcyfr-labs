"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout, DashboardStat } from "@/components/dashboard";
import {
  telemetry,
  getGlobalFallbackManager,
  type AgentType,
  type ComparisonStats,
} from "@/lib/agents";
import {
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  RefreshCw,
  Download,
} from "lucide-react";
import {
  UsageDistributionChart,
  QualityComparisonChart,
  CostTrackingChart,
  HandoffPatternsSummary,
  RecentSessionsTable,
} from "@/components/agents";
import { toast } from "sonner";

export default function AgentsClient() {
  const [comparison, setComparison] = useState<ComparisonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("30d");
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    try {
      const data = await telemetry.compareAgents(period);
      setComparison(data);
    } catch (error) {
      console.error("Failed to load agent data:", error);
      toast.error("Failed to load agent data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Refresh every 60 seconds
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const handleExport = () => {
    if (!comparison) return;

    const exportData = {
      exportedAt: new Date().toISOString(),
      period,
      comparison,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agent-metrics-${period}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Metrics exported successfully");
  };

  return (
    <DashboardLayout
      title="AI Agent Dashboard"
      description="Real-time metrics, performance tracking, and cost analysis across all AI agents"
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={!comparison || loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={refreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </>
      }
      filters={
        <div className="flex gap-2">
          <Button
            variant={period === "7d" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("7d")}
          >
            7 Days
          </Button>
          <Button
            variant={period === "30d" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("30d")}
          >
            30 Days
          </Button>
          <Button
            variant={period === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod("all")}
          >
            All Time
          </Button>
        </div>
      }
    >
      {loading ? (
        <LoadingSkeleton />
      ) : comparison ? (
        <>
          {/* Agent Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["claude", "copilot", "groq", "ollama"] as AgentType[]).map(
              (agent) => {
                const stats = comparison.agents[agent];
                const totalSessions = Object.values(comparison.agents).reduce(
                  (sum, s) => sum + s.totalSessions,
                  0
                );
                const usagePercent =
                  totalSessions > 0
                    ? (stats.totalSessions / totalSessions) * 100
                    : 0;
                const successRate =
                  stats.totalSessions > 0
                    ? (stats.outcomes.success / stats.totalSessions) * 100
                    : 0;

                return (
                  <DashboardStat
                    key={agent}
                    label={agent.charAt(0).toUpperCase() + agent.slice(1)}
                    value={`${usagePercent.toFixed(0)}%`}
                    secondaryValue={`${stats.totalSessions} sessions`}
                    icon={
                      successRate >= 90
                        ? CheckCircle2
                        : successRate >= 70
                          ? Clock
                          : XCircle
                    }
                    trend={{
                      value: `${successRate.toFixed(0)}% success`,
                      direction:
                        successRate >= 90
                          ? "up"
                          : successRate >= 70
                            ? "neutral"
                            : "down",
                    }}
                  />
                );
              }
            )}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Usage Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <UsageDistributionChart comparison={comparison} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <QualityComparisonChart comparison={comparison} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CostTrackingChart comparison={comparison} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Handoff Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <HandoffPatternsSummary period={period} />
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          {comparison.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {comparison.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-2">
                      <Badge variant="outline">{i + 1}</Badge>
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recent Sessions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentSessionsTable period={period} />
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No telemetry data available.</p>
          <p className="text-sm mt-2">
            Start tracking sessions to see analytics.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}

function LoadingSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </>
  );
}

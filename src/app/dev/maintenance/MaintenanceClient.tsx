"use client";

/**
 * Maintenance Dashboard - Client Component
 *
 * Main component that orchestrates the maintenance dashboard
 * 
 * Displays:
 * - Workflow status grid (4 tracked workflows)
 * - 52-week trend visualization
 * - Recent workflow history
 * - Observation logging system
 * - Auto-refresh every 60 seconds
 * 
 * Modular structure:
 * - types.ts: Type definitions
 * - hooks.ts: useMaintenanceDashboard hook
 * - components/*: UI components
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, ExternalLink, TrendingUp } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { TYPOGRAPHY } from "@/lib/design-tokens";

// Import components
import { WorkflowCard, WorkflowGridSkeleton, WorkflowStatusBadge } from "./components/workflow";
import { ApiHealthCard, DesignSystemReportCard, RedisHealthCard } from "./components/status-cards";
import { ObservationLogger, ObservationList } from "./components/observations";
import { TrendChart } from "./components/trends";

// Import hook and types
import { useMaintenanceDashboard } from "./hooks";

/**
 * Main Maintenance Client Component
 */
export default function MaintenanceClient() {
  const { state, fetchDashboardData, refreshObservations, setAutoRefresh } =
    useMaintenanceDashboard();

  /**
   * Manual refresh handler
   */
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  return (
    <DashboardLayout
      title="Maintenance Dashboard"
      description="Monitor automated workflows, trends, and system health"
      actions={
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {state.lastRefresh.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={state.loading}
            className="gap-2"
          >
            <RefreshCw
              className={state.loading ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
            Refresh
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* API Health & Design System Status */}
        <section className="grid gap-4 lg:grid-cols-3">
          <ApiHealthCard health={state.apiHealth} />
          <RedisHealthCard health={state.redisHealth} />
          <DesignSystemReportCard report={state.designSystemReport} />
        </section>

        {/* Workflow Status Grid */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className={TYPOGRAPHY.h2.standard}>Workflow Status</h2>
              <p className="text-sm text-muted-foreground">
                Status of automated maintenance workflows
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Auto-refresh (60s)
              </label>
            </div>
          </div>

          {state.error && (
            <Card className="border-destructive mb-6">
              <CardHeader>
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <CardTitle>Error Loading Workflows</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{state.error}</p>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {state.loading && state.workflows.length === 0 ? (
            <WorkflowGridSkeleton />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              {state.workflows.map((workflow) => (
                <WorkflowCard key={workflow.workflow_id} workflow={workflow} />
              ))}
            </div>
          )}
        </section>

        {/* 52-Week Trends */}
        <section>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <div>
                  <CardTitle>52-Week Trends</CardTitle>
                  <CardDescription>
                    Test pass rate, coverage, and security score over time
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <TrendChart trends={state.trends} />
            </CardContent>
          </Card>
        </section>

        {/* Workflow History */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Recent Workflow Runs</CardTitle>
              <CardDescription>
                Detailed history across all tracked workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {state.workflows.flatMap((workflow) =>
                  workflow.recent_runs.slice(0, 3).map((run: any) => (
                    <div
                      key={run.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {workflow.workflow_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Run #{run.run_number} •{" "}
                          {new Date(run.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <WorkflowStatusBadge
                          status={run.status}
                          conclusion={run.conclusion}
                        />
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={run.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Observations */}
        <section>
          <div className="grid gap-4 lg:grid-cols-2">
            <ObservationLogger onSubmit={refreshObservations} />
            <Card>
              <CardHeader>
                <CardTitle>Recent Observations</CardTitle>
                <CardDescription>Last 10 logged observations</CardDescription>
              </CardHeader>
              <CardContent>
                <ObservationList observations={state.observations} />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

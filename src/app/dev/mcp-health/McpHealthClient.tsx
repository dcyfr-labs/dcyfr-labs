"use client";

/**
 * MCP Health Dashboard - Client Component
 *
 * Main component that orchestrates the MCP health monitoring dashboard.
 *
 * Displays:
 * - Summary statistics (total, operational, degraded, down)
 * - Server status grid with individual cards
 * - 7-day response time trends chart
 * - Uptime percentages
 * - Recent incidents timeline
 * - Auto-refresh every 60 seconds
 */

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, AlertCircle, ExternalLink } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard";
import { TYPOGRAPHY } from "@/lib/design-tokens";

// Import components
import {
  McpStatusGrid,
  McpHealthChart,
  McpUptimeChart,
  McpIncidentsTimeline,
  McpSummaryCard,
} from "./components";

// Import hook
import { useMcpHealthDashboard } from "./hooks";

/**
 * Main MCP Health Client Component
 */
export default function McpHealthClient() {
  const { state, fetchHealthData } = useMcpHealthDashboard();

  /**
   * Manual refresh handler
   */
  const handleRefresh = () => {
    fetchHealthData(true);
  };

  const { healthReport, uptimeMetrics, incidents, historyData, loading, error } = state;

  return (
    <DashboardLayout
      title="MCP Health Dashboard"
      description="Monitor MCP server health, uptime, and response times"
      actions={
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {state.lastRefresh.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw
              className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-2"
          >
            <a
              href="https://github.com/dcyfr/dcyfr-labs/actions/workflows/mcp-server-check.yml"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              CI Workflow
            </a>
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary Statistics */}
        <section>
          <McpSummaryCard
            total={healthReport?.summary.total ?? 0}
            ok={healthReport?.summary.ok ?? 0}
            degraded={healthReport?.summary.degraded ?? 0}
            down={healthReport?.summary.down ?? 0}
            loading={loading}
          />
        </section>

        {/* Server Status Grid */}
        <section>
          <div className="mb-4">
            <h2 className={TYPOGRAPHY.h2.standard}>Server Status</h2>
            <p className="text-sm text-muted-foreground">
              Current status of all MCP servers (critical servers highlighted)
            </p>
          </div>
          <McpStatusGrid
            servers={healthReport?.servers ?? []}
            metrics={uptimeMetrics}
            loading={loading}
          />
        </section>

        {/* Charts Section */}
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Response Time Trends */}
          <McpHealthChart historyData={historyData} loading={loading} />

          {/* Uptime Percentages */}
          <McpUptimeChart metrics={uptimeMetrics} loading={loading} />
        </section>

        {/* Incidents Timeline */}
        <section>
          <McpIncidentsTimeline incidents={incidents} loading={loading} />
        </section>

        {/* Documentation Link */}
        <section className="text-center text-sm text-muted-foreground">
          <p>
            Health checks run every 6 hours via CI.{" "}
            <a
              href="/dev/docs/features/mcp-health-monitoring"
              className="underline hover:text-foreground"
            >
              View documentation
            </a>
          </p>
        </section>
      </div>
    </DashboardLayout>
  );
}

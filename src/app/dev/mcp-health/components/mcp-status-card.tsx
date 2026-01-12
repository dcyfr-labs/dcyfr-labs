/**
 * MCP Status Card Component
 *
 * Displays individual MCP server status with visual indicators
 */

"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Activity,
  Shield,
} from "lucide-react";
import type { McpServerStatus, McpUptimeMetrics } from "../types";
import { CRITICAL_MCPS } from "../types";
import { SEMANTIC_COLORS } from "@/lib/design-tokens";

interface McpStatusCardProps {
  server: McpServerStatus;
  metrics?: McpUptimeMetrics;
}

/**
 * Individual MCP server status card
 */
export function McpStatusCard({ server, metrics }: McpStatusCardProps) {
  const isCritical = CRITICAL_MCPS.includes(server.name as typeof CRITICAL_MCPS[number]);

  const statusConfig = {
    ok: {
      variant: "default" as const,
      className: SEMANTIC_COLORS.status.success,
      icon: CheckCircle2,
      label: "Operational",
    },
    degraded: {
      variant: "secondary" as const,
      className: SEMANTIC_COLORS.status.warning,
      icon: AlertCircle,
      label: "Degraded",
    },
    down: {
      variant: "destructive" as const,
      className: "bg-destructive",
      icon: XCircle,
      label: "Down",
    },
  };

  const config = statusConfig[server.status];
  const StatusIcon = config.icon;

  return (
    <Card className={isCritical ? "border-2 border-primary/20" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCritical && (
              <span title="Critical MCP">
                <Shield className="h-4 w-4 text-primary" />
              </span>
            )}
            <CardTitle className="text-sm font-medium">{server.name}</CardTitle>
          </div>
          <Badge variant={config.variant} className={config.className}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{server.responseTimeMs}ms</span>
          </div>
          {metrics && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Activity className="h-3 w-3" />
              <span>{metrics.percentage.toFixed(1)}% uptime</span>
            </div>
          )}
        </div>
        {server.error && (
          <p className="mt-2 text-xs text-destructive truncate" title={server.error}>
            {server.error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton loading state for MCP status card
 */
export function McpStatusCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Grid of MCP status cards
 */
export function McpStatusGrid({
  servers,
  metrics,
  loading,
}: {
  servers: McpServerStatus[];
  metrics: Record<string, McpUptimeMetrics>;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <McpStatusCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Sort: critical first, then by status (down > degraded > ok), then alphabetically
  const sortedServers = [...servers].sort((a, b) => {
    const aIsCritical = CRITICAL_MCPS.includes(a.name as typeof CRITICAL_MCPS[number]);
    const bIsCritical = CRITICAL_MCPS.includes(b.name as typeof CRITICAL_MCPS[number]);

    if (aIsCritical !== bIsCritical) return aIsCritical ? -1 : 1;

    const statusOrder = { down: 0, degraded: 1, ok: 2 };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }

    return a.name.localeCompare(b.name);
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sortedServers.map((server) => (
        <McpStatusCard
          key={server.name}
          server={server}
          metrics={metrics[server.name]}
        />
      ))}
    </div>
  );
}

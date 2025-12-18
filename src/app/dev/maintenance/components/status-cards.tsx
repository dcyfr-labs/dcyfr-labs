/**
 * Status Cards Components
 * 
 * ApiHealthCard, DesignSystemReportCard, and RedisHealthCard
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Server, XCircle, FileWarning, Database } from "lucide-react";
import type { ApiHealth, DesignSystemReport, RedisHealthStatus } from "../types";
import { SEMANTIC_COLORS } from "@/lib/design-tokens";

/**
 * API Health Status Card
 */
export function ApiHealthCard({ health }: { health: ApiHealth | null }) {
  if (!health) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  const statusConfig = {
    healthy: { variant: "default" as const, className: SEMANTIC_COLORS.status.success, icon: CheckCircle2 },
    degraded: { variant: "secondary" as const, className: SEMANTIC_COLORS.status.warning, icon: AlertCircle },
    unhealthy: { variant: "destructive" as const, className: "bg-destructive", icon: XCircle },
  };

  const config = statusConfig[health.status];
  const StatusIcon = config.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">API Health</CardTitle>
          </div>
          <Badge variant={config.variant} className={config.className}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Edge Runtime:</span>
            <div className="flex items-center gap-1 mt-1">
              {health.services.edge ? (
                <CheckCircle2 className={`h-4 w-4 ${SEMANTIC_COLORS.alert.success.icon}`} />
              ) : (
                <XCircle className={`h-4 w-4 ${SEMANTIC_COLORS.alert.critical.icon}`} />
              )}
              <span>{health.services.edge ? "Operational" : "Down"}</span>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Vercel:</span>
            <div className="flex items-center gap-1 mt-1">
              {health.services.vercel ? (
                <CheckCircle2 className={`h-4 w-4 ${SEMANTIC_COLORS.alert.success.icon}`} />
              ) : (
                <XCircle className={`h-4 w-4 ${SEMANTIC_COLORS.alert.critical.icon}`} />
              )}
              <span>{health.services.vercel ? "Operational" : "Down"}</span>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Region:</span>
            <div className="font-mono text-xs mt-1">{health.serverInfo.region}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Last Check:</span>
            <div className="text-xs mt-1">
              {new Date(health.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Design System Report Card
 */
export function DesignSystemReportCard({ report }: { report: DesignSystemReport | null }) {
  if (!report) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-lg">Design System</CardTitle>
                <CardDescription className="text-xs">Not available</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Design system validation skipped
              </p>
              <p className="text-xs text-muted-foreground">
                Run: node scripts/validation/validate-design-tokens.mjs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">Design System</CardTitle>
              <CardDescription className="text-xs">
                {new Date(report.generatedAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={report.totalViolations === 0 ? "default" : "secondary"}
            className={
              report.totalViolations === 0 ? SEMANTIC_COLORS.status.success : SEMANTIC_COLORS.status.warning
            }
          >
            <CheckCircle2 className={`h-3 w-3 mr-1 ${report.totalViolations === 0 ? '' : 'hidden'}`} />
            {report.totalViolations} {report.totalViolations === 1 ? 'violation' : 'violations'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Files Scanned:</span>
            <div className="font-semibold text-lg">{report.filesScanned}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Spacing Issues:</span>
            <div className="font-semibold text-lg">{report.summary.spacing}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Typography Issues:</span>
            <div className="font-semibold text-lg">{report.summary.typography}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Violation Rate:</span>
            <div className="font-semibold text-lg">
              {report.filesScanned > 0
                ? ((report.totalViolations / report.filesScanned) * 100).toFixed(1)
                : 0}
              %
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Redis Health Card
 */
export function RedisHealthCard({ health }: { health: RedisHealthStatus | null }) {
  if (!health) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  const statusConfig = {
    connected: { variant: "default" as const, className: SEMANTIC_COLORS.status.success, icon: CheckCircle2 },
    disconnected: { variant: "destructive" as const, className: "", icon: XCircle },
    notConfigured: { variant: "secondary" as const, className: SEMANTIC_COLORS.status.neutral, icon: AlertCircle },
  };

  const status = health.connected ? "connected" : health.configured ? "disconnected" : "notConfigured";
  const config = statusConfig[status as keyof typeof statusConfig];
  const StatusIcon = config.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Redis Health</CardTitle>
          </div>
          <Badge variant={config.variant} className={config.className}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {health.connected ? "Connected" : health.configured ? "Unavailable" : "Not Set"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-muted-foreground">Configured:</span>
            <div className="flex items-center gap-1 mt-1">
              {health.configured ? (
                <CheckCircle2 className={`h-4 w-4 ${SEMANTIC_COLORS.alert.success.icon}`} />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <span>{health.configured ? "Yes" : "No"}</span>
            </div>
          </div>
          {health.testResult && (
            <>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div className="flex items-center gap-1 mt-1">
                  {health.testResult.success ? (
                    <CheckCircle2 className={`h-4 w-4 ${SEMANTIC_COLORS.alert.success.icon}`} />
                  ) : (
                    <XCircle className={`h-4 w-4 ${SEMANTIC_COLORS.alert.critical.icon}`} />
                  )}
                  <span>{health.testResult.success ? "Healthy" : "Failed"}</span>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Latency:</span>
                <div className="font-mono text-xs mt-1">{health.testResult.latency}ms</div>
              </div>
            </>
          )}
          {health.message && (
            <div>
              <span className="text-muted-foreground">Message:</span>
              <div className="text-xs mt-1 text-muted-foreground">{health.message}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

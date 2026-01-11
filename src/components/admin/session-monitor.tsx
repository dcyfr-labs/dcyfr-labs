import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Shield,
  Users,
} from "lucide-react";
import { SPACING, SEMANTIC_COLORS, TYPOGRAPHY } from "@/lib/design-tokens";

/**
 * Session Monitor Admin Component
 *
 * Displays secure session statistics and management controls.
 * Shows Redis session health, active users, and security metrics.
 */

interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  expiredSessions: number;
  timestamp: string;
}

interface SessionMonitorProps {
  stats?: SessionStats;
  isLoading?: boolean;
  error?: string;
}

export function SessionMonitor({
  stats,
  isLoading = false,
  error,
}: SessionMonitorProps) {
  if (error) {
    return (
      <Alert
        className={`border-l-4 border-l-destructive/60 ${SEMANTIC_COLORS.alert.critical.container}`}
      >
        <AlertTriangle
          className={`h-4 w-4 ${SEMANTIC_COLORS.alert.critical.icon}`}
        />
        <AlertDescription className={SEMANTIC_COLORS.alert.critical.text}>
          Failed to load session data: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Session Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 skeleton-shimmer rounded"></div>
            <div className="h-4 skeleton-shimmer rounded w-3/4"></div>
            <div className="h-4 skeleton-shimmer rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No session data available. Ensure Redis is configured and
          SESSION_ENCRYPTION_KEY is set.
        </AlertDescription>
      </Alert>
    );
  }

  const healthScore =
    stats.totalSessions > 0
      ? Math.round((stats.activeSessions / stats.totalSessions) * 100)
      : 100;

  const getHealthBadge = (score: number) => {
    if (score >= 90)
      return (
        <Badge className={SEMANTIC_COLORS.status.success}>Excellent</Badge>
      );
    if (score >= 70)
      return <Badge className={SEMANTIC_COLORS.status.warning}>Good</Badge>;
    if (score >= 50)
      return <Badge className={SEMANTIC_COLORS.status.inProgress}>Fair</Badge>;
    return <Badge className={SEMANTIC_COLORS.status.error}>Poor</Badge>;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Session Monitor
            {getHealthBadge(healthScore)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Active Sessions */}
            <div
              className={`flex items-center space-x-2 p-3 ${SEMANTIC_COLORS.status.success} rounded-lg`}
            >
              <CheckCircle2 className="h-8 w-8" />
              <div>
                <p className="text-sm">Active Sessions</p>
                <p className={TYPOGRAPHY.h2.standard}>
                  {stats.activeSessions.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Total Sessions */}
            <div
              className={`flex items-center space-x-2 p-3 ${SEMANTIC_COLORS.status.info} rounded-lg`}
            >
              <Users className="h-8 w-8" />
              <div>
                <p className="text-sm">Total Sessions</p>
                <p className={TYPOGRAPHY.h2.standard}>
                  {stats.totalSessions.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Expired Sessions */}
            <div
              className={`flex items-center space-x-2 p-3 ${SEMANTIC_COLORS.status.inProgress} rounded-lg`}
            >
              <Clock className="h-8 w-8" />
              <div>
                <p className="text-sm">Expired Sessions</p>
                <p className={TYPOGRAPHY.h2.standard}>
                  {stats.expiredSessions.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className={TYPOGRAPHY.label.standard}>
                  Session Health Score
                </p>
                <p className="text-sm text-muted-foreground">
                  Based on active vs total session ratio
                </p>
              </div>
              <div className="text-right">
                <p className={TYPOGRAPHY.display.statLarge}>{healthScore}%</p>
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(stats.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Health Score Bar */}
            <div className="mt-3 w-full bg-muted rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${Math.max(healthScore, 5)}%`,
                  backgroundColor:
                    healthScore >= 90
                      ? "#16a34a"
                      : healthScore >= 70
                        ? "#ca8a04"
                        : healthScore >= 50
                          ? "#ea580c"
                          : "#dc2626",
                }}
              ></div>
            </div>
          </div>

          {/* Security Features */}
          <div
            className={`mt-4 p-4 border rounded-lg ${SEMANTIC_COLORS.alert.info.container}`}
          >
            <h4
              className={`${TYPOGRAPHY.label.standard} ${SEMANTIC_COLORS.alert.info.text} mb-${SPACING.sm}`}
            >
              Security Features Active
            </h4>
            <div className={`grid grid-cols-2 gap-${SPACING.sm} text-sm`}>
              <div className="flex items-center gap-1">
                <CheckCircle2 className={`h-3 w-3`} />
                <span className={SEMANTIC_COLORS.alert.info.text}>
                  AES-256-GCM Encryption
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className={`h-3 w-3`} />
                <span className={SEMANTIC_COLORS.alert.info.text}>
                  CSRF Protection
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className={`h-3 w-3`} />
                <span className={SEMANTIC_COLORS.alert.info.text}>
                  Secure Cookies
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className={`h-3 w-3`} />
                <span className={SEMANTIC_COLORS.alert.info.text}>
                  Auto Expiration
                </span>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {stats.expiredSessions > stats.activeSessions && (
            <Alert
              className={`mt-4 ${SEMANTIC_COLORS.alert.warning.border} ${SEMANTIC_COLORS.alert.warning.container}`}
            >
              <AlertTriangle
                className={`h-4 w-4 ${SEMANTIC_COLORS.alert.warning.icon}`}
              />
              <AlertDescription className={SEMANTIC_COLORS.alert.warning.text}>
                High number of expired sessions detected. Consider running
                cleanup to optimize Redis storage.
              </AlertDescription>
            </Alert>
          )}

          {stats.activeSessions === 0 &&
            new Date().getUTCHours() >= 14 &&
            new Date().getUTCHours() <= 22 && (
              <Alert
                className={`mt-4 ${SEMANTIC_COLORS.alert.warning.border} ${SEMANTIC_COLORS.alert.warning.container}`}
              >
                <AlertTriangle
                  className={`h-4 w-4 ${SEMANTIC_COLORS.alert.warning.icon}`}
                />
                <AlertDescription
                  className={SEMANTIC_COLORS.alert.warning.text}
                >
                  No active sessions during business hours. This may indicate an
                  issue with authentication.
                </AlertDescription>
              </Alert>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

export default SessionMonitor;

/**
 * MCP Incidents Timeline Component
 *
 * Displays recent incidents and alerts
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { TYPOGRAPHY } from "@/lib/design-tokens";
import type { McpIncident } from "../types";

interface McpIncidentsProps {
  incidents: McpIncident[];
  loading: boolean;
}

/**
 * Format relative time
 */
function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * Recent incidents timeline
 */
export function McpIncidentsTimeline({ incidents, loading }: McpIncidentsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (incidents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Incidents</CardTitle>
          <CardDescription className="text-xs">
            Issue history from the past 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>No incidents in the past 7 days</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Incidents</CardTitle>
        <CardDescription className="text-xs">
          {incidents.length} issue{incidents.length !== 1 ? "s" : ""} in the past 7 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {incidents.map((incident, index) => (
            <div
              key={`${incident.server}-${incident.timestamp}-${index}`}
              className="flex gap-3"
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{incident.server}</span>
                  <Badge variant="outline" className="text-xs">
                    {incident.error.includes("down") ? "Down" : "Degraded"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {incident.error}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatRelativeTime(incident.timestamp)}</span>
                  {incident.duration && (
                    <span className="ml-2">Duration: {incident.duration}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Summary statistics card
 */
export function McpSummaryCard({
  total,
  ok,
  degraded,
  down,
  loading,
}: {
  total: number;
  ok: number;
  degraded: number;
  down: number;
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Current Status</CardTitle>
      </CardHeader>
      <CardContent>
         <div className="grid grid-cols-4 gap-4 text-center">
           <div>
             <div className={TYPOGRAPHY.display.stat}>{total}</div>
             <div className="text-xs text-muted-foreground">Total</div>
           </div>
           <div>
             <div className={`${TYPOGRAPHY.display.stat} text-green-500`}>{ok}</div>
             <div className="text-xs text-muted-foreground">Operational</div>
           </div>
           <div>
             <div className={`${TYPOGRAPHY.display.stat} text-yellow-500`}>{degraded}</div>
             <div className="text-xs text-muted-foreground">Degraded</div>
           </div>
           <div>
             <div className={`${TYPOGRAPHY.display.stat} text-red-500`}>{down}</div>
             <div className="text-xs text-muted-foreground">Down</div>
           </div>
         </div>
      </CardContent>
    </Card>
  );
}

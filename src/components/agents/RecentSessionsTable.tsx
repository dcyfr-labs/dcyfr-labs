"use client";

import { useEffect, useState } from "react";
import type { TelemetrySession } from "@/lib/agents";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ArrowUpCircle } from "lucide-react";

interface RecentSessionsTableProps {
  period: string;
  limit?: number;
}

export function RecentSessionsTable({
  period,
  limit = 10,
}: RecentSessionsTableProps) {
  const [sessions, setSessions] = useState<TelemetrySession[]>([]);

  useEffect(() => {
    async function loadSessions() {
      // This would load from your telemetry storage
      // For now, returns empty array since storage implementation is placeholder
      setSessions([]);
    }
    loadSessions();
  }, [period]);

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No session data available yet</p>
        <p className="text-sm mt-2">
          Sessions will appear here once telemetry tracking is active
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-3 font-semibold">Agent</th>
            <th className="pb-3 font-semibold">Task</th>
            <th className="pb-3 font-semibold">Type</th>
            <th className="pb-3 font-semibold">Status</th>
            <th className="pb-3 font-semibold">Duration</th>
            <th className="pb-3 font-semibold">Cost</th>
            <th className="pb-3 font-semibold">Quality</th>
          </tr>
        </thead>
        <tbody>
          {sessions.slice(0, limit).map((session) => {
            const duration = session.endTime
              ? Math.round(
                  (session.endTime.getTime() - session.startTime.getTime()) /
                    1000 /
                    60
                )
              : 0;

            return (
              <tr
                key={session.sessionId}
                className="border-b hover:bg-muted/50"
              >
                <td className="py-3">
                  <Badge variant="outline">
                    {session.agent.charAt(0).toUpperCase() +
                      session.agent.slice(1)}
                  </Badge>
                </td>
                <td className="py-3 max-w-xs truncate">
                  {session.taskDescription}
                </td>
                <td className="py-3">
                  <Badge variant="secondary">{session.taskType}</Badge>
                </td>
                <td className="py-3">
                  {session.outcome === "success" && (
                    <div className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">Success</span>
                    </div>
                  )}
                  {session.outcome === "escalated" && (
                    <div className="flex items-center gap-1 text-warning">
                      <ArrowUpCircle className="h-4 w-4" />
                      <span className="text-sm">Escalated</span>
                    </div>
                  )}
                  {session.outcome === "failed" && (
                    <div className="flex items-center gap-1 text-error">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm">Failed</span>
                    </div>
                  )}
                </td>
                <td className="py-3 text-sm">{duration}m</td>
                <td className="py-3 text-sm">
                  ${session.cost.estimatedCost.toFixed(2)}
                </td>
                <td className="py-3 text-sm">
                  {(session.metrics.tokenCompliance * 100).toFixed(0)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

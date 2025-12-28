/**
 * Workflow Components
 * 
 * WorkflowStatusBadge and WorkflowCard components for displaying workflow status
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SEMANTIC_COLORS } from "@/lib/design-tokens";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";
import type { WorkflowSummary } from "@/types/maintenance";

/**
 * Workflow status badge showing current state
 */
export function WorkflowStatusBadge({
  status,
  conclusion,
}: {
  status: string;
  conclusion: string | null;
}) {
  if (status === "in_progress" || status === "queued") {
    return (
      <Badge variant="secondary" className="gap-1">
        <span className="h-2 w-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
        {status === "queued" ? "Queued" : "Running"}
      </Badge>
    );
  }

  if (conclusion === "success") {
    return (
      <Badge variant="outline" className={cn("gap-1", SEMANTIC_COLORS.status.success.badge)}>
        <span className={cn("h-2 w-2 rounded-full", SEMANTIC_COLORS.status.success.dot)} />
        Success
      </Badge>
    );
  }

  if (conclusion === "failure" || conclusion === "timed_out" || conclusion === "action_required") {
    return (
      <Badge variant="outline" className={cn("gap-1", SEMANTIC_COLORS.status.error.badge)}>
        <span className={cn("h-2 w-2 rounded-full", SEMANTIC_COLORS.status.error.dot)} />
        Failed
      </Badge>
    );
  }

  if (conclusion === "cancelled" || conclusion === "skipped") {
    return (
      <Badge variant="outline" className={cn("gap-1", SEMANTIC_COLORS.status.warning.badge)}>
        <span className={cn("h-2 w-2 rounded-full", SEMANTIC_COLORS.status.warning.dot)} />
        {conclusion === "cancelled" ? "Cancelled" : "Skipped"}
      </Badge>
    );
  }

  return <Badge variant="outline">Unknown</Badge>;
}

/**
 * Workflow status card
 */
export function WorkflowCard({ workflow }: { workflow: WorkflowSummary }) {
  const lastRun = workflow.last_run;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{workflow.workflow_name}</CardTitle>
            <CardDescription className="mt-1">
              Pass rate: {workflow.pass_rate.toFixed(1)}% ({workflow.successful_runs}/
              {workflow.total_runs})
            </CardDescription>
          </div>
          {lastRun && (
            <WorkflowStatusBadge status={lastRun.status} conclusion={lastRun.conclusion} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {lastRun ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last run:</span>
              <span>{new Date(lastRun.created_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Run number:</span>
              <span>#{lastRun.run_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Branch:</span>
              <span className="font-mono text-xs">{lastRun.head_branch || "N/A"}</span>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a
                  href={lastRun.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  View on GitHub
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground py-4">
            No runs found
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for workflow grid
 */
export function WorkflowGridSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-48" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

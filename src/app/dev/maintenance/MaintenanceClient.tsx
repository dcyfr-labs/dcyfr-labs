"use client";

/**
 * Maintenance Dashboard - Client Component
 *
 * Displays automated maintenance workflow status, trends, and observation logging.
 *
 * Features:
 * - Workflow status grid (4 tracked workflows)
 * - 52-week trend visualization
 * - Recent workflow history
 * - Observation logging system
 * - Auto-refresh every 60 seconds
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, RefreshCw, ExternalLink, CheckCircle2, XCircle, Server, TrendingUp, Plus, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { TYPOGRAPHY } from "@/lib/design-tokens";
import dynamic from "next/dynamic";
import type { WorkflowSummary, WeeklyMetrics, Observation, ObservationCategory, ObservationSeverity } from "@/types/maintenance";

// Dynamically import Recharts to avoid SSR issues
const LineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import("recharts").then((mod) => mod.Line),
  { ssr: false }
);
const XAxis = dynamic(
  () => import("recharts").then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import("recharts").then((mod) => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("recharts").then((mod) => mod.Tooltip),
  { ssr: false }
);
const Legend = dynamic(
  () => import("recharts").then((mod) => mod.Legend),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

/**
 * API Health types
 */
interface ApiHealth {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  services: {
    edge: boolean;
    vercel: boolean;
  };
  serverInfo: {
    runtime: string;
    region: string;
  };
}

/**
 * Workflow status badge component
 */
function WorkflowStatusBadge({
  status,
  conclusion,
}: {
  status: string;
  conclusion: string | null;
}) {
  if (status === "in_progress" || status === "queued") {
    return (
      <Badge variant="secondary" className="gap-1">
        <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        {status === "queued" ? "Queued" : "Running"}
      </Badge>
    );
  }

  if (conclusion === "success") {
    return (
      <Badge variant="default" className="gap-1 bg-green-600">
        <span className="h-2 w-2 rounded-full bg-white" />
        Success
      </Badge>
    );
  }

  if (conclusion === "failure" || conclusion === "timed_out" || conclusion === "action_required") {
    return (
      <Badge variant="destructive" className="gap-1">
        <span className="h-2 w-2 rounded-full bg-white" />
        Failed
      </Badge>
    );
  }

  if (conclusion === "cancelled" || conclusion === "skipped") {
    return (
      <Badge variant="secondary" className="gap-1">
        <span className="h-2 w-2 rounded-full bg-yellow-500" />
        {conclusion === "cancelled" ? "Cancelled" : "Skipped"}
      </Badge>
    );
  }

  return <Badge variant="outline">Unknown</Badge>;
}

/**
 * Workflow status card component
 */
function WorkflowCard({ workflow }: { workflow: WorkflowSummary }) {
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
function WorkflowGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * API Health status component
 */
function ApiHealthCard({ health }: { health: ApiHealth | null }) {
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
    healthy: { variant: "default" as const, className: "bg-green-600", icon: CheckCircle2 },
    degraded: { variant: "secondary" as const, className: "bg-yellow-600", icon: AlertCircle },
    unhealthy: { variant: "destructive" as const, className: "", icon: XCircle },
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
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span>{health.services.edge ? "Operational" : "Down"}</span>
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Vercel:</span>
            <div className="flex items-center gap-1 mt-1">
              {health.services.vercel ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
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
 * 52-Week Trend Chart Component
 */
function TrendChart({ trends }: { trends: WeeklyMetrics[] | null }) {
  if (!trends || trends.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Show only every 4th week label to avoid crowding
  const chartData = trends.map((t, i) => ({
    ...t,
    weekLabel: i % 4 === 0 ? t.week.split("-W")[1] : "",
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="weekLabel"
          label={{ value: "Week", position: "insideBottom", offset: -5 }}
        />
        <YAxis label={{ value: "Percentage / Score", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="testPassRate"
          stroke="#10b981"
          name="Test Pass Rate %"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="coverage"
          stroke="#3b82f6"
          name="Coverage %"
          strokeWidth={2}
        />
        <Line
          type="monotone"
          dataKey="securityScore"
          stroke="#8b5cf6"
          name="Security Score"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/**
 * Observation Logger Component
 */
function ObservationLogger({ onSubmit }: { onSubmit: () => void }) {
  const [category, setCategory] = useState<ObservationCategory>("general");
  const [severity, setSeverity] = useState<ObservationSeverity>("info");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/maintenance/observations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          severity,
          title: title.trim(),
          description: description.trim(),
          tags,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create observation");
      }

      toast.success("Observation logged successfully");

      // Reset form
      setTitle("");
      setDescription("");
      setTags([]);
      setCategory("general");
      setSeverity("info");

      onSubmit();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to log observation");
    } finally {
      setSubmitting(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Observation</CardTitle>
        <CardDescription>Record AI performance issues, dev tool bugs, or workflow notes</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ObservationCategory)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai-performance">AI Performance</SelectItem>
                  <SelectItem value="dev-tools">Dev Tools</SelectItem>
                  <SelectItem value="workflow">Workflow</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as ObservationSeverity)}>
                <SelectTrigger id="severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of the observation"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of what you observed"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add tags (press Enter)"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Logging..." : "Log Observation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Observation List Component
 */
function ObservationList({ observations }: { observations: Observation[] }) {
  if (observations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No observations logged yet</p>
      </div>
    );
  }

  const severityConfig: Record<string, { variant: "secondary" | "destructive"; icon: typeof CheckCircle2; className: string }> = {
    info: { variant: "secondary", icon: CheckCircle2, className: "" },
    warning: { variant: "secondary", icon: AlertCircle, className: "bg-yellow-600" },
    error: { variant: "destructive", icon: XCircle, className: "" },
  };

  return (
    <div className="space-y-4">
      {observations.map((obs) => {
        const config = severityConfig[obs.severity];
        const SeverityIcon = config.icon;

        return (
          <Card key={obs.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{obs.title}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {obs.category}
                    </Badge>
                  </div>
                  <CardDescription>{obs.description}</CardDescription>
                </div>
                <Badge variant={config.variant} className={config.className || undefined}>
                  <SeverityIcon className="h-3 w-3 mr-1" />
                  {obs.severity}
                </Badge>
              </div>
            </CardHeader>
            {(obs.tags.length > 0 || obs.createdAt) && (
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex flex-wrap gap-2">
                    {obs.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-muted-foreground">
                    {new Date(obs.createdAt).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

/**
 * Main maintenance dashboard component
 */
export default function MaintenanceClient() {
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [apiHealth, setApiHealth] = useState<ApiHealth | null>(null);
  const [trends, setTrends] = useState<WeeklyMetrics[] | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  /**
   * Fetch dashboard data (workflows, health, trends, observations)
   */
  const fetchDashboardData = async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [workflowsRes, healthRes, trendsRes, observationsRes] = await Promise.all([
        fetch("/api/maintenance/workflows"),
        fetch("/api/health"),
        fetch("/api/maintenance/metrics?period=52weeks"),
        fetch("/api/maintenance/observations?limit=10"),
      ]);

      if (!workflowsRes.ok) {
        throw new Error(`Failed to fetch workflows: ${workflowsRes.statusText}`);
      }

      const workflowsData = await workflowsRes.json();
      setWorkflows(workflowsData.workflows);

      // Optional data sources - don't fail if unavailable
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setApiHealth(healthData);
      }

      if (trendsRes.ok) {
        const trendsData = await trendsRes.json();
        setTrends(trendsData.trends);
      }

      if (observationsRes.ok) {
        const observationsData = await observationsRes.json();
        setObservations(observationsData.observations);
      }

      setLastRefresh(new Date());

      if (showToast) {
        toast.success("Dashboard refreshed successfully");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      toast.error(`Failed to fetch dashboard data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh observations after logging a new one
   */
  const refreshObservations = async () => {
    try {
      const response = await fetch("/api/maintenance/observations?limit=10");
      if (response.ok) {
        const data = await response.json();
        setObservations(data.observations);
      }
    } catch (error) {
      console.error("Failed to refresh observations:", error);
    }
  };

  /**
   * Initial data fetch
   */
  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Auto-refresh every 60 seconds
   */
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

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
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* API Health Status */}
        <section>
          <ApiHealthCard health={apiHealth} />
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
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Auto-refresh (60s)
              </label>
            </div>
          </div>

          {error && (
            <Card className="border-destructive mb-6">
              <CardHeader>
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <CardTitle>Error Loading Workflows</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" onClick={handleRefresh} className="mt-4">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}

          {loading && workflows.length === 0 ? (
            <WorkflowGridSkeleton />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {workflows.map((workflow) => (
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
              <TrendChart trends={trends} />
            </CardContent>
          </Card>
        </section>

        {/* Workflow History */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Recent Workflow Runs</CardTitle>
              <CardDescription>Detailed history across all tracked workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {workflows.flatMap((workflow) =>
                  workflow.recent_runs.slice(0, 3).map((run) => (
                    <div
                      key={run.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{workflow.workflow_name}</div>
                        <div className="text-xs text-muted-foreground">
                          Run #{run.run_number} • {new Date(run.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <WorkflowStatusBadge status={run.status} conclusion={run.conclusion} />
                        <Button variant="ghost" size="sm" asChild>
                          <a href={run.html_url} target="_blank" rel="noopener noreferrer">
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
          <div className="grid gap-6 lg:grid-cols-2">
            <ObservationLogger onSubmit={refreshObservations} />
            <Card>
              <CardHeader>
                <CardTitle>Recent Observations</CardTitle>
                <CardDescription>Last 10 logged observations</CardDescription>
              </CardHeader>
              <CardContent>
                <ObservationList observations={observations} />
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

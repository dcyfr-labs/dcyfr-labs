/**
 * Top Endpoints Table Component
 *
 * Shows highest-volume API endpoints with costs
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { TYPOGRAPHY } from "@/lib/design-tokens";
import type { TopEndpoint, ServiceUsage } from "../types";
import { SERVICE_CONFIG } from "../types";

interface TopEndpointsTableProps {
  endpoints: TopEndpoint[];
  loading: boolean;
}

/**
 * Top endpoints by request volume
 */
export function TopEndpointsTable({ endpoints, loading }: TopEndpointsTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (endpoints.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Endpoints</CardTitle>
          <CardDescription className="text-xs">
            No endpoint data available yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-muted-foreground text-sm">
            Endpoint data will appear after API usage is recorded
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Top Endpoints</CardTitle>
            <CardDescription className="text-xs">
              Highest volume API endpoints this month
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Service</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead className="text-right">Requests</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead className="text-right">Avg Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {endpoints.map((endpoint, index) => {
              const config = SERVICE_CONFIG[endpoint.service];
              return (
                <TableRow key={`${endpoint.service}-${endpoint.endpoint}-${index}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: config?.color ?? "#666" }}
                      />
                      <span className="text-sm font-medium">
                        {config?.displayName ?? endpoint.service}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {endpoint.endpoint}
                    </code>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {endpoint.requests.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {endpoint.cost > 0 ? `$${endpoint.cost.toFixed(3)}` : "-"}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {endpoint.avgDuration}ms
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/**
 * Service summary cards grid
 */
export function ServiceSummaryCards({
  services,
  loading,
}: {
  services: ServiceUsage[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Show top 4 services by usage
  const topServices = [...services]
    .filter((s) => s.cost > 0 || s.percentUsed > 1)
    .sort((a, b) => b.percentUsed - a.percentUsed)
    .slice(0, 4);

  // If no services with significant usage, show default message
  if (topServices.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {topServices.map((service) => {
        const config = SERVICE_CONFIG[service.service];
        const statusColor =
          service.percentUsed >= 90
            ? "text-red-500"
            : service.percentUsed >= 70
              ? "text-yellow-500"
              : "text-green-500";

        return (
          <Card key={service.service}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <CardTitle className="text-sm font-medium">
                  {config.displayName}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className={TYPOGRAPHY.display.stat}>
                {service.cost > 0
                  ? `$${service.cost.toFixed(2)}`
                  : service.requests.toLocaleString()}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                <span>{service.cost > 0 ? "cost" : "requests"}</span>
                <span className={statusColor}>
                  {service.percentUsed.toFixed(1)}% of limit
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/**
 * Export data button with CSV/JSON support
 */
export function ExportButton({
  data,
  filename = "api-costs",
}: {
  data: Record<string, unknown>[];
  filename?: string;
}) {
  const handleExport = () => {
    const csv = convertToCSV(data);
    downloadFile(csv, `${filename}.csv`, "text/csv");
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  );
}

/**
 * Convert data array to CSV string
 */
function convertToCSV(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((header) => {
      const value = row[header];
      if (typeof value === "string" && value.includes(",")) {
        return `"${value}"`;
      }
      return String(value ?? "");
    }).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

/**
 * Trigger file download
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

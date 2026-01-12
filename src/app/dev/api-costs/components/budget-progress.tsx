/**
 * Budget Progress Bar Component
 *
 * Visual indicator for budget usage and projections
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, TrendingUp, DollarSign, Calendar } from "lucide-react";
import type { BudgetStatus, ServiceUsage } from "../types";
import { SERVICE_CONFIG } from "../types";

interface BudgetProgressProps {
  budgetStatus: BudgetStatus;
  loading: boolean;
}

/**
 * Main budget progress card
 */
export function BudgetProgressCard({ budgetStatus, loading }: BudgetProgressProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-3 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-6 w-full mb-4" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { used, total, percentUsed, projected, projectedPercent, daysRemaining, status } = budgetStatus;

  const barColor =
    status === "critical"
      ? "bg-red-500"
      : status === "warning"
        ? "bg-yellow-500"
        : "bg-green-500";

  const projectedBarColor =
    projectedPercent >= 100
      ? "bg-red-300"
      : projectedPercent >= 90
        ? "bg-yellow-300"
        : "bg-green-300";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Monthly Budget</CardTitle>
            <CardDescription className="text-xs">
              Current spend vs. ${total}/month limit
            </CardDescription>
          </div>
          {status !== "ok" && (
            <div
              className={`flex items-center gap-1 text-xs font-medium ${
                status === "critical" ? "text-red-500" : "text-yellow-500"
              }`}
            >
              <AlertCircle className="h-4 w-4" />
              {status === "critical" ? "Critical" : "Warning"}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Main Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">${used.toFixed(2)} used</span>
            <span className="text-muted-foreground">
              {percentUsed.toFixed(1)}% of ${total}
            </span>
          </div>
          <div className="relative h-4 w-full rounded-full bg-muted overflow-hidden">
            {/* Actual usage */}
            <div
              className={`absolute left-0 top-0 h-full rounded-full transition-all ${barColor}`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
            {/* Projected (shown as lighter bar behind) */}
            <div
              className={`absolute left-0 top-0 h-full rounded-full transition-all opacity-30 ${projectedBarColor}`}
              style={{ width: `${Math.min(projectedPercent, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Projected: ${projected.toFixed(2)} ({projectedPercent.toFixed(1)}%)</span>
            <span>{daysRemaining} days remaining</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <DollarSign className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">${used.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Current</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">${projected.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Projected</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <Calendar className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">{daysRemaining}</div>
            <div className="text-xs text-muted-foreground">Days Left</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Individual service usage bars
 */
export function ServiceUsageBars({
  services,
  loading,
}: {
  services: ServiceUsage[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort by percent used (highest first)
  const sortedServices = [...services].sort((a, b) => b.percentUsed - a.percentUsed);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Service Usage</CardTitle>
        <CardDescription className="text-xs">
          Request counts vs. monthly limits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedServices.map((service) => {
            const config = SERVICE_CONFIG[service.service];
            const barColor =
              service.percentUsed >= 90
                ? "bg-red-500"
                : service.percentUsed >= 70
                  ? "bg-yellow-500"
                  : "bg-green-500";

            return (
              <div key={service.service} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    <span className="font-medium">{config.displayName}</span>
                    {service.cost > 0 && (
                      <span className="text-xs text-muted-foreground">
                        (${service.cost.toFixed(2)})
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {service.requests.toLocaleString()} / {service.limit.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${Math.min(service.percentUsed, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{service.percentUsed.toFixed(1)}% used</span>
                  <span
                    className={
                      service.trend === "up"
                        ? "text-red-500"
                        : service.trend === "down"
                          ? "text-green-500"
                          : ""
                    }
                  >
                    {service.trend === "up" && "↑"}
                    {service.trend === "down" && "↓"}
                    {service.trend !== "stable" && ` ${service.trendPercent.toFixed(1)}%`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

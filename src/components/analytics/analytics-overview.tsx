/**
 * Analytics Overview Component
 *
 * Displays summary statistics and top posts for the analytics dashboard.
 * Extracted from AnalyticsClient.tsx for reusability.
 */

import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  FileText,
  MessageSquare,
  Share2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DashboardStats, DashboardStat } from "@/components/dashboard";
import { AnalyticsSummary } from "@/types/analytics";
import { getBenchmark } from "@/lib/dashboard";
import Link from "next/link";
import { useState } from "react";
import { TYPOGRAPHY } from "@/lib/design-tokens";

interface AnalyticsOverviewProps {
  /** Filtered summary statistics */
  summary: AnalyticsSummary;
}

/**
 * Analytics overview section with stats cards and top posts
 *
 * @example
 * ```tsx
 * <AnalyticsOverview
 *   summary={filteredSummary}
 * />
 * ```
 */
export function AnalyticsOverview({ summary }: AnalyticsOverviewProps) {
  const [showStats, setShowStats] = useState(true);
  const [showFeaturedPosts, setShowFeaturedPosts] = useState(true);

  return (
    <div className="space-y-4">
      {/* Stats Section - Collapsible */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={TYPOGRAPHY.h3.standard}>Summary Statistics</h3>
            <p className="text-sm text-muted-foreground">
              Overview of blog performance metrics
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStats(!showStats)}
            className="gap-2"
          >
            {showStats ? (
              <>
                Hide <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                View More <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {showStats && (
          <>
            {/* Summary Stats Cards */}
            <DashboardStats columns={4} className="mb-4">
              <DashboardStat
                label="Total Posts"
                value={summary.totalPosts}
                icon={FileText}
              />

              <DashboardStat
                label="Total Views"
                value={summary.totalViews.toLocaleString()}
                icon={Eye}
              />

              <DashboardStat
                label="Total Shares"
                value={summary.totalShares.toLocaleString()}
                icon={Share2}
              />

              <DashboardStat
                label="Total Comments"
                value={summary.totalComments.toLocaleString()}
                icon={MessageSquare}
              />
            </DashboardStats>

            {/* Average Stats with Benchmarks */}
            <DashboardStats columns={4}>
              <DashboardStat
                label="Average Views"
                value={summary.averageViews.toLocaleString()}
                icon={Eye}
              />

              <DashboardStat
                label="Average Shares"
                value={summary.averageShares.toLocaleString()}
                icon={Share2}
              />

              <DashboardStat
                label="Average Comments"
                value={summary.averageComments.toLocaleString()}
                icon={MessageSquare}
              />
            </DashboardStats>
          </>
        )}
      </div>

      {/* Featured Posts Section - Collapsible */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={TYPOGRAPHY.h3.standard}>Featured Posts</h3>
            <p className="text-sm text-muted-foreground">
              Top performing posts by category
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFeaturedPosts(!showFeaturedPosts)}
            className="gap-2"
          >
            {showFeaturedPosts ? (
              <>
                Hide <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                View More <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {showFeaturedPosts && (
          <div className="grid gap-3 md:grid-cols-3">
            {/* Top Post */}
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div>
                  <h4 className={TYPOGRAPHY.label.small}>Top Post</h4>
                  <p className="text-xs text-muted-foreground">
                    Most viewed post overall
                  </p>
                </div>
                {summary.topPost ? (
                  <div className="space-y-2">
                    <Link
                      href={`/blog/${summary.topPost.slug}`}
                      className="font-medium text-sm line-clamp-2 hover:underline block"
                    >
                      {summary.topPost.title}
                    </Link>
                    <p className={TYPOGRAPHY.display.stat}>
                      {summary.topPost.views.toLocaleString()} views
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data</p>
                )}
              </div>
            </Card>

            {/* Most Shared Post */}
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div>
                  <h4 className={TYPOGRAPHY.label.small}>Most Shared</h4>
                  <p className="text-xs text-muted-foreground">
                    Most shared post overall
                  </p>
                </div>
                {summary.mostSharedPost ? (
                  <div className="space-y-2">
                    <Link
                      href={`/blog/${summary.mostSharedPost.slug}`}
                      className="font-medium text-sm line-clamp-2 hover:underline block"
                    >
                      {summary.mostSharedPost.title}
                    </Link>
                    <p className={TYPOGRAPHY.display.stat}>
                      {summary.mostSharedPost.shares.toLocaleString()} shares
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data</p>
                )}
              </div>
            </Card>

            {/* Most Commented Post */}
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div>
                  <h4 className={TYPOGRAPHY.label.small}>Most Commented</h4>
                  <p className="text-xs text-muted-foreground">
                    Most commented post overall
                  </p>
                </div>
                {summary.mostCommentedPost ? (
                  <div className="space-y-2">
                    <Link
                      href={`/blog/${summary.mostCommentedPost.slug}`}
                      className="font-medium text-sm line-clamp-2 hover:underline block"
                    >
                      {summary.mostCommentedPost.title}
                    </Link>
                    <p className={TYPOGRAPHY.display.stat}>
                      {summary.mostCommentedPost.comments.toLocaleString()}{" "}
                      comments
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No data</p>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

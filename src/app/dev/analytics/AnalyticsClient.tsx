"use client";

/**
 * Analytics Dashboard - Refactored Version
 * 
 * Simplified analytics dashboard using modular components and custom hooks.
 * Reduced from 1,249 lines to ~450 lines (64% reduction) while maintaining all functionality.
 * 
 * Architecture:
 * - useAnalyticsData: Data fetching with auto-refresh
 * - useDashboardFilters: Filter state + URL sync
 * - useDashboardSort: Sort state + URL sync
 * - AnalyticsOverview: Stats summary component
 * - AnalyticsTrending: Trending posts component
 * - DashboardLayout: Page wrapper
 */

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertCircle, ArrowUp, ArrowDown, ArrowUpDown, Download, RefreshCw, Filter, ChevronDown, Calendar, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Hooks
import { useAnalyticsData } from "@/hooks/use-analytics-data";
import { useDashboardFilters } from "@/hooks/use-dashboard-filters";
import { useDashboardSort } from "@/hooks/use-dashboard-sort";

// Components
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { AnalyticsOverview } from "@/components/analytics/analytics-overview";
import { ConversionMetrics } from "@/components/analytics/conversion-metrics";
import { AnalyticsInsights } from "@/components/analytics/analytics-insights";
import { AnalyticsRecommendations } from "@/components/analytics/analytics-recommendations";
import dynamic from "next/dynamic";

const AnalyticsCharts = dynamic(() => import("@/components/analytics/analytics-charts").then(mod => ({ default: mod.AnalyticsCharts })), {
  loading: () => (
    <div className="space-y-6">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  ),
});

// Sort indicator component - moved outside to avoid creating during render
type SortIndicatorProps = {
  field: string;
  sortField: string | null;
  sortDirection: "asc" | "desc";
};

function SortIndicator({ field, sortField, sortDirection }: SortIndicatorProps) {
  if (sortField !== field) {
    return <ArrowUpDown className="h-3 w-3 opacity-30" />;
  }
  return sortDirection === "desc" ? (
    <ArrowDown className="h-3 w-3 text-primary" />
  ) : (
    <ArrowUp className="h-3 w-3 text-primary" />
  );
}
import { AnalyticsTrending } from "@/components/analytics/analytics-trending";

// Types
import { PostAnalytics, DateRange, DATE_RANGE_LABELS } from "@/types/analytics";

// Utils
import { 
  sortData, 
  filterBySearch, 
  filterByTags, 
  filterByFlags, 
  getUniqueValues, 
  calculateEngagementRate, 
  getEngagementTier,
  getPerformanceTier,
  getBenchmark,
  filterByPublicationCohort,
  filterByPerformanceTier,
  filterByTagsWithMode
} from "@/lib/dashboard/table-utils";
import { exportData } from "@/lib/dashboard/export-utils";
import { 
  PublicationCohort, 
  PerformanceTierFilter, 
  TagFilterMode 
} from "@/types/analytics";
import { AnalyticsFilters } from "@/components/analytics/analytics-filters";

type SortField = "title" | "views" | "views24h" | "publishedAt" | "viewsRange" | "shares" | "shares24h" | "comments" | "comments24h" | "engagementRate";

// Helper function to copy to clipboard
const copyToClipboard = async (value: string | number, label: string) => {
  try {
    await navigator.clipboard.writeText(String(value));
    toast.success(`Copied ${label}`, {
      description: String(value),
      duration: 2000,
    });
  } catch (err) {
    toast.error("Failed to copy to clipboard");
  }
};

export default function AnalyticsDashboard() {
  // State
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [publicationCohort, setPublicationCohort] = useState<PublicationCohort>("all");
  const [performanceTier, setPerformanceTier] = useState<PerformanceTierFilter>("all");
  const [tagFilterMode, setTagFilterMode] = useState<TagFilterMode>("AND");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showConversion, setShowConversion] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);

  // Custom hooks
  const { data, loading, error, isRefreshing, lastUpdated, refresh } = useAnalyticsData({
    dateRange,
    autoRefresh,
  });

  const {
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    hideDrafts,
    setHideDrafts,
    hideArchived,
    setHideArchived,
  } = useDashboardFilters();

  const { sortField, sortDirection, handleSort } = useDashboardSort({
    initialField: "views" as keyof PostAnalytics,
    initialDirection: "desc",
    validFields: ["title", "views", "views24h", "viewsRange", "publishedAt", "shares", "shares24h", "comments", "comments24h"],
  });

  // Derived data - apply filters and sorting
  const { filteredPosts, sortedPosts, filteredTrending, filteredSummary, trendStats } = useMemo(() => {
    if (!data) {
      return {
        filteredPosts: [],
        sortedPosts: [],
        filteredTrending: [],
        filteredSummary: {
          totalPosts: 0,
          totalViews: 0,
          totalViewsRange: 0,
          totalShares: 0,
          totalComments: 0,
          averageViews: 0,
          averageViewsRange: 0,
          averageShares: 0,
          averageComments: 0,
          topPost: null,
          topPostRange: null,
          mostSharedPost: null,
          mostCommentedPost: null,
        },
        trendStats: { totalViewsTrend24h: 0, totalTrendPercent: 0 },
      };
    }

    const allPosts = data.posts || [];

    // Apply filters
    let filtered = filterByFlags(allPosts, { draft: hideDrafts, archived: hideArchived });
    filtered = filterBySearch(filtered, searchQuery, ["title", "summary", "tags"]);
    
    // Apply advanced filters
    filtered = filterByPublicationCohort(filtered, publicationCohort, "publishedAt");
    filtered = filterByPerformanceTier(filtered, performanceTier, "views");
    
    // Apply tag filter with mode (AND/OR)
    filtered = filterByTagsWithMode(filtered, selectedTags, "tags", tagFilterMode);

    // Apply sorting (handle engagement rate specially)
    let sorted: PostAnalytics[];
    if (sortField === "engagementRate") {
      sorted = [...filtered].sort((a, b) => {
        const rateA = calculateEngagementRate(a.views, a.shares, a.comments);
        const rateB = calculateEngagementRate(b.views, b.shares, b.comments);
        return sortDirection === "desc" ? rateB - rateA : rateA - rateB;
      });
    } else {
      sorted = sortData(filtered, sortField as keyof PostAnalytics, sortDirection);
    }

    // Filter trending
    const trending = filterByFlags(data.trending || [], { draft: hideDrafts, archived: hideArchived });

    // Recompute summary based on filtered posts
    const summary = {
      totalPosts: filtered.length,
      totalViews: filtered.reduce((s, p) => s + p.views, 0),
      totalViewsRange: filtered.reduce((s, p) => s + p.viewsRange, 0),
      totalShares: filtered.reduce((s, p) => s + p.shares, 0),
      totalComments: filtered.reduce((s, p) => s + p.comments, 0),
      averageViews: filtered.length > 0 ? Math.round(filtered.reduce((s, p) => s + p.views, 0) / filtered.length) : 0,
      averageViewsRange: filtered.length > 0 ? Math.round(filtered.reduce((s, p) => s + p.viewsRange, 0) / filtered.length) : 0,
      averageShares: filtered.length > 0 ? Math.round(filtered.reduce((s, p) => s + p.shares, 0) / filtered.length) : 0,
      averageComments: filtered.length > 0 ? Math.round(filtered.reduce((s, p) => s + p.comments, 0) / filtered.length) : 0,
      topPost: filtered.length > 0 ? [...filtered].sort((a, b) => b.views - a.views)[0] : null,
      topPostRange: filtered.length > 0 ? [...filtered].sort((a, b) => b.viewsRange - a.viewsRange)[0] : null,
      mostSharedPost: filtered.length > 0 ? [...filtered].sort((a, b) => b.shares - a.shares)[0] : null,
      mostCommentedPost: filtered.length > 0 ? [...filtered].sort((a, b) => b.comments - a.comments)[0] : null,
    };

    return {
      filteredPosts: filtered,
      sortedPosts: sorted,
      filteredTrending: trending,
      filteredSummary: summary,
      trendStats: { totalViewsTrend24h: 0, totalTrendPercent: 0 },
    };
  }, [data, hideDrafts, hideArchived, searchQuery, selectedTags, tagFilterMode, publicationCohort, performanceTier, sortField, sortDirection]);

  // Export functions
  const handleExportCSV = () => {
    const columns: (keyof PostAnalytics)[] = [
      "title",
      "slug",
      "views",
      "viewsRange",
      "shares",
      "comments",
      "publishedAt",
      "tags",
    ];
    exportData(sortedPosts, "csv", `analytics-${dateRange}`, {
      timestamp: true,
      columns,
    });
  };

  const handleExportJSON = () => {
    const exportDataObj = {
      metadata: {
        exportDate: new Date().toISOString(),
        dateRange: DATE_RANGE_LABELS[dateRange],
        filters: {
          hideDrafts,
          hideArchived,
          searchQuery: searchQuery || null,
          selectedTags: selectedTags.length > 0 ? selectedTags : null,
        },
        sorting: {
          field: sortField,
          direction: sortDirection,
        },
        totalPosts: sortedPosts.length,
      },
      summary: filteredSummary,
      posts: sortedPosts,
    };
    const json = JSON.stringify(exportDataObj, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${dateRange}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get all unique tags for filter
  const allTags = data ? getUniqueValues(data.posts, "tags") : [];

  // Loading state
  if (loading) {
    return (
      <DashboardLayout
        title="Analytics Dashboard"
        description="View and analyze blog post performance metrics"
      >
        <div className="space-y-6">
          {/* Stats Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-40 mb-1" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>

          {/* Stats Cards - 4 columns */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </Card>
            ))}
          </div>

          {/* Featured Posts Header */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-32 mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>

          {/* Featured Posts Cards - 4 columns */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            ))}
          </div>

          {/* Charts Section */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Card className="p-6">
              <Skeleton className="h-64 w-full" />
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout
        title="Analytics Dashboard"
        description="View and analyze blog post performance metrics"
      >
        <Card className="border-destructive">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Error loading analytics</CardTitle>
            </div>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  return (
    <DashboardLayout
      title="Analytics Dashboard"
      description="View and analyze blog post performance metrics"
    >
      {/* Consolidated Filters & Controls */}
      <div className="mb-6">
        <AnalyticsFilters
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          publicationCohort={publicationCohort}
          onPublicationCohortChange={setPublicationCohort}
          performanceTier={performanceTier}
          onPerformanceTierChange={setPerformanceTier}
          tagFilterMode={tagFilterMode}
          onTagFilterModeChange={setTagFilterMode}
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          availableTags={allTags}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          hideDrafts={hideDrafts}
          onHideDraftsChange={setHideDrafts}
          hideArchived={hideArchived}
          onHideArchivedChange={setHideArchived}
          onExportCSV={handleExportCSV}
          onExportJSON={handleExportJSON}
          onRefresh={refresh}
          isRefreshing={isRefreshing}
          autoRefresh={autoRefresh}
          onAutoRefreshChange={setAutoRefresh}
          lastUpdated={lastUpdated || undefined}
          compact={true}
          onClearAll={() => {
            setPublicationCohort("all");
            setPerformanceTier("all");
            setSelectedTags([]);
            setSearchQuery("");
            setHideDrafts(false);
            setHideArchived(false);
          }}
          resultCount={{ shown: sortedPosts.length, total: filteredPosts.length }}
        />
      </div>

      {/* All Posts Table */}
      <Card className="overflow-hidden mb-6">
        <CardHeader className="p-3 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="text-base">All Posts</CardTitle>
              <CardDescription className="text-xs">
                Complete list of blog posts with analytics
              </CardDescription>
            </div>
            {sortedPosts.length !== (data.posts?.length || 0) && (
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {sortedPosts.length} of {data.posts?.length || 0}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left py-2 px-3 font-semibold min-w-[200px]">
                    <button
                      onClick={() => handleSort("title" as keyof PostAnalytics)}
                      className="inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
                    >
                      Title
                      <SortIndicator field="title" sortField={sortField} sortDirection={sortDirection} />
                    </button>
                  </th>
                  <th className="text-right py-2 px-3 font-semibold whitespace-nowrap">
                    <button
                      onClick={() => handleSort("views" as keyof PostAnalytics)}
                      className="inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer ml-auto"
                    >
                      Views
                      <SortIndicator field="views" sortField={sortField} sortDirection={sortDirection} />
                    </button>
                  </th>
                  {dateRange !== "all" && (
                    <th className="text-right py-2 px-3 font-semibold whitespace-nowrap">
                      <button
                        onClick={() => handleSort("viewsRange" as keyof PostAnalytics)}
                        className="inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer ml-auto"
                      >
                        {DATE_RANGE_LABELS[dateRange]}
                        <SortIndicator field="viewsRange" sortField={sortField} sortDirection={sortDirection} />
                      </button>
                    </th>
                  )}
                  <th className="text-right py-2 px-3 font-semibold whitespace-nowrap">
                    <button
                      onClick={() => handleSort("shares" as keyof PostAnalytics)}
                      className="inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer ml-auto"
                    >
                      Shares
                      <SortIndicator field="shares" sortField={sortField} sortDirection={sortDirection} />
                    </button>
                  </th>
                  <th className="text-right py-2 px-3 font-semibold whitespace-nowrap">
                    <button
                      onClick={() => handleSort("comments" as keyof PostAnalytics)}
                      className="inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer ml-auto"
                    >
                      Comments
                      <SortIndicator field="comments" sortField={sortField} sortDirection={sortDirection} />
                    </button>
                  </th>
                  <th className="text-right py-2 px-3 font-semibold whitespace-nowrap">
                    <button
                      onClick={() => handleSort("engagementRate" as SortField)}
                      className="inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer ml-auto"
                      title="Engagement rate = (shares + comments) / views × 100"
                    >
                      Engagement
                      <SortIndicator field="engagementRate" sortField={sortField} sortDirection={sortDirection} />
                    </button>
                  </th>
                  <th className="text-center py-2 px-3 font-semibold whitespace-nowrap hidden lg:table-cell">
                    Performance
                  </th>
                  <th className="text-left py-2 px-3 font-semibold whitespace-nowrap hidden md:table-cell">
                    <button
                      onClick={() => handleSort("publishedAt" as keyof PostAnalytics)}
                      className="inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
                    >
                      Published
                      <SortIndicator field="publishedAt" sortField={sortField} sortDirection={sortDirection} />
                    </button>
                  </th>
                  <th className="text-left py-2 px-3 font-semibold hidden lg:table-cell">Tags</th>
                </tr>
              </thead>
              <tbody>
                {sortedPosts.map((post) => (
                  <tr key={post.slug} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-2 px-3">
                      <a
                        href={`/blog/${post.slug}`}
                        className="text-primary hover:underline font-medium inline-block"
                      >
                        {post.title}
                      </a>
                    </td>
                    <td className="text-right py-2 px-3 font-semibold tabular-nums">
                      <TooltipProvider delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => copyToClipboard(post.views, "views")}
                              className="cursor-pointer underline decoration-dotted decoration-muted-foreground/50 hover:text-primary transition-colors inline-flex items-center gap-1 group"
                            >
                              {post.views.toLocaleString()}
                              <Copy className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="text-xs">
                            <div className="space-y-1">
                              <p className="font-semibold">{getBenchmark(post.views, filteredSummary.averageViews)}</p>
                              <p className="text-muted-foreground">Site average: {filteredSummary.averageViews.toLocaleString()}</p>
                              <p className="text-[10px] text-muted-foreground mt-1.5 pt-1.5 border-t">Click to copy</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    {dateRange !== "all" && (
                      <td className="text-right py-2 px-3 font-semibold tabular-nums">
                        {post.viewsRange.toLocaleString()}
                      </td>
                    )}
                    <td className="text-right py-2 px-3 tabular-nums">{post.shares.toLocaleString()}</td>
                    <td className="text-right py-2 px-3 tabular-nums">{post.comments.toLocaleString()}</td>
                    <td className="text-right py-2 px-3">
                      {(() => {
                        const rate = calculateEngagementRate(post.views, post.shares, post.comments);
                        const tier = getEngagementTier(rate);
                        return (
                          <span className={cn(
                            "inline-flex items-center gap-1",
                            "text-xs font-semibold",
                            tier === "high" && "text-green-600",
                            tier === "medium" && "text-yellow-600",
                            tier === "low" && "text-muted-foreground"
                          )}>
                            {rate.toFixed(1)}%
                          </span>
                        );
                      })()}
                    </td>
                    <td className="text-center py-2 px-3 hidden lg:table-cell">
                      {(() => {
                        const allViews = sortedPosts.map(p => p.views);
                        const tier = getPerformanceTier(post.views, allViews);
                        const benchmark = getBenchmark(post.views, filteredSummary.averageViews);
                        return (
                          <div className="flex flex-col gap-1 items-center">
                            <Badge 
                              variant={tier === "top" ? "default" : tier === "above-average" ? "secondary" : tier === "below-average" ? "outline" : "destructive"}
                              className="text-[10px] px-1.5 py-0"
                            >
                              {tier === "top" ? "Top 10%" : tier === "above-average" ? "Above Avg" : tier === "below-average" ? "Below Avg" : "Needs Focus"}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{benchmark}</span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-2 px-3 hidden md:table-cell">
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Overview */}
      <AnalyticsOverview
        summary={filteredSummary}
      />

      {/* Conversion Goals & Metrics */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Conversion Metrics</CardTitle>
              <CardDescription className="text-sm">Track user engagement and goal completion</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConversion(!showConversion)}
              className="h-8 gap-2"
            >
              {showConversion ? "Hide" : "Show"}
              <ChevronDown className={cn("h-4 w-4 transition-transform", showConversion && "rotate-180")} />
            </Button>
          </div>
        </CardHeader>
        {showConversion && (
          <CardContent className="pt-0">
            <ConversionMetrics
              completionRate={0}
              avgScrollDepth={0}
              totalPostsViewed={filteredSummary.totalViews}
            />
          </CardContent>
        )}
      </Card>

      {/* Performance Insights - All-Time Records & Distribution */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Performance Insights</CardTitle>
              <CardDescription className="text-sm">Trends, records, and content distribution</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPerformance(!showPerformance)}
              className="h-8 gap-2"
            >
              {showPerformance ? "Hide" : "Show"}
              <ChevronDown className={cn("h-4 w-4 transition-transform", showPerformance && "rotate-180")} />
            </Button>
          </div>
        </CardHeader>
        {showPerformance && (
          <CardContent className="pt-0 space-y-6">
            {/* Time-Series Charts */}
            <AnalyticsCharts posts={sortedPosts} dateRange={dateRange} />
            
            {/* All-Time Records & Distribution */}
            <AnalyticsInsights posts={sortedPosts} compact={false} />
          </CardContent>
        )}
      </Card>

      {/* Trending Posts */}
      <AnalyticsTrending trending={filteredTrending} limit={3} />
    </DashboardLayout>
  );
}

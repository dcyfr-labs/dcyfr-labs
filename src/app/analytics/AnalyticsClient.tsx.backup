"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { AlertCircle, TrendingUp, Eye, FileText, Flame, ArrowUpRight, ArrowDownRight, Minus, ArrowUp, ArrowDown, ArrowUpDown, Download, RefreshCw, Filter, ChevronDown, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostAnalytics {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  tags: string[];
  archived?: boolean;
  draft?: boolean;
  views: number;
  views24h: number;
  viewsRange: number;
  shares: number;
  shares24h: number;
  readingTime: {
    words: number;
    minutes: number;
    text: string;
  };
}

interface AnalyticsData {
  success: boolean;
  timestamp: string;
  dateRange: string;
  summary: {
    totalPosts: number;
    totalViews: number;
    totalViews24h: number;
    totalViewsRange: number;
    totalShares: number;
    totalShares24h: number;
    averageViews: number;
    averageViews24h: number;
    averageViewsRange: number;
    averageShares: number;
    averageShares24h: number;
    topPost: {
      slug: string;
      title: string;
      views: number;
      views24h: number;
      viewsRange: number;
      shares: number;
      shares24h: number;
    } | null;
    topPost24h: {
      slug: string;
      title: string;
      views: number;
      views24h: number;
      viewsRange: number;
      shares: number;
      shares24h: number;
    } | null;
    topPostRange: {
      slug: string;
      title: string;
      views: number;
      views24h: number;
      viewsRange: number;
      shares: number;
      shares24h: number;
    } | null;
    mostSharedPost: {
      slug: string;
      title: string;
      views: number;
      shares: number;
      shares24h: number;
    } | null;
    mostSharedPost24h: {
      slug: string;
      title: string;
      views: number;
      shares: number;
      shares24h: number;
    } | null;
  };
  posts: PostAnalytics[];
  trending: PostAnalytics[];
}

type SortField = "title" | "views" | "views24h" | "publishedAt" | "viewsRange" | "shares" | "shares24h";
type SortDirection = "asc" | "desc";
type DateRange = "1" | "7" | "30" | "90" | "all";

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  "1": "1 Day",
  "7": "7 Days",
  "30": "30 Days",
  "90": "90 Days",
  "all": "All Time",
};

export default function AnalyticsDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hideDrafts, setHideDrafts] = useState(false);
  const [hideArchived, setHideArchived] = useState(false);
  const [sortField, setSortField] = useState<SortField>("views");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize state from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Date range
    const urlDateRange = params.get("dateRange");
    if (urlDateRange && ["1", "7", "30", "90", "all"].includes(urlDateRange)) {
      setDateRange(urlDateRange as DateRange);
    }
    
    // Sort
    const urlSortField = params.get("sortField");
    if (urlSortField && ["title", "views", "views24h", "viewsRange", "publishedAt", "shares", "shares24h"].includes(urlSortField)) {
      setSortField(urlSortField as SortField);
    }
    
    const urlSortDirection = params.get("sortDirection");
    if (urlSortDirection && ["asc", "desc"].includes(urlSortDirection)) {
      setSortDirection(urlSortDirection as SortDirection);
    }
    
    // Filters
    if (params.get("hideDrafts") === "true") setHideDrafts(true);
    if (params.get("hideArchived") === "true") setHideArchived(true);
    
    const urlSearch = params.get("search");
    if (urlSearch) setSearchQuery(urlSearch);
    
    const urlTags = params.get("tags");
    if (urlTags) setSelectedTags(urlTags.split(","));
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (dateRange !== "all") params.set("dateRange", dateRange);
    if (sortField !== "views") params.set("sortField", sortField);
    if (sortDirection !== "desc") params.set("sortDirection", sortDirection);
    if (hideDrafts) params.set("hideDrafts", "true");
    if (hideArchived) params.set("hideArchived", "true");
    if (searchQuery) params.set("search", searchQuery);
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","));
    
    const newUrl = params.toString() ? `/analytics?${params.toString()}` : "/analytics";
    router.replace(newUrl, { scroll: false });
  }, [dateRange, sortField, sortDirection, hideDrafts, hideArchived, searchQuery, selectedTags, router]);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }
    
    try {
      // Get API key from environment (injected at build time via NEXT_PUBLIC_)
      // For dev, you can set NEXT_PUBLIC_ADMIN_API_KEY in .env.local
      const apiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY;
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if API key is available
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      const response = await fetch(`/api/analytics?days=${dateRange}`, {
        headers,
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      const analyticsData = await response.json();
      setData(analyticsData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      if (isManualRefresh) {
        setIsRefreshing(false);
      }
      setLoading(false);
    }
  }, [dateRange]);

  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchAnalytics]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-14 md:py-20">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
          <div className="mt-4 flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Summary Cards Skeleton - matches actual layout */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 sm:p-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </Card>
          ))}
        </div>

        {/* Top Posts Cards Skeleton */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 mb-8">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="p-4 sm:p-6">
              <Skeleton className="h-5 w-32 mb-3" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-24" />
            </Card>
          ))}
        </div>

        {/* Trending Posts Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-7 w-40 mb-4" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-3" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Table Skeleton */}
        <div>
          <Skeleton className="h-7 w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-14 md:py-20">
        <Card className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-red-800 dark:text-red-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              Error Loading Analytics
            </CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">
              {error || "Unknown error occurred"}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { posts: allPosts, trending } = data;

  // Calculate tag analytics
  const tagAnalytics = allPosts.reduce<Record<string, {
    postCount: number;
    totalViews: number;
    totalViews24h: number;
    totalViewsRange: number;
    totalShares: number;
    totalShares24h: number;
    avgViews: number;
    avgViews24h: number;
    avgViewsRange: number;
    avgShares: number;
    avgShares24h: number;
    posts: PostAnalytics[];
  }>>((acc, post) => {
    // Skip drafts/archived if filters are active
    if (hideDrafts && post.draft) return acc;
    if (hideArchived && post.archived) return acc;
    
    for (const tag of post.tags) {
      if (!acc[tag]) {
        acc[tag] = {
          postCount: 0,
          totalViews: 0,
          totalViews24h: 0,
          totalViewsRange: 0,
          totalShares: 0,
          totalShares24h: 0,
          avgViews: 0,
          avgViews24h: 0,
          avgViewsRange: 0,
          avgShares: 0,
          avgShares24h: 0,
          posts: [],
        };
      }
      acc[tag].postCount++;
      acc[tag].totalViews += post.views;
      acc[tag].totalViews24h += post.views24h;
      acc[tag].totalViewsRange += post.viewsRange;
      acc[tag].totalShares += post.shares;
      acc[tag].totalShares24h += post.shares24h;
      acc[tag].posts.push(post);
    }
    return acc;
  }, {});

  // Calculate averages for each tag
  Object.keys(tagAnalytics).forEach(tag => {
    const stats = tagAnalytics[tag];
    stats.avgViews = Math.round(stats.totalViews / stats.postCount);
    stats.avgViews24h = Math.round(stats.totalViews24h / stats.postCount);
    stats.avgViewsRange = Math.round(stats.totalViewsRange / stats.postCount);
    stats.avgShares = Math.round(stats.totalShares / stats.postCount);
    stats.avgShares24h = Math.round(stats.totalShares24h / stats.postCount);
  });

  // Sort tags by total views (descending)
  const sortedTagAnalytics = Object.entries(tagAnalytics)
    .sort(([, a], [, b]) => b.totalViews - a.totalViews);

  // Apply client-side filters for drafts/archived posts, search, and tags
  const filteredPosts = allPosts.filter((post) => {
    if (hideDrafts && post.draft) return false;
    if (hideArchived && post.archived) return false;
    
    // Search filter
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Tag filter
    if (selectedTags.length > 0 && !selectedTags.some(tag => post.tags.includes(tag))) {
      return false;
    }
    
    return true;
  });

  // Apply sorting
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "views":
        comparison = a.views - b.views;
        break;
      case "views24h":
        comparison = a.views24h - b.views24h;
        break;
      case "viewsRange":
        comparison = a.viewsRange - b.viewsRange;
        break;
      case "shares":
        comparison = a.shares - b.shares;
        break;
      case "shares24h":
        comparison = a.shares24h - b.shares24h;
        break;
      case "publishedAt":
        comparison = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        break;
    }
    
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const filteredTrending = (trending || []).filter((post) => {
    if (hideDrafts && post.draft) return false;
    if (hideArchived && post.archived) return false;
    return true;
  });

  // Recompute summary based on filtered posts (not sorted) so the dashboard reflects filtering but not sorting
  const filteredSummary = {
    totalPosts: filteredPosts.length,
    totalViews: filteredPosts.reduce((s, p) => s + p.views, 0),
    totalViews24h: filteredPosts.reduce((s, p) => s + p.views24h, 0),
    totalShares: filteredPosts.reduce((s, p) => s + p.shares, 0),
    totalShares24h: filteredPosts.reduce((s, p) => s + p.shares24h, 0),
    averageViews:
      filteredPosts.length > 0
        ? Math.round(filteredPosts.reduce((s, p) => s + p.views, 0) / filteredPosts.length)
        : 0,
    averageViews24h:
      filteredPosts.length > 0
        ? Math.round(filteredPosts.reduce((s, p) => s + p.views24h, 0) / filteredPosts.length)
        : 0,
    averageShares:
      filteredPosts.length > 0
        ? Math.round(filteredPosts.reduce((s, p) => s + p.shares, 0) / filteredPosts.length)
        : 0,
    averageShares24h:
      filteredPosts.length > 0
        ? Math.round(filteredPosts.reduce((s, p) => s + p.shares24h, 0) / filteredPosts.length)
        : 0,
    // Top post should always be based on highest views, regardless of current sort
    topPost:
      filteredPosts.length > 0
        ? [...filteredPosts].sort((a, b) => b.views - a.views)[0]
        : null,
    topPost24h:
      filteredPosts.length > 0
        ? [...filteredPosts].sort((a, b) => b.views24h - a.views24h)[0]
        : null,
    mostSharedPost:
      filteredPosts.length > 0
        ? [...filteredPosts].sort((a, b) => b.shares - a.shares)[0]
        : null,
    mostSharedPost24h:
      filteredPosts.length > 0
        ? [...filteredPosts].sort((a, b) => b.shares24h - a.shares24h)[0]
        : null,
  };

  // Calculate trend indicators
  const totalViewsTrend24h = filteredSummary.totalViews24h;
  const previousTotalViews = filteredSummary.totalViews - totalViewsTrend24h || 1;
  const totalTrendPercent =
    previousTotalViews > 0
      ? Math.round(
          ((totalViewsTrend24h - previousTotalViews) / previousTotalViews) * 100
        )
      : 0;

  // Handle column sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to desc for numeric, asc for text
      setSortField(field);
      setSortDirection(field === "title" ? "asc" : "desc");
    }
  };

  // Render sort indicator
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary" />
    );
  };

  // Export functions
  const exportToCSV = () => {
    const headers = ["Title", "Slug", "Views (All)", `Views (${DATE_RANGE_LABELS[dateRange]})`, "Views (24h)", "Shares (All)", "Shares (24h)", "Published", "Tags", "Archived", "Draft"];
    const rows = sortedPosts.map(post => [
      `"${post.title.replace(/"/g, '""')}"`,
      post.slug,
      post.views,
      post.viewsRange,
      post.views24h,
      post.shares,
      post.shares24h,
      post.publishedAt,
      `"${post.tags.join(", ")}"`,
      post.archived ? "Yes" : "No",
      post.draft ? "Yes" : "No",
    ]);
    
    const csv = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const exportData = {
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
        totalPostsInData: allPosts.length,
      },
      summary: filteredSummary,
      posts: sortedPosts,
    };
    
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-14 md:py-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight">
          Analytics Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and analyze blog post performance metrics.
        </p>
        
        {/* Compact Controls Bar */}
        <div className="mt-4 space-y-2">
          
          {/* Row 1: Search & Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Search posts by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-1.5 text-sm rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />

            <label className="inline-flex items-center text-xs gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hideArchived}
                onChange={(e) => setHideArchived(e.target.checked)}
                className="h-3 w-3 rounded border-muted bg-background cursor-pointer"
              />
              <span>Hide archived</span>
            </label>

            <label className="inline-flex items-center text-xs gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hideDrafts}
                onChange={(e) => setHideDrafts(e.target.checked)}
                className="h-3 w-3 rounded border-muted bg-background cursor-pointer"
              />
              <span>Hide drafts</span>
            </label>
            
            {(searchQuery || selectedTags.length > 0 || hideDrafts || hideArchived) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTags([]);
                  setHideDrafts(false);
                  setHideArchived(false);
                }}
                className="px-2 py-1 text-xs rounded border border-border hover:bg-muted transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Row 2: Dropdowns & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Time Range Select */}
            <Select value={dateRange} onValueChange={(value: DateRange) => setDateRange(value)}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <Calendar className="h-3 w-3 mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["1", "7", "30", "90", "all"] as DateRange[]).map((range) => (
                  <SelectItem key={range} value={range} className="text-xs">
                    {DATE_RANGE_LABELS[range]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Tags Filter Dropdown */}
            {data && (() => {
              const allTags = Array.from(new Set(data.posts.flatMap(p => p.tags))).sort();
              return allTags.length > 0 ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs rounded border border-border hover:bg-muted transition-colors h-8">
                    <Filter className="h-3 w-3" />
                    Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 max-h-[300px] overflow-y-auto">
                    <DropdownMenuLabel className="text-xs">Filter by tags</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {allTags.map((tag) => (
                      <DropdownMenuCheckboxItem
                        key={tag}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={(checked) => {
                          setSelectedTags(prev => 
                            checked 
                              ? [...prev, tag]
                              : prev.filter(t => t !== tag)
                          );
                        }}
                        className="text-xs"
                      >
                        {tag}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null;
            })()}
            
            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs rounded border border-border hover:bg-muted transition-colors h-8">
                <Download className="h-3 w-3" />
                Export
                <ChevronDown className="h-3 w-3 opacity-50" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel className="text-xs">Export format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportToCSV} className="text-xs cursor-pointer">
                  <Download className="h-3 w-3 mr-2" />
                  Download CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToJSON} className="text-xs cursor-pointer">
                  <Download className="h-3 w-3 mr-2" />
                  Download JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="h-4 w-px bg-border" />
            
            {/* Refresh Button */}
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs rounded border border-border hover:bg-muted transition-colors disabled:opacity-50 h-8"
              title="Refresh data"
            >
              <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            
            {/* Auto-refresh Toggle */}
            <label className="inline-flex items-center text-xs gap-1.5 cursor-pointer" title="Auto-refresh every 30 seconds">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-3 w-3 rounded border-muted bg-background cursor-pointer"
              />
              <span className="font-medium">Auto (30s)</span>
            </label>
            
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          {/* Filter Status */}
          {(searchQuery || selectedTags.length > 0 || hideDrafts || hideArchived) && (
            <div className="text-xs text-muted-foreground">
              Showing {sortedPosts.length} of {allPosts.length} posts
              {selectedTags.length > 0 && ` • Tags: ${selectedTags.join(", ")}`}
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-6">
        <Card className="overflow-hidden hover:shadow-md transition-shadow p-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <p className="text-2xl font-bold">{filteredSummary.totalPosts}</p>
          </div>
        </Card>

        <Card className="overflow-hidden hover:shadow-md transition-shadow p-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {filteredSummary.totalViews.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {filteredSummary.totalViews24h.toLocaleString()} in 24h
              </p>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden hover:shadow-md transition-shadow p-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground">Average Views</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {filteredSummary.averageViews.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {filteredSummary.averageViews24h.toLocaleString()} in 24h
              </p>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden hover:shadow-md transition-shadow p-3">
          <div className="space-y-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">24h Trend</CardTitle>
            <div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <p className="text-2xl font-bold">{totalViewsTrend24h.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {totalTrendPercent > 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                ) : totalTrendPercent < 0 ? (
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                ) : (
                  <Minus className="h-3 w-3 text-muted-foreground" />
                )}
                <span
                  className={cn(
                    "text-xs font-semibold",
                    totalTrendPercent > 0 && "text-green-600",
                    totalTrendPercent < 0 && "text-red-600",
                    totalTrendPercent === 0 && "text-muted-foreground"
                  )}
                >
                  {totalTrendPercent > 0 ? "+" : ""}{totalTrendPercent}%
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Posts: All-time vs 24h */}
      <div className="grid gap-3 md:grid-cols-2 mb-6">
        <Card className="overflow-hidden">
          <CardHeader className="p-3 border-b border-border">
            <CardTitle className="text-sm">Top Post (All-time)</CardTitle>
            <CardDescription className="text-xs">Most viewed post overall</CardDescription>
          </CardHeader>
          <CardContent className="p-3">
            {filteredSummary.topPost ? (
              <div>
                <p className="font-medium text-sm sm:text-base line-clamp-2 mb-3">
                  {filteredSummary.topPost.title}
                </p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {filteredSummary.topPost.views.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredSummary.topPost.views24h} views in 24h
                </p>
                <a
                  href={`/blog/${filteredSummary.topPost.slug}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline text-sm mt-3 px-2 py-1.5 -mx-2 rounded touch-target"
                >
                  View post →
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="p-3 border-b border-border">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              Trending (24h)
            </CardTitle>
            <CardDescription className="text-xs">Hottest post today</CardDescription>
          </CardHeader>
          <CardContent className="p-3">
            {filteredSummary.topPost24h ? (
              <div>
                <p className="font-medium text-sm sm:text-base line-clamp-2 mb-3">
                  {filteredSummary.topPost24h.title}
                </p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {filteredSummary.topPost24h.views24h.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredSummary.topPost24h.views.toLocaleString()} total views
                </p>
                <a
                  href={`/blog/${filteredSummary.topPost24h.slug}`}
                  className="inline-flex items-center gap-1 text-primary hover:underline text-sm mt-3 px-2 py-1.5 -mx-2 rounded touch-target"
                >
                  View post →
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tag Analytics */}
      {sortedTagAnalytics.length > 0 && (
        <Card className="mb-6 overflow-hidden">
          <CardHeader className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Tag Analytics</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Performance metrics by content tag
                </CardDescription>
              </div>
              <Filter className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/30">
                  <tr>
                    <th className="text-left py-2.5 px-4 font-semibold">Tag</th>
                    <th className="text-center py-2.5 px-3 font-semibold whitespace-nowrap">Posts</th>
                    <th className="text-right py-2.5 px-3 font-semibold whitespace-nowrap">Total Views</th>
                    {dateRange !== "all" && (
                      <th className="text-right py-2.5 px-3 font-semibold whitespace-nowrap">
                        {DATE_RANGE_LABELS[dateRange]}
                      </th>
                    )}
                    <th className="text-right py-2.5 px-3 font-semibold whitespace-nowrap">24h Views</th>
                    <th className="text-right py-2.5 px-3 font-semibold whitespace-nowrap hidden md:table-cell">Avg Views</th>
                    <th className="text-right py-2.5 px-3 font-semibold whitespace-nowrap hidden lg:table-cell">Avg (24h)</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTagAnalytics.map(([tag, stats], index) => {
                    const isSelected = selectedTags.includes(tag);
                    const trend24h = stats.totalViews24h;
                    const previousViews = stats.totalViews - trend24h || 1;
                    const trendPercent = Math.round(((trend24h - previousViews) / previousViews) * 100);
                    
                    return (
                      <tr
                        key={tag}
                        className={cn(
                          "border-b hover:bg-muted/50 transition-colors cursor-pointer",
                          isSelected && "bg-primary/5"
                        )}
                        onClick={() => {
                          setSelectedTags(prev => 
                            prev.includes(tag) 
                              ? prev.filter(t => t !== tag)
                              : [...prev, tag]
                          );
                        }}
                      >
                        <td className="py-2.5 px-4">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={isSelected ? "default" : "outline"}
                              className="text-xs font-medium"
                            >
                              {tag}
                            </Badge>
                            {index < 3 && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                Top {index + 1}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="text-center py-2.5 px-3 font-medium tabular-nums">
                          {stats.postCount}
                        </td>
                        <td className="text-right py-2.5 px-3 font-bold tabular-nums">
                          {stats.totalViews.toLocaleString()}
                        </td>
                        {dateRange !== "all" && (
                          <td className="text-right py-2.5 px-3 font-semibold tabular-nums">
                            {stats.totalViewsRange.toLocaleString()}
                          </td>
                        )}
                        <td className="text-right py-2.5 px-3">
                          <div className="flex items-center justify-end gap-1.5">
                            {trend24h > 0 && (
                              <Flame className="h-3 w-3 text-orange-500" />
                            )}
                            <span className="font-semibold tabular-nums">
                              {stats.totalViews24h.toLocaleString()}
                            </span>
                            {trendPercent !== 0 && (
                              <span className={cn(
                                "text-xs font-medium",
                                trendPercent > 0 && "text-green-600",
                                trendPercent < 0 && "text-red-600"
                              )}>
                                {trendPercent > 0 ? "+" : ""}{trendPercent}%
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-right py-2.5 px-3 text-muted-foreground tabular-nums hidden md:table-cell">
                          {stats.avgViews.toLocaleString()}
                        </td>
                        <td className="text-right py-2.5 px-3 text-muted-foreground tabular-nums hidden lg:table-cell">
                          {stats.avgViews24h.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {sortedTagAnalytics.length > 5 && (
              <div className="p-3 border-t border-border bg-muted/20 text-center text-xs text-muted-foreground">
                Showing all {sortedTagAnalytics.length} tags • Click any tag to filter posts
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Trending Posts */}
      {filteredTrending && filteredTrending.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-semibold mb-3">Trending Posts</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredTrending.slice(0, 3).map((post) => (
              <Card key={post.slug} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm line-clamp-2 flex-1">
                      {post.title}
                    </h3>
                    <div className="flex flex-col gap-1 shrink-0">
                      {post.views24h > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-1 justify-center text-xs px-1.5 py-0">
                          <Flame className="h-3 w-3" />
                          {post.views24h}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs px-1.5 py-0 text-center">
                        {post.views}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {post.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.readingTime.text}</span>
                    <a
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-primary hover:underline px-2 py-1 -mr-2 rounded"
                    >
                      View →
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Posts Table */}
      <Card className="overflow-hidden mb-6">
        <CardHeader className="p-3 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="text-base">All Posts</CardTitle>
              <CardDescription className="text-xs">
                Complete list of blog posts with analytics
              </CardDescription>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-xs text-muted-foreground">Filtered by:</span>
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="default"
                      className="text-xs cursor-pointer hover:bg-primary/80 transition-colors"
                      onClick={() => {
                        setSelectedTags(prev => prev.filter(t => t !== tag));
                      }}
                    >
                      {tag}
                      <span className="ml-1 hover:text-primary-foreground/80">×</span>
                    </Badge>
                  ))}
                  <button
                    onClick={() => setSelectedTags([])}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
            {sortedPosts.length !== allPosts.length && (
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {sortedPosts.length} of {allPosts.length}
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
                      onClick={() => handleSort("title")}
                      className="inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
                    >
                      Title
                      <SortIndicator field="title" />
                    </button>
                  </th>
                  <th className="text-right py-2 px-3 font-semibold whitespace-nowrap">
                    <button
                      onClick={() => handleSort("views")}
                      className="inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer ml-auto"
                    >
                      Views (All)
                      <SortIndicator field="views" />
                    </button>
                  </th>
                  {dateRange !== "all" && (
                    <th className="text-right py-2 px-3 font-semibold whitespace-nowrap">
                      <button
                        onClick={() => handleSort("viewsRange")}
                        className="inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer ml-auto"
                      >
                        {DATE_RANGE_LABELS[dateRange]}
                        <SortIndicator field="viewsRange" />
                      </button>
                    </th>
                  )}
                  <th className="text-right py-2 px-3 font-semibold whitespace-nowrap">
                    <button
                      onClick={() => handleSort("views24h")}
                      className="inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer ml-auto"
                    >
                      Views (24h)
                      <SortIndicator field="views24h" />
                    </button>
                  </th>
                  <th className="text-right py-2 px-3 font-semibold whitespace-nowrap">
                    <button
                      onClick={() => handleSort("shares")}
                      className="inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer ml-auto"
                    >
                      Shares (All)
                      <SortIndicator field="shares" />
                    </button>
                  </th>
                  <th className="text-right py-2 px-3 font-semibold whitespace-nowrap">
                    <button
                      onClick={() => handleSort("shares24h")}
                      className="inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer ml-auto"
                    >
                      Shares (24h)
                      <SortIndicator field="shares24h" />
                    </button>
                  </th>
                  <th className="text-left py-2 px-3 font-semibold whitespace-nowrap hidden md:table-cell">
                    <button
                      onClick={() => handleSort("publishedAt")}
                      className="inline-flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
                    >
                      Published
                      <SortIndicator field="publishedAt" />
                    </button>
                  </th>
                  <th className="text-left py-2 px-3 font-semibold hidden lg:table-cell">Tags</th>
                </tr>
              </thead>
              <tbody>
                {sortedPosts.map((post) => (
                  <tr
                    key={post.slug}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-2 px-3">
                      <a
                        href={`/blog/${post.slug}`}
                        className="text-primary hover:underline font-medium inline-block"
                      >
                        {post.title}
                      </a>
                    </td>
                    <td className="text-right py-2 px-3 font-semibold tabular-nums">
                      {post.views.toLocaleString()}
                    </td>
                    {dateRange !== "all" && (
                      <td className="text-right py-2 px-3 font-semibold tabular-nums">
                        {post.viewsRange.toLocaleString()}
                      </td>
                    )}
                    <td className="text-right py-2 px-3">
                      <div className="flex items-center justify-end gap-1">
                        {post.views24h > 0 && (
                          <Flame className="h-3 w-3 text-orange-500" />
                        )}
                        <span className="font-medium tabular-nums">{post.views24h.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="text-right py-2 px-3 font-semibold tabular-nums">
                      {post.shares.toLocaleString()}
                    </td>
                    <td className="text-right py-2 px-3 font-semibold tabular-nums">
                      {post.shares24h.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-muted-foreground hidden md:table-cell whitespace-nowrap">
                      {new Date(post.publishedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-2 px-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0">
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                            +{post.tags.length - 2}
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
    </div>
  );
}

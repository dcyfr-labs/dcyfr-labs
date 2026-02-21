/**
 * Analytics Export Component
 *
 * Enhanced export functionality with multiple format options and customization.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Settings,
} from "lucide-react";
import { PostAnalytics, AnalyticsSummary } from "@/types/analytics";
import { SPACING } from "@/lib/design-tokens";
import { toast } from "sonner";

interface AnalyticsExportProps {
  posts: PostAnalytics[];
  summary: AnalyticsSummary;
  dateRange: string;
  filters: {
    searchQuery?: string;
    selectedTags?: string[];
    hideDrafts?: boolean;
    hideArchived?: boolean;
  };
}

type ExportFormat = "csv" | "json" | "markdown";

interface ExportOptions {
  includeMetadata: boolean;
  includeSummary: boolean;
  includeFilters: boolean;
  columns: {
    title: boolean;
    slug: boolean;
    views: boolean;
    shares: boolean;
    comments: boolean;
    engagement: boolean;
    publishedAt: boolean;
    tags: boolean;
  };
}

export function AnalyticsExport({
  posts,
  summary,
  dateRange,
  filters,
}: AnalyticsExportProps) {
  const [options, setOptions] = useState<ExportOptions>({
    includeMetadata: true,
    includeSummary: true,
    includeFilters: true,
    columns: {
      title: true,
      slug: true,
      views: true,
      shares: true,
      comments: true,
      engagement: true,
      publishedAt: true,
      tags: true,
    },
  });

  const toggleColumn = (column: keyof ExportOptions["columns"]) => {
    setOptions((prev) => ({
      ...prev,
      columns: {
        ...prev.columns,
        [column]: !prev.columns[column],
      },
    }));
  };

  const exportCSV = () => {
    const headers: string[] = [];
    const columnMap: Array<keyof ExportOptions["columns"]> = [];

    // Build headers based on selected columns
    if (options.columns.title) {
      headers.push("Title");
      columnMap.push("title");
    }
    if (options.columns.slug) {
      headers.push("Slug");
      columnMap.push("slug");
    }
    if (options.columns.views) {
      headers.push("Views");
      columnMap.push("views");
    }
    if (options.columns.shares) {
      headers.push("Shares");
      columnMap.push("shares");
    }
    if (options.columns.comments) {
      headers.push("Comments");
      columnMap.push("comments");
    }
    if (options.columns.engagement) {
      headers.push("Engagement Rate");
      columnMap.push("engagement");
    }
    if (options.columns.publishedAt) {
      headers.push("Published Date");
      columnMap.push("publishedAt");
    }
    if (options.columns.tags) {
      headers.push("Tags");
      columnMap.push("tags");
    }

    // Build CSV content
    let csv = headers.join(",") + "\n";

    posts.forEach((post) => {
      const row: string[] = [];
      columnMap.forEach((col) => {
        if (col === "title") {
          row.push(`"${post.title.replace(/"/g, '""')}"`);
        } else if (col === "slug") {
          row.push(post.slug);
        } else if (col === "views") {
          row.push(String(post.views));
        } else if (col === "shares") {
          row.push(String(post.shares));
        } else if (col === "comments") {
          row.push(String(post.comments));
        } else if (col === "engagement") {
          const rate =
            post.views > 0
              ? (((post.shares + post.comments) / post.views) * 100).toFixed(2)
              : "0.00";
          row.push(rate);
        } else if (col === "publishedAt") {
          row.push(new Date(post.publishedAt).toISOString().split("T")[0]);
        } else if (col === "tags") {
          row.push(`"${post.tags.join(", ")}"`);
        }
      });
      csv += row.join(",") + "\n";
    });

    // Add metadata if enabled
    if (options.includeMetadata || options.includeSummary) {
      csv += "\n\n";

      if (options.includeMetadata) {
        csv += "Export Metadata\n";
        csv += `Export Date,${new Date().toISOString()}\n`;
        csv += `Date Range,${dateRange}\n`;
        csv += `Total Posts,${posts.length}\n`;
      }

      if (options.includeSummary) {
        csv += "\nSummary Statistics\n";
        csv += `Total Views,${summary.totalViews}\n`;
        csv += `Total Shares,${summary.totalShares}\n`;
        csv += `Total Comments,${summary.totalComments}\n`;
        csv += `Average Views,${summary.averageViews}\n`;
        csv += `Average Shares,${summary.averageShares}\n`;
        csv += `Average Comments,${summary.averageComments}\n`;
      }
    }

    const timestamp = Date.now();
    downloadFile(csv, `analytics-${dateRange}-${timestamp}.csv`, "text/csv");
    toast.success("CSV exported successfully");
  };

  const exportJSON = () => {
    const data: any = {
      posts: posts.map((post) => {
        const exportPost: any = {};
        if (options.columns.title) exportPost.title = post.title;
        if (options.columns.slug) exportPost.slug = post.slug;
        if (options.columns.views) exportPost.views = post.views;
        if (options.columns.shares) exportPost.shares = post.shares;
        if (options.columns.comments) exportPost.comments = post.comments;
        if (options.columns.engagement) {
          exportPost.engagementRate =
            post.views > 0
              ? Number(
                  (((post.shares + post.comments) / post.views) * 100).toFixed(
                    2
                  )
                )
              : 0;
        }
        if (options.columns.publishedAt)
          exportPost.publishedAt = post.publishedAt;
        if (options.columns.tags) exportPost.tags = post.tags;
        return exportPost;
      }),
    };

    if (options.includeMetadata) {
      data.metadata = {
        exportDate: new Date().toISOString(),
        dateRange,
        totalPosts: posts.length,
      };
    }

    if (options.includeSummary) {
      data.summary = summary;
    }

    if (
      options.includeFilters &&
      (filters.searchQuery || filters.selectedTags?.length)
    ) {
      data.filters = filters;
    }

    const json = JSON.stringify(data, null, 2);
    const timestamp = Date.now();
    downloadFile(
      json,
      `analytics-${dateRange}-${timestamp}.json`,
      "application/json"
    );
    toast.success("JSON exported successfully");
  };

  const exportMarkdown = () => {
    let md = `# Analytics Export\n\n`;

    if (options.includeMetadata) {
      md += `**Export Date:** ${new Date().toLocaleString()}\n`;
      md += `**Date Range:** ${dateRange}\n`;
      md += `**Total Posts:** ${posts.length}\n\n`;
    }

    if (options.includeSummary) {
      md += `## Summary Statistics\n\n`;
      md += `- **Total Views:** ${summary.totalViews.toLocaleString()}\n`;
      md += `- **Total Shares:** ${summary.totalShares.toLocaleString()}\n`;
      md += `- **Total Comments:** ${summary.totalComments.toLocaleString()}\n`;
      md += `- **Average Views:** ${summary.averageViews.toLocaleString()}\n`;
      md += `- **Average Shares:** ${summary.averageShares.toLocaleString()}\n`;
      md += `- **Average Comments:** ${summary.averageComments.toLocaleString()}\n\n`;
    }

    md += `## Posts\n\n`;
    md += `| `;

    const headers: string[] = [];
    if (options.columns.title) headers.push("Title");
    if (options.columns.views) headers.push("Views");
    if (options.columns.shares) headers.push("Shares");
    if (options.columns.comments) headers.push("Comments");
    if (options.columns.engagement) headers.push("Engagement");
    if (options.columns.publishedAt) headers.push("Published");

    md += headers.join(" | ") + " |\n";
    md += `| ${headers.map(() => "---").join(" | ")} |\n`;

    posts.forEach((post) => {
      const row: string[] = [];
      if (options.columns.title) row.push(post.title);
      if (options.columns.views) row.push(post.views.toLocaleString());
      if (options.columns.shares) row.push(post.shares.toLocaleString());
      if (options.columns.comments) row.push(post.comments.toLocaleString());
      if (options.columns.engagement) {
        const rate =
          post.views > 0
            ? (((post.shares + post.comments) / post.views) * 100).toFixed(1)
            : "0.0";
        row.push(`${rate}%`);
      }
      if (options.columns.publishedAt) {
        row.push(new Date(post.publishedAt).toLocaleDateString());
      }
      md += `| ${row.join(" | ")} |\n`;
    });

    const timestamp = Date.now();
    downloadFile(md, `analytics-${dateRange}-${timestamp}.md`, "text/markdown");
    toast.success("Markdown exported successfully");
  };

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`gap-${SPACING.sm}`}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuItem onClick={exportCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportJSON}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportMarkdown}>
          <FileText className="h-4 w-4 mr-2" />
          Export as Markdown
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className={`flex items-center gap-${SPACING.sm}`}>
          <Settings className="h-3 w-3" />
          Options
        </DropdownMenuLabel>

        <DropdownMenuCheckboxItem
          checked={options.includeMetadata}
          onCheckedChange={() =>
            setOptions((prev) => ({
              ...prev,
              includeMetadata: !prev.includeMetadata,
            }))
          }
        >
          Include Metadata
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={options.includeSummary}
          onCheckedChange={() =>
            setOptions((prev) => ({
              ...prev,
              includeSummary: !prev.includeSummary,
            }))
          }
        >
          Include Summary
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs">Columns</DropdownMenuLabel>

        <div className="max-h-48 overflow-y-auto">
          <DropdownMenuCheckboxItem
            checked={options.columns.title}
            onCheckedChange={() => toggleColumn("title")}
          >
            Title
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={options.columns.views}
            onCheckedChange={() => toggleColumn("views")}
          >
            Views
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={options.columns.shares}
            onCheckedChange={() => toggleColumn("shares")}
          >
            Shares
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={options.columns.comments}
            onCheckedChange={() => toggleColumn("comments")}
          >
            Comments
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={options.columns.engagement}
            onCheckedChange={() => toggleColumn("engagement")}
          >
            Engagement Rate
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={options.columns.publishedAt}
            onCheckedChange={() => toggleColumn("publishedAt")}
          >
            Published Date
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={options.columns.tags}
            onCheckedChange={() => toggleColumn("tags")}
          >
            Tags
          </DropdownMenuCheckboxItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

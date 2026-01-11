/**
 * Analytics Insights Component
 *
 * Displays key insights and all-time records including:
 * - Highest single-day views
 * - Best performing tags
 * - Most engaged posts
 * - Content distribution analysis
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
import { DashboardStats, DashboardStat } from "@/components/dashboard";
import {
  Trophy,
  TrendingUp,
  Tag as TagIcon,
  Zap,
  Target,
  Award,
} from "lucide-react";
import { PostAnalytics } from "@/types/analytics";
import Link from "next/link";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  ANIMATION,
  TYPOGRAPHY,
  SEMANTIC_COLORS,
  SPACING,
} from "@/lib/design-tokens";

interface AnalyticsInsightsProps {
  /** All posts for analysis */
  posts: PostAnalytics[];

  /** Show compact view */
  compact?: boolean;
}

interface TagPerformance {
  tag: string;
  postCount: number;
  totalViews: number;
  avgViews: number;
  totalShares: number;
  totalComments: number;
  engagementRate: number;
}

export function AnalyticsInsights({
  posts,
  compact = false,
}: AnalyticsInsightsProps) {
  const insights = useMemo(() => {
    if (posts.length === 0) {
      return {
        highestSingleDayViews: { post: null, views: 0 },
        bestPerformingTag: {
          tag: null,
          metrics: null as TagPerformance | null,
        },
        mostEngagedPost: { post: null, rate: 0 },
        topViewGrowth: { post: null, growth: 0 },
        tagPerformances: [] as TagPerformance[],
        viewDistribution: {
          under100: 0,
          under500: 0,
          under1000: 0,
          under5000: 0,
          over5000: 0,
        },
      };
    }

    // Find highest single-day views
    const highestViews24h = posts.reduce(
      (max, post) => (post.views24h > max.views24h ? post : max),
      posts[0]
    );

    // Calculate tag performance
    const tagStats = new Map<
      string,
      {
        posts: PostAnalytics[];
        totalViews: number;
        totalShares: number;
        totalComments: number;
      }
    >();

    posts.forEach((post) => {
      post.tags.forEach((tag) => {
        const existing = tagStats.get(tag) || {
          posts: [],
          totalViews: 0,
          totalShares: 0,
          totalComments: 0,
        };
        existing.posts.push(post);
        existing.totalViews += post.views;
        existing.totalShares += post.shares;
        existing.totalComments += post.comments;
        tagStats.set(tag, existing);
      });
    });

    const tagPerformances: TagPerformance[] = Array.from(tagStats.entries())
      .map(([tag, stats]) => ({
        tag,
        postCount: stats.posts.length,
        totalViews: stats.totalViews,
        avgViews: Math.round(stats.totalViews / stats.posts.length),
        totalShares: stats.totalShares,
        totalComments: stats.totalComments,
        engagementRate:
          stats.totalViews > 0
            ? ((stats.totalShares + stats.totalComments) / stats.totalViews) *
              100
            : 0,
      }))
      .sort((a, b) => b.avgViews - a.avgViews);

    const bestTag = tagPerformances[0] || null;

    // Find most engaged post (highest engagement rate)
    const postsWithEngagement = posts
      .map((post) => ({
        post,
        rate:
          post.views > 0
            ? ((post.shares + post.comments) / post.views) * 100
            : 0,
      }))
      .sort((a, b) => b.rate - a.rate);

    const mostEngaged = postsWithEngagement[0];

    // Find post with highest 24h growth
    const postsWithGrowth = posts
      .map((post) => ({
        post,
        growth: post.views > 0 ? (post.views24h / post.views) * 100 : 0,
      }))
      .sort((a, b) => b.growth - a.growth);

    const topGrowth = postsWithGrowth[0];

    // View distribution
    const distribution = posts.reduce(
      (acc, post) => {
        if (post.views < 100) acc.under100++;
        else if (post.views < 500) acc.under500++;
        else if (post.views < 1000) acc.under1000++;
        else if (post.views < 5000) acc.under5000++;
        else acc.over5000++;
        return acc;
      },
      { under100: 0, under500: 0, under1000: 0, under5000: 0, over5000: 0 }
    );

    return {
      highestSingleDayViews: {
        post: highestViews24h,
        views: highestViews24h.views24h,
      },
      bestPerformingTag: { tag: bestTag?.tag || null, metrics: bestTag },
      mostEngagedPost: {
        post: mostEngaged?.post || null,
        rate: mostEngaged?.rate || 0,
      },
      topViewGrowth: {
        post: topGrowth?.post || null,
        growth: topGrowth?.growth || 0,
      },
      tagPerformances: tagPerformances.slice(0, 10),
      viewDistribution: distribution,
    };
  }, [posts]);

  if (compact) {
    return (
      <DashboardStats columns={4} className="mb-6">
        <DashboardStat
          label="Highest Single Day"
          value={insights.highestSingleDayViews.views.toLocaleString()}
          secondaryValue={
            insights.highestSingleDayViews.post?.title.slice(0, 30) + "..." ||
            "N/A"
          }
          icon={Zap}
        />

        <DashboardStat
          label="Best Performing Tag"
          value={insights.bestPerformingTag.tag || "N/A"}
          secondaryValue={
            insights.bestPerformingTag.metrics
              ? `${insights.bestPerformingTag.metrics.avgViews.toLocaleString()} avg views`
              : "N/A"
          }
          icon={TagIcon}
        />

        <DashboardStat
          label="Most Engaged Post"
          value={`${insights.mostEngagedPost.rate.toFixed(1)}%`}
          secondaryValue={
            insights.mostEngagedPost.post?.title.slice(0, 30) + "..." || "N/A"
          }
          icon={Target}
        />

        <DashboardStat
          label="Top 24h Growth"
          value={`${insights.topViewGrowth.growth.toFixed(1)}%`}
          secondaryValue={
            insights.topViewGrowth.post?.title.slice(0, 30) + "..." || "N/A"
          }
          icon={TrendingUp}
        />
      </DashboardStats>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* All-Time Records */}
      <Card className="md:col-span-1">
        <CardHeader className="pb-3">
          <div className={`flex items-center gap-${SPACING.sm}`}>
            {}
            <Trophy className="h-4 w-4 text-warning" />
            <div>
              <CardTitle className="text-sm">All-Time Records</CardTitle>
              <CardDescription className="text-xs">
                Top performing content
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className={`space-y-${SPACING.md}`}>
          {/* Highest Single Day Views */}
          <div className={`space-y-${SPACING.sm}`}>
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-${SPACING.sm}`}>
                {}
                <Zap className="h-4 w-4 text-muted-foreground" />
                <span className={TYPOGRAPHY.label.xs}>
                  Highest Single-Day Views
                </span>
              </div>
              <Badge variant="default" className="text-xs">
                {insights.highestSingleDayViews.views.toLocaleString()} views
              </Badge>
            </div>
            {insights.highestSingleDayViews.post && (
              <Link
                href={`/blog/${insights.highestSingleDayViews.post.slug}`}
                className="text-sm text-muted-foreground hover:text-primary line-clamp-2 block"
              >
                {insights.highestSingleDayViews.post.title}
              </Link>
            )}
          </div>

          {/* Most Engaged Post */}
          <div className={`space-y-${SPACING.sm} pt-${SPACING.sm} border-t`}>
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-${SPACING.sm}`}>
                {}
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className={TYPOGRAPHY.label.xs}>Most Engaged Post</span>
              </div>
              <Badge variant="default" className="text-xs">
                {insights.mostEngagedPost.rate.toFixed(1)}% rate
              </Badge>
            </div>
            {insights.mostEngagedPost.post && (
              <Link
                href={`/blog/${insights.mostEngagedPost.post.slug}`}
                className="text-sm text-muted-foreground hover:text-primary line-clamp-2 block"
              >
                {insights.mostEngagedPost.post.title}
              </Link>
            )}
          </div>

          {/* Top 24h Growth */}
          <div className={`space-y-${SPACING.sm} pt-${SPACING.sm} border-t`}>
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-${SPACING.sm}`}>
                {}
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className={TYPOGRAPHY.label.xs}>Top 24h Growth</span>
              </div>
              <Badge variant="default" className="text-xs">
                {insights.topViewGrowth.growth.toFixed(1)}% of total
              </Badge>
            </div>
            {insights.topViewGrowth.post && (
              <Link
                href={`/blog/${insights.topViewGrowth.post.slug}`}
                className="text-sm text-muted-foreground hover:text-primary line-clamp-2 block"
              >
                {insights.topViewGrowth.post.title}
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tag Performance */}
      <Card className="md:col-span-1">
        <CardHeader className="pb-3">
          <div className={`flex items-center gap-${SPACING.sm}`}>
            <TagIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-sm">Top Performing Tags</CardTitle>
              <CardDescription className="text-xs">
                Ranked by avg views
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`space-y-${SPACING.md}`}>
            {insights.tagPerformances.slice(0, 5).map((tag, index) => (
              <div key={tag.tag} className="flex items-center justify-between">
                <div
                  className={`flex items-center gap-${SPACING.md} flex-1 min-w-0`}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-6 h-6 rounded-full bg-muted",
                      TYPOGRAPHY.label.xs
                    )}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`flex items-center gap-${SPACING.sm}`}>
                      <Badge variant="outline" className="text-xs">
                        {tag.tag}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {tag.postCount} post{tag.postCount > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={TYPOGRAPHY.label.small}>
                    {tag.avgViews.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">avg views</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Distribution */}
      <Card className="md:col-span-1">
        <CardHeader className="pb-3">
          <div className={`flex items-center gap-${SPACING.sm}`}>
            <Award className="h-4 w-4 text-muted-foreground" />
            <div>
              <CardTitle className="text-sm">Content Distribution</CardTitle>
              <CardDescription className="text-xs">
                Posts by view count
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`space-y-${SPACING.md}`}>
            {[
              {
                label: "5,000+ views",
                count: insights.viewDistribution.over5000,
                color: SEMANTIC_COLORS.status.success,
              },
              {
                label: "1,000-5,000 views",
                count: insights.viewDistribution.under5000,
                color: SEMANTIC_COLORS.status.info,
              },
              {
                label: "500-1,000 views",
                count: insights.viewDistribution.under1000,
                color: SEMANTIC_COLORS.status.warning,
              },
              {
                label: "100-500 views",
                count: insights.viewDistribution.under500,
                color: SEMANTIC_COLORS.status.inProgress,
              },
              {
                label: "Under 100 views",
                count: insights.viewDistribution.under100,
                color: SEMANTIC_COLORS.status.error,
              },
            ].map((bucket) => {
              const percentage =
                posts.length > 0 ? (bucket.count / posts.length) * 100 : 0;
              return (
                <div key={bucket.label} className={`space-y-${SPACING["1.5"]}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {bucket.label}
                    </span>
                    <span className="font-semibold">
                      {bucket.count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-appearance",
                        bucket.color,
                        ANIMATION.duration.slow
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

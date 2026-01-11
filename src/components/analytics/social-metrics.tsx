/**
 * Social Media Metrics Component
 *
 * Displays social media referral tracking and external platform analytics.
 * Shows referral counts from Twitter/X, DEV, LinkedIn, Reddit, Hacker News, GitHub, and other sources.
 */

"use client";

import { useState } from "react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  ChevronUp,
  Twitter,
  Code2,
  Linkedin,
  Github,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import { DashboardStats, DashboardStat } from "@/components/dashboard";
import { TYPOGRAPHY, SEMANTIC_COLORS } from "@/lib/design-tokens";
import { getPlatformDisplayName } from "@/lib/analytics";
import type { PostAnalytics } from "@/types/analytics";

interface SocialMetricsProps {
  /** List of posts to aggregate social metrics from */
  posts: PostAnalytics[];
  /** Whether to show the section collapsed by default */
  defaultCollapsed?: boolean;
}

/**
 * Social media metrics section with referral tracking and platform analytics
 *
 * @example
 * ```tsx
 * <SocialMetrics
 *   posts={sortedPosts}
 *   defaultCollapsed={false}
 * />
 * ```
 */
export function SocialMetrics({
  posts,
  defaultCollapsed = false,
}: SocialMetricsProps) {
  const [showMetrics, setShowMetrics] = useState(!defaultCollapsed);

  // Platform icons mapping
  const platformIcons: Record<string, typeof Twitter> = {
    twitter: Twitter,
    dev: Code2,
    linkedin: Linkedin,
    github: Github,
    reddit: ExternalLink,
    hackernews: TrendingUp,
    other: ExternalLink,
  };

  // Mock data for now - will be replaced with real data from API
  // TODO: Fetch actual referral counts from /api/analytics/referral for each post
  const mockReferrals = {
    twitter: 0,
    dev: 0,
    linkedin: 0,
    reddit: 0,
    hackernews: 0,
    github: 0,
    other: 0,
  };

  const totalReferrals = Object.values(mockReferrals).reduce(
    (sum, count) => sum + count,
    0
  );

  // Get top referral platforms
  const topPlatforms = Object.entries(mockReferrals)
    .filter(([_, count]) => count > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={TYPOGRAPHY.h3.standard}>Social Media Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Referral tracking and external platform metrics
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMetrics(!showMetrics)}
          className="gap-2"
        >
          {showMetrics ? (
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

      {showMetrics && (
        <div className="space-y-4">
          {/* Summary Stats */}
          <DashboardStats columns={4}>
            <DashboardStat
              label="Total Referrals"
              value={totalReferrals.toLocaleString()}
              icon={TrendingUp}
            />

            {topPlatforms.slice(0, 3).map(([platform, count]) => {
              const Icon = platformIcons[platform] || ExternalLink;
              return (
                <DashboardStat
                  key={platform}
                  label={getPlatformDisplayName(platform as any)}
                  value={count.toLocaleString()}
                  icon={Icon}
                />
              );
            })}
          </DashboardStats>

          {/* Platform Breakdown */}
          {totalReferrals > 0 && (
            <Card className="p-4">
              <div className="space-y-3">
                <div>
                  <h4 className={TYPOGRAPHY.label.small}>Referral Sources</h4>
                  <p className="text-xs text-muted-foreground">
                    Traffic sources from social media platforms
                  </p>
                </div>

                <div className="space-y-2">
                  {Object.entries(mockReferrals)
                    .filter(([_, count]) => count > 0)
                    .sort(([_, a], [__, b]) => b - a)
                    .map(([platform, count]) => {
                      const Icon = platformIcons[platform] || ExternalLink;
                      const percentage =
                        totalReferrals > 0 ? (count / totalReferrals) * 100 : 0;
                      return (
                        <div
                          key={platform}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {getPlatformDisplayName(platform as any)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {percentage.toFixed(1)}%
                            </span>
                            <span className="text-sm font-semibold tabular-nums">
                              {count.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </Card>
          )}

          {/* No Data State */}
          {totalReferrals === 0 && (
            <Card className="p-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">
                  No social media referrals yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Share your posts on social media to start tracking referrals
                </p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

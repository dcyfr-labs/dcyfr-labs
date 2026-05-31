/**
 * Social Media Metrics Component
 *
 * Displays social media referral tracking and external platform analytics.
 * Shows referral counts from Twitter/X, DEV, LinkedIn, Reddit, Hacker News, GitHub, and other sources.
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, XIcon, Code2, ExternalLink, TrendingUp } from 'lucide-react';
import { Github, Linkedin } from '@/components/ui/brand-icons';
import { DashboardStats, DashboardStat } from '@/components/dashboard';
import { TYPOGRAPHY, SPACING } from '@/lib/design-tokens';
import { getPlatformDisplayName } from '@/lib/analytics';
import { useAggregateReferralCounts } from '@/hooks/use-referral-tracking';
import type { PostAnalytics } from '@/types/analytics';

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
export function SocialMetrics({ posts, defaultCollapsed = false }: SocialMetricsProps) {
  const [showMetrics, setShowMetrics] = useState(!defaultCollapsed);

  // Platform icons mapping
  const platformIcons: Record<string, typeof XIcon> = {
    twitter: XIcon,
    dev: Code2,
    linkedin: Linkedin,
    github: Github,
    reddit: ExternalLink,
    hackernews: TrendingUp,
    other: ExternalLink,
  };

  // Fetch real referral counts for the posts currently in view and aggregate
  // them per platform. Re-fetches only when the set of post ids changes.
  const { data: referralData, loading: referralsLoading } = useAggregateReferralCounts(
    posts.map((post) => post.id)
  );
  const referrals = referralData?.referrals ?? {};
  const totalReferrals = referralData?.total ?? 0;

  // Get top referral platforms
  const topPlatforms = Object.entries(referrals)
    .filter(([_, count]) => count > 0)
    .sort(([_, a], [__, b]) => b - a)
    .slice(0, 4);

  return (
    <div className={SPACING.content}>
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
        <div className={SPACING.content}>
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
          {!referralsLoading && totalReferrals > 0 && (
            <Card className="p-4">
              <div className={SPACING.content}>
                <div>
                  <h4 className={TYPOGRAPHY.label.small}>Referral Sources</h4>
                  <p className="text-xs text-muted-foreground">
                    Traffic sources from social media platforms
                  </p>
                </div>

                <div className={SPACING.compact}>
                  {Object.entries(referrals)
                    .filter(([_, count]) => count > 0)
                    .sort(([_, a], [__, b]) => b - a)
                    .map(([platform, count]) => {
                      const Icon = platformIcons[platform] || ExternalLink;
                      const percentage = totalReferrals > 0 ? (count / totalReferrals) * 100 : 0;
                      return (
                        <div key={platform} className="flex items-center justify-between">
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

          {/* Loading State */}
          {referralsLoading && (
            <Card className="p-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <TrendingUp className="h-8 w-8 animate-pulse text-muted-foreground/50" />
                <p className="text-sm font-medium text-muted-foreground">Loading referral data…</p>
              </div>
            </Card>
          )}

          {/* No Data State */}
          {!referralsLoading && totalReferrals === 0 && (
            <Card className="p-4 text-center">
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

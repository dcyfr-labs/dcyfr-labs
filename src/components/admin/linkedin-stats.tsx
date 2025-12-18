'use client';

import { useState, useEffect } from 'react';
import { SPACING, TYPOGRAPHY, SEMANTIC_COLORS } from '@/lib/design-tokens';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  RefreshCw,
  Calendar,
  Activity,
  Target
} from 'lucide-react';

interface LinkedInMetrics {
  followerCount: number;
  followerGrowth: number;
  totalPosts: number;
  totalImpressions: number;
  totalEngagements: number;
  engagementRate: number;
  recentPosts: {
    id: string;
    text: string;
    publishedAt: string;
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
  }[];
  timeRange: string;
  lastUpdated: string;
}

/**
 * LinkedIn Analytics Dashboard
 * 
 * Displays comprehensive LinkedIn performance metrics including:
 * - Follower growth and engagement statistics
 * - Post performance analytics
 * - Recent post metrics with engagement breakdowns
 * - Trend analysis and insights
 */
export function LinkedInStats() {
  const [metrics, setMetrics] = useState<LinkedInMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/linkedin/analytics', {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }

      const data = await response.json();
      setMetrics(data);
      setLastRefresh(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatNumber = (num: number | undefined | null): string => {
    if (num == null || num === undefined) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatPercent = (num: number | undefined | null): string => {
    if (num == null || num === undefined) return '0.0%';
    return (num * 100).toFixed(1) + '%';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error}. Check your LinkedIn authentication and try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (!metrics) {
    return (
      <Alert>
        <AlertDescription>
          No analytics data available. Make sure your LinkedIn tokens are configured and try refreshing.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.section }}>
      {/* Header with Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={TYPOGRAPHY.h2.standard}>LinkedIn Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Performance metrics and insights for your LinkedIn presence
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {lastRefresh && (
            <span className="text-sm text-muted-foreground">
              Updated: {lastRefresh}
            </span>
          )}
          <Button onClick={fetchAnalytics} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      {loading && !metrics ? (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      ) : metrics ? (
        <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={TYPOGRAPHY.label.small}>Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={TYPOGRAPHY.h2.standard}>{formatNumber(metrics?.followerCount)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +{metrics?.followerGrowth || 0} this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={TYPOGRAPHY.label.small}>Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={TYPOGRAPHY.h2.standard}>{formatNumber(metrics?.totalImpressions)}</div>
            <p className="text-xs text-muted-foreground">
              Across {metrics?.totalPosts || 0} posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={TYPOGRAPHY.label.small}>Engagements</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={TYPOGRAPHY.h2.standard}>{formatNumber(metrics?.totalEngagements)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercent(metrics?.engagementRate)} rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={TYPOGRAPHY.label.small}>Avg. Engagement</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={TYPOGRAPHY.h2.standard}>{formatPercent(metrics?.engagementRate)}</div>
            <p className="text-xs text-muted-foreground">
              Industry avg: ~2.1%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Post Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(metrics?.recentPosts || []).map((post) => (
              <div key={post.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-2 mb-2">
                      {post.text.length > 150 ? post.text.substring(0, 150) + '...' : post.text}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Published {new Date(post.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-4">
                    <Badge variant={post.engagementRate > 0.03 ? 'default' : 'secondary'}>
                      {formatPercent(post.engagementRate)} engagement
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>{formatNumber(post.impressions)} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span>{formatNumber(post.likes)} likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span>{formatNumber(post.comments)} comments</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Share2 className="h-4 w-4 text-muted-foreground" />
                    <span>{formatNumber(post.shares)} shares</span>
                  </div>
                </div>
              </div>
            ))}

            {(metrics?.recentPosts?.length === 0 || !metrics?.recentPosts) && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent posts found</p>
                <p className="text-sm">Post some content to see analytics here!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Time Range Info */}
      <div className="text-center text-sm text-muted-foreground">
        Showing data for: {metrics?.timeRange || 'N/A'} | Last updated: {metrics?.lastUpdated ? new Date(metrics.lastUpdated).toLocaleString() : 'Never'}
      </div>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No data available</p>
          <p className="text-sm">Click refresh to load LinkedIn analytics</p>
        </div>
      )}
    </div>
  );
}
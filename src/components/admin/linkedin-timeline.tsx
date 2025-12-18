'use client';

import { useState, useEffect } from 'react';
import { SPACING, TYPOGRAPHY, SEMANTIC_COLORS } from '@/lib/design-tokens';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar,
  Search,
  Filter,
  TrendingUp,
  MessageSquare,
  Heart,
  Share,
  Eye,
  ExternalLink,
  RefreshCw,
  Clock,
  Users
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface LinkedInPost {
  id: string;
  content: string;
  publishedAt: string;
  visibility: 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN_MEMBERS';
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
    engagement: number;
  };
  status: 'published' | 'failed' | 'scheduled';
  linkedinUrl?: string;
  hashtags: string[];
}

interface TimelineFilters {
  search: string;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'quarter';
  status: 'all' | 'published' | 'scheduled' | 'failed';
  sortBy: 'newest' | 'oldest' | 'engagement' | 'views';
}

/**
 * LinkedIn Timeline Component
 * 
 * Displays chronological view of published LinkedIn content:
 * - Timeline view of all published posts
 * - Search and filter capabilities
 * - Performance metrics for each post
 * - Direct links to LinkedIn posts
 * - Engagement analytics and trends
 * - Content scheduling overview
 */
export function LinkedInTimeline() {
  const [posts, setPosts] = useState<LinkedInPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<TimelineFilters>({
    search: '',
    dateRange: 'all',
    status: 'all',
    sortBy: 'newest',
  });

  const fetchPosts = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({
        ...filters,
        limit: '50',
      });

      const response = await fetch(`/api/admin/linkedin/posts?${params}`, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_API_KEY}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        console.error('Failed to fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPosts = posts.filter(post => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      if (!post.content.toLowerCase().includes(searchTerm) &&
          !post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm))) {
        return false;
      }
    }

    // Date filter
    if (filters.dateRange !== 'all') {
      const postDate = new Date(post.publishedAt);
      const now = new Date();
      const dayMs = 24 * 60 * 60 * 1000;

      switch (filters.dateRange) {
        case 'today':
          if (now.getTime() - postDate.getTime() > dayMs) return false;
          break;
        case 'week':
          if (now.getTime() - postDate.getTime() > 7 * dayMs) return false;
          break;
        case 'month':
          if (now.getTime() - postDate.getTime() > 30 * dayMs) return false;
          break;
        case 'quarter':
          if (now.getTime() - postDate.getTime() > 90 * dayMs) return false;
          break;
      }
    }

    // Status filter
    if (filters.status !== 'all' && post.status !== filters.status) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'oldest':
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      case 'engagement':
        return b.metrics.engagement - a.metrics.engagement;
      case 'views':
        return b.metrics.views - a.metrics.views;
      case 'newest':
      default:
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': return SEMANTIC_COLORS.status.success;
      case 'scheduled': return SEMANTIC_COLORS.status.warning;
      case 'failed': return SEMANTIC_COLORS.status.error;
      default: return SEMANTIC_COLORS.status.neutral;
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'PUBLIC': return <Eye className="h-4 w-4" />;
      case 'CONNECTIONS': return <Users className="h-4 w-4" />;
      case 'LOGGED_IN_MEMBERS': return <Users className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const formatEngagementRate = (engagement: number) => {
    return `${(engagement * 100).toFixed(1)}%`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.content }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={TYPOGRAPHY.h2.standard}>Content Timeline</h2>
          <p className="text-sm text-muted-foreground">
            View and analyze your published LinkedIn content
          </p>
        </div>
        <Button
          onClick={() => fetchPosts(true)}
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Date Range */}
            <Select
              value={filters.dateRange}
              onValueChange={(value: any) => setFilters(prev => ({ ...prev, dateRange: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last week</SelectItem>
                <SelectItem value="month">Last month</SelectItem>
                <SelectItem value="quarter">Last quarter</SelectItem>
              </SelectContent>
            </Select>

            {/* Status */}
            <Select
              value={filters.status}
              onValueChange={(value: any) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={filters.sortBy}
              onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="engagement">Most engaging</SelectItem>
                <SelectItem value="views">Most viewed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading timeline...</span>
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {filters.search || filters.dateRange !== 'all' || filters.status !== 'all'
                ? 'No posts found matching your filters'
                : 'No posts published yet'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Post Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getVisibilityIcon(post.visibility)}
                        <Badge className={getStatusBadgeColor(post.status)}>
                          {post.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(post.publishedAt), 'MMM d, yyyy • h:mm a')}
                        <span className="ml-2">
                          ({formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })})
                        </span>
                      </div>
                    </div>
                    {post.linkedinUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={post.linkedinUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View on LinkedIn
                        </a>
                      </Button>
                    )}
                  </div>

                  {/* Post Content */}
                  <div>
                    <p className="text-sm leading-relaxed line-clamp-4">
                      {post.content}
                    </p>
                    {post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {post.hashtags.map((hashtag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            #{hashtag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Metrics */}
                  {post.status === 'published' && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="grid grid-cols-5 gap-4 flex-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span>{post.metrics.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Heart className="h-4 w-4 text-muted-foreground" />
                          <span>{post.metrics.likes.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span>{post.metrics.comments.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Share className="h-4 w-4 text-muted-foreground" />
                          <span>{post.metrics.shares.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span>{formatEngagementRate(post.metrics.engagement)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {post.status === 'scheduled' && (
                    <div className="flex items-center gap-2 pt-4 border-t text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Scheduled for {format(new Date(post.publishedAt), 'MMM d, yyyy • h:mm a')}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
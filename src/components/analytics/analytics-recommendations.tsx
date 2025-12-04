/**
 * Analytics Recommendations Component
 * 
 * Provides actionable insights and recommendations based on analytics data.
 * Identifies underperforming content, optimization opportunities, and trends.
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { PostAnalytics } from "@/types/analytics";
import Link from "next/link";

interface Recommendation {
  id: string;
  type: 'opportunity' | 'warning' | 'insight' | 'action';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  posts?: PostAnalytics[];
  action?: {
    label: string;
    href?: string;
  };
}

interface AnalyticsRecommendationsProps {
  posts: PostAnalytics[];
  compact?: boolean;
}

function generateRecommendations(posts: PostAnalytics[]): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  if (posts.length === 0) return recommendations;

  // Calculate key metrics
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
  const avgViews = totalViews / posts.length;
  const avgEngagement = posts.reduce((sum, p) => {
    const rate = p.views > 0 ? ((p.shares + p.comments) / p.views) * 100 : 0;
    return sum + rate;
  }, 0) / posts.length;

  // 1. Identify underperforming posts (below 50% of average views)
  const underperforming = posts.filter(p => p.views < avgViews * 0.5 && p.views > 0);
  if (underperforming.length > 0) {
    recommendations.push({
      id: 'underperforming',
      type: 'warning',
      priority: 'high',
      title: `${underperforming.length} Posts Need Attention`,
      description: `These posts have significantly fewer views than average. Consider updating titles, improving SEO, or promoting on social media.`,
      posts: underperforming.slice(0, 3),
      action: {
        label: 'Review Posts',
      },
    });
  }

  // 2. Identify high-potential posts (high engagement but low views)
  const highPotential = posts.filter(p => {
    const engagement = p.views > 0 ? ((p.shares + p.comments) / p.views) * 100 : 0;
    return engagement > avgEngagement * 1.5 && p.views < avgViews;
  });
  if (highPotential.length > 0) {
    recommendations.push({
      id: 'high-potential',
      type: 'opportunity',
      priority: 'high',
      title: `${highPotential.length} Posts Show High Engagement`,
      description: `These posts have great engagement but limited reach. Promote them to increase visibility and maximize their impact.`,
      posts: highPotential.slice(0, 3),
      action: {
        label: 'Promote These',
      },
    });
  }

  // 3. Identify posts with zero engagement
  const noEngagement = posts.filter(p => p.views > 50 && p.shares === 0 && p.comments === 0);
  if (noEngagement.length > 0) {
    recommendations.push({
      id: 'no-engagement',
      type: 'warning',
      priority: 'medium',
      title: `${noEngagement.length} Posts Have Zero Engagement`,
      description: `These posts receive views but no shares or comments. Consider adding clear CTAs, improving content structure, or enabling discussions.`,
      posts: noEngagement.slice(0, 3),
      action: {
        label: 'Improve Engagement',
      },
    });
  }

  // 4. Content gap analysis - find popular tags to write more about
  const tagViews = new Map<string, number>();
  posts.forEach(post => {
    post.tags.forEach(tag => {
      tagViews.set(tag, (tagViews.get(tag) || 0) + post.views);
    });
  });
  const topTags = Array.from(tagViews.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  if (topTags.length > 0) {
    recommendations.push({
      id: 'content-gaps',
      type: 'insight',
      priority: 'medium',
      title: 'Popular Topics to Expand',
      description: `Topics "${topTags.map(t => t[0]).join('", "')}" are performing well. Consider creating more content in these areas.`,
      action: {
        label: 'View Topics',
      },
    });
  }

  // 5. Recent posts performance
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentPosts = posts.filter(p => new Date(p.publishedAt) > thirtyDaysAgo);
  
  if (recentPosts.length > 0) {
    const recentAvgViews = recentPosts.reduce((sum, p) => sum + p.views, 0) / recentPosts.length;
    const overallAvgViews = avgViews;
    
    if (recentAvgViews > overallAvgViews * 1.3) {
      recommendations.push({
        id: 'recent-performance',
        type: 'insight',
        priority: 'low',
        title: 'Recent Content Performing Well',
        description: `Your recent posts are getting ${Math.round((recentAvgViews / overallAvgViews - 1) * 100)}% more views than average. Keep up the momentum!`,
      });
    } else if (recentAvgViews < overallAvgViews * 0.7) {
      recommendations.push({
        id: 'recent-underperformance',
        type: 'warning',
        priority: 'medium',
        title: 'Recent Content Underperforming',
        description: `Recent posts are getting ${Math.round((1 - recentAvgViews / overallAvgViews) * 100)}% fewer views than average. Review your promotion strategy.`,
      });
    }
  }

  // 6. Consistency check
  const postsByMonth = new Map<string, number>();
  posts.forEach(post => {
    const month = new Date(post.publishedAt).toISOString().slice(0, 7);
    postsByMonth.set(month, (postsByMonth.get(month) || 0) + 1);
  });
  const avgPostsPerMonth = Array.from(postsByMonth.values()).reduce((a, b) => a + b, 0) / postsByMonth.size;
  
  if (avgPostsPerMonth < 2) {
    recommendations.push({
      id: 'posting-frequency',
      type: 'action',
      priority: 'low',
      title: 'Increase Publishing Frequency',
      description: `You're averaging ${avgPostsPerMonth.toFixed(1)} posts per month. Consistent publishing (2-4 posts/month) can improve SEO and audience engagement.`,
      action: {
        label: 'Plan Content',
      },
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

const typeIcons = {
  opportunity: TrendingUp,
  warning: AlertTriangle,
  insight: Lightbulb,
  action: Target,
};

const typeColors = {
  opportunity: 'text-green-600 bg-green-50 border-green-200',
  warning: 'text-orange-600 bg-orange-50 border-orange-200',
  insight: 'text-blue-600 bg-blue-50 border-blue-200',
  action: 'text-purple-600 bg-purple-50 border-purple-200',
};

const priorityColors = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-blue-500',
};

export function AnalyticsRecommendations({ posts, compact = false }: AnalyticsRecommendationsProps) {
  const recommendations = generateRecommendations(posts);

  if (recommendations.length === 0) {
    return (
      <Card className="p-4 text-center">
        <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Everything looks great! Keep up the excellent work.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Recommendations</h3>
          <p className="text-sm text-muted-foreground">
            {recommendations.length} actionable insights to improve your content
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Sparkles className="h-3 w-3" />
          AI-Powered
        </Badge>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => {
          // Safely access type with fallback
          const type = rec.type || 'insight';
          const Icon = typeIcons[type as keyof typeof typeIcons] || Lightbulb;
          const priority = rec.priority || 'medium';
          
          return (
            <Card 
              key={rec.id} 
              className={`p-4 border-l-4 ${priorityColors[priority as keyof typeof priorityColors]} ${compact ? 'hover:shadow-sm' : 'hover:shadow-md'} transition-shadow`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${typeColors[type as keyof typeof typeColors]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold">{rec.title}</h4>
                    <Badge 
                      variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'outline'}
                      className="text-xs shrink-0"
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {rec.description}
                  </p>
                  
                  {rec.posts && rec.posts.length > 0 && (
                    <div className="space-y-1 mb-3 p-2 bg-muted/30 rounded-md">
                      {rec.posts.map((post) => (
                        <Link
                          key={post.slug}
                          href={`/blog/${post.slug}`}
                          className="block text-xs text-primary hover:underline line-clamp-1"
                        >
                          → {post.title}
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  {rec.action && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="gap-2 text-xs"
                    >
                      {rec.action.label}
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

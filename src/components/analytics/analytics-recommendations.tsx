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
  Sparkles,
  Code
} from "lucide-react";
import { PostAnalytics } from "@/types/analytics";
import Link from "next/link";
import { TYPOGRAPHY, SEMANTIC_COLORS } from "@/lib/design-tokens";

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

// ============================================================================
// MISSING SOURCES DETECTION
// ============================================================================

interface MissingSource {
  id: string;
  name: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  estimatedBenefit: string;
  implementation?: {
    complexity: 'simple' | 'moderate' | 'complex';
    effort: string;
    docs?: string;
  };
}

/**
 * Detect missing analytics sources that could enhance recommendations
 * Analyzes current data gaps and suggests implementations
 */
function detectMissingSources(posts: PostAnalytics[]): MissingSource[] {
  const missing: MissingSource[] = [];

  // Check for shares tracking (currently hardcoded to 0)
  const hasAnyShares = posts.some(p => (p.shares || 0) > 0);
  if (!hasAnyShares) {
    missing.push({
      id: 'shares-tracking',
      name: 'Social Shares Tracking',
      description: 'Currently not tracking social media shares. This data would help identify highly shareable content.',
      impact: 'high',
      estimatedBenefit: '25-40% better engagement insights',
      implementation: {
        complexity: 'moderate',
        effort: '4-6 hours',
        docs: '/docs/analytics/shares-tracking',
      },
    });
  }

  // Check if all posts have reading time
  const missingReadingTime = posts.filter(p => !p.readingTime || !p.readingTime.minutes).length;
  if (missingReadingTime > posts.length * 0.1) {
    missing.push({
      id: 'reading-time',
      name: 'Reading Time Metadata',
      description: `${missingReadingTime} posts missing reading time. This helps users decide which posts to read.`,
      impact: 'medium',
      estimatedBenefit: '10-15% improvement in engagement prediction',
      implementation: {
        complexity: 'simple',
        effort: '1-2 hours',
      },
    });
  }

  // Check for category/tag consistency
  const postsMissingTags = posts.filter(p => !p.tags || p.tags.length === 0).length;
  if (postsMissingTags > 0) {
    missing.push({
      id: 'tag-coverage',
      name: 'Complete Tag Coverage',
      description: `${postsMissingTags} posts missing tags. Better tag coverage enables topic-based recommendations.`,
      impact: 'medium',
      estimatedBenefit: '15-20% better topic recommendations',
      implementation: {
        complexity: 'simple',
        effort: '2-3 hours',
      },
    });
  }

  // Check for email newsletter integration
  missing.push({
    id: 'newsletter-tracking',
    name: 'Newsletter Analytics Integration',
    description: 'Track which posts get shared in newsletters and measure their impact on traffic.',
    impact: 'high',
    estimatedBenefit: '30-50% more insight into referral quality',
    implementation: {
      complexity: 'moderate',
      effort: '6-8 hours',
    },
  });

  // Check for referral source tracking
  missing.push({
    id: 'referral-tracking',
    name: 'Detailed Referral Source Tracking',
    description: 'Currently tracking basic views but not detailed referral sources (Twitter, Dev.to, Reddit, etc).',
    impact: 'high',
    estimatedBenefit: '40-60% better content distribution strategy',
    implementation: {
      complexity: 'moderate',
      effort: '5-7 hours',
    },
  });

  return missing.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  });
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
    
    // Only compare if we have a valid baseline (avoid division by zero)
    if (overallAvgViews > 0) {
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

  // 7. Detect missing analytics sources
  const missingSources = detectMissingSources(posts);
  if (missingSources.length > 0) {
    // Add top 2 missing sources as high-priority recommendations
    missingSources.slice(0, 2).forEach((source) => {
      recommendations.push({
        id: `missing-source-${source.id}`,
        type: 'action',
        priority: source.impact === 'high' ? 'high' : 'medium',
        title: `Enable ${source.name}`,
        description: `${source.description} This would provide ${source.estimatedBenefit}.${source.implementation ? ` Implementation: ${source.implementation.complexity} (${source.implementation.effort})` : ''}`,
        action: {
          label: 'Learn More',
          href: source.implementation?.docs,
        },
      });
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
  action: Code,
};

const typeColors = {
  opportunity: {
    icon: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-200 dark:border-emerald-900/50',
  },
  warning: {
    // eslint-disable-next-line no-restricted-syntax -- Icon accent color configuration
    icon: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20',
    border: 'border-orange-200 dark:border-orange-900/50',
  },
  insight: {
    // eslint-disable-next-line no-restricted-syntax -- Icon accent color configuration
    icon: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-900/50',
  },
  action: {
    icon: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-900/50',
  },
};

const priorityBorders = {
  high: 'border-l-destructive',
  medium: 'border-l-amber-500 dark:border-l-amber-500',
  low: SEMANTIC_COLORS.status.info.split(' ')[0].replace('bg-', 'border-l-'),
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
          <h3 className={TYPOGRAPHY.h3.standard}>Recommendations</h3>
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
              className={`p-4 border-l-4 ${priorityBorders[priority as keyof typeof priorityBorders]} ${compact ? 'hover:shadow-sm' : 'hover:shadow-md'} transition-shadow`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${typeColors[type as keyof typeof typeColors].icon} ${typeColors[type as keyof typeof typeColors].border} border`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className={TYPOGRAPHY.label.small}>{rec.title}</h4>
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

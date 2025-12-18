import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * LinkedIn Posts API Route
 * 
 * Retrieves published LinkedIn posts with metrics:
 * - GET: Fetch published posts with filtering and pagination
 * - Supports search, date range, and status filtering
 * - Returns engagement metrics and performance data
 * - Integrates with LinkedIn Analytics API
 * 
 * Authentication: Requires admin API key
 * Rate limiting: Applied via middleware
 */

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
  estimatedReadTime: number;
  authorId: string;
  draftId?: string;
}

interface PostsQuery {
  limit?: number;
  offset?: number;
  search?: string;
  dateRange?: 'all' | 'today' | 'week' | 'month' | 'quarter';
  status?: 'all' | 'published' | 'scheduled' | 'failed';
  sortBy?: 'newest' | 'oldest' | 'engagement' | 'views';
}

async function validateAdminAccess(request: NextRequest): Promise<boolean> {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.replace('Bearer ', '');
  const expectedToken = process.env.ADMIN_API_KEY;
  
  return token === expectedToken;
}

function extractHashtags(content: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  const matches = content.match(hashtagRegex);
  return matches ? matches.map(tag => tag.replace('#', '')) : [];
}

function calculateReadTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200)); // Average 200 words per minute
}

function calculateEngagementRate(metrics: any): number {
  const { views, likes, comments, shares } = metrics;
  if (views === 0) return 0;
  return (likes + comments + shares) / views;
}

// Mock data for published posts (in production, this would come from database/LinkedIn API)
const mockPosts: LinkedInPost[] = [
  {
    id: 'post-1',
    content: 'Excited to announce the launch of our new AI-powered development tools that are revolutionizing how developers build applications. These tools integrate seamlessly with existing workflows and provide intelligent suggestions for code optimization, testing, and deployment.\n\n#AI #Development #Tools #Innovation',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    visibility: 'PUBLIC',
    metrics: {
      views: 2340,
      likes: 89,
      comments: 23,
      shares: 15,
      clicks: 45,
      engagement: 0.054,
    },
    status: 'published',
    linkedinUrl: 'https://www.linkedin.com/feed/update/urn:li:share:post-1',
    hashtags: ['AI', 'Development', 'Tools', 'Innovation'],
    estimatedReadTime: 2,
    authorId: 'drew-clements',
    draftId: 'draft-1',
  },
  {
    id: 'post-2',
    content: 'Just shipped a major update to our design system. Here\'s what changed and why it matters for consistency across our platform.\n\nKey updates:\n• New color tokens for better accessibility\n• Simplified component API\n• Enhanced documentation\n• Mobile-first responsive patterns\n\n#DesignSystem #UX #UI #WebDevelopment',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    visibility: 'PUBLIC',
    metrics: {
      views: 1890,
      likes: 67,
      comments: 18,
      shares: 12,
      clicks: 32,
      engagement: 0.051,
    },
    status: 'published',
    linkedinUrl: 'https://www.linkedin.com/feed/update/urn:li:share:post-2',
    hashtags: ['DesignSystem', 'UX', 'UI', 'WebDevelopment'],
    estimatedReadTime: 3,
    authorId: 'drew-clements',
    draftId: 'draft-2',
  },
  {
    id: 'post-3',
    content: 'Building in public: Lessons learned from scaling a Next.js application to handle millions of requests per month.\n\nWhat I wish I knew earlier:\n1. Start with proper monitoring from day one\n2. Design for horizontal scaling early\n3. Cache everything (but cache smart)\n4. Test your error boundaries\n\nMore details in the comments 👇\n\n#NextJS #Scaling #WebDevelopment #BuildingInPublic',
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    visibility: 'CONNECTIONS',
    metrics: {
      views: 1560,
      likes: 45,
      comments: 12,
      shares: 8,
      clicks: 28,
      engagement: 0.042,
    },
    status: 'published',
    linkedinUrl: 'https://www.linkedin.com/feed/update/urn:li:share:post-3',
    hashtags: ['NextJS', 'Scaling', 'WebDevelopment', 'BuildingInPublic'],
    estimatedReadTime: 3,
    authorId: 'drew-clements',
    draftId: 'draft-3',
  },
  {
    id: 'scheduled-1',
    content: 'Upcoming post about TypeScript best practices...',
    publishedAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    visibility: 'PUBLIC',
    metrics: {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      clicks: 0,
      engagement: 0,
    },
    status: 'scheduled',
    hashtags: ['TypeScript', 'BestPractices'],
    estimatedReadTime: 2,
    authorId: 'drew-clements',
  },
];

function filterPosts(posts: LinkedInPost[], query: PostsQuery): LinkedInPost[] {
  let filtered = [...posts];

  // Search filter
  if (query.search) {
    const searchTerm = query.search.toLowerCase();
    filtered = filtered.filter(post =>
      post.content.toLowerCase().includes(searchTerm) ||
      post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Date range filter
  if (query.dateRange && query.dateRange !== 'all') {
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;

    filtered = filtered.filter(post => {
      const postDate = new Date(post.publishedAt);
      const timeDiff = now.getTime() - postDate.getTime();

      switch (query.dateRange) {
        case 'today':
          return timeDiff <= dayMs;
        case 'week':
          return timeDiff <= 7 * dayMs;
        case 'month':
          return timeDiff <= 30 * dayMs;
        case 'quarter':
          return timeDiff <= 90 * dayMs;
        default:
          return true;
      }
    });
  }

  // Status filter
  if (query.status && query.status !== 'all') {
    filtered = filtered.filter(post => post.status === query.status);
  }

  // Sort
  filtered.sort((a, b) => {
    switch (query.sortBy) {
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

  return filtered;
}

// GET - Retrieve posts with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const isAuthorized = await validateAdminAccess(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    const query: PostsQuery = {
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
      search: searchParams.get('search') || undefined,
      dateRange: (searchParams.get('dateRange') as any) || 'all',
      status: (searchParams.get('status') as any) || 'all',
      sortBy: (searchParams.get('sortBy') as any) || 'newest',
    };

    // Validate parameters
    if (query.limit! > 100) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 100 posts' },
        { status: 400 }
      );
    }

    // Filter posts based on query
    const filteredPosts = filterPosts(mockPosts, query);
    
    // Apply pagination
    const total = filteredPosts.length;
    const paginatedPosts = filteredPosts.slice(
      query.offset,
      query.offset! + query.limit!
    );

    // Calculate summary metrics
    const publishedPosts = filteredPosts.filter(p => p.status === 'published');
    const totalMetrics = publishedPosts.reduce(
      (acc, post) => ({
        views: acc.views + post.metrics.views,
        likes: acc.likes + post.metrics.likes,
        comments: acc.comments + post.metrics.comments,
        shares: acc.shares + post.metrics.shares,
        clicks: acc.clicks + post.metrics.clicks,
      }),
      { views: 0, likes: 0, comments: 0, shares: 0, clicks: 0 }
    );

    const averageEngagement = publishedPosts.length > 0
      ? publishedPosts.reduce((acc, post) => acc + post.metrics.engagement, 0) / publishedPosts.length
      : 0;

    return NextResponse.json({
      success: true,
      posts: paginatedPosts,
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset! + query.limit! < total,
      },
      summary: {
        total: filteredPosts.length,
        published: publishedPosts.length,
        scheduled: filteredPosts.filter(p => p.status === 'scheduled').length,
        failed: filteredPosts.filter(p => p.status === 'failed').length,
        totalMetrics,
        averageEngagement,
      },
      query,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('LinkedIn posts API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch LinkedIn posts',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Refresh posts from LinkedIn API
export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const isAuthorized = await validateAdminAccess(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // In production, this would:
    // 1. Fetch fresh data from LinkedIn API
    // 2. Update database with new metrics
    // 3. Queue background job for full sync
    // 4. Return updated post list

    return NextResponse.json({
      success: true,
      message: 'Posts refreshed successfully',
      refreshedAt: new Date().toISOString(),
      postsUpdated: mockPosts.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('LinkedIn posts refresh error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to refresh LinkedIn posts',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
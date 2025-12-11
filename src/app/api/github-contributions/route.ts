import { NextRequest, NextResponse } from 'next/server';
import { SITE_DOMAIN } from '@/lib/site-config';
import { rateLimit, getClientIp, createRateLimitHeaders } from '@/lib/rate-limit';

interface ContributionDay {
  date: string;
  count: number;
}

interface PinnedRepository {
  name: string;
  description: string | null;
  url: string;
  stargazerCount: number;
  forkCount: number;
  primaryLanguage: {
    name: string;
    color: string;
  } | null;
}

interface ContributionResponse {
  contributions: ContributionDay[];
  source: string;
  totalContributions: number;
  totalRepositories: number;
  pinnedRepositories: PinnedRepository[];
  warning?: string;
}

// Security: Only allow fetching data for the hardcoded portfolio owner
const ALLOWED_USERNAME = 'dcyfr';

// Rate limiting configuration: 10 requests per minute per IP
const RATE_LIMIT_CONFIG = {
  limit: 10,
  windowInSeconds: 60,
};

// Server-side cache configuration
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour server-side cache
let cachedData: { data: ContributionResponse; timestamp: number } | null = null;

/**
 * Validate username to prevent injection attacks
 */
function isValidUsername(username: string): boolean {
  // GitHub usernames can only contain alphanumeric characters and hyphens
  // Maximum length is 39 characters
  return /^[a-zA-Z0-9-]{1,39}$/.test(username);
}

/**
 * API route to fetch GitHub contribution data.
 * 
 * Security features:
 * - Rate limiting (10 requests/minute per IP)
 * - Username restricted to portfolio owner
 * - Input validation and sanitization
 * - Server-side caching (1 hour)
 * - Graceful error handling
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');

  // Validate username parameter
  if (!username) {
    return NextResponse.json(
      { error: 'Username parameter is required' },
      { status: 400 }
    );
  }

  // Input validation: Check for valid GitHub username format
  if (!isValidUsername(username)) {
    return NextResponse.json(
      { error: 'Invalid username format' },
      { status: 400 }
    );
  }

  // Security: Only allow the hardcoded username
  if (username !== ALLOWED_USERNAME) {
    return NextResponse.json(
      { error: 'Unauthorized: This endpoint only serves data for the portfolio owner' },
      { status: 403 }
    );
  }

  // Rate limiting check
  const clientIp = getClientIp(request);
  const rateLimitResult = await rateLimit(clientIp, RATE_LIMIT_CONFIG);

  if (!rateLimitResult.success) {
    const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);

    return NextResponse.json(
      { 
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter,
      },
      { 
        status: 429,
        headers: {
          ...createRateLimitHeaders(rateLimitResult),
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  // Check server-side cache first
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return NextResponse.json({
      ...cachedData.data,
      source: 'server-cache',
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'X-Cache-Status': 'HIT',
      },
    });
  }

  try {
    // Try fetching from GitHub's GraphQL API
    console.log(`Fetching GitHub contributions for user: ${username}`);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'User-Agent': `${SITE_DOMAIN}-portfolio`,
    };

    // Only add Authorization header if token is available
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
      console.log('Using authenticated GitHub API');
    } else {
      console.log('Using unauthenticated GitHub API (subject to rate limits)');
    }
    
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: `
          query($username: String!) {
            user(login: $username) {
              repositories(ownerAffiliations: OWNER, privacy: PUBLIC) {
                totalCount
              }
              pinnedItems(first: 6, types: REPOSITORY) {
                nodes {
                  ... on Repository {
                    name
                    description
                    url
                    stargazerCount
                    forkCount
                    primaryLanguage {
                      name
                      color
                    }
                  }
                }
              }
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      contributionCount
                      date
                    }
                  }
                }
              }
            }
          }
        `,
        variables: { username },
      }),
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    console.log(`GitHub API response status: ${response.status}`);
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('GitHub GraphQL response received, data structure check...');

    // Check for GraphQL errors
    if (data.errors) {
      // Log a summary of GraphQL errors without printing full structured data
      console.error('GitHub GraphQL errors detected (count):', (data.errors || []).length);
      throw new Error(`GitHub GraphQL query failed`);
    }

    if (!data.data?.user?.contributionsCollection?.contributionCalendar) {
      // Avoid logging entire response structures - log summary keys for debugging
      console.error('Invalid response structure. Response keys:', Object.keys(data || {}));
      throw new Error('Invalid GitHub API response structure');
    }

    const calendar = data.data.user.contributionsCollection.contributionCalendar;
    const repositories = data.data.user.repositories;
    const pinnedItems = data.data.user.pinnedItems;
    
    // Transform the data
    const contributions: ContributionDay[] = calendar.weeks.flatMap(
      (week: { contributionDays: Array<{ date: string; contributionCount: number }> }) =>
        week.contributionDays.map((day) => ({
          date: day.date,
          count: day.contributionCount,
        }))
    );

    const pinnedRepositories: PinnedRepository[] = pinnedItems?.nodes?.map((node: {
      name: string;
      description: string | null;
      url: string;
      stargazerCount: number;
      forkCount: number;
      primaryLanguage: { name: string; color: string } | null;
    }) => ({
      name: node.name,
      description: node.description,
      url: node.url,
      stargazerCount: node.stargazerCount,
      forkCount: node.forkCount,
      primaryLanguage: node.primaryLanguage ? {
        name: node.primaryLanguage.name,
        color: node.primaryLanguage.color,
      } : null,
    })) || [];

    const result: ContributionResponse = {
      contributions,
      source: 'github-api',
      totalContributions: calendar.totalContributions,
      totalRepositories: repositories?.totalCount || 0,
      pinnedRepositories,
    };

    // Add warning if no token is used (rate limits apply)
    if (!process.env.GITHUB_TOKEN) {
      result.warning = 'Using unauthenticated GitHub API (subject to rate limits)';
    }

    // Cache the successful response
    cachedData = {
      data: result,
      timestamp: Date.now(),
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'X-Cache-Status': 'MISS',
        ...createRateLimitHeaders(rateLimitResult),
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error fetching GitHub contributions:', errorMessage);
    if (errorStack) console.error('Stack trace:', errorStack);

    // Return fallback data instead of an error
    const fallbackData = generateFallbackData();
    
    const fallbackResponse: ContributionResponse = {
      contributions: fallbackData,
      source: 'fallback',
      totalContributions: fallbackData.reduce((sum, day) => sum + day.count, 0),
      totalRepositories: 0,
      pinnedRepositories: [],
      warning: 'Unable to fetch live data.',
    };

    // Cache fallback data for a shorter duration
    cachedData = {
      data: fallbackResponse,
      timestamp: Date.now() - (CACHE_DURATION - 60000), // Cache for only 1 minute
    };

    return NextResponse.json(fallbackResponse, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-Cache-Status': 'FALLBACK',
      },
    });
  }
}

/**
 * Generate fallback contribution data for the past year
 * Creates a realistic-looking pattern with varying activity levels
 */
function generateFallbackData(): ContributionDay[] {
  const contributions: ContributionDay[] = [];
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setFullYear(startDate.getFullYear() - 1);

  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayOfWeek = currentDate.getDay();
    
    // Create a realistic pattern:
    // - Less activity on weekends
    // - Random variation throughout the week
    // - Some periods with no activity
    let count = 0;
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend: 30% chance of activity
      count = Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0;
    } else {
      // Weekday: 70% chance of activity
      count = Math.random() > 0.3 ? Math.floor(Math.random() * 12) : 0;
    }

    contributions.push({
      date: dateStr,
      count,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return contributions;
}

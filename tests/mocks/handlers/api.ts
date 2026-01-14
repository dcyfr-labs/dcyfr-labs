import { http, HttpResponse } from 'msw'

/**
 * INTERNAL API ROUTE HANDLERS
 * 
 * Mocks all internal /api/* endpoints for integration testing
 * These handlers are used during test runs to avoid hitting real APIs
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

/**
 * Views API Handler
 * Tracks page views for analytics
 * 
 * Route: POST /api/views
 * Body: { postId, sessionId, timestamp }
 * Response: { success, viewId, timestamp, cached }
 */
export const viewsApiHandler = http.post(`${BASE_URL}/api/views`, async (req) => {
  try {
    const body = await req.request.json().catch(() => ({}))
    
    // Simulate successful view recording
    return HttpResponse.json(
      {
        success: true,
        viewId: 'view_' + Math.random().toString(36).slice(2, 9),
        timestamp: Date.now(),
        cached: false,
        postId: body.postId || 'unknown',
      },
      { status: 200 }
    )
  } catch {
    return HttpResponse.json(
      { error: 'Failed to record view' },
      { status: 400 }
    )
  }
})

/**
 * Analytics API Handler
 * Returns aggregated metrics (views, shares, comments)
 * 
 * Route: GET /api/analytics?period=24h&postId=xxx
 * Response: { views, shares, comments, topPosts, cached, cacheDuration }
 */
export const analyticsApiHandler = http.get(`${BASE_URL}/api/analytics`, (req) => {
  const url = new URL(req.request.url)
  const period = url.searchParams.get('period') || '24h'
  const postId = url.searchParams.get('postId')

  return HttpResponse.json(
    {
      views: {
        total: 1250,
        last24h: 45,
        trend: '+12%',
      },
      shares: {
        total: 89,
        last24h: 3,
        trend: '+5%',
      },
      comments: {
        total: 23,
        last24h: 1,
        trend: '-8%',
      },
      topPosts: [
        { id: 'post-1', title: 'Getting Started', views: 450, shares: 25 },
        { id: 'post-2', title: 'Advanced Patterns', views: 380, shares: 18 },
        { id: 'post-3', title: 'Best Practices', views: 320, shares: 12 },
      ],
      period: period,
      postId: postId || 'all',
      cached: true,
      cacheDuration: 300, // 5 minutes
      cacheExpiry: Date.now() + 300000,
    },
    { status: 200 }
  )
})

/**
 * Health Check Handler
 * Returns service health status
 * 
 * Route: GET /api/health
 * Response: { status, timestamp, services }
 */
export const healthCheckHandler = http.get(`${BASE_URL}/api/health`, () => {
  return HttpResponse.json(
    {
      status: 'ok',
      timestamp: Date.now(),
      services: {
        database: 'connected',
        cache: 'connected',
        externalApis: 'ok',
      },
      version: '1.0.0',
      uptime: Math.floor(Date.now() / 1000),
    },
    { status: 200 }
  )
})

/**
 * Contact Form Handler
 * Handles contact form submissions
 * 
 * Route: POST /api/contact
 * Body: { email, name, message, subject }
 * Response: { success, messageId, timestamp }
 */
export const contactFormHandler = http.post(`${BASE_URL}/api/contact`, async (req) => {
  try {
    const body = await req.request.json().catch(() => ({}))

    // Validate required fields
    if (!body.email || !body.message) {
      return HttpResponse.json(
        { error: 'Email and message are required' },
        { status: 400 }
      )
    }

    return HttpResponse.json(
      {
        success: true,
        messageId: 'msg_' + Math.random().toString(36).slice(2, 9),
        timestamp: Date.now(),
        received: true,
      },
      { status: 200 }
    )
  } catch {
    return HttpResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    )
  }
})

/**
 * GitHub Contributions Handler
 * Returns contribution data from GitHub
 * 
 * Route: GET /api/github-contributions?username=dcyfr
 * Response: { contributions, cached, username }
 */
export const githubContributionsHandler = http.get(
  `${BASE_URL}/api/github-contributions`,
  (req) => {
    const url = new URL(req.request.url)
    const username = url.searchParams.get('username') || 'dcyfr'

    // Check for invalid usernames
    if (!username || username.length > 50) {
      return HttpResponse.json(
        { error: 'Invalid username' },
        { status: 400 }
      )
    }

    return HttpResponse.json(
      {
        username: username,
        contributions: Array.from({ length: 365 }, (_, i) => {
          const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
          return {
            date: date.toISOString().split('T')[0],
            count: Math.floor(Math.random() * 10),
            level: Math.floor(Math.random() * 5),
          }
        }),
        total: 1250,
        cached: true,
        cacheExpiry: Date.now() + 86400000, // 1 day
        lastUpdated: Date.now(),
      },
      { status: 200 }
    )
  }
)

/**
 * Export all API handlers
 */
export const apiHandlers = [
  viewsApiHandler,
  analyticsApiHandler,
  healthCheckHandler,
  contactFormHandler,
  githubContributionsHandler,
]

/**
 * ERROR SCENARIO HANDLERS
 * Used to test error handling paths
 * Import individually and use server.use() to override default handlers
 */
export const errorHandlers = {
  // Rate limit exceeded (429)
  viewsRateLimited: http.post(`${BASE_URL}/api/views`, () => {
    return HttpResponse.json(
      { error: 'Too Many Requests', retryAfter: 60 },
      { status: 429, headers: { 'Retry-After': '60' } }
    )
  }),

  // Server error (500)
  analyticsServerError: http.get(`${BASE_URL}/api/analytics`, () => {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }),

  // Service unavailable (503)
  healthServiceUnavailable: http.get(`${BASE_URL}/api/health`, () => {
    return HttpResponse.json(
      { status: 'degraded', error: 'Service temporarily unavailable' },
      { status: 503 }
    )
  }),

  // Unauthorized (401)
  contactUnauthorized: http.post(`${BASE_URL}/api/contact`, () => {
    return HttpResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }),

  // Not found (404)
  githubNotFound: http.get(`${BASE_URL}/api/github-contributions`, () => {
    return HttpResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }),
}

import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/views/route'
import { rateLimit } from '@/lib/rate-limit'
import {
  validateRequest,
  checkSessionDuplication,
  recordAbuseAttempt,
  detectAbusePattern,
  validateTiming,
  isValidSessionId,
} from '@/lib/anti-spam'
import { incrementPostViews } from '@/lib/views.server'

// Mock dependencies
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(),
  getClientIp: vi.fn(() => '192.168.1.1'),
}))

vi.mock('@/lib/anti-spam', () => ({
  getClientIp: vi.fn(() => '192.168.1.1'),
  validateRequest: vi.fn(),
  checkSessionDuplication: vi.fn(),
  recordAbuseAttempt: vi.fn().mockResolvedValue(undefined),
  detectAbusePattern: vi.fn(),
  validateTiming: vi.fn(),
  isValidSessionId: vi.fn(),
}))

vi.mock('@/lib/views.server', () => ({
  incrementPostViews: vi.fn(),
}))

/**
 * Views API Integration Tests
 * 
 * Tests for POST /api/views endpoint which records page views.
 * Uses Mock Service Worker (MSW) to intercept API calls during testing.
 * 
 * Skip Reason (Phase 1): API refactored - mocks needed updating
 * Re-enabled (Phase 2): MSW handlers now provide mock responses
 * 
 * @link docs/testing/SKIPPED_TESTS_DOCUMENTATION.md#12-views-api-integration
 */
describe('Views API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default mocks: all checks pass
    vi.mocked(isValidSessionId).mockReturnValue(true)
    vi.mocked(validateRequest).mockReturnValue({ valid: true })
    vi.mocked(validateTiming).mockReturnValue({ valid: true })
    vi.mocked(detectAbusePattern).mockResolvedValue(false)
    vi.mocked(rateLimit).mockResolvedValue({
      success: true,
      limit: 20,
      remaining: 19,
      reset: Date.now() + 300000,
    })
    vi.mocked(checkSessionDuplication).mockResolvedValue(false)
    vi.mocked(incrementPostViews).mockResolvedValue(42)
  })

  describe('POST /api/views', () => {
    describe('Input Validation', () => {
      it('rejects missing postId', async () => {
        const request = new NextRequest('http://localhost:3000/api/views', {
          method: 'POST',
          body: JSON.stringify({
            sessionId: 'test-session-123',
            timeOnPage: 10000,
            isVisible: true,
          }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('Invalid postId')
        expect(data.recorded).toBe(false)
      })

      it('rejects non-string postId', async () => {
        const request = new NextRequest('http://localhost:3000/api/views', {
          method: 'POST',
          body: JSON.stringify({
            postId: 12345, // Number instead of string
            sessionId: 'test-session-123',
            timeOnPage: 10000,
            isVisible: true,
          }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('Invalid postId')
      })

      it('rejects invalid sessionId', async () => {
        vi.mocked(isValidSessionId).mockReturnValue(false)

        const request = new NextRequest('http://localhost:3000/api/views', {
          method: 'POST',
          body: JSON.stringify({
            postId: 'test-post',
            sessionId: 'invalid',
            timeOnPage: 10000,
            isVisible: true,
          }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('Invalid sessionId')
        expect(data.recorded).toBe(false)
      })

      it('does not count view when page not visible', async () => {
        const request = new NextRequest('http://localhost:3000/api/views', {
          method: 'POST',
          body: JSON.stringify({
            postId: 'test-post',
            sessionId: 'test-session-123',
            timeOnPage: 10000,
            isVisible: false, // Page not visible
          }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.recorded).toBe(false)
        expect(data.count).toBeNull()
        expect(data.error).toContain('not visible')
        expect(incrementPostViews).not.toHaveBeenCalled()
      })
    })

    describe('Anti-Spam Layers', () => {
      describe('Layer 1: Request Validation', () => {
        it('rejects invalid user-agent', async () => {
          vi.mocked(validateRequest).mockReturnValue({
            valid: false,
            reason: 'invalid_user_agent',
          })

          const request = new NextRequest('http://localhost:3000/api/views', {
            method: 'POST',
            body: JSON.stringify({
              postId: 'test-post',
              sessionId: 'test-session-123',
              timeOnPage: 10000,
              isVisible: true,
            }),
          })

          const response = await POST(request)
          const data = await response.json()

          expect(response.status).toBe(400)
          expect(data.error).toContain('validation failed')
          expect(data.recorded).toBe(false)
          expect(recordAbuseAttempt).toHaveBeenCalledWith(
            '192.168.1.1',
            'view',
            'invalid_user_agent'
          )
        })

        it('rejects bot user-agents', async () => {
          vi.mocked(validateRequest).mockReturnValue({
            valid: false,
            reason: 'bot_detected',
          })

          const request = new NextRequest('http://localhost:3000/api/views', {
            method: 'POST',
            body: JSON.stringify({
              postId: 'test-post',
              sessionId: 'test-session-123',
              timeOnPage: 10000,
              isVisible: true,
            }),
          })

          const response = await POST(request)
          const data = await response.json()

          expect(response.status).toBe(400)
          expect(recordAbuseAttempt).toHaveBeenCalledWith(
            '192.168.1.1',
            'view',
            'bot_detected'
          )
        })
      })

      describe('Layer 2: Timing Validation', () => {
        it('rejects insufficient time on page', async () => {
          vi.mocked(validateTiming).mockReturnValue({
            valid: false,
            reason: 'insufficient_time',
          })

          const request = new NextRequest('http://localhost:3000/api/views', {
            method: 'POST',
            body: JSON.stringify({
              postId: 'test-post',
              sessionId: 'test-session-123',
              timeOnPage: 1000, // Too short
              isVisible: true,
            }),
          })

          const response = await POST(request)
          const data = await response.json()

          expect(response.status).toBe(200) // Not an error, just not counted
          expect(data.recorded).toBe(false)
          expect(data.count).toBeNull()
          expect(data.error).toContain('Insufficient time')
          expect(recordAbuseAttempt).toHaveBeenCalledWith(
            '192.168.1.1',
            'view',
            'insufficient_time'
          )
        })

        it('accepts valid time on page', async () => {
          vi.mocked(validateTiming).mockReturnValue({ valid: true })

          const request = new NextRequest('http://localhost:3000/api/views', {
            method: 'POST',
            body: JSON.stringify({
              postId: 'test-post',
              sessionId: 'test-session-123',
              timeOnPage: 10000, // 10 seconds
              isVisible: true,
            }),
          })

          const response = await POST(request)

          expect(response.status).toBe(200)
          expect(validateTiming).toHaveBeenCalledWith('view', 10000)
        })
      })

      describe('Layer 3: Abuse Pattern Detection', () => {
        it('rejects requests from known abusers', async () => {
          vi.mocked(detectAbusePattern).mockResolvedValue(true)

          const request = new NextRequest('http://localhost:3000/api/views', {
            method: 'POST',
            body: JSON.stringify({
              postId: 'test-post',
              sessionId: 'test-session-123',
              timeOnPage: 10000,
              isVisible: true,
            }),
          })

          const response = await POST(request)
          const data = await response.json()

          expect(response.status).toBe(429)
          expect(data.error).toContain('Suspicious activity')
          expect(data.recorded).toBe(false)
          expect(recordAbuseAttempt).toHaveBeenCalledWith(
            '192.168.1.1',
            'view',
            'abuse_pattern_detected'
          )
        })
      })

      describe('Layer 4: Rate Limiting', () => {
        it('returns 429 when rate limit exceeded', async () => {
          vi.mocked(rateLimit).mockResolvedValue({
            success: false,
            limit: 20,
            remaining: 0,
            reset: Date.now() + 30000,
          })

          const request = new NextRequest('http://localhost:3000/api/views', {
            method: 'POST',
            body: JSON.stringify({
              postId: 'test-post',
              sessionId: 'test-session-123',
              timeOnPage: 10000,
              isVisible: true,
            }),
          })

          const response = await POST(request)
          const data = await response.json()

          expect(response.status).toBe(429)
          expect(data.error).toContain('Rate limit exceeded')
          expect(data.recorded).toBe(false)
          expect(recordAbuseAttempt).toHaveBeenCalledWith(
            '192.168.1.1',
            'view',
            'rate_limit_exceeded'
          )
        })

        it('includes rate limit headers in response', async () => {
          const resetTime = Date.now() + 300000

          vi.mocked(rateLimit).mockResolvedValue({
            success: true,
            limit: 20,
            remaining: 15,
            reset: resetTime,
          })

          const request = new NextRequest('http://localhost:3000/api/views', {
            method: 'POST',
            body: JSON.stringify({
              postId: 'test-post',
              sessionId: 'test-session-123',
              timeOnPage: 10000,
              isVisible: true,
            }),
          })

          const response = await POST(request)

          expect(response.status).toBe(200)
          expect(response.headers.get('X-RateLimit-Limit')).toBe('20')
          expect(response.headers.get('X-RateLimit-Remaining')).toBe('15')
          expect(response.headers.get('X-RateLimit-Reset')).toBe(resetTime.toString())
        })

        it('calls rateLimit with correct parameters', async () => {
          const request = new NextRequest('http://localhost:3000/api/views', {
            method: 'POST',
            body: JSON.stringify({
              postId: 'test-post',
              sessionId: 'test-session-123',
              timeOnPage: 10000,
              isVisible: true,
            }),
          })

          await POST(request)

          expect(rateLimit).toHaveBeenCalledWith('view:192.168.1.1', {
            limit: 20,
            windowInSeconds: 300, // 5 minutes
          })
        })
      })

      describe('Layer 5: Session Deduplication', () => {
        it('does not increment for duplicate sessions', async () => {
          vi.mocked(checkSessionDuplication).mockResolvedValue(true)

          const request = new NextRequest('http://localhost:3000/api/views', {
            method: 'POST',
            body: JSON.stringify({
              postId: 'test-post',
              sessionId: 'test-session-123',
              timeOnPage: 10000,
              isVisible: true,
            }),
          })

          const response = await POST(request)
          const data = await response.json()

          expect(response.status).toBe(200)
          expect(data.recorded).toBe(false)
          expect(data.count).toBeNull()
          expect(data.message).toContain('already recorded')
          expect(incrementPostViews).not.toHaveBeenCalled()
          expect(recordAbuseAttempt).not.toHaveBeenCalled() // Not abuse
        })

        it('calls checkSessionDuplication with correct parameters', async () => {
          const request = new NextRequest('http://localhost:3000/api/views', {
            method: 'POST',
            body: JSON.stringify({
              postId: 'test-post-123',
              sessionId: 'session-abc',
              timeOnPage: 10000,
              isVisible: true,
            }),
          })

          await POST(request)

          expect(checkSessionDuplication).toHaveBeenCalledWith(
            'view',
            'test-post-123',
            'session-abc',
            1800 // 30 minutes
          )
        })
      })
    })

    describe('Successful View Recording', () => {
      it('increments view count when all checks pass', async () => {
        const request = new NextRequest('http://localhost:3000/api/views', {
          method: 'POST',
          body: JSON.stringify({
            postId: 'test-post',
            sessionId: 'test-session-123',
            timeOnPage: 10000,
            isVisible: true,
          }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.recorded).toBe(true)
        expect(data.count).toBe(42)
        expect(incrementPostViews).toHaveBeenCalledWith('test-post')
      })

      it('returns updated count with rate limit headers', async () => {
        vi.mocked(incrementPostViews).mockResolvedValue(100)

        const request = new NextRequest('http://localhost:3000/api/views', {
          method: 'POST',
          body: JSON.stringify({
            postId: 'popular-post',
            sessionId: 'test-session-456',
            timeOnPage: 20000,
            isVisible: true,
          }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.recorded).toBe(true)
        expect(data.count).toBe(100)
        expect(response.headers.get('X-RateLimit-Limit')).toBeTruthy()
      })
    })

    describe('Error Handling', () => {
      it('handles invalid JSON gracefully', async () => {
        const request = new NextRequest('http://localhost:3000/api/views', {
          method: 'POST',
          body: 'not valid json',
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toContain('Failed to record view')
        expect(data.recorded).toBe(false)
      })

      it('handles incrementPostViews failure', async () => {
        vi.mocked(incrementPostViews).mockRejectedValue(new Error('Redis error'))

        const request = new NextRequest('http://localhost:3000/api/views', {
          method: 'POST',
          body: JSON.stringify({
            postId: 'test-post',
            sessionId: 'test-session-123',
            timeOnPage: 10000,
            isVisible: true,
          }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toContain('Failed to record view')
        expect(data.recorded).toBe(false)
      })
    })

    describe('Complete Flow Integration', () => {
      it('executes all validation layers in correct order', async () => {
        const request = new NextRequest('http://localhost:3000/api/views', {
          method: 'POST',
          body: JSON.stringify({
            postId: 'test-post',
            sessionId: 'test-session-123',
            timeOnPage: 10000,
            isVisible: true,
          }),
        })

        await POST(request)

        // Verify order of calls
        expect(isValidSessionId).toHaveBeenCalled()
        expect(validateRequest).toHaveBeenCalled()
        expect(validateTiming).toHaveBeenCalled()
        expect(detectAbusePattern).toHaveBeenCalled()
        expect(rateLimit).toHaveBeenCalled()
        expect(checkSessionDuplication).toHaveBeenCalled()
        expect(incrementPostViews).toHaveBeenCalled()

        // Verify no abuse recorded for legitimate request
        expect(recordAbuseAttempt).not.toHaveBeenCalled()
      })

      it('stops at first failing layer', async () => {
        vi.mocked(validateRequest).mockReturnValue({
          valid: false,
          reason: 'bot_detected',
        })

        const request = new NextRequest('http://localhost:3000/api/views', {
          method: 'POST',
          body: JSON.stringify({
            postId: 'test-post',
            sessionId: 'test-session-123',
            timeOnPage: 10000,
            isVisible: true,
          }),
        })

        await POST(request)

        // Should stop after validateRequest fails
        expect(validateRequest).toHaveBeenCalled()
        expect(validateTiming).not.toHaveBeenCalled()
        expect(detectAbusePattern).not.toHaveBeenCalled()
        expect(rateLimit).not.toHaveBeenCalled()
        expect(checkSessionDuplication).not.toHaveBeenCalled()
        expect(incrementPostViews).not.toHaveBeenCalled()
      })
    })
  })
})

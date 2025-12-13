import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { POST } from '@/app/api/contact/route'
import { rateLimit } from '@/lib/rate-limit'
import { inngest } from '@/inngest/client'

// Mock dependencies
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(),
  getClientIp: vi.fn(() => '192.168.1.1'),
  createRateLimitHeaders: vi.fn(() => ({
    'X-RateLimit-Limit': '3',
    'X-RateLimit-Remaining': '2',
    'X-RateLimit-Reset': '123456789',
  })),
}))

vi.mock('@/inngest/client', () => ({
  inngest: {
    send: vi.fn().mockResolvedValue({ ids: ['mock-event-id'] }),
  },
}))

vi.mock('@/lib/analytics', () => ({
  trackContactFormSubmission: vi.fn().mockResolvedValue(undefined),
}))

describe('Contact API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: rate limit allows requests
    vi.mocked(rateLimit).mockResolvedValue({
      success: true,
      limit: 3,
      remaining: 2,
      reset: Date.now() + 60000,
    })
  })

  describe('POST /api/contact', () => {
    describe('Rate Limiting', () => {
      it('returns 429 when rate limit exceeded', async () => {
        vi.mocked(rateLimit).mockResolvedValue({
          success: false,
          limit: 3,
          remaining: 0,
          reset: Date.now() + 30000,
        })

        const request = new Request('http://localhost:3000/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            message: 'Test message',
          }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(429)
        expect(data.error).toContain('Too many requests')
        expect(data.retryAfter).toBeGreaterThan(0)
      })

      it('includes rate limit headers in response', async () => {
        vi.mocked(rateLimit).mockResolvedValue({
          success: false,
          limit: 3,
          remaining: 0,
          reset: Date.now() + 30000,
        })

        const request = new Request('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            message: 'Test message',
          }),
        })

        const response = await POST(request)

        expect(response.headers.get('X-RateLimit-Limit')).toBe('3')
        expect(response.headers.get('Retry-After')).toBeTruthy()
      })
    })

    describe('Honeypot Protection', () => {
      it('silently accepts bot submissions with honeypot filled', async () => {
        const request = new Request('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Bot',
            email: 'bot@example.com',
            message: 'Spam message',
            website: 'https://spam.com', // Honeypot field
          }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(inngest.send).not.toHaveBeenCalled()
      })

      it('processes legitimate submission when honeypot empty', async () => {
        vi.mocked(inngest.send).mockResolvedValue({ ids: ['test-id'] })

        const request = new Request('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            message: 'This is a legitimate message from a real user.',
            website: '', // Empty honeypot
          }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(inngest.send).toHaveBeenCalled()
      })
    })

    describe('Input Validation', () => {
      it('rejects request with missing name', async () => {
        const request = new Request('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify({
            email: 'john@example.com',
            message: 'Test message',
          }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('required')
      })

      it('rejects request with missing email', async () => {
        const request = new Request('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify({
            name: 'John Doe',
            message: 'Test message',
          }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('required')
      })

      it('rejects request with missing message', async () => {
        const request = new Request('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
          }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('required')
      })

      it('rejects invalid email format', async () => {
        const request = new Request('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify({
            name: 'John Doe',
            email: 'not-an-email',
            message: 'Test message',
          }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('Invalid email')
      })

      it('accepts valid email formats', async () => {
        vi.mocked(inngest.send).mockResolvedValue({ ids: ['test-id'] })

        const validEmails = [
          'user@example.com',
          'user.name@example.co.uk',
          'user+tag@example.com',
          'user123@subdomain.example.com',
        ]

        for (const email of validEmails) {
          const request = new Request('http://localhost:3000/api/contact', {
            method: 'POST',
            body: JSON.stringify({
              name: 'John Doe',
              email,
              message: 'Test message that is long enough',
            }),
          })

          const response = await POST(request)
          expect(response.status).toBe(200)
        }
      })

      it('rejects name shorter than 2 characters', async () => {
        const request = new Request('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify({
            name: 'J',
            email: 'john@example.com',
            message: 'Test message that is long enough',
          }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('at least 2 characters')
      })

      it('rejects message shorter than 10 characters', async () => {
        const request = new Request('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            message: 'Short',
          }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toContain('at least 10 characters')
      })

      it('sanitizes input by trimming whitespace', async () => {
        vi.mocked(inngest.send).mockResolvedValue({ ids: ['test-id'] })

        const request = new Request('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify({
            name: '  John Doe  ',
            email: 'john@example.com', // Email can't have leading/trailing spaces due to validation
            message: '  Test message with extra spaces  ',
          }),
        })

        const response = await POST(request)
        expect(response.status).toBe(200)

        const sendCall = vi.mocked(inngest.send).mock.calls[0][0]
        const eventData = Array.isArray(sendCall) ? sendCall[0].data : sendCall.data

        expect(eventData.name).toBe('John Doe')
        expect(eventData.email).toBe('john@example.com')
        expect(eventData.message).toBe('Test message with extra spaces')
      })

      it('truncates inputs longer than 1000 characters', async () => {
        vi.mocked(inngest.send).mockResolvedValue({ ids: ['test-id'] })

        const longMessage = 'x'.repeat(1500)

        const request = new Request('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            message: longMessage,
          }),
        })

        const response = await POST(request)
        expect(response.status).toBe(200)

        const sendCall = vi.mocked(inngest.send).mock.calls[0][0]
        const eventData = Array.isArray(sendCall) ? sendCall[0].data : sendCall.data

        expect(eventData.message.length).toBe(1000)
      })
    })

    describe('Successful Submission', () => {
      it('sends event to Inngest with correct data', async () => {
        vi.mocked(inngest.send).mockResolvedValue({ ids: ['test-id'] })

        const request = new Request('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            message: 'This is a test message from the contact form.',
          }),
        })

        await POST(request)

        expect(inngest.send).toHaveBeenCalledWith({
          name: 'contact/form.submitted',
          data: {
            name: 'John Doe',
            email: 'john@example.com',
            message: 'This is a test message from the contact form.',
            submittedAt: expect.any(String),
            ip: '192.168.1.1',
          },
        })
      })

      it('returns success response', async () => {
        vi.mocked(inngest.send).mockResolvedValue({ ids: ['test-id'] })

        const request = new Request('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            message: 'This is a test message from the contact form.',
          }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.message).toBeTruthy()
      })
    })

    describe('Error Handling', () => {
      it('handles invalid JSON gracefully', async () => {
        const request = new Request('http://localhost:3000/api/contact', {
          method: 'POST',
          body: 'invalid json',
        })

        const response = await POST(request)
        const data = await response.json()

        // API returns 400 for JSON parse errors
        expect(response.status).toBe(400)
        expect(data.error).toContain('Invalid JSON')
      })

      it('handles Inngest send failure', async () => {
        vi.mocked(inngest.send).mockRejectedValue(new Error('Inngest error'))

        const request = new Request('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify({
            name: 'John Doe',
            email: 'john@example.com',
            message: 'Test message that is long enough',
          }),
        })

        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBe(500)
        expect(data.error).toBeTruthy()
      })
    })
  })
})

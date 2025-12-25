import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import type { RedisClientType } from 'redis'

// Mock the redis module
vi.mock('redis', () => ({
  createClient: vi.fn(() => ({
    connect: vi.fn(),
    get: vi.fn(),
    incr: vi.fn(),
    zAdd: vi.fn(),
    zCount: vi.fn(),
    zRemRangeByScore: vi.fn(),
    on: vi.fn(),
    isOpen: false,
  })),
}))

describe('Views Utilities', () => {
  let mockRedisClient: any

  beforeEach(async () => {
    vi.resetModules()
    
    // Setup mock Redis client
    mockRedisClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      get: vi.fn(),
      incr: vi.fn(),
      zAdd: vi.fn(),
      zCount: vi.fn(),
      zRemRangeByScore: vi.fn(),
      on: vi.fn(),
      isOpen: false,
    }

    const { createClient } = await import('redis')
    vi.mocked(createClient).mockReturnValue(mockRedisClient as any)

    // Clear global client
    globalThis.__redisClient = undefined
  })

  afterEach(() => {
    vi.clearAllMocks()
    delete process.env.REDIS_URL
    globalThis.__redisClient = undefined
  })

  describe('incrementPostViews', () => {
    it('returns null when REDIS_URL is not set', async () => {
      delete process.env.REDIS_URL
      
      const { incrementPostViews } = await import('@/lib/views')
      const result = await incrementPostViews('test-post-id')
      
      expect(result).toBeNull()
    })

    it('increments view count and returns new value', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.incr.mockResolvedValue(10)
      mockRedisClient.zAdd.mockResolvedValue(1)
      mockRedisClient.zRemRangeByScore.mockResolvedValue(0)

      const { incrementPostViews } = await import('@/lib/views')
      const result = await incrementPostViews('test-post-id')

      expect(result).toBe(10)
      expect(mockRedisClient.incr).toHaveBeenCalledWith('views:post:test-post-id')
    })

    it('records view in history with timestamp', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.incr.mockResolvedValue(1)
      mockRedisClient.zAdd.mockResolvedValue(1)
      mockRedisClient.zRemRangeByScore.mockResolvedValue(0)

      const { incrementPostViews } = await import('@/lib/views')
      await incrementPostViews('test-post-id')

      expect(mockRedisClient.zAdd).toHaveBeenCalledWith(
        'views:history:post:test-post-id',
        expect.objectContaining({
          score: expect.any(Number),
          value: expect.any(String),
        })
      )
    })

    it('cleans up old views beyond 90 days', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.incr.mockResolvedValue(1)
      mockRedisClient.zAdd.mockResolvedValue(1)
      mockRedisClient.zRemRangeByScore.mockResolvedValue(5)

      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)

      const { incrementPostViews } = await import('@/lib/views')
      await incrementPostViews('test-post-id')

      const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000

      expect(mockRedisClient.zRemRangeByScore).toHaveBeenCalledWith(
        'views:history:post:test-post-id',
        '-inf',
        ninetyDaysAgo
      )
    })

    it('returns null on Redis error', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.incr.mockRejectedValue(new Error('Redis error'))

      const { incrementPostViews } = await import('@/lib/views')
      const result = await incrementPostViews('test-post-id')

      expect(result).toBeNull()
    })

    it('handles different post IDs', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.incr.mockResolvedValue(1)
      mockRedisClient.zAdd.mockResolvedValue(1)
      mockRedisClient.zRemRangeByScore.mockResolvedValue(0)

      const { incrementPostViews } = await import('@/lib/views')
      
      await incrementPostViews('post-1')
      expect(mockRedisClient.incr).toHaveBeenCalledWith('views:post:post-1')

      await incrementPostViews('post-2')
      expect(mockRedisClient.incr).toHaveBeenCalledWith('views:post:post-2')
    })
  })

  describe('getPostViews', () => {
    it('returns null when REDIS_URL is not set', async () => {
      delete process.env.REDIS_URL

      const { getPostViews } = await import('@/lib/views')
      const result = await getPostViews('test-post-id')

      expect(result).toBeNull()
    })

    it('returns view count for existing post', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.get.mockResolvedValue('1337')

      const { getPostViews } = await import('@/lib/views')
      const result = await getPostViews('test-post-id')

      expect(result).toBe(1337)
      expect(mockRedisClient.get).toHaveBeenCalledWith('views:post:test-post-id')
    })

    it('returns null for non-existent post', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.get.mockResolvedValue(null)

      const { getPostViews } = await import('@/lib/views')
      const result = await getPostViews('non-existent')

      expect(result).toBeNull()
    })

    it('returns null for invalid number values', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.get.mockResolvedValue('not-a-number')

      const { getPostViews } = await import('@/lib/views')
      const result = await getPostViews('test-post-id')

      expect(result).toBeNull()
    })

    it('handles zero views', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.get.mockResolvedValue('0')

      const { getPostViews } = await import('@/lib/views')
      const result = await getPostViews('test-post-id')

      expect(result).toBe(0)
    })

    it('returns null on Redis error', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.get.mockRejectedValue(new Error('Redis error'))

      const { getPostViews } = await import('@/lib/views')
      const result = await getPostViews('test-post-id')

      expect(result).toBeNull()
    })

    it('handles large view counts', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.get.mockResolvedValue('999999')

      const { getPostViews } = await import('@/lib/views')
      const result = await getPostViews('popular-post')

      expect(result).toBe(999999)
    })
  })

  describe('getPostViews24h', () => {
    it('returns null when REDIS_URL is not set', async () => {
      delete process.env.REDIS_URL

      const { getPostViews24h } = await import('@/lib/views')
      const result = await getPostViews24h('test-post-id')

      expect(result).toBeNull()
    })

    it('returns view count for last 24 hours', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.zCount.mockResolvedValue(42)

      const { getPostViews24h } = await import('@/lib/views')
      const result = await getPostViews24h('test-post-id')

      expect(result).toBe(42)
    })

    it('queries correct time range', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.zCount.mockResolvedValue(10)

      const now = Date.now()
      vi.spyOn(Date, 'now').mockReturnValue(now)

      const { getPostViews24h } = await import('@/lib/views')
      await getPostViews24h('test-post-id')

      const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000

      expect(mockRedisClient.zCount).toHaveBeenCalledWith(
        'views:history:post:test-post-id',
        twentyFourHoursAgo,
        now
      )
    })

    it('returns 0 for posts with no recent views', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.zCount.mockResolvedValue(0)

      const { getPostViews24h } = await import('@/lib/views')
      const result = await getPostViews24h('test-post-id')

      expect(result).toBe(0)
    })

    it('returns null on Redis error', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.zCount.mockRejectedValue(new Error('Redis error'))

      const { getPostViews24h } = await import('@/lib/views')
      const result = await getPostViews24h('test-post-id')

      expect(result).toBeNull()
    })
  })

  describe('Redis Client Management', () => {
    it('reuses existing Redis client', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.get.mockResolvedValue('1')

      const { getPostViews } = await import('@/lib/views')
      
      await getPostViews('post-1')
      await getPostViews('post-2')

      const { createClient } = await import('redis')
      expect(createClient).toHaveBeenCalledTimes(1)
    })

    it('connects to Redis if not already open', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.isOpen = false
      mockRedisClient.get.mockResolvedValue('1')

      const { getPostViews } = await import('@/lib/views')
      await getPostViews('test-post-id')

      expect(mockRedisClient.connect).toHaveBeenCalled()
    })

    it('does not reconnect if already open', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.isOpen = true
      mockRedisClient.get.mockResolvedValue('1')

      const { getPostViews } = await import('@/lib/views')
      await getPostViews('test-post-id')

      expect(mockRedisClient.connect).not.toHaveBeenCalled()
    })
  })

  describe('Key Formatting', () => {
    it('uses correct key prefix for view counts', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.get.mockResolvedValue('1')

      const { getPostViews } = await import('@/lib/views')
      await getPostViews('my-post-id')

      expect(mockRedisClient.get).toHaveBeenCalledWith('views:post:my-post-id')
    })

    it('uses correct key prefix for view history', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.zCount.mockResolvedValue(1)

      const { getPostViews24h } = await import('@/lib/views')
      await getPostViews24h('my-post-id')

      expect(mockRedisClient.zCount).toHaveBeenCalledWith(
        'views:history:post:my-post-id',
        expect.any(Number),
        expect.any(Number)
      )
    })
  })

  describe('Time Calculations', () => {
    it('correctly calculates 24-hour window', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.zCount.mockResolvedValue(5)

      const fixedTime = 1700000000000 // Fixed timestamp
      vi.spyOn(Date, 'now').mockReturnValue(fixedTime)

      const { getPostViews24h } = await import('@/lib/views')
      await getPostViews24h('test-post-id')

      const expectedStart = fixedTime - 24 * 60 * 60 * 1000
      
      expect(mockRedisClient.zCount).toHaveBeenCalledWith(
        'views:history:post:test-post-id',
        expectedStart,
        fixedTime
      )
    })

    it('cleanup removes views older than 90 days', async () => {
      process.env.REDIS_URL = 'redis://localhost:6379'
      mockRedisClient.incr.mockResolvedValue(1)
      mockRedisClient.zAdd.mockResolvedValue(1)
      mockRedisClient.zRemRangeByScore.mockResolvedValue(3)

      const fixedTime = 1700000000000
      vi.spyOn(Date, 'now').mockReturnValue(fixedTime)

      const { incrementPostViews } = await import('@/lib/views')
      await incrementPostViews('test-post-id')

      const expectedCutoff = fixedTime - 90 * 24 * 60 * 60 * 1000

      expect(mockRedisClient.zRemRangeByScore).toHaveBeenCalledWith(
        'views:history:post:test-post-id',
        '-inf',
        expectedCutoff
      )
    })
  })
})

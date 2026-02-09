/**
 * Memory API Routes Integration Test
 *
 * Tests the /api/memory/add and /api/memory/search endpoints
 * with the @dcyfr/ai memory layer integration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { POST as AddMemoryAPI } from '../../src/app/api/memory/add/route';
import { POST as SearchMemoryAPI } from '../../src/app/api/memory/search/route';

// Mock the dependencies
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(() => Promise.resolve({ success: true, reset: Date.now() + 60000 })),
  getClientIp: vi.fn(() => '127.0.0.1'),
  createRateLimitHeaders: vi.fn(() => ({})),
}));

vi.mock('@/lib/error-handler', () => ({
  handleApiError: vi.fn((error) => ({
    statusCode: 500,
    isConnectionError: false,
  })),
}));

// Mock the memory layer
const mockMemoryInstance = {
  addUserMemory: vi.fn(),
  searchUserMemories: vi.fn(),
};

vi.mock('@dcyfr/ai', () => ({
  getMemory: vi.fn(() => mockMemoryInstance),
  resetMemory: vi.fn(),
}));

describe('Memory API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock implementations
    mockMemoryInstance.addUserMemory.mockResolvedValue('memory-123');
    mockMemoryInstance.searchUserMemories.mockResolvedValue([
      {
        id: 'mem-1',
        content: 'I love working with TypeScript and React',
        importance: 0.8,
        topic: 'programming',
        createdAt: new Date('2024-01-01T10:00:00Z'),
      },
      {
        id: 'mem-2',
        content: 'Building full-stack applications is enjoyable',
        importance: 0.7,
        topic: 'development',
        createdAt: new Date('2024-01-01T11:00:00Z'),
      },
    ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/memory/add', () => {
    it('should add a memory successfully', async () => {
      const requestBody = {
        userId: 'test-user-123',
        message: 'I love working with TypeScript and React',
        context: { topic: 'programming' },
      };

      const request = new NextRequest('http://localhost:3000/api/memory/add', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await AddMemoryAPI(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.stored).toBe(true);
      expect(data.memoryId).toBeDefined();
      expect(typeof data.memoryId).toBe('string');
      expect(data.memoryId).toBe('memory-123');

      // Verify addUserMemory was called with correct parameters
      expect(mockMemoryInstance.addUserMemory).toHaveBeenCalledWith(
        'test-user-123',
        'I love working with TypeScript and React',
        { topic: 'programming' }
      );
    });

    it('should return 400 for missing userId', async () => {
      const requestBody = {
        message: 'Test message',
      };

      const request = new NextRequest('http://localhost:3000/api/memory/add', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await AddMemoryAPI(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/userId is required/i);
    });

    it('should return 400 for missing message', async () => {
      const requestBody = {
        userId: 'test-user-123',
      };

      const request = new NextRequest('http://localhost:3000/api/memory/add', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await AddMemoryAPI(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/message is required/i);
    });

    it('should return 413 for message too long', async () => {
      const requestBody = {
        userId: 'test-user-123',
        message: 'a'.repeat(10001), // Exceeds 10,000 character limit
      };

      const request = new NextRequest('http://localhost:3000/api/memory/add', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await AddMemoryAPI(request);
      const data = await response.json();

      expect(response.status).toBe(413);
      expect(data.error).toMatch(/cannot exceed/i);
    });

    it('should return 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/memory/add', {
        method: 'POST',
        body: 'invalid json{',
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await AddMemoryAPI(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/Invalid JSON/i);
    });
  });

  describe('POST /api/memory/search', () => {
    it('should search memories successfully', async () => {
      const requestBody = {
        userId: 'test-user-123',
        query: 'TypeScript programming',
        limit: 3,
      };

      const request = new NextRequest('http://localhost:3000/api/memory/search', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await SearchMemoryAPI(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.memories).toBeDefined();
      expect(Array.isArray(data.memories)).toBe(true);
      expect(data.count).toBeDefined();
      expect(data.limit).toBe(3);
      expect(data.memories).toHaveLength(2);

      // Check memory structure
      const memory = data.memories[0];
      expect(memory.id).toBeDefined();
      expect(memory.content).toBeDefined();
      expect(typeof memory.content).toBe('string');
      expect(memory.content).toBe('I love working with TypeScript and React');
      expect(memory.importance).toBe(0.8);
      expect(memory.topic).toBe('programming');
      expect(memory.createdAt).toBe('2024-01-01T10:00:00.000Z');

      // Verify memory search was called with correct parameters
      expect(mockMemoryInstance.searchUserMemories).toHaveBeenCalledWith(
        'test-user-123',
        'TypeScript programming',
        3
      );
    });

    it('should return 400 for missing userId', async () => {
      const requestBody = {
        query: 'TypeScript',
      };

      const request = new NextRequest('http://localhost:3000/api/memory/search', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await SearchMemoryAPI(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/userId is required/i);
    });

    it('should return 400 for missing query', async () => {
      const requestBody = {
        userId: 'test-user-123',
      };

      const request = new NextRequest('http://localhost:3000/api/memory/search', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await SearchMemoryAPI(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/query is required/i);
    });

    it('should return 400 for limit exceeding maximum', async () => {
      const requestBody = {
        userId: 'test-user-123',
        query: 'TypeScript',
        limit: 15, // Exceeds MAX_LIMIT of 10
      };

      const request = new NextRequest('http://localhost:3000/api/memory/search', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await SearchMemoryAPI(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/cannot exceed 10/i);
    });

    it('should use default limit when not specified', async () => {
      const requestBody = {
        userId: 'test-user-123',
        query: 'programming',
      };

      const request = new NextRequest('http://localhost:3000/api/memory/search', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await SearchMemoryAPI(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.limit).toBe(3); // DEFAULT_LIMIT

      // Verify search was called with default limit
      expect(mockMemoryInstance.searchUserMemories).toHaveBeenCalledWith(
        'test-user-123',
        'programming',
        3
      );
    });

    it('should return 400 for empty query', async () => {
      const requestBody = {
        userId: 'test-user-123',
        query: '   ', // Empty after trim
      };

      const request = new NextRequest('http://localhost:3000/api/memory/search', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await SearchMemoryAPI(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/cannot be empty/i);
    });

    it('should return 400 for query too long', async () => {
      const requestBody = {
        userId: 'test-user-123',
        query: 'a'.repeat(1001), // Exceeds 1,000 character limit
      };

      const request = new NextRequest('http://localhost:3000/api/memory/search', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await SearchMemoryAPI(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toMatch(/cannot exceed 1,000/i);
    });
  });
});

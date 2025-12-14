import { describe, test, expect, vi } from 'vitest';
import { GET } from '@/app/api/health/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@sentry/nextjs', () => ({
  captureCheckIn: vi.fn(),
  captureException: vi.fn()
}));

vi.mock('@/lib/api-security', () => ({
  blockExternalAccess: vi.fn(() => null) // Allow access for tests
}));

vi.mock('@/lib/github-data', () => ({
  checkGitHubDataHealth: vi.fn(() => Promise.resolve({
    lastUpdated: '2024-12-14T00:00:00Z',
    totalContributions: 100,
    cacheAvailable: true,
    dataFresh: true
  }))
}));

describe('Health Check API (/api/health)', () => {
  test('returns health status with correct structure', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('services');
    expect(data).toHaveProperty('serverInfo');
    expect(data).toHaveProperty('githubInfo');
  });

  test('includes service health checks', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();
    
    expect(data.services).toHaveProperty('edge');
    expect(data.services).toHaveProperty('vercel');
    expect(data.services.edge).toBe(true);
    expect(data.services.vercel).toBe(true);
  });

  test('returns timestamp in ISO format', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();
    
    expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    
    const timestamp = new Date(data.timestamp);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.getTime()).not.toBeNaN();
  });

  test('includes server information', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();
    
    expect(data.serverInfo).toHaveProperty('runtime');
    expect(data.serverInfo).toHaveProperty('region');
    expect(data.serverInfo.runtime).toBe('nodejs');
  });

  test('includes GitHub data health status', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();
    
    expect(data.githubInfo).toHaveProperty('lastUpdated');
    expect(data.githubInfo).toHaveProperty('totalContributions');
    expect(data.githubInfo).toHaveProperty('cacheAvailable');
    expect(data.githubInfo).toHaveProperty('dataFresh');
  });

  test('returns healthy status when all services operational', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    const data = await response.json();
    
    expect(data.status).toBe('healthy');
    expect(response.status).toBe(200);
  });

  test('returns correct content type headers', async () => {
    const request = new NextRequest('http://localhost:3000/api/health');
    const response = await GET(request);
    
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(response.headers.get('cache-control')).toContain('no-store');
  });

  test('handles external access blocking', async () => {
    const { blockExternalAccess } = await import('@/lib/api-security');
    
    // Mock blocked access
    vi.mocked(blockExternalAccess).mockReturnValueOnce(
      new Response('Forbidden', { status: 403 })
    );
    
    const request = new NextRequest('http://example.com/api/health');
    const response = await GET(request);
    
    expect(response.status).toBe(403);
  });
});
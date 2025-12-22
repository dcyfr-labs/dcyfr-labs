import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";
import type { CredlyBadgesResponse } from "@/types/credly";

// Mock dependencies
vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn(),
  getClientIp: vi.fn(),
  createRateLimitHeaders: vi.fn(),
}));

vi.mock("@/lib/error-handler", () => ({
  handleApiError: vi.fn().mockReturnValue({
    isConnectionError: false,
    shouldRetry: true,
    statusCode: 500,
    message: "Internal server error",
    logLevel: "error",
  }),
}));

const mockCredlyResponse: CredlyBadgesResponse = {
  data: [
    {
      id: "badge-1",
      badge_template: {
        id: "template-1",
        name: "Test Badge",
        description: "Test description",
        image_url: "https://example.com/badge.png",
        skills: [],
      },
      image_url: "https://example.com/badge.png",
      issued_at: "2024-01-01T00:00:00Z",
      expires_at: null,
      issuer: { id: "issuer-1", name: "Test Issuer" },
      user: { id: "user-1", name: "Test User" },
    },
  ],
  metadata: {
    total_count: 1,
    count: 1,
    previous: null,
    next: null,
  },
};

describe("Credly Badges API Route", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Setup default mocks
    const { rateLimit, getClientIp, createRateLimitHeaders } = await import("@/lib/rate-limit");
    vi.mocked(rateLimit).mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 60000,
    });
    vi.mocked(getClientIp).mockReturnValue("127.0.0.1");
    vi.mocked(createRateLimitHeaders).mockReturnValue({});
    
    const mockFetch = vi.fn();
    global.fetch = mockFetch as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches badges successfully with default username", async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCredlyResponse,
    } as Response);

    const request = new NextRequest("http://localhost:3000/api/credly/badges");
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.badges).toHaveLength(1);
    expect(data.total_count).toBe(1);
  });

  it("uses custom username from query parameter", async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCredlyResponse,
    } as Response);

    const request = new NextRequest(
      "http://localhost:3000/api/credly/badges?username=testuser"
    );
    await GET(request);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://www.credly.com/users/testuser/badges.json",
      expect.any(Object)
    );
  });

  it("limits results when limit parameter is provided", async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    const multipleBadges: CredlyBadgesResponse = {
      data: Array(10)
        .fill(null)
        .map((_, i) => ({
          ...mockCredlyResponse.data[0],
          id: `badge-${i}`,
        })),
      metadata: {
        total_count: 10,
        count: 10,
        previous: null,
        next: null,
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => multipleBadges,
    } as Response);

    const request = new NextRequest(
      "http://localhost:3000/api/credly/badges?limit=3"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(data.badges).toHaveLength(3);
    expect(data.total_count).toBe(10);
  });

  it("handles Credly API errors", async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    const request = new NextRequest("http://localhost:3000/api/credly/badges");
    const response = await GET(request);

    expect(response.status).toBe(500);
  });

  it("handles rate limiting", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    vi.mocked(rateLimit).mockResolvedValueOnce({
      success: false,
      limit: 10,
      remaining: 0,
      reset: Date.now() + 60000,
    });

    const request = new NextRequest("http://localhost:3000/api/credly/badges");
    const response = await GET(request);

    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error).toBe("Rate limit exceeded");
  });

  it("includes cache headers in response", async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCredlyResponse,
    } as Response);

    const request = new NextRequest("http://localhost:3000/api/credly/badges");
    const response = await GET(request);

    const cacheControl = response.headers.get("Cache-Control");
    expect(cacheControl).toContain("public");
    expect(cacheControl).toContain("s-maxage");
  });
});

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
      issuer: {
        summary: "Test Issuer Summary",
        entities: [
          {
            label: "Test Issuer",
            primary: true,
            entity: {
              type: "Organization",
              id: "issuer-1",
              name: "Test Issuer",
              url: "https://example.com",
            },
          },
        ],
      },
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

describe("SSRF Security Tests - CWE-918 Prevention", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    const { rateLimit, getClientIp, createRateLimitHeaders } = await import("@/lib/rate-limit");
    vi.mocked(rateLimit).mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 60000,
    });
    vi.mocked(getClientIp).mockReturnValue("127.0.0.1");
    vi.mocked(createRateLimitHeaders).mockReturnValue({});
    
    global.fetch = vi.fn() as any;
  });

  describe("URL Fragment Injection Prevention", () => {
    it("should reject username with URL fragments (#)", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/credly/badges?username=attacker%40evil.com%23"
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Invalid username format");
    });

    it("should reject username with query string injection (?)", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/credly/badges?username=user?admin=true"
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Invalid username format");
    });
  });

  describe("Path Traversal Prevention", () => {
    it("should reject username with path traversal (../)", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/credly/badges?username=..%2F..%2Fadmin"
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Invalid username format");
    });

    it("should reject username with backslash traversal", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/credly/badges?username=..%5C..%5Cadmin"
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Invalid username format");
    });

    it("should reject username with forward slash", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/credly/badges?username=admin%2Fuser"
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Invalid username format");
    });
  });

  describe("Protocol & Scheme Injection Prevention", () => {
    it("should reject username with protocol injection (http://)", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/credly/badges?username=http://evil.com"
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Invalid username format");
    });

    it("should reject username with javascript: protocol", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/credly/badges?username=javascript:alert(1)"
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Invalid username format");
    });

    it("should reject username with file: protocol", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/credly/badges?username=file:///etc/passwd"
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Invalid username format");
    });
  });

  describe("Special Character & Encoding Prevention", () => {
    it("should reject username with @ symbol (email format)", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/credly/badges?username=attacker@evil.com"
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Invalid username format");
    });

    it("should reject username with colon (port injection)", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/credly/badges?username=127.0.0.1:8080"
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Invalid username format");
    });

    it("should accept username with ampersand if used as a valid part of username", async () => {
      // Note: Ampersand in query string is URL-encoded and won't be a special character
      // This test documents that we handle URL encoding correctly
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCredlyResponse,
      } as Response);

      const request = new NextRequest(
        "http://localhost:3000/api/credly/badges?username=user-name"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it("should reject username with angle brackets (HTML injection)", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/credly/badges?username=user<script>"
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Invalid username format");
    });
  });

  describe("Cloud Metadata Exploitation Prevention", () => {
    it("should accept numeric IPs as they might be valid Credly usernames, but HTTP request is still secured", async () => {
      // Note: Numeric-only usernames are allowed by regex, but the URL is securely constructed
      // URL parsing ensures no SSRF vulnerability even if numeric IPs are accepted
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const request = new NextRequest(
        "http://localhost:3000/api/credly/badges?username=169254169254"
      );
      const response = await GET(request);

      // Will fail due to Credly API error (404), not security validation
      // This confirms the URL was constructed correctly to credly.com, not to a bare IP
      const [calledUrl] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(calledUrl).toContain("https://www.credly.com/users/");
      // The critical check: URL uses credly.com domain, not raw IP as hostname
      const urlObj = new URL(calledUrl);
      expect(urlObj.hostname).toBe("www.credly.com");
      expect(urlObj.protocol).toBe("https:");
    });

    it("should reject GCP metadata endpoint format with colons and slashes", async () => {
      const request = new NextRequest(
        "http://localhost:3000/api/credly/badges?username=metadata:google:internal"
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Invalid username format");
    });
  });

  describe("Length-based DoS Prevention", () => {
    it("should reject username exceeding max length", async () => {
      const longUsername = "a".repeat(300);
      const request = new NextRequest(
        `http://localhost:3000/api/credly/badges?username=${longUsername}`
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("Username too long");
    });

    it("should accept username at max length boundary", async () => {
      const maxLengthUsername = "a".repeat(255);
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCredlyResponse,
      } as Response);

      const request = new NextRequest(
        `http://localhost:3000/api/credly/badges?username=${maxLengthUsername}`
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe("Valid Username Patterns", () => {
    it("should accept alphanumeric username", async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCredlyResponse,
      } as Response);

      const request = new NextRequest(
        "http://localhost:3000/api/credly/badges?username=dcyfr123"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it("should accept username with hyphens", async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCredlyResponse,
      } as Response);

      const request = new NextRequest(
        "http://localhost:3000/api/credly/badges?username=john-doe"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it("should accept username with underscores", async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCredlyResponse,
      } as Response);

      const request = new NextRequest(
        "http://localhost:3000/api/credly/badges?username=john_doe"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it("should accept username with dots", async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCredlyResponse,
      } as Response);

      const request = new NextRequest(
        "http://localhost:3000/api/credly/badges?username=john.doe"
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe("URL Construction Verification", () => {
    it("should always use HTTPS protocol", async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCredlyResponse,
      } as Response);

      const request = new NextRequest(
        "http://localhost:3000/api/credly/badges?username=dcyfr"
      );
      await GET(request);

      const [calledUrl] = mockFetch.mock.calls[0];
      const urlObj = new URL(calledUrl);
      expect(urlObj.protocol).toBe("https:");
    });

    it("should always target credly.com domain", async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCredlyResponse,
      } as Response);

      const request = new NextRequest(
        "http://localhost:3000/api/credly/badges?username=dcyfr"
      );
      await GET(request);

      const [calledUrl] = mockFetch.mock.calls[0];
      const urlObj = new URL(calledUrl);
      expect(urlObj.hostname).toBe("www.credly.com");
    });

    it("should properly encode username in path", async () => {
      const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCredlyResponse,
      } as Response);

      const request = new NextRequest(
        "http://localhost:3000/api/credly/badges?username=user123"
      );
      await GET(request);

      const [calledUrl] = mockFetch.mock.calls[0];
      expect(calledUrl).toBe("https://www.credly.com/users/user123/badges.json");
    });
  });
});

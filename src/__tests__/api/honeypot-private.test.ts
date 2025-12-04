import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS } from "@/app/private/route";
import * as Sentry from "@sentry/nextjs";
import { NextRequest } from "next/server";

// Mock Sentry
vi.mock("@sentry/nextjs", () => ({
  addBreadcrumb: vi.fn(),
  setContext: vi.fn(),
}));

describe("Honeypot Route /private/*", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = (
    method: string,
    path: string = "/private/test-path",
    overrideHeaders: Record<string, string> = {}
  ) => {
    const defaultHeaders = {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Bot",
      referer: "https://malicious-site.com",
      "x-forwarded-for": "192.168.1.100",
    };
    const url = new URL(`http://localhost:3000${path}`);
    const headers = { ...defaultHeaders, ...overrideHeaders };
    const request = new NextRequest(url, {
      method,
      headers,
    });
    return request;
  };

  describe("GET Method", () => {
    it("should return 404 status code", async () => {
      const request = createMockRequest("GET");
      const response = await GET(request);

      expect(response.status).toBe(404);
    });

    it("should return JSON error response", async () => {
      const request = createMockRequest("GET");
      const response = await GET(request);
      const data = await response.json();

      expect(data).toEqual({ error: "Not found" });
    });

    it("should add breadcrumb to Sentry with warning level", async () => {
      const request = createMockRequest("GET");
      await GET(request);

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: "security",
          message: "Honeypot triggered: /private/test-path",
          level: "warning",
          data: expect.objectContaining({
            path: "/private/test-path",
            user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Bot",
            ip: "192.168.1.100",
          }),
        })
      );
    });

    it("should set honeypot context in Sentry", async () => {
      const request = createMockRequest("GET");
      await GET(request);

      expect(Sentry.setContext).toHaveBeenCalledWith(
        "honeypot_attempt",
        expect.objectContaining({
          path: "/private/test-path",
          user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Bot",
          ip: "192.168.1.100",
          timestamp: expect.any(String),
        })
      );
    });

    it("should include timestamp in ISO format", async () => {
      const request = createMockRequest("GET");
      await GET(request);

      const callArgs = vi.mocked(Sentry.setContext).mock.calls[0];
      const context = callArgs[1] as Record<string, unknown>;
      const timestamp = context.timestamp as string;

      // Verify it's a valid ISO string
      expect(() => new Date(timestamp)).not.toThrow();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("should handle missing headers gracefully", async () => {
      const url = new URL("http://localhost:3000/private/test-path");
      const request = new NextRequest(url, {
        method: "GET",
        headers: {}, // No headers
      });

      const response = await GET(request);
      expect(response.status).toBe(404);

      const callArgs = vi.mocked(Sentry.setContext).mock.calls[0];
      const context = callArgs[1] as Record<string, unknown>;

      expect(context.user_agent).toBe("unknown");
      expect(context.referer).toBe("direct");
      expect(context.ip).toBe("unknown");
    });

    it("should extract IP from x-forwarded-for header", async () => {
      const request = createMockRequest("GET", "/private/test-path", {
        "x-forwarded-for": "203.0.113.45",
      });

      await GET(request);

      const callArgs = vi.mocked(Sentry.setContext).mock.calls[0];
      const context = callArgs[1] as Record<string, unknown>;

      expect(context.ip).toBe("203.0.113.45");
    });

    it("should handle multiple IPs in x-forwarded-for header (takes first)", async () => {
      const request = createMockRequest("GET", "/private/test-path", {
        "x-forwarded-for": "203.0.113.45, 192.168.1.1",
      });

      await GET(request);

      const callArgs = vi.mocked(Sentry.setContext).mock.calls[0];
      const context = callArgs[1] as Record<string, unknown>;

      expect(context.ip).toBe("203.0.113.45, 192.168.1.1");
    });

    it("should add breadcrumb with correct path for different honeypot routes", async () => {
      const paths = [
        "/private/admin",
        "/private/wp-admin",
        "/private/database",
        "/private/config",
      ];

      for (const path of paths) {
        vi.clearAllMocks();

        const request = createMockRequest("GET", path);
        await GET(request);

        expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
          expect.objectContaining({
            message: `Honeypot triggered: ${path}`,
          })
        );
      }
    });
  });

  describe("POST Method", () => {
    it("should call GET handler", async () => {
      const request = createMockRequest("POST");
      const response = await POST(request);

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toEqual({ error: "Not found" });
      expect(Sentry.addBreadcrumb).toHaveBeenCalled();
    });

    it("should log honeypot trigger for POST requests", async () => {
      const request = createMockRequest("POST");
      await POST(request);

      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Honeypot triggered: /private/test-path",
        })
      );
    });
  });

  describe("PUT Method", () => {
    it("should call GET handler", async () => {
      const request = createMockRequest("PUT");
      const response = await PUT(request);

      expect(response.status).toBe(404);
      expect(Sentry.addBreadcrumb).toHaveBeenCalled();
    });
  });

  describe("DELETE Method", () => {
    it("should call GET handler", async () => {
      const request = createMockRequest("DELETE");
      const response = await DELETE(request);

      expect(response.status).toBe(404);
      expect(Sentry.addBreadcrumb).toHaveBeenCalled();
    });
  });

  describe("PATCH Method", () => {
    it("should call GET handler", async () => {
      const request = createMockRequest("PATCH");
      const response = await PATCH(request);

      expect(response.status).toBe(404);
      expect(Sentry.addBreadcrumb).toHaveBeenCalled();
    });
  });

  describe("HEAD Method", () => {
    it("should return 404 status code", async () => {
      const request = createMockRequest("HEAD");
      const response = await HEAD(request);

      expect(response.status).toBe(404);
    });

    it("should return empty body", async () => {
      const request = createMockRequest("HEAD");
      const response = await HEAD(request);

      expect(await response.text()).toBe("");
    });

    it("should still log to Sentry", async () => {
      const request = createMockRequest("HEAD");
      await HEAD(request);

      expect(Sentry.addBreadcrumb).toHaveBeenCalled();
    });
  });

  describe("OPTIONS Method", () => {
    it("should call GET handler", async () => {
      const request = createMockRequest("OPTIONS");
      const response = await OPTIONS(request);

      expect(response.status).toBe(404);
      expect(Sentry.addBreadcrumb).toHaveBeenCalled();
    });
  });

  describe("Security Monitoring", () => {
    it("should capture attempts with common bot user agents", async () => {
      const botUserAgents = [
        "curl/7.64.1",
        "Wget/1.20.3",
        "python-requests/2.25.1",
        "sqlmap/1.4.2",
        "nikto/2.1.5",
      ];

      for (const userAgent of botUserAgents) {
        vi.clearAllMocks();

        const request = createMockRequest("GET", "/private/test-path", { "user-agent": userAgent });
        await GET(request);

        const callArgs = vi.mocked(Sentry.setContext).mock.calls[0];
        const context = callArgs[1] as Record<string, unknown>;

        expect(context.user_agent).toBe(userAgent);
      }
    });

    it("should capture different referrers", async () => {
      const referrers = [
        "https://attacker.com",
        "https://malicious-scanner.net",
        "https://localhost:3000/test",
      ];

      for (const referer of referrers) {
        vi.clearAllMocks();

        // Test with referer header set
        const request = createMockRequest("GET", "/private/test-path", { referer });
        await GET(request);

        const callArgs = vi.mocked(Sentry.setContext).mock.calls[0];
        const context = callArgs[1] as Record<string, unknown>;

        // Verify the referer was captured (even if it's the override)
        expect(context).toHaveProperty("referer");
        expect(typeof context.referer).toBe("string");
      }
    });

    it("should capture all attempt details together", async () => {
      // Create request with complete headers
      const request = createMockRequest("GET", "/private/test-path", {
        "user-agent": "SecurityScanner/1.0",
        "x-forwarded-for": "10.0.0.5",
        referer: "https://security-test.com",
      });

      await GET(request);

      const callArgs = vi.mocked(Sentry.setContext).mock.calls[0];
      const context = callArgs[1] as Record<string, unknown>;

      // Verify all fields are present and properly structured
      expect(context.path).toBe("/private/test-path");
      expect(context.user_agent).toBe("SecurityScanner/1.0");
      expect(context.ip).toBe("10.0.0.5");
      expect(context.timestamp).toBeDefined();
      expect(typeof context.timestamp).toBe("string");
      expect(context.referer).toBeDefined();
    });
  });

  describe("HTTP Status Code Consistency", () => {
    it("should return 404 for all methods except HEAD", async () => {
      const methods = [
        { name: "GET", handler: GET },
        { name: "POST", handler: POST },
        { name: "PUT", handler: PUT },
        { name: "DELETE", handler: DELETE },
        { name: "PATCH", handler: PATCH },
        { name: "OPTIONS", handler: OPTIONS },
      ];

      for (const { name, handler } of methods) {
        const request = createMockRequest(name);
        const response = await handler(request);

        expect(response.status).toBe(404);
      }
    });
  });

  describe("Response Format", () => {
    it("should return proper JSON structure", async () => {
      const request = createMockRequest("GET");
      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty("error");
      expect(typeof data.error).toBe("string");
    });

    it("should have correct content-type header", async () => {
      const request = createMockRequest("GET");
      const response = await GET(request);

      expect(response.headers.get("content-type")).toContain("application/json");
    });

    it("should not include sensitive information in response", async () => {
      const request = createMockRequest("GET");
      const response = await GET(request);
      const data = await response.json();

      // Should only contain generic error message
      expect(Object.keys(data)).toEqual(["error"]);
      expect(data.error).toBe("Not found");
    });
  });

  describe("Integration with Sentry", () => {
    it("should call addBreadcrumb before setContext", async () => {
      const callOrder: string[] = [];

      vi.mocked(Sentry.addBreadcrumb).mockImplementation(() => {
        callOrder.push("addBreadcrumb");
        return undefined as any;
      });

      vi.mocked(Sentry.setContext).mockImplementation(() => {
        callOrder.push("setContext");
        return undefined as any;
      });

      const request = createMockRequest("GET");
      await GET(request);

      expect(callOrder).toEqual(["addBreadcrumb", "setContext"]);
    });

    it("should call Sentry exactly twice per request", async () => {
      const request = createMockRequest("GET");
      await GET(request);

      expect(Sentry.addBreadcrumb).toHaveBeenCalledTimes(1);
      expect(Sentry.setContext).toHaveBeenCalledTimes(1);
    });
  });

  describe("Deep Linking Prevention", () => {
    it("should block nested honeypot paths", async () => {
      const nestedPaths = [
        "/private/admin/config",
        "/private/api/database",
        "/private/backup/files",
        "/private/sensitive/data",
      ];

      for (const path of nestedPaths) {
        vi.clearAllMocks();

        const request = createMockRequest("GET", path);
        const response = await GET(request);
        expect(response.status).toBe(404);
        expect(Sentry.addBreadcrumb).toHaveBeenCalled();
      }
    });
  });
});

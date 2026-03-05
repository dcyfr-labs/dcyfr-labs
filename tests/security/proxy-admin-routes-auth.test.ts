import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

function createRequest(pathname: string, headers?: HeadersInit): NextRequest {
  return new NextRequest(`http://localhost:3000${pathname}`, {
    headers,
  });
}

describe("proxy admin route auth hardening", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_API_KEY", "super-secret-admin-key");
  });

  it("blocks unauthenticated admin dashboard requests in production", () => {
    const request = createRequest("/admin/analytics");
    const response = proxy(request);

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toBe(
      'Basic realm="Admin Dashboard"'
    );
  });

  it("allows admin dashboard requests with bearer ADMIN_API_KEY", () => {
    const request = createRequest("/admin/mcp-health", {
      Authorization: "Bearer super-secret-admin-key",
    });

    const response = proxy(request);

    expect(response.status).toBe(200);
  });

  it("allows admin dashboard requests with basic auth ADMIN_API_KEY password", () => {
    const basicToken = Buffer.from("admin:super-secret-admin-key").toString(
      "base64"
    );

    const request = createRequest("/admin/analytics", {
      Authorization: `Basic ${basicToken}`,
    });

    const response = proxy(request);

    expect(response.status).toBe(200);
  });

  it("rejects admin dashboard requests with invalid credentials", () => {
    const request = createRequest("/admin/analytics", {
      Authorization: "Bearer wrong-key",
    });

    const response = proxy(request);

    expect(response.status).toBe(401);
  });

  it("keeps /api/admin fallback behavior for non-internal requests without auth", () => {
    const request = createRequest("/api/admin/api-usage");
    const response = proxy(request);

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toBe(
      'Bearer realm="Admin API"'
    );
  });

  it("does not enforce dashboard auth outside production", () => {
    vi.stubEnv("NODE_ENV", "development");

    const request = createRequest("/admin/analytics");
    const response = proxy(request);

    expect(response.status).toBe(200);
  });
});

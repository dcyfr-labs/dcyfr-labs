/**
 * GitHub Webhook API Route Tests
 *
 * Tests webhook signature verification, payload parsing,
 * and Inngest event queuing for GitHub push events.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createHmac } from "crypto";
import { NextRequest } from "next/server";

// Mock Inngest client
const mockSend = vi.fn();
vi.mock("@/inngest/client", () => ({
  inngest: {
    send: mockSend,
  },
}));

describe("GitHub Webhook API Route", () => {
  const WEBHOOK_SECRET = "test-webhook-secret";
  const REPO_NAME = "dcyfr/dcyfr-labs";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GITHUB_WEBHOOK_SECRET = WEBHOOK_SECRET;
  });

  afterEach(() => {
    delete process.env.GITHUB_WEBHOOK_SECRET;
  });

  /**
   * Helper: Create valid GitHub webhook signature
   */
  function createSignature(payload: string, secret: string): string {
    const hash = createHmac("sha256", secret).update(payload).digest("hex");
    return `sha256=${hash}`;
  }

  /**
   * Helper: Create mock GitHub push payload
   */
  function createPushPayload(commits: number = 1) {
    return {
      ref: "refs/heads/main",
      repository: {
        full_name: REPO_NAME,
      },
      commits: Array.from({ length: commits }, (_, i) => ({
        id: `abc123${i}`.padEnd(40, "0"),
        message: `Test commit ${i + 1}\n\nDetailed description`,
        author: {
          name: "Test Author",
          email: "test@example.com",
        },
        timestamp: new Date().toISOString(),
        url: `https://github.com/${REPO_NAME}/commit/abc123${i}`,
      })),
    };
  }

  describe("Signature Verification", () => {
    it("should reject requests without signature header", async () => {
      const payload = JSON.stringify(createPushPayload());
      const { POST } = await import("@/app/api/github/webhook/route");

      const request = new NextRequest("http://localhost:3000/api/github/webhook", {
        method: "POST",
        body: payload,
        headers: {
          "x-github-event": "push",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Missing signature header");
    });

    it("should reject requests with invalid signature", async () => {
      const payload = JSON.stringify(createPushPayload());
      const invalidSignature = "sha256=invalid";
      const { POST } = await import("@/app/api/github/webhook/route");

      const request = new NextRequest("http://localhost:3000/api/github/webhook", {
        method: "POST",
        body: payload,
        headers: {
          "x-github-event": "push",
          "x-hub-signature-256": invalidSignature,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Invalid signature");
    });

    it("should accept requests with valid signature", async () => {
      const payload = JSON.stringify(createPushPayload());
      const signature = createSignature(payload, WEBHOOK_SECRET);
      const { POST } = await import("@/app/api/github/webhook/route");

      const request = new NextRequest("http://localhost:3000/api/github/webhook", {
        method: "POST",
        body: payload,
        headers: {
          "x-github-event": "push",
          "x-hub-signature-256": signature,
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });

  describe("Event Type Filtering", () => {
    it("should only process push events", async () => {
      const payload = JSON.stringify(createPushPayload());
      const signature = createSignature(payload, WEBHOOK_SECRET);
      const { POST } = await import("@/app/api/github/webhook/route");

      const request = new NextRequest("http://localhost:3000/api/github/webhook", {
        method: "POST",
        body: payload,
        headers: {
          "x-github-event": "pull_request",
          "x-hub-signature-256": signature,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain("Event type not supported");
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("should process push events", async () => {
      const payload = JSON.stringify(createPushPayload());
      const signature = createSignature(payload, WEBHOOK_SECRET);
      const { POST } = await import("@/app/api/github/webhook/route");

      const request = new NextRequest("http://localhost:3000/api/github/webhook", {
        method: "POST",
        body: payload,
        headers: {
          "x-github-event": "push",
          "x-hub-signature-256": signature,
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      expect(mockSend).toHaveBeenCalled();
    });
  });

  describe("Repository Filtering", () => {
    it("should only process configured repository", async () => {
      const payloadData = createPushPayload();
      payloadData.repository.full_name = "other/repo";
      const payload = JSON.stringify(payloadData);
      const signature = createSignature(payload, WEBHOOK_SECRET);
      const { POST } = await import("@/app/api/github/webhook/route");

      const request = new NextRequest("http://localhost:3000/api/github/webhook", {
        method: "POST",
        body: payload,
        headers: {
          "x-github-event": "push",
          "x-hub-signature-256": signature,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toContain("Repository not configured");
      expect(mockSend).not.toHaveBeenCalled();
    });
  });

  describe("Commit Processing", () => {
    it("should extract commits from payload", async () => {
      const payload = JSON.stringify(createPushPayload(2));
      const signature = createSignature(payload, WEBHOOK_SECRET);
      const { POST } = await import("@/app/api/github/webhook/route");

      const request = new NextRequest("http://localhost:3000/api/github/webhook", {
        method: "POST",
        body: payload,
        headers: {
          "x-github-event": "push",
          "x-hub-signature-256": signature,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.commitsProcessed).toBe(2);
      expect(mockSend).toHaveBeenCalledTimes(2);
    });

    it("should queue Inngest events for each commit", async () => {
      const payload = JSON.stringify(createPushPayload(1));
      const signature = createSignature(payload, WEBHOOK_SECRET);
      const { POST } = await import("@/app/api/github/webhook/route");

      const request = new NextRequest("http://localhost:3000/api/github/webhook", {
        method: "POST",
        body: payload,
        headers: {
          "x-github-event": "push",
          "x-hub-signature-256": signature,
        },
      });

      await POST(request);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "github/commit.pushed",
          data: expect.objectContaining({
            hash: expect.any(String),
            message: expect.any(String),
            author: "Test Author",
            email: "test@example.com",
            url: expect.stringContaining("github.com"),
            timestamp: expect.any(String),
            branch: "main",
            repository: REPO_NAME,
          }),
        })
      );
    });

    it("should handle empty commit list", async () => {
      const payloadData = createPushPayload(0);
      const payload = JSON.stringify(payloadData);
      const signature = createSignature(payload, WEBHOOK_SECRET);
      const { POST } = await import("@/app/api/github/webhook/route");

      const request = new NextRequest("http://localhost:3000/api/github/webhook", {
        method: "POST",
        body: payload,
        headers: {
          "x-github-event": "push",
          "x-hub-signature-256": signature,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("No commits in payload");
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("should extract short SHA from commit hash", async () => {
      const payload = JSON.stringify(createPushPayload(1));
      const signature = createSignature(payload, WEBHOOK_SECRET);
      const { POST } = await import("@/app/api/github/webhook/route");

      const request = new NextRequest("http://localhost:3000/api/github/webhook", {
        method: "POST",
        body: payload,
        headers: {
          "x-github-event": "push",
          "x-hub-signature-256": signature,
        },
      });

      await POST(request);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            hash: expect.stringMatching(/^[a-f0-9]{7}$/),
          }),
        })
      );
    });

    it("should extract first line of commit message", async () => {
      const payload = JSON.stringify(createPushPayload(1));
      const signature = createSignature(payload, WEBHOOK_SECRET);
      const { POST } = await import("@/app/api/github/webhook/route");

      const request = new NextRequest("http://localhost:3000/api/github/webhook", {
        method: "POST",
        body: payload,
        headers: {
          "x-github-event": "push",
          "x-hub-signature-256": signature,
        },
      });

      await POST(request);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            message: "Test commit 1",
          }),
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed JSON payload", async () => {
      const payload = "invalid json";
      const signature = createSignature(payload, WEBHOOK_SECRET);
      const { POST } = await import("@/app/api/github/webhook/route");

      const request = new NextRequest("http://localhost:3000/api/github/webhook", {
        method: "POST",
        body: payload,
        headers: {
          "x-github-event": "push",
          "x-hub-signature-256": signature,
        },
      });

      const response = await POST(request);
      expect(response.status).toBe(500);
    });

    it("should handle missing GITHUB_WEBHOOK_SECRET", async () => {
      delete process.env.GITHUB_WEBHOOK_SECRET;
      const payload = JSON.stringify(createPushPayload());
      const { POST } = await import("@/app/api/github/webhook/route");

      const request = new NextRequest("http://localhost:3000/api/github/webhook", {
        method: "POST",
        body: payload,
        headers: {
          "x-github-event": "push",
          "x-hub-signature-256": "sha256=test",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Invalid signature");
    });
  });

  describe("Health Check Endpoint", () => {
    it("should respond to GET requests", async () => {
      const { GET } = await import("@/app/api/github/webhook/route");

      const request = new NextRequest("http://localhost:3000/api/github/webhook", {
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        status: "ok",
        webhook: "github",
        repository: REPO_NAME,
      });
    });
  });
});

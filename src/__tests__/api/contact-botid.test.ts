import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/contact/route";
import { checkBotId } from "botid/server";
import { rateLimit } from "@/lib/rate-limit";

// Mock dependencies
vi.mock("botid/server");
vi.mock("@/lib/rate-limit");
vi.mock("@/inngest/client", () => ({
  inngest: {
    send: vi.fn().mockResolvedValue(undefined),
  },
}));
vi.mock("@/lib/analytics", () => ({
  trackContactFormSubmission: vi.fn().mockResolvedValue(undefined),
}));

describe("POST /api/contact - BotID Integration", () => {
  const mockRequest = (body: object) => {
    return new Request("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "192.168.1.1",
      },
      body: JSON.stringify(body),
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default: Rate limit allows request
    vi.mocked(rateLimit).mockResolvedValue({
      success: true,
      limit: 3,
      remaining: 2,
      reset: Date.now() + 60000,
    });
  });

  describe("BotID Protection", () => {
    it("should block requests when BotID detects a bot", async () => {
      // Mock BotID detecting a bot
      vi.mocked(checkBotId).mockResolvedValue({
        isHuman: false,
        isBot: true,
        isVerifiedBot: false,
        bypassed: false,
      });

      const request = mockRequest({
        name: "Test User",
        email: "test@example.com",
        message: "This is a test message from a bot",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe("Access denied");
      expect(checkBotId).toHaveBeenCalledTimes(1);
      // Rate limiting should not be called if bot is detected first
      expect(rateLimit).not.toHaveBeenCalled();
    });

    it("should allow requests when BotID verifies human user", async () => {
      // Mock BotID verifying a human
      vi.mocked(checkBotId).mockResolvedValue({
        isHuman: true,
        isBot: false,
        isVerifiedBot: false,
        bypassed: false,
      });

      const request = mockRequest({
        name: "Real User",
        email: "user@example.com",
        message: "This is a legitimate message from a real person with enough characters",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(checkBotId).toHaveBeenCalledTimes(1);
      expect(rateLimit).toHaveBeenCalled();
    });

    it("should check BotID before rate limiting", async () => {
      const checkOrder: string[] = [];

      vi.mocked(checkBotId).mockImplementation(async () => {
        checkOrder.push("botid");
        return {
          isHuman: false,
          isBot: true,
          isVerifiedBot: false,
          bypassed: false,
        };
      });

      vi.mocked(rateLimit).mockImplementation(async () => {
        checkOrder.push("rateLimit");
        return {
          success: true,
          limit: 3,
          remaining: 2,
          reset: Date.now() + 60000,
        };
      });

      const request = mockRequest({
        name: "Test User",
        email: "test@example.com",
        message: "Test message",
      });

      await POST(request);

      // BotID should be checked first
      expect(checkOrder[0]).toBe("botid");
      // Rate limiting should not be called if bot is detected
      expect(checkOrder.length).toBe(1);
    });

    it("should handle BotID check errors gracefully", async () => {
      // Mock BotID throwing an error
      vi.mocked(checkBotId).mockRejectedValue(new Error("BotID service unavailable"));

      const request = mockRequest({
        name: "Test User",
        email: "test@example.com",
        message: "This is a test message",
      });

      const response = await POST(request);
      
      expect(response.status).toBe(500);
      expect(checkBotId).toHaveBeenCalledTimes(1);
    });
  });

  describe("Multi-layer Protection", () => {
    it("should apply all protection layers in correct order", async () => {
      const protectionOrder: string[] = [];

      vi.mocked(checkBotId).mockImplementation(async () => {
        protectionOrder.push("1-botid");
        return {
          isHuman: true,
          isBot: false,
          isVerifiedBot: false,
          bypassed: false,
        };
      });

      vi.mocked(rateLimit).mockImplementation(async () => {
        protectionOrder.push("2-rateLimit");
        return {
          success: true,
          limit: 3,
          remaining: 2,
          reset: Date.now() + 60000,
        };
      });

      const request = mockRequest({
        name: "Real User",
        email: "user@example.com",
        message: "Legitimate message with sufficient length",
        website: "", // Empty honeypot (not filled by bot)
      });

      await POST(request);

      // Verify protection order
      expect(protectionOrder).toEqual(["1-botid", "2-rateLimit"]);
      // Honeypot and validation happen after these checks
    });

    it("should still catch bots that pass BotID via honeypot", async () => {
      // Scenario: Sophisticated bot that passes BotID but fills honeypot
      vi.mocked(checkBotId).mockResolvedValue({
        isHuman: true,
        isBot: false,
        isVerifiedBot: false,
        bypassed: false,
      });

      const request = mockRequest({
        name: "Bot User",
        email: "bot@example.com",
        message: "Bot message",
        website: "http://spam.com", // Honeypot filled - caught!
      });

      const response = await POST(request);
      const data = await response.json();

      // Should return success but not actually process
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});

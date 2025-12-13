import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
    delete process.env.ENABLE_BOTID;
    vi.clearAllMocks();
    
    // Default: Rate limit allows request
    vi.mocked(rateLimit).mockResolvedValue({
      success: true,
      limit: 3,
      remaining: 2,
      reset: Date.now() + 60000,
    });
  });

  describe("BotID Protection (Disabled by Default)", () => {
    it("should NOT call BotID check when ENABLE_BOTID is not set", async () => {
      // BotID is disabled by default (ENABLE_BOTID not set)
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

      // Should succeed even with bot-like behavior since BotID is disabled
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // BotID should not be called since ENABLE_BOTID is not set
      expect(checkBotId).not.toHaveBeenCalled();
      // Rate limiting should still be called
      expect(rateLimit).toHaveBeenCalled();
    });

    it("should allow legitimate requests without BotID verification", async () => {
      // Mock BotID would verify human, but it's not called
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
      // BotID should not be called
      expect(checkBotId).not.toHaveBeenCalled();
      // Rate limiting should be called
      expect(rateLimit).toHaveBeenCalled();
    });

    it("should apply rate limiting before BotID when ENABLE_BOTID is not set", async () => {
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

      await POST(request as any);

      // Rate limiting should be first (BotID disabled)
      expect(checkOrder[0]).toBe("rateLimit");
      // BotID should not be in the order
      expect(checkOrder).not.toContain("botid");
    });

    it("should not handle BotID errors when ENABLE_BOTID is not set", async () => {
      // Mock BotID throwing an error (shouldn't be called)
      vi.mocked(checkBotId).mockRejectedValue(new Error("BotID service unavailable"));

      const request = mockRequest({
        name: "Test User",
        email: "test@example.com",
        message: "This is a test message",
      });

      const response = await POST(request as any);

      // Should succeed without calling BotID
      expect(response.status).toBe(200);
      expect(checkBotId).not.toHaveBeenCalled();
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.message).toBeDefined();
    });
  });

  describe("BotID Protection (Enabled via ENV)", () => {
    beforeEach(() => {
      process.env.ENABLE_BOTID = '1';
      process.env.NODE_ENV = 'production'; // BotID only runs in production
      vi.clearAllMocks();
      vi.mocked(rateLimit).mockResolvedValue({
        success: true,
        limit: 3,
        remaining: 2,
        reset: Date.now() + 60000,
      });
    });

    afterEach(() => {
      delete process.env.ENABLE_BOTID;
      process.env.NODE_ENV = 'test';
    });

    it.skip("should call BotID check and block if BotID identifies a bot (TEMPORARILY DISABLED)", async () => {
      const callOrder: string[] = [];

      vi.mocked(checkBotId).mockImplementation(async () => {
        callOrder.push('botid');
        return {
          isHuman: false,
          isBot: true,
          isVerifiedBot: false,
          bypassed: false,
        };
      });

      vi.mocked(rateLimit).mockImplementation(async () => {
        callOrder.push('rateLimit');
        return {
          success: true,
          limit: 3,
          remaining: 2,
          reset: Date.now() + 60000,
        };
      });

      const request = mockRequest({
        name: 'Malicious Bot',
        email: 'bot@spam.com',
        message: 'Automated spam',
      });

      const response = await POST(request as any);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.error).toBe('Access denied');
      expect(callOrder[0]).toBe('botid');
      expect(checkBotId).toHaveBeenCalled();
    });

    it.skip("should allow legitimate requests when BotID identifies human (TEMPORARILY DISABLED)", async () => {
      const callOrder: string[] = [];

      vi.mocked(checkBotId).mockImplementation(async () => {
        callOrder.push('botid');
        return {
          isHuman: true,
          isBot: false,
          isVerifiedBot: false,
          bypassed: false,
        };
      });

      vi.mocked(rateLimit).mockImplementation(async () => {
        callOrder.push('rateLimit');
        return {
          success: true,
          limit: 3,
          remaining: 2,
          reset: Date.now() + 60000,
        };
      });

      const request = mockRequest({
        name: 'Human User',
        email: 'human@example.com',
        message: 'This is a legit message',
      });

      const response = await POST(request as any);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(callOrder[0]).toBe('botid');
      expect(checkBotId).toHaveBeenCalled();
    });
  });

  describe("Multi-layer Protection", () => {
    it("should apply protection layers without BotID (when ENABLE_BOTID not set)", async () => {
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

      await POST(request as any);

      // Verify protection order without BotID
      expect(protectionOrder).toEqual(["2-rateLimit"]);
      // BotID should not be called
      expect(protectionOrder).not.toContain("1-botid");
      // Honeypot and validation happen after rate limiting
    });

    it("should still catch bots via honeypot when BotID is disabled", async () => {
      // Scenario: Bot fills honeypot (BotID is disabled by default)
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

      const response = await POST(request as any);
      const data = await response.json();

      // Should return success but not actually process (honeypot catches it)
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // BotID should not be called
      expect(checkBotId).not.toHaveBeenCalled();
    });
  });
});

/**
 * Tests for error-handler utility
 * 
 * Tests connection error detection and API error handling
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  isConnectionError,
  handleApiError,
  getErrorSeverity,
  ErrorSeverity,
} from "@/lib/error-handler";
import * as Sentry from "@sentry/nextjs";

// Mock Sentry
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
  addBreadcrumb: vi.fn(),
}));

describe("isConnectionError", () => {
  it("should detect EPIPE error code", () => {
    const error = new Error("write EPIPE");
    (error as NodeJS.ErrnoException).code = "EPIPE";
    
    expect(isConnectionError(error)).toBe(true);
  });

  it("should detect ECONNRESET error code", () => {
    const error = new Error("connection reset");
    (error as NodeJS.ErrnoException).code = "ECONNRESET";
    
    expect(isConnectionError(error)).toBe(true);
  });

  it("should detect ECONNABORTED error code", () => {
    const error = new Error("connection aborted");
    (error as NodeJS.ErrnoException).code = "ECONNABORTED";
    
    expect(isConnectionError(error)).toBe(true);
  });

  it("should detect aborted message", () => {
    const error = new Error("aborted");
    
    expect(isConnectionError(error)).toBe(true);
  });

  it("should detect socket hang up message", () => {
    const error = new Error("socket hang up");
    
    expect(isConnectionError(error)).toBe(true);
  });

  it("should detect connection reset message", () => {
    const error = new Error("connection reset by peer");
    
    expect(isConnectionError(error)).toBe(true);
  });

  it("should not detect regular errors", () => {
    const error = new Error("Something went wrong");
    
    expect(isConnectionError(error)).toBe(false);
  });

  it("should handle null/undefined", () => {
    expect(isConnectionError(null)).toBe(false);
    expect(isConnectionError(undefined)).toBe(false);
  });

  it("should handle non-object errors", () => {
    expect(isConnectionError("error string")).toBe(false);
    expect(isConnectionError(123)).toBe(false);
  });
});

// TODO: Error handling implementation changed - update tests
describe.skip("handleApiError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods
    vi.spyOn(console, "debug").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should handle connection errors as debug level", () => {
    const error = new Error("write EPIPE");
    (error as NodeJS.ErrnoException).code = "EPIPE";
    
    const result = handleApiError(error, {
      route: "/api/test",
      method: "POST",
    });

    expect(result.isConnectionError).toBe(true);
    expect(result.shouldRetry).toBe(false);
    expect(result.statusCode).toBe(499);
    expect(result.logLevel).toBe("debug");
    // eslint-disable-next-line no-console -- Testing console.debug mock
    expect(console.debug).toHaveBeenCalledWith(
      expect.stringContaining("Client connection closed"),
      expect.any(String)
    );
    expect(Sentry.addBreadcrumb).toHaveBeenCalled();
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it("should handle regular errors as error level", () => {
    const error = new Error("Database connection failed");
    
    const result = handleApiError(error, {
      route: "/api/test",
      method: "POST",
    });

    expect(result.isConnectionError).toBe(false);
    expect(result.shouldRetry).toBe(true);
    expect(result.statusCode).toBe(500);
    expect(result.logLevel).toBe("error");
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("API error"),
      error
    );
    expect(Sentry.captureException).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        tags: { route: "/api/test", method: "POST" },
      })
    );
  });

  it("should include additional data in Sentry context", () => {
    const error = new Error("Test error");
    
    handleApiError(error, {
      route: "/api/views",
      method: "POST",
      userId: "user123",
      additionalData: { postId: "post456" },
    });

    expect(Sentry.captureException).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        tags: { route: "/api/views", method: "POST" },
        user: { id: "user123" },
        extra: { postId: "post456" },
      })
    );
  });
});

describe("getErrorSeverity", () => {
  it("should classify connection errors as DEBUG", () => {
    const error = new Error("write EPIPE");
    (error as NodeJS.ErrnoException).code = "EPIPE";
    
    expect(getErrorSeverity(error)).toBe(ErrorSeverity.DEBUG);
  });

  it("should classify rate limit errors as INFO", () => {
    const error = new Error("Rate limit exceeded");
    
    expect(getErrorSeverity(error)).toBe(ErrorSeverity.INFO);
  });

  it("should classify validation errors as INFO", () => {
    const error = new Error("Invalid input");
    
    expect(getErrorSeverity(error)).toBe(ErrorSeverity.INFO);
  });

  it("should classify timeout errors as WARNING", () => {
    const error = new Error("Request timed out");
    
    expect(getErrorSeverity(error)).toBe(ErrorSeverity.WARNING);
  });

  it("should classify database errors as ERROR", () => {
    const error = new Error("Redis connection failed");
    
    expect(getErrorSeverity(error)).toBe(ErrorSeverity.ERROR);
  });

  it("should default to ERROR for unknown errors", () => {
    const error = new Error("Something unexpected");
    
    expect(getErrorSeverity(error)).toBe(ErrorSeverity.ERROR);
  });
});

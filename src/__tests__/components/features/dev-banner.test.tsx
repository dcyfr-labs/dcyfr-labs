import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DevBanner } from "@/components/features";

describe("DevBanner", () => {
  beforeEach(() => {
    // Ensure a clean sessionStorage state
    sessionStorage.clear();
  });

  it("renders when session storage is not dismissed", async () => {
    render(<DevBanner />);

    // It should show the 'Development Mode' message
    expect(await screen.findByText(/DEV Mode/i)).toBeInTheDocument();
  });

  it("has accessible region role and label", async () => {
    render(<DevBanner />);

    const region = await screen.findByRole("region", { name: /Dev Banner/i });
    expect(region).toBeInTheDocument();
  });

  it("sets sessionStorage key when dismissed and hides the banner", async () => {
    const { container } = render(<DevBanner />);

    const button = await screen.findByRole("button", {
      name: /Close Dev Banner/i,
    });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);

    await waitFor(() => {
      const region = container.querySelector(
        '[role="region"][aria-label="Dev Banner"]'
      );
      expect(region).toBeNull();
    });

    expect(sessionStorage.getItem("dev-banner-dismissed")).toBe("true");
  });

  it("does not render when session storage has dismissed set", async () => {
    sessionStorage.setItem("dev-banner-dismissed", "true");

    const { container } = render(<DevBanner />);

    // Allow effect to run and set internal state
    await waitFor(() => {
      const region = container.querySelector(
        '[role="region"][aria-label="Dev Banner"]'
      );
      expect(region).toBeNull();
    });
  });

  it("uses localStorage when NEXT_PUBLIC_DEV_BANNER_PERSIST is true", async () => {
    vi.stubEnv("NEXT_PUBLIC_DEV_BANNER_PERSIST", "true");
    // Reset storages
    sessionStorage.clear();
    // When running in our test environment localStorage may not be provided.
    if (
      typeof localStorage === "undefined" ||
      typeof localStorage.clear !== "function"
    ) {
      // @ts-expect-error -- Fallback for test environment without localStorage
      (global as any).localStorage = sessionStorage;
    }
    localStorage.clear();

    const { container } = render(<DevBanner />);
    const close = await screen.findByRole("button", {
      name: /Close Dev Banner/i,
    });
    fireEvent.click(close);
    await waitFor(() => {
      const region = container.querySelector(
        '[role="region"][aria-label="Dev Banner"]'
      );
      expect(region).toBeNull();
    });
    expect(localStorage.getItem("dev-banner-dismissed")).toBe("true");
    // Clean up stubbed env
    vi.unstubAllEnvs();
  });
});

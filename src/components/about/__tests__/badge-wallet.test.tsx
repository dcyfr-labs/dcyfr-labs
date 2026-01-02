import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BadgeWallet } from "../badge-wallet";
import { clearCredlyCache } from "@/lib/credly-cache";
import type { CredlyBadgesResponse } from "@/types/credly";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockBadgesResponse: CredlyBadgesResponse = {
  data: [
    {
      id: "badge-1",
      badge_template: {
        id: "template-1",
        name: "GIAC Security Essentials",
        description: "Security certification",
        image_url: "https://example.com/badge1.png",
        skills: [
          { id: "skill-1", name: "Cybersecurity", vanity_slug: "cybersecurity" },
        ],
      },
      image_url: "https://example.com/badge1.png",
      issued_at: "2024-01-15T00:00:00Z",
      expires_at: null,
      issuer: {
        summary: "issued by GIAC",
        entities: [
          {
            label: "Issued by",
            primary: true,
            entity: {
              type: "Organization",
              id: "issuer-1",
              name: "GIAC",
              url: "https://giac.org",
            },
          },
        ],
      },
      user: {
        id: "user-1",
        name: "Drew",
      },
    },
    {
      id: "badge-2",
      badge_template: {
        id: "template-2",
        name: "AWS Certified Solutions Architect",
        description: "AWS certification",
        image_url: "https://example.com/badge2.png",
        skills: [
          { id: "skill-2", name: "Cloud Architecture", vanity_slug: "cloud-architecture" },
        ],
      },
      image_url: "https://example.com/badge2.png",
      issued_at: "2023-06-10T00:00:00Z",
      expires_at: "2026-06-10T00:00:00Z",
      issuer: {
        summary: "issued by Amazon Web Services",
        entities: [
          {
            label: "Issued by",
            primary: true,
            entity: {
              type: "Organization",
              id: "issuer-2",
              name: "Amazon Web Services",
              url: "https://aws.amazon.com",
            },
          },
        ],
      },
      user: {
        id: "user-1",
        name: "Drew",
      },
    },
  ],
  metadata: {
    total_count: 2,
    count: 2,
    previous: null,
    next: null,
  },
};

describe("BadgeWallet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCredlyCache();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearCredlyCache();
  });

  it("renders loading state initially", () => {
    mockFetch.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<BadgeWallet username="dcyfr" />);

    expect(screen.getByText("Loading badges...")).toBeInTheDocument();
  });

  it("fetches and displays badges successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        badges: mockBadgesResponse.data,
        total_count: mockBadgesResponse.metadata.total_count,
        count: mockBadgesResponse.data.length,
      }),
    });

    render(<BadgeWallet username="dcyfr" />);

    await waitFor(() => {
      expect(screen.getByText("GIAC Security Essentials")).toBeInTheDocument();
      expect(screen.getByText("AWS Certified Solutions Architect")).toBeInTheDocument();
    });

    expect(screen.getByText("Issued by GIAC")).toBeInTheDocument();
    expect(screen.getByText("Issued by Amazon Web Services")).toBeInTheDocument();
  });

  it("displays error state on fetch failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<BadgeWallet username="dcyfr" />);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain("Network error");
    });
  });

  it("displays empty state when no badges found", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        badges: [],
        total_count: 0,
        count: 0,
      }),
    });

    render(<BadgeWallet username="dcyfr" />);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain("No badges found for this user.");
    });
  });

  it("limits badges when showLatestOnly is true", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        badges: mockBadgesResponse.data,
        total_count: 10,
        count: 2,
      }),
    });

    render(<BadgeWallet username="dcyfr" limit={1} showLatestOnly />);

    await waitFor(() => {
      expect(screen.getByText("Latest Badges")).toBeInTheDocument();
      expect(screen.getByText("GIAC Security Essentials")).toBeInTheDocument();
      // Only first badge should be shown
      expect(screen.queryByText("AWS Certified Solutions Architect")).not.toBeInTheDocument();
    });
  });

  it("shows 'View all' link when showLatestOnly and more badges exist", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        badges: mockBadgesResponse.data.slice(0, 1),
        total_count: 10,
        count: 1,
      }),
    });

    render(<BadgeWallet username="dcyfr" limit={1} showLatestOnly />);

    await waitFor(() => {
      expect(screen.getByText(/View all 10 certifications/i)).toBeInTheDocument();
    });
  });

  it("uses correct API endpoint with username parameter", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        badges: [],
        total_count: 0,
        count: 0,
      }),
    });

    render(<BadgeWallet username="testuser" />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("username=testuser")
      );
    });
  });

  it("applies custom className", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        badges: mockBadgesResponse.data,
        total_count: 2,
        count: 2,
      }),
    });

    const { container } = render(
      <BadgeWallet username="dcyfr" className="custom-class" />
    );

    await waitFor(() => {
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  it("displays total count in header", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        badges: mockBadgesResponse.data,
        total_count: 2,
        count: 2,
      }),
    });

    render(<BadgeWallet username="dcyfr" showLatestOnly />);

    await waitFor(() => {
      expect(screen.getByText("2 Total")).toBeInTheDocument();
    });
  });
});

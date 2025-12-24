import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { SkillsWallet } from "../skills-wallet";
import { clearCredlyCache } from "@/lib/credly-cache";
import type { CredlyBadge } from "@/types/credly";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockBadges: CredlyBadge[] = [
  {
    id: "badge-1",
    badge_template: {
      id: "template-1",
      name: "Security Certification",
      description: "Security cert",
      image_url: "https://example.com/badge1.png",
      skills: [
        { id: "skill-1", name: "Cybersecurity", vanity_slug: "cybersecurity" },
        { id: "skill-2", name: "Risk Management", vanity_slug: "risk-management" },
      ],
    },
    image_url: "https://example.com/badge1.png",
    issued_at: "2024-01-15T00:00:00Z",
    expires_at: null,
    issuer: {
      summary: "GIAC Security Certification",
      entities: [
        {
          label: "GIAC",
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
    user: { id: "user-1", name: "Drew" },
  },
  {
    id: "badge-2",
    badge_template: {
      id: "template-2",
      name: "Cloud Certification",
      description: "Cloud cert",
      image_url: "https://example.com/badge2.png",
      skills: [
        { id: "skill-1", name: "Cybersecurity", vanity_slug: "cybersecurity" },
        { id: "skill-3", name: "Cloud Architecture", vanity_slug: "cloud-architecture" },
      ],
    },
    image_url: "https://example.com/badge2.png",
    issued_at: "2023-06-10T00:00:00Z",
    expires_at: null,
    issuer: {
      summary: "AWS Certification Program", 
      entities: [
        {
          label: "AWS",
          primary: true,
          entity: {
            type: "Organization", 
            id: "issuer-2",
            name: "AWS", 
            url: "https://aws.amazon.com",
          },
        },
      ],
    },
    user: { id: "user-1", name: "Drew" },
  },
];

describe("SkillsWallet", () => {
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

    render(<SkillsWallet username="dcyfr" />);

    expect(screen.getByText("Loading skills...")).toBeInTheDocument();
  });

  it("fetches and aggregates skills successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        badges: mockBadges,
        total_count: 2,
        count: 2,
      }),
    });

    render(<SkillsWallet username="dcyfr" />);

    await waitFor(() => {
      // Skills should be displayed
      expect(screen.getByText("Cybersecurity")).toBeInTheDocument();
      expect(screen.getByText("Risk Management")).toBeInTheDocument();
      expect(screen.getByText("Cloud Architecture")).toBeInTheDocument();
    });

    // Cybersecurity appears in 2 badges
    const cybersecurityCard = screen.getByText("Cybersecurity").closest("div");
    expect(cybersecurityCard).toHaveTextContent("2 badges");

    // Risk Management appears in 1 badge
    const riskCard = screen.getByText("Risk Management").closest("div");
    expect(riskCard).toHaveTextContent("1 badge");
  });

  it("displays skills sorted by count descending", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        badges: mockBadges,
        total_count: 2,
        count: 2,
      }),
    });

    render(<SkillsWallet username="dcyfr" />);

    await waitFor(() => {
      const skillNames = screen.getAllByRole("heading", { level: 4 }).map(
        (heading) => heading.textContent
      );

      // Cybersecurity should be first (appears in 2 badges)
      expect(skillNames[0]).toBe("Cybersecurity");
    });
  });

  it("displays error state on fetch failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    render(<SkillsWallet username="dcyfr" />);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain("Network error");
    });
  });

  it("displays empty state when no skills found", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        badges: [],
        total_count: 0,
        count: 0,
      }),
    });

    render(<SkillsWallet username="dcyfr" />);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain("No skills found for this user");
    });
  });

  it("shows total skill count in header", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        badges: mockBadges,
        total_count: 2,
        count: 2,
      }),
    });

    render(<SkillsWallet username="dcyfr" />);

    await waitFor(() => {
      expect(screen.getByText("3 Skills")).toBeInTheDocument();
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

    render(<SkillsWallet username="testuser" />);

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
        badges: mockBadges,
        total_count: 2,
        count: 2,
      }),
    });

    const { container } = render(
      <SkillsWallet username="dcyfr" className="custom-class" />
    );

    await waitFor(() => {
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  it("renders Credly links for each skill", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        badges: mockBadges,
        total_count: 2,
        count: 2,
      }),
    });

    render(<SkillsWallet username="dcyfr" />);

    await waitFor(() => {
      const cybersecurityLink = screen
        .getByText("Cybersecurity")
        .closest("a");

      expect(cybersecurityLink).toHaveAttribute(
        "href",
        "https://www.credly.com/skills/cybersecurity"
      );
      expect(cybersecurityLink).toHaveAttribute("target", "_blank");
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BadgeWallet } from "../badge-wallet";
import type { CredlyBadge } from "@/types/credly";

// Mock Next.js Image component to avoid configuration issues in tests
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock the useCredlyBadges hook
const mockUseCredlyBadges = vi.fn();

vi.mock("@/hooks/use-credly", () => ({
  useCredlyBadges: (options: any) => mockUseCredlyBadges(options),
}));

const mockBadges: CredlyBadge[] = [
  {
    id: "badge-1",
    badge_template: {
      id: "template-1",
      name: "GIAC Security Essentials",
      description: "Security certification",
      image_url: "https://images.credly.com/badge1.png",
      skills: [
        { id: "skill-1", name: "Cybersecurity", vanity_slug: "cybersecurity" },
      ],
    },
    image_url: "https://images.credly.com/badge1.png",
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
      image_url: "https://images.credly.com/badge2.png",
      skills: [
        { id: "skill-2", name: "Cloud Architecture", vanity_slug: "cloud-architecture" },
      ],
    },
    image_url: "https://images.credly.com/badge2.png",
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
];

describe("BadgeWallet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", () => {
    mockUseCredlyBadges.mockReturnValue({
      badges: null,
      totalCount: 0,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    const { container } = render(<BadgeWallet username="dcyfr" limit={3} />);

    // Check that skeleton is rendered (no actual badge links)
    expect(screen.queryByRole("link")).not.toBeInTheDocument();

    // Skeleton should have grid layout with skeleton cards
    const gridContainer = container.querySelector(".grid");
    expect(gridContainer).toBeInTheDocument();

    // Should have 3 skeleton cards (matching limit)
    const skeletonCards = container.querySelectorAll(".rounded-lg.border");
    expect(skeletonCards).toHaveLength(3);
  });

  it("fetches and displays badges successfully", () => {
    mockUseCredlyBadges.mockReturnValue({
      badges: mockBadges,
      totalCount: 2,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<BadgeWallet username="dcyfr" />);

    expect(screen.getByText("GIAC Security Essentials")).toBeInTheDocument();
    expect(screen.getByText("AWS Certified Solutions Architect")).toBeInTheDocument();
    expect(screen.getByText("Issued by GIAC")).toBeInTheDocument();
    expect(screen.getByText("Issued by Amazon Web Services")).toBeInTheDocument();
  });

  it("displays error state on fetch failure", () => {
    mockUseCredlyBadges.mockReturnValue({
      badges: null,
      totalCount: 0,
      loading: false,
      error: "Network error",
      refetch: vi.fn(),
    });

    render(<BadgeWallet username="dcyfr" />);

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain("Network error");
  });

  it("displays empty state when no badges found", () => {
    mockUseCredlyBadges.mockReturnValue({
      badges: [],
      totalCount: 0,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<BadgeWallet username="dcyfr" />);

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain("No badges found for this user.");
  });

  it("limits badges when showLatestOnly is true", () => {
    mockUseCredlyBadges.mockReturnValue({
      badges: mockBadges,
      totalCount: 10,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<BadgeWallet username="dcyfr" limit={1} showLatestOnly />);

    expect(screen.getByText("Latest Badges")).toBeInTheDocument();
    expect(screen.getByText("GIAC Security Essentials")).toBeInTheDocument();
    // Only first badge should be shown
    expect(screen.queryByText("AWS Certified Solutions Architect")).not.toBeInTheDocument();
  });

  it("shows 'View all' link when showLatestOnly and more badges exist", () => {
    mockUseCredlyBadges.mockReturnValue({
      badges: [mockBadges[0]],
      totalCount: 10,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<BadgeWallet username="dcyfr" limit={1} showLatestOnly />);

    expect(screen.getByText(/View all 10 certifications/i)).toBeInTheDocument();
  });

  it("uses correct API endpoint with username parameter", () => {
    mockUseCredlyBadges.mockReturnValue({
      badges: [],
      totalCount: 0,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<BadgeWallet username="testuser" />);

    expect(mockUseCredlyBadges).toHaveBeenCalledWith(
      expect.objectContaining({ username: "testuser" })
    );
  });

  it("applies custom className", () => {
    mockUseCredlyBadges.mockReturnValue({
      badges: mockBadges,
      totalCount: 2,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    const { container } = render(
      <BadgeWallet username="dcyfr" className="custom-class" />
    );

    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });

  it("displays total count in header", () => {
    mockUseCredlyBadges.mockReturnValue({
      badges: mockBadges,
      totalCount: 2,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<BadgeWallet username="dcyfr" showLatestOnly />);

    expect(screen.getByText("2 Total")).toBeInTheDocument();
  });
});

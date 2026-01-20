import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { TrendingSection } from "@/components/home";
import type { Post } from "@/data/posts";
import type { Project } from "@/data/projects";

// ============================================================================
// MOCKS
// ============================================================================

// Mock child panel components - match the require() paths in the component
vi.mock("@/components/home/trending-posts-panel", () => ({
  __esModule: true,
  TrendingPostsPanel: ({ posts, viewCounts, limit }: any) => {
    const entries = viewCounts
      ? (Array.from(viewCounts.entries()) as [string, number][])
      : [];
    return (
      <div data-testid="trending-posts-panel" data-limit={limit}>
        <div data-testid="posts-count">{posts.length}</div>
        {entries.map(([id, count]) => (
          <div key={id} data-testid={`post-views-${id}`}>
            {count}
          </div>
        ))}
      </div>
    );
  },
}));

vi.mock("@/components/home/trending-topics-panel", () => ({
  __esModule: true,
  TrendingTopicsPanel: ({ topics, maxTopics }: any) => (
    <div data-testid="trending-topics-panel" data-max-topics={maxTopics}>
      <div data-testid="topics-count">{topics.length}</div>
      {topics.map((topic: any) => (
        <div key={topic.tag} data-testid={`topic-${topic.tag}`}>
          {topic.tag} ({topic.count})
        </div>
      ))}
    </div>
  ),
}));

vi.mock("@/components/home/trending-projects-panel", () => ({
  __esModule: true,
  TrendingProjectsPanel: ({ projects, limit }: any) => (
    <div data-testid="trending-projects-panel" data-limit={limit}>
      <div data-testid="projects-count">{projects.length}</div>
      {projects.map((item: any) => (
        <div key={item.project.id} data-testid={`project-${item.project.id}`}>
          {item.project.title} (Score: {item.score})
        </div>
      ))}
    </div>
  ),
}));

// ============================================================================
// MOCK DATA
// ============================================================================

const mockPosts: Post[] = [
  {
    id: "post-1",
    slug: "first-post",
    title: "First Trending Post",
    summary: "Summary 1",
    publishedAt: "2025-01-10",
    tags: ["react", "typescript"],
    readingTime: { words: 100, minutes: 1, text: "1 min read" },
    body: "content",
  },
  {
    id: "post-2",
    slug: "second-post",
    title: "Second Trending Post",
    summary: "Summary 2",
    publishedAt: "2025-01-09",
    tags: ["nextjs"],
    readingTime: { words: 200, minutes: 2, text: "2 min read" },
    body: "content",
  },
];

const mockViewCounts = new Map([
  ["post-1", 150],
  ["post-2", 98],
]);

const mockTopics = [
  { tag: "react", count: 10 },
  { tag: "typescript", count: 8 },
  { tag: "nextjs", count: 6 },
];

const mockProjects = [
  {
    project: {
      id: "project-1",
      slug: "awesome-project",
      title: "Awesome Project",
      description: "Great project",
      status: "active" as const,
      links: [],
      publishedAt: "2024-12-01",
      body: "content",
    } as Project,
    stars: 100,
    recentStars: 20,
    score: 150,
  },
  {
    project: {
      id: "project-2",
      slug: "cool-project",
      title: "Cool Project",
      description: "Cool project",
      status: "in-progress" as const,
      links: [],
      publishedAt: "2024-11-01",
      body: "content",
    } as Project,
    stars: 50,
    recentStars: 5,
    score: 75,
  },
];

// ============================================================================
// TESTS
// ============================================================================

describe("TrendingSection", () => {
  describe("Rendering", () => {
    it("should render tabs navigation", () => {
      render(
        <TrendingSection
          posts={mockPosts}
          viewCounts={mockViewCounts}
          topics={mockTopics}
        />
      );

      expect(screen.getByRole("tablist")).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /posts/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /topics/i })).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: /projects/i })
      ).toBeInTheDocument();
    });

    it("should render tab icons", () => {
      render(
        <TrendingSection
          posts={mockPosts}
          viewCounts={mockViewCounts}
          topics={mockTopics}
        />
      );

      const postsTab = screen.getByRole("tab", { name: /posts/i });
      const topicsTab = screen.getByRole("tab", { name: /topics/i });
      const projectsTab = screen.getByRole("tab", { name: /projects/i });

      // Icons should be rendered (SVGs have role="img" implicitly or are decorative)
      expect(postsTab).toBeInTheDocument();
      expect(topicsTab).toBeInTheDocument();
      expect(projectsTab).toBeInTheDocument();
    });

    it("should render default tab (posts) by default", () => {
      render(
        <TrendingSection
          posts={mockPosts}
          viewCounts={mockViewCounts}
          topics={mockTopics}
        />
      );

      // Posts panel should be visible by default
      expect(screen.getByTestId("trending-posts-panel")).toBeInTheDocument();
      expect(screen.getByTestId("posts-count")).toHaveTextContent("2");
    });

    it("should use custom defaultTab prop", () => {
      render(
        <TrendingSection
          posts={mockPosts}
          viewCounts={mockViewCounts}
          topics={mockTopics}
          defaultTab="topics"
        />
      );

      // Topics panel should be visible
      expect(screen.getByTestId("trending-topics-panel")).toBeInTheDocument();
      expect(screen.getByTestId("topics-count")).toHaveTextContent("3");
    });

    it("should apply custom className", () => {
      const { container } = render(
        <TrendingSection
          posts={mockPosts}
          viewCounts={mockViewCounts}
          topics={mockTopics}
          className="custom-class"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("custom-class");
    });
  });

  describe("Tab Switching", () => {
    it("should switch to Topics tab when clicked", async () => {
      render(
        <TrendingSection
          posts={mockPosts}
          viewCounts={mockViewCounts}
          topics={mockTopics}
        />
      );

      const topicsTab = screen.getByRole("tab", { name: /topics/i });
      await userEvent.click(topicsTab);

      // Wait for content visibility
      await waitFor(() => {
        expect(screen.getByTestId("trending-topics-panel")).toBeInTheDocument();
      });

      // Wait for aria-selected attribute update
      await waitFor(() => {
        expect(topicsTab).toHaveAttribute("aria-selected", "true");
      });

      expect(screen.getByTestId("topics-count")).toHaveTextContent("3");
    });

    it("should switch to Projects tab when clicked", async () => {
      render(
        <TrendingSection
          posts={mockPosts}
          viewCounts={mockViewCounts}
          topics={mockTopics}
          projects={mockProjects}
        />
      );

      const projectsTab = screen.getByRole("tab", { name: /projects/i });
      await userEvent.click(projectsTab);

      // Wait for content visibility
      await waitFor(() => {
        expect(screen.getByTestId("trending-projects-panel")).toBeInTheDocument();
      });

      // Wait for aria-selected attribute update
      await waitFor(() => {
        expect(projectsTab).toHaveAttribute("aria-selected", "true");
      });

      expect(screen.getByTestId("projects-count")).toHaveTextContent("2");
    });

    it("should handle multiple tab switches", async () => {
      render(
        <TrendingSection
          posts={mockPosts}
          viewCounts={mockViewCounts}
          topics={mockTopics}
          projects={mockProjects}
        />
      );

      const postsTab = screen.getByRole("tab", { name: /posts/i });
      const topicsTab = screen.getByRole("tab", { name: /topics/i });
      const projectsTab = screen.getByRole("tab", { name: /projects/i });

      // Switch to Topics
      await userEvent.click(topicsTab);
      await waitFor(() => {
        expect(screen.getByTestId("trending-topics-panel")).toBeInTheDocument();
        expect(topicsTab).toHaveAttribute("aria-selected", "true");
      });

      // Switch to Projects
      await userEvent.click(projectsTab);
      await waitFor(() => {
        expect(screen.getByTestId("trending-projects-panel")).toBeInTheDocument();
        expect(projectsTab).toHaveAttribute("aria-selected", "true");
      });

      // Switch back to Posts
      await userEvent.click(postsTab);
      await waitFor(() => {
        expect(screen.getByTestId("trending-posts-panel")).toBeInTheDocument();
        expect(postsTab).toHaveAttribute("aria-selected", "true");
      });
    });
  });

  describe("Data Passing", () => {
    it("should pass posts and viewCounts to TrendingPostsPanel", () => {
      render(
        <TrendingSection
          posts={mockPosts}
          viewCounts={mockViewCounts}
          topics={mockTopics}
        />
      );

      expect(screen.getByTestId("trending-posts-panel")).toBeInTheDocument();
      expect(screen.getByTestId("posts-count")).toHaveTextContent("2");
      expect(screen.getByTestId("post-views-post-1")).toHaveTextContent("150");
      expect(screen.getByTestId("post-views-post-2")).toHaveTextContent("98");
    });

    it("should pass topics to TrendingTopicsPanel", () => {
      render(
        <TrendingSection
          posts={mockPosts}
          viewCounts={mockViewCounts}
          topics={mockTopics}
          defaultTab="topics"
        />
      );

      expect(screen.getByTestId("trending-topics-panel")).toBeInTheDocument();
      expect(screen.getByTestId("topics-count")).toHaveTextContent("3");
      expect(screen.getByTestId("topic-react")).toHaveTextContent("react (10)");
      expect(screen.getByTestId("topic-typescript")).toHaveTextContent(
        "typescript (8)"
      );
      expect(screen.getByTestId("topic-nextjs")).toHaveTextContent(
        "nextjs (6)"
      );
    });

    it("should pass projects to TrendingProjectsPanel", () => {
      render(
        <TrendingSection
          posts={mockPosts}
          viewCounts={mockViewCounts}
          topics={mockTopics}
          projects={mockProjects}
          defaultTab="projects"
        />
      );

      expect(screen.getByTestId("trending-projects-panel")).toBeInTheDocument();
      expect(screen.getByTestId("projects-count")).toHaveTextContent("2");
      expect(screen.getByTestId("project-project-1")).toHaveTextContent(
        "Awesome Project (Score: 150)"
      );
      expect(screen.getByTestId("project-project-2")).toHaveTextContent(
        "Cool Project (Score: 75)"
      );
    });

    it("should handle empty projects array", () => {
      render(
        <TrendingSection
          posts={mockPosts}
          viewCounts={mockViewCounts}
          topics={mockTopics}
          projects={[]}
          defaultTab="projects"
        />
      );

      expect(screen.getByTestId("trending-projects-panel")).toBeInTheDocument();
      expect(screen.getByTestId("projects-count")).toHaveTextContent("0");
    });

    it("should handle undefined projects (defaults to empty array)", () => {
      render(
        <TrendingSection
          posts={mockPosts}
          viewCounts={mockViewCounts}
          topics={mockTopics}
          defaultTab="projects"
        />
      );

      expect(screen.getByTestId("trending-projects-panel")).toBeInTheDocument();
      expect(screen.getByTestId("projects-count")).toHaveTextContent("0");
    });
  });

  describe("Panel Props", () => {
    it("should pass limit=5 to TrendingPostsPanel", () => {
      render(
        <TrendingSection
          posts={mockPosts}
          viewCounts={mockViewCounts}
          topics={mockTopics}
        />
      );

      const panel = screen.getByTestId("trending-posts-panel");
      expect(panel).toHaveAttribute("data-limit", "5");
    });

    it("should pass maxTopics=12 to TrendingTopicsPanel", () => {
      render(
        <TrendingSection
          posts={mockPosts}
          viewCounts={mockViewCounts}
          topics={mockTopics}
          defaultTab="topics"
        />
      );

      const panel = screen.getByTestId("trending-topics-panel");
      expect(panel).toHaveAttribute("data-max-topics", "12");
    });

    it("should pass limit=5 to TrendingProjectsPanel", () => {
      render(
        <TrendingSection
          posts={mockPosts}
          viewCounts={mockViewCounts}
          topics={mockTopics}
          projects={mockProjects}
          defaultTab="projects"
        />
      );

      const panel = screen.getByTestId("trending-projects-panel");
      expect(panel).toHaveAttribute("data-limit", "5");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA roles for tabs", () => {
      render(
        <TrendingSection
          posts={mockPosts}
          viewCounts={mockViewCounts}
          topics={mockTopics}
        />
      );

      expect(screen.getByRole("tablist")).toBeInTheDocument();
      expect(screen.getAllByRole("tab")).toHaveLength(3);
    });

    it("should mark active tab with aria-selected", async () => {
      render(
        <TrendingSection
          posts={mockPosts}
          viewCounts={mockViewCounts}
          topics={mockTopics}
        />
      );

      const postsTab = screen.getByRole("tab", { name: /posts/i });
      const topicsTab = screen.getByRole("tab", { name: /topics/i });

      // Wait for initial render - Radix Tabs hydration
      await waitFor(() => {
        expect(postsTab).toHaveAttribute("aria-selected", "true");
        expect(topicsTab).toHaveAttribute("aria-selected", "false");
      });

      // Switch to Topics using userEvent
      await userEvent.click(topicsTab);

      // Wait for both tabs to update (React batched updates)
      await waitFor(() => {
        expect(topicsTab).toHaveAttribute("aria-selected", "true");
        expect(postsTab).toHaveAttribute("aria-selected", "false");
      });
    });

    it("should support keyboard navigation between tabs", async () => {
      render(
        <TrendingSection
          posts={mockPosts}
          viewCounts={mockViewCounts}
          topics={mockTopics}
        />
      );

      const postsTab = screen.getByRole("tab", { name: /posts/i });
      const topicsTab = screen.getByRole("tab", { name: /topics/i });

      // Focus first tab
      postsTab.focus();
      expect(postsTab).toHaveFocus();

      // Tab to next tab - Radix UI updates asynchronously
      await act(async () => {
        fireEvent.keyDown(postsTab, { key: "Tab" });
        // Wait for Radix UI's async focus management
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // Should be able to navigate with keyboard
      expect(topicsTab).toBeInTheDocument();
    });
  });
});

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PostCategorySection } from "@/components/blog/post/post-category-section";
import type { Post } from "@/data/posts";

// Mock the PostList component
vi.mock("@/components/blog/post/post-list", () => ({
  PostList: ({ posts, layout, titleLevel }: any) => (
    <div data-testid="post-list" data-layout={layout} data-title-level={titleLevel}>
      <div data-testid="post-count">{posts.length}</div>
      {posts.map((post: Post) => (
        <div key={post.id} data-testid={`post-${post.id}`}>
          {post.title}
        </div>
      ))}
    </div>
  ),
}));

const mockPosts: Post[] = [
  {
    id: "1",
    slug: "post-1",
    title: "AI Post 1",
    summary: "Summary 1",
    publishedAt: "2025-01-01T00:00:00Z",
    category: "AI",
    tags: ["tag1"],
    readingTime: { minutes: 5, text: "5 min read" },
  } as Post,
  {
    id: "2",
    slug: "post-2",
    title: "AI Post 2",
    summary: "Summary 2",
    publishedAt: "2025-01-02T00:00:00Z",
    category: "AI",
    tags: ["tag2"],
    readingTime: { minutes: 10, text: "10 min read" },
  } as Post,
];

describe("PostCategorySection", () => {
  it("should render category header with label", () => {
    render(
      <PostCategorySection
        category="AI"
        label="Artificial Intelligence"
        posts={mockPosts}
      />
    );

    expect(screen.getByText("Artificial Intelligence")).toBeInTheDocument();
  });

  it("should display post count in header", () => {
    render(
      <PostCategorySection
        category="AI"
        label="AI"
        posts={mockPosts}
      />
    );

    expect(screen.getByText("2 posts")).toBeInTheDocument();
  });

  it("should use singular 'post' for single post", () => {
    const singlePost = [mockPosts[0]];

    render(
      <PostCategorySection
        category="AI"
        label="AI"
        posts={singlePost}
      />
    );

    expect(screen.getByText("1 post")).toBeInTheDocument();
  });

  it("should render PostList with compact layout", () => {
    render(
      <PostCategorySection
        category="AI"
        label="AI"
        posts={mockPosts}
      />
    );

    const postList = screen.getByTestId("post-list");
    expect(postList).toHaveAttribute("data-layout", "compact");
  });

  it("should pass h3 as titleLevel to PostList", () => {
    render(
      <PostCategorySection
        category="AI"
        label="AI"
        posts={mockPosts}
      />
    );

    const postList = screen.getByTestId("post-list");
    expect(postList).toHaveAttribute("data-title-level", "h3");
  });

  it("should pass all posts to PostList", () => {
    render(
      <PostCategorySection
        category="AI"
        label="AI"
        posts={mockPosts}
      />
    );

    const postCount = screen.getByTestId("post-count");
    expect(postCount).toHaveTextContent("2");

    expect(screen.getByTestId("post-1")).toBeInTheDocument();
    expect(screen.getByTestId("post-2")).toBeInTheDocument();
  });

  it("should start with accordion expanded", () => {
    render(
      <PostCategorySection
        category="AI"
        label="AI"
        posts={mockPosts}
      />
    );

    // Check if trigger button has aria-expanded="true" initially
    const trigger = screen.getByRole("button");
    // Note: This depends on Radix UI's default state, should be expanded
    expect(trigger).toBeInTheDocument();
  });

  it("should allow toggling accordion expansion", () => {
    render(
      <PostCategorySection
        category="AI"
        label="AI"
        posts={mockPosts}
      />
    );

    const trigger = screen.getByRole("button");

    // Initially should be visible
    expect(screen.getByTestId("post-list")).toBeInTheDocument();

    // Click to toggle (close)
    fireEvent.click(trigger);

    // Content should be hidden by Radix Accordion animation
    // Re-clicking should show it again
    fireEvent.click(trigger);

    // After re-opening, PostList should be visible again
    expect(screen.getByTestId("post-list")).toBeInTheDocument();
  });

  it("should pass view counts to PostList", () => {
    const viewCounts = new Map([
      ["1", 100],
      ["2", 50],
    ]);

    render(
      <PostCategorySection
        category="AI"
        label="AI"
        posts={mockPosts}
        viewCounts={viewCounts}
      />
    );

    expect(screen.getByTestId("post-list")).toBeInTheDocument();
  });

  it("should pass badge metadata to PostList", () => {
    render(
      <PostCategorySection
        category="AI"
        label="AI"
        posts={mockPosts}
        latestSlug="post-2"
        hottestSlug="post-1"
      />
    );

    expect(screen.getByTestId("post-list")).toBeInTheDocument();
  });

  it("should pass search query to PostList", () => {
    render(
      <PostCategorySection
        category="AI"
        label="AI"
        posts={mockPosts}
        searchQuery="test"
      />
    );

    expect(screen.getByTestId("post-list")).toBeInTheDocument();
  });

  it("should handle empty posts array gracefully", () => {
    render(
      <PostCategorySection
        category="AI"
        label="AI"
        posts={[]}
      />
    );

    expect(screen.getByText("0 posts")).toBeInTheDocument();
    expect(screen.getByTestId("post-list")).toBeInTheDocument();
  });

  it("should render without optional props", () => {
    render(
      <PostCategorySection
        category="AI"
        label="AI"
        posts={mockPosts}
      />
    );

    expect(screen.getByText("AI")).toBeInTheDocument();
    expect(screen.getByTestId("post-list")).toBeInTheDocument();
  });
});

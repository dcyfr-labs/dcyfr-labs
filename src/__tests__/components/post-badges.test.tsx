/**
 * @vitest-environment jsdom
 * 
 * Tests for PostBadges component and centralized category labels.
 * This test file serves as a regression test to ensure category badges
 * display correctly with the proper labels.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostBadges } from "@/components/blog/post/post-badges";
import { POST_CATEGORY_LABEL, type PostCategory } from "@/lib/post-categories";
import type { Post } from "@/data/posts";

// Helper to create a minimal post for testing
function createTestPost(overrides: Partial<Post> = {}): Post {
  return {
    id: "test-post-id",
    slug: "test-post",
    title: "Test Post",
    summary: "Test summary",
    publishedAt: "2025-01-01",
    tags: [],
    body: "Test body",
    readingTime: { words: 100, minutes: 1, text: "1 min read" },
    ...overrides,
  };
}

describe("PostBadges Component", () => {
  describe("Category Badge Display", () => {
    it("should display the correct label for 'Demo' category", () => {
      const post = createTestPost({ category: "Demo" });
      render(<PostBadges post={post} showCategory={true} />);
      
      expect(screen.getByText("Demo")).toBeInTheDocument();
    });

    it("should display 'Career' for 'Career' category", () => {
      const post = createTestPost({ category: "Career" });
      render(<PostBadges post={post} showCategory={true} />);
      
      expect(screen.getByText("Career")).toBeInTheDocument();
    });

    it("should display 'Web Development' for 'Web' category", () => {
      const post = createTestPost({ category: "Web" });
      render(<PostBadges post={post} showCategory={true} />);
      
      expect(screen.getByText("Web Development")).toBeInTheDocument();
    });

    it("should display 'AI' for 'AI' category", () => {
      const post = createTestPost({ category: "AI" });
      render(<PostBadges post={post} showCategory={true} />);
      
      expect(screen.getByText("AI")).toBeInTheDocument();
    });

    it("should display 'DevSecOps' for 'DevSecOps' category", () => {
      const post = createTestPost({ category: "DevSecOps" });
      render(<PostBadges post={post} showCategory={true} />);
      
      expect(screen.getByText("DevSecOps")).toBeInTheDocument();
    });

    it("should not display category badge when showCategory is false", () => {
      const post = createTestPost({ category: "Demo" });
      render(<PostBadges post={post} showCategory={false} />);
      
      expect(screen.queryByText("Demo")).not.toBeInTheDocument();
    });

    it("should not display category badge when post has no category", () => {
      const post = createTestPost({ category: undefined });
      const { container } = render(<PostBadges post={post} showCategory={true} />);
      
      // PostBadges returns null when there are no badges to display
      expect(container.firstChild).toBeNull();
    });
  });

  describe("Status Badges", () => {
    it("should display Hot badge when isHotPost is true", () => {
      const post = createTestPost();
      render(<PostBadges post={post} isHotPost={true} />);
      
      expect(screen.getByText("Hot")).toBeInTheDocument();
    });

    it("should display New badge when isLatestPost is true", () => {
      const post = createTestPost();
      render(<PostBadges post={post} isLatestPost={true} />);
      
      expect(screen.getByText("New")).toBeInTheDocument();
    });

    it("should display Archived badge when post is archived", () => {
      const post = createTestPost({ archived: true });
      render(<PostBadges post={post} />);
      
      expect(screen.getByText("Archived")).toBeInTheDocument();
    });

    it("should not display Hot/New badges when post is archived", () => {
      const post = createTestPost({ archived: true });
      render(<PostBadges post={post} isHotPost={true} isLatestPost={true} />);
      
      expect(screen.queryByText("Hot")).not.toBeInTheDocument();
      expect(screen.queryByText("New")).not.toBeInTheDocument();
      expect(screen.getByText("Archived")).toBeInTheDocument();
    });
  });
});

describe("POST_CATEGORY_LABEL mapping", () => {
  it("should have labels for all frontmatter categories used", () => {
    // These are the actual categories used in MDX frontmatter
    const frontmatterCategories: PostCategory[] = ["Demo", "Career", "Web", "AI", "DevSecOps"];
    
    for (const category of frontmatterCategories) {
      expect(POST_CATEGORY_LABEL[category]).toBeDefined();
      expect(typeof POST_CATEGORY_LABEL[category]).toBe("string");
      expect(POST_CATEGORY_LABEL[category].length).toBeGreaterThan(0);
    }
  });

  it("should have backwards-compatible lowercase category labels", () => {
    // These are legacy lowercase categories that should still work
    const legacyCategories: PostCategory[] = ["development", "security", "career", "ai", "tutorial"];
    
    for (const category of legacyCategories) {
      expect(POST_CATEGORY_LABEL[category]).toBeDefined();
    }
  });

  it("should map Web category to 'Web Development' label", () => {
    expect(POST_CATEGORY_LABEL["Web"]).toBe("Web Development");
  });

  it("should preserve exact category name for simple categories", () => {
    expect(POST_CATEGORY_LABEL["Demo"]).toBe("Demo");
    expect(POST_CATEGORY_LABEL["Career"]).toBe("Career");
    expect(POST_CATEGORY_LABEL["AI"]).toBe("AI");
    expect(POST_CATEGORY_LABEL["DevSecOps"]).toBe("DevSecOps");
  });
});

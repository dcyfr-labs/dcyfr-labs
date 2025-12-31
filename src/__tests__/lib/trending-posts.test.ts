import { describe, it, expect, beforeEach, vi } from "vitest";
import { transformTrendingPosts } from "@/lib/activity/server";
import type { Post } from "@/data/posts";

// Mock posts
const mockPosts: Post[] = [
  {
    id: "post-1",
    slug: "first-post",
    title: "First Post",
    summary: "First summary",
    publishedAt: "2025-01-10",
    tags: ["test"],
    readingTime: { words: 100, minutes: 1, text: "1 min read" },
    body: "content",
  },
  {
    id: "post-2",
    slug: "second-post",
    title: "Second Post",
    summary: "Second summary",
    publishedAt: "2025-01-09",
    tags: ["test"],
    readingTime: { words: 100, minutes: 1, text: "1 min read" },
    body: "content",
  },
  {
    id: "post-3",
    slug: "third-post-draft",
    title: "Draft Post",
    summary: "Draft summary",
    publishedAt: "2025-01-08",
    tags: ["test"],
    draft: true,
    readingTime: { words: 100, minutes: 1, text: "1 min read" },
    body: "content",
  },
  {
    id: "post-4",
    slug: "fourth-post-archived",
    title: "Archived Post",
    summary: "Archived summary",
    publishedAt: "2025-01-07",
    tags: ["test"],
    archived: true,
    readingTime: { words: 100, minutes: 1, text: "1 min read" },
    body: "content",
  },
];

describe("transformTrendingPosts", () => {
  beforeEach(() => {
    // Suppress console logs in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("returns trending posts from fallback when limit is 1", async () => {
    const result = await transformTrendingPosts(mockPosts, 1);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("First Post");
    // Should include month-based formatting: "Recently published in [Month Year]"
    expect(result[0].description).toMatch(/Recently published in \w+ \d{4}/);
    expect(result[0].source).toBe("trending");
  });

  it("filters out draft and archived posts", async () => {
    const result = await transformTrendingPosts(mockPosts, 5);

    // Should only have 2 posts (first-post, second-post)
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.title)).toEqual(["First Post", "Second Post"]);
  });

  it("uses the most recent posts when ordered by publishedAt", async () => {
    const result = await transformTrendingPosts(mockPosts, 2);

    expect(result[0].title).toBe("First Post");
    expect(result[1].title).toBe("Second Post");
  });

  it("has trending metadata set correctly", async () => {
    const result = await transformTrendingPosts(mockPosts, 1);

    expect(result.length).toBe(1);
    const item = result[0];
    expect(item).toBeDefined();
    expect(item.meta?.trending).toBe(true);
    expect(item.source).toBe("trending");
    expect(item.verb).toBe("updated");
  });
});

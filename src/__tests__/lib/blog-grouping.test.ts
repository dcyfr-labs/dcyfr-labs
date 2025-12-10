import { describe, it, expect } from "vitest";
import { groupPostsByCategory, sortCategoriesByCount } from "@/lib/blog-grouping";
import type { Post } from "@/data/posts";

const mockPosts: Post[] = [
  {
    id: "1",
    slug: "post-1",
    title: "Post 1",
    summary: "Summary 1",
    publishedAt: "2025-01-01T00:00:00Z",
    category: "AI",
    tags: ["tag1"],
    readingTime: { minutes: 5, text: "5 min read" },
  } as Post,
  {
    id: "2",
    slug: "post-2",
    title: "Post 2",
    summary: "Summary 2",
    publishedAt: "2025-01-02T00:00:00Z",
    category: "AI",
    tags: ["tag2"],
    readingTime: { minutes: 10, text: "10 min read" },
  } as Post,
  {
    id: "3",
    slug: "post-3",
    title: "Post 3",
    summary: "Summary 3",
    publishedAt: "2025-01-03T00:00:00Z",
    category: "Career",
    tags: ["tag3"],
    readingTime: { minutes: 15, text: "15 min read" },
  } as Post,
  {
    id: "4",
    slug: "post-4",
    title: "Post 4",
    summary: "Summary 4",
    publishedAt: "2025-01-04T00:00:00Z",
    category: "DevSecOps",
    tags: ["tag4"],
    readingTime: { minutes: 20, text: "20 min read" },
  } as Post,
  {
    id: "5",
    slug: "post-5",
    title: "Post 5",
    summary: "Summary 5",
    publishedAt: "2025-01-05T00:00:00Z",
    // No category
    tags: ["tag5"],
    readingTime: { minutes: 25, text: "25 min read" },
  } as Post,
];

describe("blog grouping utilities", () => {
  describe("groupPostsByCategory", () => {
    it("should group posts by category", () => {
      const result = groupPostsByCategory(mockPosts);

      expect(result.size).toBe(3); // AI, Career, DevSecOps
      expect(result.get("AI")).toHaveLength(2);
      expect(result.get("Career")).toHaveLength(1);
      expect(result.get("DevSecOps")).toHaveLength(1);
    });

    it("should exclude posts without categories", () => {
      const result = groupPostsByCategory(mockPosts);

      const allGroupedPosts = Array.from(result.values()).flat();
      expect(allGroupedPosts).toHaveLength(4); // Not 5
      expect(allGroupedPosts.every((p) => p.category)).toBe(true);
    });

    it("should handle empty array", () => {
      const result = groupPostsByCategory([]);

      expect(result.size).toBe(0);
    });

    it("should handle array with only uncategorized posts", () => {
      const uncategorizedPosts = mockPosts.filter((p) => !p.category);
      const result = groupPostsByCategory(uncategorizedPosts);

      expect(result.size).toBe(0);
    });

    it("should handle array with single post", () => {
      const result = groupPostsByCategory([mockPosts[0]]);

      expect(result.size).toBe(1);
      expect(result.get("AI")).toHaveLength(1);
      expect(result.get("AI")![0].id).toBe("1");
    });

    it("should group posts correctly by category", () => {
      const result = groupPostsByCategory(mockPosts);

      const aiPosts = result.get("AI");
      expect(aiPosts).toEqual([mockPosts[0], mockPosts[1]]);
    });
  });

  describe("sortCategoriesByCount", () => {
    it("should sort categories by post count descending", () => {
      const grouped = groupPostsByCategory(mockPosts);
      const sorted = sortCategoriesByCount(grouped);

      expect(sorted[0][0]).toBe("AI"); // 2 posts
      expect(sorted[1][0]).toBe("Career"); // 1 post
      expect(sorted[2][0]).toBe("DevSecOps"); // 1 post
    });

    it("should return correct counts in tuples", () => {
      const grouped = groupPostsByCategory(mockPosts);
      const sorted = sortCategoriesByCount(grouped);

      expect(sorted[0][1]).toHaveLength(2); // AI has 2
      expect(sorted[1][1]).toHaveLength(1); // Career has 1
      expect(sorted[2][1]).toHaveLength(1); // DevSecOps has 1
    });

    it("should handle empty map", () => {
      const emptyMap = new Map();
      const result = sortCategoriesByCount(emptyMap);

      expect(result).toEqual([]);
    });

    it("should handle single category", () => {
      const singleCategoryPosts = mockPosts.filter((p) => p.category === "AI");
      const grouped = groupPostsByCategory(singleCategoryPosts);
      const sorted = sortCategoriesByCount(grouped);

      expect(sorted).toHaveLength(1);
      expect(sorted[0][0]).toBe("AI");
      expect(sorted[0][1]).toHaveLength(2);
    });

    it("should handle ties in post count by maintaining any consistent order", () => {
      const tiedPosts = [
        { ...mockPosts[0], id: "a", category: "AI" as const },
        { ...mockPosts[1], id: "b", category: "Career" as const },
      ] as Post[];

      const grouped = groupPostsByCategory(tiedPosts);
      const sorted = sortCategoriesByCount(grouped);

      expect(sorted).toHaveLength(2);
      // Both have 1 post, order can be either but should be consistent
      expect(sorted[0][1]).toHaveLength(1);
      expect(sorted[1][1]).toHaveLength(1);
    });
  });

  describe("integration", () => {
    it("should work together to group and sort posts", () => {
      const grouped = groupPostsByCategory(mockPosts);
      const sorted = sortCategoriesByCount(grouped);

      // Verify the result structure
      expect(sorted).toHaveLength(3);
      expect(sorted[0][1].every((p) => p.category === "AI")).toBe(true);

      // Verify sorting order
      const counts = sorted.map((entry) => entry[1].length);
      for (let i = 0; i < counts.length - 1; i++) {
        expect(counts[i]).toBeGreaterThanOrEqual(counts[i + 1]);
      }
    });
  });
});

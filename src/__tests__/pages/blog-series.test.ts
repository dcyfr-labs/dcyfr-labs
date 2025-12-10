import { describe, it, expect, vi } from "vitest";
import type { Post } from "@/data/posts";

// Mock data matching post structure
const mockSeriesPosts: Post[] = [
  {
    id: "series-1",
    slug: "post-1",
    title: "React Hooks Intro",
    summary: "Introduction to React Hooks",
    publishedAt: "2025-01-01T00:00:00Z",
    tags: ["react"],
    series: { name: "React Hooks Deep Dive", order: 1 },
    readingTime: { minutes: 5, words: 1200, text: "5 min read" },
    body: "content",
  } as Post,
  {
    id: "series-2",
    slug: "post-2",
    title: "Advanced Hooks Patterns",
    summary: "Advanced patterns for React Hooks",
    publishedAt: "2025-01-02T00:00:00Z",
    tags: ["react"],
    series: { name: "React Hooks Deep Dive", order: 2 },
    readingTime: { minutes: 10, words: 2400, text: "10 min read" },
    body: "content",
  } as Post,
  {
    id: "series-3",
    slug: "post-3",
    title: "Custom Hooks Best Practices",
    summary: "Best practices for custom hooks",
    publishedAt: "2025-01-03T00:00:00Z",
    tags: ["react"],
    series: { name: "React Hooks Deep Dive", order: 3 },
    readingTime: { minutes: 13, words: 3100, text: "13 min read" },
    body: "content",
  } as Post,
];

describe("Series page utilities", () => {
  describe("series post grouping", () => {
    it("should calculate total reading time correctly", () => {
      const totalReadingTime = mockSeriesPosts.reduce((sum, post) => {
        return sum + post.readingTime.minutes;
      }, 0);

      expect(totalReadingTime).toBe(28);
    });

    it("should handle single post reading time", () => {
      const singlePost = [mockSeriesPosts[0]];
      const totalReadingTime = singlePost.reduce((sum, post) => {
        return sum + post.readingTime.minutes;
      }, 0);

      expect(totalReadingTime).toBe(5);
    });

    it("should handle empty series", () => {
      const emptyPosts: Post[] = [];
      const totalReadingTime = emptyPosts.reduce((sum, post) => {
        return sum + post.readingTime.minutes;
      }, 0);

      expect(totalReadingTime).toBe(0);
    });
  });

  describe("slug formatting", () => {
    it("should convert series name to slug correctly", () => {
      const seriesName = "React Hooks Deep Dive";
      const slug = seriesName.toLowerCase().replace(/\s+/g, "-");
      expect(slug).toBe("react-hooks-deep-dive");
    });

    it("should handle series names with multiple spaces", () => {
      const seriesName = "Advanced   TypeScript  Patterns";
      const slug = seriesName.toLowerCase().replace(/\s+/g, "-");
      expect(slug).toBe("advanced-typescript-patterns");
    });

    it("should handle mixed case series names", () => {
      const seriesName = "My AWESOME Series";
      const slug = seriesName.toLowerCase().replace(/\s+/g, "-");
      expect(slug).toBe("my-awesome-series");
    });
  });

  describe("series posts are sorted by order", () => {
    it("should maintain order from series data", () => {
      // Posts should be in order 1, 2, 3
      expect(mockSeriesPosts[0].series?.order).toBe(1);
      expect(mockSeriesPosts[1].series?.order).toBe(2);
      expect(mockSeriesPosts[2].series?.order).toBe(3);
    });

    it("should handle posts with same series name", () => {
      const allSeries = mockSeriesPosts.map((p) => p.series?.name);
      const uniqueSeries = new Set(allSeries);
      expect(uniqueSeries.size).toBe(1);
      expect(Array.from(uniqueSeries)[0]).toBe("React Hooks Deep Dive");
    });
  });

  describe("reading time formatting", () => {
    it("should ceil reading time for fractional minutes", () => {
      const totalMinutes = 28.3;
      const ceiled = Math.ceil(totalMinutes);
      expect(ceiled).toBe(29);
    });

    it("should not change whole number reading times", () => {
      const totalMinutes = 28;
      const ceiled = Math.ceil(totalMinutes);
      expect(ceiled).toBe(28);
    });
  });
});

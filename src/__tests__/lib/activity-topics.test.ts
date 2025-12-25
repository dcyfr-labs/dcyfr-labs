/**
 * Tests for Activity Topic Extraction and Clustering
 *
 * Validates topic extraction, normalization, filtering, and co-occurrence analysis
 */

import { describe, it, expect } from "vitest";
import type { ActivityItem } from "@/lib/activity/types";
import {
  extractTopics,
  filterByTopics,
  buildCooccurrenceMatrix,
  getRelatedTopics,
  getActivityTopics,
} from "@/lib/activity/topics";

// ============================================================================
// TEST DATA
// ============================================================================

const createMockActivity = (
  id: string,
  tags?: string[],
  category?: string,
  title?: string,
  description?: string
): ActivityItem => ({
  id,
  source: "blog",
  verb: "published",
  title: title || `Test Activity ${id}`,
  description,
  timestamp: new Date("2025-01-01"),
  href: `/activity/${id}`,
  meta: {
    tags,
    category,
  },
});

// ============================================================================
// TOPIC EXTRACTION TESTS
// ============================================================================

describe("extractTopics", () => {
  it("should extract topics from tags", () => {
    const activities = [
      createMockActivity("1", ["TypeScript", "React"]),
      createMockActivity("2", ["TypeScript", "Node.js"]),
      createMockActivity("3", ["React"]),
    ];

    const topics = extractTopics(activities, { includeKeywords: false });

    expect(topics).toHaveLength(3);
    expect(topics[0].name).toBe("TypeScript");
    expect(topics[0].count).toBe(2);
    expect(topics[1].name).toBe("React");
    expect(topics[1].count).toBe(2);
    expect(topics[2].name).toBe("Node.js");
    expect(topics[2].count).toBe(1);
  });

  it("should normalize topic names", () => {
    const activities = [
      createMockActivity("1", ["typescript", "REACT"]),
      createMockActivity("2", ["TypeScript", "react"]),
      createMockActivity("3", ["ts", "reactjs"]),
    ];

    const topics = extractTopics(activities, { includeKeywords: false });

    expect(topics).toHaveLength(2);
    expect(topics[0].name).toBe("TypeScript"); // Normalized from ts, typescript, TypeScript
    expect(topics[0].count).toBe(3);
    expect(topics[1].name).toBe("React"); // Normalized from REACT, react, reactjs
    expect(topics[1].count).toBe(3);
  });

  it("should extract topics from categories", () => {
    const activities = [
      createMockActivity("1", undefined, "Web Development"),
      createMockActivity("2", undefined, "Web Development"),
      createMockActivity("3", undefined, "DevOps"),
    ];

    const topics = extractTopics(activities, { includeKeywords: false });

    expect(topics).toHaveLength(2);
    expect(topics[0].name).toBe("Web Development");
    expect(topics[0].count).toBe(2);
  });

  it("should filter by minimum count", () => {
    const activities = [
      createMockActivity("1", ["TypeScript"]),
      createMockActivity("2", ["React"]),
      createMockActivity("3", ["React"]),
      createMockActivity("4", ["Vue"]),
    ];

    const topics = extractTopics(activities, {
      includeKeywords: false,
      minCount: 2,
    });

    expect(topics).toHaveLength(1);
    expect(topics[0].name).toBe("React");
    expect(topics[0].count).toBe(2);
  });

  it("should limit to max topics", () => {
    const activities = [
      createMockActivity("1", ["A", "B", "C"]),
      createMockActivity("2", ["D", "E", "F"]),
      createMockActivity("3", ["G", "H", "I"]),
    ];

    const topics = extractTopics(activities, {
      includeKeywords: false,
      maxTopics: 3,
    });

    expect(topics).toHaveLength(3);
  });

  it("should calculate correct percentages", () => {
    const activities = [
      createMockActivity("1", ["TypeScript"]),
      createMockActivity("2", ["TypeScript"]),
      createMockActivity("3", ["React"]),
      createMockActivity("4", ["Vue"]),
    ];

    const topics = extractTopics(activities, { includeKeywords: false });

    const typescript = topics.find((t) => t.name === "TypeScript");
    expect(typescript?.percentage).toBe(50); // 2 out of 4 = 50%

    const react = topics.find((t) => t.name === "React");
    expect(react?.percentage).toBe(25); // 1 out of 4 = 25%
  });

  it("should extract keywords from titles when enabled", () => {
    const activities = [
      createMockActivity(
        "1",
        [],
        undefined,
        "Building Apps with TypeScript"
      ),
      createMockActivity("2", [], undefined, "TypeScript Best Practices"),
    ];

    const topics = extractTopics(activities, {
      includeKeywords: true,
      minKeywordLength: 4,
    });

    // Should extract "TypeScript", "Building", "Apps", "Best", "Practices"
    const typescript = topics.find((t) => t.name === "TypeScript");
    expect(typescript).toBeDefined();
    expect(typescript?.count).toBe(2);
  });

  it("should exclude stop words from keyword extraction", () => {
    const activities = [
      createMockActivity(
        "1",
        [],
        undefined,
        "The Best Way to Learn React"
      ),
    ];

    const topics = extractTopics(activities, {
      includeKeywords: true,
      minKeywordLength: 3,
    });

    // Should not include "the", "to", "way" (stop words)
    const topicNames = topics.map((t) => t.name);
    expect(topicNames).not.toContain("The");
    expect(topicNames).not.toContain("Way");
  });

  it("should handle empty activities", () => {
    const topics = extractTopics([], { includeKeywords: false });
    expect(topics).toHaveLength(0);
  });

  it("should handle activities with no topics", () => {
    const activities = [
      createMockActivity("1", undefined, undefined, "No tags"),
    ];

    const topics = extractTopics(activities, { includeKeywords: false });
    expect(topics).toHaveLength(0);
  });
});

// ============================================================================
// CO-OCCURRENCE MATRIX TESTS
// ============================================================================

describe("buildCooccurrenceMatrix", () => {
  it("should build co-occurrence matrix", () => {
    const activities = [
      createMockActivity("1", ["TypeScript", "React"]),
      createMockActivity("2", ["TypeScript", "Node.js"]),
      createMockActivity("3", ["React", "TypeScript"]),
    ];

    const matrix = buildCooccurrenceMatrix(activities);

    expect(matrix.has("TypeScript")).toBe(true);
    expect(matrix.has("React")).toBe(true);
    expect(matrix.has("Node.js")).toBe(true);

    const typescriptRelated = matrix.get("TypeScript");
    expect(typescriptRelated?.get("React")).toBe(2); // Co-occurs 2 times
    expect(typescriptRelated?.get("Node.js")).toBe(1); // Co-occurs 1 time
  });

  it("should handle symmetric co-occurrences", () => {
    const activities = [createMockActivity("1", ["A", "B"])];

    const matrix = buildCooccurrenceMatrix(activities);

    expect(matrix.get("A")?.get("B")).toBe(1);
    expect(matrix.get("B")?.get("A")).toBe(1);
  });

  it("should handle activities with single topic", () => {
    const activities = [createMockActivity("1", ["TypeScript"])];

    const matrix = buildCooccurrenceMatrix(activities);

    expect(matrix.has("TypeScript")).toBe(true);
    expect(matrix.get("TypeScript")?.size).toBe(0); // No co-occurrences
  });

  it("should normalize topics in co-occurrence matrix", () => {
    const activities = [
      createMockActivity("1", ["typescript", "react"]),
      createMockActivity("2", ["TypeScript", "React"]),
    ];

    const matrix = buildCooccurrenceMatrix(activities);

    expect(matrix.has("TypeScript")).toBe(true);
    expect(matrix.has("React")).toBe(true);
    expect(matrix.get("TypeScript")?.get("React")).toBe(2);
  });
});

// ============================================================================
// RELATED TOPICS TESTS
// ============================================================================

describe("getRelatedTopics", () => {
  it("should return related topics sorted by frequency", () => {
    const activities = [
      createMockActivity("1", ["TypeScript", "React", "Next.js"]),
      createMockActivity("2", ["TypeScript", "React"]),
      createMockActivity("3", ["TypeScript", "Node.js"]),
    ];

    const matrix = buildCooccurrenceMatrix(activities);
    const related = getRelatedTopics("TypeScript", matrix);

    expect(related).toHaveLength(3);
    expect(related[0]).toBe("React"); // Appears 2 times
    expect(related).toContain("Next.js");
    expect(related).toContain("Node.js");
  });

  it("should limit number of related topics", () => {
    const activities = [
      createMockActivity("1", ["A", "B", "C", "D", "E", "F"]),
    ];

    const matrix = buildCooccurrenceMatrix(activities);
    const related = getRelatedTopics("A", matrix, 3);

    expect(related.length).toBeLessThanOrEqual(3);
  });

  it("should return empty array for unknown topic", () => {
    const activities = [createMockActivity("1", ["TypeScript"])];

    const matrix = buildCooccurrenceMatrix(activities);
    const related = getRelatedTopics("Unknown", matrix);

    expect(related).toHaveLength(0);
  });

  it("should normalize topic name in lookup", () => {
    const activities = [
      createMockActivity("1", ["TypeScript", "React"]),
    ];

    const matrix = buildCooccurrenceMatrix(activities);
    const related = getRelatedTopics("typescript", matrix); // Lowercase query

    expect(related).toHaveLength(1);
    expect(related[0]).toBe("React");
  });
});

// ============================================================================
// FILTER BY TOPICS TESTS
// ============================================================================

describe("filterByTopics", () => {
  it("should filter activities by selected topics", () => {
    const activities = [
      createMockActivity("1", ["TypeScript"]),
      createMockActivity("2", ["React"]),
      createMockActivity("3", ["TypeScript", "React"]),
    ];

    const filtered = filterByTopics(activities, ["TypeScript"]);

    expect(filtered).toHaveLength(2);
    expect(filtered[0].id).toBe("1");
    expect(filtered[1].id).toBe("3");
  });

  it("should match activities with ANY selected topic (OR logic)", () => {
    const activities = [
      createMockActivity("1", ["TypeScript"]),
      createMockActivity("2", ["React"]),
      createMockActivity("3", ["Vue"]),
    ];

    const filtered = filterByTopics(activities, ["TypeScript", "React"]);

    expect(filtered).toHaveLength(2);
    expect(filtered.map((a) => a.id)).toEqual(["1", "2"]);
  });

  it("should return all activities when no topics selected", () => {
    const activities = [
      createMockActivity("1", ["TypeScript"]),
      createMockActivity("2", ["React"]),
    ];

    const filtered = filterByTopics(activities, []);

    expect(filtered).toHaveLength(2);
  });

  it("should normalize topics in filtering", () => {
    const activities = [
      createMockActivity("1", ["typescript"]),
      createMockActivity("2", ["TYPESCRIPT"]),
    ];

    const filtered = filterByTopics(activities, ["TypeScript"]);

    expect(filtered).toHaveLength(2);
  });

  it("should filter by category", () => {
    const activities = [
      createMockActivity("1", undefined, "Web Development"),
      createMockActivity("2", undefined, "DevOps"),
    ];

    const filtered = filterByTopics(activities, ["Web Development"]);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("1");
  });

  it("should handle activities with no topics", () => {
    const activities = [
      createMockActivity("1", ["TypeScript"]),
      createMockActivity("2", undefined, undefined),
    ];

    const filtered = filterByTopics(activities, ["TypeScript"]);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("1");
  });
});

// ============================================================================
// GET ACTIVITY TOPICS TESTS
// ============================================================================

describe("getActivityTopics", () => {
  it("should get all topics for an activity", () => {
    const activity = createMockActivity(
      "1",
      ["TypeScript", "React"],
      "Web Development"
    );

    const topics = getActivityTopics(activity);

    expect(topics).toHaveLength(3);
    expect(topics).toContain("TypeScript");
    expect(topics).toContain("React");
    expect(topics).toContain("Web Development");
  });

  it("should normalize topics", () => {
    const activity = createMockActivity("1", ["typescript", "react"]);

    const topics = getActivityTopics(activity);

    expect(topics).toContain("TypeScript");
    expect(topics).toContain("React");
  });

  it("should handle activity with no topics", () => {
    const activity = createMockActivity("1");

    const topics = getActivityTopics(activity);

    expect(topics).toHaveLength(0);
  });

  it("should deduplicate topics", () => {
    const activity = createMockActivity(
      "1",
      ["TypeScript", "typescript"],
      "TypeScript"
    );

    const topics = getActivityTopics(activity);

    // Should only have one "TypeScript" entry
    expect(topics).toHaveLength(1);
    expect(topics[0]).toBe("TypeScript");
  });
});

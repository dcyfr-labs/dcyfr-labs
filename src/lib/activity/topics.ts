/**
 * Activity Topic Extraction and Clustering
 *
 * Extracts topics from activity metadata (tags, keywords, categories) without
 * requiring expensive AI API calls. Uses simple but effective techniques:
 * - Tag aggregation from activity metadata
 * - Keyword extraction from titles and descriptions
 * - Topic frequency calculation
 * - Co-occurrence analysis for "related topics"
 * - Simple normalization for grouping similar topics
 *
 * This approach is:
 * - Cost-effective (no API calls)
 * - Fast (all client-side)
 * - Accurate (uses real metadata)
 * - Maintainable (simple algorithms)
 */

import type { ActivityItem } from "./types";

// ============================================================================
// TYPES
// ============================================================================

/**
 * A topic extracted from activities
 */
export interface Topic {
  /** Normalized topic name (e.g., "TypeScript", "Next.js") */
  name: string;
  /** Number of activities with this topic */
  count: number;
  /** Percentage of total activities (0-100) */
  percentage: number;
  /** Related topics that frequently co-occur */
  relatedTopics?: string[];
}

/**
 * Topic extraction configuration
 */
export interface TopicExtractionOptions {
  /** Minimum topic frequency to include (default: 1) */
  minCount?: number;
  /** Maximum number of topics to return (default: unlimited) */
  maxTopics?: number;
  /** Include keywords from titles/descriptions (default: true) */
  includeKeywords?: boolean;
  /** Minimum keyword length (default: 3) */
  minKeywordLength?: number;
}

/**
 * Topic co-occurrence matrix for related topics
 */
export type TopicCooccurrence = Map<string, Map<string, number>>;

// ============================================================================
// STOP WORDS (Common words to exclude from keyword extraction)
// ============================================================================

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "as",
  "is",
  "was",
  "are",
  "were",
  "been",
  "be",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "should",
  "could",
  "may",
  "might",
  "can",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "what",
  "which",
  "who",
  "when",
  "where",
  "why",
  "how",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "just",
  "about",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "between",
  "under",
  "again",
  "further",
  "then",
  "once",
  "way",
  "learn",
  "best",
]);

// ============================================================================
// TOPIC NORMALIZATION
// ============================================================================

/**
 * Normalize topic names to group similar variations
 * Examples:
 * - "typescript", "TypeScript", "TS" → "TypeScript"
 * - "nextjs", "next.js", "Next" → "Next.js"
 * - "react", "reactjs", "React.js" → "React"
 */
const TOPIC_NORMALIZATIONS: Record<string, string> = {
  // JavaScript ecosystem
  typescript: "TypeScript",
  ts: "TypeScript",
  javascript: "JavaScript",
  js: "JavaScript",
  react: "React",
  reactjs: "React",
  "react.js": "React",
  nextjs: "Next.js",
  "next.js": "Next.js",
  next: "Next.js",
  nodejs: "Node.js",
  "node.js": "Node.js",
  node: "Node.js",
  tailwind: "Tailwind CSS",
  "tailwind css": "Tailwind CSS",
  tailwindcss: "Tailwind CSS",

  // Tools & platforms
  git: "Git",
  github: "GitHub",
  vscode: "VS Code",
  "visual studio code": "VS Code",
  docker: "Docker",
  kubernetes: "Kubernetes",
  k8s: "Kubernetes",

  // Concepts
  api: "API",
  rest: "REST API",
  "rest api": "REST API",
  graphql: "GraphQL",
  ci: "CI/CD",
  cd: "CI/CD",
  "ci/cd": "CI/CD",
  devops: "DevOps",
  seo: "SEO",
  ux: "UX",
  ui: "UI",
  "ui/ux": "UI/UX",

  // Programming concepts
  async: "Async/Await",
  await: "Async/Await",
  promise: "Promises",
  promises: "Promises",
};

/**
 * Normalize a topic name
 */
function normalizeTopic(topic: string): string {
  const normalized = topic.toLowerCase().trim();
  return TOPIC_NORMALIZATIONS[normalized] || capitalizeWords(topic);
}

/**
 * Capitalize words in a topic name (e.g., "web development" → "Web Development")
 */
function capitalizeWords(text: string): string {
  return text
    .split(/[\s-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// ============================================================================
// KEYWORD EXTRACTION
// ============================================================================

/**
 * Extract keywords from text using simple tokenization and filtering
 */
function extractKeywords(text: string, minLength = 3): string[] {
  if (!text) return [];

  // Tokenize: split on non-word characters, lowercase, filter
  const tokens = text
    .toLowerCase()
    .split(/[^\w]+/)
    .filter((token) => token.length >= minLength && !STOP_WORDS.has(token));

  // Return unique keywords
  return Array.from(new Set(tokens));
}

// ============================================================================
// TOPIC EXTRACTION
// ============================================================================

/** Collect the normalized topics for a single activity item */
function collectActivityTopics(
  activity: ActivityItem,
  includeKeywords: boolean,
  minKeywordLength: number
): Set<string> {
  const topics = new Set<string>();

  if (activity.meta?.tags) {
    for (const tag of activity.meta.tags) {
      topics.add(normalizeTopic(tag));
    }
  }

  if (activity.meta?.category) {
    topics.add(normalizeTopic(activity.meta.category));
  }

  if (includeKeywords) {
    for (const kw of extractKeywords(activity.title, minKeywordLength)) {
      topics.add(normalizeTopic(kw));
    }
    if (activity.description) {
      for (const kw of extractKeywords(activity.description, minKeywordLength)) {
        topics.add(normalizeTopic(kw));
      }
    }
  }

  return topics;
}

/**
 * Extract all topics from activity items
 *
 * Topics are extracted from:
 * 1. Activity metadata tags (most reliable)
 * 2. Activity categories
 * 3. Keywords from titles (if includeKeywords enabled)
 * 4. Keywords from descriptions (if includeKeywords enabled)
 */
export function extractTopics(
  activities: ActivityItem[],
  options: TopicExtractionOptions = {}
): Topic[] {
  const {
    minCount = 1,
    maxTopics,
    includeKeywords = true,
    minKeywordLength = 3,
  } = options;

  // Topic frequency map (normalized topic → count)
  const topicCounts = new Map<string, number>();

  // Extract topics from each activity
  for (const activity of activities) {
    const activityTopics = collectActivityTopics(activity, includeKeywords, minKeywordLength);

    // Increment counts for all topics in this activity
    for (const topic of activityTopics) {
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    }
  }

  // Convert to Topic objects
  const totalActivities = activities.length;
  const topics: Topic[] = Array.from(topicCounts.entries())
    .filter(([_, count]) => count >= minCount)
    .map(([name, count]) => ({
      name,
      count,
      percentage: (count / totalActivities) * 100,
    }))
    .sort((a, b) => b.count - a.count); // Sort by frequency (descending)

  // Limit to maxTopics if specified
  return maxTopics ? topics.slice(0, maxTopics) : topics;
}

// ============================================================================
// TOPIC CO-OCCURRENCE
// ============================================================================

/** Update co-occurrence matrix for all pairs in a topic set */
function updateCooccurrences(matrix: TopicCooccurrence, topics: string[]): void {
  for (let i = 0; i < topics.length; i++) {
    const topicA = topics[i];
    if (!matrix.has(topicA)) matrix.set(topicA, new Map());
    const comap = matrix.get(topicA)!;
    for (let j = 0; j < topics.length; j++) {
      if (i === j) continue;
      const topicB = topics[j];
      comap.set(topicB, (comap.get(topicB) || 0) + 1);
    }
  }
}

/**
 * Build a topic co-occurrence matrix
 *
 * For each topic, tracks how often it appears with other topics.
 * Used for "Related topics" recommendations.
 */
export function buildCooccurrenceMatrix(
  activities: ActivityItem[]
): TopicCooccurrence {
  const matrix: TopicCooccurrence = new Map();

  for (const activity of activities) {
    const activityTopics = new Set<string>();

    if (activity.meta?.tags) {
      for (const tag of activity.meta.tags) {
        activityTopics.add(normalizeTopic(tag));
      }
    }

    if (activity.meta?.category) {
      activityTopics.add(normalizeTopic(activity.meta.category));
    }

    updateCooccurrences(matrix, Array.from(activityTopics));
  }

  return matrix;
}

/**
 * Get related topics for a given topic (most frequently co-occurring)
 */
export function getRelatedTopics(
  topic: string,
  matrix: TopicCooccurrence,
  limit = 5
): string[] {
  const normalizedTopic = normalizeTopic(topic);
  const cooccurrences = matrix.get(normalizedTopic);

  if (!cooccurrences) return [];

  // Sort by co-occurrence count (descending)
  return Array.from(cooccurrences.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([topic]) => topic);
}

// ============================================================================
// TOPIC FILTERING
// ============================================================================

/**
 * Filter activities by selected topics
 *
 * An activity matches if it has ANY of the selected topics
 */
export function filterByTopics(
  activities: ActivityItem[],
  selectedTopics: string[]
): ActivityItem[] {
  if (selectedTopics.length === 0) return activities;

  const normalizedSelected = new Set(selectedTopics.map(normalizeTopic));

  return activities.filter((activity) => {
    // Extract all topics for this activity
    const activityTopics = new Set<string>();

    if (activity.meta?.tags) {
      for (const tag of activity.meta.tags) {
        activityTopics.add(normalizeTopic(tag));
      }
    }

    if (activity.meta?.category) {
      activityTopics.add(normalizeTopic(activity.meta.category));
    }

    // Check if any selected topic matches
    for (const topic of activityTopics) {
      if (normalizedSelected.has(topic)) {
        return true;
      }
    }

    return false;
  });
}

/**
 * Get topics for a specific activity item
 */
export function getActivityTopics(activity: ActivityItem): string[] {
  const topics = new Set<string>();

  if (activity.meta?.tags) {
    for (const tag of activity.meta.tags) {
      topics.add(normalizeTopic(tag));
    }
  }

  if (activity.meta?.category) {
    topics.add(normalizeTopic(activity.meta.category));
  }

  return Array.from(topics);
}

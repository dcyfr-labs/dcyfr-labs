/**
 * Shared TypeScript types for MCP servers
 * Used across Analytics, Design Token, and Content Manager MCPs
 */

// ============================================================================
// Common Types
// ============================================================================

export interface MCPContext {
  sessionId?: string;
  requestId?: string;
  session?: Record<string, unknown>;
}

export interface MCPError {
  code: string;
  message: string;
  details?: unknown;
}

// ============================================================================
// Analytics MCP Types
// ============================================================================

export type TimeRange = "1h" | "24h" | "7d" | "30d" | "all";

export interface PageViewData {
  path: string;
  views: number;
  timeRange: TimeRange;
  trend?: {
    direction: "up" | "down" | "stable";
    percentage: number;
  };
}

export interface TrendingContent {
  path: string;
  title?: string;
  views: number;
  rank: number;
}

export interface EngagementMetric {
  type: "click" | "share" | "interaction";
  count: number;
  path?: string;
}

export interface ActivityLog {
  id: string;
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  achievedAt: number;
  category: string;
  isTest?: boolean;
}

export interface AnalyticsSummary {
  totalViews: number;
  topPages: TrendingContent[];
  recentActivity: ActivityLog[];
  milestones: Milestone[];
  generatedAt: number;
}

// ============================================================================
// Design Token MCP Types
// ============================================================================

export type TokenCategory =
  | "spacing"
  | "typography"
  | "colors"
  | "containerWidths"
  | "breakpoints"
  | "animation";

export interface TokenViolation {
  line: number;
  column?: number;
  hardcodedValue: string;
  suggestedToken: string;
  category: TokenCategory;
  severity: "error" | "warning";
}

export interface TokenValidationResult {
  isValid: boolean;
  compliance: number; // 0-100
  violations: TokenViolation[];
  totalChecks: number;
}

export interface TokenSuggestion {
  tokenName: string;
  tokenValue: string;
  category: TokenCategory;
  confidence: number; // 0-100
  usage: string; // Example usage
}

export interface TokenUsage {
  tokenName: string;
  category: TokenCategory;
  files: string[];
  count: number;
}

export interface ComplianceReport {
  overall: number;
  byCategory: Record<TokenCategory, number>;
  totalViolations: number;
  recentViolations: TokenViolation[];
  trend: {
    direction: "improving" | "declining" | "stable";
    changePercent: number;
  };
}

// ============================================================================
// Content Manager MCP Types
// ============================================================================

export type ContentType = "blog" | "project";

export interface ContentMetadata {
  title: string;
  description?: string;
  date: string;
  author?: string;
  tags?: string[];
  category?: string;
  readingTime?: number;
  wordCount?: number;
}

export interface ContentItem {
  filePath: string;
  type: ContentType;
  slug: string;
  metadata: ContentMetadata;
  excerpt?: string;
}

export interface ContentAnalysis {
  filePath: string;
  metadata: ContentMetadata;
  wordCount: number;
  readingTime: number;
  topics: string[];
  links: {
    internal: number;
    external: number;
  };
  headings: {
    h1: number;
    h2: number;
    h3: number;
  };
}

export interface RelatedContent {
  content: ContentItem;
  relevanceScore: number; // 0-100
  sharedTopics: string[];
}

export interface TopicTaxonomy {
  topic: string;
  count: number;
  relatedTopics: string[];
  contentItems: ContentItem[];
}

export interface SearchResult {
  content: ContentItem;
  matches: {
    field: "title" | "description" | "body";
    snippet: string;
  }[];
  score: number;
}

// ============================================================================
// Cache Types
// ============================================================================

export interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttl: number; // milliseconds
}

export interface CacheOptions {
  ttl: number;
  key: string;
}

// ============================================================================
// Semantic Scholar MCP Types
// ============================================================================

/**
 * Author information from Semantic Scholar
 */
export interface ScholarAuthor {
  authorId: string;
  name: string;
  affiliations?: string[];
  homepage?: string;
  paperCount?: number;
  citationCount?: number;
  hIndex?: number;
  url?: string;
}

/**
 * Paper information from Semantic Scholar
 */
export interface ScholarPaper {
  paperId: string;
  corpusId?: number;
  title: string;
  abstract?: string;
  venue?: string;
  year?: number;
  publicationDate?: string;
  citationCount?: number;
  influentialCitationCount?: number;
  referenceCount?: number;
  authors?: ScholarAuthor[];
  fieldsOfStudy?: string[];
  openAccessPdf?: {
    url: string;
    status: string;
  };
  externalIds?: {
    DOI?: string;
    ArXiv?: string;
    MAG?: string;
    ACL?: string;
    PubMed?: string;
    CorpusId?: number;
  };
  url?: string;
  tldr?: {
    model: string;
    text: string;
  };
}

/**
 * Citation context from Semantic Scholar
 */
export interface ScholarCitation {
  citingPaper: ScholarPaper;
  contexts?: string[];
  intents?: string[];
  isInfluential?: boolean;
}

/**
 * Reference information from Semantic Scholar
 */
export interface ScholarReference {
  citedPaper: ScholarPaper;
  contexts?: string[];
  intents?: string[];
  isInfluential?: boolean;
}

/**
 * Search result from Semantic Scholar paper search
 */
export interface ScholarSearchResult {
  total: number;
  offset: number;
  next?: number;
  data: ScholarPaper[];
}

/**
 * Bulk search result with pagination token
 */
export interface ScholarBulkSearchResult {
  total?: number;
  token?: string;
  data: ScholarPaper[];
}

/**
 * Author search result
 */
export interface ScholarAuthorSearchResult {
  total: number;
  offset: number;
  next?: number;
  data: ScholarAuthor[];
}

/**
 * Paper recommendation
 */
export interface ScholarRecommendation {
  recommendedPapers: ScholarPaper[];
}

/**
 * Query parameters for paper search
 */
export interface ScholarSearchParams {
  query: string;
  fields?: string[];
  year?: string;
  publicationTypes?: string[];
  openAccessPdf?: boolean;
  minCitationCount?: number;
  venue?: string;
  fieldsOfStudy?: string[];
  limit?: number;
  offset?: number;
  token?: string;
}

/**
 * Cache statistics for Semantic Scholar MCP
 */
export interface ScholarCacheStats {
  papers: {
    total: number;
    valid: number;
    expired: number;
  };
  searches: {
    total: number;
    valid: number;
    expired: number;
  };
  authors: {
    total: number;
    valid: number;
    expired: number;
  };
  hitRate: number;
  missRate: number;
}

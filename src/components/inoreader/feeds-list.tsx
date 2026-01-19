/**
 * Feeds List Component
 *
 * Client-side component for displaying and filtering Inoreader articles.
 * Includes search, filtering, and card-based layout.
 */

"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Clock, Tag } from "lucide-react";
import type { InoreaderArticle } from "@/types/inoreader";
import { SPACING, HOVER_EFFECTS } from "@/lib/design-tokens";

interface FeedsListProps {
  articles: InoreaderArticle[];
}

export function FeedsList({ articles }: FeedsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags from articles
  const allTags = Array.from(
    new Set(
      articles.flatMap((article) =>
        article.categories
          .filter((cat) => cat.startsWith("user/-/label/"))
          .map((cat) => cat.replace("user/-/label/", "")),
      ),
    ),
  ).sort();

  // Filter articles based on search and selected tag
  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag =
      !selectedTag || article.categories.some((cat) => cat === `user/-/label/${selectedTag}`);

    return matchesSearch && matchesTag;
  });

  return (
    <div className={SPACING.content}>
      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Badge
              variant={selectedTag === null ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setSelectedTag(null)}
            >
              All ({articles.length})
            </Badge>
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Results Count */}
      <p className="mb-4 text-sm text-muted-foreground">
        Showing {filteredArticles.length} of {articles.length} articles
      </p>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            No articles match your search criteria. Try a different query or tag.
          </p>
        </div>
      ) : (
         <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Individual Article Card Component
 */
function ArticleCard({ article }: { article: InoreaderArticle }) {
  // Format timestamp
  const publishedDate = new Date(article.published * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Extract plain text from HTML summary (first 200 chars)
  const plainTextSummary = article.summary.content
    .replace(/<[^>]*>/g, "")
    .substring(0, 200)
    .trim();

  // Get article URL
  const articleUrl =
    article.canonical?.[0]?.href || article.alternate?.[0]?.href || article.origin.htmlUrl;

  // Extract tags
  const tags = article.categories
    .filter((cat) => cat.startsWith("user/-/label/"))
    .map((cat) => cat.replace("user/-/label/", ""))
    .slice(0, 3); // Show max 3 tags

  return (
    <Card className={HOVER_EFFECTS.card}>
      <CardHeader>
        <div className="mb-2 flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-lg">
            <a
              href={articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              {article.title}
            </a>
          </CardTitle>
          <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>

        <CardDescription className="flex items-center gap-2 text-xs">
          <Clock className="h-3 w-3" />
          {publishedDate}
          {article.author && (
            <>
              <span>•</span>
              <span>{article.author}</span>
            </>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
          {plainTextSummary}
          {article.summary.content.length > 200 && "..."}
        </p>

        {/* Source */}
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Tag className="h-3 w-3" />
          <span className="truncate">{article.origin.title}</span>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

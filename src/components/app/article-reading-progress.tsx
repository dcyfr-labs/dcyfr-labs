"use client";

import { useReadingProgress } from "@/hooks/use-reading-progress";
import { ReadingProgressBar } from "@/components/app/reading-progress-bar";

/**
 * Article Reading Progress Wrapper
 * 
 * Client component that adds reading progress tracking to articles.
 * Wraps article content and provides progress bar visualization.
 * 
 * @example
 * ```tsx
 * <ArticleReadingProgress articleId="my-blog-post" title="My Blog Post" readingTime={5}>
 *   <article>...</article>
 * </ArticleReadingProgress>
 * ```
 */
export function ArticleReadingProgress({
  articleId,
  title,
  readingTime,
  children,
}: {
  /** Unique article identifier (slug) */
  articleId: string;
  /** Article title */
  title?: string;
  /** Estimated reading time in minutes */
  readingTime?: number;
  /** Article content */
  children: React.ReactNode;
}) {
  const { progress } = useReadingProgress(articleId, {
    title,
    readingTime,
    threshold: 90,
  });

  return (
    <>
      <ReadingProgressBar progress={progress} />
      {children}
    </>
  );
}

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, BookOpen } from "lucide-react";
import type { Post } from "@/data/posts";
import { cn } from "@/lib/utils";

/**
 * SeriesNavigation Component
 * 
 * Displays navigation for blog post series, showing all posts in the series
 * with the current post highlighted. Helps readers navigate multi-part content.
 * 
 * Features:
 * - Shows series name and total post count
 * - Highlights current post
 * - Links to all other posts in series
 * - Displays post order numbers
 * - Responsive design with proper mobile spacing
 * 
 * @param props.currentPost - The current blog post being viewed
 * @param props.seriesPosts - All posts in the same series, sorted by order
 * 
 * @example
 * ```tsx
 * <SeriesNavigation 
 *   currentPost={post} 
 *   seriesPosts={seriesPostsArray} 
 * />
 * ```
 */
interface SeriesNavigationProps {
  currentPost: Post;
  seriesPosts: Post[];
}

export function SeriesNavigation({ currentPost, seriesPosts }: SeriesNavigationProps) {
  if (!currentPost.series || seriesPosts.length === 0) {
    return null;
  }

  const { name: seriesName } = currentPost.series;
  const totalPosts = seriesPosts.length;

  return (
    <div className="my-8 rounded-lg border bg-card p-4">
      <div className="flex items-start gap-3 mb-4">
        <BookOpen className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-lg mb-1">Series: {seriesName}</h2>
          <p className="text-sm text-muted-foreground">
            {totalPosts} {totalPosts === 1 ? "post" : "posts"} in this series
          </p>
        </div>
      </div>

      <nav aria-label={`${seriesName} series navigation`}>
        <ol className="space-y-2">
          {seriesPosts.map((post) => {
            const isCurrent = post.slug === currentPost.slug;
            const order = post.series?.order ?? 0;

            return (
              <li key={post.slug} className="flex items-start gap-2">
                <Badge 
                  variant="outline" 
                  className="mt-1 flex-shrink-0 min-w-[32px] justify-center"
                >
                  {order}
                </Badge>
                
                {isCurrent ? (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-primary truncate">
                        {post.title}
                      </span>
                      <Badge variant="secondary" className="flex-shrink-0">
                        Current
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                      {post.summary}
                    </p>
                  </div>
                ) : (
                  <Link 
                    href={`/blog/${post.slug}`}
                    className={cn(
                      "flex-1 min-w-0 group",
                      "hover:text-primary transition-colors"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="truncate group-hover:underline underline-offset-4">
                        {post.title}
                      </span>
                      <ChevronRight 
                        className="h-4 w-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" 
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                      {post.summary}
                    </p>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mt-4 pt-4 border-t">
        <Link
          href={`/blog/series/${encodeURIComponent(seriesName.toLowerCase().replace(/\s+/g, "-"))}`}
          className="text-sm text-primary hover:underline underline-offset-4 inline-flex items-center gap-1"
        >
          View all posts in {seriesName}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

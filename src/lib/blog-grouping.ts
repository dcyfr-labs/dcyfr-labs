import type { Post } from "@/data/posts";
import type { PostCategory } from "@/lib/post-categories";

/**
 * Group posts by category
 *
 * Returns a Map where keys are category names and values are arrays of posts
 * Posts without categories are excluded from the grouping
 *
 * @param posts - Array of posts to group
 * @returns Map of category to posts
 */
export function groupPostsByCategory(posts: Post[]): Map<PostCategory, Post[]> {
  const grouped = new Map<PostCategory, Post[]>();

  posts.forEach((post) => {
    if (post.category) {
      if (!grouped.has(post.category)) {
        grouped.set(post.category, []);
      }
      grouped.get(post.category)!.push(post);
    }
  });

  return grouped;
}

/**
 * Sort categories by post count (descending)
 *
 * Takes a Map of grouped posts and returns a sorted array of [category, posts] tuples
 * sorted by the number of posts in each category (highest first)
 *
 * @param groupedPosts - Map of grouped posts
 * @returns Array of [category, posts] tuples sorted by post count (descending)
 */
export function sortCategoriesByCount(
  groupedPosts: Map<PostCategory, Post[]>
): [PostCategory, Post[]][] {
  return Array.from(groupedPosts.entries()).sort(
    ([, a], [, b]) => b.length - a.length
  );
}

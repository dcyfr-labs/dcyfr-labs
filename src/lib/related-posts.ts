/**
 * Find related posts based on shared tags
 */

import type { Post } from "@/data/posts";
import { isPostVisible } from "@/lib/blog";

export type RelatedPost = {
  post: Post;
  sharedTags: string[];
  score: number;
};

/**
 * Find related posts based on shared tags
 * @param currentPost - The current post to find related posts for
 * @param allPosts - All available posts
 * @param limit - Maximum number of related posts to return (default: 3)
 * @returns Array of related posts sorted by relevance score
 */
export function getRelatedPosts(
  currentPost: Post,
  allPosts: Post[],
  limit: number = 3
): Post[] {
  const currentTags = new Set(currentPost.tags);
  
  // Calculate relevance score for each post
  const scoredPosts: RelatedPost[] = allPosts
    .filter((post) => {
      // Exclude current post
      if (post.slug === currentPost.slug) return false;
      
      // Exclude draft and scheduled (future-dated) posts in production
      if (!isPostVisible(post)) return false;
      
      // Only include posts with at least one shared tag
      return post.tags.some((tag) => currentTags.has(tag));
    })
    .map((post) => {
      // Find shared tags
      const sharedTags = post.tags.filter((tag) => currentTags.has(tag));
      
      // Calculate score:
      // - Base score: number of shared tags
      // - Bonus: +0.5 if featured
      // - Penalty: -0.5 if archived
      let score = sharedTags.length;
      if (post.featured) score += 0.5;
      if (post.archived) score -= 0.5;
      
      return { post, sharedTags, score };
    });
  
  // Sort by score (descending), then by published date (newest first)
  scoredPosts.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return new Date(b.post.publishedAt).getTime() - new Date(a.post.publishedAt).getTime();
  });
  
  // Return only the posts (not the scoring metadata)
  return scoredPosts.slice(0, limit).map((item) => item.post);
}

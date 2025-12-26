/**
 * Activity Helpers
 *
 * Shared helper functions for activity pages
 */

import { posts } from "@/data/posts";
import { projects } from "@/data/projects";
import { changelog } from "@/data/changelog";
import { transformPosts, transformProjects, transformChangelog } from "./sources";
import type { ActivityItem } from "./types";

/**
 * Get basic activities (posts, projects, changelog)
 *
 * This is a lightweight version for pages that need activities but don't
 * require all the analytics transformations from the main activity page.
 *
 * Used by: /bookmarks page
 */
export async function getBasicActivities(): Promise<ActivityItem[]> {
  const activities: ActivityItem[] = [
    ...transformPosts(posts),
    ...transformProjects([...projects]),
    ...transformChangelog(changelog),
  ];

  // Sort by timestamp descending
  return activities.sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
}

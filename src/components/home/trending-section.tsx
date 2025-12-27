"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Hash, FolderGit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPACING, ANIMATION } from "@/lib/design-tokens";
import { TrendingPostsPanel } from "@/components/home/trending-posts-panel";
import { TrendingTopicsPanel } from "@/components/home/trending-topics-panel";
import { TrendingProjectsPanel } from "@/components/home/trending-projects-panel";
import type { TrendingProject } from "@/components/home/trending-projects-panel";
import type { Post } from "@/data/posts";
import type { NeonColorVariant } from "@/lib/design-tokens";

// ============================================================================
// TYPES
// ============================================================================

export interface TopicData {
  tag: string;
  count: number;
  colorVariant: NeonColorVariant;
}

export interface TrendingSectionProps {
  /** Array of posts for trending calculation */
  posts: Post[];
  /** View counts map for trending calculation */
  viewCounts: Map<string, number>;
  /** Popular topics data */
  topics: TopicData[];
  /** Trending projects data */
  projects?: TrendingProject[];
  /** Default active tab */
  defaultTab?: "posts" | "topics" | "projects";
  /** Class name for container */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * TrendingSection Component
 *
 * Unified trending showcase combining:
 * - Trending Posts (by view count + engagement)
 * - Popular Topics (by frequency)
 * - Trending Projects (by GitHub stars + activity)
 *
 * Features:
 * - Tabbed interface for clean organization
 * - Smooth animations between tabs
 * - Responsive layout (tabs on desktop, stacked on mobile)
 * - Design token compliance
 *
 * @example
 * ```tsx
 * <TrendingSection
 *   posts={posts}
 *   viewCounts={viewCountsMap}
 *   topics={topTopics}
 *   projects={trendingProjects}
 *   defaultTab="posts"
 * />
 * ```
 */
export function TrendingSection({
  posts,
  viewCounts,
  topics,
  projects = [],
  defaultTab = "posts",
  className,
}: TrendingSectionProps) {
  return (
    <div className={cn(SPACING.content, className)}>
      <Tabs defaultValue={defaultTab} className="w-full">
        {/* Tab Navigation */}
        <TabsList className={cn("w-full sm:w-auto", ANIMATION.transition.base)}>
          <TabsTrigger value="posts" className="flex-1 sm:flex-initial">
            <TrendingUp className="h-4 w-4" />
            <span>Posts</span>
          </TabsTrigger>
          <TabsTrigger value="topics" className="flex-1 sm:flex-initial">
            <Hash className="h-4 w-4" />
            <span>Topics</span>
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex-1 sm:flex-initial">
            <FolderGit2 className="h-4 w-4" />
            <span>Projects</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Content Panels */}
        <div className={SPACING.content}>
          {/* Posts Tab */}
          <TabsContent
            value="posts"
            className={cn(ANIMATION.transition.appearance, "data-[state=active]:animate-in data-[state=active]:fade-in-0")}
          >
            <TrendingPostsPanel posts={posts} viewCounts={viewCounts} limit={5} />
          </TabsContent>

          {/* Topics Tab */}
          <TabsContent
            value="topics"
            className={cn(ANIMATION.transition.appearance, "data-[state=active]:animate-in data-[state=active]:fade-in-0")}
          >
            <TrendingTopicsPanel topics={topics} maxTopics={12} />
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent
            value="projects"
            className={cn(ANIMATION.transition.appearance, "data-[state=active]:animate-in data-[state=active]:fade-in-0")}
          >
            <TrendingProjectsPanel projects={projects} limit={5} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, GitCommit, FolderKanban, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Post } from "@/data/posts";
import type { Project, ProjectCategory } from "@/data/projects";
import { TYPOGRAPHY } from "@/lib/design-tokens";

type ActivityType = "post" | "project" | "commit";

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  date: string;
  href: string;
  tags?: string[];
  totalTags?: number;
  category?: ProjectCategory;
}

interface RecentActivityProps {
  posts: Post[];
  projects: Project[];
  limit?: number;
}

/**
 * Recent Activity Feed Component
 * 
 * Displays a unified timeline of recent blog posts, project updates, and GitHub activity.
 * Items are sorted by date with visual indicators for each activity type.
 * 
 * @example
 * ```tsx
 * <RecentActivity
 *   posts={recentPosts}
 *   projects={recentProjects}
 *   limit={5}
 * />
 * ```
 */
export function RecentActivity({ posts, projects, limit = 5 }: RecentActivityProps) {
  // Convert posts and projects to unified activity items
  const activities: ActivityItem[] = [
    ...posts.slice(0, 3).map(post => ({
      id: post.id,
      type: "post" as ActivityType,
      title: post.title,
      description: post.summary,
      date: post.publishedAt,
      href: `/blog/${post.slug}`,
      tags: post.tags.slice(0, 3),
      totalTags: post.tags.length,
    })),
    ...projects.slice(0, 2).map(project => ({
      id: project.slug,
      type: "project" as ActivityType,
      title: project.title,
      description: project.description,
      date: project.timeline || new Date().toISOString(),
      href: `/portfolio/${project.slug}`,
      tags: project.tags?.slice(0, 2),
      totalTags: project.tags?.length ?? 0,
      category: project.category,
    })),
  ];

  // Sort by date (most recent first)
  const sortedActivities = activities
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    })
    .slice(0, limit);

  const getIcon = (type: ActivityType) => {
    switch (type) {
      case "post":
        return FileText;
      case "project":
        return FolderKanban;
      case "commit":
        return GitCommit;
    }
  };

  const categoryDisplayMap: Record<ProjectCategory, string> = {
    code: "Code",
    nonprofit: "Nonprofit",
    community: "Community",
    photography: "Photography",
    startup: "Startup",
  };

  const getTypeLabel = (activity: ActivityItem) => {
    switch (activity.type) {
      case "post":
        return "Blog Post";
      case "project":
        return activity.category ? categoryDisplayMap[activity.category] : "Project";
      case "commit":
        return "Commit";
    }
  };

  const getCategoryBadgeClass = (category?: ProjectCategory) => {
    switch (category) {
      case "code":
        return "border-blue-500/70 bg-blue-500/15 text-blue-700 dark:text-blue-300";
      case "nonprofit":
        return "border-emerald-500/70 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
      case "community":
        return "border-purple-500/70 bg-purple-500/15 text-purple-700 dark:text-purple-300";
      case "photography":
        return "border-pink-500/70 bg-pink-500/15 text-pink-700 dark:text-pink-300";
      case "startup":
        return "border-orange-500/70 bg-orange-500/15 text-orange-700 dark:text-orange-300";
      default:
        return "border-purple-500/70 bg-purple-500/15 text-purple-700 dark:text-purple-300";
    }
  };

  const getTypeBadgeClass = (activity: ActivityItem) => {
    switch (activity.type) {
      case "post":
        return "border-blue-500/70 bg-blue-500/15 text-blue-700 dark:text-blue-300";
      case "project":
        return getCategoryBadgeClass(activity.category);
      case "commit":
        return "border-green-500/70 bg-green-500/15 text-green-700 dark:text-green-300";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Handle project timeline format like "2024 → Present"
        return dateString;
      }
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return "Today";
      if (diffInDays === 1) return "Yesterday";
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
      return `${Math.floor(diffInDays / 365)} years ago`;
    } catch {
      return dateString;
    }
  };

  if (sortedActivities.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {sortedActivities.map((activity, index) => {
        const Icon = getIcon(activity.type);
        
        return (
          <Card 
            key={activity.id} 
            className={cn(
              "group transition-all duration-200",
              "hover:shadow-md hover:border-primary/30"
            )}
          >
            <CardContent className="p-4">
              <div className="flex gap-3">
                {/* Activity icon */}
                <div className={cn(
                  "shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
                  "bg-background border-2 border-border",
                  "group-hover:border-primary/50 transition-colors"
                )}>
                  <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                {/* Activity content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Link 
                      href={activity.href}
                      className="font-medium hover:text-primary transition-colors line-clamp-1"
                    >
                      {activity.title}
                    </Link>
                    <Badge 
                      variant="outline" 
                      className={cn("shrink-0 text-xs", getTypeBadgeClass(activity))}
                    >
                      {getTypeLabel(activity)}
                    </Badge>
                  </div>

                  {activity.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {activity.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(activity.date)}</span>
                    </div>
                    
                    {activity.tags && activity.tags.length > 0 && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <div className="flex gap-1 flex-wrap">
                          {activity.tags.map(tag => (
                            <Badge 
                              key={tag} 
                              variant="secondary" 
                              className="text-xs px-1.5 py-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {activity.totalTags && activity.totalTags > activity.tags.length && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs px-1.5 py-0 text-muted-foreground"
                            >
                              +{activity.totalTags - activity.tags.length}
                            </Badge>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

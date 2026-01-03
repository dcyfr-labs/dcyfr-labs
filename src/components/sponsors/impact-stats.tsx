/**
 * Impact Stats Component
 *
 * Displays portfolio impact metrics for sponsor thank you page.
 * Shows blog posts published and active projects.
 */

import { Card, CardContent } from "@/components/ui/card";
import { posts } from "@/data/posts";
import { visibleProjects } from "@/data/projects";
import { TYPOGRAPHY } from "@/lib/design-tokens";

interface ImpactStatsProps {
  className?: string;
}

/**
 * Shows impact stats of sponsor contributions
 * Displays real metrics: blog posts and active projects
 */
export function ImpactStats({ className }: ImpactStatsProps) {
  // Calculate stats from real data only
  const blogPostCount = posts.filter((p) => !p.draft && !p.archived).length;
  const projectCount = visibleProjects.filter(
    (p) => p.status === "active" || p.status === "in-progress"
  ).length;

  const stats = [
    {
      value: blogPostCount,
      label: "Blog Posts Published",
      description: "Educational content helping developers learn",
    },
    {
      value: projectCount,
      label: "Active Projects",
      description: "Open source tools and experiments",
    },
  ];

  return (
    <div className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="p-8">
              <div className={TYPOGRAPHY.display.stat}>{stat.value}</div>
              <p className="font-semibold text-foreground mt-2">{stat.label}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

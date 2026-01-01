/**
 * Homepage Stats Component
 * 
 * Displays quantifiable metrics about the site and author's expertise.
 * Shows: blog posts count, projects count, years of experience, and technologies count.
 * 
 * Features:
 * - Responsive grid layout (2 cols mobile, 4 cols desktop)
 * - Large numbers with descriptive labels
 * - Subtle hover effects
 * - Automatically calculates years from resume data
 * 
 * @example
 * ```tsx
 * import { HomepageStats } from "@/components/home/homepage-stats";
 * 
 * <HomepageStats
 *   postsCount={12}
 *   projectsCount={8}
 *   yearsOfExperience={5}
 *   technologiesCount={25}
 * />
 * ```
 */

import { cn } from "@/lib/utils";
import { TYPOGRAPHY, HOVER_EFFECTS, SPACING } from "@/lib/design-tokens";

type StatItemProps = {
  value: string | number;
  label: string;
  suffix?: string;
};

function StatItem({ value, label, suffix }: StatItemProps) {
  return (
    <div className={cn(
      "flex flex-col items-center p-4 md:p-8 rounded-lg border bg-card",
      HOVER_EFFECTS.cardSubtle
    )}>
      <div className={cn(TYPOGRAPHY.display.statLarge, "mb-4")}>
        {value}
        {suffix && <span className="text-muted-foreground">{suffix}</span>}
      </div>
      <div className="text-sm md:text-base text-muted-foreground font-medium">
        {label}
      </div>
    </div>
  );
}

type HomepageStatsProps = {
  postsCount: number;
  projectsCount: number;
  yearsOfExperience: number;
  technologiesCount: number;
  className?: string;
};

export function HomepageStats({
  postsCount,
  projectsCount,
  yearsOfExperience,
  technologiesCount,
  className,
}: HomepageStatsProps) {
  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      <StatItem value={postsCount} label="Blog Posts" />
      <StatItem value={projectsCount} label="Projects" />
      <StatItem value={yearsOfExperience} label="Years Experience" suffix="+" />
      <StatItem value={technologiesCount} label="Technologies" suffix="+" />
    </div>
  );
}

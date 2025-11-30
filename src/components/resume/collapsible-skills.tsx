"use client";

import { useState, memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { SkillCategory } from "@/data/resume";

interface CollapsibleSkillsProps {
  skills: SkillCategory[];
}

// Memoized badge renderer
const BadgeItem = memo(({ text }: { text: string }) => (
  <Badge variant="outline" className="text-xs">
    {text}
  </Badge>
));
BadgeItem.displayName = "BadgeItem";

// Memoized skill category with conditional rendering
const SkillCategoryItem = memo(
  ({ 
    category, 
    skills: skillList, 
    isExpanded, 
    initialCount 
  }: { 
    category: string; 
    skills: string[]; 
    isExpanded: boolean; 
    initialCount: number;
  }) => {
    const skillsToShow = isExpanded ? skillList : skillList.slice(0, initialCount);
    const hiddenCount = skillList.length - skillsToShow.length;

    return (
      <div className="space-y-1">
        <p className="text-muted-foreground font-medium text-sm">{category}</p>
        <div className="flex flex-wrap gap-1">
          {skillsToShow.map((skill, idx) => (
            <BadgeItem key={idx} text={skill} />
          ))}
          {!isExpanded && hiddenCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              +{hiddenCount} more
            </Badge>
          )}
        </div>
      </div>
    );
  }
);
SkillCategoryItem.displayName = "SkillCategoryItem";

/**
 * CollapsibleSkills component
 * 
 * Displays skill categories with expand/collapse functionality to condense space.
 * Shows limited skills per category by default, with "Show more" button to reveal all.
 * Optimized with memoization and lazy rendering for performance.
 * 
 * @param skills - Array of skill categories from resume data
 */
export function CollapsibleSkills({ skills }: CollapsibleSkillsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_DISPLAY_COUNT = 10; // Show 10 skills per category initially

  // Memoize the mapped skills to prevent unnecessary re-renders
  const skillsData = useMemo(() => {
    return skills.map((category) => ({
      category: category.category,
      skills: category.skills,
    }));
  }, [skills]);

  return (
    <div className="space-y-3">
      {skillsData.map((skillCategory, index) => (
        <SkillCategoryItem
          key={index}
          category={skillCategory.category}
          skills={skillCategory.skills}
          isExpanded={isExpanded}
          initialCount={INITIAL_DISPLAY_COUNT}
        />
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mt-2"
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "Show fewer skills" : "Show all skills"}
      >
        {isExpanded ? (
          <>
            <ChevronUp className="mr-2 h-4 w-4" />
            Show less
          </>
        ) : (
          <>
            <ChevronDown className="mr-2 h-4 w-4" />
            Show all skills
          </>
        )}
      </Button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { SkillCategory } from "@/data/resume";

interface CollapsibleSkillsProps {
  skills: SkillCategory[];
}

/**
 * CollapsibleSkills component
 * 
 * Displays skill categories with expand/collapse functionality to condense space.
 * Shows limited skills per category by default, with "Show more" button to reveal all.
 * Matches the pattern used in CollapsibleCertifications.
 * 
 * @param skills - Array of skill categories from resume data
 */
export function CollapsibleSkills({ skills }: CollapsibleSkillsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_DISPLAY_COUNT = 10; // Show 10 skills per category initially

  return (
    <div className="space-y-3">
      {skills.map((skillCategory, index) => {
        const skillsToShow = isExpanded 
          ? skillCategory.skills 
          : skillCategory.skills.slice(0, INITIAL_DISPLAY_COUNT);
        const hiddenCount = skillCategory.skills.length - skillsToShow.length;

        return (
          <div key={index} className="space-y-1">
            <p className="text-muted-foreground font-medium text-sm">
              {skillCategory.category}
            </p>
            <div className="flex flex-wrap gap-1">
              {skillsToShow.map((skill, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {!isExpanded && hiddenCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="text-xs cursor-pointer"
                  onClick={() => setIsExpanded(true)}
                >
                  +{hiddenCount} more
                </Badge>
              )}
            </div>
          </div>
        );
      })}
      
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

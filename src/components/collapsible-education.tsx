"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Logo } from "@/components/logo";
import type { Education } from "@/data/resume";

interface CollapsibleEducationProps {
  education: Education[];
}

/**
 * CollapsibleEducation component
 * 
 * Displays education entries with expand/collapse functionality for highlights.
 * Shows degree and institution by default, with expandable highlights section.
 * Matches the pattern used in CollapsibleCertifications and CollapsibleSkills.
 * 
 * @param education - Array of education entries from resume data
 */
export function CollapsibleEducation({ education }: CollapsibleEducationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-3">
      {education.map((edu, index) => (
        <div key={index} className="space-y-1">
          <p className="font-medium">{edu.degree}</p>
          <p className="text-sm text-muted-foreground">
            {edu.institution}
            {edu.duration ? ` • ${edu.duration}` : ""}
          </p>
          {edu.highlights && isExpanded && (
            <ul className="space-y-1 text-sm text-muted-foreground mt-2">
              {edu.highlights.map((highlight, idx) => (
                <li key={idx} className="flex gap-2 items-start">
                  <Logo width={12} height={12} className="mt-1.5 shrink-0 text-primary" aria-hidden="true" />
                  <span className="flex-1">{highlight}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      
      {education.some(edu => edu.highlights && edu.highlights.length > 0) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-2"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Hide education highlights" : "Show education highlights"}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" />
              Show highlights
            </>
          )}
        </Button>
      )}
    </div>
  );
}

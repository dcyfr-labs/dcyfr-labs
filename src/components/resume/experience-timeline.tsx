"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { highlightMetrics } from "@/lib/highlight-metrics";
import { HOVER_EFFECTS } from "@/lib/design-tokens";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Logo } from "@/components/common/logo";
import type { Experience } from "@/data/resume";

interface ExperienceTimelineProps {
  experiences: Experience[];
  companyUrls: Record<string, string>;
}

/**
 * Experience Timeline Component
 * 
 * Displays work experience in a visual timeline format with connecting lines.
 * Shows progression through career with company links and highlighted metrics.
 * Collapsible to show most recent positions by default with option to expand all.
 * 
 * @component
 * @example
 * ```tsx
 * <ExperienceTimeline experiences={resume.experience} companyUrls={urls} />
 * ```
 */
export function ExperienceTimeline({ experiences, companyUrls }: ExperienceTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_DISPLAY_COUNT = 2; // Show 2 most recent positions

  const visibleExperiences = isExpanded ? experiences : experiences.slice(0, INITIAL_DISPLAY_COUNT);
  const hiddenCount = experiences.length - visibleExperiences.length;

  return (
    <div className="relative">
      {/* Timeline line - hidden on mobile, shown on md+ */}
      <div 
        className="hidden md:block absolute left-8 top-8 bottom-8 w-0.5 bg-border"
        aria-hidden="true"
      />

      <div className="space-y-4">
        {visibleExperiences.map((exp, index) => (
          <div key={index} className="relative">
            {/* Timeline dot */}
            <div 
              className="hidden md:flex absolute left-8 top-6 w-4 h-4 -ml-[7px] rounded-full border-2 border-primary bg-background z-10"
              aria-hidden="true"
            />

            {/* Content card with left margin for timeline */}
            <Card className="p-5 md:ml-20">
              <article>
                <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-foreground mb-1">
                      {exp.title}
                    </h3>
                    <p className="text-sm font-medium">
                      {companyUrls[exp.company] ? (
                        <Link 
                          href={companyUrls[exp.company]} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`text-primary ${HOVER_EFFECTS.link}`}
                        >
                          {exp.company}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">{exp.company}</span>
                      )}
                    </p>
                  </div>
                  <time className="shrink-0 text-sm text-muted-foreground whitespace-nowrap" suppressHydrationWarning>
                    {exp.duration}
                  </time>
                </header>
                
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {exp.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <Logo width={12} height={12} className="mt-1.5 shrink-0 text-primary" aria-hidden="true" />
                      <span className="flex-1">{resp}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Card>
          </div>
        ))}
      </div>

      {hiddenCount > 0 && (
        <div className="md:ml-20 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Show fewer positions" : `Show ${hiddenCount} more ${hiddenCount === 1 ? "position" : "positions"}`}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Show {hiddenCount} more {hiddenCount === 1 ? "position" : "positions"}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

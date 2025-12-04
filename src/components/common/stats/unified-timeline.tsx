/**
 * Unified Timeline Component
 * 
 * Displays work experience and education in a single chronological timeline.
 * Combines professional experience and academic achievements in one view.
 * 
 * @component
 */

"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HOVER_EFFECTS } from "@/lib/design-tokens";
import { Briefcase, GraduationCap } from "lucide-react";
import { Logo } from "@/components/common/logo";
import type { Experience, Education } from "@/data/resume";

interface UnifiedTimelineProps {
  experiences: Experience[];
  education: Education[];
  companyUrls: Record<string, string>;
}

type TimelineItem = {
  type: 'experience' | 'education';
  data: Experience | Education;
  sortDate: Date;
};

/**
 * Parse duration string to get sort date (most recent date)
 */
function parseDuration(duration: string): Date {
  // Handle "Present" as current date
  if (duration.includes('Present')) {
    return new Date();
  }
  
  // Extract year from formats like "Jul 2023 → Jul 2024" or "Dec 2020"
  const matches = duration.match(/(\w{3}\s)?(\d{4})/g);
  if (matches && matches.length > 0) {
    // Get the last (most recent) date
    const lastMatch = matches[matches.length - 1];
    const year = lastMatch.match(/\d{4}/)?.[0];
    const month = lastMatch.match(/(\w{3})/)?.[0];
    
    if (year) {
      const monthMap: Record<string, number> = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      const monthNum = month ? monthMap[month] : 0;
      return new Date(parseInt(year), monthNum);
    }
  }
  
  return new Date(0); // Fallback for unparseable dates
}

export function UnifiedTimeline({ experiences, education, companyUrls }: UnifiedTimelineProps) {
  // Combine and sort all timeline items (newest first)
  const timelineItems: TimelineItem[] = [
    ...experiences.map(exp => ({
      type: 'experience' as const,
      data: exp,
      sortDate: parseDuration(exp.duration),
    })),
    ...education.map(edu => ({
      type: 'education' as const,
      data: edu,
      sortDate: parseDuration(edu.duration || ''),
    })),
  ].sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime()); // Sort descending (newest first)

  return (
    <div className="relative">
      {/* Timeline line */}
      <div 
        className="hidden md:block absolute left-8 top-8 bottom-8 w-0.5 bg-border"
        aria-hidden="true"
      />

      <div className="space-y-4">
        {timelineItems.map((item, index) => (
          <div key={index} className="relative">
            {/* Timeline dot */}
            <div 
              className="hidden md:block absolute left-8 top-6 w-3 h-3 -ml-[5px] rounded-full bg-primary z-10"
              aria-hidden="true"
            />

            {/* Content card */}
            <Card className="p-5 md:ml-20">
              {item?.type === 'experience' ? (
                <ExperienceCard 
                  experience={item.data as Experience} 
                  companyUrls={companyUrls} 
                />
              ) : item?.type === 'education' ? (
                <EducationCard education={item.data as Education} />
              ) : null}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Experience Card Component
 */
function ExperienceCard({ 
  experience, 
  companyUrls 
}: { 
  experience: Experience; 
  companyUrls: Record<string, string>;
}) {
  return (
    <article>
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="h-4 w-4 text-primary shrink-0" />
            <h3 className="font-semibold text-lg text-foreground">
              {experience.title}
            </h3>
          </div>
          <p className="text-sm font-medium">
            {companyUrls[experience.company] ? (
              <Link 
                href={companyUrls[experience.company]} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`text-primary ${HOVER_EFFECTS.link}`}
              >
                {experience.company}
              </Link>
            ) : (
              <span className="text-muted-foreground">{experience.company}</span>
            )}
          </p>
        </div>
        <time className="shrink-0 text-sm text-muted-foreground whitespace-nowrap" suppressHydrationWarning>
          {experience.duration}
        </time>
      </header>
      
      <ul className="space-y-2 text-sm text-muted-foreground">
        {experience.responsibilities.map((resp, idx) => (
          <li key={idx} className="flex gap-2 items-start">
            <Logo width={12} height={12} className="mt-1.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="flex-1">{resp}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

/**
 * Education Card Component
 */
function EducationCard({ education }: { education: Education }) {
  const hasHighlights = education.highlights && education.highlights.length > 0;

  return (
    <article>
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="h-4 w-4 text-primary shrink-0" />
            <h3 className="font-semibold text-lg text-foreground">
              {education.degree}
            </h3>
          </div>
          {/* eslint-disable-next-line no-restricted-syntax */}
          <p className="text-sm font-medium text-muted-foreground">
            {education.institution}
          </p>
        </div>
        {education.duration && (
          <time className="shrink-0 text-sm text-muted-foreground whitespace-nowrap" suppressHydrationWarning>
            {education.duration}
          </time>
        )}
      </header>
      
      {hasHighlights && (
        <ul className="space-y-1 text-sm text-muted-foreground mt-2">
          {education.highlights!.map((highlight, idx) => (
            <li key={idx} className="flex gap-2 items-start">
              <Logo width={12} height={12} className="mt-1.5 shrink-0 text-primary" aria-hidden="true" />
              <span className="flex-1">{highlight}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

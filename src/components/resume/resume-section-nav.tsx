"use client";

import Link from "next/link";
import { Briefcase, GraduationCap, Code, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TYPOGRAPHY, SPACING, BORDERS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

/**
 * Resume Section Navigation Component
 *
 * Quick navigation menu for jumping to resume sections.
 * Features:
 * - Smooth scroll navigation
 * - Keyboard accessible
 * - Visual indicator icons
 * - Design token compliance
 *
 * @component
 * @example
 * ```tsx
 * <ResumeSectionNav />
 * ```
 */
export function ResumeSectionNav() {
  const sections = [
    {
      id: "timeline",
      label: "Experience",
      icon: Briefcase,
      description: "Work history",
    },
    {
      id: "badges",
      label: "Badges",
      icon: Award,
      description: "Certifications",
    },
    {
      id: "skills",
      label: "Skills",
      icon: Code,
      description: "Technologies",
    },
  ];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for any fixed headers
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <Card className={cn(BORDERS.card, "p-4 bg-card/50 backdrop-blur-sm")}>
      <div className="grid grid-cols-3 gap-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => handleClick(e, section.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 rounded-md",
                "transition-colors duration-200",
                "hover:bg-muted/70 focus-visible:outline-2 focus-visible:outline-primary",
                "group"
              )}
              aria-label={`Jump to ${section.label} section`}
            >
              <Icon className={cn(
                "h-5 w-5 transition-colors duration-200",
                "text-muted-foreground group-hover:text-primary"
              )} aria-hidden="true" />
              <div className="text-center">
                <p
                  className={cn(TYPOGRAPHY.label.small, "text-foreground mb-0.5")}
                  suppressHydrationWarning
                >
                  {section.label}
                </p>
                <p className={cn(
                  "text-xs text-muted-foreground",
                  "hidden sm:block"
                )}>
                  {section.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

"use client";

import Link from "next/link";
import { Briefcase, GraduationCap, Code } from "lucide-react";
import { Card } from "@/components/ui/card";

/**
 * Resume Section Navigation Component
 * 
 * Quick navigation menu for jumping to resume sections.
 * Provides visual indicators and smooth scrolling.
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
      id: "experience",
      label: "Experience",
      icon: Briefcase,
      description: "Work history",
    },
    {
      id: "education",
      label: "Education",
      icon: GraduationCap,
      description: "Degrees & certs",
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
    <Card className="p-4">
      <div className="grid grid-cols-3 gap-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => handleClick(e, section.id)}
              className="flex flex-col items-center gap-2 p-3 rounded-md hover:bg-muted/50 transition-colors group"
            >
              <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground" suppressHydrationWarning>{section.label}</p>
                <p className="text-xs text-muted-foreground hidden sm:block">{section.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

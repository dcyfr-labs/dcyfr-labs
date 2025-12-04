/**
 * Combined Skills & Certifications Component
 * 
 * Displays skills and certifications in a unified section with subsections.
 * Skills are shown as collapsible badge groups by category.
 * Certifications are displayed as a separate subsection at the bottom.
 * 
 * Optimized with lazy loading and memoization for performance.
 */

"use client";

import { useMemo, useCallback, memo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { HOVER_EFFECTS, TYPOGRAPHY } from "@/lib/design-tokens";
import type { SkillCategory, CertificationCategory } from "@/data/resume";

interface SkillsAndCertificationsProps {
  skills: SkillCategory[];
  certifications: CertificationCategory[];
}

// Certification provider URLs for verification
const providerUrls: Record<string, string> = {
  "GIAC": "https://www.giac.org/certifications",
  "CompTIA": "https://www.comptia.org/certifications",
  "ISC2": "https://www.isc2.org/Certifications",
  "Mile2": "https://mile2.com/certifications",
};

// Memoized badge renderer for performance
const BadgeItem = memo(({ text }: { text: string }) => (
  <Badge variant="outline" className="text-xs">
    {text}
  </Badge>
));
BadgeItem.displayName = "BadgeItem";

// Memoized certification category renderer
const CertificationCategoryGroup = memo(
  ({ category, provider, badges }: { category: CertificationCategory; provider: string; badges: string[] }) => (
    <div className="space-y-1">
      {providerUrls[provider] ? (
        <Link
          href={providerUrls[provider]}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-muted-foreground font-medium text-sm inline-flex items-center gap-1 ${HOVER_EFFECTS.link}`}
        >
          {provider}
        </Link>
      ) : (
        <p className="text-muted-foreground font-medium text-sm">{provider}</p>
      )}
      <div className="flex flex-wrap gap-1">
        {badges.map((badge, idx) => (
          <BadgeItem key={idx} text={badge} />
        ))}
      </div>
    </div>
  )
);
CertificationCategoryGroup.displayName = "CertificationCategoryGroup";

// Memoized skill category renderer
const SkillCategoryGroup = memo(
  ({ category, skills: skillList }: { category: string; skills: string[] }) => (
    <div className="space-y-1">
      <p className="text-muted-foreground font-medium text-sm">{category}</p>
      <div className="flex flex-wrap gap-1">
        {skillList.map((skill, idx) => (
          <BadgeItem key={idx} text={skill} />
        ))}
      </div>
    </div>
  )
);
SkillCategoryGroup.displayName = "SkillCategoryGroup";

export function SkillsAndCertifications({ skills, certifications }: SkillsAndCertificationsProps) {
  // Memoize mapped certifications to prevent unnecessary re-renders
  const certGroupsWithProviders = useMemo(() => {
    return certifications.map((certCategory) => ({
      provider: certCategory.provider,
      certifications: certCategory.certifications,
    }));
  }, [certifications]);

  return (
    <div className="space-y-10">
      {/* Certifications Subsection */}
      <div className="space-y-3 pt-6">
        <h2 className={`${TYPOGRAPHY.h2.standard} mb-3`}>Certifications</h2>
        {certGroupsWithProviders.map((certGroup, index) => (
          <CertificationCategoryGroup
            key={index}
            category={certifications[index]}
            provider={certGroup.provider}
            badges={certGroup.certifications}
          />
        ))}
      </div>

      {/* Skills Subsection */}
      <div className="space-y-3 pt-6">
        <h2 className={`${TYPOGRAPHY.h2.standard} mb-3`}>Skills</h2>
        {skills.map((skillCategory, index) => (
          <SkillCategoryGroup
            key={index}
            category={skillCategory.category}
            skills={skillCategory.skills}
          />
        ))}
      </div>
    </div>
  );
}

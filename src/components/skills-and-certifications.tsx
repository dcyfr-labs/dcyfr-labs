/**
 * Combined Skills & Certifications Component
 * 
 * Displays skills and certifications in a unified section with subsections.
 * Skills are shown as collapsible badge groups by category.
 * Certifications are displayed as a separate subsection at the bottom.
 */

"use client";

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

export function SkillsAndCertifications({ skills, certifications }: SkillsAndCertificationsProps) {
  return (
    <div className="space-y-8">
          {/* Certifications Subsection */}
      <div className="space-y-3 pt-6">
        <h2 className={`${TYPOGRAPHY.h2.standard} mb-3`}>Certifications</h2>
        {certifications.map((certCategory, index) => (
          <div key={index} className="space-y-1">
            {providerUrls[certCategory.provider] ? (
              <Link
                href={providerUrls[certCategory.provider]}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-muted-foreground font-medium text-sm inline-flex items-center gap-1 ${HOVER_EFFECTS.link}`}
              >
                {certCategory.provider}
              </Link>
            ) : (
              <p className="text-muted-foreground font-medium text-sm">
                {certCategory.provider}
              </p>
            )}
            <div className="flex flex-wrap gap-1">
              {certCategory.certifications.map((cert, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Skills Subsection */}
      <div className="space-y-3 pt-6">
        <h2 className={`${TYPOGRAPHY.h2.standard} mb-3`}>Skills</h2>
        {skills.map((skillCategory, index) => (
          <div key={index} className="space-y-1">
            <p className="text-muted-foreground font-medium text-sm">
              {skillCategory.category}
            </p>
            <div className="flex flex-wrap gap-1">
              {skillCategory.skills.map((skill, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

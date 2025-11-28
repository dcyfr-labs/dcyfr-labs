"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { HOVER_EFFECTS } from "@/lib/design-tokens";
import type { CertificationCategory } from "@/data/resume";

interface CollapsibleCertificationsProps {
  certifications: CertificationCategory[];
}

// Certification provider URLs for verification
const providerUrls: Record<string, string> = {
  "GIAC": "https://www.giac.org/certifications",
  "CompTIA": "https://www.comptia.org/certifications",
  "ISC2": "https://www.isc2.org/Certifications",
  "Mile2": "https://mile2.com/certifications",
};

/**
 * CollapsibleCertifications component
 * 
 * Displays certification badges with expand/collapse functionality for mobile optimization.
 * Shows first 4 certifications by default, with "Show more" button to reveal all.
 * Provider names link to official certification pages.
 * 
 * @param certifications - Array of certification categories from resume data
 */
export function CollapsibleCertifications({ certifications }: CollapsibleCertificationsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_DISPLAY_COUNT = 4;

  return (
    <div className="space-y-3">
      {certifications.map((certCategory, index) => {
        const shouldShow = isExpanded || index === 0; // Always show first category (GIAC)
        const certsToShow = shouldShow 
          ? certCategory.certifications 
          : certCategory.certifications.slice(0, INITIAL_DISPLAY_COUNT);
        const hiddenCount = certCategory.certifications.length - certsToShow.length;

        return (
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
              {certsToShow.map((cert, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {cert}
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
      
      {certifications.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" />
              Show all certifications
            </>
          )}
        </Button>
      )}
    </div>
  );
}

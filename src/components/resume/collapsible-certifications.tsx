"use client";

import { useState, memo, useMemo } from "react";
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

// Memoized badge renderer
const BadgeItem = memo(({ text }: { text: string }) => (
  <Badge variant="outline" className="text-xs">
    {text}
  </Badge>
));
BadgeItem.displayName = "BadgeItem";

// Memoized certification category with conditional rendering
const CertificationCategoryItem = memo(
  ({ 
    provider, 
    certifications: certs, 
    isExpanded, 
    index, 
    initialCount 
  }: { 
    provider: string; 
    certifications: string[]; 
    isExpanded: boolean; 
    index: number; 
    initialCount: number;
  }) => {
    const shouldShow = isExpanded || index === 0; // Always show first category
    const certsToShow = shouldShow 
      ? certs 
      : certs.slice(0, initialCount);
    const hiddenCount = certs.length - certsToShow.length;

    return (
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
          {certsToShow.map((cert, idx) => (
            <BadgeItem key={idx} text={cert} />
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
CertificationCategoryItem.displayName = "CertificationCategoryItem";

/**
 * CollapsibleCertifications component
 * 
 * Displays certification badges with expand/collapse functionality for mobile optimization.
 * Shows first 4 certifications by default, with "Show more" button to reveal all.
 * Provider names link to official certification pages.
 * Optimized with memoization and lazy rendering for performance.
 * 
 * @param certifications - Array of certification categories from resume data
 */
export function CollapsibleCertifications({ certifications }: CollapsibleCertificationsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_DISPLAY_COUNT = 4;

  // Memoize the mapped certifications to prevent unnecessary re-renders
  const certsData = useMemo(() => {
    return certifications.map((certCategory) => ({
      provider: certCategory.provider,
      certifications: certCategory.certifications,
    }));
  }, [certifications]);

  return (
    <div className="space-y-3">
      {certsData.map((certGroup, index) => (
        <CertificationCategoryItem
          key={index}
          provider={certGroup.provider}
          certifications={certGroup.certifications}
          isExpanded={isExpanded}
          index={index}
          initialCount={INITIAL_DISPLAY_COUNT}
        />
      ))}

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

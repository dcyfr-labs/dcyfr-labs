"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/common";
import { Lightbulb, ExternalLink } from "lucide-react";
import { SPACING, TYPOGRAPHY } from "@/lib/design-tokens";
import { cn, ensureAbsoluteUrl } from "@/lib/utils";
import { useCredlySkills } from "@/hooks/use-credly";
import type { CredlySkill } from "@/types/credly";

interface MiniSkillsListProps {
  username?: string;
  className?: string;
}

/**
 * MiniSkillsList Component
 * 
 * Minimalistic display of skills aggregated from Credly badges.
 * Shows skills as simple badge tags grouped by frequency.
 */
export function MiniSkillsList({
  username = "dcyfr",
  className,
}: MiniSkillsListProps) {
  // Use the cached hook for better performance and automatic skill aggregation
  const { skills, loading, error } = useCredlySkills({ username });

  // Memoize skill tiers to prevent unnecessary calculations
  const skillTiers = useMemo(() => {
    const coreSkills = skills.filter(s => s.count >= 3);
    const proficientSkills = skills.filter(s => s.count === 2);
    const familiarSkills = skills.filter(s => s.count === 1);

    return {
      core: coreSkills,
      proficient: proficientSkills,
      familiar: familiarSkills,
    };
  }, [skills]);

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <Lightbulb className="h-4 w-4 animate-pulse" />
        <span className={TYPOGRAPHY.label.small}>Loading skills...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="critical" className={className}>
        {error}
      </Alert>
    );
  }

  if (skills.length === 0) {
    return (
      <Alert type="info" className={className}>
        No skills found.
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <Lightbulb className="h-4 w-4 animate-pulse" />
        <span className={TYPOGRAPHY.label.small}>Loading skills...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="critical" className={className}>
        {error}
      </Alert>
    );
  }

  if (skills.length === 0) {
    return (
      <Alert type="info" className={className}>
        No skills found.
      </Alert>
    );
  }

  return (
    <div className={cn(SPACING.subsection, className)}>
      {/* Header with count */}
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h3 className={TYPOGRAPHY.h3.standard}>Skills</h3>
        <Badge variant="secondary">{skills.length} Total</Badge>
      </div>

      {/* Skills grouped by frequency */}
      <div className={SPACING.subsection}>
        {/* High Frequency Skills (3+ certifications) */}
        {skillTiers.core.length > 0 && (
          <div>
            <h4 className={cn(TYPOGRAPHY.label.small, "text-muted-foreground mb-3")}>
              Core Expertise
            </h4>
            <div className="flex flex-wrap gap-2">
              {skillTiers.core.map((item) => (
                <Link
                  key={item.skill.id}
                  href={ensureAbsoluteUrl(`https://www.credly.com/skills/${item.skill.vanity_slug}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${item.count} certifications`}
                >
                  <Badge 
                    variant="default" 
                    className="hover:bg-primary/80 transition-colors cursor-pointer"
                  >
                    {item.skill.name}
                    <span className="ml-1.5 text-xs opacity-70">×{item.count}</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Medium Frequency Skills (2 certifications) */}
        {skillTiers.proficient.length > 0 && (
          <div>
            <h4 className={cn(TYPOGRAPHY.label.small, "text-muted-foreground mb-3")}>
              Proficient
            </h4>
            <div className="flex flex-wrap gap-2">
              {skillTiers.proficient.map((item) => (
                <Link
                  key={item.skill.id}
                  href={ensureAbsoluteUrl(`https://www.credly.com/skills/${item.skill.vanity_slug}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`${item.count} certifications`}
                >
                  <Badge 
                    variant="secondary" 
                    className="hover:bg-secondary/80 transition-colors cursor-pointer"
                  >
                    {item.skill.name}
                    <span className="ml-1.5 text-xs opacity-70">×{item.count}</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Low Frequency Skills (1 certification) */}
        {skillTiers.familiar.length > 0 && (
          <div>
            <h4 className={cn(TYPOGRAPHY.label.small, "text-muted-foreground mb-3")}>
              Familiar
            </h4>
            <div className="flex flex-wrap gap-2">
              {skillTiers.familiar.map((item) => (
                <Link
                  key={item.skill.id}
                  href={ensureAbsoluteUrl(`https://www.credly.com/skills/${item.skill.vanity_slug}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Badge 
                    variant="outline" 
                    className="hover:bg-accent transition-colors cursor-pointer"
                  >
                    {item.skill.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* View all skills link */}
      <div className="mt-6 pt-4 border-t">
        <Link
          href={ensureAbsoluteUrl(`https://www.credly.com/users/${username}/badges`)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-2",
            TYPOGRAPHY.label.small,
            "text-primary hover:underline"
          )}
        >
          <span>Verify on Credly</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

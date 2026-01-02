"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/common";
import { Award, ExternalLink } from "lucide-react";
import { SPACING, TYPOGRAPHY, ANIMATION } from "@/lib/design-tokens";
import { cn, ensureAbsoluteUrl } from "@/lib/utils";
import { useCredlyBadges } from "@/hooks/use-credly";
import type { CredlyBadge } from "@/types/credly";

interface MiniBadgeListProps {
  username?: string;
  className?: string;
}

/**
 * MiniBadgeList Component
 * 
 * Minimalistic display of Credly badges - just images with tooltips.
 * Designed for resume pages where space is premium.
 */
export function MiniBadgeList({
  username = "dcyfr",
  className,
}: MiniBadgeListProps) {
  // Use the cached hook for better performance
  const { badges, loading, error } = useCredlyBadges({ username });

  if (loading) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <Award className="h-4 w-4 animate-pulse" />
        <span className={TYPOGRAPHY.label.small}>Loading certifications...</span>
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

  if (badges.length === 0) {
    return (
      <Alert type="info" className={className}>
        No certifications found.
      </Alert>
    );
  }

  return (
    <div className={cn(SPACING.subsection, className)}>
      {/* Header with count */}
      <div className="flex items-center gap-3 mb-6">
        <Award className="h-5 w-5 text-primary" />
        <h3 className={TYPOGRAPHY.h3.standard}>Certifications</h3>
        <Badge variant="secondary">{badges.length} Total</Badge>
      </div>

      {/* Minimalistic badge grid - just images */}
      <div className="flex flex-wrap gap-4">
        {badges.map((badge) => {
          const issuerName = badge.issuer.entities.find(e => e.primary)?.entity.name ||
            badge.issuer.entities[0]?.entity.name ||
            "Unknown Issuer";
          const publicUrl = `https://www.credly.com/badges/${badge.id}`;
          const safeUrl = ensureAbsoluteUrl(publicUrl);
          const issuedDate = new Date(badge.issued_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          });

          return (
            <Link
              key={badge.id}
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
              title={`${badge.badge_template.name} - Issued ${issuedDate}`}
            >
              <div className={cn("relative w-20 h-20 p-2 rounded-lg bg-white/80 dark:bg-slate-800/60 transition-transform hover:scale-110 hover:-translate-y-1", ANIMATION.duration.fast)}>
                <Image
                  src={badge.image_url}
                  alt={badge.badge_template.name}
                  fill
                  sizes="80px"
                  quality={95}
                  className="object-contain p-1"
                />
              </div>
              
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 whitespace-nowrap text-xs">
                <div className="font-medium">{badge.badge_template.name}</div>
                <div className="text-muted-foreground">{issuerName}</div>
                <div className="text-muted-foreground">{issuedDate}</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* View on Credly link */}
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

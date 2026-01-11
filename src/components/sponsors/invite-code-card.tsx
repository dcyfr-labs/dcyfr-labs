/**
 * Invite Code Card Component
 *
 * Displays invite/referral code information with platform name,
 * description, metrics, and visit CTA button.
 *
 * Used on:
 * - /sponsors page (featured codes only)
 * - /invites page (all codes grouped by category)
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, TrendingUp } from "lucide-react";
import { HOVER_EFFECTS } from "@/lib/design-tokens";
import type { InviteCode } from "@/types/invites";

interface InviteCodeCardProps {
  code: InviteCode;
  /** Show full description vs truncated (default: true) */
  showFullDescription?: boolean;
  /** Show metrics badge if available (default: true) */
  showMetrics?: boolean;
  className?: string;
}

/**
 * InviteCodeCard - Display invite code with CTA
 */
export function InviteCodeCard({
  code,
  showFullDescription = true,
  showMetrics = true,
  className,
}: InviteCodeCardProps) {
  return (
    <Card className={`${HOVER_EFFECTS.cardSubtle} ${className || ""}`}>
      <CardContent className="flex flex-col gap-4 h-full">
        {/* Header with platform name and metrics */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {code.label || code.platform}
            </h3>
            {code.sponsorName && (
              <p className="text-xs text-muted-foreground mt-1">
                Sponsored by {code.sponsorName}
              </p>
            )}
          </div>
          {showMetrics && code.metrics && (
            <Badge variant="secondary" className="gap-1.5 shrink-0">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs">{code.metrics}</span>
            </Badge>
          )}
        </div>

        {/* Description */}
        <p
          className={`text-sm text-muted-foreground flex-1 ${
            !showFullDescription ? "line-clamp-2" : ""
          }`}
        >
          {code.description}
        </p>

        {/* CTA Button */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="group/btn gap-2 flex-1"
          >
            <Link href={code.url} target="_blank" rel="noopener noreferrer">
              <span>Visit {code.platform}</span>
              <ExternalLink className="h-3.5 w-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

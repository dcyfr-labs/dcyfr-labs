import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AboutAvatar } from "@/components/about/about-avatar";
import { TYPOGRAPHY, HOVER_EFFECTS, SPACING } from "@/lib/design-tokens";
import { Sparkles } from "lucide-react";
import { teamMembers, teamDescription } from "@/data/team";

/**
 * About Team Component
 *
 * Small teaser section for the Team page. Highlights the human–AI duo and
 * provides a clear CTA to visit /team for the full story.
 */
export function AboutTeam() {
  const [drew, dcyfr] = teamMembers;

  return (
    <div className={SPACING.content}>
      <div className="space-y-2">
        <h2 className={TYPOGRAPHY.h2.standard}>Meet the team</h2>
        <p className={TYPOGRAPHY.metadata}>
          {teamDescription}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Drew */}
        <Card className={`p-5 space-y-4 ${HOVER_EFFECTS.cardSubtle}`}>
          <div className="flex items-start gap-3">
            <AboutAvatar size="sm" />
            <div className="flex-1">
              <h3 className="font-medium text-lg">{drew.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{drew.title}</p>
              <div>
                {drew.badges.map((badge, idx) => (
                  <Badge key={idx} variant="outline" className="mr-2">
                    <badge.icon className="w-3 h-3 mr-1" />
                    {badge.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {drew.description}
          </p>
        </Card>

        {/* DCYFR */}
        <Card className={`p-5 space-y-4 border-primary/20 ${HOVER_EFFECTS.cardSubtle}`}>
          <div className="flex items-start gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                {dcyfr.avatarIcon && <dcyfr.avatarIcon className="w-6 h-6 text-primary" />}
              </div>
              <div className="absolute -bottom-1 -right-1">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg">{dcyfr.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{dcyfr.title}</p>
              <div>
                {dcyfr.badges.map((badge, idx) => (
                  <Badge key={idx} variant="outline" className="mr-2">
                    <badge.icon className="w-3 h-3 mr-1" />
                    {badge.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {dcyfr.description}
          </p>
        </Card>
      </div>
    </div>
  );
}

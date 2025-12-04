/**
 * Social Proof Component
 * 
 * Displays key achievements and metrics that demonstrate credibility.
 * Shows certifications count, compliance frameworks, and key achievements.
 * 
 * @component
 * @example
 * ```tsx
 * <SocialProof />
 * ```
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Shield, Award, TrendingDown, Zap, ExternalLink } from "lucide-react";
import { TYPOGRAPHY, HOVER_EFFECTS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { resume } from "@/data/resume";

type Achievement = {
  icon: React.ComponentType<{ className?: string }>;
  metric: string;
  label: string;
  description: string;
  color: string;
};

const achievements: Achievement[] = [
  {
    icon: TrendingDown,
    metric: "23%",
    label: "Vulnerability Reduction",
    description: "Implemented controls reducing global vulnerabilities",
    color: "text-green-500",
  },
  {
    icon: Zap,
    metric: "35%",
    label: "Faster Response",
    description: "Streamlined incident response processes",
    color: "text-blue-500",
  },
  {
    icon: Award,
    metric: "20+",
    label: "Certifications",
    description: "Professional security certifications",
    color: "text-purple-500",
  },
  {
    icon: Shield,
    metric: "4+",
    label: "Compliance Frameworks",
    description: "ISO 27001, SOC2, TISAX, TPN certified",
    color: "text-orange-500",
  },
];

export function SocialProof() {
  // Get total certifications count
  const totalCertifications = resume.certifications.reduce(
    (sum, cat) => sum + cat.certifications.length,
    0
  );

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className={TYPOGRAPHY.h3.standard}>Track Record</h3>
        <p className="text-sm text-muted-foreground">
          Proven impact in cybersecurity and infrastructure
        </p>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          return (
            <div
              key={achievement.label}
              className={`group space-y-2 p-4 rounded-lg border bg-card/50 ${HOVER_EFFECTS.cardSubtle}`}
            >
              <div className="flex items-start justify-between">
                <Icon className={cn(
                  "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                  achievement.color
                )} aria-hidden />
                <span className={cn(TYPOGRAPHY.display.stat, achievement.color)}>
                  {achievement.metric}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">{achievement.label}</p>
                <p className="text-xs text-muted-foreground">
                  {achievement.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Certifications Badge */}
      <div className="pt-3 border-t">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">Professional Certifications</p>
            <p className="text-xs text-muted-foreground">
              {totalCertifications} industry certifications across security, cloud, and compliance
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/resume">
              View Resume
              <ExternalLink className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

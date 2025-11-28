/**
 * What I Do Component
 * 
 * Displays the three core pillars of expertise on the homepage.
 * Shows Development, Cybersecurity, and AI focus areas with icons and descriptions.
 * 
 * @component
 * @example
 * ```tsx
 * <WhatIDo />
 * ```
 */

import { Card } from "@/components/ui/card";
import { Code2, Shield, Sparkles } from "lucide-react";
import { HOVER_EFFECTS, TYPOGRAPHY } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

type Pillar = {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description: string;
  color: string; // text-{color} class for icon
};

const pillars: Pillar[] = [
  {
    icon: Code2,
    title: "Development",
    description: "Building scalable, maintainable applications with modern web technologies. From architecture decisions to production deployment.",
    color: "text-blue-500",
  },
  {
    icon: Shield,
    title: "Cybersecurity",
    description: "Implementing defense-in-depth strategies and practical security hardening. Real threats, practical defenses, not checkbox compliance.",
    color: "text-green-500",
  },
  {
    icon: Sparkles,
    title: "AI & Automation",
    description: "Leveraging AI for developer productivity and workflow automation. Augmentation over replacement, practical patterns over hype.",
    color: "text-purple-500",
  },
];

function PillarCard({ pillar }: { pillar: Pillar }) {
  const Icon = pillar.icon;
  
  return (
    <Card className={cn(
      "p-5 space-y-3 group",
      HOVER_EFFECTS.card
    )}>
      <div className="flex items-start gap-3">
        <div className="shrink-0 transition-transform duration-200 group-hover:scale-110">
          <Icon className={cn("h-6 w-6", pillar.color)} aria-hidden />
        </div>
        <div className="space-y-2">
          <h3 className={TYPOGRAPHY.h3.standard}>{pillar.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {pillar.description}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function WhatIDo() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {pillars.map((pillar) => (
          <PillarCard key={pillar.title} pillar={pillar} />
        ))}
      </div>
    </div>
  );
}

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dcyfr } from "@/data/dcyfr";
import {
  TYPOGRAPHY,
  SPACING,
  PAGE_LAYOUT,
  SHADOWS,
  BORDERS,
} from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { Section, ProfileAvatar } from "@/components/common";
import { Zap, Code, Brain, Shield, FileText } from "lucide-react";

/**
 * About DCYFR Profile Component
 * 
 * Comprehensive profile for DCYFR AI Lab Assistant, designed for future
 * dedicated /about/dcyfr page. Includes hero section with avatar and summary,
 * followed by detailed capabilities, philosophy, and integration information.
 */
export function AboutDcyfrProfile() {
  return (
    <>
      {/* DCYFR Hero Section */}
      <Section id="dcyfr-hero" className={PAGE_LAYOUT.hero.container}>
        <div
          className={cn(
            "flex flex-col md:flex-row items-center md:items-start gap-6",
            SPACING.content
          )}
        >
          {/* Avatar */}
          <div className="shrink-0 *:mt-0">
            <ProfileAvatar userProfile="dcyfr" size="lg" />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className={cn(TYPOGRAPHY.h1.hero, "font-serif")}>
                {dcyfr.name}
              </h2>
              <p className="">{dcyfr.title}</p>
              <p className="text-sm text-muted-foreground">{dcyfr.subtitle}</p>
            </div>
            <p className={TYPOGRAPHY.description}>{dcyfr.summary}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Zap className="w-3 h-3" />
                AI-Powered
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Shield className="w-3 h-3" />
                Innovation by Design
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Code className="w-3 h-3" />
                Full-Stack Automation
              </Badge>
            </div>
          </div>
        </div>
      </Section>

      {/* Capabilities Section */}
      <Section
        id="dcyfr-capabilities"
        className={PAGE_LAYOUT.section.container}
      >
        <div className={SPACING.content}>
          <h3 className={TYPOGRAPHY.h2.standard}>Core Capabilities</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {dcyfr.capabilities.map((capability, idx) => (
              <Card key={idx} className={cn(
                "p-6 space-y-3",
                SHADOWS.card.rest,
                BORDERS.card
              )}>
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    {capability.name === "Code Development" && (
                      <Code className="w-4 h-4 text-primary" />
                    )}
                    {capability.name === "Security Analysis" && (
                      <Shield className="w-4 h-4 text-primary" />
                    )}
                    {capability.name ===
                      "Documentation & Knowledge Management" && (
                      <FileText className="w-4 h-4 text-primary" />
                    )}
                    {capability.name === "Code Review & Quality Assurance" && (
                      <Zap className="w-4 h-4 text-primary" />
                    )}
                    {capability.name === "Architecture & Planning" && (
                      <Brain className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={TYPOGRAPHY.h3.standard}>
                      {capability.name}
                    </h4>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {capability.description}
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {capability.examples.map((example, exIdx) => (
                    <li key={exIdx} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Philosophy Section */}
      <Section id="dcyfr-philosophy" className={PAGE_LAYOUT.section.container}>
        <div className={SPACING.content}>
          <h3 className={TYPOGRAPHY.h2.standard}>Guiding Philosophy</h3>
          <Card className={cn(
            "p-6",
            SHADOWS.card.rest,
            BORDERS.card
          )}>
            <ul className="space-y-3">
              {dcyfr.philosophy.map((principle, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  {/* eslint-disable-next-line no-restricted-syntax -- Decorative bullet point, not heading text */}
                  <span className="text-primary text-xl font-bold mt-0.5">
                    •
                  </span>
                  <span className="text-muted-foreground">{principle}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      {/* Integration Section */}
      <Section id="dcyfr-integration" className={PAGE_LAYOUT.section.container}>
        <div className={SPACING.content}>
          <h3 className={TYPOGRAPHY.h2.standard}>
            Integration with DCYFR Labs
          </h3>
          <div className="space-y-4">
            {dcyfr.integration.map((item, idx) => (
              <Card key={idx} className={cn(
                "p-6 space-y-2",
                SHADOWS.tier3.combined,
                BORDERS.card
              )}>
                <h4 className={cn(TYPOGRAPHY.h3.standard, "text-foreground")}>
                  {item.aspect}
                </h4>
                <p className="text-muted-foreground">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </Section>

      {/* Approach Section */}
      <Section id="dcyfr-approach" className={PAGE_LAYOUT.section.container}>
        <div className={SPACING.content}>
          <h3 className={TYPOGRAPHY.h2.standard}>Development Approach</h3>
          <Card className={cn("p-6", SHADOWS.card.rest, BORDERS.card)}>
            <ul className="space-y-2.5">
              {dcyfr.approach.map((principle, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-muted-foreground"
                >
                  <span className="text-primary font-mono text-sm mt-0.5">
                    →
                  </span>
                  <span>{principle}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>
    </>
  );
}

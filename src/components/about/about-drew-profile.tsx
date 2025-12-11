import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { resume, getYearsOfExperience, getShortSummary } from "@/data/resume";
import {
  TYPOGRAPHY,
  SPACING,
  HOVER_EFFECTS,
  PAGE_LAYOUT,
} from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { Section, ProfileAvatar, GitHubHeatmapErrorBoundary } from "@/components/common";
import { ServerGitHubHeatmap } from "@/components/features";
import { Coffee, Shield, Code, ArrowLeft } from "lucide-react";

/**
 * About Drew Profile Component
 * 
 * Comprehensive profile for Drew, the founding architect of DCYFR Labs.
 * Designed for future dedicated /about/drew page. Includes hero section
 * with avatar and summary, followed by background, motivation, current role,
 * and GitHub activity.
 */
export function AboutDrewProfile() {
  return (
    <>
      {/* Drew Hero Section */}
      <Section id="drew-hero" className={PAGE_LAYOUT.hero.container}>
        <div
          className={cn(
            "flex flex-col md:flex-row items-center md:items-start gap-4",
            SPACING.content
          )}
        >
          {/* Avatar */}
          <div className="shrink-0 *:mt-0 mr-5">
            <ProfileAvatar userProfile="drew" size="lg" />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className={cn(TYPOGRAPHY.h1.hero, "font-serif")}>Drew</h2>
              <p className="">Founding Architect</p>
              <p className="text-sm text-muted-foreground">
                Security Architect • {getYearsOfExperience()}+ Years Experience
              </p>
            </div>
            <p className={TYPOGRAPHY.description}>{getShortSummary()}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Coffee className="w-3 h-3" />
                Coffee-Powered
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Shield className="w-3 h-3" />
                Security by Design
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Code className="w-3 h-3" />
                Full-Stack Developer
              </Badge>
            </div>
          </div>
        </div>
      </Section>

      {/* Professional Background & Motivation Section */}
      <Section
        id="drew-background"
        className={PAGE_LAYOUT.proseSection.container}
      >
        <div className="prose prose-slate dark:prose-invert">
          <h3 className={TYPOGRAPHY.h2.standard}>Professional Background</h3>

          <div className={SPACING.content}>
            <p>
              With over {getYearsOfExperience()} years of experience in the
              cybersecurity industry, I have had the privilege of working with
              diverse organizations ranging from startups to established
              enterprises. My journey has equipped me with a comprehensive
              understanding of security frameworks, risk management, and
              incident response strategies.
            </p>

            <div className="space-y-3">
              <h4 className={cn(TYPOGRAPHY.h3.standard, "text-foreground")}>
                What Drives Me
              </h4>
              <p>
                My passion for cybersecurity stems from a deep-seated curiosity
                about technology and a commitment to making the digital world a
                safer and more secure place. I thrive on solving complex
                problems, staying ahead of emerging threats, and continuously
                learning in this ever-evolving field.
              </p>
              <p>
                Beyond the technical aspects, I believe that effective
                cybersecurity is about people—educating users, fostering a
                security-first culture, and collaborating across teams to build
                resilient systems. I&apos;m dedicated to empowering
                organizations to protect their assets while enabling innovation
                and growth.
              </p>
              <p>
                When I&apos;m not immersed in security challenges, you can
                find me exploring the latest tech trends, contributing to
                open-source projects, or sharing insights through writing and
                speaking engagements. I&apos;m always eager to connect with
                fellow professionals and enthusiasts who share my passion for
                cybersecurity.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Current Roles Section */}
      <Section
        id="drew-current-roles"
        className={PAGE_LAYOUT.section.container}
      >
        <div className={SPACING.content}>
          <h3 className={TYPOGRAPHY.h2.standard}>Current Roles</h3>
          <div className="space-y-4">
            {resume.experience
              .filter((role) => role.duration.includes("Present"))
              .map((role, idx) => (
                <Card key={idx} className="p-5 space-y-4">
                  <div className="space-y-1">
                    <p className="font-medium text-lg">{role.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {role.company}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {role.duration}
                    </p>
                  </div>
                  <ul className="space-y-2.5 text-sm text-muted-foreground list-disc list-inside">
                    {role.responsibilities.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </Card>
              ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link
              className={`underline inline-flex items-center gap-2 text-primary ${HOVER_EFFECTS.link}`}
              href="/resume"
            >
              View full resume
            </Link>
          </div>
        </div>
      </Section>

      {/* GitHub Activity Section */}
      <Section id="drew-github" className={PAGE_LAYOUT.section.container}>
        <div className={SPACING.content}>
          <h3 className={TYPOGRAPHY.h2.standard}>GitHub Activity</h3>
          <p className="text-muted-foreground mb-6">
            A snapshot of my open source contributions and coding
            activity over the past year.
          </p>
          <GitHubHeatmapErrorBoundary>
            <ServerGitHubHeatmap username="dcyfr" />
          </GitHubHeatmapErrorBoundary>
        </div>
      </Section>
    </>
  );
}

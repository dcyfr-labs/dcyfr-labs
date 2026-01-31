import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { resume, getYearsOfExperience, getShortSummary } from '@/data/resume';
import {
  TYPOGRAPHY,
  SPACING,
  HOVER_EFFECTS,
  PAGE_LAYOUT,
  SHADOWS,
  BORDERS,
} from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import { Section, GitHubHeatmapErrorBoundary } from '@/components/common';
import { ServerGitHubHeatmap } from '@/components/features';
import { ServerResumeStats } from '@/components/resume';
import { ProfileHero } from './profile-hero';
import { Coffee, Shield, Code, Github, Briefcase } from 'lucide-react';

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
    <div className="space-y-12 md:space-y-16">
      {/* Drew Hero Section */}
      <ProfileHero
        userProfile="drew"
        name="Drew"
        title="Founding Architect"
        subtitle={`Security Architect • ${getYearsOfExperience()}+ Years Experience`}
        summary={getShortSummary()}
        badges={[
          { icon: <Coffee className="w-3 h-3" />, label: 'Coffee-Powered' },
          {
            icon: <Shield className="w-3 h-3" />,
            label: 'Security by Design',
          },
          {
            icon: <Code className="w-3 h-3" />,
            label: 'Full-Stack Developer',
          },
        ]}
      />

      {/* Professional Background & Motivation Section */}
      <Section id="drew-background" className={PAGE_LAYOUT.section.container}>
        <div className="">
          <h3 className={TYPOGRAPHY.h2.standard}>Professional Background</h3>

          <div className={SPACING.content}>
            <p>
              With over {getYearsOfExperience()} years of experience in the cybersecurity industry,
              I have had the privilege of working with diverse organizations ranging from startups
              to established enterprises. My journey has equipped me with a comprehensive
              understanding of security frameworks, risk management, and incident response
              strategies.
            </p>

            <div className={SPACING.content}>
              <h4 className={cn(TYPOGRAPHY.h3.standard, 'text-foreground')}>What Drives Me</h4>
              <p>
                My passion for cybersecurity stems from a deep-seated curiosity about technology and
                a commitment to making the digital world a safer and more secure place. I thrive on
                solving complex problems, staying ahead of emerging threats, and continuously
                learning in this ever-evolving field.
              </p>
              <p>
                Beyond the technical aspects, I believe that effective cybersecurity is about
                people—educating users, fostering a security-first culture, and collaborating across
                teams to build resilient systems. I&apos;m dedicated to empowering organizations to
                protect their assets while enabling innovation and growth.
              </p>
              <p>
                When I&apos;m not immersed in security challenges, you can find me exploring the
                latest tech trends, contributing to open-source projects, or sharing insights
                through writing and speaking engagements. I&apos;m always eager to connect with
                fellow professionals and enthusiasts who share my passion for cybersecurity.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* GitHub Activity Section */}
      <Section id="drew-github" className={PAGE_LAYOUT.section.container}>
        <div className={SPACING.content}>
          <div className="flex items-center gap-2.5 mb-4">
            <Github className="h-6 w-6 text-primary" />
            <h3 className={TYPOGRAPHY.h2.standard}>GitHub Activity</h3>
          </div>
          <p className="text-muted-foreground mb-6">
            A snapshot of my open source contributions and coding activity over the past year.
          </p>
          <GitHubHeatmapErrorBoundary>
            <ServerGitHubHeatmap username="dcyfr" />
          </GitHubHeatmapErrorBoundary>
        </div>
      </Section>

      {/* Current Roles Section */}
      <Section id="drew-current-roles" className={PAGE_LAYOUT.section.container}>
        <div className={SPACING.content}>
          <div className="flex items-center gap-2.5 mb-6">
            <Briefcase className="h-6 w-6 text-primary" />
            <h3 className={TYPOGRAPHY.h2.standard}>Current Experience</h3>
          </div>

          {/* Resume Stats Summary */}
          <div className="mb-8">
            <ServerResumeStats />
          </div>

          <div className={SPACING.content}>
            {resume.experience
              .filter((role) => role.duration.includes('Present'))
              .map((role, idx) => (
                <Card key={idx} className={cn('p-4', SHADOWS.card.rest, BORDERS.card)}>
                  <div className={SPACING.compact}>
                    <p className={cn(TYPOGRAPHY.label.small, 'font-medium')}>{role.title}</p>
                    <p className="text-sm text-muted-foreground">{role.company}</p>
                    <p className="text-sm text-muted-foreground">{role.duration}</p>
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
              href="/about/drew/resume"
            >
              View full resume
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}

import { Card } from '@/components/ui/card';
import { dcyfr } from '@/data/dcyfr';
import { TYPOGRAPHY, SPACING, PAGE_LAYOUT, SHADOWS, BORDERS } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';
import { Section } from '@/components/common';
import {
  Zap,
  Code,
  Brain,
  Shield,
  FileText,
  Focus,
  GitBranch,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { ProfileHero } from './profile-hero';
import { ProfileCapabilityCard } from './profile-capability-card';
import { ProfileListSection } from './profile-list-section';
import { DcyfrActivityStats } from './dcyfr-activity-stats';

/**
 * About DCYFR Profile Component
 *
 * Comprehensive profile for DCYFR AI Lab Assistant, designed for future
 * dedicated /about/dcyfr page. Includes hero section with avatar and summary,
 * followed by detailed capabilities, philosophy, and integration information.
 */
export function AboutDcyfrProfile() {
  // Icon mapping for capabilities
  const capabilityIcons: Record<string, React.ReactNode> = {
    'Code Development': <Code className="w-4 h-4 text-primary" />,
    'Security Analysis': <Shield className="w-4 h-4 text-primary" />,
    'Documentation & Knowledge Management': <FileText className="w-4 h-4 text-primary" />,
    'Code Review & Quality Assurance': <Zap className="w-4 h-4 text-primary" />,
    'Architecture & Planning': <Brain className="w-4 h-4 text-primary" />,
  };

  // Icon mapping for approach items
  const approachIcons: Record<string, React.ReactNode> = {
    Focus: <Focus className="w-5 h-5" />,
    GitBranch: <GitBranch className="w-5 h-5" />,
    CheckCircle: <CheckCircle className="w-5 h-5" />,
    FileText: <FileText className="w-5 h-5" />,
    HelpCircle: <HelpCircle className="w-5 h-5" />,
    Code: <Code className="w-5 h-5" />,
  };

  return (
    <div className="space-y-12 md:space-y-16">
      {/* DCYFR Hero Section */}
      <ProfileHero
        userProfile="dcyfr"
        name={dcyfr.name}
        title={dcyfr.title}
        subtitle={dcyfr.subtitle}
        summary={dcyfr.summary}
        badges={[
          { icon: <Zap className="w-3 h-3" />, label: 'AI-Powered' },
          {
            icon: <Shield className="w-3 h-3" />,
            label: 'Innovation by Design',
          },
          {
            icon: <Code className="w-3 h-3" />,
            label: 'Full-Stack Automation',
          },
        ]}
      />

      {/* AI Activity Stats */}
      <DcyfrActivityStats />

      {/* Capabilities Section */}
      <Section id="dcyfr-capabilities" className={PAGE_LAYOUT.section.container}>
        <div className={SPACING.content}>
          <h3 className={TYPOGRAPHY.h2.standard}>Core Capabilities</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {dcyfr.capabilities.map((capability, idx) => (
              <ProfileCapabilityCard
                key={idx}
                icon={capabilityIcons[capability.name]}
                title={capability.name}
                description={capability.description}
                examples={capability.examples}
              />
            ))}
          </div>
        </div>
      </Section>

      {/* Philosophy Section */}
      <Section id="dcyfr-philosophy" className={PAGE_LAYOUT.section.container}>
        <div className={SPACING.content}>
          <h3 className={TYPOGRAPHY.h2.standard}>Guiding Philosophy</h3>
          <ProfileListSection items={dcyfr.philosophy} bulletStyle="bullet" />
        </div>
      </Section>

      {/* Integration Section */}
      <Section id="dcyfr-integration" className={PAGE_LAYOUT.section.container}>
        <div className={SPACING.content}>
          <h3 className={TYPOGRAPHY.h2.standard}>Integration with DCYFR Labs</h3>
          <div className={SPACING.content}>
            {dcyfr.integration.map((item, idx) => (
              <Card
                key={idx}
                className={cn('p-8', SHADOWS.card.rest, BORDERS.card, SPACING.compact)}
              >
                <h4 className={cn(TYPOGRAPHY.h3.standard, 'text-foreground')}>{item.aspect}</h4>
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
          <ProfileListSection items={dcyfr.approach} bulletStyle="arrow" iconMap={approachIcons} />
        </div>
      </Section>
    </div>
  );
}

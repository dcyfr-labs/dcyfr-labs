'use client';

import { Card } from '@/components/ui/card';
import { TrendingUp, Award, Code, Briefcase } from 'lucide-react';
import { useEffect, useState } from 'react';
import { resume, getYearsOfExperience } from '@/data/resume';
import { TYPOGRAPHY, SPACING, BORDERS } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

/**
 * Resume Stats Component
 *
 * Displays key career metrics with animated counters.
 * Optimized for resume page to show experience, badges, and skills.
 *
 * Features:
 * - Animated number counters (1.5s duration)
 * - Responsive 2-column (mobile) to 4-column (desktop) grid
 * - Design token compliance with TYPOGRAPHY and SPACING
 * - Semantic HTML with proper ARIA labels
 *
 * @component
 * @example
 * ```tsx
 * // With server-provided badge count (recommended)
 * <ResumeStats totalBadges={25} />
 *
 * // Legacy: Will show 0 badges (no API call)
 * <ResumeStats />
 * ```
 */

interface ResumeStatsProps {
  /** Total badge count from server (avoids client-side API calls) */
  totalBadges?: number;
}

type Stat = {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  animateNumber?: number;
  suffix?: string;
  ariaLabel?: string;
};

function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(increment * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span suppressHydrationWarning>
      {count}
      {suffix}
    </span>
  );
}

export function ResumeStats({ totalBadges = 0 }: ResumeStatsProps) {
  const yearsExp = getYearsOfExperience();
  const totalCerts = totalBadges;
  const totalSkills = resume.skills.reduce((sum, cat) => sum + cat.skills.length, 0);
  const totalRoles = resume.experience.length;

  const stats: Stat[] = [
    {
      label: 'Years Experience',
      value: `${yearsExp}+`,
      icon: TrendingUp,
      description: 'AI & Cybersecurity',
      animateNumber: yearsExp,
      suffix: '+',
      ariaLabel: `${yearsExp} years of professional experience in AI and cybersecurity`,
    },
    {
      label: 'Badges Earned',
      value: `${totalCerts}`,
      icon: Award,
      description: 'Professional recognitions',
      animateNumber: totalCerts,
      suffix: '',
      ariaLabel: `${totalCerts} professional badges and certifications earned`,
    },
    {
      label: 'Technologies Used',
      value: `${totalSkills}+`,
      icon: Code,
      description: 'Tools & platforms',
      animateNumber: totalSkills,
      suffix: '+',
      ariaLabel: `${totalSkills} technologies and tools mastered`,
    },
    {
      label: 'Roles Held',
      value: `${totalRoles}`,
      icon: Briefcase,
      description: 'Career progression',
      animateNumber: totalRoles,
      suffix: '',
      ariaLabel: `${totalRoles} professional roles held throughout career`,
    },
  ];

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      role="region"
      aria-label="Career metrics and statistics"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className={cn(
              'p-4 transition-all duration-300',
              'hover:shadow-lg hover:border-primary/50',
              BORDERS.card
            )}
            role="article"
            aria-label={stat.ariaLabel}
          >
            <div className={cn(SPACING.compact, 'flex flex-col')}>
              {/* Icon */}
              <div className="mb-3">
                <Icon
                  className="h-6 w-6 text-primary transition-colors duration-300 hover:text-primary/80"
                  aria-hidden="true"
                />
              </div>

              {/* Stat Value */}
              {stat.animateNumber !== undefined ? (
                <div
                  className={cn(TYPOGRAPHY.display.stat, 'tabular-nums mb-1 text-foreground')}
                  suppressHydrationWarning
                >
                  <AnimatedNumber target={stat.animateNumber} suffix={stat.suffix} />
                </div>
              ) : (
                <div
                  className={cn(TYPOGRAPHY.display.stat, 'tabular-nums mb-1 text-foreground')}
                  suppressHydrationWarning
                >
                  {stat.value}
                </div>
              )}

              {/* Label */}
              <p className={cn(TYPOGRAPHY.label.standard, 'text-foreground mb-1')}>{stat.label}</p>

              {/* Description */}
              <p className={cn(TYPOGRAPHY.body.small, 'text-muted-foreground leading-relaxed')}>
                {stat.description}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

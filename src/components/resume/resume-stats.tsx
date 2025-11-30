"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, Award, Code, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";
import { resume, getYearsOfExperience } from "@/data/resume";
import { TYPOGRAPHY } from "@/lib/design-tokens";

/**
 * Resume Stats Component
 * 
 * Displays key career metrics with animated counters.
 * Optimized for resume page to show experience, certifications, and skills.
 * 
 * @component
 * @example
 * ```tsx
 * <ResumeStats />
 * ```
 */

type Stat = {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  animateNumber?: number;
  suffix?: string;
};

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
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

export function ResumeStats() {
  const yearsExp = getYearsOfExperience();
  const totalCerts = resume.certifications.reduce((sum, cat) => sum + cat.certifications.length, 0);
  const totalSkills = resume.skills.reduce((sum, cat) => sum + cat.skills.length, 0);
  const totalRoles = resume.experience.length;

  const stats: Stat[] = [
    {
      label: "Years Experience",
      value: `${yearsExp}+`,
      icon: TrendingUp,
      description: "In cybersecurity",
      animateNumber: yearsExp,
      suffix: "+",
    },
    {
      label: "Certifications",
      value: `${totalCerts}`,
      icon: Award,
      description: "Active credentials",
      animateNumber: totalCerts,
      suffix: "",
    },
    {
      label: "Technologies",
      value: `${totalSkills}+`,
      icon: Code,
      description: "Tools & platforms",
      animateNumber: totalSkills,
      suffix: "+",
    },
    {
      label: "Roles",
      value: `${totalRoles}`,
      icon: Briefcase,
      description: "Career progression",
      animateNumber: totalRoles,
      suffix: "",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-4">
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-1">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                {stat.animateNumber !== undefined ? (
                  <>
                    { }
                    <div className={`${TYPOGRAPHY.display.stat} tabular-nums mb-1`} suppressHydrationWarning>
                      <AnimatedNumber target={stat.animateNumber} suffix={stat.suffix} />
                    </div>
                  </>
                ) : (
                  <>
                    { }
                    <div className={`${TYPOGRAPHY.display.stat} tabular-nums mb-1`} suppressHydrationWarning>{stat.value}</div>
                  </>
                )}
                {/* eslint-disable-next-line no-restricted-syntax */}
                <p className="text-sm font-medium text-foreground mb-0.5" suppressHydrationWarning>{stat.label}</p>
                <p className="text-xs text-muted-foreground leading-snug">{stat.description}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

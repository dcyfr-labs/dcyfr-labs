"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, Shield, Zap, Award, CheckCircle2, FileText, Folder } from "lucide-react";
import { useEffect, useState } from "react";
import { TYPOGRAPHY, HOVER_EFFECTS } from "@/lib/design-tokens";
import { resume, getYearsOfExperience } from "@/data/resume";

/**
 * Calculate years of experience in cybersecurity from resume data
 * Re-exported for convenience
 * 
 * @returns Number of years of experience
 */
export const calculateYearsOfExperience = getYearsOfExperience;

/**
 * About Stats Component
 * 
 * Displays key career metrics and achievements in an animated card grid.
 * Features number counters that animate on mount for visual engagement.
 * 
 * @component
 * @example
 * ```tsx
 * <AboutStats blogCount={15} projectCount={5} />
 * ```
 */

type Stat = {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  animateNumber?: number; // Optional number to animate to
  suffix?: string; // Optional suffix for animated numbers
};

interface AboutStatsProps {
  blogCount?: number;
  projectCount?: number;
}

function getStats(blogCount?: number, projectCount?: number): Stat[] {
  // Calculate certifications count from resume data
  const totalCertifications = resume.certifications.reduce(
    (sum, category) => sum + category.certifications.length,
    0
  );

  // Calculate compliance frameworks from skills
  const frameworksCategory = resume.skills.find(
    (cat) => cat.category === "Frameworks & Standards"
  );
  const complianceFrameworks = frameworksCategory?.skills.filter((skill) =>
    /ISO|SOC|TISAX|TPN|GDPR|CCPA|CJIS|NIST|CSF/.test(skill)
  ).length || 0;

  // Calculate years in cybersecurity using shared utility
  const yearsInCyber = calculateYearsOfExperience();

  const baseStats: Stat[] = [
    {
      label: "Years in Cybersecurity",
      value: `${yearsInCyber}+`,
      icon: TrendingUp,
      description: "Leading security programs",
      animateNumber: yearsInCyber,
      suffix: "+",
    },
    {
      label: "Professional Certifications",
      value: `${totalCertifications}+`,
      icon: Award,
      description: "GIAC, CompTIA, Mile2, ISC2",
      animateNumber: totalCertifications,
      suffix: "+",
    },
    {
      label: "Compliance Frameworks",
      value: `${complianceFrameworks}+`,
      icon: CheckCircle2,
      description: "ISO 27001, SOC2, TISAX, TPN",
      animateNumber: complianceFrameworks,
      suffix: "+",
    },
  ];

  // Add optional blog and project stats if provided
  if (blogCount !== undefined && blogCount > 0) {
    baseStats.push({
      label: "Blog Posts Published",
      value: `${blogCount}`,
      icon: FileText,
      description: "Sharing knowledge & insights",
      animateNumber: blogCount,
      suffix: "",
    });
  }

  if (projectCount !== undefined && projectCount > 0) {
    baseStats.push({
      label: "Projects Shipped",
      value: `${projectCount}`,
      icon: Folder,
      description: "Open source & production",
      animateNumber: projectCount,
      suffix: "",
    });
  }

  return baseStats;
}

/**
 * Animated counter hook
 * Animates a number from 0 to target value over specified duration
 */
function useCounter(target: number, duration: number = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);
      
      setCount(Math.floor(easedProgress * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [target, duration]);

  return count;
}

/**
 * Individual stat card with animation
 */
function StatCard({ stat }: { stat: Stat }) {
  const [mounted, setMounted] = useState(false);
  const animatedValue = useCounter(stat.animateNumber || 0, 1500);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Hydration-safe pattern
    setMounted(true);
  }, []);

  const displayValue = mounted && stat.animateNumber 
    ? `${animatedValue}${stat.suffix || ""}`
    : stat.value;

  const Icon = stat.icon;

  return (
    <Card className={`p-6 space-y-3 ${HOVER_EFFECTS.cardSubtle}`}>
      <div className="flex items-start justify-between">
        <Icon className="h-5 w-5 text-primary shrink-0" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className={TYPOGRAPHY.display.stat}>
          {displayValue}
        </p>
        {/* Label text, not a semantic heading - uses standard text styles */}
        {/* eslint-disable-next-line no-restricted-syntax */}
        <p className="text-sm font-medium text-foreground">
          {stat.label}
        </p>
        <p className="text-xs text-muted-foreground">
          {stat.description}
        </p>
      </div>
    </Card>
  );
}

/**
 * Main stats grid component
 */
export function AboutStats({ blogCount, projectCount }: AboutStatsProps) {
  const stats = getStats(blogCount, projectCount);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, idx) => (
        <StatCard key={idx} stat={stat} />
      ))}
    </div>
  );
}

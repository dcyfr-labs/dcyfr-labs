"use client";

import * as React from "react";
import { Briefcase, Code, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TYPOGRAPHY,
  BORDERS,
} from "@/lib/design-tokens";

/**
 * RoleBasedCTA - Single role-specific call-to-action card
 *
 * Displays a single CTA card for a specific audience persona (Executive/Developer/Security).
 * Each instance renders only one card. Multiple instances can be placed in content to show
 * different roles side-by-side or sequentially.
 *
 * Features:
 * - Single card per instance (one role per component)
 * - Card-based design with hover effects
 * - Role-specific icons and color theming
 * - Analytics tracking for CTA clicks
 * - WCAG AA accessible
 * - Design token compliant
 *
 * Usage: Place multiple instances for different roles
 * Each instance shows only one card based on the role prop
 */

type RoleType = "executive" | "developer" | "security";

interface RoleBasedCTAProps {
  /** Which role this card represents */
  role: RoleType;
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Button text */
  buttonText: string;
  /** Button href (usually /contact?role=...) */
  buttonHref: string;
  /** Optional className */
  className?: string;
}

const roleConfig = {
  executive: {
    icon: Briefcase,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-blue-200 dark:border-blue-800",
    hoverBg: "hover:bg-blue-100 dark:hover:bg-blue-900/40",
  },
  developer: {
    icon: Code,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    hoverBg: "hover:bg-green-100 dark:hover:bg-green-900/40",
  },
  security: {
    icon: Shield,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    hoverBg: "hover:bg-red-100 dark:hover:bg-red-900/40",
  },
};

export function RoleBasedCTA({
  role,
  title,
  description,
  buttonText,
  buttonHref,
  className,
}: RoleBasedCTAProps) {
  const theme = roleConfig[role];
  const Icon = theme.icon;

  const handleClick = () => {
    // Track CTA click event
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "cta_click", {
        cta_type: "role_based",
        role,
        button_text: buttonText,
      });
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-4 p-6 rounded-lg border transition-all my-8 max-w-md",
        BORDERS.card,
        theme.bgColor,
        theme.borderColor,
        theme.hoverBg,
        className
      )}
      data-testid={`role-based-cta-${role}`}
    >
      {/* Icon */}
      <div className="flex items-center gap-3">
        <Icon className={cn("h-6 w-6", theme.color)} aria-hidden="true" />
        <h3 className={cn(TYPOGRAPHY.h3.standard)}>
          {title}
        </h3>
      </div>

      {/* Description */}
      <p className={cn("text-sm leading-relaxed text-muted-foreground flex-1")}>
        {description}
      </p>

      {/* Button */}
      <a
        href={buttonHref}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center px-4 py-2 rounded-md",
          "text-sm font-medium transition-colors",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background"
        )}
        role="button"
        aria-label={`${buttonText} for ${title}`}
      >
        {buttonText}
      </a>
    </div>
  );
}

export type { RoleBasedCTAProps };

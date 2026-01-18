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
    buttonBg: "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
    buttonText: "text-white dark:text-white",
  },
  developer: {
    icon: Code,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    borderColor: "border-green-200 dark:border-green-800",
    hoverBg: "hover:bg-green-100 dark:hover:bg-green-900/40",
    buttonBg: "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600",
    buttonText: "text-white dark:text-white",
  },
  security: {
    icon: Shield,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-red-200 dark:border-red-800",
    hoverBg: "hover:bg-red-100 dark:hover:bg-red-900/40",
    buttonBg: "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600",
    buttonText: "text-white dark:text-white",
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
        "flex flex-col md:flex-row md:items-center gap-4 md:gap-6 p-6 rounded-lg border transition-all my-8 w-full",
        BORDERS.card,
        theme.bgColor,
        theme.borderColor,
        theme.hoverBg,
        className
      )}
      data-testid={`role-based-cta-${role}`}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        <Icon className={cn("h-8 w-8", theme.color)} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className={cn(TYPOGRAPHY.h3.standard, "mb-2")}>
          {title}
        </h3>
        <p className={cn("text-sm leading-relaxed text-muted-foreground")}>
          {description}
        </p>
      </div>

      {/* Button */}
      <div className="flex-shrink-0 w-full md:w-auto">
        <a
          href={buttonHref}
          onClick={handleClick}
          className={cn(
            "inline-flex items-center justify-center px-6 py-3 rounded-md whitespace-nowrap w-full md:w-auto",
            "text-sm font-medium transition-colors no-underline",
            theme.buttonBg,
            theme.buttonText,
            "focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-background",
            role === "executive" && "focus:ring-blue-500",
            role === "developer" && "focus:ring-green-500",
            role === "security" && "focus:ring-red-500"
          )}
          role="button"
          aria-label={`${buttonText} for ${title}`}
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
}

export type { RoleBasedCTAProps };

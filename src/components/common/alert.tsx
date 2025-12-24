"use client";

import * as React from "react";
import { AlertTriangle, Info, AlertCircle, CheckCircle } from "lucide-react";
import { NEON_COLORS, BORDERS } from "@/lib/design-tokens";

/**
 * Alert Banner Component for MDX
 * 
 * Displays styled alert banners with icons and content.
 * Supports multiple severity levels: warning, critical, info, success
 * 
 * Uses semantic color tokens from design system for consistent theming.
 * Follows the unified pattern used by KeyTakeaway and ContextClue components.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {'critical' | 'warning' | 'info' | 'success'} props.type - Alert type/severity
 * @param {React.ReactNode} props.children - Alert content
 * @param {string} props.className - Additional CSS classes
 * 
 * @example
 * ```mdx
 * <Alert type="critical">
 *   **CRITICAL UPDATE:** This is very important!
 * </Alert>
 * 
 * <Alert type="warning">
 *   Please note this important information.
 * </Alert>
 * 
 * <Alert type="info">
 *   Here's some helpful information.
 * </Alert>
 * ```
 */

export interface AlertProps {
  type?: 'critical' | 'warning' | 'info' | 'success';
  children: React.ReactNode;
  className?: string;
}

const iconMap = {
  critical: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
};

export function Alert({ type = 'info', children, className = '' }: AlertProps) {
  // Map alert types to neon color variants
  const colorMap = {
    critical: NEON_COLORS.red,
    warning: NEON_COLORS.orange,
    info: NEON_COLORS.cyan,
    success: NEON_COLORS.lime,
  };

  const colors = colorMap[type];
  const Icon = iconMap[type];

  return (
    <div role="alert" className={`alert-banner ${BORDERS.card} ${colors.container} shadow-[0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_1px_2px_rgb(0_0_0/0.15)] p-4 sm:p-5 my-6 ${className}`}>
      <div className="flex items-start gap-3 sm:gap-4">
        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 mt-0.5 shrink-0 ${colors.icon}`} aria-hidden="true" />
        <div className={`flex-1 text-sm sm:text-base leading-relaxed max-w-none ${colors.text} [&>p]:m-0 [&>p]:inline [&>strong]:font-semibold [&>em]:italic [&>ul]:space-y-0.5 [&>ol]:space-y-0.5 [&>li]:leading-relaxed`}>
          {children}
        </div>
      </div>
    </div>
  );
}

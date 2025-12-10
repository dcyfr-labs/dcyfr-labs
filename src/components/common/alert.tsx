"use client";

import * as React from "react";
import { AlertTriangle, Info, AlertCircle, CheckCircle } from "lucide-react";
import { SEMANTIC_COLORS, BORDERS } from "@/lib/design-tokens";

/**
 * Alert Banner Component for MDX
 * 
 * Displays styled alert banners with icons and content.
 * Supports multiple severity levels: warning, critical, info, success
 * 
 * Uses semantic color tokens from design system for consistent theming.
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
  const colors = SEMANTIC_COLORS.alert[type];
  const Icon = iconMap[type];

  return (
    <div className={`${BORDERS.card} ${colors.border} ${colors.container} p-3 sm:p-4 my-4 ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${colors.icon}`} aria-hidden="true" />
        <div className={`flex-1 text-sm leading-relaxed max-w-none ${colors.text} [&>p]:m-0 [&>p]:leading-relaxed [&>strong]:font-semibold [&>ul]:space-y-0.5 [&>ol]:space-y-0.5 [&>li]:leading-relaxed`}>
          {children}
        </div>
      </div>
    </div>
  );
}

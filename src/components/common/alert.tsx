"use client";

import * as React from "react";
import { AlertTriangle, Info, AlertCircle, CheckCircle } from "lucide-react";
import { SEMANTIC_COLORS, BORDERS } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

/**
 * Alert Banner Component
 *
 * Unified alert banner component for displaying important information sitewide.
 * Supports multiple severity levels with consistent styling across all usages.
 *
 * Uses semantic color tokens from design system for consistent theming.
 * Includes left border accent, appropriate icons, and proper spacing.
 *
 * @component
 * @param {Object} props - Component props
 * @param {'critical' | 'warning' | 'info' | 'success'} props.type - Alert type/severity
 * @param {React.ReactNode} props.children - Alert content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.dismissible - Whether the alert can be dismissed (default: false)
 * @param {() => void} props.onDismiss - Callback when alert is dismissed
 *
 * @example
 * ```tsx
 * // In MDX or TSX
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
 *
 * <Alert type="success">
 *   Operation completed successfully!
 * </Alert>
 *
 * // Dismissible variant
 * <Alert type="info" dismissible onDismiss={() => console.log('dismissed')}>
 *   This can be dismissed
 * </Alert>
 * ```
 */

export interface AlertProps {
  type?: "critical" | "warning" | "info" | "success" | "notice";
  children: React.ReactNode;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  dismissLabel?: string;
  label?: string;
  icon?: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  containerOverride?: string;
  role?: "alert" | "note" | "complementary";
}

const iconMap = {
  critical: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
  notice: Info,
};

export function Alert({
  type = "info",
  children,
  className = "",
  dismissible = false,
  onDismiss,
  dismissLabel = "Dismiss alert",
  label,
  icon,
  containerOverride,
  role = "alert",
}: AlertProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  // Map alert types to semantic color variants
  const colorMap = {
    critical: SEMANTIC_COLORS.alert.critical,
    warning: SEMANTIC_COLORS.alert.warning,
    info: SEMANTIC_COLORS.alert.info,
    success: SEMANTIC_COLORS.alert.success,
    notice: SEMANTIC_COLORS.alert.notice,
  };

  const colors = colorMap[type];
  const Icon = icon || iconMap[type];

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div
      role={role}
      className={cn(
        "alert-banner",
        BORDERS.card,
        colors.border,
        containerOverride || colors.container,
        "shadow-[0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_1px_2px_rgb(0_0_0/0.15)]",
        "p-4 sm:p-5 my-4",
        className
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <Icon
          className={cn("h-4 w-4 sm:h-5 sm:w-5 mt-0.5 shrink-0", colors.icon)}
          aria-hidden={true}
        />
        <div
          className={cn(
            "flex-1 text-xs sm:text-sm leading-snug max-w-none",
            colors.text,
            "[&>p]:m-0 [&>p]:leading-snug",
            "[&>p+p]:mt-3",
            "[&>strong]:font-semibold",
            "[&>em]:italic",
            "[&>ul]:space-y-0",
            "[&>ol]:space-y-0",
            "[&>li]:leading-snug",
            "[&_p]:mb-2 [&_p:last-child]:mb-0"
          )}
        >
          {label && (
            <>
              <span className={cn("font-semibold", colors.label)}>
                {label}
              </span>{" "}
            </>
          )}
          {children}
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className={cn(
              "shrink-0 p-1 rounded hover:bg-muted/60",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
              colors.icon
            )}
            aria-label={dismissLabel}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

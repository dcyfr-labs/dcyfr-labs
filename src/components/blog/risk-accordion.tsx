'use client';

import * as React from 'react';
import {
  ChevronDown,
  AlertTriangle,
  ShieldAlert,
  Database,
  Package,
  Code,
  Brain,
  Network,
  Layers,
  Users,
  Skull,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { BORDERS, SPACING, ANIMATION, TYPOGRAPHY } from '@/lib/design-tokens';

/**
 * Risk Accordion Component
 *
 * Progressive disclosure for long-form OWASP risk content.
 * Each risk is collapsible, showing key info by default with full details on expand.
 *
 * Features:
 * - Summary view: Risk name + severity + one-line description
 * - Expanded view: Full content (what/why/example/takeaway)
 * - Smooth animations with Framer Motion
 * - Icon mapping for visual categorization
 * - Accessibility: keyboard navigation, ARIA attributes
 * - Analytics: track which risks get expanded (engagement metrics)
 *
 * Usage:
 * <RiskAccordion
 *   id="ASI01"
 *   title="Agent Goal Hijack"
 *   severity="critical"
 *   summary="Attackers redirect agent objectives through prompt injection"
 * >
 *   Full content here...
 * </RiskAccordion>
 */

// Context for group control
interface AccordionGroupContextValue {
  expandedIds: Set<string>;
  toggleRisk: (id: string, isExpanded: boolean) => void;
  expandAll: () => void;
  collapseAll: () => void;
}

const AccordionGroupContext = React.createContext<AccordionGroupContextValue | null>(null);

function useAccordionGroup() {
  const context = React.useContext(AccordionGroupContext);
  return context; // Can be null if not in a group
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ASI01: AlertTriangle, // Goal Hijack
  ASI02: ShieldAlert, // Tool Misuse
  ASI03: Users, // Identity Abuse
  ASI04: Package, // Supply Chain
  ASI05: Code, // Code Execution
  ASI06: Brain, // Memory Poisoning
  ASI07: Network, // Inter-Agent Comm
  ASI08: Layers, // Cascading Failures
  ASI09: Users, // Trust Exploitation
  ASI10: Skull, // Rogue Agents
};

const severityColors = {
  critical: {
    badge: 'bg-error-subtle text-error border-error-light',
    icon: 'text-error',
    border: 'border-l-error',
  },
  high: {
    badge: 'bg-semantic-orange/10 text-semantic-orange border-semantic-orange/20',
    icon: 'text-semantic-orange',
    border: 'border-l-semantic-orange',
  },
  medium: {
    badge: 'bg-warning-subtle text-warning border-warning-light',
    icon: 'text-warning',
    border: 'border-l-warning',
  },
};

interface RiskAccordionProps {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium';
  summary: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}

export function RiskAccordion({
  id,
  title,
  severity,
  summary,
  children,
  defaultExpanded = false,
  onToggle,
}: RiskAccordionProps) {
  const groupContext = useAccordionGroup();

  // Use group state if available, otherwise use local state
  const isExpandedFromGroup = groupContext?.expandedIds.has(id) ?? false;
  const [localExpanded, setLocalExpanded] = React.useState(defaultExpanded);
  const isExpanded = groupContext ? isExpandedFromGroup : localExpanded;

  const Icon = iconMap[id] || AlertTriangle;
  const colors = severityColors[severity];

  const handleToggle = () => {
    const newState = !isExpanded;

    if (groupContext) {
      // If in a group, update group state
      groupContext.toggleRisk(id, newState);
    } else {
      // If standalone, update local state
      setLocalExpanded(newState);
    }

    // Call optional callback
    onToggle?.(newState);

    // Analytics tracking
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'risk_accordion_toggle', {
        risk_id: id,
        risk_title: title,
        action: newState ? 'expand' : 'collapse',
      });
    }
  };

  return (
    <div
      className={cn(
        BORDERS.card,
        'border-l-4',
        colors.border,
        'bg-card shadow-sm hover:shadow-md',
        ANIMATION.transition.base,
        'my-4'
      )}
    >
      {/* Header - Always Visible */}
      <button
        onClick={handleToggle}
        className={cn(
          'w-full text-left p-4 sm:p-5',
          'flex items-start gap-4',
          'hover:bg-muted/30 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
        )}
        aria-expanded={isExpanded}
        aria-controls={`risk-${id}-content`}
      >
        {/* Icon */}
        <Icon className={cn('h-5 w-5 sm:h-6 sm:w-6 mt-0.5 shrink-0', colors.icon)} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className={cn(TYPOGRAPHY.h3.standard, 'm-0')}>
              <span className="text-muted-foreground font-mono text-sm">{id}:</span> {title}
            </h3>
            <span
              className={cn(
                'text-xs font-semibold px-2 py-1 rounded border shrink-0',
                colors.badge
              )}
            >
              {severity.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
        </div>

        {/* Expand/Collapse Icon */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0 mt-1"
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`risk-${id}-content`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                'px-4 sm:px-5 pb-4 sm:pb-5 pt-2',
                'border-t border-border',
                'prose prose-sm dark:prose-invert max-w-none',
                '[&>*:first-child]:mt-0',
                '[&>*:last-child]:mb-0'
              )}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Risk Accordion Group
 *
 * Container for multiple risk accordions with group controls.
 * Features:
 * - "Expand All" / "Collapse All" buttons
 * - "Show only Critical" filter
 * - Progress tracking: "3 of 10 risks reviewed"
 */

interface RiskAccordionGroupProps {
  children: React.ReactNode;
  showGroupControls?: boolean;
}

export function RiskAccordionGroup({
  children,
  showGroupControls = true,
}: RiskAccordionGroupProps) {
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());

  // Type guard for RiskAccordion children
  const isRiskAccordion = React.useCallback(
    (child: React.ReactNode): child is React.ReactElement<RiskAccordionProps> => {
      return (
        React.isValidElement(child) &&
        typeof child.props === 'object' &&
        child.props !== null &&
        'id' in child.props
      );
    },
    []
  );

  // Extract IDs from children to get total count
  const childrenArray = React.Children.toArray(children);
  const totalCount = childrenArray.filter(isRiskAccordion).length;

  const expandedCount = expandedIds.size;

  const toggleRisk = React.useCallback((id: string, isExpanded: boolean) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (isExpanded) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const expandAll = React.useCallback(() => {
    // Extract all risk IDs from children
    const allIds = childrenArray.filter(isRiskAccordion).map((child) => child.props.id);
    setExpandedIds(new Set(allIds));
  }, [childrenArray, isRiskAccordion]);

  const collapseAll = React.useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const contextValue: AccordionGroupContextValue = React.useMemo(
    () => ({
      expandedIds,
      toggleRisk,
      expandAll,
      collapseAll,
    }),
    [expandedIds, toggleRisk, expandAll, collapseAll]
  );

  if (!showGroupControls) {
    return (
      <AccordionGroupContext.Provider value={contextValue}>
        <div className="space-y-0">{children}</div>
      </AccordionGroupContext.Provider>
    );
  }

  return (
    <AccordionGroupContext.Provider value={contextValue}>
      <div className="my-8">
        {/* Group Controls */}
        <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-lg border border-border">
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{expandedCount}</span> of{' '}
            <span className="font-semibold text-foreground">{totalCount}</span> risks reviewed
          </div>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="text-xs px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="text-xs px-3 py-1.5 rounded-md bg-muted hover:bg-muted/70 text-foreground font-medium transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>

        {/* Risk Accordions */}
        <div className="space-y-0">{children}</div>
      </div>
    </AccordionGroupContext.Provider>
  );
}

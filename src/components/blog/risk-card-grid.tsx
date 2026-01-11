"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BORDERS,
  SPACING,
  ANIMATION,
  TYPOGRAPHY,
  CONTAINER_WIDTHS,
} from "@/lib/design-tokens";

/**
 * Risk Card Grid Component
 *
 * Interactive dashboard for OWASP risks with:
 * - Card grid layout (3 cols desktop, 2 tablet, 1 mobile)
 * - Severity-based color coding
 * - Click to open modal with full details
 * - Sortable by severity, name, or detection difficulty
 * - Filterable by severity level
 * - Search functionality
 *
 * Perfect for users who want quick overview then deep-dive specific risks.
 */

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ASI01: AlertTriangle,
  ASI02: ShieldAlert,
  ASI03: Users,
  ASI04: Package,
  ASI05: Code,
  ASI06: Brain,
  ASI07: Network,
  ASI08: Layers,
  ASI09: Users,
  ASI10: Skull,
};

const severityConfig = {
  critical: {
    badge: "bg-error-subtle text-error border-error-light",
    card: "border-error-light hover:border-error",
    gradient: "from-error/10 to-transparent",
    icon: "text-error",
  },
  high: {
    badge:
      "bg-semantic-orange/10 text-semantic-orange border-semantic-orange/20",
    card: "border-semantic-orange/20 hover:border-semantic-orange/30",
    gradient: "from-semantic-orange/10 to-transparent",
    icon: "text-semantic-orange",
  },
  medium: {
    badge: "bg-warning-subtle text-warning border-warning-light",
    card: "border-warning-light hover:border-warning",
    gradient: "from-warning/10 to-transparent",
    icon: "text-warning",
  },
};

export interface RiskCardData {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium";
  summary: string;
  category: string; // "Injection", "Supply Chain", "Identity", etc.
  detectionDifficulty: "low" | "medium" | "high" | "very-high";
  content: React.ReactNode; // Full MDX content
}

interface RiskCardProps {
  risk: RiskCardData;
  onClick: () => void;
}

function RiskCard({ risk, onClick }: RiskCardProps) {
  const Icon = iconMap[risk.id] || AlertTriangle;
  const colors = severityConfig[risk.severity];

  return (
    <motion.button
      onClick={onClick}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative w-full text-left",
        BORDERS.card,
        colors.card,
        "bg-card shadow-sm hover:shadow-lg",
        ANIMATION.transition.base,
        "p-5 rounded-xl",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      )}
    >
      {/* Gradient Background */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity",
          colors.gradient
        )}
      />

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Icon className={cn("h-6 w-6 shrink-0", colors.icon)} />
            <span className="font-mono text-xs text-muted-foreground font-semibold">
              {risk.id}
            </span>
          </div>
          <span
            className={cn(
              "text-xs font-semibold px-2 py-1 rounded border shrink-0",
              colors.badge
            )}
          >
            {risk.severity.toUpperCase()}
          </span>
        </div>

        {/* Title */}
        <h3
          className={cn(
            TYPOGRAPHY.h4.mdx,
            "mb-2 group-hover:text-primary transition-colors"
          )}
        >
          {risk.title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-3">
          {risk.summary}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="font-semibold">Category:</span> {risk.category}
          </span>
          <span className="text-border">•</span>
          <span className="flex items-center gap-1">
            <span className="font-semibold">Detection:</span>{" "}
            {risk.detectionDifficulty.replace("-", " ")}
          </span>
        </div>

        {/* Read More Indicator */}
        <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-xs font-medium text-primary group-hover:gap-3 transition-all">
          <span>Read full analysis</span>
          <ExternalLink className="h-3 w-3" />
        </div>
      </div>
    </motion.button>
  );
}

interface RiskModalProps {
  risk: RiskCardData | null;
  isOpen: boolean;
  onClose: () => void;
}

function RiskModal({ risk, isOpen, onClose }: RiskModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!risk) return null;

  const Icon = iconMap[risk.id] || AlertTriangle;
  const colors = severityConfig[risk.severity];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className={cn(
                "relative w-full max-w-4xl max-h-[90vh] overflow-hidden",
                "bg-background rounded-2xl shadow-2xl pointer-events-auto",
                BORDERS.card
              )}
            >
              {/* Header */}
              <div
                className={cn(
                  "sticky top-0 z-10 bg-background/95 backdrop-blur",
                  "border-b border-border p-6"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Icon className={cn("h-7 w-7", colors.icon)} />
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-mono text-sm text-muted-foreground font-semibold">
                          {risk.id}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-semibold px-2 py-1 rounded border",
                            colors.badge
                          )}
                        >
                          {risk.severity.toUpperCase()}
                        </span>
                      </div>
                      <h2 className={TYPOGRAPHY.h2.standard}>{risk.title}</h2>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {risk.content}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

interface RiskCardGridProps {
  risks: RiskCardData[];
}

export function RiskCardGrid({ risks }: RiskCardGridProps) {
  const [selectedRisk, setSelectedRisk] = React.useState<RiskCardData | null>(
    null
  );
  const [sortBy, setSortBy] = React.useState<"severity" | "name" | "detection">(
    "severity"
  );
  const [filterSeverity, setFilterSeverity] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Sort and filter risks
  const filteredRisks = React.useMemo(() => {
    let result = [...risks];

    // Filter by severity
    if (filterSeverity !== "all") {
      result = result.filter((r) => r.severity === filterSeverity);
    }

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "severity") {
        const severityOrder = { critical: 0, high: 1, medium: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      } else if (sortBy === "name") {
        return a.title.localeCompare(b.title);
      } else {
        const difficultyOrder = { low: 0, medium: 1, high: 2, "very-high": 3 };
        return (
          difficultyOrder[b.detectionDifficulty] -
          difficultyOrder[a.detectionDifficulty]
        );
      }
    });

    return result;
  }, [risks, sortBy, filterSeverity, searchQuery]);

  return (
    <div className="my-8">
      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search risks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="severity">Severity</option>
            <option value="name">Name</option>
            <option value="detection">Detection Difficulty</option>
          </select>

          <span className="text-sm font-medium text-muted-foreground ml-4">
            Filter:
          </span>
          <button
            onClick={() => setFilterSeverity("all")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              filterSeverity === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/70"
            )}
          >
            All ({risks.length})
          </button>
          <button
            onClick={() => setFilterSeverity("critical")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
              filterSeverity === "critical"
                ? severityConfig.critical.badge
                : "border-border hover:bg-muted/30"
            )}
          >
            Critical ({risks.filter((r) => r.severity === "critical").length})
          </button>
          <button
            onClick={() => setFilterSeverity("high")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
              filterSeverity === "high"
                ? severityConfig.high.badge
                : "border-border hover:bg-muted/30"
            )}
          >
            High ({risks.filter((r) => r.severity === "high").length})
          </button>
        </div>
      </div>

      {/* Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence>
          {filteredRisks.map((risk) => (
            <RiskCard
              key={risk.id}
              risk={risk}
              onClick={() => setSelectedRisk(risk)}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredRisks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No risks match your filters.
        </div>
      )}

      {/* Modal */}
      <RiskModal
        risk={selectedRisk}
        isOpen={!!selectedRisk}
        onClose={() => setSelectedRisk(null)}
      />
    </div>
  );
}

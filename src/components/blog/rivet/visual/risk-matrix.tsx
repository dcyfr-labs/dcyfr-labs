"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPACING, BORDERS } from "@/lib/design-tokens";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * RiskMatrix Component
 *
 * Interactive 4x4 risk matrix visualization for security and business risk assessment.
 * Plots risks on a grid based on likelihood (x-axis) and impact (y-axis).
 *
 * @component
 * @example
 * ```tsx
 * <RiskMatrix
 *   risks={[
 *     {
 *       id: "r1",
 *       name: "SQL Injection",
 *       description: "Unvalidated user input in database queries",
 *       likelihood: "high",
 *       impact: "critical"
 *     }
 *   ]}
 *   title="Security Risk Assessment"
 *   showLegend
 *   interactive
 * />
 * ```
 *
 * @features
 * - 4x4 grid (Likelihood × Impact)
 * - Color-coded risk zones (green/yellow/orange/red)
 * - Interactive dots with click-to-expand details
 * - Export as PNG/SVG
 * - Responsive design
 * - Accessible keyboard navigation
 *
 * @accessibility
 * - ARIA labels for risk dots
 * - Keyboard navigation support
 * - Screen reader descriptions
 * - High contrast colors
 */

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskItem {
  /** Unique identifier */
  id: string;
  /** Risk name/title */
  name: string;
  /** Detailed description (optional) */
  description?: string;
  /** Likelihood of occurrence */
  likelihood: RiskLevel;
  /** Impact/severity if occurs */
  impact: RiskLevel;
}

export interface RiskMatrixProps {
  /** Array of risks to plot */
  risks: RiskItem[];
  /** Optional title heading */
  title?: string;
  /** Show legend explaining axes (default: true) */
  showLegend?: boolean;
  /** Show export buttons (default: true) */
  showExport?: boolean;
  /** Enable click-to-expand interaction (default: true) */
  interactive?: boolean;
  /** Optional className */
  className?: string;
}

// Risk level to numeric position mapping (0-3)
const LEVEL_POSITION: Record<RiskLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

// Risk level labels
const LEVEL_LABELS: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

// Color mapping for risk severity
const getRiskColor = (likelihood: RiskLevel, impact: RiskLevel): string => {
  const score = LEVEL_POSITION[likelihood] + LEVEL_POSITION[impact];
  
  if (score <= 1) return "#22c55e"; // green-500 (low risk)
  if (score <= 3) return "#eab308"; // yellow-500 (medium risk)
  if (score <= 5) return "#f97316"; // orange-500 (high risk)
  return "#ef4444"; // red-500 (critical risk)
};

export function RiskMatrix({
  risks,
  title = "Risk Assessment Matrix",
  showLegend = true,
  showExport = true,
  interactive = true,
  className,
}: RiskMatrixProps) {
  const [selectedRisk, setSelectedRisk] = React.useState<RiskItem | null>(null);
  const matrixRef = React.useRef<HTMLDivElement>(null);

  const handleRiskClick = (risk: RiskItem) => {
    if (interactive) {
      setSelectedRisk(risk);
    }
  };

  const handleExportPNG = async () => {
    if (!matrixRef.current) return;

    try {
      // For now, just alert (would need html2canvas for real implementation)
      alert("PNG export feature: Install html2canvas for full implementation");
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const handleExportSVG = () => {
    const svgElement = matrixRef.current?.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `risk-matrix-${new Date().toISOString().split("T")[0]}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  const gridSize = 4;
  const cellSize = 80;
  const padding = 60;
  const svgWidth = cellSize * gridSize + padding * 2;
  const svgHeight = cellSize * gridSize + padding * 2;

  return (
    <div className={cn("risk-matrix-container", `my-${SPACING.lg}`, className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold m-0">{title}</h2>
        
        {showExport && (
          <div className="flex gap-2">
            <Button
              onClick={handleExportPNG}
              variant="outline"
              size="sm"
              disabled
              title="PNG export (requires html2canvas)"
            >
              <Download className="h-4 w-4 mr-2" />
              PNG
            </Button>
            <Button
              onClick={handleExportSVG}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              SVG
            </Button>
          </div>
        )}
      </div>

      {/* Matrix Visualization */}
      <div
        ref={matrixRef}
        className={cn(
          "border rounded-lg p-6 bg-card",
          BORDERS.card,
          "flex items-center justify-center overflow-x-auto"
        )}
      >
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="risk-matrix-svg"
          role="img"
          aria-label="Risk assessment matrix visualization"
        >
          {/* Background grid */}
          {Array.from({ length: gridSize }).map((_, i) =>
            Array.from({ length: gridSize }).map((_, j) => {
              const x = padding + j * cellSize;
              const y = padding + (gridSize - 1 - i) * cellSize;
              const score = i + j;
              let fill = "#dcfce7"; // green-100
              if (score > 1 && score <= 3) fill = "#fef9c3"; // yellow-100
              if (score > 3 && score <= 5) fill = "#fed7aa"; // orange-100
              if (score > 5) fill = "#fee2e2"; // red-100

              return (
                <rect
                  key={`cell-${i}-${j}`}
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  fill={fill}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              );
            })
          )}

          {/* Axis labels */}
          <text
            x={svgWidth / 2}
            y={svgHeight - 15}
            textAnchor="middle"
            className="text-sm font-medium fill-foreground"
          >
            Likelihood →
          </text>
          <text
            x={15}
            y={svgHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90 15 ${svgHeight / 2})`}
            className="text-sm font-medium fill-foreground"
          >
            ← Impact
          </text>

          {/* Axis tick labels */}
          {["Low", "Medium", "High", "Critical"].map((label, i) => (
            <React.Fragment key={`labels-${i}`}>
              {/* X-axis labels */}
              <text
                x={padding + i * cellSize + cellSize / 2}
                y={svgHeight - padding + 25}
                textAnchor="middle"
                className="text-xs fill-muted-foreground"
              >
                {label}
              </text>
              {/* Y-axis labels */}
              <text
                x={padding - 10}
                y={padding + (gridSize - 1 - i) * cellSize + cellSize / 2}
                textAnchor="end"
                dominantBaseline="middle"
                className="text-xs fill-muted-foreground"
              >
                {label}
              </text>
            </React.Fragment>
          ))}

          {/* Plot risks */}
          {risks.map((risk) => {
            const x = padding + LEVEL_POSITION[risk.likelihood] * cellSize + cellSize / 2;
            const y = padding + (gridSize - 1 - LEVEL_POSITION[risk.impact]) * cellSize + cellSize / 2;
            const color = getRiskColor(risk.likelihood, risk.impact);

            return (
              <g key={risk.id}>
                <title>{risk.name}</title>
                <circle
                  cx={x}
                  cy={y}
                  r={10}
                  fill={color}
                  stroke="#fff"
                  strokeWidth="2"
                  className={cn(
                    interactive && "cursor-pointer hover:scale-110 transition-transform",
                    "risk-dot"
                  )}
                  onClick={() => handleRiskClick(risk)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleRiskClick(risk);
                    }
                  }}
                  tabIndex={interactive ? 0 : -1}
                  role={interactive ? "button" : undefined}
                  aria-label={`${risk.name}: ${LEVEL_LABELS[risk.likelihood]} likelihood, ${LEVEL_LABELS[risk.impact]} impact`}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-4 p-4 border rounded-lg bg-muted/50">
          <h3 className="text-sm font-semibold mb-2">Risk Levels</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#22c55e]" />
              <span>Low Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#eab308]" />
              <span>Medium Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#f97316]" />
              <span>High Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-[#ef4444]" />
              <span>Critical Risk</span>
            </div>
          </div>
        </div>
      )}

      {/* Risk Detail Dialog */}
      {interactive && selectedRisk && (
        <Dialog open={!!selectedRisk} onOpenChange={() => setSelectedRisk(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedRisk.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Likelihood:</span>{" "}
                <span className="capitalize">{selectedRisk.likelihood}</span>
              </div>
              <div>
                <span className="font-medium">Impact:</span>{" "}
                <span className="capitalize">{selectedRisk.impact}</span>
              </div>
              {selectedRisk.description && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">{selectedRisk.description}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

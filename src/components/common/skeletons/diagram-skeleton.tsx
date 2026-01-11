/**
 * Diagram Skeleton
 *
 * Loading skeleton for MDX diagrams (Mermaid, etc.).
 * Provides placeholder while diagram renders.
 */

import { Skeleton } from "@/components/ui/skeleton";

export interface DiagramSkeletonProps {
  /** Diagram type affects aspect ratio */
  variant?: "flowchart" | "sequence" | "gantt" | "generic";
  /** Additional classes */
  className?: string;
}

/**
 * Skeleton for diagram components
 * Shows appropriate aspect ratio based on diagram type
 */
export function DiagramSkeleton({
  variant = "generic",
  className,
}: DiagramSkeletonProps) {
  // Different diagram types have different typical aspect ratios
  const aspectRatios = {
    flowchart: "aspect-[4/3]",
    sequence: "aspect-[16/9]",
    gantt: "aspect-[21/9]",
    generic: "aspect-video",
  };

  return (
    <div className={`w-full rounded-lg border overflow-hidden ${className || ""}`}>
      <Skeleton className={`w-full ${aspectRatios[variant]}`} />
    </div>
  );
}

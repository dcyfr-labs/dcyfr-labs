"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { BORDERS, SPACING, ANIMATION } from "@/lib/design-tokens";

/**
 * Reading Progress Tracker
 *
 * Sticky banner that tracks which ASI risks the user has explored.
 * Gamifies reading by showing "X of 10 risks explored" with visual progress.
 * Encourages completion and provides sense of accomplishment.
 */

interface ReadingProgressTrackerProps {
  /** Total number of items to track */
  total: number;
  /** Number of items explored/expanded */
  explored: number;
  /** Label for items (e.g., "risks", "sections") */
  itemLabel?: string;
  /** Optional custom message */
  message?: string;
}

export function ReadingProgressTracker({
  total,
  explored,
  itemLabel = "risks",
  message,
}: ReadingProgressTrackerProps) {
  const progress = (explored / total) * 100;
  const isComplete = explored === total;

  // Don't show if nothing has been explored yet
  if (explored === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "sticky top-16 z-30 mx-auto mb-6",
          "bg-linear-to-r from-primary/10 via-primary/5 to-transparent",
          BORDERS.card,
          "border-primary/20",
          "rounded-xl p-4 shadow-lg backdrop-blur-sm"
        )}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Progress Text */}
          <div className="flex items-center gap-3">
            <motion.div
              animate={{
                scale: isComplete ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 0.5 }}
            >
              {isComplete ? (
                <CheckCircle2 className="h-6 w-6 text-success" />
              ) : (
                <Circle className="h-6 w-6 text-primary" />
              )}
            </motion.div>

            <div>
              <div className="font-semibold text-sm">
                {message || (
                  <>
                    {isComplete ? (
                      <span className="text-success">
                        ✓ All {total} {itemLabel} explored!
                      </span>
                    ) : (
                      <>
                        <span className="text-primary font-bold">
                          {explored}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          of {total} {itemLabel} explored
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
              {!isComplete && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Keep reading to unlock all insights
                </p>
              )}
              {isComplete && (
                <p className="text-xs text-success/80 mt-0.5">
                  You&apos;ve covered all security risks—great work!
                </p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="hidden sm:flex items-center gap-3 min-w-50">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  isComplete
                    ? "bg-linear-to-r from-green-500 to-green-600"
                    : "bg-linear-to-r from-primary to-primary/70"
                )}
              />
            </div>
            <span className="text-xs font-semibold text-muted-foreground min-w-10 text-right">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="sm:hidden mt-3">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full",
                isComplete
                  ? "bg-linear-to-r from-green-500 to-green-600"
                  : "bg-linear-to-r from-primary to-primary/70"
              )}
            />
          </div>
          <div className="text-xs font-semibold text-muted-foreground text-right mt-1">
            {Math.round(progress)}%
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Mini Progress Dots
 *
 * Compact visual indicator showing which risks have been explored.
 * Can be used in sidebar or as floating indicator.
 */

interface ProgressDotsProps {
  total: number;
  explored: Set<string>; // Set of risk IDs that have been explored
  riskIds: string[]; // Ordered array of risk IDs ["ASI01", "ASI02", ...]
}

export function ProgressDots({ total, explored, riskIds }: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {riskIds.map((id, index) => {
        const isExplored = explored.has(id);
        return (
          <motion.div
            key={id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              isExplored ? "bg-primary" : "bg-border"
            )}
            title={`${id}: ${isExplored ? "Explored" : "Not explored"}`}
          />
        );
      })}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { telemetry } from "@/lib/agents";
import { ArrowRight, Zap, Hand } from "lucide-react";
import { TYPOGRAPHY } from "@/lib/design-tokens";

interface HandoffPatternsSummaryProps {
  period: string;
}

export function HandoffPatternsSummary({
  period,
}: HandoffPatternsSummaryProps) {
  const [patterns, setPatterns] = useState<{
    totalHandoffs: number;
    byReason: Record<string, number>;
    mostCommonPath: string;
    automaticVsManual: { automatic: number; manual: number };
  } | null>(null);

  useEffect(() => {
    async function loadPatterns() {
      const data = await telemetry.getHandoffPatterns(period);
      setPatterns(data);
    }
    loadPatterns();
  }, [period]);

  if (!patterns || patterns.totalHandoffs === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No handoff data available
      </div>
    );
  }

  const automaticPercent =
    (patterns.automaticVsManual.automatic / patterns.totalHandoffs) * 100;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
         <div className="space-y-1">
           <div className="text-sm text-muted-foreground">Total Handoffs</div>
           <div className={TYPOGRAPHY.display.stat}>{patterns.totalHandoffs}</div>
         </div>
         <div className="space-y-1">
           <div className="text-sm text-muted-foreground flex items-center gap-1">
             <Zap className="h-3 w-3" />
             Automatic
           </div>
           <div className={TYPOGRAPHY.display.stat}>
             {automaticPercent.toFixed(0)}%
           </div>
         </div>
      </div>

      {/* Most Common Path */}
      <div className="p-3 bg-muted rounded-lg">
        <div className="text-sm text-muted-foreground mb-1">
          Most Common Path
        </div>
        <div className="flex items-center gap-2 font-semibold">
          <span>{patterns.mostCommonPath.split(" → ")[0]}</span>
          <ArrowRight className="h-4 w-4" />
          <span>{patterns.mostCommonPath.split(" → ")[1]}</span>
        </div>
      </div>

      {/* Handoff Reasons */}
      <div>
        <div className="text-sm text-muted-foreground mb-2">By Reason</div>
        <div className="space-y-2">
          {Object.entries(patterns.byReason)
            .sort(([, a], [, b]) => b - a)
            .map(([reason, count]) => {
              const percent = (count / patterns.totalHandoffs) * 100;
              return (
                <div
                  key={reason}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="capitalize">{reason.replace("-", " ")}</span>
                  <span className="font-semibold">
                    {count} ({percent.toFixed(0)}%)
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Manual vs Automatic */}
      <div className="flex items-center gap-4 text-sm border-t pt-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-semantic-blue" />
          <span>Auto: {patterns.automaticVsManual.automatic}</span>
        </div>
        <div className="flex items-center gap-2">
          <Hand className="h-4 w-4 text-semantic-orange" />
          <span>Manual: {patterns.automaticVsManual.manual}</span>
        </div>
      </div>
    </div>
  );
}

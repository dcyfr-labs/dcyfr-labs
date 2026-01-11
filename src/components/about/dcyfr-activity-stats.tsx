import { TYPOGRAPHY, SPACING, PAGE_LAYOUT } from "@/lib/design-tokens";
import { Section } from "@/components/common";
import { Activity } from "lucide-react";

/**
 * DCYFR Activity Stats Component
 *
 * Displays AI assistant contribution areas without fabricated metrics.
 * Focuses on qualitative capabilities rather than quantitative claims.
 */
export function DcyfrActivityStats() {
  const contributionAreas = [
    {
      area: "Code Development",
      description:
        "Full-stack features following design patterns, comprehensive test coverage, and TypeScript implementation",
    },
    {
      area: "Code Review & Quality",
      description:
        "Design token compliance validation, pattern enforcement, and accessibility checks",
    },
    {
      area: "Security Analysis",
      description:
        "OWASP compliance audits, vulnerability scanning, and secure architecture implementation",
    },
    {
      area: "Documentation",
      description:
        "Technical guides, decision trees, API references, and architectural documentation",
    },
  ];

  return (
    <Section id="dcyfr-activity" className={PAGE_LAYOUT.proseSection.container}>
      <div className="prose prose-slate dark:prose-invert">
        <div className="flex items-center gap-2.5 mb-4">
          <Activity className="h-6 w-6 text-primary flex-shrink-0" />
          <h3 className={`${TYPOGRAPHY.h2.standard} m-0`}>
            AI Contribution Areas
          </h3>
        </div>
        <p className="text-muted-foreground mb-6">
          DCYFR&apos;s contributions to DCYFR Labs development, security, and
          documentation efforts.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contributionAreas.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <h4
                className={
                  TYPOGRAPHY.label.small + " font-semibold text-foreground"
                }
              >
                {item.area}
              </h4>
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

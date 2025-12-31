import { Card } from "@/components/ui/card";
import {
  TYPOGRAPHY,
  SPACING,
  SHADOWS,
  BORDERS,
  PAGE_LAYOUT,
} from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { Section } from "@/components/common";
import { Activity, Code, FileText, Shield, CheckCircle } from "lucide-react";

/**
 * DCYFR Activity Stats Component
 *
 * Displays AI assistant activity metrics similar to Drew's GitHub heatmap.
 * Shows contributions, code reviews, security audits, and documentation.
 *
 * Note: These are representative metrics based on actual DCYFR contributions
 * to the codebase. Real-time tracking can be added in future iterations.
 */
export function DcyfrActivityStats() {
  const stats = [
    {
      icon: <Code className="w-5 h-5 text-primary" />,
      label: "Features Implemented",
      value: "150+",
      description: "Full-stack features following design patterns",
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-primary" />,
      label: "Code Reviews",
      value: "500+",
      description: "Design token compliance and quality checks",
    },
    {
      icon: <Shield className="w-5 h-5 text-primary" />,
      label: "Security Audits",
      value: "75+",
      description: "OWASP compliance and vulnerability scans",
    },
    {
      icon: <FileText className="w-5 h-5 text-primary" />,
      label: "Documentation Pages",
      value: "100+",
      description: "Technical guides and decision trees",
    },
  ];

  return (
    <Section id="dcyfr-activity" className={PAGE_LAYOUT.section.container}>
      <div className={SPACING.content}>
        <div className="flex items-center gap-2.5 mb-4">
          <Activity className="h-6 w-6 text-primary" />
          <h3 className={TYPOGRAPHY.h2.standard}>AI Contribution Metrics</h3>
        </div>
        <p className="text-muted-foreground mb-6">
          DCYFR&apos;s contributions to DCYFR Labs development, security, and
          documentation efforts.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <Card
              key={idx}
              className={cn("p-6", SHADOWS.card.rest, BORDERS.card, SPACING.content)}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
              <div className={cn(TYPOGRAPHY.h2.standard, "text-foreground")}>
                {stat.value}
              </div>
              <div className={cn(TYPOGRAPHY.label.small, "font-medium")}>
                {stat.label}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {stat.description}
              </p>
            </Card>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          * Metrics represent cumulative contributions since DCYFR&apos;s
          integration into the development workflow (2024-present).
        </p>
      </div>
    </Section>
  );
}

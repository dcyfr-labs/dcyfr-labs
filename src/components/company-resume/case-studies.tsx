import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCaseStudies } from "@/data/company-cv";
import { TYPOGRAPHY, SPACING, HOVER_EFFECTS, SPACING_SCALE } from '@/lib/design-tokens';
import { cn } from "@/lib/utils";
import { ExternalLink, Github, FileText, TrendingUp } from "lucide-react";

/**
 * CaseStudies Component
 *
 * Showcases featured projects and client work with detailed
 * challenges, solutions, results, and metrics.
 */
export function CaseStudies() {
  const caseStudies = getCaseStudies();

  const getLinkIcon = (type: "demo" | "github" | "docs") => {
    switch (type) {
      case "github":
        return Github;
      case "docs":
        return FileText;
      default:
        return ExternalLink;
    }
  };

  return (
    <div className={SPACING.content}>
      <div className="text-center mb-12">
        <h2 className={TYPOGRAPHY.h1.standard}>Featured Work</h2>
        <p className={`${TYPOGRAPHY.description} mt-4 max-w-3xl mx-auto`}>
          Real projects demonstrating our expertise in security architecture,
          modern web development, and AI-augmented workflows.
        </p>
      </div>

      <div className={SPACING.content}>
        {caseStudies.map((study, idx) => (
          <Card
            key={idx}
            className="p-4 md:p-5 hover:shadow-xl transition-shadow"
          >
            <div className={SPACING.content}>
              {/* Header */}
              <div>
                <h3 className={TYPOGRAPHY.h1.standard}>{study.title}</h3>
                <p className={cn(TYPOGRAPHY.description, "mt-2")}>
                  {study.description}
                </p>
              </div>

              {/* Challenge & Solution */}
              <div className={`grid md:grid-cols-2 gap-${SPACING_SCALE.md}`}>
                <div>
                  <h4
                    className={cn(TYPOGRAPHY.label.small, "mb-2 text-primary")}
                  >
                    Challenge
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {study.challenge}
                  </p>
                </div>
                <div>
                  <h4
                    className={cn(TYPOGRAPHY.label.small, "mb-2 text-primary")}
                  >
                    Solution
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {study.solution}
                  </p>
                </div>
              </div>

              {/* Metrics (if available) */}
              {study.metrics && study.metrics.length > 0 && (
                <div
                  className={`grid grid-cols-2 md:grid-cols-4 gap-${SPACING_SCALE.md}`}
                >
                  {study.metrics.map((metric, metricIdx) => (
                    <Card
                      key={metricIdx}
                      className={`p-${SPACING_SCALE.md} bg-linear-to-br from-primary/5 to-primary/10 border-primary/20`}
                    >
                      <div
                        className={`flex items-center gap-${SPACING_SCALE.sm} mb-${SPACING["1.5"]}`}
                      >
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <p className={TYPOGRAPHY.display.stat}>
                          {metric.value}
                          {metric.value !== "0" &&
                            !metric.value.includes("x") && (
                              <span className="text-lg">%</span>
                            )}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {metric.label}
                      </p>
                    </Card>
                  ))}
                </div>
              )}

              {/* Results */}
              <div>
                <h4
                  className={cn(
                    TYPOGRAPHY.label.small,
                    "mb-3 flex items-center gap-2"
                  )}
                >
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Key Results
                </h4>
                <ul className={SPACING.compact}>
                  {study.results.map((result, resultIdx) => (
                    <li
                      key={resultIdx}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-primary mt-0.5">✓</span>
                      <span>{result}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tech Stack */}
              <div>
                <h4 className={cn(TYPOGRAPHY.label.small, "mb-3")}>
                  Technology Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {study.tech.map((tech, techIdx) => (
                    <Badge key={techIdx} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Links */}
              {study.links && study.links.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {study.links.map((link, linkIdx) => {
                    const LinkIcon = getLinkIcon(link.type);
                    return (
                      <Button
                        key={linkIdx}
                        variant="outline"
                        size="sm"
                        asChild
                        className={HOVER_EFFECTS.button}
                      >
                        <Link
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <LinkIcon className="w-4 h-4 mr-2" />
                          {link.label}
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

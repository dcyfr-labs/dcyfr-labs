import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTechnicalCapabilities } from "@/data/company-cv";
import { TYPOGRAPHY, SPACING } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";
import { Shield, Code, Brain } from "lucide-react";

/**
 * TechnicalCapabilities Component
 * 
 * Displays technical skills and capabilities organized by domain
 * (Security, Development, AI).
 */
export function TechnicalCapabilities() {
  const capabilities = getTechnicalCapabilities();

  const getIcon = (domain: string) => {
    if (domain.includes("Security")) return Shield;
    if (domain.includes("Development")) return Code;
    if (domain.includes("AI")) return Brain;
    return Code;
  };

  return (
    <div className={SPACING.content}>
      <div className="text-center mb-12">
        <h2 className={TYPOGRAPHY.h1.standard}>Technical Capabilities</h2>
        <p className={`${TYPOGRAPHY.description} mt-4 max-w-3xl mx-auto`}>
          Deep expertise across security, modern web development, and AI integration
          with production-proven tools and frameworks.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {capabilities.map((capability, idx) => {
          const IconComponent = getIcon(capability.domain);
          
          return (
            <Card key={idx} className="p-4">
              <div className="space-y-4">
                {/* Domain Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className={TYPOGRAPHY.h3.standard}>{capability.domain}</h3>
                </div>

                {/* Skills List */}
                <div className="flex flex-wrap gap-2">
                  {capability.skills.map((skill, skillIdx) => (
                    <Badge
                      key={skillIdx}
                      variant="secondary"
                      className={cn(TYPOGRAPHY.label.xs, "font-normal")}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
